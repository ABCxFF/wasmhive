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