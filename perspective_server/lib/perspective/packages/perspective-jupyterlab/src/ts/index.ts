/******************************************************************************
 *
 * Copyright (c) 2018, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

export * from "./client";
export * from "./model";
export * from "./version";
export * from "./view";
export * from "./widget";

/* css */
import "!!style-loader!css-loader!less-loader!../less/index.less";

import "@finos/perspective-viewer-hypergrid";
import "@finos/perspective-viewer-highcharts";

import {JupyterFrontEndPlugin} from "@jupyterlab/application";
import {perspectiveRenderers} from "./renderer";
import {PerspectiveJupyterPlugin} from "./plugin";

/**
 * Export the renderer as default.
 */
const plugins: JupyterFrontEndPlugin<any>[] = [PerspectiveJupyterPlugin, perspectiveRenderers];
export default plugins;
