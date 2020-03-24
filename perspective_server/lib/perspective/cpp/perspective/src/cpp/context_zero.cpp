/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

#include <perspective/first.h>
#include <perspective/context_base.h>
#include <perspective/get_data_extents.h>
#include <perspective/context_zero.h>
#include <perspective/flat_traversal.h>
#include <perspective/sym_table.h>
#include <perspective/logtime.h>
#include <perspective/filter_utils.h>

namespace perspective {

t_ctx0::t_ctx0() {}

t_ctx0::t_ctx0(const t_schema& schema, const t_config& config)
    : t_ctxbase<t_ctx0>(schema, config)
    , m_minmax(m_config.get_num_columns())
    , m_has_delta(false)

{}

t_ctx0::~t_ctx0() { m_traversal.reset(); }

std::string
t_ctx0::repr() const {
    std::stringstream ss;
    ss << "t_ctx0<" << this << ">";
    return ss.str();
}

void
t_ctx0::step_begin() {
    if (!m_init)
        return;

    m_deltas = std::make_shared<t_zcdeltas>();
    m_delta_pkeys.clear();
    m_rows_changed = false;
    m_columns_changed = false;
    m_traversal->step_begin();
}

void
t_ctx0::step_end() {
    if (!has_deltas()) {
        return;
    }

    m_traversal->step_end();
#ifndef PSP_ENABLE_WASM
    t_uindex ncols = m_config.get_num_columns();
    std::vector<t_minmax> rval(ncols);

    auto pkeys = m_traversal->get_pkeys();
    auto stbl = m_gstate->get_table();

#ifdef PSP_PARALLEL_FOR
    tbb::parallel_for(0, int(ncols), 1,
        [&rval, &stbl, pkeys, this](int colidx)
#else
    for (t_uindex colidx = 0; colidx < ncols; ++colidx)
#endif
        {
            auto colname = m_config.col_at(colidx);

            if (stbl->get_dtype(colname) != DTYPE_STR) {
                auto v = m_gstate->reduce<std::function<std::pair<t_tscalar, t_tscalar>(
                    const std::vector<t_tscalar>&)>>(pkeys, colname, get_vec_min_max);

                rval[colidx].m_min = v.first;
                rval[colidx].m_max = v.second;
            }
        }
#ifdef PSP_PARALLEL_FOR
    );
#endif

    m_minmax = rval;
#endif
}

t_index
t_ctx0::get_row_count() const {
    return m_traversal->size();
}

t_index
t_ctx0::get_column_count() const {
    return m_config.get_num_columns();
}

/**
 * @brief Given a start/end row and column index, return the underlying data for the requested
 * subset.
 *
 * @param start_row
 * @param end_row
 * @param start_col
 * @param end_col
 * @return std::vector<t_tscalar>
 */
std::vector<t_tscalar>
t_ctx0::get_data(t_index start_row, t_index end_row, t_index start_col, t_index end_col) const {
    t_uindex ctx_nrows = get_row_count();
    t_uindex ctx_ncols = get_column_count();
    auto ext = sanitize_get_data_extents(
        ctx_nrows, ctx_ncols, start_row, end_row, start_col, end_col);

    t_index nrows = ext.m_erow - ext.m_srow;
    t_index stride = ext.m_ecol - ext.m_scol;
    std::vector<t_tscalar> values(nrows * stride);

    std::vector<t_tscalar> pkeys = m_traversal->get_pkeys(ext.m_srow, ext.m_erow);
    auto none = mknone();

    for (t_index cidx = ext.m_scol; cidx < ext.m_ecol; ++cidx) {
        std::vector<t_tscalar> out_data(pkeys.size());
        m_gstate->read_column(m_config.col_at(cidx), pkeys, out_data);

        for (t_index ridx = ext.m_srow; ridx < ext.m_erow; ++ridx) {
            auto v = out_data[ridx - ext.m_srow];

            // todo: fix null handling
            if (!v.is_valid())
                v.set(none);

            values[(ridx - ext.m_srow) * stride + (cidx - ext.m_scol)] = v;
        }
    }

    return values;
}

/**
 * @brief Given a vector of row indices, which may not be contiguous, return the underlying data
 * for these rows.
 *
 * @param rows a vector of row indices
 * @return std::vector<t_tscalar> a vector of scalars containing the underlying data
 */
std::vector<t_tscalar>
t_ctx0::get_data(const std::vector<t_uindex>& rows) const {
    t_uindex stride = get_column_count();
    std::vector<t_tscalar> values(rows.size() * stride);
    std::vector<t_tscalar> pkeys = m_traversal->get_pkeys(rows);

    auto none = mknone();
    for (t_uindex cidx = 0; cidx < stride; ++cidx) {
        std::vector<t_tscalar> out_data(rows.size());
        m_gstate->read_column(m_config.col_at(cidx), pkeys, out_data);

        for (t_uindex ridx = 0; ridx < rows.size(); ++ridx) {
            auto v = out_data[ridx];

            if (!v.is_valid())
                v.set(none);

            values[(ridx)*stride + (cidx)] = v;
        }
    }

    return values;
}

void
t_ctx0::sort_by() {
    reset_sortby();
}

void
t_ctx0::sort_by(const std::vector<t_sortspec>& sortby) {
    if (sortby.empty())
        return;
    m_traversal->sort_by(m_gstate, m_config, sortby);
}

void
t_ctx0::reset_sortby() {
    m_traversal->sort_by(m_gstate, m_config, std::vector<t_sortspec>());
}

t_tscalar
t_ctx0::get_column_name(t_index idx) {
    std::string empty("");

    if (idx >= get_column_count())
        return m_symtable.get_interned_tscalar(empty.c_str());

    return m_symtable.get_interned_tscalar(m_config.col_at(idx).c_str());
}

void
t_ctx0::init() {
    m_traversal = std::make_shared<t_ftrav>();
    m_deltas = std::make_shared<t_zcdeltas>();
    m_init = true;
}

std::vector<t_tscalar>
t_ctx0::get_pkeys(const std::vector<std::pair<t_uindex, t_uindex>>& cells) const {
    if (!m_traversal->validate_cells(cells)) {
        std::vector<t_tscalar> rval;
        return rval;
    }
    return m_traversal->get_pkeys(cells);
}

std::vector<t_tscalar>
t_ctx0::get_all_pkeys(const std::vector<std::pair<t_uindex, t_uindex>>& cells) const {
    if (!m_traversal->validate_cells(cells)) {
        std::vector<t_tscalar> rval;
        return rval;
    }
    return m_traversal->get_all_pkeys(cells);
}

std::vector<t_tscalar>
t_ctx0::get_cell_data(const std::vector<std::pair<t_uindex, t_uindex>>& cells) const {
    if (!m_traversal->validate_cells(cells)) {
        std::vector<t_tscalar> rval;
        return rval;
    }

    t_uindex ncols = get_column_count();

    for (const auto& c : cells) {
        if (c.second >= ncols) {
            std::vector<t_tscalar> rval;
            return rval;
        }
    }

    // Order aligned with cells
    std::vector<t_tscalar> pkeys = get_all_pkeys(cells);
    std::vector<t_tscalar> out_data;
    out_data.reserve(cells.size());

    for (t_index idx = 0, loop_end = pkeys.size(); idx < loop_end; ++idx) {
        std::string colname = m_config.col_at(cells[idx].second);
        out_data.push_back(m_gstate->get(pkeys[idx], colname));
    }

    return out_data;
}

/**
 * @brief
 *
 * @param bidx
 * @param eidx
 * @return std::vector<t_cellupd>
 */
std::vector<t_cellupd>
t_ctx0::get_cell_delta(t_index bidx, t_index eidx) const {
    tsl::hopscotch_set<t_tscalar> pkeys;
    t_tscalar prev_pkey;
    prev_pkey.set(t_none());

    bidx = std::min(bidx, m_traversal->size());
    eidx = std::min(eidx, m_traversal->size());

    std::vector<t_cellupd> rval;

    if (m_traversal->empty_sort_by()) {
        std::vector<t_tscalar> pkey_vec = m_traversal->get_pkeys(bidx, eidx);
        for (t_index idx = 0, loop_end = pkey_vec.size(); idx < loop_end; ++idx) {
            const t_tscalar& pkey = pkey_vec[idx];
            t_index row = bidx + idx;
            std::pair<t_zcdeltas::index<by_zc_pkey_colidx>::type::iterator,
                t_zcdeltas::index<by_zc_pkey_colidx>::type::iterator>
                iters = m_deltas->get<by_zc_pkey_colidx>().equal_range(pkey);
            for (t_zcdeltas::index<by_zc_pkey_colidx>::type::iterator iter = iters.first;
                 iter != iters.second; ++iter) {
                t_cellupd cellupd;
                cellupd.row = row;
                cellupd.column = iter->m_colidx;
                cellupd.old_value = iter->m_old_value;
                cellupd.new_value = iter->m_new_value;
                rval.push_back(cellupd);
            }
        }
    } else {
        for (t_zcdeltas::index<by_zc_pkey_colidx>::type::iterator iter
             = m_deltas->get<by_zc_pkey_colidx>().begin();
             iter != m_deltas->get<by_zc_pkey_colidx>().end(); ++iter) {
            if (prev_pkey != iter->m_pkey) {
                pkeys.insert(iter->m_pkey);
                prev_pkey = iter->m_pkey;
            }
        }

        tsl::hopscotch_map<t_tscalar, t_index> r_indices;
        m_traversal->get_row_indices(pkeys, r_indices);

        for (t_zcdeltas::index<by_zc_pkey_colidx>::type::iterator iter
             = m_deltas->get<by_zc_pkey_colidx>().begin();
             iter != m_deltas->get<by_zc_pkey_colidx>().end(); ++iter) {
            t_index row = r_indices[iter->m_pkey];
            if (bidx <= row && row <= eidx) {
                t_cellupd cellupd;
                cellupd.row = row;
                cellupd.column = iter->m_colidx;
                cellupd.old_value = iter->m_old_value;
                cellupd.new_value = iter->m_new_value;
                rval.push_back(cellupd);
            }
        }
    }
    return rval;
}

/**
 * @brief Returns updated cells.
 *
 * @param bidx
 * @param eidx
 * @return t_stepdelta
 */
t_stepdelta
t_ctx0::get_step_delta(t_index bidx, t_index eidx) {
    bidx = std::min(bidx, m_traversal->size());
    eidx = std::min(eidx, m_traversal->size());
    bool rows_changed = m_rows_changed || !m_traversal->empty_sort_by();
    t_stepdelta rval(rows_changed, m_columns_changed, get_cell_delta(bidx, eidx));
    m_deltas->clear();
    clear_deltas();
    return rval;
}

/**
 * @brief Returns a `t_rowdelta` struct containing data from updated rows and the updated row
 * indices.
 *
 * @return t_rowdelta
 */
t_rowdelta
t_ctx0::get_row_delta() {
    bool rows_changed = m_rows_changed || !m_traversal->empty_sort_by();
    tsl::hopscotch_set<t_tscalar> pkeys = get_delta_pkeys();
    std::vector<t_uindex> rows = m_traversal->get_row_indices(pkeys);
    std::sort(rows.begin(), rows.end());
    std::vector<t_tscalar> data = get_data(rows);
    t_rowdelta rval(rows_changed, rows.size(), data);
    clear_deltas();
    return rval;
}

const tsl::hopscotch_set<t_tscalar>&
t_ctx0::get_delta_pkeys() const {
    return m_delta_pkeys;
}

std::vector<std::string>
t_ctx0::get_column_names() const {
    return m_config.get_column_names();
}

std::vector<t_sortspec>
t_ctx0::get_sort_by() const {
    return m_traversal->get_sort_by();
}

void
t_ctx0::reset() {
    m_traversal->reset();
    m_deltas = std::make_shared<t_zcdeltas>();
    m_minmax = std::vector<t_minmax>(m_config.get_num_columns());
    m_has_delta = false;
}

t_index
t_ctx0::sidedness() const {
    return 0;
}

/**
 * @brief Handle additions and new data, calculating deltas along the way.
 *
 * @param flattened
 * @param delta
 * @param prev
 * @param curr
 * @param transitions
 * @param existed
 */
void
t_ctx0::notify(const t_data_table& flattened, const t_data_table& delta,
    const t_data_table& prev, const t_data_table& curr, const t_data_table& transitions,
    const t_data_table& existed) {
    psp_log_time(repr() + " notify.enter");
    t_uindex nrecs = flattened.size();
    std::shared_ptr<const t_column> pkey_sptr = flattened.get_const_column("psp_pkey");
    std::shared_ptr<const t_column> op_sptr = flattened.get_const_column("psp_op");
    const t_column* pkey_col = pkey_sptr.get();
    const t_column* op_col = op_sptr.get();

    std::shared_ptr<const t_column> existed_sptr = existed.get_const_column("psp_existed");
    const t_column* existed_col = existed_sptr.get();

    bool delete_encountered = false;
    if (m_config.has_filters()) {
        t_mask msk_prev = filter_table_for_config(prev, m_config);
        t_mask msk_curr = filter_table_for_config(curr, m_config);

        for (t_uindex idx = 0; idx < nrecs; ++idx) {
            t_tscalar pkey = m_symtable.get_interned_tscalar(pkey_col->get_scalar(idx));

            std::uint8_t op_ = *(op_col->get_nth<std::uint8_t>(idx));
            t_op op = static_cast<t_op>(op_);
            bool existed = *(existed_col->get_nth<bool>(idx));

            switch (op) {
                case OP_INSERT: {
                    bool filter_curr = msk_curr.get(idx);
                    bool filter_prev = msk_prev.get(idx) && existed;

                    if (filter_prev) {
                        if (filter_curr) {
                            m_traversal->update_row(m_gstate, m_config, pkey);
                        } else {
                            m_traversal->delete_row(pkey);
                        }
                    } else {
                        if (filter_curr) {
                            m_traversal->add_row(m_gstate, m_config, pkey);
                        }
                    }
                } break;
                case OP_DELETE: {
                    m_traversal->delete_row(pkey);
                    delete_encountered = true;
                } break;
                default: { PSP_COMPLAIN_AND_ABORT("Unexpected OP"); } break;
            }

            // add the pkey for updated rows
            add_delta_pkey(pkey);
        }
        psp_log_time(repr() + " notify.has_filter_path.updated_traversal");

        // calculate deltas
        calc_step_delta(flattened, prev, curr, transitions);
        m_has_delta = m_deltas->size() > 0 || m_delta_pkeys.size() > 0 || delete_encountered;

        psp_log_time(repr() + " notify.has_filter_path.exit");

        return;
    }

    for (t_uindex idx = 0; idx < nrecs; ++idx) {
        t_tscalar pkey = m_symtable.get_interned_tscalar(pkey_col->get_scalar(idx));
        std::uint8_t op_ = *(op_col->get_nth<std::uint8_t>(idx));
        t_op op = static_cast<t_op>(op_);
        bool existed = *(existed_col->get_nth<bool>(idx));

        switch (op) {
            case OP_INSERT: {
                if (existed) {
                    m_traversal->update_row(m_gstate, m_config, pkey);
                } else {
                    m_traversal->add_row(m_gstate, m_config, pkey);
                }
            } break;
            case OP_DELETE: {
                m_traversal->delete_row(pkey);
                delete_encountered = true;
            } break;
            default: { PSP_COMPLAIN_AND_ABORT("Unexpected OP"); } break;
        }

        // add the pkey for updated rows
        add_delta_pkey(pkey);
    }

    psp_log_time(repr() + " notify.no_filter_path.updated_traversal");

    // calculate deltas
    calc_step_delta(flattened, prev, curr, transitions);
    m_has_delta = m_deltas->size() > 0 || m_delta_pkeys.size() > 0 || delete_encountered;

    psp_log_time(repr() + " notify.no_filter_path.exit");
}

/**
 * @brief Handle the addition of new data.
 *
 * @param flattened
 */
void
t_ctx0::notify(const t_data_table& flattened) {
    t_uindex nrecs = flattened.size();
    std::shared_ptr<const t_column> pkey_sptr = flattened.get_const_column("psp_pkey");
    std::shared_ptr<const t_column> op_sptr = flattened.get_const_column("psp_op");
    const t_column* pkey_col = pkey_sptr.get();
    const t_column* op_col = op_sptr.get();

    m_has_delta = true;

    if (m_config.has_filters()) {
        t_mask msk = filter_table_for_config(flattened, m_config);

        for (t_uindex idx = 0; idx < nrecs; ++idx) {
            t_tscalar pkey = m_symtable.get_interned_tscalar(pkey_col->get_scalar(idx));
            std::uint8_t op_ = *(op_col->get_nth<std::uint8_t>(idx));
            t_op op = static_cast<t_op>(op_);

            switch (op) {
                case OP_INSERT: {
                    if (msk.get(idx)) {
                        m_traversal->add_row(m_gstate, m_config, pkey);
                    }
                } break;
                default: {
                    // pass
                } break;
            }
        }
        return;
    }

    for (t_uindex idx = 0; idx < nrecs; ++idx) {
        t_tscalar pkey = m_symtable.get_interned_tscalar(pkey_col->get_scalar(idx));
        std::uint8_t op_ = *(op_col->get_nth<std::uint8_t>(idx));
        t_op op = static_cast<t_op>(op_);

        switch (op) {
            case OP_INSERT: {
                m_traversal->add_row(m_gstate, m_config, pkey);
            } break;
            default: { } break; }
    }
}

void
t_ctx0::calc_step_delta(const t_data_table& flattened, const t_data_table& prev,
    const t_data_table& curr, const t_data_table& transitions) {
    t_uindex nrows = flattened.size();

    PSP_VERBOSE_ASSERT(prev.size() == nrows, "Shape violation detected");
    PSP_VERBOSE_ASSERT(curr.size() == nrows, "Shape violation detected");

    const t_column* pkey_col = flattened.get_const_column("psp_pkey").get();

    t_uindex ncols = m_config.get_num_columns();
    const auto& column_names = m_config.get_column_names();

    for (const auto& name : column_names) {
        auto cidx = m_config.get_colidx(name);
        const t_column* tcol = transitions.get_const_column(name).get();
        const t_column* pcol = prev.get_const_column(name).get();
        const t_column* ccol = curr.get_const_column(name).get();

        for (t_uindex ridx = 0; ridx < nrows; ++ridx) {
            const std::uint8_t* trans_ = tcol->get_nth<std::uint8_t>(ridx);
            std::uint8_t trans = *trans_;
            t_value_transition tr = static_cast<t_value_transition>(trans);

            switch (tr) {
                case VALUE_TRANSITION_NVEQ_FT:
                case VALUE_TRANSITION_NEQ_FT:
                case VALUE_TRANSITION_NEQ_TDT: {
                    m_deltas->insert(t_zcdelta(get_interned_tscalar(pkey_col->get_scalar(ridx)),
                        cidx, mknone(), get_interned_tscalar(ccol->get_scalar(ridx))));
                } break;
                case VALUE_TRANSITION_NEQ_TT: {
                    m_deltas->insert(t_zcdelta(get_interned_tscalar(pkey_col->get_scalar(ridx)),
                        cidx, get_interned_tscalar(pcol->get_scalar(ridx)),
                        get_interned_tscalar(ccol->get_scalar(ridx))));
                } break;
                default: {}
            }
        }
    }
}

/**
 * @brief Mark a primary key as updated by adding it to the tracking set.
 *
 * @param pkey
 */
void
t_ctx0::add_delta_pkey(t_tscalar pkey) {
    m_delta_pkeys.insert(pkey);
}

std::vector<t_minmax>
t_ctx0::get_min_max() const {
    return m_minmax;
}

void
t_ctx0::reset_step_state() {
    m_traversal->reset_step_state();
}

void
t_ctx0::disable() {
    m_features[CTX_FEAT_ENABLED] = false;
}

void
t_ctx0::enable() {
    m_features[CTX_FEAT_ENABLED] = true;
}

bool
t_ctx0::get_deltas_enabled() const {
    return m_features[CTX_FEAT_DELTA];
}

void
t_ctx0::set_deltas_enabled(bool enabled_state) {
    m_features[CTX_FEAT_DELTA] = enabled_state;
}

std::vector<t_stree*>
t_ctx0::get_trees() {
    return std::vector<t_stree*>();
}

bool
t_ctx0::has_deltas() const {
    return m_has_delta;
}

void
t_ctx0::pprint() const {}

t_dtype
t_ctx0::get_column_dtype(t_uindex idx) const {
    if (idx >= static_cast<t_uindex>(get_column_count()))
        return DTYPE_NONE;

    auto cname = m_config.col_at(idx);

    if (!m_schema.has_column(cname))
        return DTYPE_NONE;

    return m_schema.get_dtype(cname);
}

std::vector<t_tscalar>
t_ctx0::unity_get_row_data(t_uindex idx) const {
    return get_data(idx, idx + 1, 0, get_column_count());
}

std::vector<t_tscalar>
t_ctx0::unity_get_column_data(t_uindex idx) const {
    PSP_COMPLAIN_AND_ABORT("Not implemented");
    return std::vector<t_tscalar>();
}

std::vector<t_tscalar>
t_ctx0::unity_get_row_path(t_uindex idx) const {
    return std::vector<t_tscalar>(mktscalar(idx));
}

std::vector<t_tscalar>
t_ctx0::unity_get_column_path(t_uindex idx) const {
    return std::vector<t_tscalar>();
}

t_uindex
t_ctx0::unity_get_row_depth(t_uindex ridx) const {
    return 0;
}

t_uindex
t_ctx0::unity_get_column_depth(t_uindex cidx) const {
    return 0;
}

std::string
t_ctx0::unity_get_column_name(t_uindex idx) const {
    return m_config.col_at(idx);
}

std::string
t_ctx0::unity_get_column_display_name(t_uindex idx) const {
    return m_config.col_at(idx);
}

std::vector<std::string>
t_ctx0::unity_get_column_names() const {
    return m_config.get_column_names();
}

std::vector<std::string>
t_ctx0::unity_get_column_display_names() const {
    return m_config.get_column_names();
}

t_uindex
t_ctx0::unity_get_column_count() const {
    return get_column_count();
}

t_uindex
t_ctx0::unity_get_row_count() const {
    return get_row_count();
}

bool
t_ctx0::unity_get_row_expanded(t_uindex idx) const {
    return false;
}

bool
t_ctx0::unity_get_column_expanded(t_uindex idx) const {
    return false;
}

void
t_ctx0::clear_deltas() {
    m_has_delta = false;
}

void
t_ctx0::unity_init_load_step_end() {}

} // end namespace perspective
