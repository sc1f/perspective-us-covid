/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

import {treeData} from "../../../../src/js/data/treeData";
import {data, splitData, mainValues, crossValues, realValues} from "./testTreeData";

describe("treeData should", () => {
    test("create a structure with the right number of levels", () => {
        const {data: result} = treeData({data, mainValues, crossValues, realValues})[0];
        expect(result.height).toEqual(2);
    });

    test("calculate the correct color extents", () => {
        const {extents} = treeData({data, mainValues, crossValues, realValues})[0];
        expect(extents).toEqual([1544, 4156]);
    });

    test("produce tree data for each split", () => {
        const result = treeData({data: splitData, mainValues, crossValues, realValues});
        expect(result.length).toEqual(4);
    });
});
