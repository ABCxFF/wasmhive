// ==UserScript==
// @name         arras.io rainbow script
// @version      1.0.0
// @description  rainbow
// @namespace    github.com/ABCxFF/wasmhive
// @author       ABCxFF
//
// @match        *://arras.io/static/*/app*
// @run-at       document-start
// @grant        none
//
// @require      https://greasyfork.org/scripts/455470-wail/code/WAIL.js?version=1121558
// ==/UserScript==

/** begin vanilla js **/
if (!Array.isArray(globalThis.INJ)) globalThis.INJ = [];

WebAssembly.instantiateStreaming = async (r, i) => WebAssembly.instantiate(await (await r).arrayBuffer(), i);

const inst = WebAssembly.instantiate;
WebAssembly.instantiate = async function (buffer, imports) {
    if (!(buffer instanceof Uint8Array || buffer instanceof ArrayBuffer)) return inst(buffer, imports);
    const wail = new WailParser(new Uint8Array(buffer));

    (imports.x = {}).inj = (...a) => {
        for (const inj of globalThis.INJ) inj(...a);
    }
    const inj = wail.addImportEntry({
        moduleStr: "x",
        fieldStr: "inj",
        kind: "func",
        type: wail.addTypeEntry({
            form: "func",
            params: ['i32'],
        })
    });
    wail.addCodeElementParser(null, ({ bytes, index }) => {

        const SEARCH = [OP_BLOCK, 64, OP_BLOCK, 64, OP_BLOCK, 64, OP_BLOCK, 64, OP_BLOCK, 64, OP_BLOCK, 64, OP_GET_LOCAL, '*', OP_IF];

        s: for (let i = 0; i < bytes.length - SEARCH.length; ++i) {
            for (let j = 0; j < SEARCH.length; ++j) {
                if (bytes[i + j] === SEARCH[j] || SEARCH[j] === "*") continue;
                continue s;
            }
            let offset = i;
            const SEARCH2 = new Uint8Array(new Float32Array([9223371487098962000.0]).buffer);
            let bytes2 = bytes.slice(i + SEARCH.length)
            s2: for (let i = 0; i < bytes2.length - SEARCH2.length; ++i) {
                for (let j = 0; j < SEARCH2.length; ++j) {
                    if (bytes2[i + j] === SEARCH2[j]) continue;
                    continue s2;
                }

                const varIdx = bytes2[bytes2.indexOf(OP_GET_LOCAL) + 1]

                return new Uint8Array([
                    ...bytes.slice(0, offset + SEARCH.length - 1),
                    OP_GET_LOCAL, varIdx,
                    OP_CALL, ...VarUint32ToArray(inj.i32()),
                    ...bytes.slice(offset + SEARCH.length - 1)
                ]);
            }
            continue s;
        }

        return bytes;
    });
    wail.parse();
    return inst(wail.write(), imports);
}
/** end vanilla js **/

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
loadModules("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");
