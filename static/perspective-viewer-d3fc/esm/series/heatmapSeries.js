/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import * as fc from "d3fc";
import { tooltip } from "../tooltip/tooltip";
export function heatmapSeries(settings, color) {
  let series = fc.seriesSvgHeatmap();
  series.decorate(selection => {
    tooltip().settings(settings)(selection);
    selection.select("path").attr("fill", d => color(d.colorValue));
  });
  return fc.autoBandwidth(series).xValue(d => d.crossValue).yValue(d => d.mainValue).colorValue(d => d.colorValue).colorInterpolate(color.interpolator()).widthFraction(1.0);
}
//# sourceMappingURL=heatmapSeries.js.map