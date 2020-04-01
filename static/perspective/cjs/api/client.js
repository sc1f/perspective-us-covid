"use strict";

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Client = void 0;

require("core-js/modules/web.dom-collections.iterator");

var _table_api = require("./table_api.js");

var _view_api = require("./view_api.js");

var _utils = require("../utils.js");

/******************************************************************************
 *
 * Copyright (c) 2019, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

/**
 * Perspective's worker API handles and processes asynchronous messages,
 * interfacing with the Perspective host class.  Child classes must implement
 * the `send()` interface, which defines how messages are dispatched in
 * different contexts.  `handlers` is a dictionary of resolve/reject callbacks
 * for each method the worker receives.
 *
 * @export
 */
class Client {
  constructor() {
    this._initialized = false;
    this._worker = {
      initialized: {
        value: false
      },
      transferable: false,
      msg_id: 0,
      handlers: {},
      messages: []
    };
    (0, _utils.bindall)(this);
  }
  /**
   * Remove a listener for a Perspective-generated event.
   */


  unsubscribe(cmd, handler) {
    for (let key of Object.keys(this._worker.handlers)) {
      if (this._worker.handlers[key].resolve === handler) {
        delete this._worker.handlers[key];
      }
    }
  }
  /**
   * Process an asynchronous message.
   */


  post(msg, resolve, reject, keep_alive = false) {
    if (resolve || reject) {
      this._worker.handlers[++this._worker.msg_id] = {
        resolve,
        reject,
        keep_alive
      };
    }

    msg.id = this._worker.msg_id;

    if (this._worker.initialized.value) {
      this.send(msg);
    } else {
      this._worker.messages.push(() => this.send(msg));
    }
  }

  initialize_profile_thread() {
    if (this._worker.initialized.value) {
      this.send({
        id: -1,
        cmd: "init_profile_thread"
      });
    } else {
      this._worker.messages.push(() => this.send({
        id: -1,
        cmd: "init_profile_thread"
      }));
    }
  }
  /**
   * Must be implemented in order to transport commands to the server.
   */


  send() {
    throw new Error("send() not implemented");
  }
  /**
   * Given the name of a table that is hosted on the server (e.g. using
   * `perspective-python` or `perspective` in NodeJS), return a `table`
   * instance that sends all operations and instructions to the `table` on the
   * server.
   *
   * @param {string} name
   */


  open_table(name) {
    return new _table_api.proxy_table(this, name);
  }

  open_view(name) {
    return new _view_api.proxy_view(this, name);
  }
  /**
   * Handle a command from Perspective. If the Client is not initialized,
   * initialize it and dispatch the `perspective-ready` event.
   *
   * Otherwise, reject or resolve the incoming command.
   */


  _handle(e) {
    if (!this._worker.initialized.value) {
      if (!this._initialized && typeof document !== "undefined" && document && typeof window !== undefined && window) {
        try {
          const event = document.createEvent("Event");
          event.initEvent("perspective-ready", false, true);
          window.dispatchEvent(event);
        } catch (e) {}

        this._initialized = true;
      }

      const msgs = this._worker.messages;
      this._worker.initialized.value = true;
      this._worker.messages = [];

      if (msgs) {
        for (const m in msgs) {
          if (msgs.hasOwnProperty(m)) {
            msgs[m]();
          }
        }
      }
    }

    if (e.data.id) {
      var handler = this._worker.handlers[e.data.id];

      if (handler) {
        if (e.data.error) {
          handler.reject(e.data.error);
        } else {
          handler.resolve(e.data.data);
        }

        if (!handler.keep_alive) {
          delete this._worker.handlers[e.data.id];
        }
      }
    }
  }

  table(data, options) {
    return new _table_api.table(this, data, options || {});
  }

  terminate() {
    this._worker.terminate();

    this._worker = undefined;
  }

}

exports.Client = Client;
//# sourceMappingURL=client.js.map