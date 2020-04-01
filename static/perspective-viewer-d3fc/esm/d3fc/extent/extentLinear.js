import "core-js/modules/web.dom-collections.iterator";

/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import * as d3Array from "d3-array";
import { defaultPadding } from "../padding/default";
export const extentLinear = function () {
  let accessors = [function (d) {
    return d;
  }];
  let symmetricalAbout = null;
  let include = [];
  let paddingStrategy = defaultPadding();

  const instance = function instance(data) {
    let values = new Array(data.length);
    let _iteratorNormalCompletion = true;
    let _didIteratorError = false;
    let _iteratorError = undefined;

    let _iterator = accessors[Symbol.iterator]();

    try {
      for (let _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        let accessor = _step.value;

        for (let i = 0; i < data.length; i++) {
          let value = accessor(data[i], i);

          if (Array.isArray(value)) {
            values.push.apply(values, toConsumableArray(value));
          } else {
            values.push(value);
          }
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    let extent$$1 = [d3Array.min(values), d3Array.max(values)];
    extent$$1[0] = extent$$1[0] == null ? d3Array.min(include) : d3Array.min([extent$$1[0]].concat(toConsumableArray(include)));
    extent$$1[1] = extent$$1[1] == null ? d3Array.max(include) : d3Array.max([extent$$1[1]].concat(toConsumableArray(include)));

    if (symmetricalAbout != null) {
      let halfRange = Math.max(Math.abs(extent$$1[1] - symmetricalAbout), Math.abs(extent$$1[0] - symmetricalAbout));
      extent$$1[0] = symmetricalAbout - halfRange;
      extent$$1[1] = symmetricalAbout + halfRange;
    }

    return paddingStrategy(extent$$1);
  };

  instance.accessors = function () {
    if (!arguments.length) {
      return accessors;
    }

    accessors = arguments.length <= 0 ? undefined : arguments[0];
    return instance;
  }; //This function points directly at the paddingStrategy child object's
  //properties for backwards-compatibility. DEPRECATED.


  instance.pad = function () {
    if (!arguments.length) {
      return paddingStrategy.pad;
    }

    paddingStrategy.pad(arguments.length <= 0 ? undefined : arguments[0]);
    return instance;
  }; //This function points directly at the paddingStrategy child object's
  //properties for backwards-compatibility. DEPRECATED.


  instance.padUnit = function () {
    if (!arguments.length) {
      return paddingStrategy.padUnit;
    }

    paddingStrategy.padUnit(arguments.length <= 0 ? undefined : arguments[0]);
    return instance;
  };

  instance.include = function () {
    if (!arguments.length) {
      return include;
    }

    include = arguments.length <= 0 ? undefined : arguments[0];
    return instance;
  };

  instance.symmetricalAbout = function () {
    if (!arguments.length) {
      return symmetricalAbout;
    }

    symmetricalAbout = arguments.length <= 0 ? undefined : arguments[0];
    return instance;
  };

  instance.paddingStrategy = function () {
    if (!arguments.length) {
      return paddingStrategy;
    }

    paddingStrategy = arguments.length <= 0 ? undefined : arguments[0];
    return instance;
  };

  return instance;
};

let toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    let arr2 = Array(arr.length);

    for (let i = 0; i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  } else {
    return Array.from(arr);
  }
};
//# sourceMappingURL=extentLinear.js.map