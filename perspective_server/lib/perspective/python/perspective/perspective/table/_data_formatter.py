################################################################################
#
# Copyright (c) 2019, the Perspective Authors.
#
# This file is part of the Perspective library, distributed under the terms of
# the Apache License 2.0.  The full license can be found in the LICENSE file.
#

import numpy as np
from math import trunc
from ._constants import COLUMN_SEPARATOR_STRING
from .libbinding import get_data_slice_zero, get_data_slice_one, get_data_slice_two, \
    get_from_data_slice_zero, get_from_data_slice_one, get_from_data_slice_two, \
    get_pkeys_from_data_slice_zero, get_pkeys_from_data_slice_one, get_pkeys_from_data_slice_two


def _mod(a, b):
    '''C-style modulo function'''
    if b == 0:
        # Javascript returns NaN in cases of division by 0; return -1 because
        # None would fail comparisons with other ints
        return float('nan')
    d = trunc(float(a) / b)
    return a - d * b


def to_format(options, view, output_format):
    view._table._state_manager.call_process(view._table._table.get_id())
    options, column_names, data_slice = _to_format_helper(view, options)

    if output_format == 'records':
        data = []
    elif output_format in ('dict', 'numpy'):
        data = {}
        if options["index"]:
            data['__INDEX__'] = []

    num_columns = len(view._config.get_columns())
    num_hidden = view._num_hidden_cols()

    for ridx in range(options["start_row"], options["end_row"]):
        row_path = data_slice.get_row_path(ridx) if options["has_row_path"] else []
        if options["leaves_only"] and len(row_path) < len(view._config.get_row_pivots()):
            continue

        if output_format == 'records':
            data.append({})

        for cidx in range(options["start_col"], options["end_col"]):
            name = column_names[cidx]

            if _mod((cidx - (1 if view._sides > 0 else 0)), (num_columns + num_hidden)) >= num_columns:
                # don't emit columns used for hidden sort
                continue
            elif cidx == options["start_col"] and view._sides > 0:
                if options["has_row_path"]:
                    paths = [path.to_string(False) for path in row_path]
                    paths.reverse()
                    if output_format == 'records':
                        data[-1]["__ROW_PATH__"] = paths
                    elif output_format in ('dict', 'numpy'):
                        if "__ROW_PATH__" not in data:
                            data["__ROW_PATH__"] = []
                        data["__ROW_PATH__"].append(paths)
            else:
                if output_format in ('dict', 'numpy') and (name not in data):
                    # TODO: push into C++ for numpy
                    data[name] = []
                if view._sides == 0:
                    value = get_from_data_slice_zero(data_slice, ridx, cidx)
                elif view._sides == 1:
                    value = get_from_data_slice_one(data_slice, ridx, cidx)
                else:
                    value = get_from_data_slice_two(data_slice, ridx, cidx)

                if output_format == 'records':
                    data[-1][name] = value
                else:
                    data[name].append(value)

        if options['index']:
            if view._sides == 0:
                pkeys = get_pkeys_from_data_slice_zero(data_slice, ridx, 0)
            elif view._sides == 1:
                pkeys = get_pkeys_from_data_slice_one(data_slice, ridx, 0)
            else:
                pkeys = get_pkeys_from_data_slice_two(data_slice, ridx, 0)

            if output_format == 'records':
                data[-1]['__INDEX__'] = []
                for pkey in pkeys:
                    data[-1]['__INDEX__'].append(pkey)
            elif output_format in ('dict', 'numpy'):
                # ensure that `__INDEX__` has the same number of rows as
                # returned dataset
                if len(pkeys) == 0:
                    data["__INDEX__"].append([])
                for pkey in pkeys:
                    data['__INDEX__'].append([pkey])

    if output_format in ('dict', 'numpy') and (not options["has_row_path"] and ("__ROW_PATH__" in data)):
        del data["__ROW_PATH__"]

    if output_format == 'numpy':
        for k, v in data.items():
            # TODO push into C++
            data[k] = np.array(v)

    return data


def _to_format_helper(view, options=None):
    '''Retrieves the data slice and column names in preparation for data
    serialization.
    '''
    options = options or {}
    opts = _parse_format_options(view, options)

    if view._sides == 0:
        data_slice = get_data_slice_zero(view._view, opts["start_row"], opts["end_row"], opts["start_col"], opts["end_col"])
    elif view._sides == 1:
        data_slice = get_data_slice_one(view._view, opts["start_row"], opts["end_row"], opts["start_col"], opts["end_col"])
    else:
        data_slice = get_data_slice_two(view._view, opts["start_row"], opts["end_row"], opts["start_col"], opts["end_col"])

    raw_names = data_slice.get_column_names()
    column_names = []

    for n in raw_names:
        column_names.append(COLUMN_SEPARATOR_STRING.join(
            [path.to_string(False) for path in n]))

    return opts, column_names, data_slice


def _parse_format_options(view, options):
    '''Given a user-provided options dictionary, extract the useful values.'''
    max_cols = view.num_columns() + (1 if view._sides > 0 else 0)
    return {
        "start_row": max(options.get("start_row", 0), 0),
        "end_row": min(options.get("end_row", view.num_rows()), view.num_rows()),
        "start_col": max(options.get("start_col", 0), 0),
        "end_col": min(options.get("end_col", max_cols) * (view._num_hidden_cols() + 1), max_cols),
        "index": options.get("index", False),
        "leaves_only": options.get("leaves_only", False),
        "has_row_path": view._sides > 0 and (not view._column_only)
    }
