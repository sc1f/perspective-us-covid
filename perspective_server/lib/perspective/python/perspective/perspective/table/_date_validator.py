################################################################################
#
# Copyright (c) 2019, the Perspective Authors.
#
# This file is part of the Perspective library, distributed under the terms of
# the Apache License 2.0.  The full license can be found in the LICENSE file.
#

import six
import numpy
from calendar import timegm
from datetime import date, datetime
from dateutil.parser import parse
from dateutil.tz import UTC
from pandas import Period
from re import search
from time import mktime
from .libbinding import t_dtype

if six.PY2:
    from past.builtins import long


def _normalize_timestamp(obj):
    '''Convert a timestamp in seconds to milliseconds.

    If the input overflows, it is treated as milliseconds - otherwise it is
    treated as seconds and converted.
    '''
    try:
        datetime.fromtimestamp(obj)
        return int(obj * 1000)
    except (ValueError, OverflowError, OSError):
        return int(obj)


class _PerspectiveDateValidator(object):
    '''Validate and parse dates using the `dateutil` package.'''

    def parse(self, str):
        '''Return a datetime.datetime object containing the parsed date, or
        None if the date is invalid.

        If a ISO date string with a timezone is provided, there is no guarantee
        that timezones will be properly handled by the parser. Perspective
        stores and serializes times in UTC as a milliseconds
        since epoch timestamp. For more definitive timezone support, use
        `datetime.datetime` objects or `pandas.Timestamp` objects with the
        `timezone` property set.

        Args:
            str (str): the datestring to parse

        Returns:
            (:class:`datetime.date`/`datetime.datetime`/`None`): if parse is
                successful.
        '''
        try:
            return parse(str)
        except (ValueError, OverflowError):
            return None

    def to_date_components(self, obj):
        '''Return a dictionary of string keys and integer values for `year`,
        `month` (from 0 - 11), and `day`.

        This method converts both datetime.date and numpy.datetime64 objects
        that contain datetime.date.
        '''
        if obj is None:
            return obj

        if isinstance(obj, (int, float)):
            obj = datetime.fromtimestamp(_normalize_timestamp(obj) / 1000)

        if six.PY2:
            if isinstance(obj, (long)):
                obj = datetime.fromtimestamp(long(obj))

        if isinstance(obj, numpy.datetime64):
            if str(obj) == "NaT":
                return None
            obj = obj.astype(datetime)

            if (six.PY2 and isinstance(obj, long)) or isinstance(obj, int):
                obj = datetime.fromtimestamp(obj / 1000000000)

        # Perspective stores month in `t_date` as an integer [0-11],
        # while Python stores month as [1-12], so decrement the Python value
        # before Perspective attempts to use it.
        return {
            "year": obj.year,
            "month": obj.month - 1,
            "day": obj.day
        }

    def to_timestamp(self, obj):
        '''Returns an integer corresponding to the number of milliseconds since
        epoch in the local timezone.

        If the `datetime.datetime` object has a `timezone` property set, this
        method will convert the object into UTC before returning a timestamp.
        '''
        if obj is None:
            return obj

        if obj.__class__.__name__ == "date":
            # handle updating datetime with date object
            obj = datetime(obj.year, obj.month, obj.day)

        if isinstance(obj, Period):
            # extract the start of the Period
            obj = obj.to_timestamp()

        # time.mktime converts local time, calendar.timegm uses UTC
        converter = mktime

        # timetuple returns local time, utctimetuple returns UTC
        to_timetuple = "timetuple"

        if hasattr(obj, "tzinfo") and obj.tzinfo is not None:
            # Convert all timezone-aware datetimes into UTC. If a datetime with
            # a valid `tzinfo` object has been passed in, this will read
            # `tzinfo` and convert the datetime into UTC. If the datetime has no
            # `tzinfo` object, it is assumed to be in local time, and will not
            # be converted into UTC.
            obj = obj.astimezone(UTC)
            converter = timegm
            to_timetuple = "utctimetuple"

        if six.PY2:
            if isinstance(obj, long):
                # compat with python2 long from datetime.datetime
                obj = obj / 1000000000
                return long(obj)

        if isinstance(obj, numpy.datetime64):
            if str(obj) == "NaT":
                return None

            # astype(datetime) returns an int or a long (in python 2)
            obj = obj.astype(datetime)

            if isinstance(obj, date) and not isinstance(obj, datetime):
                # Convert numpy "datetime64[D/W/M/Y]", as they are converted
                # into `datetime.date`.
                return int((converter(getattr(obj, to_timetuple)())) * 1000)

            if six.PY2:
                if isinstance(obj, long):
                    return long(round(obj / 1000000))

            if isinstance(obj, int):
                return round(obj / 1000000)

        if isinstance(obj, (int, float)):
            return _normalize_timestamp(obj)

        # At this point, aware datetime objects are in UTC, and naive datetime
        # objects have not been modified. When the timestamp is serialized
        # using `to_format`, it will be in *local time* - Pybind will
        # automatically localize any conversion to `datetime.datetime`
        # from C++ to Python.
        return int((converter(
            getattr(obj, to_timetuple)()) + obj.microsecond / 1000000.0) * 1000)

    def format(self, s):
        '''Return either t_dtype.DTYPE_DATE or t_dtype.DTYPE_TIME depending on
        the format of the parsed date.

        If the parsed date is invalid, return t_dtype.DTYPE_STR to prevent
        further attempts at conversion.  Attempt to use heuristics about dates
        to minimize false positives, i.e. do not parse dates without separators.

        Args:
            str (str): the datestring to parse.
        '''
        if isinstance(s, (bytes, bytearray)):
            s = s.decode("utf-8")
        has_separators = bool(search(r"[/. -]", s))  # match commonly-used date separators
        # match commonly-used date separators

        dtype = t_dtype.DTYPE_STR

        if has_separators:
            try:
                parsed = parse(s)
                if (parsed.hour, parsed.minute, parsed.second, parsed.microsecond) == (0, 0, 0, 0):
                    dtype = t_dtype.DTYPE_DATE
                else:
                    dtype = t_dtype.DTYPE_TIME
            except (ValueError, OverflowError):
                # unparsable dates should be coerced to string
                dtype = t_dtype.DTYPE_STR

        return dtype
