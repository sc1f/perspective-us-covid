"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.view = view;
exports.proxy_view = proxy_view;

var _dispatch = require("./dispatch.js");

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
 * Construct a proxy for the view object by creating a "view" message and
 * sending it through the worker.
 *
 * @param {*} worker
 * @param {*} table_name
 * @param {*} config
 */
function view(worker, table_name, config) {
  this._worker = worker; //this._config = config;

  this._name = Math.random() + "";
  var msg = {
    cmd: "view",
    view_name: this._name,
    table_name: table_name,
    config: config
  };

  this._worker.post(msg);

  (0, _utils.bindall)(this);
}
/**
 * Create a reference to a view located on `worker` for use by remote clients.
 *
 * @param {worker} worker the Web Worker at which the view is located.
 * @param {String} name a unique name for the view.
 */


function proxy_view(worker, name) {
  this._worker = worker;
  this._name = name;
}

proxy_view.prototype = view.prototype; // Send view methods that do not create new objects (getters, setters etc.) to
// the queue for processing.

view.prototype.get_config = (0, _dispatch.async_queue)("get_config");
view.prototype.to_json = (0, _dispatch.async_queue)("to_json");
view.prototype.to_arrow = (0, _dispatch.async_queue)("to_arrow");
view.prototype.to_columns = (0, _dispatch.async_queue)("to_columns");
view.prototype.to_csv = (0, _dispatch.async_queue)("to_csv");
view.prototype.schema = (0, _dispatch.async_queue)("schema");
view.prototype.computed_schema = (0, _dispatch.async_queue)("computed_schema");
view.prototype.column_paths = (0, _dispatch.async_queue)("column_paths");
view.prototype.num_columns = (0, _dispatch.async_queue)("num_columns");
view.prototype.num_rows = (0, _dispatch.async_queue)("num_rows");
view.prototype.set_depth = (0, _dispatch.async_queue)("set_depth");
view.prototype.get_row_expanded = (0, _dispatch.async_queue)("get_row_expanded");
view.prototype.expand = (0, _dispatch.async_queue)("expand");
view.prototype.collapse = (0, _dispatch.async_queue)("collapse");
view.prototype.delete = (0, _dispatch.async_queue)("delete");
view.prototype.col_to_js_typed_array = (0, _dispatch.async_queue)("col_to_js_typed_array");
view.prototype.on_update = (0, _dispatch.subscribe)("on_update", "view_method", true);
view.prototype.remove_update = (0, _dispatch.unsubscribe)("remove_update", "view_method", true);
view.prototype.on_delete = (0, _dispatch.subscribe)("on_delete", "view_method", true);
view.prototype.remove_delete = (0, _dispatch.unsubscribe)("remove_delete", "view_method", true);
//# sourceMappingURL=view_api.js.map