/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

const {execute, bash, path} = require("./script_utils.js");
const minimatch = require("minimatch");

function lint(dir) {
    execute(bash`clang-format -i -style=file ${dir}`);
}

try {
    if (!process.env.PACKAGE || minimatch("perspective", process.env.PACKAGE)) {
        lint(path`./cpp/perspective/src/cpp/*.cpp`);
        lint(path`./cpp/perspective/src/include/perspective/*.h`);
    }
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
