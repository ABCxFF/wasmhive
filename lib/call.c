#include "call.h"
#include "wasm.h"

__CALLDEST__* __CALLDESTS__[sizeof(__DESTCODE__) * 0x100] = {};
volatile void* CALL(__DESTCODE__ DEST_CODE, void* DATA) __attribute__((export_name("call"))) {
    if (__CALLDESTS__[DEST_CODE]) return __CALLDESTS__[DEST_CODE](DATA);

    return (volatile void*) -1;
};