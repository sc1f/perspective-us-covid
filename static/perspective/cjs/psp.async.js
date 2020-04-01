"use strict";

require("core-js/modules/es.string.replace");

require("core-js/modules/es.typed-array.float32-array");

require("core-js/modules/es.typed-array.float64-array");

require("core-js/modules/es.typed-array.int8-array");

require("core-js/modules/es.typed-array.int16-array");

require("core-js/modules/es.typed-array.int32-array");

require("core-js/modules/es.typed-array.uint8-array");

require("core-js/modules/es.typed-array.uint8-clamped-array");

require("core-js/modules/es.typed-array.uint16-array");

require("core-js/modules/es.typed-array.uint32-array");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var load_perspective = function () {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;

  return function (load_perspective) {
    load_perspective = load_perspective || {};
    var e;
    e || (e = typeof load_perspective !== 'undefined' ? load_perspective : {});
    var m = {},
        q;

    for (q in e) e.hasOwnProperty(q) && (m[q] = e[q]);

    var u = [],
        aa = "./this.program";

    function ba(a, b) {
      throw b;
    }

    var v = !1,
        w = !1,
        ca = !1,
        da = !1,
        ea = !1;
    v = "object" === typeof window;
    w = "function" === typeof importScripts;
    ca = (da = "object" === typeof process && "object" === typeof process.versions && "string" === typeof process.versions.node) && !v && !w;
    ea = !v && !ca && !w;
    var x = "",
        fa,
        ha;

    if (ca) {
      x = __dirname + "/";
      var ia, ja;

      fa = function (a, b) {
        ia || (ia = require("fs"));
        ja || (ja = require("path"));
        a = ja.normalize(a);
        a = ia.readFileSync(a);
        return b ? a : a.toString();
      };

      ha = function (a) {
        a = fa(a, !0);
        a.buffer || (a = new Uint8Array(a));
        a.buffer || y("Assertion failed: undefined");
        return a;
      };

      1 < process.argv.length && (aa = process.argv[1].replace(/\\/g, "/"));
      u = process.argv.slice(2);
      process.on("uncaughtException", function (a) {
        if (!(a instanceof ka)) throw a;
      });
      process.on("unhandledRejection", y);

      ba = function (a) {
        process.exit(a);
      };

      e.inspect = function () {
        return "[Emscripten Module object]";
      };
    } else if (ea) "undefined" != typeof read && (fa = function (a) {
      return read(a);
    }), ha = function (a) {
      if ("function" === typeof readbuffer) return new Uint8Array(readbuffer(a));
      a = read(a, "binary");
      "object" === typeof a || y("Assertion failed: undefined");
      return a;
    }, "undefined" != typeof scriptArgs ? u = scriptArgs : "undefined" != typeof arguments && (u = arguments), "function" === typeof quit && (ba = function (a) {
      quit(a);
    }), "undefined" !== typeof print && ("undefined" === typeof console && (console = {}), console.log = print, console.warn = console.error = "undefined" !== typeof printErr ? printErr : print);else if (v || w) w ? x = self.location.href : document.currentScript && (x = document.currentScript.src), _scriptDir && (x = _scriptDir), 0 !== x.indexOf("blob:") ? x = x.substr(0, x.lastIndexOf("/") + 1) : x = "", fa = function (a) {
      var b = new XMLHttpRequest();
      b.open("GET", a, !1);
      b.send(null);
      return b.responseText;
    }, w && (ha = function (a) {
      var b = new XMLHttpRequest();
      b.open("GET", a, !1);
      b.responseType = "arraybuffer";
      b.send(null);
      return new Uint8Array(b.response);
    });

    var la = e.print || console.log.bind(console),
        z = e.printErr || console.warn.bind(console);

    for (q in m) m.hasOwnProperty(q) && (e[q] = m[q]);

    m = null;
    e.arguments && (u = e.arguments);
    e.thisProgram && (aa = e.thisProgram);
    e.quit && (ba = e.quit);
    var ma;
    e.wasmBinary && (ma = e.wasmBinary);
    var na;
    e.noExitRuntime && (na = e.noExitRuntime);
    "object" !== typeof WebAssembly && z("no native wasm support detected");
    var A,
        oa = new WebAssembly.Table({
      initial: 2327,
      maximum: 2327,
      element: "anyfunc"
    }),
        pa = !1,
        qa = "undefined" !== typeof TextDecoder ? new TextDecoder("utf8") : void 0;

    function ra(a, b, c) {
      var d = b + c;

      for (c = b; a[c] && !(c >= d);) ++c;

      if (16 < c - b && a.subarray && qa) return qa.decode(a.subarray(b, c));

      for (d = ""; b < c;) {
        var f = a[b++];

        if (f & 128) {
          var g = a[b++] & 63;
          if (192 == (f & 224)) d += String.fromCharCode((f & 31) << 6 | g);else {
            var k = a[b++] & 63;
            f = 224 == (f & 240) ? (f & 15) << 12 | g << 6 | k : (f & 7) << 18 | g << 12 | k << 6 | a[b++] & 63;
            65536 > f ? d += String.fromCharCode(f) : (f -= 65536, d += String.fromCharCode(55296 | f >> 10, 56320 | f & 1023));
          }
        } else d += String.fromCharCode(f);
      }

      return d;
    }

    function sa(a) {
      return a ? ra(B, a, void 0) : "";
    }

    function ta(a, b, c, d) {
      if (0 < d) {
        d = c + d - 1;

        for (var f = 0; f < a.length; ++f) {
          var g = a.charCodeAt(f);

          if (55296 <= g && 57343 >= g) {
            var k = a.charCodeAt(++f);
            g = 65536 + ((g & 1023) << 10) | k & 1023;
          }

          if (127 >= g) {
            if (c >= d) break;
            b[c++] = g;
          } else {
            if (2047 >= g) {
              if (c + 1 >= d) break;
              b[c++] = 192 | g >> 6;
            } else {
              if (65535 >= g) {
                if (c + 2 >= d) break;
                b[c++] = 224 | g >> 12;
              } else {
                if (c + 3 >= d) break;
                b[c++] = 240 | g >> 18;
                b[c++] = 128 | g >> 12 & 63;
              }

              b[c++] = 128 | g >> 6 & 63;
            }

            b[c++] = 128 | g & 63;
          }
        }

        b[c] = 0;
      }
    }

    function ua(a) {
      for (var b = 0, c = 0; c < a.length; ++c) {
        var d = a.charCodeAt(c);
        55296 <= d && 57343 >= d && (d = 65536 + ((d & 1023) << 10) | a.charCodeAt(++c) & 1023);
        127 >= d ? ++b : b = 2047 >= d ? b + 2 : 65535 >= d ? b + 3 : b + 4;
      }

      return b;
    }

    "undefined" !== typeof TextDecoder && new TextDecoder("utf-16le");

    function va(a) {
      var b = ua(a) + 1,
          c = wa(b);
      ta(a, C, c, b);
      return c;
    }

    function xa(a) {
      0 < a % 65536 && (a += 65536 - a % 65536);
      return a;
    }

    var buffer, C, B, ya, za, D, E, Aa, Ba;

    function Ca(a) {
      buffer = a;
      e.HEAP8 = C = new Int8Array(a);
      e.HEAP16 = ya = new Int16Array(a);
      e.HEAP32 = D = new Int32Array(a);
      e.HEAPU8 = B = new Uint8Array(a);
      e.HEAPU16 = za = new Uint16Array(a);
      e.HEAPU32 = E = new Uint32Array(a);
      e.HEAPF32 = Aa = new Float32Array(a);
      e.HEAPF64 = Ba = new Float64Array(a);
    }

    var Da = e.TOTAL_MEMORY || 16777216;
    e.wasmMemory ? A = e.wasmMemory : A = new WebAssembly.Memory({
      initial: Da / 65536
    });
    A && (buffer = A.buffer);
    Da = buffer.byteLength;
    Ca(buffer);
    D[25420] = 5344752;

    function Ea(a) {
      for (; 0 < a.length;) {
        var b = a.shift();
        if ("function" == typeof b) b();else {
          var c = b.U;
          "number" === typeof c ? void 0 === b.F ? e.dynCall_v(c) : e.dynCall_vi(c, b.F) : c(void 0 === b.F ? null : b.F);
        }
      }
    }

    var Fa = [],
        Ga = [],
        Ha = [],
        Ia = [],
        Ja = [];

    function Ka() {
      var a = e.preRun.shift();
      Fa.unshift(a);
    }

    var F = 0,
        Ma = null,
        Na = null;
    e.preloadedImages = {};
    e.preloadedAudios = {};

    function y(a) {
      if (e.onAbort) e.onAbort(a);
      la(a);
      z(a);
      pa = !0;
      throw "abort(" + a + "). Build with -s ASSERTIONS=1 for more info.";
    }

    function Oa() {
      var a = G;
      return String.prototype.startsWith ? a.startsWith("data:application/octet-stream;base64,") : 0 === a.indexOf("data:application/octet-stream;base64,");
    }

    var G = "psp.async.wasm";

    if (!Oa()) {
      var Pa = G;
      G = e.locateFile ? e.locateFile(Pa, x) : x + Pa;
    }

    function Qa() {
      try {
        if (ma) return new Uint8Array(ma);
        if (ha) return ha(G);
        throw "both async and sync fetching of the wasm failed";
      } catch (a) {
        y(a);
      }
    }

    function Ra() {
      return ma || !v && !w || "function" !== typeof fetch ? new Promise(function (a) {
        a(Qa());
      }) : fetch(G, {
        credentials: "same-origin"
      }).then(function (a) {
        if (!a.ok) throw "failed to load wasm binary file at '" + G + "'";
        return a.arrayBuffer();
      }).catch(function () {
        return Qa();
      });
    }

    var Sa = [function () {
      throw Error("abort()");
    }, function () {
      if ("undefined" !== typeof self) try {
        if (self.dispatchEvent && !self.M && null !== self.document) {
          self.M = !0;
          var a = self.document.createEvent("Event");
          a.initEvent("perspective-ready", !1, !0);
          self.dispatchEvent(a);
        } else !self.document && self.postMessage && self.postMessage({});
      } catch (b) {}
    }];
    Ga.push({
      U: function () {
        Ta();
      }
    });

    function Ua(a, b) {
      Ia.unshift({
        U: a,
        F: b
      });
    }

    function Va(a) {
      e.___errno_location && (D[e.___errno_location() >> 2] = a);
    }

    var Wa = [null, [], []],
        H = 0;

    function I() {
      H += 4;
      return D[H - 4 >> 2];
    }

    var K = {},
        Xa = {};

    function Ya() {
      if (!Za) {
        var a = {
          USER: "web_user",
          LOGNAME: "web_user",
          PATH: "/",
          PWD: "/",
          HOME: "/home/web_user",
          LANG: ("object" === typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8",
          _: aa
        },
            b;

        for (b in Xa) a[b] = Xa[b];

        var c = [];

        for (b in a) c.push(b + "=" + a[b]);

        Za = c;
      }

      return Za;
    }

    var Za;

    function $a(a, b) {
      var c = 0;
      Ya().forEach(function (d, f) {
        var g = b + c;
        f = D[a + 4 * f >> 2] = g;

        for (g = 0; g < d.length; ++g) C[f++ >> 0] = d.charCodeAt(g);

        C[f >> 0] = 0;
        c += d.length + 1;
      });
      return 0;
    }

    function ab(a, b) {
      var c = Ya();
      D[a >> 2] = c.length;
      var d = 0;
      c.forEach(function (a) {
        d += a.length + 1;
      });
      D[b >> 2] = d;
      return 0;
    }

    function bb() {
      return 0;
    }

    function cb(a, b, c, d) {
      try {
        var f = K.ya(a),
            g = K.wa(f, b, c);
        D[d >> 2] = g;
        return 0;
      } catch (k) {
        return y(k), k.v;
      }
    }

    function db() {
      return 0;
    }

    function eb(a, b, c, d) {
      try {
        for (var f = 0, g = 0; g < c; g++) {
          for (var k = D[b + 8 * g >> 2], h = D[b + (8 * g + 4) >> 2], p = 0; p < h; p++) {
            var l = B[k + p],
                n = Wa[a];
            0 === l || 10 === l ? ((1 === a ? la : z)(ra(n, 0)), n.length = 0) : n.push(l);
          }

          f += h;
        }

        D[d >> 2] = f;
        return 0;
      } catch (t) {
        return y(t), t.v;
      }
    }

    var fb = {};

    function gb(a) {
      for (; a.length;) {
        var b = a.pop();
        a.pop()(b);
      }
    }

    function hb(a) {
      return this.fromWireType(E[a >> 2]);
    }

    var L = {},
        M = {},
        ib = {};

    function jb(a) {
      if (void 0 === a) return "_unknown";
      a = a.replace(/[^a-zA-Z0-9_]/g, "$");
      var b = a.charCodeAt(0);
      return 48 <= b && 57 >= b ? "_" + a : a;
    }

    function kb(a, b) {
      a = jb(a);
      return new Function("body", "return function " + a + '() {\n    "use strict";    return body.apply(this, arguments);\n};\n')(b);
    }

    function lb(a) {
      var b = Error,
          c = kb(a, function (b) {
        this.name = a;
        this.message = b;
        b = Error(b).stack;
        void 0 !== b && (this.stack = this.toString() + "\n" + b.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      c.prototype = Object.create(b.prototype);
      c.prototype.constructor = c;

      c.prototype.toString = function () {
        return void 0 === this.message ? this.name : this.name + ": " + this.message;
      };

      return c;
    }

    var mb = void 0;

    function nb(a) {
      throw new mb(a);
    }

    function N(a, b, c) {
      function d(b) {
        b = c(b);
        b.length !== a.length && nb("Mismatched type converter count");

        for (var d = 0; d < a.length; ++d) O(a[d], b[d]);
      }

      a.forEach(function (a) {
        ib[a] = b;
      });
      var f = Array(b.length),
          g = [],
          k = 0;
      b.forEach(function (a, b) {
        M.hasOwnProperty(a) ? f[b] = M[a] : (g.push(a), L.hasOwnProperty(a) || (L[a] = []), L[a].push(function () {
          f[b] = M[a];
          ++k;
          k === g.length && d(f);
        }));
      });
      0 === g.length && d(f);
    }

    function ob(a) {
      switch (a) {
        case 1:
          return 0;

        case 2:
          return 1;

        case 4:
          return 2;

        case 8:
          return 3;

        default:
          throw new TypeError("Unknown type size: " + a);
      }
    }

    var pb = void 0;

    function P(a) {
      for (var b = ""; B[a];) b += pb[B[a++]];

      return b;
    }

    var Q = void 0;

    function R(a) {
      throw new Q(a);
    }

    function O(a, b, c) {
      c = c || {};
      if (!("argPackAdvance" in b)) throw new TypeError("registerType registeredInstance requires argPackAdvance");
      var d = b.name;
      a || R('type "' + d + '" must have a positive integer typeid pointer');

      if (M.hasOwnProperty(a)) {
        if (c.ga) return;
        R("Cannot register type '" + d + "' twice");
      }

      M[a] = b;
      delete ib[a];
      L.hasOwnProperty(a) && (b = L[a], delete L[a], b.forEach(function (a) {
        a();
      }));
    }

    function qb(a) {
      return {
        count: a.count,
        u: a.u,
        B: a.B,
        c: a.c,
        f: a.f,
        i: a.i,
        l: a.l
      };
    }

    function rb(a) {
      R(a.a.f.b.name + " instance already deleted");
    }

    var sb = !1;

    function tb() {}

    function ub(a) {
      --a.count.value;
      0 === a.count.value && (a.i ? a.l.o(a.i) : a.f.b.o(a.c));
    }

    function vb(a) {
      if ("undefined" === typeof FinalizationGroup) return vb = function (a) {
        return a;
      }, a;
      sb = new FinalizationGroup(function (a) {
        for (var b = a.next(); !b.done; b = a.next()) b = b.value, b.c ? ub(b) : console.warn("object already deleted: " + b.c);
      });

      vb = function (a) {
        sb.register(a, a.a, a.a);
        return a;
      };

      tb = function (a) {
        sb.unregister(a.a);
      };

      return vb(a);
    }

    var wb = void 0,
        xb = [];

    function yb() {
      for (; xb.length;) {
        var a = xb.pop();
        a.a.u = !1;
        a["delete"]();
      }
    }

    function S() {}

    var zb = {};

    function Ab(a, b, c) {
      if (void 0 === a[b].g) {
        var d = a[b];

        a[b] = function () {
          a[b].g.hasOwnProperty(arguments.length) || R("Function '" + c + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + a[b].g + ")!");
          return a[b].g[arguments.length].apply(this, arguments);
        };

        a[b].g = [];
        a[b].g[d.G] = d;
      }
    }

    function Bb(a, b, c) {
      e.hasOwnProperty(a) ? ((void 0 === c || void 0 !== e[a].g && void 0 !== e[a].g[c]) && R("Cannot register public name '" + a + "' twice"), Ab(e, a, a), e.hasOwnProperty(c) && R("Cannot register multiple overloads of a function with the same number of arguments (" + c + ")!"), e[a].g[c] = b) : (e[a] = b, void 0 !== c && (e[a].Ba = c));
    }

    function Cb(a, b, c, d, f, g, k, h) {
      this.name = a;
      this.constructor = b;
      this.w = c;
      this.o = d;
      this.m = f;
      this.$ = g;
      this.D = k;
      this.Y = h;
      this.la = [];
    }

    function Db(a, b, c) {
      for (; b !== c;) b.D || R("Expected null or instance of " + c.name + ", got an instance of " + b.name), a = b.D(a), b = b.m;

      return a;
    }

    function Eb(a, b) {
      if (null === b) return this.N && R("null is not a valid " + this.name), 0;
      b.a || R('Cannot pass "' + T(b) + '" as a ' + this.name);
      b.a.c || R("Cannot pass deleted object as a pointer of type " + this.name);
      return Db(b.a.c, b.a.f.b, this.b);
    }

    function Fb(a, b) {
      if (null === b) {
        this.N && R("null is not a valid " + this.name);

        if (this.I) {
          var c = this.O();
          null !== a && a.push(this.o, c);
          return c;
        }

        return 0;
      }

      b.a || R('Cannot pass "' + T(b) + '" as a ' + this.name);
      b.a.c || R("Cannot pass deleted object as a pointer of type " + this.name);
      !this.H && b.a.f.H && R("Cannot convert argument of type " + (b.a.l ? b.a.l.name : b.a.f.name) + " to parameter type " + this.name);
      c = Db(b.a.c, b.a.f.b, this.b);
      if (this.I) switch (void 0 === b.a.i && R("Passing raw pointer to smart pointer is illegal"), this.qa) {
        case 0:
          b.a.l === this ? c = b.a.i : R("Cannot convert argument of type " + (b.a.l ? b.a.l.name : b.a.f.name) + " to parameter type " + this.name);
          break;

        case 1:
          c = b.a.i;
          break;

        case 2:
          if (b.a.l === this) c = b.a.i;else {
            var d = b.clone();
            c = this.ma(c, U(function () {
              d["delete"]();
            }));
            null !== a && a.push(this.o, c);
          }
          break;

        default:
          R("Unsupporting sharing policy");
      }
      return c;
    }

    function Gb(a, b) {
      if (null === b) return this.N && R("null is not a valid " + this.name), 0;
      b.a || R('Cannot pass "' + T(b) + '" as a ' + this.name);
      b.a.c || R("Cannot pass deleted object as a pointer of type " + this.name);
      b.a.f.H && R("Cannot convert argument of type " + b.a.f.name + " to parameter type " + this.name);
      return Db(b.a.c, b.a.f.b, this.b);
    }

    function Hb(a, b, c) {
      if (b === c) return a;
      if (void 0 === c.m) return null;
      a = Hb(a, b, c.m);
      return null === a ? null : c.Y(a);
    }

    var Ib = {};

    function Jb(a, b) {
      for (void 0 === b && R("ptr should not be undefined"); a.m;) b = a.D(b), a = a.m;

      return Ib[b];
    }

    function Kb(a, b) {
      b.f && b.c || nb("makeClassHandle requires ptr and ptrType");
      !!b.l !== !!b.i && nb("Both smartPtrType and smartPtr must be specified");
      b.count = {
        value: 1
      };
      return vb(Object.create(a, {
        a: {
          value: b
        }
      }));
    }

    function V(a, b, c, d, f, g, k, h, p, l, n) {
      this.name = a;
      this.b = b;
      this.N = c;
      this.H = d;
      this.I = f;
      this.ka = g;
      this.qa = k;
      this.W = h;
      this.O = p;
      this.ma = l;
      this.o = n;
      f || void 0 !== b.m ? this.toWireType = Fb : (this.toWireType = d ? Eb : Gb, this.j = null);
    }

    function Lb(a, b, c) {
      e.hasOwnProperty(a) || nb("Replacing nonexistant public symbol");
      void 0 !== e[a].g && void 0 !== c ? e[a].g[c] = b : (e[a] = b, e[a].G = c);
    }

    function W(a, b) {
      a = P(a);
      if (void 0 !== e["FUNCTION_TABLE_" + a]) var c = e["FUNCTION_TABLE_" + a][b];else if ("undefined" !== typeof FUNCTION_TABLE) c = FUNCTION_TABLE[b];else {
        c = e["dynCall_" + a];
        void 0 === c && (c = e["dynCall_" + a.replace(/f/g, "d")], void 0 === c && R("No dynCall invoker for signature: " + a));

        for (var d = [], f = 1; f < a.length; ++f) d.push("a" + f);

        f = "return function " + ("dynCall_" + a + "_" + b) + "(" + d.join(", ") + ") {\n";
        f += "    return dynCall(rawFunction" + (d.length ? ", " : "") + d.join(", ") + ");\n";
        c = new Function("dynCall", "rawFunction", f + "};\n")(c, b);
      }
      "function" !== typeof c && R("unknown function pointer with signature " + a + ": " + b);
      return c;
    }

    var Mb = void 0;

    function Nb(a) {
      a = Ob(a);
      var b = P(a);
      X(a);
      return b;
    }

    function Rb(a, b) {
      function c(a) {
        f[a] || M[a] || (ib[a] ? ib[a].forEach(c) : (d.push(a), f[a] = !0));
      }

      var d = [],
          f = {};
      b.forEach(c);
      throw new Mb(a + ": " + d.map(Nb).join([", "]));
    }

    function Sb(a, b) {
      for (var c = [], d = 0; d < a; d++) c.push(D[(b >> 2) + d]);

      return c;
    }

    function Tb(a) {
      var b = Function;
      if (!(b instanceof Function)) throw new TypeError("new_ called with constructor type " + typeof b + " which is not a function");
      var c = kb(b.name || "unknownFunctionName", function () {});
      c.prototype = b.prototype;
      c = new c();
      a = b.apply(c, a);
      return a instanceof Object ? a : c;
    }

    function Ub(a, b, c, d, f) {
      var g = b.length;
      2 > g && R("argTypes array size mismatch! Must at least get return value and 'this' types!");
      var k = null !== b[1] && null !== c,
          h = !1;

      for (c = 1; c < b.length; ++c) if (null !== b[c] && void 0 === b[c].j) {
        h = !0;
        break;
      }

      var p = "void" !== b[0].name,
          l = "",
          n = "";

      for (c = 0; c < g - 2; ++c) l += (0 !== c ? ", " : "") + "arg" + c, n += (0 !== c ? ", " : "") + "arg" + c + "Wired";

      a = "return function " + jb(a) + "(" + l + ") {\nif (arguments.length !== " + (g - 2) + ") {\nthrowBindingError('function " + a + " called with ' + arguments.length + ' arguments, expected " + (g - 2) + " args!');\n}\n";
      h && (a += "var destructors = [];\n");
      var t = h ? "destructors" : "null";
      l = "throwBindingError invoker fn runDestructors retType classParam".split(" ");
      d = [R, d, f, gb, b[0], b[1]];
      k && (a += "var thisWired = classParam.toWireType(" + t + ", this);\n");

      for (c = 0; c < g - 2; ++c) a += "var arg" + c + "Wired = argType" + c + ".toWireType(" + t + ", arg" + c + "); // " + b[c + 2].name + "\n", l.push("argType" + c), d.push(b[c + 2]);

      k && (n = "thisWired" + (0 < n.length ? ", " : "") + n);
      a += (p ? "var rv = " : "") + "invoker(fn" + (0 < n.length ? ", " : "") + n + ");\n";
      if (h) a += "runDestructors(destructors);\n";else for (c = k ? 1 : 2; c < b.length; ++c) g = 1 === c ? "thisWired" : "arg" + (c - 2) + "Wired", null !== b[c].j && (a += g + "_dtor(" + g + "); // " + b[c].name + "\n", l.push(g + "_dtor"), d.push(b[c].j));
      p && (a += "var ret = retType.fromWireType(rv);\nreturn ret;\n");
      l.push(a + "}\n");
      return Tb(l).apply(null, d);
    }

    var Vb = [],
        Y = [{}, {
      value: void 0
    }, {
      value: null
    }, {
      value: !0
    }, {
      value: !1
    }];

    function Wb(a) {
      4 < a && 0 === --Y[a].P && (Y[a] = void 0, Vb.push(a));
    }

    function U(a) {
      switch (a) {
        case void 0:
          return 1;

        case null:
          return 2;

        case !0:
          return 3;

        case !1:
          return 4;

        default:
          var b = Vb.length ? Vb.pop() : Y.length;
          Y[b] = {
            P: 1,
            value: a
          };
          return b;
      }
    }

    function Xb(a, b, c) {
      switch (b) {
        case 0:
          return function (a) {
            return this.fromWireType((c ? C : B)[a]);
          };

        case 1:
          return function (a) {
            return this.fromWireType((c ? ya : za)[a >> 1]);
          };

        case 2:
          return function (a) {
            return this.fromWireType((c ? D : E)[a >> 2]);
          };

        default:
          throw new TypeError("Unknown integer type: " + a);
      }
    }

    function Yb(a, b) {
      var c = M[a];
      void 0 === c && R(b + " has unknown type " + Nb(a));
      return c;
    }

    function T(a) {
      if (null === a) return "null";
      var b = typeof a;
      return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;
    }

    function Zb(a, b) {
      switch (b) {
        case 2:
          return function (a) {
            return this.fromWireType(Aa[a >> 2]);
          };

        case 3:
          return function (a) {
            return this.fromWireType(Ba[a >> 3]);
          };

        default:
          throw new TypeError("Unknown float type: " + a);
      }
    }

    function $b(a, b, c) {
      switch (b) {
        case 0:
          return c ? function (a) {
            return C[a];
          } : function (a) {
            return B[a];
          };

        case 1:
          return c ? function (a) {
            return ya[a >> 1];
          } : function (a) {
            return za[a >> 1];
          };

        case 2:
          return c ? function (a) {
            return D[a >> 2];
          } : function (a) {
            return E[a >> 2];
          };

        default:
          throw new TypeError("Unknown integer type: " + a);
      }
    }

    function Z(a) {
      a || R("Cannot use deleted val. handle = " + a);
      return Y[a].value;
    }

    function ac(a, b) {
      for (var c = Array(a), d = 0; d < a; ++d) c[d] = Yb(D[(b >> 2) + d], "parameter " + d);

      return c;
    }

    var bc = {};

    function cc(a) {
      var b = bc[a];
      return void 0 === b ? P(a) : b;
    }

    var dc = [];

    function ec() {
      return "object" === typeof globalThis ? globalThis : Function("return this")();
    }

    function fc(a) {
      var b = dc.length;
      dc.push(a);
      return b;
    }

    var hc = {};

    function ic() {
      y();
    }

    function jc(a) {
      return 0 === a % 4 && (0 !== a % 100 || 0 === a % 400);
    }

    function kc(a, b) {
      for (var c = 0, d = 0; d <= b; c += a[d++]);

      return c;
    }

    var lc = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        mc = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    function nc(a, b) {
      for (a = new Date(a.getTime()); 0 < b;) {
        var c = a.getMonth(),
            d = (jc(a.getFullYear()) ? lc : mc)[c];
        if (b > d - a.getDate()) b -= d - a.getDate() + 1, a.setDate(1), 11 > c ? a.setMonth(c + 1) : (a.setMonth(0), a.setFullYear(a.getFullYear() + 1));else {
          a.setDate(a.getDate() + b);
          break;
        }
      }

      return a;
    }

    function oc(a, b, c, d) {
      function f(a, b, c) {
        for (a = "number" === typeof a ? a.toString() : a || ""; a.length < b;) a = c[0] + a;

        return a;
      }

      function g(a, b) {
        return f(a, b, "0");
      }

      function k(a, b) {
        function c(a) {
          return 0 > a ? -1 : 0 < a ? 1 : 0;
        }

        var d;
        0 === (d = c(a.getFullYear() - b.getFullYear())) && 0 === (d = c(a.getMonth() - b.getMonth())) && (d = c(a.getDate() - b.getDate()));
        return d;
      }

      function h(a) {
        switch (a.getDay()) {
          case 0:
            return new Date(a.getFullYear() - 1, 11, 29);

          case 1:
            return a;

          case 2:
            return new Date(a.getFullYear(), 0, 3);

          case 3:
            return new Date(a.getFullYear(), 0, 2);

          case 4:
            return new Date(a.getFullYear(), 0, 1);

          case 5:
            return new Date(a.getFullYear() - 1, 11, 31);

          case 6:
            return new Date(a.getFullYear() - 1, 11, 30);
        }
      }

      function p(a) {
        a = nc(new Date(a.h + 1900, 0, 1), a.L);
        var b = h(new Date(a.getFullYear() + 1, 0, 4));
        return 0 >= k(h(new Date(a.getFullYear(), 0, 4)), a) ? 0 >= k(b, a) ? a.getFullYear() + 1 : a.getFullYear() : a.getFullYear() - 1;
      }

      var l = D[d + 40 >> 2];
      d = {
        ta: D[d >> 2],
        sa: D[d + 4 >> 2],
        J: D[d + 8 >> 2],
        C: D[d + 12 >> 2],
        A: D[d + 16 >> 2],
        h: D[d + 20 >> 2],
        K: D[d + 24 >> 2],
        L: D[d + 28 >> 2],
        Ca: D[d + 32 >> 2],
        ra: D[d + 36 >> 2],
        ua: l ? sa(l) : ""
      };
      c = sa(c);
      l = {
        "%c": "%a %b %d %H:%M:%S %Y",
        "%D": "%m/%d/%y",
        "%F": "%Y-%m-%d",
        "%h": "%b",
        "%r": "%I:%M:%S %p",
        "%R": "%H:%M",
        "%T": "%H:%M:%S",
        "%x": "%m/%d/%y",
        "%X": "%H:%M:%S",
        "%Ec": "%c",
        "%EC": "%C",
        "%Ex": "%m/%d/%y",
        "%EX": "%H:%M:%S",
        "%Ey": "%y",
        "%EY": "%Y",
        "%Od": "%d",
        "%Oe": "%e",
        "%OH": "%H",
        "%OI": "%I",
        "%Om": "%m",
        "%OM": "%M",
        "%OS": "%S",
        "%Ou": "%u",
        "%OU": "%U",
        "%OV": "%V",
        "%Ow": "%w",
        "%OW": "%W",
        "%Oy": "%y"
      };

      for (var n in l) c = c.replace(new RegExp(n, "g"), l[n]);

      var t = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),
          J = "January February March April May June July August September October November December".split(" ");
      l = {
        "%a": function (a) {
          return t[a.K].substring(0, 3);
        },
        "%A": function (a) {
          return t[a.K];
        },
        "%b": function (a) {
          return J[a.A].substring(0, 3);
        },
        "%B": function (a) {
          return J[a.A];
        },
        "%C": function (a) {
          return g((a.h + 1900) / 100 | 0, 2);
        },
        "%d": function (a) {
          return g(a.C, 2);
        },
        "%e": function (a) {
          return f(a.C, 2, " ");
        },
        "%g": function (a) {
          return p(a).toString().substring(2);
        },
        "%G": function (a) {
          return p(a);
        },
        "%H": function (a) {
          return g(a.J, 2);
        },
        "%I": function (a) {
          a = a.J;
          0 == a ? a = 12 : 12 < a && (a -= 12);
          return g(a, 2);
        },
        "%j": function (a) {
          return g(a.C + kc(jc(a.h + 1900) ? lc : mc, a.A - 1), 3);
        },
        "%m": function (a) {
          return g(a.A + 1, 2);
        },
        "%M": function (a) {
          return g(a.sa, 2);
        },
        "%n": function () {
          return "\n";
        },
        "%p": function (a) {
          return 0 <= a.J && 12 > a.J ? "AM" : "PM";
        },
        "%S": function (a) {
          return g(a.ta, 2);
        },
        "%t": function () {
          return "\t";
        },
        "%u": function (a) {
          return a.K || 7;
        },
        "%U": function (a) {
          var b = new Date(a.h + 1900, 0, 1),
              c = 0 === b.getDay() ? b : nc(b, 7 - b.getDay());
          a = new Date(a.h + 1900, a.A, a.C);
          return 0 > k(c, a) ? g(Math.ceil((31 - c.getDate() + (kc(jc(a.getFullYear()) ? lc : mc, a.getMonth() - 1) - 31) + a.getDate()) / 7), 2) : 0 === k(c, b) ? "01" : "00";
        },
        "%V": function (a) {
          var b = h(new Date(a.h + 1900, 0, 4)),
              c = h(new Date(a.h + 1901, 0, 4)),
              d = nc(new Date(a.h + 1900, 0, 1), a.L);
          return 0 > k(d, b) ? "53" : 0 >= k(c, d) ? "01" : g(Math.ceil((b.getFullYear() < a.h + 1900 ? a.L + 32 - b.getDate() : a.L + 1 - b.getDate()) / 7), 2);
        },
        "%w": function (a) {
          return a.K;
        },
        "%W": function (a) {
          var b = new Date(a.h, 0, 1),
              c = 1 === b.getDay() ? b : nc(b, 0 === b.getDay() ? 1 : 7 - b.getDay() + 1);
          a = new Date(a.h + 1900, a.A, a.C);
          return 0 > k(c, a) ? g(Math.ceil((31 - c.getDate() + (kc(jc(a.getFullYear()) ? lc : mc, a.getMonth() - 1) - 31) + a.getDate()) / 7), 2) : 0 === k(c, b) ? "01" : "00";
        },
        "%y": function (a) {
          return (a.h + 1900).toString().substring(2);
        },
        "%Y": function (a) {
          return a.h + 1900;
        },
        "%z": function (a) {
          a = a.ra;
          var b = 0 <= a;
          a = Math.abs(a) / 60;
          return (b ? "+" : "-") + String("0000" + (a / 60 * 100 + a % 60)).slice(-4);
        },
        "%Z": function (a) {
          return a.ua;
        },
        "%%": function () {
          return "%";
        }
      };

      for (n in l) 0 <= c.indexOf(n) && (c = c.replace(new RegExp(n, "g"), l[n](d)));

      n = pc(c);
      if (n.length > b) return 0;
      C.set(n, a);
      return n.length - 1;
    }

    mb = e.InternalError = lb("InternalError");

    for (var qc = Array(256), rc = 0; 256 > rc; ++rc) qc[rc] = String.fromCharCode(rc);

    pb = qc;
    Q = e.BindingError = lb("BindingError");

    S.prototype.isAliasOf = function (a) {
      if (!(this instanceof S && a instanceof S)) return !1;
      var b = this.a.f.b,
          c = this.a.c,
          d = a.a.f.b;

      for (a = a.a.c; b.m;) c = b.D(c), b = b.m;

      for (; d.m;) a = d.D(a), d = d.m;

      return b === d && c === a;
    };

    S.prototype.clone = function () {
      this.a.c || rb(this);
      if (this.a.B) return this.a.count.value += 1, this;
      var a = vb(Object.create(Object.getPrototypeOf(this), {
        a: {
          value: qb(this.a)
        }
      }));
      a.a.count.value += 1;
      a.a.u = !1;
      return a;
    };

    S.prototype["delete"] = function () {
      this.a.c || rb(this);
      this.a.u && !this.a.B && R("Object already scheduled for deletion");
      tb(this);
      ub(this.a);
      this.a.B || (this.a.i = void 0, this.a.c = void 0);
    };

    S.prototype.isDeleted = function () {
      return !this.a.c;
    };

    S.prototype.deleteLater = function () {
      this.a.c || rb(this);
      this.a.u && !this.a.B && R("Object already scheduled for deletion");
      xb.push(this);
      1 === xb.length && wb && wb(yb);
      this.a.u = !0;
      return this;
    };

    V.prototype.aa = function (a) {
      this.W && (a = this.W(a));
      return a;
    };

    V.prototype.S = function (a) {
      this.o && this.o(a);
    };

    V.prototype.argPackAdvance = 8;
    V.prototype.readValueFromPointer = hb;

    V.prototype.deleteObject = function (a) {
      if (null !== a) a["delete"]();
    };

    V.prototype.fromWireType = function (a) {
      function b() {
        return this.I ? Kb(this.b.w, {
          f: this.ka,
          c: c,
          l: this,
          i: a
        }) : Kb(this.b.w, {
          f: this,
          c: a
        });
      }

      var c = this.aa(a);
      if (!c) return this.S(a), null;
      var d = Jb(this.b, c);

      if (void 0 !== d) {
        if (0 === d.a.count.value) return d.a.c = c, d.a.i = a, d.clone();
        d = d.clone();
        this.S(a);
        return d;
      }

      d = this.b.$(c);
      d = zb[d];
      if (!d) return b.call(this);
      d = this.H ? d.X : d.pointerType;
      var f = Hb(c, this.b, d.b);
      return null === f ? b.call(this) : this.I ? Kb(d.b.w, {
        f: d,
        c: f,
        l: this,
        i: a
      }) : Kb(d.b.w, {
        f: d,
        c: f
      });
    };

    e.getInheritedInstanceCount = function () {
      return Object.keys(Ib).length;
    };

    e.getLiveInheritedInstances = function () {
      var a = [],
          b;

      for (b in Ib) Ib.hasOwnProperty(b) && a.push(Ib[b]);

      return a;
    };

    e.flushPendingDeletes = yb;

    e.setDelayFunction = function (a) {
      wb = a;
      xb.length && wb && wb(yb);
    };

    Mb = e.UnboundTypeError = lb("UnboundTypeError");

    e.count_emval_handles = function () {
      for (var a = 0, b = 5; b < Y.length; ++b) void 0 !== Y[b] && ++a;

      return a;
    };

    e.get_first_emval = function () {
      for (var a = 5; a < Y.length; ++a) if (void 0 !== Y[a]) return Y[a];

      return null;
    };

    ca ? ic = function () {
      var a = process.hrtime();
      return 1E3 * a[0] + a[1] / 1E6;
    } : "undefined" !== typeof dateNow ? ic = dateNow : "object" === typeof performance && performance && "function" === typeof performance.now ? ic = function () {
      return performance.now();
    } : ic = Date.now;

    function pc(a) {
      var b = Array(ua(a) + 1);
      ta(a, b, 0, b.length);
      return b;
    }

    var vc = {
      __cxa_allocate_exception: function (a) {
        return sc(a);
      },
      __cxa_atexit: function () {
        return Ua.apply(null, arguments);
      },
      __cxa_throw: function (a) {
        "uncaught_exception" in tc ? tc.M++ : tc.M = 1;
        throw a;
      },
      __lock: function () {},
      __map_file: function () {
        Va(63);
        return -1;
      },
      __syscall10: function (a, b) {
        H = b;

        try {
          var c = sa(I());
          (void 0).unlink(c);
          return 0;
        } catch (d) {
          return y(d), -d.v;
        }
      },
      __syscall163: function (a, b) {
        H = b;
        return -48;
      },
      __syscall192: function (a, b) {
        H = b;

        try {
          var c = I(),
              d = I(),
              f = I(),
              g = I(),
              k = I();

          a: {
            var h = I();
            h <<= 12;
            a = !1;
            if (0 !== (g & 16) && 0 !== c % 16384) var p = -28;else {
              if (0 !== (g & 32)) {
                var l = uc(16384, d);

                if (!l) {
                  p = -48;
                  break a;
                }

                c = l;
                f = d;
                h = 0;
                c |= 0;
                f |= 0;
                var n;
                var t = c + f | 0;
                h = (h | 0) & 255;

                if (67 <= (f | 0)) {
                  for (; 0 != (c & 3);) C[c >> 0] = h, c = c + 1 | 0;

                  var J = t & -4 | 0;
                  var r = h | h << 8 | h << 16 | h << 24;

                  for (n = J - 64 | 0; (c | 0) <= (n | 0);) D[c >> 2] = r, D[c + 4 >> 2] = r, D[c + 8 >> 2] = r, D[c + 12 >> 2] = r, D[c + 16 >> 2] = r, D[c + 20 >> 2] = r, D[c + 24 >> 2] = r, D[c + 28 >> 2] = r, D[c + 32 >> 2] = r, D[c + 36 >> 2] = r, D[c + 40 >> 2] = r, D[c + 44 >> 2] = r, D[c + 48 >> 2] = r, D[c + 52 >> 2] = r, D[c + 56 >> 2] = r, D[c + 60 >> 2] = r, c = c + 64 | 0;

                  for (; (c | 0) < (J | 0);) D[c >> 2] = r, c = c + 4 | 0;
                }

                for (; (c | 0) < (t | 0);) C[c >> 0] = h, c = c + 1 | 0;

                a = !0;
              } else {
                var Pb = (void 0).ba(k);

                if (!Pb) {
                  p = -8;
                  break a;
                }

                var La = (void 0).za(Pb, B, c, d, h, f, g);
                l = La.c;
                a = La.R;
              }

              K.V[l] = {
                ja: l,
                ia: d,
                R: a,
                fd: k,
                flags: g
              };
              p = l;
            }
          }

          return p;
        } catch (Qb) {
          return y(Qb), -Qb.v;
        }
      },
      __syscall194: function (a, b) {
        H = b;

        try {
          var c = I();
          I();
          var d = I();
          I();
          (void 0).xa(c, d);
          return 0;
        } catch (f) {
          return y(f), -f.v;
        }
      },
      __syscall221: function (a, b) {
        H = b;
        return 0;
      },
      __syscall5: function (a, b) {
        H = b;

        try {
          var c = sa(I()),
              d = I(),
              f = I();
          return (void 0).open(c, d, f).fd;
        } catch (g) {
          return y(g), -g.v;
        }
      },
      __syscall54: function (a, b) {
        H = b;
        return 0;
      },
      __syscall91: function (a, b) {
        H = b;

        try {
          var c = I();
          var d = I();
          if (-1 === c || 0 === d) var f = -28;else {
            var g = K.V[c];

            if (g && d === g.ia) {
              var k = (void 0).ba(g.fd);
              K.va(c, k, d, g.flags);
              (void 0).Aa(k);
              K.V[c] = null;
              g.R && X(g.ja);
            }

            f = 0;
          }
          return f;
        } catch (h) {
          return y(h), -h.v;
        }
      },
      __unlock: function () {},
      __wasi_environ_get: function () {
        return $a.apply(null, arguments);
      },
      __wasi_environ_sizes_get: function () {
        return ab.apply(null, arguments);
      },
      __wasi_fd_close: function () {
        return bb.apply(null, arguments);
      },
      __wasi_fd_read: function () {
        return cb.apply(null, arguments);
      },
      __wasi_fd_seek: function () {
        return db.apply(null, arguments);
      },
      __wasi_fd_write: function () {
        return eb.apply(null, arguments);
      },
      _embind_finalize_value_object: function (a) {
        var b = fb[a];
        delete fb[a];
        var c = b.O,
            d = b.o,
            f = b.T,
            g = f.map(function (a) {
          return a.fa;
        }).concat(f.map(function (a) {
          return a.oa;
        }));
        N([a], g, function (a) {
          var g = {};
          f.forEach(function (b, c) {
            var d = a[c],
                h = b.da,
                k = b.ea,
                l = a[c + f.length],
                p = b.na,
                La = b.pa;
            g[b.Z] = {
              read: function (a) {
                return d.fromWireType(h(k, a));
              },
              write: function (a, b) {
                var c = [];
                p(La, a, l.toWireType(c, b));
                gb(c);
              }
            };
          });
          return [{
            name: b.name,
            fromWireType: function (a) {
              var b = {},
                  c;

              for (c in g) b[c] = g[c].read(a);

              d(a);
              return b;
            },
            toWireType: function (a, b) {
              for (var f in g) if (!(f in b)) throw new TypeError("Missing field");

              var h = c();

              for (f in g) g[f].write(h, b[f]);

              null !== a && a.push(d, h);
              return h;
            },
            argPackAdvance: 8,
            readValueFromPointer: hb,
            j: d
          }];
        });
      },
      _embind_register_bool: function (a, b, c, d, f) {
        var g = ob(c);
        b = P(b);
        O(a, {
          name: b,
          fromWireType: function (a) {
            return !!a;
          },
          toWireType: function (a, b) {
            return b ? d : f;
          },
          argPackAdvance: 8,
          readValueFromPointer: function (a) {
            if (1 === c) var d = C;else if (2 === c) d = ya;else if (4 === c) d = D;else throw new TypeError("Unknown boolean type size: " + b);
            return this.fromWireType(d[a >> g]);
          },
          j: null
        });
      },
      _embind_register_class: function (a, b, c, d, f, g, k, h, p, l, n, t, J) {
        n = P(n);
        g = W(f, g);
        h && (h = W(k, h));
        l && (l = W(p, l));
        J = W(t, J);
        var r = jb(n);
        Bb(r, function () {
          Rb("Cannot construct " + n + " due to unbound types", [d]);
        });
        N([a, b, c], d ? [d] : [], function (b) {
          b = b[0];

          if (d) {
            var c = b.b;
            var f = c.w;
          } else f = S.prototype;

          b = kb(r, function () {
            if (Object.getPrototypeOf(this) !== k) throw new Q("Use 'new' to construct " + n);
            if (void 0 === p.s) throw new Q(n + " has no accessible constructor");
            var a = p.s[arguments.length];
            if (void 0 === a) throw new Q("Tried to invoke ctor of " + n + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(p.s).toString() + ") parameters instead!");
            return a.apply(this, arguments);
          });
          var k = Object.create(f, {
            constructor: {
              value: b
            }
          });
          b.prototype = k;
          var p = new Cb(n, b, k, J, c, g, h, l);
          c = new V(n, p, !0, !1, !1);
          f = new V(n + "*", p, !1, !1, !1);
          var t = new V(n + " const*", p, !1, !0, !1);
          zb[a] = {
            pointerType: f,
            X: t
          };
          Lb(r, b);
          return [c, f, t];
        });
      },
      _embind_register_class_constructor: function (a, b, c, d, f, g) {
        var k = Sb(b, c);
        f = W(d, f);
        N([], [a], function (a) {
          a = a[0];
          var c = "constructor " + a.name;
          void 0 === a.b.s && (a.b.s = []);
          if (void 0 !== a.b.s[b - 1]) throw new Q("Cannot register multiple constructors with identical number of parameters (" + (b - 1) + ") for class '" + a.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");

          a.b.s[b - 1] = function () {
            Rb("Cannot construct " + a.name + " due to unbound types", k);
          };

          N([], k, function (d) {
            a.b.s[b - 1] = function () {
              arguments.length !== b - 1 && R(c + " called with " + arguments.length + " arguments, expected " + (b - 1));
              var a = [],
                  h = Array(b);
              h[0] = g;

              for (var k = 1; k < b; ++k) h[k] = d[k].toWireType(a, arguments[k - 1]);

              h = f.apply(null, h);
              gb(a);
              return d[0].fromWireType(h);
            };

            return [];
          });
          return [];
        });
      },
      _embind_register_class_function: function (a, b, c, d, f, g, k, h) {
        var p = Sb(c, d);
        b = P(b);
        g = W(f, g);
        N([], [a], function (a) {
          function d() {
            Rb("Cannot call " + f + " due to unbound types", p);
          }

          a = a[0];
          var f = a.name + "." + b;
          h && a.b.la.push(b);
          var l = a.b.w,
              r = l[b];
          void 0 === r || void 0 === r.g && r.className !== a.name && r.G === c - 2 ? (d.G = c - 2, d.className = a.name, l[b] = d) : (Ab(l, b, f), l[b].g[c - 2] = d);
          N([], p, function (d) {
            d = Ub(f, d, a, g, k);
            void 0 === l[b].g ? (d.G = c - 2, l[b] = d) : l[b].g[c - 2] = d;
            return [];
          });
          return [];
        });
      },
      _embind_register_emval: function (a, b) {
        b = P(b);
        O(a, {
          name: b,
          fromWireType: function (a) {
            var b = Y[a].value;
            Wb(a);
            return b;
          },
          toWireType: function (a, b) {
            return U(b);
          },
          argPackAdvance: 8,
          readValueFromPointer: hb,
          j: null
        });
      },
      _embind_register_enum: function (a, b, c, d) {
        function f() {}

        c = ob(c);
        b = P(b);
        f.values = {};
        O(a, {
          name: b,
          constructor: f,
          fromWireType: function (a) {
            return this.constructor.values[a];
          },
          toWireType: function (a, b) {
            return b.value;
          },
          argPackAdvance: 8,
          readValueFromPointer: Xb(b, c, d),
          j: null
        });
        Bb(b, f);
      },
      _embind_register_enum_value: function (a, b, c) {
        var d = Yb(a, "enum");
        b = P(b);
        a = d.constructor;
        d = Object.create(d.constructor.prototype, {
          value: {
            value: c
          },
          constructor: {
            value: kb(d.name + "_" + b, function () {})
          }
        });
        a.values[c] = d;
        a[b] = d;
      },
      _embind_register_float: function (a, b, c) {
        c = ob(c);
        b = P(b);
        O(a, {
          name: b,
          fromWireType: function (a) {
            return a;
          },
          toWireType: function (a, b) {
            if ("number" !== typeof b && "boolean" !== typeof b) throw new TypeError('Cannot convert "' + T(b) + '" to ' + this.name);
            return b;
          },
          argPackAdvance: 8,
          readValueFromPointer: Zb(b, c),
          j: null
        });
      },
      _embind_register_function: function (a, b, c, d, f, g) {
        var k = Sb(b, c);
        a = P(a);
        f = W(d, f);
        Bb(a, function () {
          Rb("Cannot call " + a + " due to unbound types", k);
        }, b - 1);
        N([], k, function (c) {
          c = [c[0], null].concat(c.slice(1));
          Lb(a, Ub(a, c, null, f, g), b - 1);
          return [];
        });
      },
      _embind_register_integer: function (a, b, c, d, f) {
        function g(a) {
          return a;
        }

        b = P(b);
        -1 === f && (f = 4294967295);
        var k = ob(c);

        if (0 === d) {
          var h = 32 - 8 * c;

          g = function (a) {
            return a << h >>> h;
          };
        }

        var p = -1 != b.indexOf("unsigned");
        O(a, {
          name: b,
          fromWireType: g,
          toWireType: function (a, c) {
            if ("number" !== typeof c && "boolean" !== typeof c) throw new TypeError('Cannot convert "' + T(c) + '" to ' + this.name);
            if (c < d || c > f) throw new TypeError('Passing a number "' + T(c) + '" from JS side to C/C++ side to an argument of type "' + b + '", which is outside the valid range [' + d + ", " + f + "]!");
            return p ? c >>> 0 : c | 0;
          },
          argPackAdvance: 8,
          readValueFromPointer: $b(b, k, 0 !== d),
          j: null
        });
      },
      _embind_register_memory_view: function (a, b, c) {
        function d(a) {
          a >>= 2;
          var b = E;
          return new f(b.buffer, b[a + 1], b[a]);
        }

        var f = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array][b];
        c = P(c);
        O(a, {
          name: c,
          fromWireType: d,
          argPackAdvance: 8,
          readValueFromPointer: d
        }, {
          ga: !0
        });
      },
      _embind_register_smart_ptr: function (a, b, c, d, f, g, k, h, p, l, n, t) {
        c = P(c);
        g = W(f, g);
        h = W(k, h);
        l = W(p, l);
        t = W(n, t);
        N([a], [b], function (a) {
          a = a[0];
          return [new V(c, a.b, !1, !1, !0, a, d, g, h, l, t)];
        });
      },
      _embind_register_std_string: function (a, b) {
        b = P(b);
        var c = "std::string" === b;
        O(a, {
          name: b,
          fromWireType: function (a) {
            var b = E[a >> 2];

            if (c) {
              var d = B[a + 4 + b],
                  k = 0;
              0 != d && (k = d, B[a + 4 + b] = 0);
              var h = a + 4;

              for (d = 0; d <= b; ++d) {
                var p = a + 4 + d;

                if (0 == B[p]) {
                  h = sa(h);
                  if (void 0 === l) var l = h;else l += String.fromCharCode(0), l += h;
                  h = p + 1;
                }
              }

              0 != k && (B[a + 4 + b] = k);
            } else {
              l = Array(b);

              for (d = 0; d < b; ++d) l[d] = String.fromCharCode(B[a + 4 + d]);

              l = l.join("");
            }

            X(a);
            return l;
          },
          toWireType: function (a, b) {
            b instanceof ArrayBuffer && (b = new Uint8Array(b));
            var d = "string" === typeof b;
            d || b instanceof Uint8Array || b instanceof Uint8ClampedArray || b instanceof Int8Array || R("Cannot pass non-string to std::string");
            var f = (c && d ? function () {
              return ua(b);
            } : function () {
              return b.length;
            })(),
                h = sc(4 + f + 1);
            E[h >> 2] = f;
            if (c && d) ta(b, B, h + 4, f + 1);else if (d) for (d = 0; d < f; ++d) {
              var p = b.charCodeAt(d);
              255 < p && (X(h), R("String has UTF-16 code units that do not fit in 8 bits"));
              B[h + 4 + d] = p;
            } else for (d = 0; d < f; ++d) B[h + 4 + d] = b[d];
            null !== a && a.push(X, h);
            return h;
          },
          argPackAdvance: 8,
          readValueFromPointer: hb,
          j: function (a) {
            X(a);
          }
        });
      },
      _embind_register_std_wstring: function (a, b, c) {
        c = P(c);

        if (2 === b) {
          var d = function () {
            return za;
          };

          var f = 1;
        } else 4 === b && (d = function () {
          return E;
        }, f = 2);

        O(a, {
          name: c,
          fromWireType: function (a) {
            for (var b = d(), c = E[a >> 2], g = Array(c), l = a + 4 >> f, n = 0; n < c; ++n) g[n] = String.fromCharCode(b[l + n]);

            X(a);
            return g.join("");
          },
          toWireType: function (a, c) {
            var g = c.length,
                k = sc(4 + g * b),
                l = d();
            E[k >> 2] = g;

            for (var n = k + 4 >> f, t = 0; t < g; ++t) l[n + t] = c.charCodeAt(t);

            null !== a && a.push(X, k);
            return k;
          },
          argPackAdvance: 8,
          readValueFromPointer: hb,
          j: function (a) {
            X(a);
          }
        });
      },
      _embind_register_value_object: function (a, b, c, d, f, g) {
        fb[a] = {
          name: P(b),
          O: W(c, d),
          o: W(f, g),
          T: []
        };
      },
      _embind_register_value_object_field: function (a, b, c, d, f, g, k, h, p, l) {
        fb[a].T.push({
          Z: P(b),
          fa: c,
          da: W(d, f),
          ea: g,
          oa: k,
          na: W(h, p),
          pa: l
        });
      },
      _embind_register_void: function (a, b) {
        b = P(b);
        O(a, {
          ha: !0,
          name: b,
          argPackAdvance: 0,
          fromWireType: function () {},
          toWireType: function () {}
        });
      },
      _emval_as: function (a, b, c) {
        a = Z(a);
        b = Yb(b, "emval::as");
        var d = [],
            f = U(d);
        D[c >> 2] = f;
        return b.toWireType(d, a);
      },
      _emval_call: function (a, b, c, d) {
        a = Z(a);
        c = ac(b, c);

        for (var f = Array(b), g = 0; g < b; ++g) {
          var k = c[g];
          f[g] = k.readValueFromPointer(d);
          d += k.argPackAdvance;
        }

        a = a.apply(void 0, f);
        return U(a);
      },
      _emval_call_method: function (a, b, c, d, f) {
        a = dc[a];
        b = Z(b);
        c = cc(c);
        var g = [];
        D[d >> 2] = U(g);
        return a(b, c, g, f);
      },
      _emval_call_void_method: function (a, b, c, d) {
        a = dc[a];
        b = Z(b);
        c = cc(c);
        a(b, c, null, d);
      },
      _emval_decref: Wb,
      _emval_get_global: function (a) {
        if (0 === a) return U(ec());
        a = cc(a);
        return U(ec()[a]);
      },
      _emval_get_method_caller: function (a, b) {
        b = ac(a, b);

        for (var c = b[0], d = c.name + "_$" + b.slice(1).map(function (a) {
          return a.name;
        }).join("_") + "$", f = ["retType"], g = [c], k = "", h = 0; h < a - 1; ++h) k += (0 !== h ? ", " : "") + "arg" + h, f.push("argType" + h), g.push(b[1 + h]);

        d = "return function " + jb("methodCaller_" + d) + "(handle, name, destructors, args) {\n";
        var p = 0;

        for (h = 0; h < a - 1; ++h) d += "    var arg" + h + " = argType" + h + ".readValueFromPointer(args" + (p ? "+" + p : "") + ");\n", p += b[h + 1].argPackAdvance;

        d += "    var rv = handle[name](" + k + ");\n";

        for (h = 0; h < a - 1; ++h) b[h + 1].deleteObject && (d += "    argType" + h + ".deleteObject(arg" + h + ");\n");

        c.ha || (d += "    return retType.toWireType(destructors, rv);\n");
        f.push(d + "};\n");
        a = Tb(f).apply(null, g);
        return fc(a);
      },
      _emval_get_module_property: function (a) {
        a = cc(a);
        return U(e[a]);
      },
      _emval_get_property: function (a, b) {
        a = Z(a);
        b = Z(b);
        return U(a[b]);
      },
      _emval_incref: function (a) {
        4 < a && (Y[a].P += 1);
      },
      _emval_instanceof: function (a, b) {
        a = Z(a);
        b = Z(b);
        return a instanceof b;
      },
      _emval_new: function (a, b, c, d) {
        a = Z(a);
        var f = hc[b];

        if (!f) {
          f = "";

          for (var g = 0; g < b; ++g) f += (0 !== g ? ", " : "") + "arg" + g;

          var k = "return function emval_allocator_" + b + "(constructor, argTypes, args) {\n";

          for (g = 0; g < b; ++g) k += "var argType" + g + " = requireRegisteredType(Module['HEAP32'][(argTypes >> 2) + " + g + '], "parameter ' + g + '");\nvar arg' + g + " = argType" + g + ".readValueFromPointer(args);\nargs += argType" + g + "['argPackAdvance'];\n";

          f = new Function("requireRegisteredType", "Module", "__emval_register", k + ("var obj = new constructor(" + f + ");\nreturn __emval_register(obj);\n}\n"))(Yb, e, U);
          hc[b] = f;
        }

        return f(a, c, d);
      },
      _emval_new_cstring: function (a) {
        return U(cc(a));
      },
      _emval_new_object: function () {
        return U({});
      },
      _emval_run_destructors: function (a) {
        gb(Y[a].value);
        Wb(a);
      },
      _emval_set_property: function (a, b, c) {
        a = Z(a);
        b = Z(b);
        c = Z(c);
        a[b] = c;
      },
      _emval_take_value: function (a, b) {
        a = Yb(a, "_emval_take_value");
        a = a.readValueFromPointer(b);
        return U(a);
      },
      _emval_typeof: function (a) {
        a = Z(a);
        return U(typeof a);
      },
      abort: function () {
        y();
      },
      clock_gettime: function (a, b) {
        if (0 === a) a = Date.now();else if (1 === a && (ca || "undefined" !== typeof dateNow || "object" === typeof performance && performance && "function" === typeof performance.now)) a = ic();else return Va(28), -1;
        D[b >> 2] = a / 1E3 | 0;
        D[b + 4 >> 2] = a % 1E3 * 1E6 | 0;
        return 0;
      },
      emscripten_asm_const_iii: function (a, b, c) {
        var d = [];

        a: for (var f = "";;) {
          var g = B[b++ >> 0];

          if (!g) {
            b = f;
            break a;
          }

          f += String.fromCharCode(g);
        }

        for (f = 0; f < b.length; f++) g = b[f], "d" == g || "f" == g ? (c = c + 8 - 1 & -8, d.push(Ba[c >> 3]), c += 8) : "i" == g && (c = c + 4 - 1 & -4, d.push(D[c >> 2]), c += 4);

        return Sa[a].apply(null, d);
      },
      emscripten_get_sbrk_ptr: function () {
        return 101680;
      },
      emscripten_memcpy_big: function (a, b, c) {
        B.set(B.subarray(b, b + c), a);
      },
      emscripten_resize_heap: function (a) {
        if (2147418112 < a) return !1;

        for (var b = Math.max(C.length, 16777216); b < a;) 536870912 >= b ? b = xa(2 * b) : b = Math.min(xa((3 * b + 2147483648) / 4), 2147418112);

        a: {
          try {
            A.grow(b - buffer.byteLength + 65535 >> 16);
            Ca(A.buffer);
            var c = 1;
            break a;
          } catch (d) {}

          c = void 0;
        }

        return c ? !0 : !1;
      },
      getpagesize: function () {
        return 16384;
      },
      memory: A,
      nanosleep: function (a, b) {
        if (0 === a) return Va(28), -1;
        var c = D[a >> 2];
        a = D[a + 4 >> 2];
        if (0 > a || 999999999 < a || 0 > c) return Va(28), -1;
        0 !== b && (D[b >> 2] = 0, D[b + 4 >> 2] = 0);
        b = (1E6 * c + a / 1E3) / 1E3;
        if ((v || w) && self.performance && self.performance.now) for (c = self.performance.now(); self.performance.now() - c < b;);else for (c = Date.now(); Date.now() - c < b;);
        return 0;
      },
      setTempRet0: function () {},
      strftime_l: function (a, b, c, d) {
        return oc(a, b, c, d);
      },
      table: oa
    },
        wc = function () {
      function a(a) {
        e.asm = a.exports;
        F--;
        e.monitorRunDependencies && e.monitorRunDependencies(F);
        0 == F && (null !== Ma && (clearInterval(Ma), Ma = null), Na && (a = Na, Na = null, a()));
      }

      function b(b) {
        a(b.instance);
      }

      function c(a) {
        return Ra().then(function (a) {
          return WebAssembly.instantiate(a, d);
        }).then(a, function (a) {
          z("failed to asynchronously prepare wasm: " + a);
          y(a);
        });
      }

      var d = {
        env: vc,
        wasi_unstable: vc
      };
      F++;
      e.monitorRunDependencies && e.monitorRunDependencies(F);
      if (e.instantiateWasm) try {
        return e.instantiateWasm(d, a);
      } catch (f) {
        return z("Module.instantiateWasm callback failed with error: " + f), !1;
      }

      (function () {
        if (ma || "function" !== typeof WebAssembly.instantiateStreaming || Oa() || "function" !== typeof fetch) return c(b);
        fetch(G, {
          credentials: "same-origin"
        }).then(function (a) {
          return WebAssembly.instantiateStreaming(a, d).then(b, function (a) {
            z("wasm streaming compile failed: " + a);
            z("falling back to ArrayBuffer instantiation");
            c(b);
          });
        });
      })();

      return {};
    }();

    e.asm = wc;

    var Ta = e.___wasm_call_ctors = function () {
      return e.asm.__wasm_call_ctors.apply(null, arguments);
    },
        sc = e._malloc = function () {
      return e.asm.malloc.apply(null, arguments);
    },
        X = e._free = function () {
      return e.asm.free.apply(null, arguments);
    };

    e._main = function () {
      return e.asm.main.apply(null, arguments);
    };

    var tc = e.__ZSt18uncaught_exceptionv = function () {
      return e.asm._ZSt18uncaught_exceptionv.apply(null, arguments);
    };

    e._htonl = function () {
      return e.asm.htonl.apply(null, arguments);
    };

    e._htons = function () {
      return e.asm.htons.apply(null, arguments);
    };

    e._ntohs = function () {
      return e.asm.ntohs.apply(null, arguments);
    };

    e._setThrew = function () {
      return e.asm.setThrew.apply(null, arguments);
    };

    e.___cxa_can_catch = function () {
      return e.asm.__cxa_can_catch.apply(null, arguments);
    };

    e.___cxa_is_pointer_type = function () {
      return e.asm.__cxa_is_pointer_type.apply(null, arguments);
    };

    e.___embind_register_native_and_builtin_types = function () {
      return e.asm.__embind_register_native_and_builtin_types.apply(null, arguments);
    };

    var Ob = e.___getTypeName = function () {
      return e.asm.__getTypeName.apply(null, arguments);
    },
        uc = e._memalign = function () {
      return e.asm.memalign.apply(null, arguments);
    };

    e._emscripten_builtin_free = function () {
      return e.asm.emscripten_builtin_free.apply(null, arguments);
    };

    e._emscripten_builtin_memalign = function () {
      return e.asm.emscripten_builtin_memalign.apply(null, arguments);
    };

    e.stackSave = function () {
      return e.asm.stackSave.apply(null, arguments);
    };

    var wa = e.stackAlloc = function () {
      return e.asm.stackAlloc.apply(null, arguments);
    };

    e.stackRestore = function () {
      return e.asm.stackRestore.apply(null, arguments);
    };

    e.__growWasmMemory = function () {
      return e.asm.__growWasmMemory.apply(null, arguments);
    };

    e.dynCall_ii = function () {
      return e.asm.dynCall_ii.apply(null, arguments);
    };

    e.dynCall_vi = function () {
      return e.asm.dynCall_vi.apply(null, arguments);
    };

    e.dynCall_iii = function () {
      return e.asm.dynCall_iii.apply(null, arguments);
    };

    e.dynCall_viij = function () {
      return e.asm.dynCall_viij.apply(null, arguments);
    };

    e.dynCall_v = function () {
      return e.asm.dynCall_v.apply(null, arguments);
    };

    e.dynCall_vii = function () {
      return e.asm.dynCall_vii.apply(null, arguments);
    };

    e.dynCall_viii = function () {
      return e.asm.dynCall_viii.apply(null, arguments);
    };

    e.dynCall_viiji = function () {
      return e.asm.dynCall_viiji.apply(null, arguments);
    };

    e.dynCall_viijji = function () {
      return e.asm.dynCall_viijji.apply(null, arguments);
    };

    e.dynCall_ji = function () {
      return e.asm.dynCall_ji.apply(null, arguments);
    };

    e.dynCall_viiiiii = function () {
      return e.asm.dynCall_viiiiii.apply(null, arguments);
    };

    e.dynCall_viiii = function () {
      return e.asm.dynCall_viiii.apply(null, arguments);
    };

    e.dynCall_viijj = function () {
      return e.asm.dynCall_viijj.apply(null, arguments);
    };

    e.dynCall_viijjii = function () {
      return e.asm.dynCall_viijjii.apply(null, arguments);
    };

    e.dynCall_viiij = function () {
      return e.asm.dynCall_viiij.apply(null, arguments);
    };

    e.dynCall_viijii = function () {
      return e.asm.dynCall_viijii.apply(null, arguments);
    };

    e.dynCall_iiiiiii = function () {
      return e.asm.dynCall_iiiiiii.apply(null, arguments);
    };

    e.dynCall_iiiiii = function () {
      return e.asm.dynCall_iiiiii.apply(null, arguments);
    };

    e.dynCall_i = function () {
      return e.asm.dynCall_i.apply(null, arguments);
    };

    e.dynCall_iiii = function () {
      return e.asm.dynCall_iiii.apply(null, arguments);
    };

    e.dynCall_iiiii = function () {
      return e.asm.dynCall_iiiii.apply(null, arguments);
    };

    e.dynCall_iiiiiiiiiii = function () {
      return e.asm.dynCall_iiiiiiiiiii.apply(null, arguments);
    };

    e.dynCall_iiiiiiiiii = function () {
      return e.asm.dynCall_iiiiiiiiii.apply(null, arguments);
    };

    e.dynCall_iiiiiiiii = function () {
      return e.asm.dynCall_iiiiiiiii.apply(null, arguments);
    };

    e.dynCall_viiiiiiii = function () {
      return e.asm.dynCall_viiiiiiii.apply(null, arguments);
    };

    e.dynCall_viiiii = function () {
      return e.asm.dynCall_viiiii.apply(null, arguments);
    };

    e.dynCall_iidiiii = function () {
      return e.asm.dynCall_iidiiii.apply(null, arguments);
    };

    e.dynCall_jiji = function () {
      return e.asm.dynCall_jiji.apply(null, arguments);
    };

    e.dynCall_iiiiiiii = function () {
      return e.asm.dynCall_iiiiiiii.apply(null, arguments);
    };

    e.dynCall_iiiiiijj = function () {
      return e.asm.dynCall_iiiiiijj.apply(null, arguments);
    };

    e.dynCall_iiiiij = function () {
      return e.asm.dynCall_iiiiij.apply(null, arguments);
    };

    e.dynCall_iiiiid = function () {
      return e.asm.dynCall_iiiiid.apply(null, arguments);
    };

    e.dynCall_iiiiijj = function () {
      return e.asm.dynCall_iiiiijj.apply(null, arguments);
    };

    e.asm = wc;
    var xc;

    e.then = function (a) {
      if (xc) a(e);else {
        var b = e.onRuntimeInitialized;

        e.onRuntimeInitialized = function () {
          b && b();
          a(e);
        };
      }
      return e;
    };

    function ka(a) {
      this.name = "ExitStatus";
      this.message = "Program terminated with exit(" + a + ")";
      this.status = a;
    }

    Na = function yc() {
      xc || zc();
      xc || (Na = yc);
    };

    function zc(a) {
      function b() {
        if (!xc && (xc = !0, !pa)) {
          Ea(Ga);
          Ea(Ha);
          if (e.onRuntimeInitialized) e.onRuntimeInitialized();

          if (Ac) {
            var b = a;
            b = b || [];
            var d = b.length + 1,
                f = wa(4 * (d + 1));
            D[f >> 2] = va(aa);

            for (var g = 1; g < d; g++) D[(f >> 2) + g] = va(b[g - 1]);

            D[(f >> 2) + d] = 0;

            try {
              var k = e._main(d, f);

              if (!na || 0 !== k) {
                if (!na && (pa = !0, e.onExit)) e.onExit(k);
                ba(k, new ka(k));
              }
            } catch (h) {
              h instanceof ka || ("SimulateInfiniteLoop" == h ? na = !0 : ((b = h) && "object" === typeof h && h.stack && (b = [h, h.stack]), z("exception thrown: " + b), ba(1, h)));
            } finally {}
          }

          if (e.postRun) for ("function" == typeof e.postRun && (e.postRun = [e.postRun]); e.postRun.length;) b = e.postRun.shift(), Ja.unshift(b);
          Ea(Ja);
        }
      }

      a = a || u;

      if (!(0 < F)) {
        if (e.preRun) for ("function" == typeof e.preRun && (e.preRun = [e.preRun]); e.preRun.length;) Ka();
        Ea(Fa);
        0 < F || (e.setStatus ? (e.setStatus("Running..."), setTimeout(function () {
          setTimeout(function () {
            e.setStatus("");
          }, 1);
          b();
        }, 1)) : b());
      }
    }

    e.run = zc;
    if (e.preInit) for ("function" == typeof e.preInit && (e.preInit = [e.preInit]); 0 < e.preInit.length;) e.preInit.pop()();
    var Ac = !0;
    e.noInitialRun && (Ac = !1);
    na = !0;
    zc();
    return load_perspective;
  };
}();

var _default = load_perspective;
exports.default = _default;
//# sourceMappingURL=psp.async.js.map