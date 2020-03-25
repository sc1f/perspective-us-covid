/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

import {flattenExtent} from "../../axis/flatten";
import {seriesColorRange} from "../seriesRange";

export function treeColor(settings, extents) {
    if (settings.realValues.length > 1 && settings.realValues[1] !== null) {
        return seriesColorRange(settings, null, null, flattenExtent(extents));
    }
}
