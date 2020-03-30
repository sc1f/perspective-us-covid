/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import { defaultPadding } from "./default";
import * as fc from "d3fc";
export const hardLimitZeroPadding = () => {
  const _defaultPadding = defaultPadding();

  const padding = extent => {
    let pad = _defaultPadding.pad();

    let padUnit = _defaultPadding.padUnit();

    let delta = 1;

    switch (padUnit) {
      case "domain":
        {
          break;
        }

      case "percent":
        {
          delta = extent[1] - extent[0];
          break;
        }

      default:
        throw new Error("Unknown padUnit: " + padUnit);
    }

    let paddedLowerExtent = extent[0] - pad[0] * delta;
    let paddedUpperExtent = extent[1] + pad[1] * delta; // If datapoints are exclusively negative or exclusively positive hard
    // limit extent to 0.

    extent[0] = extent[0] >= 0 && paddedLowerExtent < 0 ? 0 : paddedLowerExtent;
    extent[1] = extent[1] <= 0 && paddedUpperExtent > 0 ? 0 : paddedUpperExtent;
    return extent;
  };

  fc.rebindAll(padding, _defaultPadding);
  return padding;
};
//# sourceMappingURL=hardLimitZero.js.map