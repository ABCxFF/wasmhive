#!/bin/sh

INITIAL_MEM=18
STACK_TOP=16

clang \
   --target=wasm32 \
   -flto \
   -pthread \
   -nostdlib \
   -O3 \
   -Wl,--lto-O3 \
   -Wl,--strip-all \
   -Wl,--no-entry \
   -Wl,--stack-first \
   -Wl,-z,stack-size=$[65536 * STACK_TOP / 8] \
   -Wl,--import-memory \
   -Wl,--initial-memory=$[65536 * INITIAL_MEM] \
   -Wl,--max-memory=$[65536 * 65536] \
   -Wl,--shared-memory \
   -o out/main.wasm \
   lib/*.c lib/*.cc module/*.cc

wasm2wat out/main.wasm -o out/main.wat --enable-all
base64 out/main.wasm > out/bytecode.bin