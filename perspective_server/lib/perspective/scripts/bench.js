/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

require("./script_utils.js");

const execSync = require("child_process").execSync;

const execute = cmd => execSync(cmd, {stdio: "inherit"});

const args = process.argv.slice(2);
const LIMIT = args.indexOf("--limit");
const IS_DELTA = args.indexOf("--delta");

function docker() {
    console.log("Creating puppeteer docker image");
    let cmd = "docker run -it --rm --shm-size=2g --cap-add=SYS_NICE -u root -e PACKAGE=${PACKAGE} -e HTTPS_PROXY -e HTTPS_PROXY -v $(pwd):/src -w /src";
    if (process.env.PSP_CPU_COUNT) {
        cmd += ` --cpus="${parseInt(process.env.PSP_CPU_COUNT)}.0"`;
    }
    cmd += " perspective/puppeteer nice -n -20 node_modules/.bin/lerna exec --scope=@finos/perspective-bench -- yarn bench";

    if (LIMIT !== -1) {
        let limit = args[LIMIT + 1];
        cmd += ` --limit ${limit}`;
    }

    if (IS_DELTA !== -1) {
        console.log("Running benchmarking suite for delta - only comparing results within master.");
        cmd += " --delta";
    }
    return cmd;
}

try {
    if (!process.env.PSP_DOCKER_PUPPETEER) {
        execute(docker());
    } else {
        execute(`nice -n -20 node_modules/.bin/lerna exec --scope=@finos/perspective-bench -- yarn bench`);
    }
} catch (e) {
    process.exit(1);
}
