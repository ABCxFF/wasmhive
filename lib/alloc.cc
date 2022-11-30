#include "alloc.h"

extern u8_t __heap_base;

inline void* __stack_pointer_get() {
    asm("global.get 0 ; return");
    return nullptr;
}

inline void* __stack_pointer_tee(void* newptr) {
    asm("local.get 0 ; global.set 0 ; global.get 0 ; return ");
    return nullptr;
}


void* malloc(u32_t n) __attribute__((export_name("malloc"))) {
    return nullptr;
}

void free(void* p) __attribute__((export_name("free"))) {
    // lol
}

void* push(u32_t n) __attribute__((export_name("push"))) {
    return __stack_pointer_tee(((u8_t*) __stack_pointer_get()) - n);
}

void* pop(u32_t n) __attribute__((export_name("pop"))) {
    return __stack_pointer_tee(((u8_t*) __stack_pointer_get()) + n);
}