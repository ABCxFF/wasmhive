#pragma once

#include "../../lib/wasm.h"

template <typename T>
struct vec_t {
    // #offset=0x0
    T* content;
    // #offset=0x4
    i32_t capacity;
    // #offset=0x8
    i32_t length;
};

typedef vec_t<char> str_t;