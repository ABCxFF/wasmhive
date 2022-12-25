#pragma once

/**
 * Wasm types integration
 */

typedef double f64_t;
typedef float f32_t;
typedef long long i64_t;
typedef unsigned long long u64_t;
typedef long i32_t;
typedef unsigned long u32_t;
typedef short i16_t;
typedef unsigned short u16_t;
typedef char i8_t;
typedef unsigned char u8_t;
typedef u8_t bool_t;

#ifndef __cplusplus
    #define nullptr (void*) 0
#endif

#define NULL(X) (void*) X 