#pragma once

#include "wasm.h"

enum fastwordtype_t {
  FAST_I32 = 0,
  FAST_F64 = 1
};

struct fastword_t {
  // #offset=0x0
  fastwordtype_t type; // Defines the type of the word
  // #offset=0x8
  union { i32_t i32; f64_t f64; } value; // Stores the value of the word

  // #psuedocode
  i32_t getI32Value() {
    // if the value type is an i32, return the value
    if (this->type == FAST_I32) return this->value.i32;
    // if not, and its above of i32 range, return -1
    if (this->value.f64 > 4294967295.0) return -1;

    // if in range, cast to int
    if (this->value.f64 < 4294967296.0 && this->value.f64 >= 0.0) return (i32_t) this->value.f64;

    // if below i32 range return 0
    return 0;
  }

  // #psuedocode
  void setI32Value(i32_t value) {
    this->type = FAST_I32;
    this->value.i32 = value;
  }

  // #psuedocode
  f64_t getF64Value() {
    // if the value type is an f64, return the value
    if (this->type == FAST_F64) return this->value.f64;
    // else just case
    return (f64_t) this->value.i32;
  }

  // #psuedocode
  void setF64Value(f64_t value) {
    this->type = FAST_F64;
    this->value.f64 = value;
  }
};

struct fasttalker_t {
  // #offset=0x0
  fastword_t* pos; // points to the current position of the talker/rotator
  // #offset=0x4
  fastword_t* end; // points to the end of the packet 

  // #pseudocode
  fastword_t* nex() {
    fastword_t* elem = this->pos;

    this->pos += 1;

    return elem;
  }

  // #pseudocode
  i32_t words_left() {
    return (this->end - this->pos) / sizeof(fastword_t);
  }
};