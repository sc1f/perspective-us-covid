/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import { get_type_config } from "@finos/perspective/dist/esm/config";
export function format_tooltip(context, type, schema, axis_titles, pivot_titles) {
  const row_pivots_titles = pivot_titles.row,
        column_pivot_titles = pivot_titles.column;
  const has_row_pivots = row_pivots_titles.length > 0,
        has_column_pivots = column_pivot_titles.length > 0;

  if (type === "y") {
    // pivots cannot be type-mapped
    let row_pivots_text = "",
        column_pivot_text = "";

    if (has_row_pivots) {
      let row_pivots_values = get_pivot_values(context.key);
      row_pivots_text = collate_multiple_values(row_pivots_titles, row_pivots_values);
    }

    if (has_column_pivots) {
      let column_pivot_values = context.series.userOptions.name.split(", ");
      column_pivot_text = collate_multiple_values(column_pivot_titles, column_pivot_values);
    }

    const axis_title = context.series.userOptions.stack;
    const axis_type = get_axis_type(axis_title, schema);
    return `${row_pivots_text}
                ${column_pivot_text}
                <span>${axis_title}: </span><b>${format_value(context.y, axis_type)}</b>`;
  } else if (type === "xy") {
    const has_x_values = value_exists(axis_titles[0]),
          has_y_values = value_exists(axis_titles[1]),
          has_z_values = value_exists(axis_titles[2]),
          has_w_values = value_exists(axis_titles[3]);
    let row_pivots_text = "",
        column_pivot_text = "",
        extra_text = "",
        x_text = "",
        y_text = "",
        z_text = "",
        w_text = ""; // render tooltip based on axis + pivots

    if (has_row_pivots) {
      let row_pivots_values = context.key.split(",");
      row_pivots_text = collate_multiple_values(row_pivots_titles, row_pivots_values);
    }

    if (has_column_pivots) {
      let column_pivot_values = context.point.series.name.split(",");
      column_pivot_text = collate_multiple_values(column_pivot_titles, column_pivot_values);
    }

    if (has_x_values) {
      let x_axis_title = axis_titles[0],
          raw_x_value = context.x;
      x_text = collate_single_value(x_axis_title, raw_x_value, schema);
    }

    if (has_y_values) {
      let y_axis_title = axis_titles[1],
          raw_y_value = context.y;
      y_text = collate_single_value(y_axis_title, raw_y_value, schema);
    }

    if (has_z_values) {
      let z_axis_title = axis_titles[2],
          raw_z_axis_value = context.point.colorValue;
      z_text = collate_single_value(z_axis_title, raw_z_axis_value, schema);
    }

    if (has_w_values) {
      let w_axis_title = axis_titles[3],
          raw_w_axis_value = context.point.z;
      w_text = collate_single_value(w_axis_title, raw_w_axis_value, schema);
    }

    if (context.point.tooltip && context.point.tooltip.length > 0) {
      for (let i = 0; i < context.point.tooltip.length; i++) {
        extra_text += collate_single_value(axis_titles[4 + i], context.point.tooltip[i], schema);
      }
    }

    const tooltip_text = [row_pivots_text, column_pivot_text, x_text, y_text, z_text, w_text, extra_text];
    return tooltip_text.join("");
  } else if (type === "xyz") {
    return `<span>${format_value(context.point.value)}</span>`;
  } else if (type === "hierarchy") {
    return `<span>${context.point.id}: </span><b>${format_value(context.x)}</b>`;
  }

  let default_value;
  context.x ? default_value = context.x : default_value = context.y;
  return default_value;
}

function collate_single_value(title, raw_value, schema) {
  const type = get_axis_type(title, schema);
  const formatted_value = format_value(raw_value, type);
  /* columns in aggregate AND in sort need to show up, but
   * columns not in aggregate but NOT in sort need to hide */

  if (formatted_value === "NaN" || formatted_value === null || formatted_value === undefined) return "";
  return `<span>${title}: <b>${formatted_value}</b></span><br/>`;
}

function collate_multiple_values(titles, values) {
  if (values.length <= 0) return "";
  let output = [];

  for (let i = 0; i < titles.length; i++) {
    output.push(`<span>${titles[i]}: <b>${values[i]}</b></span><br/>`);
  }

  return output.join("");
}

export function get_pivot_values(pivots) {
  let values = [],
      parent = pivots.parent;
  values.unshift(pivots.name);

  while (parent !== undefined) {
    if (parent.name !== undefined) {
      values.unshift(parent.name);
    }

    parent = parent.parent;
  }

  return values;
}

function get_axis_type(axis_title, schema) {
  return schema[axis_title];
}

function value_exists(value) {
  return value !== null && value !== undefined && value !== " ";
}

function format_value(value, type) {
  if (type === "datetime") {
    return new Date(value).toLocaleString("en-us", get_type_config("datetime").format);
  } else if (type === "date") {
    return new Date(value).toLocaleString("en-us", get_type_config("date").format);
  } else if (type === "float" || type === "integer") {
    return format_number(value, type);
  } else {
    return value;
  }
}

function format_number(num, format) {
  if (format === "float") {
    return Number.parseFloat(num).toLocaleString(get_type_config("float").format);
  } else {
    return Number.parseInt(num).toLocaleString(get_type_config("float").format);
  }
}
//# sourceMappingURL=tooltip.js.map