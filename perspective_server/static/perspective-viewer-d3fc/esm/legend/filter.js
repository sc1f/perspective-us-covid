import "core-js/modules/es.string.includes";

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
import { groupFromKey } from "../series/seriesKey";
export function filterData(settings, data) {
  const useData = data || settings.data;

  if (settings.hideKeys && settings.hideKeys.length > 0) {
    return useData.map(col => {
      const clone = _objectSpread({}, col);

      settings.hideKeys.forEach(k => {
        delete clone[k];
      });
      return clone;
    });
  }

  return useData;
}
export function filterDataByGroup(settings, data) {
  const useData = data || settings.data;

  if (settings.hideKeys && settings.hideKeys.length > 0) {
    return useData.map(col => {
      const clone = {};
      Object.keys(col).map(key => {
        if (!settings.hideKeys.includes(groupFromKey(key))) {
          clone[key] = col[key];
        }
      });
      return clone;
    });
  }

  return useData;
}
//# sourceMappingURL=filter.js.map