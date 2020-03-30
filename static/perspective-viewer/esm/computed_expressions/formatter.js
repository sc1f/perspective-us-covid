/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
// TODO: these have been renamed compared to old computed columns, make sure
// names are consistent throughout.
export const COMPUTED_FUNCTION_FORMATTERS = {
  "+": (x, y) => "(".concat(x, " + ").concat(y, ")"),
  "-": (x, y) => "(".concat(x, " - ").concat(y, ")"),
  "*": (x, y) => "(".concat(x, " * ").concat(y, ")"),
  "/": (x, y) => "(".concat(x, " / ").concat(y, ")"),
  "%": (x, y) => "(".concat(x, " %% ").concat(y, ")"),
  "==": (x, y) => "(".concat(x, " == ").concat(y, ")"),
  "!=": (x, y) => "(".concat(x, " != ").concat(y, ")"),
  ">": (x, y) => "(".concat(x, " > ").concat(y, ")"),
  "<": (x, y) => "(".concat(x, " < ").concat(y, ")"),
  "^": (x, y) => "(".concat(x, " ^ ").concat(y, ")"),
  invert: x => "(1 / ".concat(x, ")"),
  log: x => "log(".concat(x, ")"),
  exp: x => "exp(".concat(x, ")"),
  pow2: x => "(".concat(x, " ^ 2)"),
  sqrt: x => "sqrt(".concat(x, ")"),
  abs: x => "abs(".concat(x, ")"),
  bin10: x => "bin10(".concat(x, ")"),
  bin100: x => "bin100(".concat(x, ")"),
  bin1000: x => "bin1000(".concat(x, ")"),
  bin10th: x => "bin10th(".concat(x, ")"),
  bin100th: x => "bin100th(".concat(x, ")"),
  bin1000th: x => "bin1000th(".concat(x, ")"),
  uppercase: x => "uppercase(".concat(x, ")"),
  lowercase: x => "lowercase(".concat(x, ")"),
  length: x => "length(".concat(x, ")"),
  is: (x, y) => "(".concat(x, " is ").concat(y, ")"),
  concat_space: (x, y) => "concat_space(".concat(x, ", ").concat(y, ")"),
  concat_comma: (x, y) => "concat_comma(".concat(x, ", ").concat(y, ")"),
  hour_of_day: x => "hour_of_day(".concat(x, ")"),
  day_of_week: x => "day_of_week(".concat(x, ")"),
  month_of_year: x => "month_of_year(".concat(x, ")"),
  second_bucket: x => "second_bucket(".concat(x, ")"),
  minute_bucket: x => "minute_bucket(".concat(x, ")"),
  hour_bucket: x => "hour_bucket(".concat(x, ")"),
  day_bucket: x => "day_bucket(".concat(x, ")"),
  week_bucket: x => "week_bucket(".concat(x, ")"),
  month_bucket: x => "month_bucket(".concat(x, ")"),
  year_bucket: x => "year_bucket(".concat(x, ")")
};
//# sourceMappingURL=formatter.js.map