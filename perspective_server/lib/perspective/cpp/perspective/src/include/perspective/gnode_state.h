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
#include <perspective/data_table.h>
#include <tsl/hopscotch_map.h>
#include <tsl/hopscotch_set.h>
#include <perspective/mask.h>
#include <perspective/sym_table.h>
#include <perspective/rlookup.h>

namespace perspective {

std::pair<t_tscalar, t_tscalar> get_vec_min_max(const std::vector<t_tscalar>& vec);

class PERSPECTIVE_EXPORT t_gstate {
    /**
     * @brief A mapping of `t_tscalar` primary keys to `t_uindex` row indices.
     */
    typedef tsl::hopscotch_map<t_tscalar, t_uindex> t_mapping;

    typedef tsl::hopscotch_set<t_uindex> t_free_items;

public:
    /**
     * @brief Construct a new `t_gstate`, which manages the canonical state of
     * the `t_gnode` and associated `Table`. 
     * 
     * Contexts use `t_gstate` to read out columns for serialization, 
     * calculate aggregates, and look up primary keys - the `t_gstate` will
     * contain the *latest* state of the dataset managed by Perspective,
     * after updates/removes/etc. are applied.
     * 
     * @param input_schema 
     * @param output_schema 
     */
    t_gstate(const t_schema& input_schema, const t_schema& output_schema);

    ~t_gstate();

    void init();

    /**
     * @brief Look up a primary key in the `t_gstate`'s mapping of primary
     * keys to row numbers.
     * 
     * @param pkey 
     * @return t_rlookup a struct containing row index `m_idx` and `m_exists`,
     * whether `pkey` exists at that row index. If `pkey` is not found, 
     * `m_idx` is 0 and `m_exists` is false.
     */
    t_rlookup lookup(t_tscalar pkey) const;

    /**
     * @brief If the master table has 0 rows, fill it using `flattened`.
     * 
     * @param flattened 
     */
    void fill_master_table(const t_data_table* flattened);

    /**
     * @brief Update the master `t_data_table` with the flattened and masked
     * `t_data_table` after an `update` has been called and fully processed
     * by `t_gnode::_process_table`.
     * 
     * @param flattened 
     */
    void update_master_table(const t_data_table* flattened);

    /**
     * @brief Given a column in the master data table and the corresponding
     * column in the `flattened` data table, fill the master column with data
     * from the flattened column. 
     * 
     * @param master_column 
     * @param flattened_column 
     */
    void
    update_master_column(
        t_column* master_column,
        const t_column* flattened_column,
        const t_column* op_column,
        const std::vector<t_uindex>& master_table_indexes,
        t_uindex num_rows);

    /**
     * @brief Read the values with the specified `pkeys` from the column at 
     * `colname`, writing into `out_data`.
     * 
     * @param colname 
     * @param pkeys 
     * @param out_data 
     */
    void read_column(const std::string& colname, const std::vector<t_tscalar>& pkeys,
        std::vector<t_tscalar>& out_data) const;

    void read_column(const std::string& colname, const std::vector<t_tscalar>& pkeys,
        std::vector<double>& out_data) const;

    void read_column(const std::string& colname, const std::vector<t_tscalar>& pkeys,
        std::vector<double>& out_data, bool include_nones) const;

    /**
     * @brief Apply the lambda `fn` to each primary-keyed value in the column,
     * stopping when the lambda returns `true`.
     * 
     * @param pkeys 
     * @param colname 
     * @param value 
     * @param fn 
     * @return true 
     * @return false 
     */
    bool apply(const std::vector<t_tscalar>& pkeys, const std::string& colname,
        t_tscalar& value, std::function<bool(const t_tscalar&, t_tscalar&)> fn) const;

    /**
     * @brief Reduce the column's values at the specified primary keys, and
     * return a single, reduced value.
     * 
     * @tparam FN_T 
     * @param pkeys 
     * @param colname 
     * @param fn 
     * @return FN_T::result_type 
     */
    template <typename FN_T>
    typename FN_T::result_type reduce(
        const std::vector<t_tscalar>& pkeys, const std::string& colname, FN_T fn) const;

    /**
     * @brief Returns whether `value` is unique inside `colname`.
     * 
     * @param pkeys 
     * @param colname 
     * @param value 
     * @return true 
     * @return false 
     */
    bool is_unique(const std::vector<t_tscalar>& pkeys, const std::string& colname,
        t_tscalar& value) const;

    /**
     * @brief Returns the scalar value at column `colname` with primary key
     * `pkey`.
     * 
     * @param pkey 
     * @param colname 
     * @return t_tscalar 
     */
    t_tscalar get(t_tscalar pkey, const std::string& colname) const;

    /**
     * @brief Get the scalar value for `pkey` in `colname`.
     * 
     * @param pkey 
     * @param colname 
     * @return t_tscalar 
     */
    t_tscalar get_value(const t_tscalar& pkey, const std::string& colname) const;

    /**
     * @brief Return the size of the underlying `t_data_table`.
     * 
     * @return t_uindex 
     */
    t_uindex size() const;

    /**
     * @brief Returns the size of the underlying primary key map.
     * 
     * @return t_uindex 
     */
    t_uindex mapping_size() const;

    /**
     * @brief Resets the gnode state and its underlying `t_data_table` and
     * mapping.
     * 
     */
    void reset();

    // Getters
    std::shared_ptr<t_data_table> get_table();
    std::shared_ptr<const t_data_table> get_table() const;

    std::shared_ptr<t_data_table> get_pkeyed_table(const t_schema& schema) const;
    std::shared_ptr<t_data_table> get_pkeyed_table() const;

    // Only for tests
    std::shared_ptr<t_data_table> get_sorted_pkeyed_table() const;

    t_data_table* _get_pkeyed_table() const;
    t_data_table* _get_pkeyed_table(const std::vector<t_tscalar>& pkeys) const;
    t_data_table* _get_pkeyed_table(
        const t_schema& schema, const std::vector<t_tscalar>& pkeys) const;
    t_data_table* _get_pkeyed_table(const t_schema& schema) const;
    t_data_table* _get_pkeyed_table(
        const t_schema& schema, const t_mask& mask) const;

    const t_schema& get_input_schema() const;
    const t_schema& get_output_schema() const;

    std::vector<t_tscalar> get_row_data_pkeys(
        const std::vector<t_tscalar>& pkeys) const;

    void pprint() const;

protected:
    /**
     * @brief If the pkey exists in the state, return its row index. Otherwise,
     * add a new row to the mapping and return its index.
     * 
     * @param pkey 
     * @return t_uindex 
     */
    t_uindex lookup_or_create(const t_tscalar& pkey);

    /**
     * @brief Clear the value at `pkey` for every column in the table.
     * 
     * @param pkey 
     */
    void erase(const t_tscalar& pkey);

    /**
     * @brief Generate a `t_mask` bitset set to true for every value in the
     * underlying `m_mapping`.
     * 
     * @return t_mask 
     */
    t_mask get_cpp_mask() const;

    void _mark_deleted(t_uindex idx);
    bool has_pkey(t_tscalar pkey) const;
    t_dtype get_pkey_dtype() const;

private:
    // Unused methods
    std::vector<t_uindex> get_pkeys_idx(const std::vector<t_tscalar>& pkeys) const;
    std::vector<t_tscalar> has_pkeys(const std::vector<t_tscalar>& pkeys) const;
    std::vector<t_tscalar> get_pkeys() const;

    std::vector<t_tscalar> get_row(t_tscalar pkey) const;

    // Unimplemented header
    bool apply(const std::vector<t_tscalar>& pkeys, const std::string& colname,
        t_tscalar& value) const;

    t_schema m_input_schema; // pkeyed
    t_schema m_output_schema; // tblschema
    bool m_init;
    std::shared_ptr<t_data_table> m_table;
    t_mapping m_mapping;
    t_free_items m_free;
    t_symtable m_symtable;
    std::shared_ptr<t_column> m_pkcol;
    std::shared_ptr<t_column> m_opcol;
};

template <typename FN_T>
typename FN_T::result_type
t_gstate::reduce(
    const std::vector<t_tscalar>& pkeys, const std::string& colname, FN_T fn) const {
    std::vector<t_tscalar> data;
    read_column(colname, pkeys, data);
    return fn(data);
}

} // end namespace perspective
