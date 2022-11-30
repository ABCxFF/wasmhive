// ==UserScript==
// @name         Arras.io Rainbowness
// @version      1.0.0
// @description  Makes every entity change color every second
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
  loadModules(bytecode).then(({ CALLDEST, call, push, pop, memory }) => {
    setInterval(() => {
      call(CALLDEST.RAINBOW, 0);
    }, 1 * 1000);
  });

})("AGFzbQEAAAABEwRgAABgAn9/AX9gAX8Bf2ABfwACEgEDZW52Bm1lbW9yeQIDEoCABAMIBwABAgIDAgIEBQFwAQEBBggBfwFBgIAICwclBQRjYWxsAAEGbWFsbG9jAAYEZnJlZQAEBHB1c2gABQNwb3AAAwgBAAwBAQrlAQdDAEGEgAhBAEEB/kgCAARAQYSACEEBQn/+AQIAGgVBgIAIQQBBAfwIAABBhIAIQQL+FwIAQYSACEF//gACABoL/AkACx4BAX9BfyECAkAgAEEBRw0AIAEQgoCAgAAhAgsgAgtaAQJ/AkBBACgCvIFIKAKEBCIBQXxqKAIAQQJIDQAgASgCAEF5aiECA0BBAEEALQCAgIiAAEGtf2xB2wBqIgE6AICAiIAAIAIgAUH/AXFBHnA6AAAMAAsLQQALDgAjAA8gACQAIwAPQQALAgALDgAjAA8gACQAIwAPQQALBABBAAsLBAEBAQc=");