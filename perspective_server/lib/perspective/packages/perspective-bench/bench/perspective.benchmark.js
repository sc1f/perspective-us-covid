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
 * Constants
 *
 */

const CSV = "https://unpkg.com/@jpmorganchase/perspective-examples@0.2.0-beta.2/build/superstore.csv";
const ARROW = "https://unpkg.com/@jpmorganchase/perspective-examples@0.2.0-beta.2/build/superstore.arrow";

const AGG_OPTIONS = [[{column: "Sales", op: "sum"}], [{column: "State", op: "dominant"}], [{column: "Order Date", op: "dominant"}]];
const COLUMN_PIVOT_OPTIONS = [[], ["Sub-Category"]];
const ROW_PIVOT_OPTIONS = [[], ["State"], ["State", "City"]];
const COLUMN_TYPES = {Sales: "number", "Order Date": "datetime", State: "string"};

const COMPUTED_FUNCS = {
    "+": (x, y) => x + y,
    "-": (x, y) => x - y,
    "*": (x, y) => x * y,
    "/": (x, y) => x / y,
    pow2: x => Math.pow(x, 2),
    sqrt: x => Math.sqrt(x),
    uppercase: x => x.toUpperCase(),
    concat_comma: (x, y) => x + y,
    week_bucket: x => {
        let date = new Date(x);
        let day = date.getDay();
        let diff = date.getDate() - day + (day == 0 ? -6 : 1);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setDate(diff);
        return date;
    }
};
const COMPUTED_CONFIG = {computed_function_name: "+", column: "computed", inputs: ["Sales", "Profit"]};

/******************************************************************************
 *
 * Perspective.js Benchmarks
 *
 */

PerspectiveBench.setIterations(100);
PerspectiveBench.setTimeout(2000);
PerspectiveBench.setToss(5);

let worker, data;

beforeAll(async () => {
    await load_dynamic_browser("perspective", PerspectiveBench.commandArg(0));
    window.perspective = window.perspective.default || window.perspective;
    worker = window.perspective.worker();
    await wait_for_perspective();
    if (typeof module !== "undefined" && module.exports) {
        data = await get_data_node(worker);
    } else {
        data = await get_data_browser(worker);
    }
});

describe("Table", async () => {
    let table;

    afterEach(async () => {
        await table.delete();
    });

    for (const name of Object.keys(data)) {
        describe("mixed", async () => {
            describe("table", () => {
                benchmark(name, async () => {
                    let test = data[name];
                    table = worker.table(test.slice ? test.slice() : test);
                    await table.size();
                });
            });
        });
    }
});

describe("Update", async () => {
    // Generate update data from Perspective
    const static_table = worker.table(data.arrow.slice());
    const static_view = static_table.view();

    let table;

    afterEach(async () => {
        await table.delete();
    });

    for (const name of Object.keys(data)) {
        describe("mixed", async () => {
            describe("update", async () => {
                table = worker.table(data.arrow.slice());
                let test_data = await static_view[`to_${name}`]({end_row: 500});
                benchmark(name, async () => {
                    for (let i = 0; i < 5; i++) {
                        table.update(test_data.slice ? test_data.slice() : test_data);
                        await table.size();
                    }
                });
            });
        });
    }
});

describe("View", async () => {
    let table;

    beforeAll(async () => {
        table = worker.table(data.arrow.slice());
    });

    afterAll(async () => {
        await table.delete();
    });

    for (const aggregate of AGG_OPTIONS) {
        for (const row_pivot of ROW_PIVOT_OPTIONS) {
            for (const column_pivot of COLUMN_PIVOT_OPTIONS) {
                const config = {aggregate, row_pivot, column_pivot};

                const [cat, type] = to_name(config);

                describe(type, async () => {
                    describe(cat, async () => {
                        let view;

                        afterEach(async () => {
                            await view.delete();
                        });

                        benchmark(`view`, async () => {
                            view = table.view(config);
                            await view.schema();
                        });
                    });

                    describe(cat, async () => {
                        let view;

                        beforeAll(async () => {
                            view = table.view(config);
                            await view.schema();
                        });

                        afterAll(async () => {
                            await view.delete();
                        });

                        for (const format of ["json", "columns", "arrow"]) {
                            benchmark(format, async () => {
                                await view[`to_${format}`]();
                            });
                        }
                    });
                });
            }
        }
    }
});

describe("Computed Column", async () => {
    for (const name of Object.keys(COMPUTED_FUNCS)) {
        describe("mixed", async () => {
            // Use a single source table for computed
            let table;

            afterEach(async () => {
                await table.delete();
            });

            describe("view", () => {
                let view;

                afterEach(async () => {
                    if (view) {
                        await view.delete();
                    }
                });

                table = worker.table(data.arrow.slice());
                let add_computed_method;
                if (table.add_computed) {
                    add_computed_method = table.add_computed;
                }

                COMPUTED_CONFIG.computed_function_name = name;

                switch (name) {
                    case "pow2":
                    case "sqrt":
                        {
                            COMPUTED_CONFIG.inputs = ["Sales"];
                        }
                        break;
                    case "uppercase":
                        {
                            COMPUTED_CONFIG.inputs = ["Customer Name"];
                        }
                        break;
                    case "concat_comma":
                        {
                            COMPUTED_CONFIG.inputs = ["State", "City"];
                        }
                        break;
                    case "week_bucket":
                        {
                            COMPUTED_CONFIG.inputs = ["Order Date"];
                        }
                        break;
                    default: {
                        COMPUTED_CONFIG.inputs = ["Sales", "Profit"];
                    }
                }

                benchmark(`computed: \`${name}\``, async () => {
                    if (add_computed_method) {
                        COMPUTED_CONFIG.func = COMPUTED_FUNCS[name];
                        COMPUTED_CONFIG.type = "float";

                        table = table.add_computed([COMPUTED_CONFIG]);
                    } else {
                        view = table.view({
                            computed_columns: [COMPUTED_CONFIG]
                        });
                    }

                    // must process update
                    await table.size();
                });

                if (!add_computed_method) {
                    benchmark(`row pivot computed: \`${name}\``, async () => {
                        view = table.view({
                            row_pivots: ["computed"],
                            computed_columns: [COMPUTED_CONFIG]
                        });

                        await table.size();
                    });

                    benchmark(`column pivot computed: \`${name}\``, async () => {
                        view = table.view({
                            column_pivots: ["computed"],
                            computed_columns: [COMPUTED_CONFIG]
                        });

                        await table.size();
                    });

                    benchmark(`row and column pivot computed: \`${name}\``, async () => {
                        view = table.view({
                            row_pivots: ["computed"],
                            column_pivots: ["computed"],
                            computed_columns: [COMPUTED_CONFIG]
                        });

                        await table.size();
                    });

                    benchmark(`sort computed: \`${name}\``, async () => {
                        view = table.view({
                            sort: [["computed", "desc"]],
                            computed_columns: [COMPUTED_CONFIG]
                        });

                        await table.size();
                    });
                }
            });
        });
    }
});

/******************************************************************************
 *
 * Utils
 *
 */

const wait_for_perspective = () => new Promise(resolve => window.addEventListener("perspective-ready", resolve));

function to_name({aggregate, row_pivot, column_pivot}) {
    const type = COLUMN_TYPES[aggregate[0].column];
    const sides = {
        "00": "ctx0",
        "10": "ctx1",
        "20": "ctx1 deep",
        "21": "ctx2 deep",
        "11": "ctx2",
        "01": "ctx1.5"
    }[row_pivot.length.toString() + column_pivot.length.toString()];
    return [`${sides}`, type];
    //    return `${COLUMN_TYPES[aggregate[0].column]},${row_pivot.join("/") || "-"}*${column_pivot.join("/") || "-"}`;
}

const load_dynamic_node = name => {
    return new Promise(resolve => {
        window.perspective = require("@finos/perspective");
        resolve();
    });
};

const load_dynamic_browser = (name, url) => {
    return new Promise(resolve => {
        const existingScript = document.getElementById(name);
        if (!existingScript) {
            const script = document.createElement("script");
            script.src = url; // URL for the third-party library being loaded.
            script.id = name; // e.g., googleMaps or stripe
            document.body.appendChild(script);
            script.onload = () => {
                if (resolve) resolve();
            };
        } else {
            resolve();
        }
    });
};

async function get_data_browser(worker) {
    const req1 = fetch(CSV);
    const req2 = fetch(ARROW);

    console.log("Downloading CSV");
    let content = await req1;
    const csv = await content.text();

    console.log("Downloading Arrow");
    content = await req2;
    const arrow = await content.arrayBuffer();

    console.log("Generating JSON");
    const tbl = worker.table(arrow.slice());
    const view = tbl.view();
    const json = await view.to_json();
    const columns = await view.to_columns();
    view.delete();
    tbl.delete();

    return {csv, arrow, json, columns};
}

async function get_data_node(worker) {
    const fs = require("fs");
    const path = require("path");

    const ARROW_FILE = path.resolve(__dirname, "../../../../examples/simple/superstore.arrow");
    console.log("Loading Arrow");
    const arrow = fs.readFileSync(ARROW_FILE, null).buffer;

    console.log("Generating JSON");
    const tbl = worker.table(arrow.slice());
    const view = tbl.view();
    const rows = await view.to_json();
    const columns = await view.to_columns();
    const csv = await view.to_csv();
    view.delete();
    tbl.delete();

    return {csv, arrow, rows, columns};
}
