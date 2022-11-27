#pragma once

#include "call.h"

template <__DESTCODE__ DESTCODE, __CALLDEST__* CALLBACK>
struct __CALLDEST_REGISTER__ {
    __CALLDEST_REGISTER__() {
        __CALLDESTS__[DESTCODE] = CALLBACK;
    };
};