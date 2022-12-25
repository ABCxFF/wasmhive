#!/bin/sh

INITIAL_MEM=18
STACK_TOP=16
LOADER_FILE="loader.js"

compile() {
   # src file name = $1
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
      -Wl,--export-if-defined=main \
      -Wl,--shared-memory \
      -o "../out/$1.wasm" \
      ../lib/*.cc "$1.cc"

   wasm2wat "../out/$1.wasm" -o "../out/$1.wat" --enable-all --generate-names \
   && base64 "../out/$1.wasm" > "../out/$1.bin"
}

mkscript() {
   # script name = $1
   echo "// ==UserScript==
// @name         arras.io $1 script
// @version      1.0.0
// @description  $1
// @namespace    github.com/ABCxFF/wasmhive
// @author       ABCxFF
//
// @match        *://arras.io/static/*/app*
// @run-at       document-start
// @grant        none
//
// @require      https://greasyfork.org/scripts/455470-wail/code/WAIL.js?version=1121558
// ==/UserScript==
" > "../out/$1.user.js"


   # if js, use it
   if [ -f "../scripts/$1.preload.js" ]; then
      echo "/** begin vanilla js **/\n$(cat "../scripts/$1.preload.js")\n/** end vanilla js **/\n" >> "../out/$1.user.js"
   fi

   # if wasm, use it
   if [ -f "../out/$1.bin" ]; then
      cat "../$LOADER_FILE" >> "../out/$1.user.js" \
      && echo '\nloadModules("'$(cat "../out/$1.bin")'");' >> "../out/$1.user.js"
   fi
}

# https://stackoverflow.com/questions/7119223/file-name-without-extension-in-bash-for-loop
# https://stackoverflow.com/questions/8512462/looping-through-all-files-in-a-directory
rm -rf out/
mkdir out
cd scripts
for file in *.cc; do 
    if [ -f "$file" ]; then 
      compile "${file%.*}" \
      && mkscript "${file%.*}"
    fi 
done

for file in *.preload.js; do 
    if ! [ -f "${file%%.*}.cc" ]; then 
      mkscript "${file%%.*}"
    fi 
done