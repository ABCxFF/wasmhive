// ==UserScript==
// @name         Arras.io Drone Health
// @version      1.0.0
// @description  Shows the health of drones, bullets, and traps
// @namespace    github.com/ABCxFF/wasmhive
// @author       ABC
//
// @match        *://arras.io/static/*/app*
// @run-at       document-start
// @grant        none
//
// @require      https://greasyfork.org/scripts/455470-wail/code/WAIL.js?version=1121558
// ==/UserScript==

const loadModules = async (bytecode) => {
    if (typeof bytecode === "string") bytecode = new Uint8Array([...atob(bytecode)].map(e=>e.charCodeAt()));
    let memory = {buffer: null};
    share: {
      const TypedArray = Uint8Array.__proto__;
      const decode = TextDecoder.prototype.decode;
      TextDecoder.prototype.decode = function(buffer, ...a) {
        if (!buffer) return '';
        return decode.call(this, new Uint8Array(new Uint8Array(buffer)), ...a);
      }
      const send = WebSocket.prototype.send;
      WebSocket.prototype.send = function(buffer) {
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
  
    const Module = {};
  
    const wmod = await WebAssembly.compile(bytecode);
    const CALLDEST = Module.CALLDEST = {
      DRONEHEALTH: 0
    };
  
    memory = Module.memory = await new Promise(res => {
      WebAssembly.instantiateStreaming = async (r, i) => WebAssembly.instantiate(await (await r).arrayBuffer(), i);
      WebAssembly.instantiate = ((inst) => {
        const SEC_MEM = 5;
        const read = (array, pos=0) => ({
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
  
    const wasm = await WebAssembly.instantiate(wmod, { env: { memory } })
  
    for (const exprt in wasm.exports) Module[exprt] = wasm.exports[exprt];
  
    return Module;
  };
  ;(bytecode => {
    let INJ = (...argv) => {};
    loadModules(bytecode).then(({ CALLDEST, call, push, pop, memory }) => {
      const HEAP32 = () => new Int32Array(memory.buffer);
      INJ = (...argv) => {
        const frameSize = argv.length * 4;
        const paramPtr = push(frameSize);
        HEAP32().set(argv, paramPtr >> 2);
  
        call(CALLDEST.DRONEHEALTH, paramPtr);
  
        pop(frameSize);
      }
    });
  
    WebAssembly.instantiateStreaming = async (r, i) => WebAssembly.instantiate(await (await r).arrayBuffer(), i);
  
    const inst = WebAssembly.instantiate;
    WebAssembly.instantiate = async function(buffer, imports) {
      if (!(buffer instanceof Uint8Array || buffer instanceof ArrayBuffer)) return inst(buffer, imports);
      const wail = new WailParser(new Uint8Array(buffer));
  
      (imports.x = {}).inj = (...a) => INJ(...a);
      const inj = wail.addImportEntry({
        moduleStr: "x",
        fieldStr: "inj",
        kind: "func",
        type: wail.addTypeEntry({
          form: "func",
          params: ['i32', 'i32', 'i32', 'i32', 'i32'],
        })
      });
      const SEARCH = [OP_I32_CONST, 2, OP_I32_SHR_U, OP_I32_CONST, 1, OP_I32_AND]
      wail.addCodeElementParser(null, ({bytes,index}) => {
        s: for (let i = 0; i < bytes.length - SEARCH.length; ++i) {
          for (let j = 0; j < SEARCH.length; ++j) {
            if (bytes[i+j] === SEARCH[j] || SEARCH[j] === "*") continue;
            continue s;
          }
          return new Uint8Array([
            OP_GET_LOCAL, 0,
            OP_GET_LOCAL, 1,
            OP_GET_LOCAL, 2,
            OP_GET_LOCAL, 3,
            OP_GET_LOCAL, 4,
            OP_CALL, ...VarUint32ToArray(inj.i32()),
            ...bytes
          ]);
        }
  
        return bytes;
      });
      wail.parse();
      return inst(wail.write(), imports);
    }
  })("AGFzbQEAAAABEANgAn9/AX9gAX8Bf2ABfwACEgEDZW52Bm1lbW9yeQIDEoCABAMHBgABAQIBAQQFAXABAQEGCAF/AUGAgAgLByUFBGNhbGwAAAZtYWxsb2MABQRmcmVlAAMEcHVzaAAEA3BvcAACCsQDBhsBAX9BfyECAkAgAA0AIAEQgYCAgAAhAgsgAgv/AgMCfwF8A38gACgCACIBIAEoAgAiAEEQajYCAAJAAkACQAJAIAAoAgANACAAKAIIIQIMAQtBfyECIAArAwgiA0QAAOD////vQWQNASADRAAAAAAAAAAAZiECAkACQCADmUQAAAAAAADgQWNFDQAgA6ohBAwBC0GAgICAeCEECyAEQQAgAhtBACADRAAAAAAAAPBBYxshAgtBASEEIAJBAXFFDQELQQMhBAsCQCACQQRxRQ0AIAEgACACQQF2QQFxIARqIgJBBHRqIgRBEGo2AgACQAJAIAQoAgANACAAIAJBBHRqQQhqKAIAIQUMAQtBfyEFIAAgAkEEdGpBCGorAwAiA0QAAOD////vQWQNACADRAAAAAAAAAAAZiEFAkACQCADmUQAAAAAAADgQWNFDQAgA6ohBgwBC0GAgICAeCEGCyAGQQAgBRtBACADRAAAAAAAAPBBYxshBQsgBEEANgIAIAAgAkEEdGpBCGogBUEEcjYCAAsgASAANgIAQQALDgAjAA8gACQAIwAPQQALAgALDgAjAA8gACQAIwAPQQALBABBAAs=");