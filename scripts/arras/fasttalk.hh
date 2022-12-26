#pragma once

#include "../../lib/wasm.h"
#include "../../lib/stdlib.hh"
#include "rust.hh"

enum fastwordtype_t {
    FAST_I32 = 0,
    FAST_F32 = 2147483647,
    // #pseudocode
    FAST_STR = 2
};

typedef i32_t raw_fastwordtype_t;

struct raw_fastcipher_t {
    // #offset=0x0
    i32_t state;
    // #offset=0x4
    i32_t _multiplier;
    // #offset=0x8
    i32_t _increment;

    // #pseudocode
    i32_t nextstate() {
        // ticks twice
        this->state = (this->state * this->_multiplier) + this->_increment;
        this->state = (this->state * this->_multiplier) + this->_increment;
        return this->state;
    }
};

struct raw_fastword_t {
    union {
        struct {
            // #offset=0x0
            union { f32_t f32; i32_t i32; } value; // (+Encrypted)
            // #offset=0x4
            raw_fastwordtype_t type; // (^Encrypted) Defines the type of the word
        } num;

        struct {
            // #offset=0x0
            i32_t length; // (+Encrypted) If type is FAST_STR, this stores str length
            // #offset=0x4
            char* content; // (-Encrypted) When using a string
        } str;
    } value;
};

struct raw_fasttalker_t {
    // #offset=0x0
    i32_t __unknown[2];
    // #offset=0x8
    raw_fastword_t* pos; // points to the current position of the talker/rotator
    // #offset=0xc
    raw_fastword_t* end; // points to the end of the packet 
    // #offset=0x10
    raw_fastcipher_t cipher;
};


struct fastcipher_t : raw_fastcipher_t {
    // #pseudocode
    i32_t viewState(i32_t steps) {
        // ticks twice
        i32_t state = this->state;
        while (steps --> 0) state = (state * this->_multiplier) + this->_increment;
        return state;
    }
};

// #pseudocode
struct fastwordview_t {
    fastcipher_t* cipher;
    i32_t offset;
    raw_fastword_t* raw;


    // #pseudocode
    fastwordtype_t getWordType() {
        i32_t raw = this->cipher->viewState(this->offset * 2 + 2) ^ this->raw->value.num.type;
        if (raw >= 2 && raw != FAST_F32) return FAST_STR;
        return (fastwordtype_t) raw;
    }
    // #pseudocode
    void setWordType(fastwordtype_t type) {
        if (type != FAST_STR) this->raw->value.num.type = this->cipher->viewState(this->offset * 2 + 2) ^ type;
    }

    // #psuedocode
    i32_t getI32Value() {
        switch (this->getWordType()) {
            // if the value type is an i32, return the value
            case FAST_I32: return this->raw->value.num.value.i32 + this->cipher->viewState(this->offset * 2 + 1);
            case FAST_F32: {
                i32_t cipher_state = this->cipher->viewState(this->offset * 2 + 1);
                this->raw->value.num.value.i32 += cipher_state;
                f32_t value = this->raw->value.num.value.f32;
                this->raw->value.num.value.i32 -= cipher_state;
                // if not, and its above of i32 range, return -1
                if (value > 4294967295.0) return -1;
                // if in range, cast to int
                if (value < 4294967296.0 && value >= 0.0) return (i32_t) value;
                // if below i32 range return 0
                return 0;
            }
             // else, return 0
            case FAST_STR:
            default:
                return 0;
        }

        // unreachable
        abort();
    }

    // #psuedocode
    void setI32Value(i32_t value) {
        this->setWordType(FAST_I32);
        this->raw->value.num.value.i32 = value - this->cipher->viewState(this->offset * 2 + 1);
    }

    // #psuedocode
    f32_t getF32Value() {
        switch (this->getWordType()) {
            // if the value type is an f32, return the value
            case FAST_F32: {
                i32_t cipher_state = this->cipher->viewState(this->offset * 2 + 1);
                this->raw->value.num.value.i32 += cipher_state;
                f32_t value = this->raw->value.num.value.f32;
                this->raw->value.num.value.i32 -= cipher_state;
                return value;
            }
            // if the value type is an i32, return the casted value
            case FAST_I32: return (f32_t) (this->raw->value.num.value.i32 + this->cipher->viewState(this->offset * 2 + 1));
            // else, return 0.0
            case FAST_STR:
            default:
                return 0.0;
        }

        // unreachable
        abort();
    }

    // #psuedocode
    void setF32Value(f32_t value) {
        this->setWordType(FAST_F32);
        this->raw->value.num.value.f32 = value;
        this->raw->value.num.value.i32 -= this->cipher->viewState(this->offset * 2 + 1);
    }

    // #psuedocode
    void getSTRValue(str_t* out) {
        out->length = out->capacity = 0;
        out->content = (char*) NULL(1);
        if (this->getWordType() == FAST_STR) {
            out->length = out->capacity = this->raw->value.str.length + this->cipher->viewState(this->offset * 2 + 1);
            out->content = (char*) ((i32_t) this->raw->value.str.content ^ this->cipher->viewState(this->offset * 2 + 2));
        }
    }

    // #psuedocode
    void setSTRValue(char* content, i32_t length) {
        this->setWordType(FAST_STR);
        this->raw->value.str.content = (char*) ((i32_t) content ^ this->cipher->viewState(this->offset * 2 + 2));
        this->raw->value.str.length = length - this->cipher->viewState(this->offset * 2 + 1);
    }
};

struct fasttalker_t : raw_fasttalker_t {
    // #pseudocode
    raw_fastword_t* getRaw(i32_t offset) {
        raw_fastword_t* pos = this->pos + offset;
        if (this->end <= pos) return nullptr;

        return pos;
    }

    fastwordview_t* view(fastwordview_t* out, i32_t offset) {
        raw_fastword_t* raw = this->getRaw(offset);
        fastcipher_t* cipher = (fastcipher_t*) &this->cipher;

        out->raw = raw;
        out->cipher = cipher;
        out->offset = offset;
        
        return out;
    }

    fastwordview_t* view(fastwordview_t* out, i32_t offset, i32_t offset_offset) {
        raw_fastword_t* raw = this->getRaw(offset);
        fastcipher_t* cipher = (fastcipher_t*) &this->cipher;

        out->raw = raw;
        out->cipher = cipher;
        out->offset = offset + offset_offset;

        return out;
    }
};