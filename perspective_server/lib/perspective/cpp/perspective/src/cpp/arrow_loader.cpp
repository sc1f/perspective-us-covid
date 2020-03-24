/******************************************************************************
 *
 * Copyright (c) 2019, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

#include <perspective/arrow_loader.h>


using namespace perspective;
using namespace ::arrow;

namespace perspective {
namespace arrow {

    ArrowLoader::ArrowLoader() {}
    ArrowLoader::~ArrowLoader() {}
    
    t_dtype
    convert_type(const std::string& src) {
        if (src == "dictionary" || src == "utf8" || src == "binary") {
            return DTYPE_STR;
        } else if (src == "bool") {
            return DTYPE_BOOL;
        } else if (src == "int8") {
            return DTYPE_INT8;
        } else if (src == "uint8") {
            return DTYPE_UINT8;
        } else if (src == "int16") {
            return DTYPE_INT16;
        } else if (src == "uint16") {
            return DTYPE_UINT16;
        } else if (src == "int32") {
            return DTYPE_INT32;
        } else if (src == "uint32") {
            return DTYPE_UINT32;
        } else if (src == "uint64") {
            return DTYPE_UINT64;
        } else if (src == "decimal" || src == "decimal128" || src == "int64") {
            return DTYPE_INT64;
        } else if (src == "float") {
            return DTYPE_FLOAT32;
        } else if (src == "double") {
            return DTYPE_FLOAT64; 
        } else if (src == "timestamp") {
            return DTYPE_TIME;
        } else if (src == "date32" || src == "date64") {
            return DTYPE_DATE;
        }
        std::stringstream ss;
        ss << "Could not load arrow column of type `" << src << "`" << std::endl;
        PSP_COMPLAIN_AND_ABORT(ss.str());
        return DTYPE_STR;
    }

    void
    ArrowLoader::initialize(const uintptr_t ptr, const uint32_t length) {
        io::BufferReader buffer_reader(reinterpret_cast<const std::uint8_t*>(ptr), length);
        if (std::memcmp("ARROW1", (const void *)ptr, 6) == 0) {
            std::shared_ptr<ipc::RecordBatchFileReader> batch_reader;
            ::arrow::Status status = ipc::RecordBatchFileReader::Open(&buffer_reader, &batch_reader);        
            if (!status.ok()) {
                std::stringstream ss;
                ss << "Failed to open RecordBatchFileReader: " << status.message() << std::endl;
                PSP_COMPLAIN_AND_ABORT(ss.str());
            } else {
                std::vector<std::shared_ptr<RecordBatch>> batches;
                auto num_batches = batch_reader->num_record_batches();
                for (int i = 0; i < num_batches; ++i) {
                    std::shared_ptr<RecordBatch> chunk;
                    status = batch_reader->ReadRecordBatch(i, &chunk);
                    if (!status.ok()) {
                        PSP_COMPLAIN_AND_ABORT(
                            "Failed to read file record batch: " + status.message());
                    }
                    batches.push_back(chunk);
                }
                status = ::arrow::Table::FromRecordBatches(batches, &m_table);
                if (!status.ok()) {
                    std::stringstream ss;
                    ss << "Failed to create Table from RecordBatches: "
                       << status.message() << std::endl;
                    PSP_COMPLAIN_AND_ABORT(ss.str());
                };
            };
        } else {
            std::shared_ptr<ipc::RecordBatchReader> batch_reader;
            ::arrow::Status status = ipc::RecordBatchStreamReader::Open(&buffer_reader, &batch_reader); 
            if (!status.ok()) {
                std::stringstream ss;
                ss << "Failed to open RecordBatchStreamReader: " << status.message() << std::endl;
                PSP_COMPLAIN_AND_ABORT(ss.str());
            } else { 
                status = batch_reader->ReadAll(&m_table);
                if (!status.ok()) {
                    std::stringstream ss;
                    ss << "Failed to read stream record batch: " << status.message() << std::endl;
                    PSP_COMPLAIN_AND_ABORT(ss.str());
                };
            }
        }

        std::shared_ptr<Schema> schema = m_table->schema();
        std::vector<std::shared_ptr<Field>> fields = schema->fields();

        for (auto field : fields) {
            m_names.push_back(field->name());
            m_types.push_back(convert_type(field->type()->name()));
        }
    }

    void
    ArrowLoader::fill_table(t_data_table& tbl, const std::string& index, std::uint32_t offset,
        std::uint32_t limit, bool is_update) {
        bool implicit_index = false;
        std::shared_ptr<Schema> schema = m_table->schema();
        std::vector<std::shared_ptr<Field>> fields = schema->fields();

        for (long unsigned int cidx = 0; cidx < m_names.size(); ++cidx) {
            auto name = m_names[cidx];
            auto type = m_types[cidx];
            auto raw_type = fields[cidx]->type()->name();

            if (name == "__INDEX__") {
                implicit_index = true;
                std::shared_ptr<t_column> pkey_col_sptr
                    = tbl.add_column_sptr("psp_pkey", type, true);
                fill_column(tbl, pkey_col_sptr, "psp_pkey", cidx, type, raw_type, is_update);
                tbl.clone_column("psp_pkey", "psp_okey");
                continue;
            } else {
                auto col = tbl.get_column(name);
                fill_column(tbl, col, name, cidx, type, raw_type, is_update);
            }
        }

        // Fill index column - recreated every time a `t_data_table` is created.
        if (!implicit_index) {
            if (index == "") {
                // Use row number as index if not explicitly provided or provided with
                // `__INDEX__`
                auto key_col = tbl.add_column("psp_pkey", DTYPE_INT32, true);
                auto okey_col = tbl.add_column("psp_okey", DTYPE_INT32, true);

                for (std::uint32_t ridx = 0; ridx < tbl.size(); ++ridx) {
                    key_col->set_nth<std::int32_t>(ridx, (ridx + offset) % limit);
                    okey_col->set_nth<std::int32_t>(ridx, (ridx + offset) % limit);
                }
            } else {
                tbl.clone_column(index, "psp_pkey");
                tbl.clone_column(index, "psp_okey");
            }
        }
    }

    template <typename T, typename V>
    void
    iter_col_copy(std::shared_ptr<t_column> dest, std::shared_ptr<::arrow::Array> src,
        const int64_t offset, const int64_t len) {
        std::shared_ptr<T> scol = std::static_pointer_cast<T>(src);
        const typename T::value_type* vals = scol->raw_values();
        for (uint32_t i = 0; i < len; i++) {
            dest->set_nth<V>(offset + i, static_cast<V>(vals[i]));
        }
    }

    void
    copy_array(std::shared_ptr<t_column> dest, std::shared_ptr<::arrow::Array> src,
        const int64_t offset, const int64_t len) {
        switch (src->type()->id()) {
            case ::arrow::DictionaryType::type_id: {
                auto scol = std::static_pointer_cast<::arrow::DictionaryArray>(src);
                std::shared_ptr<::arrow::StringArray> dict
                    = std::static_pointer_cast<::arrow::StringArray>(scol->dictionary());
                const int32_t* offsets = dict->raw_value_offsets();
                const uint8_t* values = dict->value_data()->data();
                const std::uint64_t dsize = dict->length();

                t_vocab* vocab = dest->_get_vocab();
                std::string elem;

                for (std::uint64_t i = 0; i < dsize; ++i) {
                    std::int32_t bidx = offsets[i];
                    std::size_t es = offsets[i + 1] - bidx;
                    elem.assign(reinterpret_cast<const char*>(values) + bidx, es);
                    vocab->get_interned(elem);
                }
                auto indices = scol->indices();
                switch (indices->type()->id()) {
                    case ::arrow::Int8Type::type_id: {
                        iter_col_copy<::arrow::Int8Array, t_uindex>(dest, indices, offset, len);
                    } break;
                    case ::arrow::Int16Type::type_id: {
                        iter_col_copy<::arrow::Int16Array, t_uindex>(dest, indices, offset, len);
                    } break;
                    case ::arrow::Int32Type::type_id: {
                        iter_col_copy<::arrow::Int32Array, t_uindex>(dest, indices, offset, len);
                    } break;
                    case ::arrow::Int64Type::type_id: {
                         iter_col_copy<::arrow::Int64Array, t_uindex>(dest, indices, offset, len);
                    } break;
                    default:
                        std::stringstream ss;
                        ss << "Could not copy dictionary array indices of type'" 
                           << indices->type()->name() << "'" << std::endl;
                        PSP_COMPLAIN_AND_ABORT(ss.str());
                }
            } break;
            case ::arrow::BinaryType::type_id:
            case ::arrow::StringType::type_id: {
                std::shared_ptr<::arrow::StringArray> scol
                    = std::static_pointer_cast<::arrow::StringArray>(src);
                const int32_t* offsets = scol->raw_value_offsets();
                const uint8_t* values = scol->value_data()->data();

                std::string elem;

                for (std::uint32_t i = 0; i < len; ++i) {
                    std::int32_t bidx = offsets[i];
                    std::size_t es = offsets[i + 1] - bidx;
                    elem.assign(reinterpret_cast<const char*>(values) + bidx, es);
                    dest->set_nth(offset + i, elem);
                }
            } break;
            case ::arrow::Int8Type::type_id: {
                auto scol = std::static_pointer_cast<::arrow::Int8Array>(src);
                std::memcpy(dest->get_nth<std::int8_t>(offset), (void*)scol->raw_values(), len);
            } break;
            case ::arrow::UInt8Type::type_id: {
                auto scol = std::static_pointer_cast<::arrow::UInt8Array>(src);
                std::memcpy(dest->get_nth<std::uint8_t>(offset), (void*)scol->raw_values(), len);
            } break;
            case ::arrow::Int16Type::type_id: {
                auto scol = std::static_pointer_cast<::arrow::Int16Array>(src);
                std::memcpy(dest->get_nth<std::int16_t>(offset), (void*)scol->raw_values(), len * 2);
            } break;
            case ::arrow::UInt16Type::type_id: {
                auto scol = std::static_pointer_cast<::arrow::UInt16Array>(src);
                std::memcpy(dest->get_nth<std::uint16_t>(offset), (void*)scol->raw_values(), len * 2);
            } break;
            case ::arrow::Int32Type::type_id: {
                auto scol = std::static_pointer_cast<::arrow::Int32Array>(src);
                std::memcpy(dest->get_nth<std::int32_t>(offset), (void*)scol->raw_values(), len * 4);
            } break;
            case ::arrow::UInt32Type::type_id: {
                auto scol = std::static_pointer_cast<::arrow::UInt32Array>(src);
                std::memcpy(dest->get_nth<std::uint32_t>(offset), (void*)scol->raw_values(), len * 4);
            } break;
            case ::arrow::Int64Type::type_id: {
                auto scol = std::static_pointer_cast<::arrow::Int64Array>(src);
                std::memcpy(dest->get_nth<std::int64_t>(offset), (void*)scol->raw_values(), len * 8);
            } break;
            case ::arrow::UInt64Type::type_id: {
                auto scol = std::static_pointer_cast<::arrow::UInt64Array>(src);
                std::memcpy(dest->get_nth<std::uint64_t>(offset), (void*)scol->raw_values(), len * 8);
            } break;
            case ::arrow::TimestampType::type_id: {
                std::shared_ptr<::arrow::TimestampType> tunit
                    = std::static_pointer_cast<::arrow::TimestampType>(src->type());
                auto scol = std::static_pointer_cast<::arrow::TimestampArray>(src);
                switch (tunit->unit()) {
                    case ::arrow::TimeUnit::MILLI: {
                        std::memcpy(
                            dest->get_nth<double>(offset), (void*)scol->raw_values(), len * 8);
                    } break;
                    case ::arrow::TimeUnit::NANO: {
                        const int64_t* vals = scol->raw_values();
                        for (uint32_t i = 0; i < len; i++) {
                            dest->set_nth<int64_t>(offset + i, vals[i] / 1000000);
                        }
                    } break;
                    case ::arrow::TimeUnit::MICRO: {
                        const int64_t* vals = scol->raw_values();
                        for (uint32_t i = 0; i < len; i++) {
                            dest->set_nth<int64_t>(offset + i, vals[i] / 1000);
                        }
                    } break;
                    case ::arrow::TimeUnit::SECOND: {
                        const int64_t* vals = scol->raw_values();
                        for (uint32_t i = 0; i < len; i++) {
                            dest->set_nth<int64_t>(offset + i, vals[i] * 1000);
                        }
                    } break;
                }
            } break;
            case ::arrow::Date64Type::type_id: {
                std::shared_ptr<::arrow::Date64Type> date_type
                    = std::static_pointer_cast<::arrow::Date64Type>(src->type());
                auto scol = std::static_pointer_cast<::arrow::Date64Array>(src);
                const int64_t* vals = scol->raw_values();
                for (uint32_t i = 0; i < len; i++) {
                    std::chrono::milliseconds timestamp(vals[i]);
                    date::sys_days days(date::floor<date::days>(timestamp));
                    auto ymd = date::year_month_day{days};
                    std::int32_t year = static_cast<std::int32_t>(ymd.year());
                    std::uint32_t month = static_cast<std::uint32_t>(ymd.month());
                    std::uint32_t day = static_cast<std::uint32_t>(ymd.day());
                    // Decrement month by 1, as date::month is [1-12] but
                    // t_date::month() is [0-11]
                    dest->set_nth(offset + i, t_date(year, month - 1, day));
                }
            } break;
            case ::arrow::Date32Type::type_id: {
                std::shared_ptr<::arrow::Date32Type> date_type
                    = std::static_pointer_cast<::arrow::Date32Type>(src->type());
                auto scol = std::static_pointer_cast<::arrow::Date32Array>(src);
                const int32_t* vals = scol->raw_values();
                for (uint32_t i = 0; i < len; i++) {
                    date::days days{vals[i]};
                    auto ymd = date::year_month_day{
                        date::sys_days{days}
                    };
                    // years are signed, month/day are unsigned
                    std::int32_t year = static_cast<std::int32_t>(ymd.year());
                    std::uint32_t month = static_cast<std::uint32_t>(ymd.month());
                    std::uint32_t day = static_cast<std::uint32_t>(ymd.day());
                    // Decrement month by 1, as date::month is [1-12] but
                    // t_date::month() is [0-11]
                    dest->set_nth(offset + i, t_date(year, month - 1, day));
                }
            } break;
            case ::arrow::FloatType::type_id: {
                auto scol = std::static_pointer_cast<::arrow::FloatArray>(src);
                std::memcpy(dest->get_nth<float>(offset), (void*)scol->raw_values(), len * 4);
            } break;
            case ::arrow::DoubleType::type_id: {
                auto scol = std::static_pointer_cast<::arrow::DoubleArray>(src);
                std::memcpy(dest->get_nth<double>(offset), (void*)scol->raw_values(), len * 8);
            } break;
            case ::arrow::Decimal128Type::type_id:
            case ::arrow::DecimalType::type_id: {
                std::shared_ptr<::arrow::Decimal128Array> scol = std::static_pointer_cast<::arrow::DecimalArray>(src);
                auto vals = (::arrow::Decimal128 *)scol->raw_values();
                for (uint32_t i = 0; i < len; ++i) {
                    ::arrow::Status status = vals[i].ToInteger(dest->get_nth<int64_t>(offset + i));
                    if (!status.ok()) {
                        PSP_COMPLAIN_AND_ABORT("Could not write Decimal to column: " + status.message());
                    };
                }
            } break;
            case ::arrow::BooleanType::type_id: {
                auto scol = std::static_pointer_cast<::arrow::BooleanArray>(src);
                const uint8_t* null_bitmap = scol->values()->data();
                for (uint32_t i = 0; i < len; ++i) {
                    std::uint8_t elem = null_bitmap[i / 8];
                    bool v = elem & (1 << (i % 8));
                    dest->set_nth<bool>(offset + i, v);
                }
            } break;
            default: {
                std::stringstream ss;
                std::string arrow_type = src->type()->ToString();
                ss << "Could not load Arrow column of type `" << arrow_type << "`." << std::endl;
                PSP_COMPLAIN_AND_ABORT(ss.str());
            }
        }
    }

    void
    ArrowLoader::fill_column(t_data_table& tbl, std::shared_ptr<t_column> col,
        const std::string& name, std::int32_t cidx, t_dtype type, std::string& raw_type,
        bool is_update) {
        int64_t offset = 0;
        std::shared_ptr<::arrow::ChunkedArray> carray = m_table->GetColumnByName(name);

        for(auto i = 0; i < carray->num_chunks(); ++i) {
            std::shared_ptr<::arrow::Array> array = carray->chunk(i);
            int64_t len = array->length();
        
            copy_array(col, array, offset, len);

            // Fill validity bitmap
            std::int64_t null_count = array->null_count();
            if (null_count == 0) {
                col->valid_raw_fill();
            } else {
                const uint8_t* null_bitmap = array->null_bitmap_data();

                // arrow packs bools into a bitmap
                for (uint32_t i = 0; i < len; ++i) {
                    std::uint8_t elem = null_bitmap[i / 8];
                    bool v = elem & (1 << (i % 8));
                    col->set_valid(offset + i, v);
                }
            }
            offset += len;
        }
    }

    // Getters

    std::uint32_t
    ArrowLoader::row_count() const {
        return m_table->num_rows();
    }

    std::vector<std::string>
    ArrowLoader::names() const {
        return m_names;
    }

    std::vector<t_dtype>
    ArrowLoader::types() const {
        return m_types;
    }

} // namespace arrow
} // namespace perspective