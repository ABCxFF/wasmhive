#pragma once

#include "../../lib/wasm.h"
#include "rust.hh"

// 0x103158 + 0x1e0 = hashmap
struct gun_t {
    // #offset=0x0
    i32_t id;

    // #offset=0x8
    f64_t power;
    // #offset=0x10
    bool_t has_shot;
    // #offset=0x14
    i32_t shot_count;
};

struct mockup_t {
    // #offset=0x0
    i32_t __unknown0[6];

    // #offset=0x18
    str_t tank_name;
    // // #offset=0x24
    // str_t _unknown_str;
    // // #offset=0x30
    // str_t _unknown_str;
    // // #offset=0x3c
    // str_t _unknown_str;
    // // #offset=0x48
    // str_t _unknown_str;
    // // #offset=0x54
    // i32_t __unknown1;

    // #offset=0x20
    i32_t __unknown1[13];
};

struct entity_ident_t {
    // #offset=0x0
    i32_t id;

    // #offset=0x4
    i32_t __unknown0[1];
};

struct interp_f64_t {
    // #offset=0x0
    f64_t previous_value;
    // #offset=0x4
    f64_t value;
    // #offset=0x8
    f64_t __unknown_delta;
};

struct entity_data_t {
    // #offset=0x0
    i32_t __unknown0[1];

    // #offset=0x8
    interp_f64_t x_pos;
    // #offset=0x20
    interp_f64_t y_pos;
    // #offset=0x38
    interp_f64_t facing;
    // #offset=0x50
    interp_f64_t health;
    // #offset=0x68
    interp_f64_t shield;
    // #offset=0x80
    f64_t alpha;
    // #offset=0x88
    f64_t size;
    // #offset=0x90
    mockup_t mockup;
    // #offset=0xe8
    i32_t __unknown1[4];
    // #offset=0xf8
    i32_t score;
    // #offset=0xfc
    str_t name;
    // #offset=0x108
    vec_t<gun_t> guns;
    // #offset=0x114
    vec_t<entity_data_t> turrets;
    // #offset=0x120
    i16_t mockup_idx;
    // #offset=0x122
    i16_t layer;
    // #offset=0x124
    i16_t __unknown2[1];
    // #offset=0x126
    bool_t is_twiggle;
    // #offset=0x127
    bool_t is_tank_reversed;
    // #offset=0x128
    bool_t is_health_shown;
    // #offset=0x129
    u8_t body_color;
};

struct entity_t {
    // #offset=0x0
    entity_ident_t identity;

    // #offset=0x8
    entity_data_t data;
};

struct rough_ent_array_t {
    // #offset=0x00
    i32_t size;
    // #offset=0x04
    entity_t* entities;
    // #offset=0x08
    i32_t __unknown_count;
    // #offset=0x0c
    i32_t __unknown_count2;

    // #pseudocode
    void for_each(void (*callback)(entity_t* entity, i32_t id)) {
        i32_t i = 1;
        while (i < this->size) {
            entity_t* entity = &this->entities[-i];
            i32_t id = entity->identity.id;
            if (id != 0) callback(entity, id);
            i += 1;
        }
    };

    // #pseudocode
    entity_t* get_by_id(i32_t id) {
        i32_t i = 1;
        while (i < this->size) {
            entity_t* entity = &this->entities[-i];

            if (entity->identity.id == id) return entity;
            i += 1;
        }

        return nullptr;
    };

    static rough_ent_array_t* get_rough_ent_array() {
        // all magic
        return (rough_ent_array_t*) &((i32_t**) 0x1200b8)[1][128];
    }
};