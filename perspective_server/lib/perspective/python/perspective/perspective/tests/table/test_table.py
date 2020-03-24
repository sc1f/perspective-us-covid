# *****************************************************************************
# -*- coding: utf-8 -*-
#
# Copyright (c) 2019, the Perspective Authors.
#
# This file is part of the Perspective library, distributed under the terms of
# the Apache License 2.0.  The full license can be found in the LICENSE file.
#
import six
import sys
from datetime import date, datetime
from pytest import raises
from perspective.table import Table
from perspective.core.exception import PerspectiveError
from perspective.table._state import _PerspectiveStateManager
from perspective.table.libbinding import t_filter_op, PerspectiveCppError


class TestTable(object):
    # table constructors

    def test_empty_table(self):
        tbl = Table([])
        assert tbl.size() == 0

    def test_table_not_iterable(self):
        data = {
            "a": 1
        }
        with raises(NotImplementedError):
            Table(data)

    def test_table_synchronous_process(self):
        tbl = Table({"a": [1, 2, 3]})
        assert _PerspectiveStateManager.TO_PROCESS == {}
        tbl.update({"a": [4, 5, 6]})
        assert _PerspectiveStateManager.TO_PROCESS == {}

    def test_table_int(self):
        data = [{"a": 1, "b": 2}, {"a": 3, "b": 4}]
        tbl = Table(data)
        assert tbl.size() == 2
        assert tbl.schema() == {
            "a": int,
            "b": int
        }

    def test_table_int_column_names(self):
        data = {
            "a": [1, 2, 3],
            0: [4, 5, 6]
        }
        with raises(PerspectiveError):
            Table(data)

    def test_table_int_overflow(self):
        if six.PY2:
            maxint = sys.maxint + 1
            # overflows into float
            data = {"a": [i for i in range(100)] + [maxint, maxint, maxint]}
            tbl = Table(data)
            # two promotions later
            assert tbl.schema() == {
                "a": float
            }

    def test_table_long(self):
        if six.PY2:
            # don't overflow in this test
            data = [long(100), long(200), long(300)]  # noqa: F821
            tbl = Table({
                "a": data
            })
            assert tbl.schema() == {
                "a": int
            }
            assert tbl.view().to_dict()["a"] == [int(d) for d in data]

    def test_table_long_overflow(self):
        if six.PY2:
            maxint = sys.maxint
            # don't overflow in this test
            data = [maxint, maxint + 1, maxint + 2]
            tbl = Table({
                "a": data
            })
            assert tbl.schema() == {
                "a": float
            }
            assert tbl.view().to_dict()["a"] == [float(d) for d in data]

    def test_table_int_to_long(self):
        if six.PY2:
            # don't overflow in this test
            data = [int(100), int(200), int(300)]
            tbl = Table({
                "a": long  # noqa: F821
            })
            assert tbl.schema() == {
                "a": int
            }
            tbl.update({
                "a": data
            })
            assert tbl.view().to_dict()["a"] == data

    def test_table_float_to_long(self):
        if six.PY2:
            # don't overflow in this test
            data = [1.5, 2.5, 3.5]  # noqa: F821
            tbl = Table({
                "a": long  # noqa: F821
            })
            assert tbl.schema() == {
                "a": int
            }
            tbl.update({
                "a": data
            })
            assert tbl.view().to_dict()["a"] == [1, 2, 3]

    def test_table_nones(self):
        none_data = [{"a": 1, "b": None}, {"a": None, "b": 2}]
        tbl = Table(none_data)
        assert tbl.size() == 2
        assert tbl.schema() == {
            "a": int,
            "b": int
        }

    def test_table_bool(self):
        bool_data = [{"a": True, "b": False}, {"a": True, "b": True}]
        tbl = Table(bool_data)
        assert tbl.size() == 2
        assert tbl.schema() == {
            "a": bool,
            "b": bool
        }

    def test_table_bool_str(self):
        bool_data = [{"a": "True", "b": "False"}, {"a": "True", "b": "True"}]
        tbl = Table(bool_data)
        assert tbl.size() == 2
        assert tbl.schema() == {
            "a": bool,
            "b": bool
        }
        assert tbl.view().to_dict() == {
            "a": [True, True],
            "b": [False, True]
        }

    def test_table_float(self):
        float_data = [{"a": 1.5, "b": 2.5}, {"a": 3.2, "b": 3.1}]
        tbl = Table(float_data)
        assert tbl.size() == 2
        assert tbl.schema() == {
            "a": float,
            "b": float
        }

    def test_table_str(self):
        str_data = [{"a": "b", "b": "b"}, {"a": "3", "b": "3"}]
        tbl = Table(str_data)
        assert tbl.size() == 2
        assert tbl.schema() == {
            "a": str,
            "b": str
        }

    def test_table_str_with_escape(self):
        str_data = [{"a": "abc\"def\"", "b": "abc\"def\""}, {"a": 'abc\'def\'', "b": 'abc\'def\''}]
        tbl = Table(str_data)
        assert tbl.size() == 2
        assert tbl.schema() == {
            "a": str,
            "b": str
        }
        assert tbl.view().to_records() == str_data

    def test_table_str_unicode(self):
        if six.PY2:
            str_data = [{"a": u"ȀȁȀȃȀȁȀȃȀȁȀȃȀȁȀȃ", "b": u"ЖДфйЖДфйЖДфйЖДфй"}]
        else:
            str_data = [{"a": "ȀȁȀȃȀȁȀȃȀȁȀȃȀȁȀȃ", "b": "ЖДфйЖДфйЖДфйЖДфй"}]
        tbl = Table(str_data)
        assert tbl.size() == 1
        assert tbl.schema() == {
            "a": str,
            "b": str
        }
        assert tbl.view().to_records() == str_data

    def test_table_date(self):
        str_data = [{"a": date.today(), "b": date.today()}]
        tbl = Table(str_data)
        assert tbl.size() == 1
        assert tbl.schema() == {
            "a": date,
            "b": date
        }

    def test_table_datetime(self):
        str_data = [{"a": datetime.now(), "b": datetime.now()}]
        tbl = Table(str_data)
        assert tbl.size() == 1
        assert tbl.schema() == {
            "a": datetime,
            "b": datetime
        }

    def test_table_columnar(self):
        data = {"a": [1, 2, 3], "b": [4, 5, 6]}
        tbl = Table(data)
        assert tbl.columns() == ["a", "b"]
        assert tbl.size() == 3
        assert tbl.schema() == {
            "a": int,
            "b": int
        }

    def test_table_columnar_mixed_length(self):
        data = [{"a": 1.5, "b": 2.5}, {"a": 3.2}]
        tbl = Table(data)
        assert tbl.size() == 2
        assert tbl.schema() == {
            "a": float,
            "b": float
        }
        assert tbl.view().to_records() == [{"a": 1.5, "b": 2.5}, {"a": 3.2, "b": None}]

    # schema

    def test_table_schema(self):
        data = {"a": int,
                "b": float,
                "c": str,
                "d": bool,
                "e": date,
                "f": datetime}

        tbl = Table(data)

        assert tbl.schema() == {
            "a": int,
            "b": float,
            "c": str,
            "d": bool,
            "e": date,
            "f": datetime
        }

    def test_table_readable_string_schema(self):
        data = {"a": "integer",
                "b": "float",
                "c": "string",
                "d": "boolean",
                "e": "date",
                "f": "datetime"}

        tbl = Table(data)

        assert tbl.schema() == {
            "a": int,
            "b": float,
            "c": str,
            "d": bool,
            "e": date,
            "f": datetime
        }

    def test_table_output_readable_schema(self):
        data = {"a": "int32",
                "b": "float64",
                "c": "str",
                "d": "bool",
                "e": "date",
                "f": "datetime"}

        tbl = Table(data)

        assert tbl.schema() == {
            "a": int,
            "b": float,
            "c": str,
            "d": bool,
            "e": date,
            "f": datetime
        }

    def test_table_mixed_schema(self):
        data = {"a": int,
                "b": float,
                "c": str,
                "d": bool,
                "e": date,
                "f": datetime}

        tbl = Table(data)

        assert tbl.schema() == {
            "a": int,
            "b": float,
            "c": str,
            "d": bool,
            "e": date,
            "f": datetime
        }

    def test_table_output_string_schema(self):
        data = {"a": int,
                "b": float,
                "c": str,
                "d": bool,
                "e": date,
                "f": datetime}

        tbl = Table(data)

        assert tbl.schema(as_string=True) == {
            "a": "integer",
            "b": "float",
            "c": "string",
            "d": "boolean",
            "e": "date",
            "f": "datetime"
        }

    def test_table_symmetric_schema(self):
        data = {
            "a": [1, 2, 3],
            "b": [1.5, 2.5, 3.5],
            "c": ["a", "b", "c"],
            "d": [True, False, True],
            "e": [date.today(), date.today(), date.today()],
            "f": [datetime.now(), datetime.now(), datetime.now()]
        }

        tbl = Table(data)
        schema = tbl.schema()

        assert schema == {
            "a": int,
            "b": float,
            "c": str,
            "d": bool,
            "e": date,
            "f": datetime
        }

        tbl2 = Table(schema)

        assert tbl2.schema() == schema

    def test_table_symmetric_string_schema(self):
        data = {
            "a": [1, 2, 3],
            "b": [1.5, 2.5, 3.5],
            "c": ["a", "b", "c"],
            "d": [True, False, True],
            "e": [date.today(), date.today(), date.today()],
            "f": [datetime.now(), datetime.now(), datetime.now()]
        }

        tbl = Table(data)
        schema = tbl.schema(as_string=True)

        assert schema == {
            "a": "integer",
            "b": "float",
            "c": "string",
            "d": "boolean",
            "e": "date",
            "f": "datetime"
        }

        tbl2 = Table(schema)

        assert tbl2.schema(as_string=True) == schema

    def test_table_long_schema(self):
        if six.PY2:
            schema = {
                "a": long,  # noqa: F821
                "b": int
            }
            tbl = Table(schema)
            assert tbl.schema() == {
                "a": int,
                "b": int
            }

    def test_table_unicode_schema(self):
        if six.PY2:
            schema = {
                "a": unicode,  # noqa: F821
                "b": int
            }
            tbl = Table(schema)
            assert tbl.schema() == {
                "a": str,
                "b": int
            }

    # is_valid_filter

    def test_table_is_valid_filter_str(self):
        filter = ["a", "<", 1]
        data = [{"a": 1, "b": 2}, {"a": 3, "b": 4}]
        tbl = Table(data)
        assert tbl.is_valid_filter(filter) is True

    def test_table_not_is_valid_filter_str(self):
        filter = ["a", "<", None]
        data = [{"a": 1, "b": 2}, {"a": 3, "b": 4}]
        tbl = Table(data)
        assert tbl.is_valid_filter(filter) is False

    def test_table_is_valid_filter_filter_op(self):
        filter = ["a", t_filter_op.FILTER_OP_IS_NULL]
        data = [{"a": 1, "b": 2}, {"a": 3, "b": 4}]
        tbl = Table(data)
        assert tbl.is_valid_filter(filter) is True

    def test_table_not_is_valid_filter_filter_op(self):
        filter = ["a", t_filter_op.FILTER_OP_GT, None]
        data = [{"a": 1, "b": 2}, {"a": 3, "b": 4}]
        tbl = Table(data)
        assert tbl.is_valid_filter(filter) is False

    def test_table_is_valid_filter_date(self):
        filter = ["a", t_filter_op.FILTER_OP_GT, date.today()]
        tbl = Table({
            "a": date
        })
        assert tbl.is_valid_filter(filter) is True

    def test_table_not_is_valid_filter_date(self):
        filter = ["a", t_filter_op.FILTER_OP_GT, None]
        tbl = Table({
            "a": date
        })
        assert tbl.is_valid_filter(filter) is False

    def test_table_is_valid_filter_datetime(self):
        filter = ["a", t_filter_op.FILTER_OP_GT, datetime.now()]
        tbl = Table({
            "a": datetime
        })
        assert tbl.is_valid_filter(filter) is True

    def test_table_not_is_valid_filter_datetime(self):
        filter = ["a", t_filter_op.FILTER_OP_GT, None]
        tbl = Table({
            "a": datetime
        })
        assert tbl.is_valid_filter(filter) is False

    def test_table_is_valid_filter_datetime_str(self):
        filter = ["a", t_filter_op.FILTER_OP_GT, "7/11/2019 5:30PM"]
        tbl = Table({
            "a": datetime
        })
        assert tbl.is_valid_filter(filter) is True

    def test_table_not_is_valid_filter_datetime_str(self):
        filter = ["a", t_filter_op.FILTER_OP_GT, None]
        tbl = Table({
            "a": datetime
        })
        assert tbl.is_valid_filter(filter) is False

    def test_table_is_valid_filter_ignores_not_in_schema(self):
        filter = ["not in schema", "<", 1]
        data = [{"a": 1, "b": 2}, {"a": 3, "b": 4}]
        tbl = Table(data)
        assert tbl.is_valid_filter(filter) is True

    # index

    def test_table_index(self):
        data = [{"a": 1, "b": 2}, {"a": 1, "b": 4}]
        tbl = Table(data, index="a")
        assert tbl.size() == 1
        assert tbl.view().to_records() == [
            {"a": 1, "b": 4}
        ]

    # index with None in column

    def test_table_index_int_with_none(self):
        tbl = Table({
            "a": [0, 1, 2, None, None],
            "b": [4, 3, 2, 1, 0]
        }, index="a")
        assert tbl.view().to_dict() == {
            "a": [None, 0, 1, 2],  # second `None` replaces first
            "b": [0, 4, 3, 2]
        }

    def test_table_index_float_with_none(self):
        tbl = Table({
            "a": [0.0, 1.5, 2.5, None, None],
            "b": [4, 3, 2, 1, 0]
        }, index="a")
        assert tbl.view().to_dict() == {
            "a": [None, 0, 1.5, 2.5],  # second `None` replaces first
            "b": [0, 4, 3, 2]
        }

    def test_table_index_bool_with_none(self):
        # bools cannot be used as primary key columns
        with raises(PerspectiveCppError):
            Table({
                "a": [True, False, None, True],
                "b": [4, 3, 2, 1]
            }, index="a")

    def test_table_index_date_with_none(self):
        tbl = Table({
            "a": [date(2019, 7, 11), None, date(2019, 3, 12), date(2011, 3, 10)],
            "b": [4, 3, 2, 1]
        }, index="a")
        assert tbl.view().to_dict() == {
            "a": [None, datetime(2011, 3, 10), datetime(2019, 3, 12), datetime(2019, 7, 11)],
            "b": [3, 1, 2, 4]
        }

    def test_table_index_datetime_with_none(self):
        tbl = Table({
            "a": [datetime(2019, 7, 11, 15, 30), None, datetime(2019, 7, 11, 12, 10), datetime(2019, 7, 11, 5, 0)],
            "b": [4, 3, 2, 1]
        }, index="a")
        assert tbl.view().to_dict() == {
            "a": [None, datetime(2019, 7, 11, 5, 0), datetime(2019, 7, 11, 12, 10), datetime(2019, 7, 11, 15, 30)],
            "b": [3, 1, 2, 4]
        }

    def test_table_index_str_with_none(self):
        tbl = Table({
            "a": ["", "a", None, "b"],
            "b": [4, 3, 2, 1]
        }, index="a")
        assert tbl.view().to_dict() == {
            "a": [None, "", "a", "b"],
            "b": [2, 4, 3, 1]
        }

    # limit

    def test_table_limit(self):
        data = [{"a": 1, "b": 2}, {"a": 3, "b": 4}]
        tbl = Table(data, limit=1)
        assert tbl.size() == 1
        assert tbl.view().to_records() == [
            {"a": 3, "b": 4}
        ]

    # clear

    def test_table_clear(self):
        data = [{"a": 1, "b": 2}, {"a": 3, "b": 4}]
        tbl = Table(data)
        tbl.clear()
        view = tbl.view()
        assert view.to_records() == []

    # replace

    def test_table_replace(self):
        data = [{"a": 1, "b": 2}, {"a": 3, "b": 4}]
        data2 = [{"a": 3, "b": 4}, {"a": 1, "b": 2}]
        tbl = Table(data)
        tbl.replace(data2)
        assert tbl.view().to_records() == data2
