import "core-js/modules/es.promise";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

/******************************************************************************
 *
 * Copyright (c) 2018, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import "@finos/perspective-viewer";
import { Widget } from "@lumino/widgets";
export class PerspectiveViewerWidget extends Widget {
  constructor({
    viewer,
    node
  }) {
    super({
      node
    });
    this.viewer = viewer;
    this.master = false;
  }

  set master(value) {
    if (value !== undefined && this._master !== value) {
      if (value) {
        var _this$viewer$toggleAt, _this$viewer;

        this.viewer.classList.add("workspace-master-widget");
        this.viewer.classList.remove("workspace-detail-widget"); // TODO jsdom lacks `toggleAttribute` until 12.2.0
        // https://github.com/jsdom/jsdom/blob/master/Changelog.md#1220

        (_this$viewer$toggleAt = (_this$viewer = this.viewer).toggleAttribute) === null || _this$viewer$toggleAt === void 0 ? void 0 : _this$viewer$toggleAt.call(_this$viewer, "selectable", true);
      } else {
        this.viewer.classList.add("workspace-detail-widget");
        this.viewer.classList.remove("workspace-master-widget");
        this.viewer.removeAttribute("selectable");
      }

      this._master = value;
    }
  }

  get master() {
    return this._master;
  }

  get table() {
    return this.viewer.table;
  }

  set name(value) {
    if (value != null) {
      this.viewer.setAttribute("name", value);
      this.title.label = value;
      this._name = value;
    }
  }

  get name() {
    return this._name;
  }

  set linked(value) {
    if (value !== undefined) {
      if (value) {
        this.viewer.setAttribute("linked", "");
      } else {
        this.viewer.removeAttribute("linked");
      }
    }
  }

  get linked() {
    return this.viewer.hasAttribute("linked");
  }

  toggleConfig() {
    return this.viewer.toggleConfig();
  }

  restore(config) {
    const {
      master,
      table,
      linked,
      name
    } = config,
          viewerConfig = _objectWithoutProperties(config, ["master", "table", "linked", "name"]);

    this.master = master;
    this.name = name;

    if (table) {
      this.viewer.setAttribute("table", table);
    }

    this.linked = linked;
    this.viewer.restore(_objectSpread({}, viewerConfig));
  }

  save() {
    return _objectSpread({}, this.viewer.save(), {
      master: this.master,
      name: this.viewer.getAttribute("name"),
      table: this.viewer.getAttribute("table"),
      linked: this.linked
    });
  }

  removeClass(name) {
    super.removeClass(name);
    this.viewer && this.viewer.classList.remove(name);
  }

  async onCloseRequest(msg) {
    super.onCloseRequest(msg);

    if (this.viewer.parentElement) {
      this.viewer.parentElement.removeChild(this.viewer);
    }

    await this.viewer.delete();
  }

  onResize(msg) {
    this.notifyResize();
    super.onResize(msg);
  }

  async notifyResize() {
    if (this.isVisible) {
      await this.viewer.notifyResize();
    }
  }

}
//# sourceMappingURL=widget.js.map