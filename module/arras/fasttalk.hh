#pragma once

#include "../../lib/wasm.h"

enum fastwordtype_t {
    FAST_I32 = 0,
    FAST_F64 = 1,
    FAST_STR = 2
};

struct str_t {
    char* content;
    i32_t len;
};

struct fastword_t {
    // #offset=0x0
    fastwordtype_t type; // Defines the type of the word
    // #offset=0x4
    i32_t str_len; // If type is FAST_STR, this stores str length
    // #offset=0x8
    union { 
        i32_t i32;
        f64_t f64;
        struct { i32_t __pad; char* content; } str;
    } value; // Stores the value of the word

    // #psuedocode
    i32_t getI32Value() {
        switch (this->type) {
            // if the value type is an i32, return the value
            case FAST_I32: return this->value.i32;
            case FAST_F64: {
                // if not, and its above of i32 range, return -1
                if (this->value.f64 > 4294967295.0) return -1;
                // if in range, cast to int
                if (this->value.f64 < 4294967296.0 && this->value.f64 >= 0.0) return (i32_t) this->value.f64;
                // if below i32 range return 0
                return 0;
            }
             // else, return 0
            case FAST_STR:
            default:
                return 0;
        }

        // unreachable
        return 0;
    }

    // #psuedocode
    void setI32Value(i32_t value) {
        this->type = FAST_I32;
        this->value.i32 = value;
    }

    // #psuedocode
    f64_t getF64Value() {
        switch (this->type) {
            // if the value type is an f64, return the value
            case FAST_F64: return this->value.f64;
            // if the value type is an i32, return the casted value
            case FAST_I32: return (f64_t) this->value.i32;
            // else, return 0.0
            case FAST_STR:
            default:
                return 0.0;
        }

        // unreachable
        return 0.0;
    }

    // #psuedocode
    void setF64Value(f64_t value) {
        this->type = FAST_F64;
        this->value.f64 = value;
    }

    // #psuedocode
    i32_t getSTRValue(str_t* out) {
        out->len = 0;
        out->content = (char*) NULL(1);
        if (this->type == FAST_STR) {
            out->len = this->str_len;
            out->content = this->value.str.content;
        }

        return out->len;
    }

    // #psuedocode
    void setSTRValue(char* content, i32_t str_len) {
        this->value.str.content = content;
        this->str_len = str_len;
    }
};

struct fasttalker_t {
    // #offset=0x0
    fastword_t* pos; // points to the current position of the talker/rotator
    // #offset=0x4
    fastword_t* end; // points to the end of the packet 

    // #pseudocode
    fastword_t* nex() {
        if (this->end == this->pos) return nullptr;

        fastword_t* elem = this->pos;

        this->pos += 1;

        return elem;
    }

    // #pseudocode
    i32_t words_left() {
        return (this->end - this->pos) / sizeof(fastword_t);
    }
};