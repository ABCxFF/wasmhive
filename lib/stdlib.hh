#pragma once

#include "wasm.h"
#include "link.hh"

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

template <typename T, i32_t cap>
class static_vector {
    T* content = mass;
    i32_t length = 0;
    T mass[cap];

public:
    i32_t size() {
        return this->length;
    }
    i32_t capacity() {
        return cap;
    }
    T* data() {
        return this->content;
    }
    i32_t max_size() {
        return cap;
    }
    bool_t empty() {
        return this->size() == 0;
    }
    void clear() {
        this->length = 0;
    }
    bool_t insert(i32_t idx, const T& value) {
        if (idx < 0 || idx > this->length) return false;
        if (this->length + 1 > cap) return false;

        this->length += 1;
        i32_t pos = this->length + 1;
        while (pos --> idx) {
            this->content[pos] = this->content[pos - 1];
        }
        this->content[pos] = value;

        return true;
    }
    bool_t push_back(const T& value) {
        return this->insert(this->length, value);
    }
    bool_t erase(i32_t idx) {
        if (idx < 0 || idx >= this->length) return false;

        while (++idx < this->length - 1) {
            this->content[idx - 1] = this->content[idx];
        }

        this->length -= 1;

        return true;
    }
    void pop_back() {
        this->erase(this->length - 1);
    }
    T& at(i32_t idx) {
        return this->content[idx];
    }
    T& operator[](i32_t idx) {
        return this->at(idx);
    }
};

inline void __unreachable__() {
    asm("unreachable");
}


void abort() {
    __unreachable__();
}

void assert(bool_t passes) {
    if (passes == false) abort();
}

void assert(bool_t passes, const char* message) {
    if (passes == false) {
        ALERT(message);
        abort();
    }
}