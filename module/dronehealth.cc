#include "global.h"
#include "../lib/call.hh"
#include "arras/fasttalk.hh"

namespace DroneHealth {
    void hook(fasttalker_t* arg0, u32_t arg1, u32_t arg2, u32_t arg3, u32_t arg4) {
        fastword_t* pos_cache = arg0->pos;
        i32_t flags = arg0->nex()->getI32Value();
        if (flags & 1) { arg0->nex(); arg0->nex(); }
        if (flags & 2) arg0->nex();
        if (flags & 4) {
            fastword_t* display_flags = arg0->nex();
            display_flags->setI32Value(display_flags->getI32Value() | 4);
        }

        arg0->pos = pos_cache;
    }

    volatile void* calldest(void* raw) {
        u32_t* params = (u32_t*) raw;

        hook((fasttalker_t*) params[0], params[1], params[2], params[3], params[4]);
        return nullptr;
    }

    __CALLDEST_REGISTER__<SCRIPT_DRONEHEALTH, calldest> reg;
}
