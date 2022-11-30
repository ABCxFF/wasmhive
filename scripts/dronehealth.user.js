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

// copy paste loader.js to actually load the file
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