/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

const utils = require("@finos/perspective-test");
const path = require("path");

const add_computed_expression = async (page, expression) => {
    const viewer = await page.$("perspective-viewer");
    await page.waitForSelector("perspective-viewer:not([updating])");
    await page.shadow_click("perspective-viewer", "#add-computed-expression");
    await page.shadow_type(expression, "perspective-viewer", "perspective-computed-expression-editor", "#psp-expression-input");
    await page.evaluate(element => {
        const editor = element.shadowRoot.querySelector("perspective-computed-expression-editor");
        const button = editor.shadowRoot.querySelector("#psp-expression-button-save");
        button.removeAttribute("disabled");
        button.click();
    }, viewer);
    await page.waitForSelector("perspective-viewer:not([updating])");
};

utils.with_server({}, () => {
    describe.page(
        "superstore.html",
        () => {
            test.capture("click on add column button opens the computed expression UI.", async page => {
                await page.shadow_click("perspective-viewer", "#config_button");
                await page.$("perspective-viewer");
                await page.shadow_click("perspective-viewer", "#add-computed-expression");
            });

            test.capture("click on close button closes the computed expression UI.", async page => {
                const viewer = await page.$("perspective-viewer");
                await page.shadow_click("perspective-viewer", "#config_button");
                await page.$("perspective-viewer");
                await page.shadow_click("perspective-viewer", "#add-computed-expression");
                await page.shadow_click("perspective-viewer", "perspective-computed-expression-editor", "#psp-expression-close");
                await page.evaluate(element => element.setAttribute("columns", JSON.stringify(["Sales", "Profit"])), viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
            });

            test.capture("Typing an expression in the textarea should work even when pushed down to page bottom.", async page => {
                await page.shadow_click("perspective-viewer", "#config_button");
                await page.$("perspective-viewer");
                await page.shadow_click("perspective-viewer", "#add-computed-expression");
                await page.shadow_type('"Sales" + ("Profit" * "Quantity") as "new column"', "perspective-viewer", "perspective-computed-expression-editor", "#psp-expression-input");
                const viewer = await page.$("perspective-viewer");
                await page.evaluate(element => {
                    const editor = element.shadowRoot.querySelector("perspective-computed-expression-editor");
                    const button = editor.shadowRoot.querySelector("#psp-expression-button-save");
                    button.removeAttribute("disabled");
                }, viewer);
            });

            test.capture("Typing a large expression in the textarea should work even when pushed down to page bottom.", async page => {
                await page.shadow_click("perspective-viewer", "#config_button");
                await page.$("perspective-viewer");
                await page.shadow_click("perspective-viewer", "#add-computed-expression");
                await page.shadow_type('"Sales" + ("Profit" * "Quantity") as "new column"\n'.repeat(10), "perspective-viewer", "perspective-computed-expression-editor", "#psp-expression-input");
                const viewer = await page.$("perspective-viewer");
                await page.evaluate(element => {
                    const editor = element.shadowRoot.querySelector("perspective-computed-expression-editor");
                    const button = editor.shadowRoot.querySelector("#psp-expression-button-save");
                    button.removeAttribute("disabled");
                }, viewer);
            });

            // Remove
            test.capture("Removing computed columns should reset active columns, pivots, sort, and filter.", async page => {
                const viewer = await page.$("perspective-viewer");
                await page.shadow_click("perspective-viewer", "#config_button");
                await add_computed_expression(page, 'sqrt("Profit") as "first"');
                await page.waitForSelector("perspective-viewer:not([updating])");
                await add_computed_expression(page, 'sqrt("Sales") as "second"');
                await page.waitForSelector("perspective-viewer:not([updating])");
                await add_computed_expression(page, 'sqrt(("Sales" * "Profit")) as "third"');
                await page.waitForSelector("perspective-viewer:not([updating])");
                await page.evaluate(element => element.setAttribute("row-pivots", JSON.stringify(["State"])), viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
                await page.evaluate(element => element.setAttribute("columns", JSON.stringify(["first", "second", "Sales"])), viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
                await page.evaluate(element => element.setAttribute("column-pivots", JSON.stringify(["third"])), viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
                await page.evaluate(
                    element =>
                        element.setAttribute(
                            "sort",
                            JSON.stringify([
                                ["first", "desc"],
                                ["State", "desc"]
                            ])
                        ),
                    viewer
                );
                await page.waitForSelector("perspective-viewer:not([updating])");
                await page.evaluate(
                    element =>
                        element.setAttribute(
                            "filters",
                            JSON.stringify([
                                ["second", ">", 0],
                                ["State", "==", "Texas"]
                            ])
                        ),
                    viewer
                );
                await page.waitForSelector("perspective-viewer:not([updating])");
                await page.evaluate(element => element.removeAttribute("computed-columns"), viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
            });

            // reset
            test.capture("Resetting the viewer with computed columns should place columns in the inactive list.", async page => {
                const viewer = await page.$("perspective-viewer");
                await page.shadow_click("perspective-viewer", "#config_button");
                await add_computed_expression(page, 'sqrt("Profit")');
                await page.waitForSelector("perspective-viewer:not([updating])");
                await add_computed_expression(page, 'sqrt("Sales")');
                await page.waitForSelector("perspective-viewer:not([updating])");
                await add_computed_expression(page, 'sqrt(("Sales" * "Profit"))');
                await page.waitForSelector("perspective-viewer:not([updating])");
                await page.evaluate(element => element.reset(), viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
            });

            test.capture("Resetting the viewer with computed columns in active columns should reset columns but not delete columns.", async page => {
                const viewer = await page.$("perspective-viewer");
                await page.shadow_click("perspective-viewer", "#config_button");
                await add_computed_expression(page, 'day_of_week("Order Date") as "Computed"');
                await page.waitForSelector("perspective-viewer:not([updating])");
                await add_computed_expression(page, 'month_of_year("Ship Date") as "Computed2"');
                await page.waitForSelector("perspective-viewer:not([updating])");
                await add_computed_expression(page, 'sqrt(("Sales" * "Profit"))');
                await page.waitForSelector("perspective-viewer:not([updating])");
                await page.evaluate(element => element.setAttribute("columns", JSON.stringify(["Computed", "Computed2", "Sales"])), viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
                await page.evaluate(element => element.reset(), viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
            });

            test.capture("Resetting the viewer with computed columns set as pivots should reset pivots but not delete columns.", async page => {
                const viewer = await page.$("perspective-viewer");
                await page.shadow_click("perspective-viewer", "#config_button");
                await add_computed_expression(page, 'day_of_week("Order Date") as "Computed"');
                await page.waitForSelector("perspective-viewer:not([updating])");
                await add_computed_expression(page, 'month_of_year("Ship Date") as "Computed2"');
                await page.waitForSelector("perspective-viewer:not([updating])");
                await add_computed_expression(page, 'sqrt(("Sales" * "Profit"))');
                await page.waitForSelector("perspective-viewer:not([updating])");
                await page.evaluate(element => element.setAttribute("row-pivots", JSON.stringify(["Computed"])), viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
                await page.evaluate(element => element.setAttribute("column-pivots", JSON.stringify(["Computed2"])), viewer);
                await page.evaluate(element => element.reset(), viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
            });

            test.capture("Resetting the viewer with computed columns set as filters should reset filters but not delete columns.", async page => {
                const viewer = await page.$("perspective-viewer");
                await page.shadow_click("perspective-viewer", "#config_button");
                await add_computed_expression(page, 'day_of_week("Order Date") as "Computed"');
                await page.waitForSelector("perspective-viewer:not([updating])");
                await add_computed_expression(page, 'month_of_year("Ship Date") as "Computed2"');
                await page.waitForSelector("perspective-viewer:not([updating])");
                await add_computed_expression(page, 'sqrt(("Sales" * "Profit"))');
                await page.waitForSelector("perspective-viewer:not([updating])");
                await page.waitForSelector("perspective-viewer:not([updating])");
                await page.evaluate(
                    element =>
                        element.setAttribute(
                            "filters",
                            JSON.stringify([
                                ["Computed", "!=", "01 Monday"],
                                ["State", "==", "Texas"]
                            ])
                        ),
                    viewer
                );
                await page.evaluate(element => element.reset(), viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
            });

            test.capture("Resetting the viewer with computed columns set as sort should reset sort but not delete columns.", async page => {
                const viewer = await page.$("perspective-viewer");
                await page.shadow_click("perspective-viewer", "#config_button");
                await add_computed_expression(page, 'day_of_week("Order Date") as "Computed"');
                await page.waitForSelector("perspective-viewer:not([updating])");
                await add_computed_expression(page, 'month_of_year("Ship Date") as "Computed2"');
                await page.waitForSelector("perspective-viewer:not([updating])");
                await add_computed_expression(page, 'sqrt(("Sales" * "Profit"))');
                await page.waitForSelector("perspective-viewer:not([updating])");
                await page.waitForSelector("perspective-viewer:not([updating])");
                await page.evaluate(
                    element =>
                        element.setAttribute(
                            "sort",
                            JSON.stringify([
                                ["Sales", "desc"],
                                ["Computed", "desc"]
                            ])
                        ),
                    viewer
                );
                await page.evaluate(element => element.reset(), viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
            });

            // save
            test.capture("saving without an expression should fail as button is disabled.", async page => {
                const viewer = await page.$("perspective-viewer");
                await page.shadow_click("perspective-viewer", "#config_button");
                await page.shadow_click("perspective-viewer", "#add-computed-expression");
                await page.evaluate(
                    element =>
                        element.shadowRoot
                            .querySelector("perspective-computed-expression-editor")
                            .shadowRoot.querySelector("#psp-expression-button-save")
                            .click(),
                    viewer
                );
            });

            test.capture("saving a single computed expression should add it to inactive columns.", async page => {
                const viewer = await page.$("perspective-viewer");
                await page.shadow_click("perspective-viewer", "#config_button");
                await add_computed_expression(page, 'month_bucket("Ship Date")');
                await page.evaluate(element => element.setAttribute("columns", JSON.stringify(["Sales", "Profit"])), viewer);
            });

            test.capture("saving a single computed expression with dependencies should add all columns to inactive columns.", async page => {
                const viewer = await page.$("perspective-viewer");
                await page.shadow_click("perspective-viewer", "#config_button");
                await add_computed_expression(page, '"Sales" + (pow2("Sales")) as "new column"');
                await page.evaluate(element => element.setAttribute("columns", JSON.stringify(["Sales", "Profit"])), viewer);
            });

            test.skip("saving a duplicate expression should fail with error message.", async page => {
                await page.shadow_click("perspective-viewer", "#config_button");
                await add_computed_expression(page, 'month_bucket("Ship Date")');
                await add_computed_expression(page, 'month_bucket("Ship Date")');
            });

            // Transforms
            test.capture("Computed expression columns should persist when new views are created.", async page => {
                await page.shadow_click("perspective-viewer", "#config_button");
                await add_computed_expression(page, 'month_bucket("Ship Date")');
                const viewer = await page.$("perspective-viewer");
                await page.evaluate(element => element.setAttribute("row-pivots", '["State", "City"]'), viewer);
                await page.evaluate(element => element.setAttribute("columns", JSON.stringify(["State", "City"])), viewer);
            });

            test.capture("Computed expression columns should persist when new computed columns are added.", async page => {
                await page.shadow_click("perspective-viewer", "#config_button");
                await add_computed_expression(page, 'month_bucket("Ship Date")');
                await add_computed_expression(page, '"Sales" % "Profit"');
                const viewer = await page.$("perspective-viewer");
                await page.evaluate(element => element.setAttribute("columns", JSON.stringify(["Sales", "Profit"])), viewer);
            });

            // usage
            test.capture("aggregates by computed expression column.", async page => {
                await page.shadow_click("perspective-viewer", "#config_button");
                await add_computed_expression(page, 'concat_comma("State", "City") as "Computed"');
                const viewer = await page.$("perspective-viewer");
                await page.evaluate(element => {
                    element.setAttribute("aggregates", JSON.stringify({Computed: "any"}));
                }, viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
                await page.evaluate(element => element.setAttribute("row-pivots", '["State"]'), viewer);
                await page.evaluate(element => element.setAttribute("columns", JSON.stringify(["Computed"])), viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
            });

            test.capture("row pivots by computed expression column.", async page => {
                await page.shadow_click("perspective-viewer", "#config_button");
                await add_computed_expression(page, 'concat_comma("State", "City") as "Computed"');
                const viewer = await page.$("perspective-viewer");
                await page.evaluate(element => element.setAttribute("row-pivots", '["Computed"]'), viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
                await page.evaluate(element => element.setAttribute("columns", JSON.stringify(["Computed", "State", "City"])), viewer);
            });

            test.capture("column pivots by computed expression column.", async page => {
                await page.shadow_click("perspective-viewer", "#config_button");
                await add_computed_expression(page, 'concat_comma("State", "City") as "Computed"');
                const viewer = await page.$("perspective-viewer");
                await page.evaluate(element => element.setAttribute("column-pivots", '["Computed"]'), viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
                await page.evaluate(element => element.setAttribute("columns", JSON.stringify(["State", "City"])), viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
            });

            test.capture("row and column pivots by computed expression column.", async page => {
                await page.shadow_click("perspective-viewer", "#config_button");
                await add_computed_expression(page, 'concat_comma("State", "City") as "Computed"');
                await page.waitForSelector("perspective-viewer:not([updating])");
                await add_computed_expression(page, 'uppercase("City") as "Computed2"');
                await page.waitForSelector("perspective-viewer:not([updating])");
                const viewer = await page.$("perspective-viewer");
                await page.evaluate(element => element.setAttribute("row-pivots", '["Computed"]'), viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
                await page.evaluate(element => element.setAttribute("column-pivots", '["Computed2"]'), viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
                await page.evaluate(element => element.setAttribute("columns", JSON.stringify(["State", "City"])), viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
            });

            test.capture("sorts by computed expression column.", async page => {
                await page.shadow_click("perspective-viewer", "#config_button");
                await add_computed_expression(page, 'pow2("Sales") as "Computed"');
                const viewer = await page.$("perspective-viewer");
                await page.evaluate(element => element.setAttribute("sort", JSON.stringify([["Computed", "desc"]])), viewer);
                await page.evaluate(element => element.setAttribute("columns", JSON.stringify(["Sales"])), viewer);
            });

            test.capture("filters by computed expression column.", async page => {
                await page.shadow_click("perspective-viewer", "#config_button");
                await add_computed_expression(page, 'day_of_week("Order Date") as "Computed"');
                const viewer = await page.$("perspective-viewer");
                await page.evaluate(element => element.setAttribute("filters", '[["Computed", "==", "2 Monday"]]'), viewer);
                await page.evaluate(element => element.setAttribute("columns", JSON.stringify(["Computed", "Order Date"])), viewer);
            });

            test.capture("computed expression column aggregates should persist.", async page => {
                await page.shadow_click("perspective-viewer", "#config_button");
                await add_computed_expression(page, 'day_of_week("Order Date") as "Computed"');
                const viewer = await page.$("perspective-viewer");
                await page.evaluate(element => element.setAttribute("row-pivots", '["Quantity"]'), viewer);
                await page.evaluate(element => element.setAttribute("columns", JSON.stringify(["Row ID", "Quantity", "Computed"])), viewer);
                await page.evaluate(element => element.setAttribute("aggregates", '{"Computed":"any"}'), viewer);
                await page.evaluate(element => element.setAttribute("columns", JSON.stringify(["Quantity"])), viewer);
                await page.evaluate(element => element.setAttribute("columns", JSON.stringify(["Row ID", "Quantity", "Computed"])), viewer);
            });

            // Attributes
            test.capture("adds computed expression via attribute", async page => {
                await page.shadow_click("perspective-viewer", "#config_button");
                const viewer = await page.$("perspective-viewer");
                await page.evaluate(element => {
                    const computed = ['"Sales" + "Profit" as "First"', 'sqrt((pow2("Row ID"))) as "Second"'];
                    element.setAttribute("computed-columns", JSON.stringify(computed));
                }, viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
                await page.evaluate(element => element.setAttribute("columns", JSON.stringify(["First"])), viewer);
            });

            test.capture("adds computed expression via attribute in classic syntax", async page => {
                await page.shadow_click("perspective-viewer", "#config_button");
                const viewer = await page.$("perspective-viewer");
                await page.evaluate(element => {
                    const computed = [
                        {
                            column: "First",
                            computed_function_name: "+",
                            inputs: ["Sales", "Profit"]
                        },
                        {
                            column: "Second",
                            computed_function_name: "pow2",
                            inputs: ["Row ID"]
                        }
                    ];

                    element.setAttribute("computed-columns", JSON.stringify(computed));
                }, viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
                await page.evaluate(element => element.setAttribute("row-pivots", JSON.stringify(["First", "Second"])), viewer);
                await page.evaluate(element => element.setAttribute("columns", JSON.stringify(["Sales", "Profit"])), viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
            });

            // Save and restore
            test.capture("Computed expressions are saved without changes", async page => {
                await page.shadow_click("perspective-viewer", "#config_button");
                await add_computed_expression(page, 'day_of_week("Order Date") as "Computed"');
                await add_computed_expression(page, 'month_of_year("Ship Date") as "Computed2"');
                const viewer = await page.$("perspective-viewer");
                await page.waitForSelector("perspective-viewer:not([updating])");
                await page.evaluate(element => {
                    const config = element.save();
                    const result = JSON.stringify(config["computed-columns"]);
                    const expected = JSON.stringify(['day_of_week("Order Date") as "Computed"', 'month_of_year("Ship Date") as "Computed2"']);
                    if (result !== expected) {
                        throw new Error(`Expected ${expected} but received ${result}`);
                    }
                }, viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
                await page.evaluate(element => element.setAttribute("columns", JSON.stringify(["Computed", "Computed2"])), viewer);
            });

            test.skip("Computed expressions are restored without changes", async page => {
                await page.shadow_click("perspective-viewer", "#config_button");
                await page.waitForSelector("perspective-viewer:not([updating])");
                const viewer = await page.$("perspective-viewer");
                await page.evaluate(async element => {
                    const config = {
                        columns: ["Order Date", "Ship Date"],
                        "computed-columns": ['day_of_week("Order Date") as "Computed"', 'month_of_year("Ship Date") as "Computed2"']
                    };
                    await element.restore(config);
                }, viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
            });

            test.skip("On restore, computed expressions in the active columns list are restored correctly.", async page => {
                await page.shadow_click("perspective-viewer", "#config_button");
                await page.waitForSelector("perspective-viewer:not([updating])");
                const viewer = await page.$("perspective-viewer");
                await page.evaluate(async element => {
                    const config = {
                        columns: ["Computed", "Computed2"],
                        "computed-columns": ['day_of_week("Order Date") as "Computed"', 'month_of_year("Ship Date") as "Computed2"']
                    };
                    await element.restore(config);
                }, viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
            });

            test.skip("On restore, computed expressions in pivots are restored correctly.", async page => {
                await page.shadow_click("perspective-viewer", "#config_button");
                await page.waitForSelector("perspective-viewer:not([updating])");
                const viewer = await page.$("perspective-viewer");
                await page.evaluate(async element => {
                    const config = {
                        "row-pivots": ["Computed"],
                        "column-pivots": ["Computed2"],
                        columns: ["Order Date", "Ship Date"],
                        "computed-columns": ['day_of_week("Order Date") as "Computed"', 'month_of_year("Ship Date") as "Computed2"']
                    };
                    await element.restore(config);
                }, viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
            });

            test.skip("On restore, computed expressions in filter are restored correctly.", async page => {
                await page.shadow_click("perspective-viewer", "#config_button");
                await page.waitForSelector("perspective-viewer:not([updating])");
                const viewer = await page.$("perspective-viewer");
                await page.evaluate(async element => {
                    const config = {
                        filters: [["Computed", "==", "5 Thursday"]],
                        columns: ["Order Date", "Ship Date"],
                        "computed-columns": ['day_of_week("Order Date") as "Computed"', 'month_of_year("Ship Date") as "Computed2"']
                    };
                    await element.restore(config);
                }, viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
            });

            test.skip("On restore, computed expressions in sort are restored correctly.", async page => {
                await page.shadow_click("perspective-viewer", "#config_button");
                await page.waitForSelector("perspective-viewer:not([updating])");
                const viewer = await page.$("perspective-viewer");
                await page.evaluate(async element => {
                    const config = {
                        sort: [["Computed", "desc"]],
                        columns: ["Order Date", "Ship Date"],
                        "computed-columns": ['day_of_week("Order Date") as "Computed"', 'month_of_year("Ship Date") as "Computed2"']
                    };
                    await element.restore(config);
                }, viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
            });

            test.skip("On restore, computed expressions in classic syntax are parsed correctly.", async page => {
                await page.shadow_click("perspective-viewer", "#config_button");
                await page.waitForSelector("perspective-viewer:not([updating])");
                const viewer = await page.$("perspective-viewer");
                await page.evaluate(async element => {
                    const computed = [
                        {
                            column: "Computed",
                            computed_function_name: "+",
                            inputs: ["Sales", "Profit"]
                        },
                        {
                            column: "Computed3",
                            computed_function_name: "pow2",
                            inputs: ["Row ID"]
                        }
                    ];
                    const config = {
                        columns: ["Computed", "Computed2"],
                        "computed-columns": computed
                    };
                    await element.restore(config);
                }, viewer);
                await page.waitForSelector("perspective-viewer:not([updating])");
            });

            test.skip("On restore, user defined aggregates are maintained on computed expression columns", async page => {
                await page.shadow_click("perspective-viewer", "#config_button");
                const viewer = await page.$("perspective-viewer");
                await page.evaluate(async element => {
                    const config = {
                        aggregates: {Computed: "mean"},
                        "computed-columns": ['sqrt("Sales") as "Computed"'],
                        columns: ["Computed"],
                        "row-pivots": ["Category"]
                    };
                    await element.restore(config);
                }, viewer);
                await page.$("perspective-viewer:not([updating])");
            });
        },
        {
            root: path.join(__dirname, "..", ".."),
            name: "Computed Expressions"
        }
    );
});
