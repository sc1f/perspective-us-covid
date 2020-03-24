################################################################################
#
# Copyright (c) 2019, the Perspective Authors.
#
# This file is part of the Perspective library, distributed under the terms of
# the Apache License 2.0.  The full license can be found in the LICENSE file.
#

import json
import tornado.websocket
from tornado.ioloop import IOLoop
from ..core.exception import PerspectiveError


# Redefine `queue_process` to take advantage of `tornado.ioloop`
def _queue_process_tornado(table_id, state_manager):
    loop = IOLoop.current()
    loop.add_callback(state_manager.call_process, table_id=table_id)


class PerspectiveTornadoHandler(tornado.websocket.WebSocketHandler):
    '''PerspectiveTornadoHandler is a drop-in implementation of Perspective.

    Use it inside Tornado routing to create a server-side Perspective that is
    ready to receive websocket messages from the front-end `perspective-viewer`.
    Because Tornado implements an event loop, this handler links Perspective
    with `IOLoop.current()` in order to defer expensive operations until the
    next free iteration of the event loop.

    Examples:
        >>> MANAGER = PerspectiveManager()
        >>> MANAGER.host_table("data_source_one", Table(
        ...     pd.read_csv("superstore.csv")))
        >>> app = tornado.web.Application([
        ...     (r"/", MainHandler),
        ...     (r"/websocket", PerspectiveTornadoHandler, {
        ...         "manager": MANAGER,
        ...         "check_origin": True
        ...     })
        ... ])
    '''

    def __init__(self, *args, **kwargs):
        '''Create a new instance of the PerspectiveTornadoHandler with the
        given Manager instance.

        Keyword Args:
            manager (:obj`PerspectiveManager`): A `PerspectiveManager` instance.
                Must be provided on initialization.
            check_origin (:obj`bool`): If True, all requests will be accepted
                regardless of origin. Defaults to False.
        '''
        self._manager = kwargs.pop("manager", None)
        self._session = self._manager.new_session()
        self._check_origin = kwargs.pop("check_origin", False)

        if self._manager is None:
            raise PerspectiveError("A `PerspectiveManager` instance must be provided to the tornado handler!")

        super(PerspectiveTornadoHandler, self).__init__(*args, **kwargs)

        # make sure each `Table` calls the asynchronous version of `queue_process`
        self._manager._set_queue_process(_queue_process_tornado)

    def check_origin(self, origin):
        '''Returns whether the handler allows requests from origins outside
        of the host URL.
        '''
        return self._check_origin

    def on_message(self, message):
        '''When the websocket receives a message, send it to the `process`
        method of the `PerspectiveManager` with a reference to the `post`
        callback.
        '''
        if message == "heartbeat":
            return
        message = json.loads(message)
        self._session.process(message, self.post)

    def post(self, message, binary=False):
        '''When `post` is called by `PerspectiveManager`, serialize the data to
        JSON and send it to the client.

        Args:
            message (str): a JSON-serialized string containing a message to the
                front-end `perspective-viewer`.
        '''
        self.write_message(message, binary)

    def on_close(self):
        '''Remove the views associated with the client when the websocket
        closes.
        '''
        self._session.close()
