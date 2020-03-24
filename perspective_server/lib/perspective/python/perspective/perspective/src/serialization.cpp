/******************************************************************************
 *
 * Copyright (c) 2019, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

#ifdef PSP_ENABLE_PYTHON
#include <perspective/base.h>
#include <perspective/binding.h>
#include <perspective/python/serialization.h>
#include <perspective/python/base.h>
#include <perspective/python/utils.h>

namespace perspective {
namespace binding {

/******************************************************************************
 *
 * Data serialization
 */

template <>
t_val
get_column_data(std::shared_ptr<t_data_table> table, const std::string& colname) {
    py::array arr = py::array();
    // TODO
    // auto col = table->get_column(colname);
    // for (auto idx = 0; idx < col->size(); ++idx) {
    //     arr[idx] = py::cast(col->get_scalar(idx));
    // }
    return arr;
}

template <typename CTX_T>
std::shared_ptr<t_data_slice<CTX_T>>
get_data_slice(std::shared_ptr<View<CTX_T>> view, std::uint32_t start_row,
    std::uint32_t end_row, std::uint32_t start_col, std::uint32_t end_col) {
    auto data_slice = view->get_data(start_row, end_row, start_col, end_col);
    return data_slice;
}

std::shared_ptr<t_data_slice<t_ctx0>>
get_data_slice_ctx0(std::shared_ptr<View<t_ctx0>> view, std::uint32_t start_row,
    std::uint32_t end_row, std::uint32_t start_col, std::uint32_t end_col) {
    return get_data_slice<t_ctx0>(view, start_row, end_row, start_col, end_col);
}

std::shared_ptr<t_data_slice<t_ctx1>>
get_data_slice_ctx1(std::shared_ptr<View<t_ctx1>> view, std::uint32_t start_row,
    std::uint32_t end_row, std::uint32_t start_col, std::uint32_t end_col) {
    return get_data_slice<t_ctx1>(view, start_row, end_row, start_col, end_col);
}

std::shared_ptr<t_data_slice<t_ctx2>>
get_data_slice_ctx2(std::shared_ptr<View<t_ctx2>> view, std::uint32_t start_row,
    std::uint32_t end_row, std::uint32_t start_col, std::uint32_t end_col) {
    return get_data_slice<t_ctx2>(view, start_row, end_row, start_col, end_col);
}

template <typename CTX_T>
t_val
get_from_data_slice(
    std::shared_ptr<t_data_slice<CTX_T>> data_slice, t_uindex ridx, t_uindex cidx) {
    auto d = data_slice->get(ridx, cidx);
    return scalar_to_py(d);
}

t_val
get_from_data_slice_ctx0(
    std::shared_ptr<t_data_slice<t_ctx0>> data_slice, t_uindex ridx, t_uindex cidx) {
    return get_from_data_slice<t_ctx0>(data_slice, ridx, cidx);
}

t_val
get_from_data_slice_ctx1(
    std::shared_ptr<t_data_slice<t_ctx1>> data_slice, t_uindex ridx, t_uindex cidx) {
    return get_from_data_slice<t_ctx1>(data_slice, ridx, cidx);
}

t_val
get_from_data_slice_ctx2(
    std::shared_ptr<t_data_slice<t_ctx2>> data_slice, t_uindex ridx, t_uindex cidx) {
    return get_from_data_slice<t_ctx2>(data_slice, ridx, cidx);
}

template <typename CTX_T>
std::vector<t_val>
get_pkeys_from_data_slice(std::shared_ptr<t_data_slice<CTX_T>> data_slice, t_uindex ridx, t_uindex cidx) {
    std::vector<t_val> rval;
    std::vector<t_tscalar> pkeys = data_slice->get_pkeys(ridx, cidx);
    for (const auto& pk : pkeys) {
        rval.push_back(scalar_to_py(pk));
    }
    return rval;
}

std::vector<t_val>
get_pkeys_from_data_slice_ctx0(std::shared_ptr<t_data_slice<t_ctx0>> data_slice, t_uindex ridx, t_uindex cidx) {
    return get_pkeys_from_data_slice<t_ctx0>(data_slice, ridx, cidx);
}

std::vector<t_val>
get_pkeys_from_data_slice_ctx1(std::shared_ptr<t_data_slice<t_ctx1>> data_slice, t_uindex ridx, t_uindex cidx) {
    return get_pkeys_from_data_slice<t_ctx1>(data_slice, ridx, cidx);;
}

std::vector<t_val>
get_pkeys_from_data_slice_ctx2(std::shared_ptr<t_data_slice<t_ctx2>> data_slice, t_uindex ridx, t_uindex cidx) {
    return get_pkeys_from_data_slice<t_ctx2>(data_slice, ridx, cidx);
}

} // end namespace binding
} // end namespace perspective

#endif