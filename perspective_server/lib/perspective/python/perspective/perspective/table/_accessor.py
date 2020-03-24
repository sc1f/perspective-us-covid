################################################################################
#
# Copyright (c) 2019, the Perspective Authors.
#
# This file is part of the Perspective library, distributed under the terms of
# the Apache License 2.0.  The full license can be found in the LICENSE file.
#

import six
import pandas
import numpy
from distutils.util import strtobool
from math import isnan

from ._date_validator import _PerspectiveDateValidator
from ..core.data import deconstruct_numpy, deconstruct_pandas
from ..core.data.pd import _parse_datetime_index
from ..core.exception import PerspectiveError
from .libbinding import t_dtype


def _flatten_structure(array):
    '''Flatten numpy.recarray or structured arrays into a dict.'''
    # recarrays/structured arrays do not have guaranteed bit offsets - make a
    # copy of the array to fix
    columns = [numpy.copy(array[col]) for col in array.dtype.names]
    return dict(zip(array.dtype.names, columns))


def _type_to_format(data_or_schema):
    '''Deconstructs data passed in by the user into a standard format:

    - A :obj:`list` of dicts, each of which represents a single row.
    - A dict of :obj:`list`s, each of which represents a single column.

    Schemas passed in by the user are preserved as-is.
    :class:`pandas.DataFrame`s are flattened and returned as a columnar
    dataset.  Finally, an integer is assigned to represent the type of the
    dataset to the internal engine.

    Returns:
        :obj:`int`: type
                - 0: records (:obj:`list` of :obj:`dict`)
                - 1: columns (:obj:`dict` of :obj:`str` to :obj:`list`)
                - 2: schema (dist[str]/dict[type])
        :obj:`list`: column names
        ():obj:`list`/:obj:`dict`): processed data
    '''
    if isinstance(data_or_schema, list):
        # records
        names = list(data_or_schema[0].keys()) if len(data_or_schema) > 0 else []
        return False, 0, names, data_or_schema
    elif isinstance(data_or_schema, dict):
        # schema or columns
        for v in data_or_schema.values():
            if isinstance(v, type) or isinstance(v, str):
                # schema maps name -> type
                return False, 2, list(data_or_schema.keys()), data_or_schema
            elif isinstance(v, list):
                # a dict of iterables = type 1
                return False, 1, list(data_or_schema.keys()), data_or_schema
            else:
                # See if iterable
                try:
                    iter(v)
                except TypeError:
                    raise NotImplementedError("Cannot load dataset of non-iterable type: Data passed in through a dict must be of type `list` or `numpy.ndarray`.")
                else:
                    return isinstance(v, numpy.ndarray), 1, list(data_or_schema.keys()), data_or_schema
    elif isinstance(data_or_schema, numpy.ndarray):
        # structured or record array
        if not isinstance(data_or_schema.dtype.names, tuple):
            raise NotImplementedError("Data should be dict of numpy.ndarray or a structured array.")
        flattened = _flatten_structure(data_or_schema)
        return True, 1, list(flattened.keys()), flattened
    else:
        if not (isinstance(data_or_schema, pandas.DataFrame) or isinstance(data_or_schema, pandas.Series)):
            # if pandas not installed or is not a dataframe or series
            raise NotImplementedError("Data must be dataframe, dict, list, numpy.recarray, or a numpy structured array.")
        else:
            # flatten column/index multiindex
            df, _ = deconstruct_pandas(data_or_schema)
            return True, 1, df.columns.tolist(), {c: df[c].values for c in df.columns}


class _PerspectiveAccessor(object):
    '''A uniform accessor that wraps data/schemas of varying formats with a
    common :func:`marshal` function.
    '''

    INTEGER_TYPES = six.integer_types + (numpy.integer,)

    def __init__(self, data_or_schema):
        self._is_numpy, self._format, self._names, self._data_or_schema = _type_to_format(data_or_schema)
        self._date_validator = _PerspectiveDateValidator()
        self._row_count = \
            len(self._data_or_schema) if self._format == 0 else \
            len(max(self._data_or_schema.values(), key=len)) if self._format == 1 else \
            0

        self._types = []

        # Verify that column names are strings, and that numpy arrays are of
        # type `ndarray`
        for name in self._names:
            if not isinstance(name, six.string_types):
                raise PerspectiveError(
                    "Column names should be strings, not type `{0}`".format(type(name).__name__))
            if self._is_numpy:
                array = self._data_or_schema[name]

                if not isinstance(array, numpy.ndarray):
                    raise PerspectiveError("Mixed datasets of numpy.ndarray and lists are not supported.")

                dtype = array.dtype

                if name == "index" and isinstance(data_or_schema.index, pandas.DatetimeIndex):
                    # use the index of the original, unflattened dataframe
                    dtype = _parse_datetime_index(data_or_schema.index)

                # keep a string representation of the dtype, as PyBind only has
                # access to the char dtype code
                self._types.append(str(dtype))

    def data(self):
        return self._data_or_schema

    def format(self):
        return self._format

    def names(self):
        return self._names

    def types(self):
        return self._types

    def date_validator(self):
        return self._date_validator

    def row_count(self):
        return self._row_count

    def get(self, column_name, ridx):
        '''Get the element at the specified column name and row index.

        If the element does not exist, return None.

        Args:
            column_name (str)
            ridx (int)

        Returns:
            object or None
        '''
        val = None
        try:
            if self._format == 0:
                return self._data_or_schema[ridx][column_name]
            elif self._format == 1:
                return self._data_or_schema[column_name][ridx]
            else:
                raise NotImplementedError()
            return val
        except (KeyError, IndexError):
            return None

    def marshal(self, cidx, ridx, dtype):
        '''Returns the element at the specified column and row index, and
        marshals it into an object compatible with the core engine's
        :func:`fill` method.

        If DTYPE_DATE or DTYPE_TIME is specified for a string value, attempt
        to parse the string value or return :obj:`None`.

        Args:
            cidx (:obj:`int`)
            ridx (:obj:`int`)
            dtype (:obj:`.libbinding.t_dtype`)

        Returns:
            object or None
        '''
        column_name = self._names[cidx]
        val = self.get(column_name, ridx)

        if val is None:
            return val

        # first, check for numpy nans without using numpy.isnan as it tries to
        # cast values
        if isinstance(val, float) and isnan(val):
            return None
        elif isinstance(val, list) and len(val) == 1:
            # strip out values encased lists
            val = val[0]
        elif dtype == t_dtype.DTYPE_STR:
            if isinstance(val, (bytes, bytearray)):
                return val.decode("utf-8")
            else:
                if six.PY2:
                    # six.u mangles quotes with escape sequences - use native
                    # unicode()
                    return unicode(val)  # noqa: F821
                else:
                    return str(val)
        elif dtype == t_dtype.DTYPE_DATE:
            # return datetime.date
            if isinstance(val, str):
                parsed = self._date_validator.parse(val)
                return self._date_validator.to_date_components(parsed)
            else:
                return self._date_validator.to_date_components(val)
        elif dtype == t_dtype.DTYPE_TIME:
            # return unix timestamps for time
            if isinstance(val, str):
                parsed = self._date_validator.parse(val)
                return self._date_validator.to_timestamp(parsed)
            else:
                return self._date_validator.to_timestamp(val)
        elif dtype == t_dtype.DTYPE_BOOL:
            # True values are y, yes, t, true, on and 1; false values are n, no,
            # f, false, off and 0.
            return bool(strtobool(str(val)))
        elif dtype == t_dtype.DTYPE_INT32 or dtype == t_dtype.DTYPE_INT64:
            if not isinstance(val, bool) and isinstance(val, (float, numpy.floating)):
                # update int columns with either ints or floats
                return int(val)
        elif dtype == t_dtype.DTYPE_FLOAT32 or dtype == t_dtype.DTYPE_FLOAT64:
            if not isinstance(val, bool) and isinstance(val, _PerspectiveAccessor.INTEGER_TYPES):
                # update float columns with either ints or floats
                return float(val)

        return val

    def _get_numpy_column(self, name):
        '''For columnar datasets, return the :obj:`list`/Numpy array that
        contains the data for a single column.

        Args:
            name (:obj:`str)`: the column name to look up

        Returns:
            (:obj:`list`/numpy.array/None): returns the column's data, or None
                if it cannot be found.
        '''
        data = self._data_or_schema.get(name, None)
        if data is None:
            raise PerspectiveError("Column `{0}` does not exist.".format(name))
        return deconstruct_numpy(data)

    def _has_column(self, ridx, name):
        '''Given a column name, validate that it is in the row.

        This allows differentiation between value is None (unset) and value not
        in row (no-op).

        Args:
            ridx (int)
            name (str)

        Returns:
            bool: True if column is in row, or if column belongs to pkey/op
                columns required by the engine. False otherwise.
        '''
        if self._format != 0 or name in ("psp_pkey", "psp_okey", "psp_op"):
            # no partial updates available on meta column, schema, dict updates
            return True
        else:
            return name in self._data_or_schema[ridx]
