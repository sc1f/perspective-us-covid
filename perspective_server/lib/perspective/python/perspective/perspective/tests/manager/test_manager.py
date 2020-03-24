################################################################################
#
# Copyright (c) 2019, the Perspective Authors.
#
# This file is part of the Perspective library, distributed under the terms of
# the Apache License 2.0.  The full license can be found in the LICENSE file.
#

import json
from pytest import raises
from perspective import Table, PerspectiveError, PerspectiveManager

data = {"a": [1, 2, 3], "b": ["a", "b", "c"]}


class TestPerspectiveManager(object):

    def post(self, msg):
        '''boilerplate callback to simulate a client's `post()` method.'''
        msg = json.loads(msg)
        assert msg["id"] is not None

    def test_manager_host_table(self):
        message = {"id": 1, "name": "table1", "cmd": "table_method", "method": "schema", "args": []}
        manager = PerspectiveManager()
        table = Table(data)
        manager.host_table("table1", table)
        manager._process(message, self.post)
        assert manager._tables["table1"].schema() == {
            "a": int,
            "b": str
        }

    def test_manager_host_view(self):
        manager = PerspectiveManager()
        table = Table(data)
        view = table.view()
        manager.host_view("view1", view)
        assert manager.get_view("view1").to_dict() == data

    def test_manager_host_table_or_view(self):
        manager = PerspectiveManager()
        table = Table(data)
        view = table.view()
        manager.host(table, name="table1")
        manager.host(view, name="view1")
        assert manager.get_table("table1").size() == 3
        assert manager.get_view("view1").to_dict() == data

    def test_manager_host_invalid(self):
        manager = PerspectiveManager()
        with raises(PerspectiveError):
            manager.host({})

    def test_manager_host_table_transitive(self):
        manager = PerspectiveManager()
        table = Table(data)
        manager.host_table("table1", table)
        table.update({"a": [4, 5, 6], "b": ["d", "e", "f"]})
        assert manager.get_table("table1").size() == 6

    def test_manager_create_table(self):
        message = {"id": 1, "name": "table1", "cmd": "table", "args": [data]}
        manager = PerspectiveManager()
        manager._process(message, self.post)
        assert manager._tables["table1"].schema() == {
            "a": int,
            "b": str
        }

    def test_manager_create_indexed_table(self):
        message = {"id": 1, "name": "table1", "cmd": "table", "args": [data], "options": {"index": "a"}}
        manager = PerspectiveManager()
        table = Table(data)
        manager.host_table("table1", table)
        manager._process(message, self.post)
        assert manager._tables["table1"].schema() == {
            "a": int,
            "b": str
        }

        assert manager._tables["table1"]._index == "a"

    def test_manager_create_indexed_table_and_update(self):
        message = {"id": 1, "name": "table1", "cmd": "table", "args": [data], "options": {"index": "a"}}
        manager = PerspectiveManager()
        table = Table(data)
        manager.host_table("table1", table)
        manager._process(message, self.post)
        assert manager._tables["table1"].schema() == {
            "a": int,
            "b": str
        }
        assert manager._tables["table1"]._index == "a"
        update_message = {"id": 2, "name": "table1", "cmd": "table_method", "method": "update", "args": [{"a": [1, 2, 3], "b": ["str1", "str2", "str3"]}]}
        manager._process(update_message, self.post)
        assert manager._tables["table1"].view().to_dict() == {
            "a": [1, 2, 3],
            "b": ["str1", "str2", "str3"]
        }

    def test_manager_create_indexed_table_and_remove(self):
        message = {"id": 1, "name": "table1", "cmd": "table", "args": [data], "options": {"index": "a"}}
        manager = PerspectiveManager()
        table = Table(data)
        manager.host_table("table1", table)
        manager._process(message, self.post)
        assert manager._tables["table1"].schema() == {
            "a": int,
            "b": str
        }
        assert manager._tables["table1"]._index == "a"
        remove_message = {"id": 2, "name": "table1", "cmd": "table_method", "method": "remove", "args": [[1, 2]]}
        manager._process(remove_message, self.post)
        assert manager._tables["table1"].view().to_dict() == {
            "a": [3],
            "b": ["c"]
        }

    def test_manager_host_view(self):
        message = {"id": 1, "name": "view1", "cmd": "view_method", "method": "schema", "args": []}
        manager = PerspectiveManager()
        table = Table(data)
        view = table.view()
        manager.host_table("table1", table)
        manager.host_view("view1", view)
        manager._process(message, self.post)
        assert manager.get_view("view1").schema() == {
            "a": int,
            "b": str
        }

    def test_manager_create_view_zero(self):
        message = {"id": 1, "table_name": "table1", "view_name": "view1", "cmd": "view"}
        manager = PerspectiveManager()
        table = Table(data)
        manager.host_table("table1", table)
        manager._process(message, self.post)
        assert manager._views["view1"].num_rows() == 3

    def test_manager_create_view_one(self):
        message = {"id": 1, "table_name": "table1", "view_name": "view1", "cmd": "view", "config": {"row_pivots": ["a"]}}
        manager = PerspectiveManager()
        table = Table(data)
        manager.host_table("table1", table)
        manager._process(message, self.post)
        assert manager._views["view1"].to_dict() == {
            "__ROW_PATH__": [[], ["1"], ["2"], ["3"]],
            "a": [6, 1, 2, 3],
            "b": [3, 1, 1, 1]
        }

    def test_manager_create_view_two(self):
        message = {"id": 1, "table_name": "table1", "view_name": "view1", "cmd": "view", "config": {"row_pivots": ["a"], "column_pivots": ["b"]}}
        manager = PerspectiveManager()
        table = Table(data)
        manager.host_table("table1", table)
        manager._process(message, self.post)
        assert manager._views["view1"].to_dict() == {
            "__ROW_PATH__": [[], ["1"], ["2"], ["3"]],
            "a|a": [1, 1, None, None],
            "a|b": [1, 1, None, None],
            "b|a": [2, None, 2, None],
            "b|b": [1, None, 1, None],
            "c|a": [3, None, None, 3],
            "c|b": [1, None, None, 1]
        }

    # clear views

    def test_manager_clear_view(self):
        messages = [
            {"id": 1, "table_name": "table1", "view_name": "view1", "cmd": "view"},
            {"id": 2, "table_name": "table1", "view_name": "view2", "cmd": "view"},
            {"id": 3, "table_name": "table1", "view_name": "view3", "cmd": "view"}
        ]
        manager = PerspectiveManager()
        table = Table(data)
        manager.host_table("table1", table)
        for message in messages:
            manager._process(message, self.post, client_id=1)
        manager.clear_views(1)
        assert manager._views == {}

    def test_manager_clear_view_nonseq(self):
        messages = [
            {"id": 1, "table_name": "table1", "view_name": "view1", "cmd": "view"},
            {"id": 2, "table_name": "table1", "view_name": "view2", "cmd": "view"},
            {"id": 3, "table_name": "table1", "view_name": "view3", "cmd": "view"}
        ]
        manager = PerspectiveManager()
        table = Table(data)
        manager.host_table("table1", table)
        for i, message in enumerate(messages, 1):
            manager._process(message, self.post, client_id=i)
        manager.clear_views(1)
        manager.clear_views(3)
        assert "view1" not in manager._views
        assert "view3" not in manager._views
        assert "view2" in manager._views

    def test_manager_clear_view_no_client_id(self):
        messages = [
            {"id": 1, "table_name": "table1", "view_name": "view1", "cmd": "view"},
            {"id": 2, "table_name": "table1", "view_name": "view2", "cmd": "view"},
            {"id": 3, "table_name": "table1", "view_name": "view3", "cmd": "view"}
        ]
        manager = PerspectiveManager()
        table = Table(data)
        manager.host_table("table1", table)
        for message in messages:
            manager._process(message, self.post)
        with raises(PerspectiveError):
            manager.clear_views(None)

    # serialization

    def test_manager_to_dict(self, sentinel):
        s = sentinel(False)

        def handle_to_dict(msg):
            s.set(True)
            message = json.loads(msg)
            assert message["data"] == data
        message = {"id": 1, "table_name": "table1", "view_name": "view1", "cmd": "view"}
        manager = PerspectiveManager()
        table = Table(data)
        manager.host_table("table1", table)
        manager._process(message, self.post)
        to_dict_message = {"id": 2, "name": "view1", "cmd": "view_method", "method": "to_dict"}
        manager._process(to_dict_message, handle_to_dict)
        assert s.get() is True

    def test_manager_to_dict_with_options(self, sentinel):
        s = sentinel(False)

        def handle_to_dict(msg):
            s.set(True)
            message = json.loads(msg)
            assert message["data"] == {"a": [1], "b": ["a"]}
        message = {"id": 1, "table_name": "table1", "view_name": "view1", "cmd": "view"}
        manager = PerspectiveManager()
        table = Table(data)
        manager.host_table("table1", table)
        manager._process(message, self.post)
        to_dict_message = {"id": 2, "name": "view1", "cmd": "view_method", "method": "to_dict", "args": [{"start_row": 0, "end_row": 1}]}
        manager._process(to_dict_message, handle_to_dict)
        assert s.get() is True

    def test_manager_create_view_and_update_table(self):
        message = {"id": 1, "table_name": "table1", "view_name": "view1", "cmd": "view"}
        manager = PerspectiveManager()
        table = Table(data)
        manager.host_table("table1", table)
        manager._process(message, self.post)
        table.update([{"a": 4, "b": "d"}])
        assert manager._views["view1"].num_rows() == 4

    def test_manager_on_update(self, sentinel):
        s = sentinel(0)

        def update_callback():
            s.set(s.get() + 1)

        # create a table and view using manager
        make_table = {"id": 1, "name": "table1", "cmd": "table", "args": [data]}
        manager = PerspectiveManager()
        manager._process(make_table, self.post)
        make_view = {"id": 2, "table_name": "table1", "view_name": "view1", "cmd": "view"}
        manager._process(make_view, self.post)

        # hook into the created view and pass it the callback
        view = manager._views["view1"]
        view.on_update(update_callback)

        # call updates
        update1 = {"id": 3, "name": "table1", "cmd": "table_method", "method": "update", "args": [{"a": [4], "b": ["d"]}]}
        update2 = {"id": 4, "name": "table1", "cmd": "table_method", "method": "update", "args": [{"a": [5], "b": ["e"]}]}
        manager._process(update1, self.post)
        manager._process(update2, self.post)
        assert s.get() == 2

    def test_manager_remove_update(self, sentinel):
        s = sentinel(0)

        def update_callback():
            s.set(s.get() + 1)

        # create a table and view using manager
        make_table = {"id": 1, "name": "table1", "cmd": "table", "args": [data]}
        manager = PerspectiveManager()
        manager._process(make_table, self.post)
        make_view = {"id": 2, "table_name": "table1", "view_name": "view1", "cmd": "view"}
        manager._process(make_view, self.post)

        # hook into the created view and pass it the callback
        view = manager._views["view1"]
        view.on_update(update_callback)
        view.remove_update(update_callback)

        # call updates
        update1 = {"id": 4, "name": "table1", "cmd": "table_method", "method": "update", "args": [{"a": [4], "b": ["d"]}]}
        update2 = {"id": 5, "name": "table1", "cmd": "table_method", "method": "update", "args": [{"a": [5], "b": ["e"]}]}
        manager._process(update1, self.post)
        manager._process(update2, self.post)
        assert s.get() == 0

    def test_manager_delete_view(self):
        make_table = {"id": 1, "name": "table1", "cmd": "table", "args": [data]}
        manager = PerspectiveManager()
        manager._process(make_table, self.post)
        make_view = {"id": 2, "table_name": "table1", "view_name": "view1", "cmd": "view"}
        manager._process(make_view, self.post)
        delete_view = {"id": 3, "name": "view1", "cmd": "view_method", "method": "delete"}
        manager._process(delete_view, self.post)
        assert len(manager._views) == 0

    def test_manager_set_queue_process(self, sentinel):
        s = sentinel(0)
        manager = PerspectiveManager()
        table = Table({"a": [1, 2, 3]})
        manager.host_table("tbl", table)
        table.update({"a": [4, 5, 6]})
        assert table.view().to_dict() == {
            "a": [1, 2, 3, 4, 5, 6]
        }

        def fake_queue_process(table_id, state_manager):
            s.set(s.get() + 1)
            state_manager.call_process(table_id)

        manager._set_queue_process(fake_queue_process)
        table.update({"a": [7, 8, 9]})
        assert s.get() == 1

    def test_manager_set_queue_process_before_host_table(self, sentinel):
        s = sentinel(0)
        manager = PerspectiveManager()
        table = Table({"a": [1, 2, 3]})

        def fake_queue_process(table_id, state_manager):
            s.set(s.get() + 1)
            state_manager.call_process(table_id)

        manager._set_queue_process(fake_queue_process)
        manager.host_table("tbl", table)
        table.update({"a": [4, 5, 6]})
        table.update({"a": [4, 5, 6]})

        assert s.get() == 2

    def test_manager_set_queue_process_multiple(self, sentinel):
        # manager2's queue process should not affect manager1,
        # provided they manage different tables
        s = sentinel(0)
        s2 = sentinel(0)
        manager = PerspectiveManager()
        manager2 = PerspectiveManager()
        table = Table({"a": [1, 2, 3]})
        table2 = Table({"a": [1, 2, 3]})
        manager.host_table("tbl", table)
        manager2.host_table("tbl2", table2)

        def fake_queue_process(table_id, state_manager):
            s2.set(s2.get() + 1)
            state_manager.call_process(table_id)

        manager2._set_queue_process(fake_queue_process)

        table.update({"a": [4, 5, 6]})
        assert table.view().to_dict() == {
            "a": [1, 2, 3, 4, 5, 6]
        }

        table2.update({"a": [7, 8, 9]})
        table.update({"a": [7, 8, 9]})

        assert table.view().to_dict() == {
            "a": [1, 2, 3, 4, 5, 6, 7, 8, 9]
        }
        assert table2.view().to_dict() == {
            "a": [1, 2, 3, 7, 8, 9]
        }
        assert s.get() == 0
        assert s2.get() == 1
