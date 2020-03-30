"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _pspAsync = _interopRequireDefault(require("../../dist/obj/psp.async.js"));

var _perspective = _interopRequireDefault(require("./perspective.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
let _perspective_instance;

if (global.document !== undefined && typeof WebAssembly !== "undefined") {
  _perspective_instance = global.perspective = (0, _perspective.default)((0, _pspAsync.default)({
    wasmJSMethod: "native-wasm",
    printErr: x => console.error(x),
    print: x => console.log(x)
  }));
} else {
  _perspective_instance = global.perspective = (0, _perspective.default)(_pspAsync.default);
}

var _default = _perspective_instance;
exports.default = _default;
//# sourceMappingURL=perspective.wasm.js.map