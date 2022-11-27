#pragma once

#include "call.h"
#include "wasm.h"

#ifdef __cplusplus
    extern "C" void* malloc(u32_t n);
    extern "C" void* free(u32_t n);
#else
    void* malloc(u32_t n);
    void free(void* p);
#endif


