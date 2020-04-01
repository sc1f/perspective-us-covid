"use strict";

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fill_vector = exports.extract_map = exports.extract_vector = void 0;

require("core-js/modules/web.dom-collections.iterator");

/******************************************************************************
 *
 * Copyright (c) 2019, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

/** Translation layer Interface between C++ and JS to handle conversions/data
 * structures that were previously handled in non-portable perspective.js
 */
const extract_vector = function (vector) {
  // handles deletion already - do not call delete() on the input vector again
  let extracted = [];

  for (let i = 0; i < vector.size(); i++) {
    let item = vector.get(i);
    extracted.push(item);
  }

  vector.delete();
  return extracted;
};

exports.extract_vector = extract_vector;

const extract_map = function (map) {
  // handles deletion already - do not call delete() on the input map again
  let extracted = {};
  let keys = map.keys();

  for (let i = 0; i < keys.size(); i++) {
    let key = keys.get(i);
    extracted[key] = map.get(key);
  }

  map.delete();
  keys.delete();
  return extracted;
};
/**
 * Given a C++ vector constructed in Emscripten, fill it with data. Assume that
 * data types are already validated, thus Emscripten will throw an error if the
 * vector is filled with the wrong type of data.
 *
 * @param {*} vector the `std::vector` to be filled
 * @param {Array} arr the `Array` from which to draw data
 *
 * @private
 */


exports.extract_map = extract_map;

const fill_vector = function (vector, arr) {
  for (const elem of arr) {
    vector.push_back(elem);
  }

  return vector;
};

exports.fill_vector = fill_vector;
//# sourceMappingURL=emscripten.js.map