/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import { getGroupValues, getSplitValues, getDataValues } from "./selectionData";

const mapToFilter = d => [d.name, "==", d.value];

export const raiseEvent = (node, data, settings) => {
  const column_names = getDataValues(data, settings).map(d => d.name);
  const groupFilters = getGroupValues(data, settings).map(mapToFilter);
  const splitFilters = getSplitValues(data, settings).map(mapToFilter);
  const filters = settings.filter.concat(groupFilters).concat(splitFilters);
  node.dispatchEvent(new CustomEvent("perspective-click", {
    bubbles: true,
    composed: true,
    detail: {
      column_names,
      config: {
        filters
      },
      row: data.row
    }
  }));
};
export const selectionEvent = () => {
  let settings = null;

  const _event = selection => {
    const node = selection.node();
    selection.on("click", data => raiseEvent(node, data, settings));
  };

  _event.settings = (...args) => {
    if (!args.length) {
      return settings;
    }

    settings = args[0];
    return _event;
  };

  return _event;
};
//# sourceMappingURL=selectionEvent.js.map