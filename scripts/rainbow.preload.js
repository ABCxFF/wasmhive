let INJ = () => {};

WebAssembly.instantiateStreaming = async (r, i) => WebAssembly.instantiate(await (await r).arrayBuffer(), i);

const inst = WebAssembly.instantiate;
WebAssembly.instantiate = async function (buffer, imports) {
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
    wail.addCodeElementParser(null, ({ bytes, index }) => {
        const SEARCH = [OP_CALL, ...VarUint32ToArray(index)];
        s: for (let i = 0; i < bytes.length - SEARCH.length; ++i) {
            for (let j = 0; j < SEARCH.length; ++j) {
                if (bytes[i + j] === SEARCH[j]) continue;
                continue s;
            }

            const SEARCH2 = new Uint8Array(new Float64Array([0.01227184630308513]).buffer);
            s2: for (let i = 0; i < bytes.length - SEARCH2.length; ++i) {
                for (let j = 0; j < SEARCH2.length; ++j) {
                    if (bytes[i + j] === SEARCH2[j]) continue;
                    continue s2;
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

            break;
        }

        return bytes;
    });
    wail.parse();
    return inst(wail.write(), imports);
}