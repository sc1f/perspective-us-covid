import "core-js/modules/web.dom-collections.iterator";

/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import { rebindAll } from "d3fc";
const MIN_BANDWIDTH = 1;
export default (adaptee => {
  const minBandwidth = arg => {
    return adaptee(arg);
  };

  rebindAll(minBandwidth, adaptee);

  minBandwidth.bandwidth = (...args) => {
    if (!args.length) {
      return Math.max(adaptee.bandwidth(), MIN_BANDWIDTH);
    }

    adaptee.bandwidth(...args);
    return minBandwidth;
  };

  return minBandwidth;
});
//# sourceMappingURL=minBandwidth.js.map