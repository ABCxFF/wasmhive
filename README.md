# wasmhive
Project for scripts compiled to WASM for games compiled to WASM

## ?

The idea is to use WASM's shared-memory feature (proposal) to allow developers to code extensions and userscripts in other languages besides JS, for websites and applications coded in other languages besides JS. Of course there will always be the glue code, but this is a proof of possibility.


<!--
TODO
:: see if malloc and free are automatable
   - if doable, move program memory into dynamically allocated chunks
   - pipe malloc and free algorithms into programs
  | else
   - generate program space based off of hash of program name
   - recode malloc and free


-->