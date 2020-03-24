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
#include <perspective/base.h>
#include <perspective/context_base.h>
#include <perspective/sort_specification.h>
#include <perspective/path.h>
#include <perspective/sparse_tree_node.h>
#include <perspective/traversal_nodes.h>
#include <perspective/traversal.h>
#include <perspective/data_table.h>

namespace perspective {

class PERSPECTIVE_EXPORT t_ctx2 : public t_ctxbase<t_ctx2> {
public:
#include <perspective/context_common_decls.h>
    t_ctx2();

    t_ctx2(const t_schema& schema, const t_config& config);

    ~t_ctx2();

    t_index open(t_header header, t_index idx);
    t_index close(t_header header, t_index idx);

    t_totals get_totals() const;
    std::vector<t_index> get_ctraversal_indices() const;
    t_uindex get_num_view_columns() const;

    std::vector<t_tscalar> get_row_path(t_index idx) const;
    std::vector<t_tscalar> get_row_path(const t_tvnode& node) const;

    std::vector<t_tscalar> get_column_path(t_index idx) const;
    std::vector<t_tscalar> get_column_path(const t_tvnode& node) const;
    std::vector<t_tscalar> get_column_path_userspace(t_index idx) const;

    std::vector<t_aggspec> get_aggregates() const;
    t_tscalar get_aggregate_name(t_uindex idx) const;

    void column_sort_by(const std::vector<t_sortspec>& sortby);

    void set_depth(t_header header, t_depth depth);

    using t_ctxbase<t_ctx2>::get_data;

protected:
    std::vector<t_cellinfo> resolve_cells(
        const std::vector<std::pair<t_uindex, t_uindex>>& cells) const;

    std::shared_ptr<t_stree> rtree();
    std::shared_ptr<const t_stree> rtree() const;

    std::shared_ptr<t_stree> ctree();
    std::shared_ptr<const t_stree> ctree() const;

    t_uindex is_rtree_idx(t_uindex idx) const;
    t_uindex is_ctree_idx(t_uindex idx) const;

    t_index translate_column_index(t_index idx) const;

    t_uindex get_num_trees() const;

    t_uindex calc_translated_colidx(t_uindex n_aggs, t_uindex cidx) const;

private:
    std::shared_ptr<t_traversal> m_rtraversal;
    std::shared_ptr<t_traversal> m_ctraversal;
    std::vector<t_sortspec> m_sortby;
    bool m_rows_changed;
    std::vector<std::shared_ptr<t_stree>> m_trees;
    std::vector<t_sortspec> m_column_sortby;
    t_depth m_row_depth;
    bool m_row_depth_set;
    t_depth m_column_depth;
    bool m_column_depth_set;
};

} // end namespace perspective
