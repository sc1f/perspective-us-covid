function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import { registerPlugin } from "@finos/perspective-viewer/dist/esm/utils.js";
import { _start_profiling_loop } from "./utils";
import { DatagridViewModel } from "./datagrid";
import { VIEWER_MAP } from "./constants";
import MATERIAL_STYLE from "../less/material.less";
/**
 * Initializes a new datagrid renderer if needed, or returns an existing one
 * associated with a rendering `<div>` from a cache.
 *
 * @param {*} element
 * @param {*} div
 * @returns
 */

function get_or_create_datagrid(element, div) {
  let datagrid;

  if (!VIEWER_MAP.has(div)) {
    datagrid = document.createElement("perspective-datagrid");
    datagrid.appendChild(document.createElement("slot"));
    datagrid.set_element(element);
    datagrid.register_listeners();
    div.innerHTML = "";
    div.appendChild(datagrid);
    VIEWER_MAP.set(div, datagrid);
  } else {
    datagrid = VIEWER_MAP.get(div);
  }

  if (!datagrid.isConnected) {
    datagrid.clear();
    div.innerHTML = "";
    div.appendChild(datagrid);
  }

  return datagrid;
}
/**
 * <perspective-viewer> plugin.
 *
 * @class DatagridPlugin
 */


class DatagridPlugin {
  static async update(div) {
    try {
      const datagrid = VIEWER_MAP.get(div);
      await datagrid.draw({
        invalid_viewport: true
      });
    } catch (e) {
      return;
    }
  }

  static async create(div, view) {
    const datagrid = get_or_create_datagrid(this, div);
    const options = await datagrid.set_view(view);
    await datagrid.draw(options);
  }

  static async resize() {
    if (this.view && VIEWER_MAP.has(this._datavis)) {
      const datagrid = VIEWER_MAP.get(this._datavis);
      datagrid.reset_size();
      await datagrid.draw({
        invalid_viewport: true
      });
    }
  }

}
/**
 * Appends the default tbale CSS to `<head>`, should be run once on module
 *  import.
 *
 */


_defineProperty(DatagridPlugin, "name", "Datagrid");

_defineProperty(DatagridPlugin, "selectMode", "toggle");

_defineProperty(DatagridPlugin, "deselectMode", "pivots");

function _register_global_styles() {
  const style = document.createElement("style");
  style.textContent = MATERIAL_STYLE;
  document.head.appendChild(style);
}
/******************************************************************************
 *
 * Main
 *
 */


window.customElements.define("perspective-datagrid", DatagridViewModel);
registerPlugin("datagrid", DatagridPlugin);

_start_profiling_loop();

_register_global_styles();
//# sourceMappingURL=index.js.map