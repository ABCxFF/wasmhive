// ==UserScript==
// @name         arras.io rainbowness script
// @version      1.0.0
// @description  rainbowness
// @namespace    github.com/ABCxFF/wasmhive
// @author       ABCxFF
//
// @match        *://arras.io/static/*/app*
// @run-at       document-start
// @grant        none
//
// @require      https://greasyfork.org/scripts/455470-wail/code/WAIL.js?version=1121558
// ==/UserScript==

;const eval = globalThis.eval;

const loadModules = async (bytecode) => {
  if (typeof bytecode === "string") bytecode = new Uint8Array([...atob(bytecode)].map(e => e.charCodeAt()));
  let memory = { buffer: null };
  share: {
    const TypedArray = Uint8Array.__proto__;
    const decode = TextDecoder.prototype.decode;
    TextDecoder.prototype.decode = function (buffer, ...a) {
      if (!buffer) return '';
      return decode.call(this, new Uint8Array(new Uint8Array(buffer)), ...a);
    }
    const send = WebSocket.prototype.send;
    WebSocket.prototype.send = function (buffer) {
      return send.call(this, new Uint8Array(new Uint8Array(buffer)));
    }
    const { get: getByteLength } = Object.getOwnPropertyDescriptor(TypedArray.prototype, 'byteLength');
    Object.defineProperty(TypedArray.prototype, 'byteLength', {
      get() {
        if (this.byteOffset === 0 && getByteLength.call(this) === this.buffer.byteLength) {
          if (this.buffer.constructor.name === 'SharedArrayBuffer' && this.buffer !== memory.buffer) {
            return 0;
          }
        }

        return getByteLength.call(this);
      }
    })
  };

  memory = await new Promise(res => {
    WebAssembly.instantiateStreaming = async (r, i) => WebAssembly.instantiate(await (await r).arrayBuffer(), i);
    WebAssembly.instantiate = ((inst) => {
      const SEC_MEM = 5;
      const read = (array, pos = 0) => ({
        pos: pos,
        array,
        vu() {
          let val = 0;
          let i = 0;
          do {
            val |= (array[this.pos] & 0x7F) << i;
            i += 7;
          } while (array[this.pos++] & 0x80);
          return val;
        },
        u8() {
          return array[this.pos++];
        },
        left() {
          return array.length - this.pos;
        }
      })
      return async (buffer, imports) => {
        if (!(buffer instanceof ArrayBuffer) && !(buffer instanceof Uint8Array)) return inst(buffer, imports);
        let bytes = new Uint8Array(buffer);
        const r = read(Array.from(bytes), 8);

        while (r.left() >= 0) {
          let secPos = r.pos;
          const id = r.u8();
          const len = r.vu();

          if (id !== SEC_MEM) {
            r.pos += len;
            continue;
          }
          let memPos = r.pos;
          r.u8();
          if (r.array[r.pos] & 0b11) break;
          r.array[r.pos++] |= 0b11; // 0b10=shared, 0b01=has max
          r.vu();
          let max = 65536;
          do {
            r.array.splice(r.pos, 0, max & 0x7F);
            max >>= 7;
            if (max) r.array[r.pos] |= 0x80;
            r.pos += 1;
          } while (max);
          r.array[secPos + 1] = r.pos - memPos;
          break;
        }
        bytes = new Uint8Array(r.array);
        const wasm = await inst(bytes, imports);

        res(Object.values(wasm.instance.exports).find((val) => val.buffer));

        return wasm;
      }
    })(WebAssembly.instantiate);
  });

  let evalwithref = null;

  const wmod = await WebAssembly.compile(bytecode);
  // for evalling
  const HEAPU8 = () => new Uint8Array(memory.buffer);
  const HEAP32 = () => new Int32Array(memory.buffer);
  const HEAP64 = () => new BigInt64Array(memory.buffer);
  const HEAPF32 = () => new Float32Array(memory.buffer);
  const HEAPF64 = () => new Float64Array(memory.buffer);
  const decodeUTF8 = (charCodes) => new TextDecoder().decode(charCodes);
  const decodeFromMemory = (addr) => decodeUTF8(HEAPU8().subarray(addr, HEAPU8().indexOf(0, addr)));

  const wasm = await WebAssembly.instantiate(wmod, {
    env: {
      memory,
      d: () => {debugger},
      as: (addr) => top.alert(decodeFromMemory(addr)),
      ls: (addr) => top.console.log(decodeFromMemory(addr)),
      lf: (val) =>top.console.log(val),
      li: (val) => top.console.log(val),
      e: (...argv) => evalwithref(...argv)
    }
  });
  // for evalling
  const pop = wasm.exports.pop;
  const push = wasm.exports.push;
  const alloc = wasm.exports.alloc;
  const free = wasm.exports.free;

  // Link layer 1
  evalwithref = (body, ref) => {
    eval(decodeFromMemory(body))((data) => wasm.exports.call(ref, data));
  }

  if (wasm.exports.main) wasm.exports.main();
};
loadModules("AGFzbQEAAAABHAZgAX8Bf2ACf38AYAAAYAF/AGACf38Bf2AAAX8CGgIDZW52Bm1lbW9yeQIDEoCABANlbnYBZQABAwoJAgADAAAEAAUEBAUBcAECAgYNAn8BQYCACAt/AUEACwcsBgZtYWxsb2MABQRmcmVlAAMEcHVzaAAEA3BvcAACBGNhbGwABgRtYWluAAkIAQEJBwEAQQELAQcMAQIKgQMJagACQAJAAkBB0IgIQQBBAf5IAgAOAgABAgtBgIAIQQBBOPwIAABBuIAIQQBBAfwIAQBBwIAIQQBBkAj8CwBB0IgIQQL+FwIAQdCICEF//gACABoMAQtB0IgIQQFCf/4BAgAaC/wJAPwJAQsOACMADyAAJAAjAA9BAAsCAAsOACMADyAAJAAjAA9BAAsEAEEACyYAAkAgAEECdEHQgIiAAGooAgAiAA0AQX8PCyABIAARgICAgAAAC30BA38CQEEAKALIpEgiASgCmAQiAkECSA0AIAJBf2ohAiABKAKcBEHAfWohAQNAAkAgASgCAEUNAEEAQQAtALiAiIAAQa1/bEHbAGoiAzoAuICIgAAgAUG4AmogA0H/AXFBHnA6AAALIAFBwH1qIQEgAkF/aiICDQALC0EAC0ABAX9BAEEALQDAgIiAACIAQQFqOgDAgIiAACAAQQJ0QdCAiIAAakGBgICAADYCAEGAgIiAACAAEICAgIAAQQALCAAQiICAgAALCz4CATgoaG9vaykgPT4geyBzZXRJbnRlcnZhbCgoKSA9PiB7IGhvb2soKTsgfSwgMSAqIDEwMDApOyB9AAEBBw==");
