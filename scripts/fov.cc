#include "../lib/wasm.h"
#include "../lib/stdlib.hh"
#include "../lib/link.hh"
#include "arras/fasttalk.hh"

volatile void* calldest(void* raw) {
    fasttalker_t* packet = (fasttalker_t*) raw;
    packet->pos = (raw_fastword_t*) packet->__unknown[0];
    i32_t offset = 0;

    fastwordview_t word;
    str_t str_value;

    packet->view(&word, offset++)->getSTRValue(&str_value);

    char header = *str_value.content;
    if (header == 'u') {
        offset += 1; // x pos
        offset += 1; // y pos
        packet->view(&word, offset++);
        word.setF32Value(word.getF32Value() * 1.2);
    }

    return nullptr;
}

int main() {
    EVAL_LINK(calldest, (hook) => {
        /* defined in the pre-wasm fov.js */
        INJ.push((base) => {
            hook(base + 0x78);
        });
    });
}