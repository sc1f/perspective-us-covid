import "core-js/modules/es.array.iterator";
import "core-js/modules/es.promise";
import "core-js/modules/web.dom-collections.iterator";

function _templateObject() {
  const data = _taggedTemplateLiteral(["\n        <pre style=\"margin:0;overflow:scroll;position:absolute;width:100%;height:100%\">", "</pre>\n    "]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

/******************************************************************************
 *
 * Copyright (c) 2018, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import { html, render } from "lit-html";
const RENDERERS = {};
export const renderers = new class {
  /**
   * Register a plugin with the <perspective-viewer> component.
   *
   * @param {string} name The logical unique name of the plugin.  This will be
   * used to set the component's `view` attribute.
   * @param {object} plugin An object with this plugin's prototype.
   *     Valid keys are:
   * @param {string} plugin.name The display name for this plugin.
   * @param {string} plugin.create (required) The creation function - may
   *     return a `Promise`.
   * @param {string} plugin.delete The deletion function.
   * @param {string} plugin.mode The selection mode - may be "toggle" or
   *     "select".
   */
  registerPlugin(name, plugin) {
    if (RENDERERS[name]) {
      throw new Error("A perspective-viewer plugin \"".concat(name, "\" has already been registered"));
    }

    for (const id in RENDERERS) {
      const old_plugin = RENDERERS[id];

      if (old_plugin && old_plugin.name === plugin.name) {
        console.warn("Conflicting plugin name \"".concat(plugin.name, "\", qualifying with id"));
        old_plugin.name = "".concat(old_plugin.name, " [").concat(id, "]");
        plugin.name = "".concat(plugin.name, " [").concat(name, "]");
      }
    }

    RENDERERS[name] = plugin;
  }

  getPlugin(name) {
    return RENDERERS[name];
  }

  getInstance() {
    return RENDERERS;
  }

}();
global.registerPlugin = renderers.registerPlugin;
global.getPlugin = renderers.getPlugin;

if (global.__perspective_plugins__) {
  global.__perspective_plugins__.forEach(([name, plugin]) => global.registerPlugin(name, plugin));
}

const template = csv => html(_templateObject(), csv);

export function register_debug_plugin() {
  global.registerPlugin("debug", {
    name: "Debug",
    create: async function create(div) {
      const csv = await this._view.to_csv({
        config: {
          delimiter: "|"
        }
      });

      const timer = this._render_time();

      render(template(csv), div);
      timer();
    },
    selectMode: "toggle",
    resize: function resize() {},
    delete: function _delete() {}
  });
}
//# sourceMappingURL=renderers.js.map