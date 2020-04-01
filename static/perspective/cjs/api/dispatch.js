"use strict";

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unsubscribe = unsubscribe;
exports.subscribe = subscribe;
exports.async_queue = async_queue;

require("core-js/modules/web.dom-collections.iterator");

/******************************************************************************
 *
 * Copyright (c) 2019, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
const __CALLBACK_CACHE__ = new WeakMap();

let __CALLBACK_INDEX__ = 0;
/**
 * Unbind a listener to an event.
 *
 * @param {*} method
 * @param {*} cmd
 */

function unsubscribe(method, cmd) {
  return function () {
    let resolve;

    let reject = () => {};

    let args = Array.prototype.slice.call(arguments, 0, arguments.length);

    for (let i = args.length - 1; i >= 0; i--) {
      if (typeof args[i] === "function") {
        resolve = args.splice(i, 1)[0];
      }
    }

    const callback_id = __CALLBACK_CACHE__.get(resolve);

    __CALLBACK_CACHE__.delete(resolve);

    let msg = {
      cmd: cmd || "view_method",
      name: this._name,
      method: method,
      args: args,
      subscribe: true,
      callback_id
    };

    this._worker.post(msg, resolve, reject);

    this._worker.unsubscribe(cmd, resolve);
  };
}
/**
 * Bind a listener to an event.
 *
 * @param {*} method
 * @param {*} cmd
 */


function subscribe(method, cmd) {
  return function () {
    let resolve;

    let reject = () => {};

    let args = Array.prototype.slice.call(arguments, 0, arguments.length);

    for (let i = args.length - 1; i >= 0; i--) {
      if (typeof args[i] === "function") {
        resolve = args.splice(i, 1)[0];
      }
    }

    __CALLBACK_INDEX__++;

    __CALLBACK_CACHE__.set(resolve, __CALLBACK_INDEX__);

    let msg = {
      cmd: cmd || "view_method",
      name: this._name,
      method: method,
      args: args,
      subscribe: true,
      callback_id: __CALLBACK_INDEX__
    };

    this._worker.post(msg, resolve, reject, true);
  };
}
/**
 * Add a method call to the queue, preparing it for execution.
 *
 * Returns a bound function that calls the desired method on the server.
 *
 * @param {*} method
 * @param {*} cmd
 */


function async_queue(method, cmd) {
  return function () {
    var args = Array.prototype.slice.call(arguments, 0, arguments.length);
    return new Promise(function (resolve, reject) {
      var msg = {
        cmd: cmd || "view_method",
        name: this._name,
        method: method,
        args: args,
        subscribe: false
      };

      this._worker.post(msg, resolve, reject);
    }.bind(this));
  };
}
//# sourceMappingURL=dispatch.js.map