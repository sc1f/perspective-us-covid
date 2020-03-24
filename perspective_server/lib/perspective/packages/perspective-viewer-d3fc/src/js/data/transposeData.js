/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

export const transposeData = function(x) {
    const columns = [];
    for (const row of x) {
        for (let col = 0; col < row.length; col++) {
            if (row[col].mainValue !== null) {
                columns[col] = columns[col] || [];
                columns[col].push(row[col]);
            }
        }
    }
    return columns;
};
