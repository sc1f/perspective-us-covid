/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

const path = require("path");

const utils = require("@finos/perspective-test");

const {withTemplate} = require("./simple-template");
withTemplate("ohlc", "d3_ohlc", {template: "shares-template"});

utils.with_server({}, () => {
    describe.page(
        "ohlc.html",
        () => {
            test.capture("filter by a single instrument.", async page => {
                const viewer = await page.$("perspective-viewer");
                await page.evaluate(element => element.setAttribute("filters", '[["Name", "==", "BARC"]]'), viewer);
            });

            test.capture("filter to date range.", async page => {
                const viewer = await page.$("perspective-viewer");
                await page.shadow_click("perspective-viewer", "#config_button");
                await page.evaluate(element => element.setAttribute("column-pivots", '["Name"]'), viewer);
                await page.evaluate(element => element.setAttribute("filters", '[["Date", ">", "2019-01-01"]]'), viewer);
            });
        },
        {reload_page: false, root: path.join(__dirname, "..", "..", "..")}
    );
});
