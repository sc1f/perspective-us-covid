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
#include <memory>
#include <vector>
#include <map>
#include <algorithm>
#include <functional>
#include <iostream>
#include <perspective/multi_sort.h>
#include <perspective/sort_specification.h>
#include <perspective/gnode_state.h>
#include <perspective/config.h>
#include <perspective/exports.h>
#include <perspective/sym_table.h>
#include <set>
#include <tsl/hopscotch_map.h>

namespace perspective {

class PERSPECTIVE_EXPORT t_ftrav {
    typedef tsl::hopscotch_map<t_tscalar, t_uindex> t_pkeyidx_map;
    typedef tsl::hopscotch_map<t_tscalar, t_mselem> t_pkmselem_map;

public:
    t_ftrav();

    void init();

    std::vector<t_tscalar> get_all_pkeys(
        const std::vector<std::pair<t_uindex, t_uindex>>& cells) const;

    std::vector<t_tscalar> get_pkeys(
        const std::vector<std::pair<t_uindex, t_uindex>>& cells) const;

    std::vector<t_tscalar> get_pkeys() const;
    std::vector<t_tscalar> get_pkeys(t_index begin_row, t_index end_row) const;
    std::vector<t_tscalar> get_pkeys(const std::vector<t_uindex>& rows) const;

    t_tscalar get_pkey(t_index idx) const;

    void fill_sort_elem(std::shared_ptr<const t_gstate> gstate, const t_config& config,
        const std::vector<t_tscalar>& row, t_mselem& out_elem) const;

    void fill_sort_elem(std::shared_ptr<const t_gstate> gstate, const t_config& config,
        t_tscalar pkey, t_mselem& out_elem);

    void sort_by(std::shared_ptr<const t_gstate> gstate, const t_config& config,
        const std::vector<t_sortspec>& sortby);

    t_index size() const;

    void get_row_indices(const tsl::hopscotch_set<t_tscalar>& pkeys,
        tsl::hopscotch_map<t_tscalar, t_index>& out_map) const;

    void get_row_indices(t_index bidx, t_index eidx, const tsl::hopscotch_set<t_tscalar>& pkeys,
        tsl::hopscotch_map<t_tscalar, t_index>& out_map) const;

    std::vector<t_uindex> get_row_indices(const tsl::hopscotch_set<t_tscalar>& pkeys) const;

    void reset();

    void check_size();

    bool validate_cells(const std::vector<std::pair<t_uindex, t_uindex>>& cells) const;

    void step_begin();

    void step_end();

    void add_row(std::shared_ptr<const t_gstate> gstate, const t_config& config, t_tscalar pkey);

    void update_row(
        std::shared_ptr<const t_gstate> gstate, const t_config& config, t_tscalar pkey);

    void delete_row(t_tscalar pkey);

    std::vector<t_sortspec> get_sort_by() const;
    bool empty_sort_by() const;

    void reset_step_state();

    t_uindex lower_bound_row_idx(std::shared_ptr<const t_gstate> gstate, const t_config& config,
        const std::vector<t_tscalar>& row) const;

    t_index get_row_idx(t_tscalar pkey) const;

private:
    t_index m_step_deletes;
    t_index m_step_inserts;
    t_pkeyidx_map m_pkeyidx;
    t_pkmselem_map m_new_elems;
    std::vector<t_sortspec> m_sortby;
    std::shared_ptr<std::vector<t_mselem>> m_index;
    t_symtable m_symtable;
};

} // end namespace perspective
