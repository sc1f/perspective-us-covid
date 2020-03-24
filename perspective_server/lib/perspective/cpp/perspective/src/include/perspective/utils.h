/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

#pragma once
#include <perspective/first.h>
#include <perspective/raw_types.h>
#include <sstream>
#include <iomanip>
#include <set>
#include <algorithm>
#include <functional>
#include <chrono>
#include <cctype>
#include <locale>

namespace perspective {
inline std::uint32_t
lower32(std::uint64_t v) {
    return static_cast<std::uint32_t>(v);
}

inline std::uint32_t
upper32(std::uint64_t v) {
    return v >> 32;
}

template <typename T>
std::string
str_(const T& value, const std::string& fill, std::int32_t width) {
    std::stringstream ss;
    ss << std::setfill('0') << std::setw(width) << value;
    return ss.str();
}

template <typename T>
std::string
str_(const T& value) {
    return str_(value, "0", 2);
}

std::string unique_path(const std::string& path_prefix);

template <typename DATA_T>
void
set_to_vec(const std::set<DATA_T>& s, std::vector<DATA_T>& out_v) {
    std::vector<DATA_T> rval(s.size());
    std::copy(s.begin(), s.end(), rval.begin());
    std::swap(out_v, rval);
}

template <typename DATA_T>
void
vec_to_set(const std::vector<DATA_T>& v, std::set<DATA_T>& out_s) {
    for (t_index idx = 0, loop_end = v.size(); idx < loop_end; ++idx) {
        out_s.insert(v[idx]);
    }
}

inline void
ltrim_inplace(std::string& s) {
    s.erase(s.begin(),
        std::find_if(s.begin(), s.end(), std::not1(std::ptr_fun<int, int>(std::isspace))));
}

inline void
rtrim_inplace(std::string& s) {
    s.erase(std::find_if(s.rbegin(), s.rend(), std::not1(std::ptr_fun<int, int>(std::isspace)))
                .base(),
        s.end());
}

inline void
trim_inplace(std::string& s) {
    ltrim_inplace(s);
    rtrim_inplace(s);
}

inline std::string
ltrimmed(std::string s) {
    ltrim_inplace(s);
    return s;
}

inline std::string
rtrimmed(std::string s) {
    rtrim_inplace(s);
    return s;
}

inline std::string
trimmed(std::string s) {
    trim_inplace(s);
    return s;
}

inline std::vector<std::string>
split(const std::string& s, char delim) {
    std::vector<std::string> elems;
    std::stringstream ss;
    ss.str(s);
    std::string item;
    while (std::getline(ss, item, delim)) {
        if (!item.empty())
            elems.push_back(item);
    }
    return elems;
}

enum t_color_code {
    FG_RED = 31,
    FG_GREEN = 32,
    FG_BLUE = 34,
    FG_DEFAULT = 39,
    BG_RED = 41,
    BG_GREEN = 42,
    BG_BLUE = 44,
    BG_DEFAULT = 49
};

class t_cmod {
    t_color_code m_code;

public:
    t_cmod(t_color_code code)
        : m_code(code) {}

    inline friend std::ostream&
    operator<<(std::ostream& os, const t_cmod& mod) {
#ifdef WIN32
        return os << "";
#else
        return os << "\033[" << mod.m_code << "m";
#endif
    }
};

struct t_ns_timer {
    std::chrono::high_resolution_clock::time_point m_t0;
    std::function<void(int)> m_cb;

    t_ns_timer(std::function<void(int)> callback)
        : m_t0(std::chrono::high_resolution_clock::now())
        , m_cb(callback) {}
    ~t_ns_timer(void) {
        auto nanos = std::chrono::duration_cast<std::chrono::nanoseconds>(
            std::chrono::high_resolution_clock::now() - m_t0)
                         .count();

        m_cb(static_cast<int>(nanos));
    }
};

inline std::string
join_str(const std::vector<std::string>& terms, const std::string& sep) {
    if (terms.empty())
        return "";

    if (terms.size() == 1)
        return terms[0];

    std::string rv;

    for (size_t idx = 0, loop_end = terms.size() - 1; idx < loop_end; ++idx) {
        rv = rv + terms[idx] + sep;
    }

    rv = rv + terms.back();
    return rv;
}
} // namespace perspective
