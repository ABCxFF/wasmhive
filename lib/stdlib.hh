#pragma once

#include "wasm.h"

int strlen(const char* str) {
    int i = 0;
    while (str[i] != 0) i += 1;

    return i;
};

int strcat(char* str, const char* suffix) {
    int i = 0, k = 0;
    while (str[i] != 0) i += 1;
    while (suffix[k] != 0) str[i++] = suffix[k++];

    str[i] = 0;

    return i;
};

void memcpy(void* buffer, void* mem, u32_t size) {
    for (int i = size; i --> 0; ) {
        ((char*) buffer)[i] = ((char*) mem)[i];
    };
};

void bzero(void* buffer, u32_t size) {
    for (int i = size; i --> 0; ) {
        ((char*) buffer)[i] = 0;
    };
};