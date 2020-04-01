"use strict";

require("core-js/modules/es.string.replace");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.table = table;
exports.proxy_table = proxy_table;

require("core-js/modules/es.string.replace");

var _dispatch = require("./dispatch.js");

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
 * Construct a proxy for the table object by creating a "table" message and
 * sending it through the worker.
 *
 * @param {*} worker
 * @param {*} data
 * @param {*} options
 */
function table(worker, data, options) {
  this._worker = worker;
  let name = options.name || Math.random() + "";
  this._name = name;
  (0, _utils.bindall)(this);

  if (data.to_arrow) {
    var msg = {
      cmd: "table",
      name: name,
      args: [],
      options: options || {}
    };

    this._worker.post(msg);

    data.to_arrow().then(arrow => {
      var msg = {
        cmd: "table",
        name: name,
        args: [arrow],
        options: options || {}
      };

      this._worker.post(msg);

      data.on_update(this.update, {
        mode: "row"
      });
    });
  } else {
    var msg = {
      cmd: "table",
      name: name,
      args: [data],
      options: options || {}
    };

    this._worker.post(msg);
  }
}

table.prototype.type = "table";
/**
 * Create a reference to a Perspective table at `worker` for use by remote
 * clients.
 *
 * @param {worker} worker the Web Worker at which the table is located.
 * @param {String} name a unique name for the table.
 */

function proxy_table(worker, name) {
  this._worker = worker;
  this._name = name;
}

proxy_table.prototype = table.prototype; // Dispatch table methods that create new objects to the worker

table.prototype.view = function (config) {
  return new _view_api.view(this._worker, this._name, config);
}; // Dispatch table methods that do not create new objects (getters, setters etc.)
// to the queue for processing.


table.prototype.compute = (0, _dispatch.async_queue)("compute", "table_method");
table.prototype.schema = (0, _dispatch.async_queue)("schema", "table_method");
table.prototype.computed_schema = (0, _dispatch.async_queue)("computed_schema", "table_method");
table.prototype.get_computation_input_types = (0, _dispatch.async_queue)("get_computation_input_types", "table_method");
table.prototype.get_computed_functions = (0, _dispatch.async_queue)("get_computed_functions", "table_method");
table.prototype.is_valid_filter = (0, _dispatch.async_queue)("is_valid_filter", "table_method");
table.prototype.size = (0, _dispatch.async_queue)("size", "table_method");
table.prototype.columns = (0, _dispatch.async_queue)("columns", "table_method");
table.prototype.clear = (0, _dispatch.async_queue)("clear", "table_method");
table.prototype.replace = (0, _dispatch.async_queue)("replace", "table_method");
table.prototype.delete = (0, _dispatch.async_queue)("delete", "table_method");
table.prototype.on_delete = (0, _dispatch.subscribe)("on_delete", "table_method", true);
table.prototype.remove = (0, _dispatch.async_queue)("remove", "table_method");
table.prototype.remove_delete = (0, _dispatch.unsubscribe)("remove_delete", "table_method", true);

table.prototype.update = function (data) {
  return new Promise((resolve, reject) => {
    var msg = {
      name: this._name,
      cmd: "table_method",
      method: "update",
      args: [data]
    };

    this._worker.post(msg, resolve, reject, false);
  });
};

table.prototype.execute = function (f) {
  var msg = {
    cmd: "table_execute",
    name: this._name,
    f: f.toString()
  };

  this._worker.post(msg);
};
//# sourceMappingURL=table_api.js.map