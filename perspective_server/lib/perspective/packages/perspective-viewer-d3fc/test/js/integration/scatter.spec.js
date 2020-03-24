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
const simple_tests = require("@finos/perspective-viewer/test/js/simple_tests.js");

const {withTemplate} = require("./simple-template");
withTemplate("scatter", "d3_xy_scatter", {columns: ["Sales", "Quantity"]});

utils.with_server({}, () => {
    describe.page(
        "scatter.html",
        () => {
            simple_tests.default();

            test.capture(
                "tooltips with no color and size.",
                async page => {
                    const viewer = await page.$("perspective-viewer");
                    await page.shadow_click("perspective-viewer", "#config_button");
                    await page.evaluate(element => element.setAttribute("columns", '["Sales", "Profit", null, null, "Quantity"]'), viewer);
                    await page.waitForSelector("perspective-viewer:not([updating])");
                    const columns = JSON.parse(await page.evaluate(element => element.getAttribute("columns"), viewer));
                    expect(columns).toEqual(["Sales", "Profit", null, null, "Quantity"]);
                    await page.mouse.move(0, 0);
                    await page.mouse.move(500, 200);
                    await page.waitFor(
                        element => {
                            const elem = element.shadowRoot.querySelector("perspective-d3fc-chart").shadowRoot.querySelector(".tooltip");
                            if (elem) {
                                return window.getComputedStyle(elem).opacity === "0.9";
                            }
                            return false;
                        },
                        {},
                        viewer
                    );
                },
                {preserve_hover: true}
            );

            test.capture(
                "tooltip columns works",
                async page => {
                    const viewer = await page.$("perspective-viewer");
                    await page.shadow_click("perspective-viewer", "#config_button");
                    await page.evaluate(element => element.setAttribute("columns", '["Sales", "Profit", "Discount", "Quantity", "State"]'), viewer);
                    const columns = JSON.parse(await page.evaluate(element => element.getAttribute("columns"), viewer));
                    expect(columns).toEqual(["Sales", "Profit", "Discount", "Quantity", "State"]);
                    await page.waitForSelector("perspective-viewer:not([updating])");
                    await page.mouse.move(0, 0);
                    await page.mouse.move(550, 200);
                    await page.waitFor(
                        element => {
                            const elem = element.shadowRoot.querySelector("perspective-d3fc-chart").shadowRoot.querySelector(".tooltip");
                            if (elem) {
                                return window.getComputedStyle(elem).opacity === "0.9";
                            }
                            return false;
                        },
                        {},
                        viewer
                    );
                },
                {preserve_hover: true}
            );

            test.capture(
                "tooltip columns works when color column is null",
                async page => {
                    const viewer = await page.$("perspective-viewer");
                    await page.shadow_click("perspective-viewer", "#config_button");
                    await page.evaluate(element => element.setAttribute("columns", '["Sales", "Profit", null, "Quantity", "State"]'), viewer);
                    const columns = JSON.parse(await page.evaluate(element => element.getAttribute("columns"), viewer));
                    expect(columns).toEqual(["Sales", "Profit", null, "Quantity", "State"]);
                    await page.waitForSelector("perspective-viewer:not([updating])");
                    await page.mouse.move(0, 0);
                    await page.mouse.move(500, 200);
                    await page.waitFor(
                        element => {
                            const elem = element.shadowRoot.querySelector("perspective-d3fc-chart").shadowRoot.querySelector(".tooltip");
                            if (elem) {
                                return window.getComputedStyle(elem).opacity === "0.9";
                            }
                            return false;
                        },
                        {},
                        viewer
                    );
                },
                {preserve_hover: true}
            );
        },
        {reload_page: false, root: path.join(__dirname, "..", "..", "..")}
    );
});
