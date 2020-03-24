/******************************************************************************
 *
 * Copyright (c) 2018, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

import perspective from "@finos/perspective";
import "@finos/perspective-viewer-hypergrid";
import "@finos/perspective-viewer-d3fc";
import "@finos/perspective-workspace";

import "./index.less";

const datasource = async () => {
    const req = fetch("./superstore.arrow");
    const resp = await req;
    const buffer = await resp.arrayBuffer();
    const worker = perspective.shared_worker();
    return worker.table(buffer);
};

window.addEventListener("load", () => {
    window.workspace.tables.set("superstore", datasource());

    window.workspace.restore({
        master: {
            widgets: ["Four", "Three"]
        },
        detail: {
            main: {
                currentIndex: 0,
                type: "tab-area",
                widgets: ["One", "Two"]
            }
        },
        viewers: {
            Three: {table: "superstore", name: "Test Widget III (modified)", "row-pivots": ["State"], columns: ["Sales", "Profit"]},
            Four: {table: "superstore", name: "Test Widget IV (modified)", "row-pivots": ["Category", "Sub-Category"], columns: ["Sales", "Profit"]}
        }
    });
});
