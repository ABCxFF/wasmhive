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