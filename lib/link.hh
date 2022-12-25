#pragma once

#include "wasm.h"

/**
 * Layer 0 of the link between c++ and js script code
 */

typedef u8_t __DESTCODE__;

typedef volatile void* (__CALLDEST__)(void* data);

volatile void* CALL(__DESTCODE__ DEST_CODE, void* DATA);
__DESTCODE__ LINK_CALLDEST(__CALLDEST__ DEST);

__DESTCODE__ __CALLDEST_CNT__ = 0;
__CALLDEST__* __CALLDESTS__[sizeof(__DESTCODE__) * 0x100] = {};
volatile void* CALL(__DESTCODE__ DEST_CODE, void* DATA) __attribute__((export_name("call"))) {
    if (__CALLDESTS__[DEST_CODE]) return __CALLDESTS__[DEST_CODE](DATA);

    return (volatile void*) -1;
};

__DESTCODE__ LINK_CALLDEST(__CALLDEST__ DEST) {
    if (DEST == nullptr) return -1;
    // if (__CALLDEST_CNT__ >= sizeof(__CALLDESTS__) / sizeof(*__CALLDESTS__)) return -1;

    __CALLDESTS__[__CALLDEST_CNT__] = DEST;
    return __CALLDEST_CNT__++;
};

/**
 * Layer 1 of the link between c++ and js script code
 */


__attribute__((import_module("env"), import_name("evalwithref"))) void __EVALWITHREF__(const char* evaluation, __DESTCODE__ dest);

#define EVAL_LINK(calldest, ...) __EVALWITHREF__(#__VA_ARGS__, LINK_CALLDEST(calldest))

__attribute__((import_module("env"), import_name("debugger"))) void DEBUGGER();
__attribute__((import_module("env"), import_name("logstr"))) void LOG(const char* string);
__attribute__((import_module("env"), import_name("logf32"))) void LOG(f32_t value);
__attribute__((import_module("env"), import_name("logi32"))) void LOG(i32_t value);