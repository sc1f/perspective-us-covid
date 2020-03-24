/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

const perspective = require("../../dist/cjs/perspective.node.js");

const data = {
    w: [1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, -1.5, -3.5, -1.5, -4.5, -9.5, -5.5, -8.5, -7.5],
    x: [1, 2, 3, 4, 4, 3, 2, 1, 3, 4, 2, 1, 4, 3, 1, 2],
    y: ["a", "b", "c", "d", "a", "b", "c", "d", "a", "b", "c", "d", "a", "b", "c", "d"],
    z: [true, false, true, false, true, false, true, false, true, true, true, true, false, false, false, false]
};

describe("to_format viewport", function() {
    describe("0 sided", function() {
        it("start_col 0 is the first col", async function() {
            var table = perspective.table(data);
            var view = table.view({});
            const cols = await view.to_columns({start_col: 0, end_col: 1});
            expect(cols).toEqual({w: data.w});
            view.delete();
            table.delete();
        });

        it("start_col 2 is the second col", async function() {
            var table = perspective.table(data);
            var view = table.view({});
            const cols = await view.to_columns({start_col: 1, end_col: 2});
            expect(cols).toEqual({x: data.x});
            view.delete();
            table.delete();
        });

        it("start_col 0, end_col 2 is the first two columns", async function() {
            var table = perspective.table(data);
            var view = table.view({});
            const cols = await view.to_columns({start_col: 0, end_col: 2});
            expect(cols).toEqual({w: data.w, x: data.x});
            view.delete();
            table.delete();
        });
    });

    describe("1 sided", function() {
        it("start_col 0 is the first col", async function() {
            var table = perspective.table(data);
            var view = table.view({
                row_pivots: ["y"]
            });
            const cols = await view.to_columns({start_col: 0, end_col: 1});
            expect(cols).toEqual({__ROW_PATH__: [[], ["a"], ["b"], ["c"], ["d"]], w: [-2, -4, 0, 1, 1]});
            view.delete();
            table.delete();
        });

        it("start_col 2 is the second col", async function() {
            var table = perspective.table(data);
            var view = table.view({
                row_pivots: ["y"]
            });
            const cols = await view.to_columns({start_col: 1, end_col: 2});
            expect(cols).toEqual({__ROW_PATH__: [[], ["a"], ["b"], ["c"], ["d"]], x: [40, 12, 12, 8, 8]});
            view.delete();
            table.delete();
        });

        it("start_col 0, end_col 2 is the first two columns", async function() {
            var table = perspective.table(data);
            var view = table.view({
                row_pivots: ["y"]
            });
            const cols = await view.to_columns({start_col: 0, end_col: 2});
            expect(cols).toEqual({__ROW_PATH__: [[], ["a"], ["b"], ["c"], ["d"]], w: [-2, -4, 0, 1, 1], x: [40, 12, 12, 8, 8]});
            view.delete();
            table.delete();
        });
    });

    describe("2 sided", function() {
        it("start_col 0 is the first col", async function() {
            var table = perspective.table(data);
            var view = table.view({
                row_pivots: ["y"],
                column_pivots: ["z"]
            });
            const cols = await view.to_columns({start_col: 0, end_col: 1});
            expect(cols).toEqual({__ROW_PATH__: [[], ["a"], ["b"], ["c"], ["d"]], "false|w": [-9, -9.5, 3.5, -8.5, 5.5]});
            view.delete();
            table.delete();
        });

        it("start_col 2 is the second col", async function() {
            var table = perspective.table(data);
            var view = table.view({
                row_pivots: ["y"],
                column_pivots: ["z"]
            });
            const cols = await view.to_columns({start_col: 1, end_col: 2});
            expect(cols).toEqual({__ROW_PATH__: [[], ["a"], ["b"], ["c"], ["d"]], "false|x": [20, 4, 8, 1, 7]});
            view.delete();
            table.delete();
        });

        it("start_col 0, end_col 2 is the first two columns", async function() {
            var table = perspective.table(data);
            var view = table.view({
                row_pivots: ["y"],
                column_pivots: ["z"]
            });
            const cols = await view.to_columns({start_col: 0, end_col: 2});
            expect(cols).toEqual({__ROW_PATH__: [[], ["a"], ["b"], ["c"], ["d"]], "false|w": [-9, -9.5, 3.5, -8.5, 5.5], "false|x": [20, 4, 8, 1, 7]});
            view.delete();
            table.delete();
        });
    });

    describe("column only", function() {
        it("start_col 0 is the first col", async function() {
            var table = perspective.table(data);
            var view = table.view({
                column_pivots: ["z"]
            });
            const cols = await view.to_columns({start_col: 0, end_col: 1});
            expect(cols).toEqual({"false|w": [null, 2.5, null, 4.5, null, 6.5, null, 8.5, null, null, null, null, -9.5, -5.5, -8.5, -7.5]});
            view.delete();
            table.delete();
        });

        it("start_col 2 is the second col", async function() {
            var table = perspective.table(data);
            var view = table.view({
                column_pivots: ["z"]
            });
            const cols = await view.to_columns({start_col: 1, end_col: 2});
            expect(cols).toEqual({"false|x": [null, 2, null, 4, null, 3, null, 1, null, null, null, null, 4, 3, 1, 2]});
            view.delete();
            table.delete();
        });

        it("start_col 0, end_col 2 is the first two columns", async function() {
            var table = perspective.table(data);
            var view = table.view({
                column_pivots: ["z"]
            });
            const cols = await view.to_columns({start_col: 0, end_col: 2});
            expect(cols).toEqual({
                "false|w": [null, 2.5, null, 4.5, null, 6.5, null, 8.5, null, null, null, null, -9.5, -5.5, -8.5, -7.5],
                "false|x": [null, 2, null, 4, null, 3, null, 1, null, null, null, null, 4, 3, 1, 2]
            });
            view.delete();
            table.delete();
        });
    });
});
