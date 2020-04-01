"use strict";

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WebSocketManager = exports.WebSocketClient = void 0;

require("core-js/modules/web.dom-collections.iterator");

var _client = require("./api/client.js");

var _server = require("./api/server.js");

const HEARTBEAT_TIMEOUT = 15000;
let CLIENT_ID_GEN = 0;

class WebSocketClient extends _client.Client {
  constructor(ws) {
    super();
    this._ws = ws;
    this._ws.binaryType = "arraybuffer";

    this._ws.onopen = () => {
      this.send({
        id: -1,
        cmd: "init"
      });
    };

    const heartbeat = () => {
      this._ws.send("heartbeat");

      setTimeout(heartbeat, HEARTBEAT_TIMEOUT);
    };

    setTimeout(heartbeat, 15000);

    this._ws.onmessage = msg => {
      if (msg.data === "heartbeat") {
        return;
      }

      if (this._pending_arrow) {
        this._handle({
          data: {
            id: this._pending_arrow,
            data: msg.data
          }
        });

        delete this._pending_arrow;
      } else {
        msg = JSON.parse(msg.data); // If the `is_transferable` flag is set, the worker expects the
        // next message to be a transferable object. This sets the
        // `_pending_arrow` flag, which triggers a special handler for
        // the ArrayBuffer containing arrow data.

        if (msg.is_transferable) {
          this._pending_arrow = msg.id;
        } else {
          this._handle({
            data: msg
          });
        }
      }
    };
  }

  send(msg) {
    this._ws.send(JSON.stringify(msg));
  }

  terminate() {
    return new Promise(resolve => {
      this._ws.onclose = resolve;

      this._ws.close();
    });
  }

}
/**
 * A WebSocket Manager instance for a remote perspective
 */


exports.WebSocketClient = WebSocketClient;

class WebSocketManager extends _server.Server {
  constructor(...args) {
    super(...args);
    this.requests_id_map = new Map();
    this.requests = {};
    this.websockets = {}; // clear invalid connections

    setInterval(() => {
      Object.entries(this.websockets).forEach(([id, ws]) => {
        if (ws.isAlive === false) {
          delete this.websockets[id];
          return ws.terminate();
        }

        ws.isAlive = false;
      });
    }, 30000);
  }
  /**
   * Add a new websocket connection to the manager
   *
   * The WebsocketManager manages the websocket connection and processes every
   * message received from each connections. When a websocket connection is
   * `closed`, the websocket manager will clear all subscriptions associated
   * with the connection
   *
   * @param {WebSocket} ws a websocket connection
   */


  add_connection(ws) {
    ws.isAlive = true;
    ws.id = CLIENT_ID_GEN++; // Parse incoming messages

    ws.on("message", msg => {
      ws.isAlive = true;

      if (msg === "heartbeat") {
        ws.send("heartbeat");
        return;
      }

      msg = JSON.parse(msg);

      try {
        // Send all messages to the handler defined in
        // Perspective.Server
        const compoundId = `${msg.id}/${ws.id}`;
        this.requests_id_map.set(compoundId, msg.id);
        msg.id = compoundId;
        this.requests[msg.id] = {
          ws,
          msg
        };
        this.process(msg, ws.id);
      } catch (e) {
        console.error(e);
      }
    });
    ws.on("close", () => {
      this.clear_views(ws.id);
    });
    ws.on("error", console.error);
  }
  /**
   * Send an asynchronous message to the Perspective web worker.
   *
   * If the `transferable` param is set, pass two messages: the string
   * representation of the message and then the ArrayBuffer data that needs to
   * be transferred. The `is_transferable` flag tells the client to expect the
   * next message to be a transferable object.
   *
   * @param {Object} msg a valid JSON-serializable message to pass to the
   * client
   * @param {*} transferable a transferable object to be sent to the client
   */


  post(msg, transferable) {
    const req = this.requests[msg.id];
    const id = msg.id;

    if (req.ws.readyState > 1) {
      delete this.requests[id];
      throw new Error("Connection closed");
    }

    msg.id = this.requests_id_map.get(id);

    if (transferable) {
      msg.is_transferable = true;
      req.ws.send(JSON.stringify(msg));
      req.ws.send(transferable[0]);
    } else {
      req.ws.send(JSON.stringify(msg));
    }

    if (!req.msg.subscribe) {
      this.requests_id_map.delete(id);
      delete this.requests[id];
    }
  }

  _host(cache, name, input) {
    if (cache[name] !== undefined) {
      throw new Error(`"${name}" already exists`);
    }

    input.on_delete(() => {
      delete cache[name];
    });
    cache[name] = input;
  }
  /**
   * Expose a Perspective `table` through the WebSocket, allowing
   * it to be accessed by a unique name from a client.  Hosted objects
   * are automatically `eject`ed when their `delete()` method is called.
   *
   * @param {String} name
   * @param {perspective.table} table `table` to host.
   */


  host_table(name, table) {
    this._host(this._tables, name, table);
  }
  /**
   * Expose a Perspective `view` through the WebSocket, allowing
   * it to be accessed by a unique name from a client.  Hosted objects
   * are automatically `eject`ed when their `delete()` method is called.
   *
   * @param {String} name
   * @param {perspective.view} view `view` to host.
   */


  host_view(name, view) {
    this._host(this._views, name, view);
  }
  /**
   * Cease hosting a `table` on this server.  Hosted objects
   * are automatically `eject`ed when their `delete()` method is called.
   *
   * @param {String} name
   */


  eject_table(name) {
    delete this._tables[name];
  }
  /**
   * Cease hosting a `view` on this server.  Hosted objects
   * are automatically `eject`ed when their `delete()` method is called.
   *
   * @param {String} name
   */


  eject_view(name) {
    delete this._views[name];
  }

}

exports.WebSocketManager = WebSocketManager;
//# sourceMappingURL=websocket.js.map