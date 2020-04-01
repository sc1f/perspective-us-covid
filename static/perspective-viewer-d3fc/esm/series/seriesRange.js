import "core-js/modules/web.dom-collections.iterator";

/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import * as d3 from "d3";
import { domain } from "../axis/linearAxis";
export function seriesLinearRange(settings, data, valueName, customExtent) {
  return d3.scaleLinear().domain(getExtent(data, valueName, customExtent));
}
export function seriesColorRange(settings, data, valueName, customExtent) {
  let extent = getExtent(data, valueName, customExtent);
  let gradient = settings.colorStyles.gradient.full;

  if (extent[0] >= 0) {
    gradient = settings.colorStyles.gradient.positive;
  } else if (extent[1] <= 0) {
    gradient = settings.colorStyles.gradient.negative;
  } else {
    const maxVal = Math.max(-extent[0], extent[1]);
    extent = [-maxVal, maxVal];
  }

  const interpolator = multiInterpolator(gradient);
  return d3.scaleSequential(interpolator).domain(extent);
}

const getExtent = (data, valueName, customExtent) => {
  return customExtent || domain().valueName(valueName).pad([0, 0])(data);
};

const multiInterpolator = gradientPairs => {
  // A new interpolator that calls through to a set of
  // interpolators between each value/color pair
  const interpolators = gradientPairs.slice(1).map((p, i) => d3.interpolate(gradientPairs[i][1], p[1]));
  return value => {
    const index = gradientPairs.findIndex((p, i) => i < gradientPairs.length - 1 && value <= gradientPairs[i + 1][0] && value > p[0]);

    if (index === -1) {
      if (value <= gradientPairs[0][0]) {
        return gradientPairs[0][1];
      }

      return gradientPairs[gradientPairs.length - 1][1];
    }

    const interpolator = interpolators[index];
    const [value1] = gradientPairs[index];
    const [value2] = gradientPairs[index + 1];
    return interpolator((value - value1) / (value2 - value1));
  };
};
//# sourceMappingURL=seriesRange.js.map