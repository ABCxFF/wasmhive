#include "../lib/wasm.h"
#include "../lib/link.hh"
#include "arras/entity.hh"
#include "arras/rust.hh"

void scorecolor(entity_t* entity, i32_t id) {
	if (entity->data.score >= 1000000) {
		entity->data.body_color = 3;
	} else if (entity->data.score >= 5000000) {
		entity->data.body_color = 36;
	};
};


void frame() {
    rough_ent_array_t *world = rough_ent_array_t::get_rough_ent_array();
    
    if (world != nullptr) world->for_each(scorecolor);
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
