"use strict";

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.is_valid_date = is_valid_date;
exports.DateParser = exports.DATE_PARSE_CANDIDATES = void 0;

require("core-js/modules/web.dom-collections.iterator");

var _moment = _interopRequireDefault(require("moment"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
const DATE_PARSE_CANDIDATES = [_moment.default.ISO_8601, _moment.default.RFC_2822, "YYYY-MM-DD\\DHH:mm:ss.SSSS", "MM-DD-YYYY", "MM/DD/YYYY", "M/D/YYYY", "M/D/YY", "DD MMM YYYY", "HH:mm:ss.SSS"];
/**
 *
 *
 * @export
 * @param {string} x
 * @returns
 */

exports.DATE_PARSE_CANDIDATES = DATE_PARSE_CANDIDATES;

function is_valid_date(x) {
  return (0, _moment.default)(x, DATE_PARSE_CANDIDATES, true).isValid();
}
/**
 *
 *
 * @export
 * @class DateParser
 */


class DateParser {
  constructor() {
    this.date_types = [];
    this.date_candidates = DATE_PARSE_CANDIDATES.slice();
    this.date_exclusions = [];
  }

  parse(input) {
    if (this.date_exclusions.indexOf(input) > -1) {
      return null;
    } else {
      let val = input;
      const type = typeof val;

      if (val.getMonth) {
        return val;
      } else if (type === "string") {
        val = (0, _moment.default)(input, this.date_types, true);

        if (!val.isValid() || this.date_types.length === 0) {
          for (let candidate of this.date_candidates) {
            val = (0, _moment.default)(input, candidate, true);

            if (val.isValid()) {
              this.date_types.push(candidate);
              this.date_candidates.splice(this.date_candidates.indexOf(candidate), 1);
              return val.toDate();
            }
          }

          this.date_exclusions.push(input);
          return null;
        }

        return val.toDate();
      } else if (type === "number") {
        return new Date(val);
      }

      throw new Error(`Unparseable date ${val}`);
    }
  }

}

exports.DateParser = DateParser;
//# sourceMappingURL=date_parser.js.map