/******************************************************************************
 *
 * Copyright (c) 2019, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
#ifdef PSP_ENABLE_PYTHON

#include <perspective/python/computed.h>

namespace perspective {
namespace binding {

void
make_computations() {
    // seed the computations vector
    t_computed_column::make_computations();
}

t_schema
get_table_computed_schema_py(
    std::shared_ptr<Table> table,
    t_val p_computed_columns) {
    // cast into vector of py::dicts
    std::vector<t_val> py_computed = p_computed_columns.cast<std::vector<t_val>>();
    std::vector<t_computed_column_definition> computed_columns;

    for (auto c : py_computed) {
        py::dict computed_column = c.cast<py::dict>();
        std::string computed_column_name = c["column"].cast<std::string>();
        t_computed_function_name computed_function_name = 
            str_to_computed_function_name(c["computed_function_name"].cast<std::string>());
        std::vector<std::string> input_columns = c["inputs"].cast<std::vector<std::string>>();
        t_computation invalid_computation = t_computation();

        // Add the computed column to the config.
        auto tp = std::make_tuple(
            computed_column_name,
            computed_function_name,
            input_columns,
            invalid_computation);
        computed_columns.push_back(tp);
    }
    
    t_schema computed_schema = table->get_computed_schema(computed_columns);
    return computed_schema;
}

std::vector<t_dtype>
get_computation_input_types(const std::string& computed_function_name) {
    t_computed_function_name function = str_to_computed_function_name(computed_function_name);
    return t_computed_column::get_computation_input_types(function);
}

} //namespace binding
} //namespace perspective

#endif