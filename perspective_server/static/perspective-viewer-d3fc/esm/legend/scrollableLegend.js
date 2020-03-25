function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import * as d3Legend from "d3-svg-legend";
import { rebindAll } from "d3fc";
import { getOrCreateElement } from "../utils/utils";
import legendControlsTemplate from "../../html/legend-controls.html";
import { cropCellContents } from "./styling/cropCellContents";
import { draggableComponent } from "./styling/draggableComponent";
import { resizableComponent } from "./styling/resizableComponent";
const averageCellHeightPx = 16;
const controlsHeightPx = 20;
export default ((fromLegend, settings) => {
  const legend = fromLegend || d3Legend.legendColor();
  let domain = [];
  let pageCount = 1;
  let pageSize;
  let pageIndex = settings.legend && settings.legend.pageIndex ? settings.legend.pageIndex : 0;

  let decorate = () => {};

  let draggable = draggableComponent().settings(settings);
  let resizable;

  const scrollableLegend = selection => {
    domain = legend.scale().domain();
    resizable = resizableComponent().settings(settings).maxHeight(domain.length * averageCellHeightPx + controlsHeightPx).on("resize", () => render(selection));
    resizable(selection);
    draggable(selection);
    render(selection);
  };

  const render = selection => {
    calculatePageSize(selection);
    renderControls(selection);
    renderLegend(selection);
    cropCellContents(selection);
  };

  const renderControls = selection => {
    const controls = getLegendControls(selection);
    controls.style("display", pageCount <= 1 ? "none" : "block");
    controls.select("#page-text").text("".concat(pageIndex + 1, "/").concat(pageCount));
    controls.select("#up-arrow").attr("class", pageIndex === 0 ? "disabled" : "").on("click", () => {
      if (pageIndex > 0) {
        setPage(pageIndex - 1);
        render(selection);
      }
    });
    controls.select("#down-arrow").attr("class", pageIndex >= pageCount - 1 ? "disabled" : "").on("click", () => {
      if (pageIndex < pageCount - 1) {
        setPage(pageIndex + 1);
        render(selection);
      }
    });
  };

  const renderLegend = selection => {
    if (pageCount > 1) legend.cellFilter(cellFilter());
    selection.select("g.legendCells").remove();
    const legendElement = getLegendElement(selection);
    legendElement.call(legend);
    const cellContainerSize = selection.select("g.legendCells").node().getBBox();
    legendElement.attr("height", cellContainerSize.height + controlsHeightPx);
    decorate(selection);
  };

  const setPage = index => {
    pageIndex = index;
    settings.legend = _objectSpread({}, settings.legend, {
      pageIndex
    });
  };

  const cellFilter = () => (_, i) => i >= pageSize * pageIndex && i < pageSize * pageIndex + pageSize;

  const calculatePageSize = selection => {
    const legendContainerRect = selection.node().getBoundingClientRect();
    let proposedPageSize = Math.floor(legendContainerRect.height / averageCellHeightPx) - 1; // if page size is less than all legend items, leave space for the
    // legend controls

    pageSize = proposedPageSize < domain.length ? proposedPageSize - 1 : proposedPageSize;
    pageCount = calculatePageCount(proposedPageSize);
    pageIndex = Math.min(pageIndex, pageCount - 1);
  };

  const calculatePageCount = pageSize => Math.ceil(domain.length / pageSize);

  const getLegendControls = container => getOrCreateElement(container, ".legend-controls", () => container.append("g").attr("class", "legend-controls").html(legendControlsTemplate));

  const getLegendElement = container => getOrCreateElement(container, ".legend", () => container.append("svg").attr("class", "legend"));

  scrollableLegend.decorate = (...args) => {
    if (!args.length) {
      return decorate;
    }

    decorate = args[0];
    return scrollableLegend;
  };

  rebindAll(scrollableLegend, legend);
  return scrollableLegend;
});
//# sourceMappingURL=scrollableLegend.js.map