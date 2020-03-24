/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

#include <perspective/first.h>
#include <perspective/get_data_extents.h>
#include <perspective/context_grouped_pkey.h>
#include <perspective/extract_aggregate.h>
#include <perspective/filter.h>
#include <perspective/sparse_tree.h>
#include <perspective/tree_context_common.h>
#include <perspective/sparse_tree_node.h>
#include <perspective/logtime.h>
#include <perspective/traversal.h>
#include <perspective/env_vars.h>
#include <perspective/filter_utils.h>
#include <queue>
#include <tuple>
#include <tsl/hopscotch_set.h>

namespace perspective {

t_ctx_grouped_pkey::t_ctx_grouped_pkey()
    : m_depth(0)
    , m_depth_set(false) {}

t_ctx_grouped_pkey::t_ctx_grouped_pkey(t_schema schema, t_config config)
    : m_depth(0)
    , m_depth_set(false) {
    PSP_COMPLAIN_AND_ABORT("Not Implemented");
}

t_ctx_grouped_pkey::~t_ctx_grouped_pkey() {}

void
t_ctx_grouped_pkey::init() {
    auto pivots = m_config.get_row_pivots();
    m_tree = std::make_shared<t_stree>(pivots, m_config.get_aggregates(), m_schema, m_config);
    m_tree->init();
    m_traversal = std::shared_ptr<t_traversal>(new t_traversal(m_tree));
    m_minmax = std::vector<t_minmax>(m_config.get_num_aggregates());
    m_init = true;
}

t_index
t_ctx_grouped_pkey::get_row_count() const {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    return m_traversal->size();
}

t_index
t_ctx_grouped_pkey::get_column_count() const {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    return m_config.get_num_columns() + 1;
}

t_index
t_ctx_grouped_pkey::open(t_header header, t_index idx) {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    return open(idx);
}

std::string
t_ctx_grouped_pkey::repr() const {
    std::stringstream ss;
    ss << "t_ctx_grouped_pkey<" << this << ">";
    return ss.str();
}

t_index
t_ctx_grouped_pkey::open(t_index idx) {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    // If we manually open/close a node, stop automatically expanding
    m_depth_set = false;
    m_depth = 0;

    if (idx >= t_index(m_traversal->size()))
        return 0;

    t_index retval = m_traversal->expand_node(m_sortby, idx);
    m_rows_changed = (retval > 0);
    return retval;
}

t_index
t_ctx_grouped_pkey::close(t_index idx) {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    // If we manually open/close a node, stop automatically expanding
    m_depth_set = false;
    m_depth = 0;

    if (idx >= t_index(m_traversal->size()))
        return 0;

    t_index retval = m_traversal->collapse_node(idx);
    m_rows_changed = (retval > 0);
    return retval;
}

std::vector<t_tscalar>
t_ctx_grouped_pkey::get_data(
    t_index start_row, t_index end_row, t_index start_col, t_index end_col) const {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    t_uindex ctx_nrows = get_row_count();
    t_uindex ncols = get_column_count();
    auto ext
        = sanitize_get_data_extents(ctx_nrows, ncols, start_row, end_row, start_col, end_col);

    t_index nrows = ext.m_erow - ext.m_srow;
    t_index stride = ext.m_ecol - ext.m_scol;
    std::vector<t_tscalar> values(nrows * stride);
    std::vector<t_tscalar> tmpvalues(nrows * ncols);

    std::vector<const t_column*> aggcols(m_config.get_num_aggregates());

    if (aggcols.empty())
        return values;

    auto aggtable = m_tree->get_aggtable();
    t_schema aggschema = aggtable->get_schema();

    for (t_uindex aggidx = 0, loop_end = aggcols.size(); aggidx < loop_end; ++aggidx) {
        const std::string& aggname = aggschema.m_columns[aggidx];
        aggcols[aggidx] = aggtable->get_const_column(aggname).get();
    }

    const std::vector<t_aggspec>& aggspecs = m_config.get_aggregates();

    const std::string& grouping_label_col = m_config.get_grouping_label_column();

    for (t_index ridx = ext.m_srow; ridx < ext.m_erow; ++ridx) {
        t_index nidx = m_traversal->get_tree_index(ridx);
        t_index pnidx = m_tree->get_parent_idx(nidx);

        t_uindex agg_ridx = m_tree->get_aggidx(nidx);
        t_index agg_pridx = pnidx == INVALID_INDEX ? INVALID_INDEX : m_tree->get_aggidx(pnidx);

        t_tscalar tree_value = m_tree->get_value(nidx);

        if (m_has_label && ridx > 0) {
            // Get pkey
            auto iters = m_tree->get_pkeys_for_leaf(nidx);
            tree_value.set(m_gstate->get_value(iters.first->m_pkey, grouping_label_col));
        }

        tmpvalues[(ridx - ext.m_srow) * ncols] = tree_value;

        for (t_index aggidx = 0, loop_end = aggcols.size(); aggidx < loop_end; ++aggidx) {
            t_tscalar value
                = extract_aggregate(aggspecs[aggidx], aggcols[aggidx], agg_ridx, agg_pridx);

            tmpvalues[(ridx - ext.m_srow) * ncols + 1 + aggidx].set(value);
        }
    }

    for (auto ridx = ext.m_srow; ridx < ext.m_erow; ++ridx) {
        for (auto cidx = ext.m_scol; cidx < ext.m_ecol; ++cidx) {
            auto insert_idx = (ridx - ext.m_srow) * stride + cidx - ext.m_scol;
            auto src_idx = (ridx - ext.m_srow) * ncols + cidx;
            values[insert_idx].set(tmpvalues[src_idx]);
        }
    }
    return values;
}

void
t_ctx_grouped_pkey::notify(const t_data_table& flattened, const t_data_table& delta,
    const t_data_table& prev, const t_data_table& current, const t_data_table& transitions,
    const t_data_table& existed) {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    rebuild();
}

void
t_ctx_grouped_pkey::step_begin() {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    reset_step_state();
}

void
t_ctx_grouped_pkey::step_end() {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    m_minmax = m_tree->get_min_max();
    sort_by(m_sortby);
    if (m_depth_set) {
        set_depth(m_depth);
    }
}

std::vector<t_aggspec>
t_ctx_grouped_pkey::get_aggregates() const {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    return m_config.get_aggregates();
}

std::vector<t_tscalar>
t_ctx_grouped_pkey::get_row_path(t_index idx) const {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    return ctx_get_path(m_tree, m_traversal, idx);
}

void
t_ctx_grouped_pkey::reset_sortby() {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    m_sortby = std::vector<t_sortspec>();
}

std::vector<t_path>
t_ctx_grouped_pkey::get_expansion_state() const {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    return ctx_get_expansion_state(m_tree, m_traversal);
}

void
t_ctx_grouped_pkey::set_expansion_state(const std::vector<t_path>& paths) {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    ctx_set_expansion_state(*this, HEADER_ROW, m_tree, m_traversal, paths);
}

void
t_ctx_grouped_pkey::expand_path(const std::vector<t_tscalar>& path) {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    ctx_expand_path(*this, HEADER_ROW, m_tree, m_traversal, path);
}

t_stree*
t_ctx_grouped_pkey::_get_tree() {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    return m_tree.get();
}

t_tscalar
t_ctx_grouped_pkey::get_tree_value(t_index nidx) const {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    return m_tree->get_value(nidx);
}

std::vector<t_ftreenode>
t_ctx_grouped_pkey::get_flattened_tree(t_index idx, t_depth stop_depth) {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    return ctx_get_flattened_tree(idx, stop_depth, *(m_traversal.get()), m_config, m_sortby);
}

std::shared_ptr<const t_traversal>
t_ctx_grouped_pkey::get_traversal() const {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    return m_traversal;
}

void
t_ctx_grouped_pkey::sort_by(const std::vector<t_sortspec>& sortby) {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    psp_log_time(repr() + " sort_by.enter");
    m_sortby = sortby;
    if (m_sortby.empty()) {
        return;
    }
    m_traversal->sort_by(m_config, sortby, *this);
    psp_log_time(repr() + " sort_by.exit");
}

void
t_ctx_grouped_pkey::set_depth(t_depth depth) {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    t_depth final_depth = std::min<t_depth>(m_config.get_num_rpivots() - 1, depth);
    t_index retval = 0;
    retval = m_traversal->set_depth(m_sortby, final_depth);
    m_rows_changed = (retval > 0);
    m_depth = depth;
    m_depth_set = true;
}

std::vector<t_tscalar>
t_ctx_grouped_pkey::get_pkeys(const std::vector<std::pair<t_uindex, t_uindex>>& cells) const {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");

    if (!m_traversal->validate_cells(cells)) {
        std::vector<t_tscalar> rval;
        return rval;
    }

    std::vector<t_tscalar> rval;

    tsl::hopscotch_set<t_uindex> seen;

    for (const auto& c : cells) {
        auto ptidx = m_traversal->get_tree_index(c.first);

        if (static_cast<t_uindex>(ptidx) == static_cast<t_uindex>(-1))
            continue;

        if (seen.find(ptidx) == seen.end()) {
            auto iters = m_tree->get_pkeys_for_leaf(ptidx);
            for (auto iter = iters.first; iter != iters.second; ++iter) {
                rval.push_back(iter->m_pkey);
            }
            seen.insert(ptidx);
        }

        auto desc = m_tree->get_descendents(ptidx);

        for (auto d : desc) {
            if (seen.find(d) != seen.end())
                continue;

            auto iters = m_tree->get_pkeys_for_leaf(d);
            for (auto iter = iters.first; iter != iters.second; ++iter) {
                rval.push_back(iter->m_pkey);
            }
            seen.insert(d);
        }
    }
    return rval;
}

std::vector<t_tscalar>
t_ctx_grouped_pkey::get_cell_data(
    const std::vector<std::pair<t_uindex, t_uindex>>& cells) const {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    if (!m_traversal->validate_cells(cells)) {
        std::vector<t_tscalar> rval;
        return rval;
    }

    std::vector<t_tscalar> rval(cells.size());
    t_tscalar empty = mknone();

    auto aggtable = m_tree->get_aggtable();
    auto aggcols = aggtable->get_const_columns();
    const std::vector<t_aggspec>& aggspecs = m_config.get_aggregates();

    for (t_index idx = 0, loop_end = cells.size(); idx < loop_end; ++idx) {
        const auto& cell = cells[idx];
        if (cell.second == 0) {
            rval[idx].set(empty);
            continue;
        }

        t_index rptidx = m_traversal->get_tree_index(cell.first);
        t_uindex aggidx = cell.second - 1;
        t_index p_rptidx = m_tree->get_parent_idx(rptidx);

        t_uindex agg_ridx = m_tree->get_aggidx(rptidx);
        t_index agg_pridx
            = p_rptidx == INVALID_INDEX ? INVALID_INDEX : m_tree->get_aggidx(p_rptidx);

        rval[idx] = extract_aggregate(aggspecs[aggidx], aggcols[aggidx], agg_ridx, agg_pridx);
    }

    return rval;
}

void
t_ctx_grouped_pkey::set_feature_state(t_ctx_feature feature, bool state) {
    m_features[feature] = state;
}

void
t_ctx_grouped_pkey::set_alerts_enabled(bool enabled_state) {
    m_features[CTX_FEAT_ALERT] = enabled_state;
    m_tree->set_alerts_enabled(enabled_state);
}

void
t_ctx_grouped_pkey::set_deltas_enabled(bool enabled_state) {
    m_features[CTX_FEAT_DELTA] = enabled_state;
    m_tree->set_deltas_enabled(enabled_state);
}

void
t_ctx_grouped_pkey::set_minmax_enabled(bool enabled_state) {
    m_features[CTX_FEAT_MINMAX] = enabled_state;
    m_tree->set_minmax_enabled(enabled_state);
}

std::vector<t_minmax>
t_ctx_grouped_pkey::get_min_max() const {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    return m_minmax;
}

t_stepdelta
t_ctx_grouped_pkey::get_step_delta(t_index bidx, t_index eidx) {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    bidx = std::min(bidx, t_index(m_traversal->size()));
    eidx = std::min(eidx, t_index(m_traversal->size()));

    t_stepdelta rval(m_rows_changed, m_columns_changed, get_cell_delta(bidx, eidx));
    m_tree->clear_deltas();
    return rval;
}

std::vector<t_cellupd>
t_ctx_grouped_pkey::get_cell_delta(t_index bidx, t_index eidx) const {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    eidx = std::min(eidx, t_index(m_traversal->size()));
    std::vector<t_cellupd> rval;
    const auto& deltas = m_tree->get_deltas();
    for (t_index idx = bidx; idx < eidx; ++idx) {
        t_index ptidx = m_traversal->get_tree_index(idx);
        auto iterators = deltas->get<by_tc_nidx_aggidx>().equal_range(ptidx);
        for (auto iter = iterators.first; iter != iterators.second; ++iter) {
            rval.push_back(
                t_cellupd(idx, iter->m_aggidx + 1, iter->m_old_value, iter->m_new_value));
        }
    }
    return rval;
}

void
t_ctx_grouped_pkey::reset() {
    auto pivots = m_config.get_row_pivots();
    m_tree = std::make_shared<t_stree>(pivots, m_config.get_aggregates(), m_schema, m_config);
    m_tree->init();
    m_tree->set_deltas_enabled(get_feature_state(CTX_FEAT_DELTA));
    m_traversal = std::shared_ptr<t_traversal>(new t_traversal(m_tree));
}

void
t_ctx_grouped_pkey::reset_step_state() {
    m_rows_changed = false;
    m_columns_changed = false;
    if (t_env::log_progress()) {
        std::cout << "t_ctx_grouped_pkey.reset_step_state " << repr() << std::endl;
    }
}

std::vector<t_stree*>
t_ctx_grouped_pkey::get_trees() {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    std::vector<t_stree*> rval(1);
    rval[0] = m_tree.get();
    return rval;
}

bool
t_ctx_grouped_pkey::has_deltas() const {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    return true;
}

t_minmax
t_ctx_grouped_pkey::get_agg_min_max(t_uindex aggidx, t_depth depth) const {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    return m_tree->get_agg_min_max(aggidx, depth);
}

template <typename DATA_T>
void
rebuild_helper(t_column*) {}

void
t_ctx_grouped_pkey::rebuild() {
    auto tbl = m_gstate->get_pkeyed_table();

    if (m_config.has_filters()) {
        auto mask = filter_table_for_config(*tbl, m_config);
        tbl = tbl->clone(mask);
    }

    std::string child_col_name = m_config.get_child_pkey_column();

    std::shared_ptr<const t_column> child_col_sptr = tbl->get_const_column(child_col_name);

    const t_column* child_col = child_col_sptr.get();
    auto expansion_state = get_expansion_state();

    std::sort(expansion_state.begin(), expansion_state.end(),
        [](const t_path& a, const t_path& b) { return a.path().size() < b.path().size(); });

    for (auto& p : expansion_state) {
        std::reverse(p.path().begin(), p.path().end());
    }

    reset();

    t_uindex nrows = child_col->size();

    if (nrows == 0) {
        return;
    }

    struct t_datum {
        t_uindex m_pidx;
        t_tscalar m_parent;
        t_tscalar m_child;
        t_tscalar m_pkey;
        bool m_is_rchild;
        t_uindex m_idx;
    };

    auto sortby_col = tbl->get_const_column(m_config.get_sort_by(child_col_name)).get();

    auto parent_col = tbl->get_const_column(m_config.get_parent_pkey_column()).get();

    auto pkey_col = tbl->get_const_column("psp_pkey").get();

    std::vector<t_datum> data(nrows);
    tsl::hopscotch_map<t_tscalar, t_uindex> child_ridx_map;
    std::vector<bool> self_pkey_eq(nrows);

    for (t_uindex idx = 0; idx < nrows; ++idx) {
        data[idx].m_child.set(child_col->get_scalar(idx));
        data[idx].m_pkey.set(pkey_col->get_scalar(idx));
        child_ridx_map[data[idx].m_child] = idx;
    }

    for (t_uindex idx = 0; idx < nrows; ++idx) {
        auto ppkey = parent_col->get_scalar(idx);
        data[idx].m_parent.set(ppkey);

        auto p_iter = child_ridx_map.find(ppkey);
        bool missing_parent = p_iter == child_ridx_map.end();

        data[idx].m_is_rchild
            = !ppkey.is_valid() || data[idx].m_child == ppkey || missing_parent;
        data[idx].m_pidx = data[idx].m_is_rchild ? 0 : child_ridx_map.at(data[idx].m_parent);
        data[idx].m_idx = idx;
    }

    struct t_datumcmp {
        bool
        operator()(const t_datum& a, const t_datum& b) const {
            typedef std::tuple<bool, t_tscalar, t_tscalar> t_tuple;
            return t_tuple(!a.m_is_rchild, a.m_parent, a.m_child)
                < t_tuple(!b.m_is_rchild, b.m_parent, b.m_child);
        }
    };

    t_datumcmp cmp;

    PSP_PSORT(data.begin(), data.end(), cmp);

    std::vector<t_uindex> root_children;

    std::queue<t_uindex> queue;
    t_uindex nroot_children = 0;
    while (nroot_children < nrows && data[nroot_children].m_is_rchild) {
        queue.push(nroot_children);
        ++nroot_children;
    }

    tsl::hopscotch_map<t_tscalar, std::pair<t_uindex, t_uindex>> p_range_map;

    t_uindex brange = nroot_children;
    for (t_uindex idx = nroot_children; idx < nrows; ++idx) {
        if (data[idx].m_parent != data[idx - 1].m_parent && idx > nroot_children) {
            p_range_map[data[idx - 1].m_parent] = std::pair<t_uindex, t_uindex>(brange, idx);
            brange = idx;
        }
    }

    p_range_map[data.back().m_parent] = std::pair<t_uindex, t_uindex>(brange, nrows);

    // map from unsorted space to sorted space
    tsl::hopscotch_map<t_uindex, t_uindex> sortidx_map;

    for (t_uindex idx = 0; idx < nrows; ++idx) {
        sortidx_map[data[idx].m_idx] = idx;
    }

    while (!queue.empty()) {
        // ridx is in sorted space
        t_uindex ridx = queue.front();
        queue.pop();

        const t_datum& rec = data[ridx];
        t_uindex pridx = rec.m_is_rchild ? 0 : sortidx_map.at(rec.m_pidx);

        auto sortby_value = m_symtable.get_interned_tscalar(sortby_col->get_scalar(rec.m_idx));

        t_uindex nidx = ridx + 1;
        t_uindex pidx = rec.m_is_rchild ? 0 : pridx + 1;

        auto pnode = m_tree->get_node(pidx);

        auto value = m_symtable.get_interned_tscalar(rec.m_child);

        t_stnode node(nidx, pidx, value, pnode.m_depth + 1, sortby_value, 1, nidx);

        m_tree->insert_node(node);
        m_tree->add_pkey(nidx, m_symtable.get_interned_tscalar(rec.m_pkey));

        auto riter = p_range_map.find(rec.m_child);

        if (riter != p_range_map.end()) {
            auto range = riter->second;
            t_uindex bidx = range.first;
            t_uindex eidx = range.second;

            for (t_uindex cidx = bidx; cidx < eidx; ++cidx) {
                queue.push(cidx);
            }
        }
    }

    psp_log_time(repr() + " rebuild.post_queue");
    auto aggtable = m_tree->_get_aggtable();
    aggtable->extend(nrows + 1);

    auto aggspecs = m_config.get_aggregates();
    t_uindex naggs = aggspecs.size();

    std::vector<t_uindex> aggindices(nrows);

    for (t_uindex idx = 0; idx < nrows; ++idx) {
        aggindices[idx] = data[idx].m_idx;
    }

#ifdef PSP_PARALLEL_FOR
    tbb::parallel_for(0, int(naggs), 1,
        [&aggtable, &aggindices, &aggspecs, &tbl](int aggnum)
#else
    for (t_uindex aggnum = 0; aggnum < naggs; ++aggnum)
#endif
        {
            const t_aggspec& spec = aggspecs[aggnum];
            if (spec.agg() == AGGTYPE_IDENTITY) {
                auto scol = aggtable->get_column(spec.get_first_depname()).get();
                scol->copy(
                    tbl->get_const_column(spec.get_first_depname()).get(), aggindices, 1);
            }
        }
#ifdef PSP_PARALLEL_FOR
    );
#endif

    m_traversal = std::shared_ptr<t_traversal>(new t_traversal(m_tree));

    set_expansion_state(expansion_state);

    psp_log_time(repr() + " rebuild.pre_sortby");
    if (!m_sortby.empty()) {
        m_traversal->sort_by(m_config, m_sortby, *this);
    }
    psp_log_time(repr() + " rebuild.exit");
}

void
t_ctx_grouped_pkey::pprint() const {
    m_traversal->pprint();
}

void
t_ctx_grouped_pkey::notify(const t_data_table& flattened) {
    PSP_TRACE_SENTINEL();
    PSP_VERBOSE_ASSERT(m_init, "touching uninited object");
    psp_log_time(repr() + " notify.enter");
    rebuild();
    psp_log_time(repr() + " notify.exit");
}

// aggregates should be presized to be same size
// as agg_indices
void
t_ctx_grouped_pkey::get_aggregates_for_sorting(t_uindex nidx,
    const std::vector<t_index>& agg_indices, std::vector<t_tscalar>& aggregates,
    t_ctx2*) const {
    for (t_uindex idx = 0, loop_end = agg_indices.size(); idx < loop_end; ++idx) {
        auto which_agg = agg_indices[idx];

        if (which_agg < 0) {
            aggregates[idx].set(m_tree->get_sortby_value(nidx));
        } else {
            aggregates[idx].set(m_tree->get_aggregate(nidx, which_agg));
        }
    }
}

t_dtype
t_ctx_grouped_pkey::get_column_dtype(t_uindex idx) const {
    if (idx == 0 || idx >= static_cast<t_uindex>(get_column_count()))
        return DTYPE_NONE;

    auto aggtable = m_tree->_get_aggtable();
    return aggtable->get_const_column(idx - 1)->get_dtype();
}

std::vector<t_tscalar>
t_ctx_grouped_pkey::unity_get_row_data(t_uindex idx) const {
    auto rval = get_data(idx, idx + 1, 0, get_column_count());
    if (rval.empty())
        return std::vector<t_tscalar>();

    return std::vector<t_tscalar>(rval.begin() + 1, rval.end());
}

std::vector<t_tscalar>
t_ctx_grouped_pkey::unity_get_column_data(t_uindex idx) const {
    PSP_COMPLAIN_AND_ABORT("Not implemented");
    return std::vector<t_tscalar>();
}

std::vector<t_tscalar>
t_ctx_grouped_pkey::unity_get_row_path(t_uindex idx) const {
    return get_row_path(idx);
}

std::vector<t_tscalar>
t_ctx_grouped_pkey::unity_get_column_path(t_uindex idx) const {
    return std::vector<t_tscalar>();
}

t_uindex
t_ctx_grouped_pkey::unity_get_row_depth(t_uindex ridx) const {
    return m_traversal->get_depth(ridx);
}

t_uindex
t_ctx_grouped_pkey::unity_get_column_depth(t_uindex cidx) const {
    return 0;
}

std::string
t_ctx_grouped_pkey::unity_get_column_name(t_uindex idx) const {
    return m_config.col_at(idx);
}

std::string
t_ctx_grouped_pkey::unity_get_column_display_name(t_uindex idx) const {
    return m_config.col_at(idx);
}

std::vector<std::string>
t_ctx_grouped_pkey::unity_get_column_names() const {
    return m_config.get_column_names();
}

std::vector<std::string>
t_ctx_grouped_pkey::unity_get_column_display_names() const {
    return m_config.get_column_names();
}

t_uindex
t_ctx_grouped_pkey::unity_get_column_count() const {
    return get_column_count() - 1;
}

t_uindex
t_ctx_grouped_pkey::unity_get_row_count() const {
    return get_row_count();
}

bool
t_ctx_grouped_pkey::unity_get_row_expanded(t_uindex idx) const {
    return m_traversal->get_node_expanded(idx);
}

bool
t_ctx_grouped_pkey::unity_get_column_expanded(t_uindex idx) const {
    return false;
}

void
t_ctx_grouped_pkey::clear_deltas() {}

void
t_ctx_grouped_pkey::unity_init_load_step_end() {}

} // end namespace perspective
