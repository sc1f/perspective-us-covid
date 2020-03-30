var _dec, _class;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _CustomElement() {
  return Reflect.construct(HTMLElement, [], this.__proto__.constructor);
}

;
Object.setPrototypeOf(_CustomElement.prototype, HTMLElement.prototype);
Object.setPrototypeOf(_CustomElement, HTMLElement);

/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import * as d3 from "d3";
import style from "../../less/chart.less";
import template from "../../html/d3fc-chart.html";
import { areArraysEqualSimple } from "../utils/utils";
import { initialiseStyles } from "../series/colorStyles";
import { bindTemplate } from "@finos/perspective-viewer/dist/esm/utils";
const styleWithD3FC = "".concat(style).concat(getD3FCStyles());
let // eslint-disable-next-line no-unused-vars
D3FCChartElement = (_dec = bindTemplate(template, styleWithD3FC), _dec(_class = class D3FCChartElement extends _CustomElement {
  constructor() {
    super();
    this._chart = null;
    this._settings = null;
  }

  connectedCallback() {
    console.log("connected callback");
    this._container = this.shadowRoot.querySelector(".chart");
  }

  render(chart, settings) {
    this._chart = chart;
    this._settings = this._configureSettings(this._settings, settings);
    initialiseStyles(this._container, this._settings);

    if (this._settings.data && this._settings.data.length > 0 || chart.plugin.type !== this._chart.plugin.type) {
      this.remove();
    }

    this.draw();

    if (window.navigator.userAgent.indexOf("Edge") > -1) {
      // Workaround for MS Edge issue that doesn't draw content in the
      // plot-area until the chart D3 object is redrawn
      setTimeout(() => this.draw());
    }
  }

  draw() {
    if (this._settings.data) {
      const containerDiv = d3.select(this._container);
      const chartClass = "chart ".concat(this._chart.plugin.type);
      this._settings.size = this._container.getBoundingClientRect();

      if (this._settings.data.length > 0) {
        this._chart(containerDiv.attr("class", chartClass), this._settings);
      } else {
        containerDiv.attr("class", "".concat(chartClass, " disabled"));
      }
    }
  }

  resize() {
    this.draw();
  }

  remove() {
    this._container.innerHTML = "";
  }

  delete() {
    this.remove();
  }

  getContainer() {
    return this._container;
  }

  getSettings() {
    const excludeSettings = ["crossValues", "mainValues", "splitValues", "filter", "data", "size", "colorStyles"];

    const settings = _objectSpread({}, this._settings);

    excludeSettings.forEach(s => {
      delete settings[s];
    });
    return settings;
  }

  setSettings(settings) {
    this._settings = _objectSpread({}, this._settings, {}, settings);
    this.draw();
  }

  _configureSettings(oldSettings, newSettings) {
    if (oldSettings) {
      if (!oldSettings.data) {
        // Combine with the restored settings
        return _objectSpread({}, oldSettings, {}, newSettings);
      }

      const oldValues = [oldSettings.crossValues, oldSettings.mainValues, oldSettings.splitValues, oldSettings.realValues];
      const newValues = [newSettings.crossValues, newSettings.mainValues, newSettings.splitValues, newSettings.realValues];
      if (areArraysEqualSimple(oldValues, newValues)) return _objectSpread({}, oldSettings, {
        data: newSettings.data,
        colorStyles: null
      });
    }

    this.remove();
    return newSettings;
  }

}) || _class);

function getD3FCStyles() {
  const headerStyles = document.querySelector("head").querySelectorAll("style");
  const d3fcStyles = [];
  headerStyles.forEach(s => {
    if (s.innerText.indexOf("d3fc-") !== -1) {
      d3fcStyles.push(s.innerText);
    }
  });
  return d3fcStyles.join("");
}
//# sourceMappingURL=template.js.map