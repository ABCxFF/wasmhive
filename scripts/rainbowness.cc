#include "../lib/wasm.h"
#include "../lib/link.hh"
#include "arras/entity.hh"

u8_t color = 7;

void rainbowize(entity_t *entity, i32_t id) {
    color = (color * 173) + 91;

    entity->data.body_color = (color) % 30;
};

void frame() {
    rough_ent_array_t *world = rough_ent_array_t::get_rough_ent_array();
    
    if (world != nullptr) world->for_each(rainbowize);
}

volatile void *calldest(void *raw) {
    frame();

    return nullptr;
}

int main() {
    EVAL_LINK(calldest, (hook) => {
        setInterval(() => {
            hook();
        }, 1 * 1000);
    });
}
