/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import { getOrCreateElement } from "../utils/utils";
export function gridLayoutMultiChart() {
  let elementsPrefix = "element-prefix-unset";
  let chartContainer = null;
  let chartEnter = null;
  let chartDiv = null;
  let chartTitle = null;
  let color = null;
  let containerSize = null;

  const _gridLayoutMultiChart = container => {
    const innerContainer = getOrCreateElement(container, "div.inner-container", () => container.append("div").attr("class", "inner-container"));
    const innerRect = innerContainer.node().getBoundingClientRect();
    const containerHeight = innerRect.height;
    const containerWidth = innerRect.width - (color ? 70 : 0);
    const minSize = 500;
    const data = container.datum();
    const cols = Math.min(data.length, Math.floor(containerWidth / minSize));
    const rows = Math.ceil(data.length / cols);
    containerSize = {
      width: containerWidth / cols,
      height: Math.min(containerHeight, Math.max(containerHeight / rows, containerWidth / cols))
    };

    if (containerHeight / rows > containerSize.height * 0.75) {
      containerSize.height = containerHeight / rows;
    }

    innerContainer.style("grid-template-columns", `repeat(${cols}, ${containerSize.width}px)`);
    innerContainer.style("grid-template-rows", `repeat(${rows}, ${containerSize.height}px)`);
    chartDiv = innerContainer.selectAll(`div.${elementsPrefix}-container`).data(data, d => d.split);
    chartDiv.exit().remove();
    chartEnter = chartDiv.enter().append("div").attr("class", `${elementsPrefix}-container`);
    chartTitle = chartEnter.append("div").attr("class", "title-container").style("text-align", "center").attr("display", "inline-block").append("text").attr("class", "title").style("text-align", "left");
    chartContainer = chartEnter.append("svg").append("g").attr("class", elementsPrefix);
  };

  _gridLayoutMultiChart.elementsPrefix = (...args) => {
    if (!args.length) {
      return elementsPrefix;
    }

    elementsPrefix = args[0];
    return _gridLayoutMultiChart;
  };

  _gridLayoutMultiChart.chartContainer = () => chartContainer;

  _gridLayoutMultiChart.chartEnter = () => chartEnter;

  _gridLayoutMultiChart.chartDiv = () => chartDiv;

  _gridLayoutMultiChart.chartTitle = () => chartTitle;

  _gridLayoutMultiChart.containerSize = () => containerSize;

  return _gridLayoutMultiChart;
}
//# sourceMappingURL=gridLayoutMultiChart.js.map