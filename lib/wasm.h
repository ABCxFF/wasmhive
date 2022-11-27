#pragma once

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

#ifdef __cplusplus
    #define NULL nullptr;
#else
    #define NULL 0
#endif
