#include "../lib/wasm.h"
#include "../lib/stdlib.hh"
#include "../lib/link.hh"
#include "arras/fasttalk.hh"

void onBroadcast(fasttalker_t* packet) {
    fastwordview_t word;
    i32_t offset = 1;
    offset += 1; // camera.x
    offset += 1; // camera.y
    offset += 1; // camera.fov
    offset += 1; // camera.vx
    offset += 1; // camera.vy
    i32_t cam_flags = packet->view(&word, offset++)->getI32Value();
    if (cam_flags & 0x001) offset += 1; // camera.fps
    if (cam_flags & 0x002) {
        offset += 1; // camera.body.type
        offset += 1; // camera.body.color
        offset += 1; // camera.body.id
    }
    if (cam_flags & 0x004) offset += 1; // camera.scorebar
    if (cam_flags & 0x008) offset += 1; // camera.statpoints
    if (cam_flags & 0x010) {
        i32_t upgrade_count = packet->view(&word, offset++)->getI32Value();
        while (upgrade_count --> 0) offset += 1; // upgrade.id
    }
    if (cam_flags & 0x020) {
        for (i32_t i = 10; i --> 0;) {
            offset += 1; // stat min or max or val
            offset += 1; // stat min or max or val
            offset += 1; // stat min or max or val
        }
    }
    if (cam_flags & 0x040) offset += 1; // player skills compressed string
    if (cam_flags & 0x080) offset += 1; // camera.accel
    if (cam_flags & 0x100) offset += 1; // camera.top
    if (cam_flags & 0x200) offset += 1; // camera.party
    if (cam_flags & 0x400) offset += 1; // camera.speed

    assert(packet->view(&word, offset++)->getI32Value() == -1, "invalid parsing of packet");
};

void onUpdate(fasttalker_t* packet) {
    fastwordview_t word;
    i32_t offset = 1;
};

volatile void* calldest(void* raw) {
    fasttalker_t* packet = (fasttalker_t*) raw;
    packet->pos = (raw_fastword_t*) packet->__unknown[0];
    i32_t offset = 0;

    fastwordview_t word;
    str_t str_value;

    packet->view(&word, offset++);
    word.getSTRValue(&str_value);

    char header = *str_value.content;
    if (header == 'b') onBroadcast(packet);
    else if (header == 'u') onUpdate(packet);

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