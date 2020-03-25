/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

import {seriesColorRange} from "../seriesRange";

export function treeColor(settings, data) {
    if (settings.realValues.length < 1 || settings.realValues[1] === null) return;
    const colors = data
        .filter(x => x.height > 0)
        .map(x => getColors(x))
        .reduce((a, b) => a.concat(b));
    let min = Math.min(...colors);
    let max = Math.max(...colors);
    return seriesColorRange(settings, null, null, [min, max]);
}

// only get the colors from the bottom level (e.g. nodes with no children)
function getColors(nodes, colors = []) {
    nodes.children && nodes.children.length > 0 ? nodes.children.forEach(child => colors.concat(getColors(child, colors))) : colors.push(nodes.data.color);
    return colors;
}
