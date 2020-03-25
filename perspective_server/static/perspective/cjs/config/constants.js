"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TYPE_FILTERS = exports.COLUMN_SEPARATOR_STRING = exports.FILTER_OPERATORS = exports.TYPE_AGGREGATES = exports.SORT_ORDER_IDS = exports.SORT_ORDERS = exports.CONFIG_VALID_KEYS = exports.CONFIG_ALIASES = void 0;

/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
const CONFIG_ALIASES = {
  row_pivot: "row_pivots",
  "row-pivot": "row_pivots",
  "row-pivots": "row_pivots",
  col_pivot: "column_pivots",
  col_pivots: "column_pivots",
  column_pivot: "column_pivots",
  "column-pivot": "column_pivots",
  "column-pivots": "column_pivots",
  filters: "filter",
  sorts: "sort"
};
exports.CONFIG_ALIASES = CONFIG_ALIASES;
const CONFIG_VALID_KEYS = ["viewport", "row_pivots", "column_pivots", "aggregates", "columns", "filter", "sort", "computed_columns", "row_pivot_depth", "filter_op"];
exports.CONFIG_VALID_KEYS = CONFIG_VALID_KEYS;
const NUMBER_AGGREGATES = ["any", "avg", "count", "distinct count", "dominant", "first by index", "last by index", "last", "high", "low", "mean", "median", "pct sum parent", "pct sum grand total", "sum", "sum abs", "sum not null", "unique"];
const STRING_AGGREGATES = ["any", "count", "distinct count", "distinct leaf", "dominant", "first by index", "last by index", "last", "unique"];
const BOOLEAN_AGGREGATES = ["any", "count", "distinct count", "distinct leaf", "dominant", "first by index", "last by index", "last", "unique", "and", "or"];
const SORT_ORDERS = ["none", "asc", "desc", "col asc", "col desc", "asc abs", "desc abs", "col asc abs", "col desc abs"];
exports.SORT_ORDERS = SORT_ORDERS;
const SORT_ORDER_IDS = [2, 0, 1, 0, 1, 3, 4, 3, 4];
exports.SORT_ORDER_IDS = SORT_ORDER_IDS;
const TYPE_AGGREGATES = {
  string: STRING_AGGREGATES,
  float: NUMBER_AGGREGATES,
  integer: NUMBER_AGGREGATES,
  boolean: BOOLEAN_AGGREGATES,
  datetime: STRING_AGGREGATES,
  date: STRING_AGGREGATES
};
exports.TYPE_AGGREGATES = TYPE_AGGREGATES;
const FILTER_OPERATORS = {
  lessThan: "<",
  greaterThan: ">",
  equals: "==",
  lessThanOrEquals: "<=",
  greaterThanOrEquals: ">=",
  doesNotEqual: "!=",
  isNull: "is null",
  isNotNull: "is not null",
  isIn: "in",
  isNotIn: "not in",
  contains: "contains",
  bitwiseAnd: "&",
  bitwiseOr: "|",
  and: "and",
  or: "or",
  beginsWith: "begins with",
  endsWith: "ends with"
};
exports.FILTER_OPERATORS = FILTER_OPERATORS;
const BOOLEAN_FILTERS = [FILTER_OPERATORS.bitwiseAnd, FILTER_OPERATORS.bitwiseOr, FILTER_OPERATORS.equals, FILTER_OPERATORS.doesNotEqual, FILTER_OPERATORS.or, FILTER_OPERATORS.and, FILTER_OPERATORS.isNull, FILTER_OPERATORS.isNotNull];
const NUMBER_FILTERS = [FILTER_OPERATORS.lessThan, FILTER_OPERATORS.greaterThan, FILTER_OPERATORS.equals, FILTER_OPERATORS.lessThanOrEquals, FILTER_OPERATORS.greaterThanOrEquals, FILTER_OPERATORS.doesNotEqual, FILTER_OPERATORS.isNull, FILTER_OPERATORS.isNotNull];
const STRING_FILTERS = [FILTER_OPERATORS.equals, FILTER_OPERATORS.contains, FILTER_OPERATORS.doesNotEqual, FILTER_OPERATORS.isIn, FILTER_OPERATORS.isNotIn, FILTER_OPERATORS.beginsWith, FILTER_OPERATORS.endsWith, FILTER_OPERATORS.isNull, FILTER_OPERATORS.isNotNull];
const DATETIME_FILTERS = [FILTER_OPERATORS.lessThan, FILTER_OPERATORS.greaterThan, FILTER_OPERATORS.equals, FILTER_OPERATORS.lessThanOrEquals, FILTER_OPERATORS.greaterThanOrEquals, FILTER_OPERATORS.doesNotEqual, FILTER_OPERATORS.isNull, FILTER_OPERATORS.isNotNull];
const COLUMN_SEPARATOR_STRING = "|";
exports.COLUMN_SEPARATOR_STRING = COLUMN_SEPARATOR_STRING;
const TYPE_FILTERS = {
  string: STRING_FILTERS,
  float: NUMBER_FILTERS,
  integer: NUMBER_FILTERS,
  boolean: BOOLEAN_FILTERS,
  datetime: DATETIME_FILTERS,
  date: DATETIME_FILTERS
};
exports.TYPE_FILTERS = TYPE_FILTERS;
//# sourceMappingURL=constants.js.map