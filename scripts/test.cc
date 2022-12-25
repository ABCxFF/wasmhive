#include "../lib/wasm.h"
#include "../lib/stdlib.hh"
#include "../lib/link.hh"
#include "arras/fasttalk.hh"

void hook(fasttalker_t* packet) {

}

volatile void* calldest(void* raw) {
    fasttalker_t* packet = (fasttalker_t*) raw;
    packet->pos = (raw_fastword_t*) packet->__unknown[0];
    i32_t offset = 0;

    fastwordview_t word;
    str_t value;

    packet->view(&word, offset++);
    word.getSTRValue(&value);

    char header = *value.content;

    char text[0x20] = {'`', *value.content, '`', 0};
    strcat(text, " packet incoming.");
    LOG(text);
    switch (header) {
        // case 'e':
            // packet->view(&word, offset++);
            // word.getSTRValue(&value);
            // LOG(value.content);
            // packet->view(&word, offset++);
            // word.getSTRValue(&value);
            // char text[0x20] = {'`', *value.content, '`', 0};
            // strcat(text, " packet incoming.");
            // LOG(value.content);
    }

    return nullptr;
}

int main() {
    EVAL_LINK(calldest, (hook) => {
        /* defined in the pre-wasm test.js */
        INJ.push((base) => {
            hook(base + 0x78);
        });
    });
}