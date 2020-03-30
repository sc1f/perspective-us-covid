/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import fs from "fs";
import path from "path";
export default fs.readFileSync(path.join(__dirname, "..", "umd", "psp.async.wasm")).buffer;
//# sourceMappingURL=psp.async.wasm.js.map