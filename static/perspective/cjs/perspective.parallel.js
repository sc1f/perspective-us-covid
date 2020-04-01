"use strict";

require("core-js/modules/es.string.replace");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.string.replace");

require("core-js/modules/web.dom-collections.iterator");

var defaults = _interopRequireWildcard(require("./config/constants.js"));

var _config = require("./config");

var _client = require("./api/client.js");

var _perspectiveWasm = _interopRequireDefault(require("./perspective.wasm.js"));

var _pspAsyncWasm = _interopRequireDefault(require("./psp.async.wasm.js"));

var _index = require("../../dist/esm/config/index.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
const {
  WebSocketClient
} = require("./websocket");

// eslint-disable-next-line max-len
const INLINE_WARNING = `Perspective has been compiled in INLINE mode.  While Perspective's runtime performance is not affected, you may see smaller assets size and faster engine initial load time using "@finos/perspective-webpack-plugin" to build your application.

https://perspective.finos.org/docs/md/installation.html#-an-important-note-about-hosting`;
/**
 * Singleton WASM file download cache.
 */

const override = new class {
  _fetch(url) {
    return new Promise(resolve => {
      let wasmXHR = new XMLHttpRequest();
      wasmXHR.open("GET", url, true);
      wasmXHR.responseType = "arraybuffer";

      wasmXHR.onload = () => {
        resolve(wasmXHR.response);
      };

      wasmXHR.send(null);
    });
  }

  worker() {
    return (0, _perspectiveWasm.default)();
  }

  async wasm() {
    if (_pspAsyncWasm.default instanceof ArrayBuffer) {
      console.warn(INLINE_WARNING);
      this._wasm = _pspAsyncWasm.default;
    } else {
      this._wasm = await this._fetch(_pspAsyncWasm.default);
    }

    return this._wasm;
  }

}();
/**
 * WebWorker extends Perspective's `worker` class and defines interactions using
 * the WebWorker API.
 *
 * This class serves as the client API for transporting messages to/from Web
 * Workers.
 */

class WebWorkerClient extends _client.Client {
  constructor(config) {
    if (config) {
      (0, _index.override_config)(config);
    }

    super();
    this.register();
  }
  /**
   * When the worker is created, load either the ASM or WASM bundle depending
   * on WebAssembly compatibility.  Don't use transferrable so multiple
   * workers can be instantiated.
   */


  async register() {
    let _worker;

    const msg = {
      cmd: "init",
      config: (0, _config.get_config)()
    };

    if (typeof WebAssembly === "undefined") {
      throw new Error("WebAssembly not supported. Support for ASM.JS has been removed as of 0.3.1.");
    } else {
      [_worker, msg.buffer] = await Promise.all([override.worker(), override.wasm()]);
    }

    for (var key in this._worker) {
      _worker[key] = this._worker[key];
    }

    this._worker = _worker;

    this._worker.addEventListener("message", this._handle.bind(this));

    this._worker.postMessage(msg);

    this._detect_transferable();
  }
  /**
   * Send a message from the worker, using transferables if necessary.
   *
   * @param {*} msg
   */


  send(msg) {
    if (this._worker.transferable && msg.args && msg.args[0] instanceof ArrayBuffer) {
      this._worker.postMessage(msg, msg.args);
    } else {
      this._worker.postMessage(msg);
    }
  }

  terminate() {
    this._worker.terminate();

    this._worker = undefined;
  }

  _detect_transferable() {
    var ab = new ArrayBuffer(1);

    this._worker.postMessage(ab, [ab]);

    this._worker.transferable = ab.byteLength === 0;

    if (!this._worker.transferable) {
      console.warn("Transferable support not detected");
    } else {
      console.log("Transferable support detected");
    }
  }

}
/******************************************************************************
 *
 * Web Worker Singleton
 *
 */


const WORKER_SINGLETON = function () {
  let __WORKER__, __CONFIG__;

  return {
    getInstance: function (config) {
      if (__WORKER__ === undefined) {
        __WORKER__ = new WebWorkerClient(config);
      }

      const config_str = JSON.stringify(config);

      if (__CONFIG__ && config_str !== __CONFIG__) {
        throw new Error(`Confiuration object for shared_worker() has changed - this is probably a bug in your application.`);
      }

      __CONFIG__ = config_str;
      return __WORKER__;
    }
  };
}();
/**
 * If Perspective is loaded with the `preload` attribute, pre-initialize the
 * worker so it is available at page render.
 */


if (document.currentScript && document.currentScript.hasAttribute("preload")) {
  WORKER_SINGLETON.getInstance();
}

const mod = {
  override: x => override.set(x),

  /**
   * Create a new WebWorkerClient instance. s
   * @param {*} [config] An optional perspective config object override
   */
  worker(config) {
    return new WebWorkerClient(config);
  },

  /**
   * Create a new WebSocketClient instance. The `url` parameter is provided,
   * load the worker at `url` using a WebSocket. s
   * @param {*} url Defaults to `window.location.origin`
   * @param {*} [config] An optional perspective config object override
   */
  websocket(url = window.location.origin.replace("http", "ws")) {
    return new WebSocketClient(new WebSocket(url));
  },

  shared_worker(config) {
    return WORKER_SINGLETON.getInstance(config);
  }

};

for (let prop of Object.keys(defaults)) {
  mod[prop] = defaults[prop];
}

var _default = mod;
exports.default = _default;
//# sourceMappingURL=perspective.parallel.js.map