/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import * as fc from "d3fc";
import { getChartElement } from "../plugin/root";
import { withoutOpacity } from "../series/seriesColors.js"; // Render a set of labels with the little left/right arrows for moving
// between axes

export const splitterLabels = settings => {
  let labels = [];
  let alt = false;
  let color;

  const _render = selection => {
    selection.text("");
    const labelDataJoin = fc.dataJoin("span", "splitter-label").key(d => d);
    const disabled = !alt && labels.length === 1;
    const coloured = color && settings.splitValues.length === 0;
    labelDataJoin(selection, labels).classed("disabled", disabled).text(d => d.name).style("color", d => coloured ? withoutOpacity(color(d.name)) : undefined).on("click", d => {
      if (disabled) return;

      if (alt) {
        settings.splitMainValues = settings.splitMainValues.filter(v => v != d.name);
      } else {
        settings.splitMainValues = [d.name].concat(settings.splitMainValues || []);
      }

      redrawChart(selection);
    });
  };

  const redrawChart = selection => {
    const chartElement = getChartElement(selection.node());
    chartElement.remove();
    chartElement.draw();
  };

  _render.labels = (...args) => {
    if (!args.length) {
      return labels;
    }

    labels = args[0];
    return _render;
  };

  _render.alt = (...args) => {
    if (!args.length) {
      return alt;
    }

    alt = args[0];
    return _render;
  };

  _render.color = (...args) => {
    if (!args.length) {
      return color;
    }

    color = args[0];
    return _render;
  };

  return _render;
};
//# sourceMappingURL=splitterLabels.js.map