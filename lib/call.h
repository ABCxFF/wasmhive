#pragma once

#include "wasm.h"

/**
 * Provides a link between userscript and script code
 */

typedef u8_t __DESTCODE__;

typedef volatile void* (__CALLDEST__)(void* data);

extern __CALLDEST__* __CALLDESTS__[sizeof(__DESTCODE__) * 0x100];

volatile void* CALL(__DESTCODE__ DEST_CODE, void* DATA);