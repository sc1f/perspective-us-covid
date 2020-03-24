<a name="module_perspective"></a>

## perspective
The main API module for `@finos/perspective`.

For more information, see the
[Javascript user guide](https://perspective.finos.org/docs/md/js.html).


* [perspective](#module_perspective)
    * [~view](#module_perspective..view)
        * [new view()](#new_module_perspective..view_new)
        * [.get_config()](#module_perspective..view+get_config) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;object&gt;</code>
        * [.delete()](#module_perspective..view+delete)
        * [.schema()](#module_perspective..view+schema) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;Object&gt;</code>
        * [.column_paths()](#module_perspective..view+column_paths)
        * [.to_columns([options])](#module_perspective..view+to_columns) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;Array&gt;</code>
        * [.to_json([options])](#module_perspective..view+to_json) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;Array&gt;</code>
        * [.to_csv([options])](#module_perspective..view+to_csv) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;string&gt;</code>
        * [.col_to_js_typed_array(column_name, options)](#module_perspective..view+col_to_js_typed_array) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;TypedArray&gt;</code>
        * [.to_arrow([options])](#module_perspective..view+to_arrow) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;ArrayBuffer&gt;</code>
        * [.num_rows()](#module_perspective..view+num_rows) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;number&gt;</code>
        * [.num_columns()](#module_perspective..view+num_columns) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;number&gt;</code>
        * [.get_row_expanded()](#module_perspective..view+get_row_expanded) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;bool&gt;</code>
        * [.expand()](#module_perspective..view+expand) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;void&gt;</code>
        * [.collapse()](#module_perspective..view+collapse) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;void&gt;</code>
        * [.set_depth()](#module_perspective..view+set_depth)
        * [.on_update(callback)](#module_perspective..view+on_update)
        * [.on_delete(callback)](#module_perspective..view+on_delete)
        * [.remove_delete(callback)](#module_perspective..view+remove_delete)
    * [~table](#module_perspective..table)
        * [new table()](#new_module_perspective..table_new)
        * [.clear()](#module_perspective..table+clear)
        * [.replace()](#module_perspective..table+replace)
        * [.delete()](#module_perspective..table+delete)
        * [.on_delete(callback)](#module_perspective..table+on_delete)
        * [.remove_delete(callback)](#module_perspective..table+remove_delete)
        * [.size()](#module_perspective..table+size) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;number&gt;</code>
        * [.schema(computed)](#module_perspective..table+schema) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;Object&gt;</code>
        * [.computed_schema()](#module_perspective..table+computed_schema) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;Object&gt;</code>
        * [.is_valid_filter([filter])](#module_perspective..table+is_valid_filter)
        * [.view([config])](#module_perspective..table+view) ⇒ <code>view</code>
        * [.update(data)](#module_perspective..table+update)
        * [.remove(data)](#module_perspective..table+remove)
        * [.add_computed(computed)](#module_perspective..table+add_computed)
        * [.columns(computed)](#module_perspective..table+columns) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;Array.&lt;string&gt;&gt;</code>
    * [~name_to_computation(name)](#module_perspective..name_to_computation)


* * *

<a name="module_perspective..view"></a>

### perspective~view
**Kind**: inner class of [<code>perspective</code>](#module_perspective)  

* [~view](#module_perspective..view)
    * [new view()](#new_module_perspective..view_new)
    * [.get_config()](#module_perspective..view+get_config) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;object&gt;</code>
    * [.delete()](#module_perspective..view+delete)
    * [.schema()](#module_perspective..view+schema) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;Object&gt;</code>
    * [.column_paths()](#module_perspective..view+column_paths)
    * [.to_columns([options])](#module_perspective..view+to_columns) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;Array&gt;</code>
    * [.to_json([options])](#module_perspective..view+to_json) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;Array&gt;</code>
    * [.to_csv([options])](#module_perspective..view+to_csv) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;string&gt;</code>
    * [.col_to_js_typed_array(column_name, options)](#module_perspective..view+col_to_js_typed_array) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;TypedArray&gt;</code>
    * [.to_arrow([options])](#module_perspective..view+to_arrow) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;ArrayBuffer&gt;</code>
    * [.num_rows()](#module_perspective..view+num_rows) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;number&gt;</code>
    * [.num_columns()](#module_perspective..view+num_columns) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;number&gt;</code>
    * [.get_row_expanded()](#module_perspective..view+get_row_expanded) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;bool&gt;</code>
    * [.expand()](#module_perspective..view+expand) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;void&gt;</code>
    * [.collapse()](#module_perspective..view+collapse) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;void&gt;</code>
    * [.set_depth()](#module_perspective..view+set_depth)
    * [.on_update(callback)](#module_perspective..view+on_update)
    * [.on_delete(callback)](#module_perspective..view+on_delete)
    * [.remove_delete(callback)](#module_perspective..view+remove_delete)


* * *

<a name="new_module_perspective..view_new"></a>

#### new view()
A View object represents a specific transform (configuration or pivot,
filter, sort, etc) configuration on an underlying
[table](#module_perspective..table). A View receives all updates from the
[table](#module_perspective..table) from which it is derived, and can be
serialized to JSON or trigger a callback when it is updated.  View
objects are immutable, and will remain in memory and actively process
updates until its [delete](#module_perspective..view+delete) method is
called.

<strong>Note</strong> This constructor is not public - Views are created
by invoking the [view](#module_perspective..table+view) method.

**Example**  
```js
// Returns a new View, pivoted in the row space by the "name" column.
table.view({row_pivots: ["name"]});
```

* * *

<a name="module_perspective..view+get_config"></a>

#### view.get\_config() ⇒ <code>[ &#x27;Promise&#x27; ].&lt;object&gt;</code>
A copy of the config object passed to the [table#view](table#view) method which
created this [view](#module_perspective..view).

**Kind**: instance method of [<code>view</code>](#module_perspective..view)  
**Returns**: <code>[ &#x27;Promise&#x27; ].&lt;object&gt;</code> - Shared the same key/values properties as
[view](#module_perspective..view)  

* * *

<a name="module_perspective..view+delete"></a>

#### view.delete()
Delete this [view](#module_perspective..view) and clean up all resources
associated with it. View objects do not stop consuming resources or
processing updates when they are garbage collected - you must call this
method to reclaim these.

**Kind**: instance method of [<code>view</code>](#module_perspective..view)  

* * *

<a name="module_perspective..view+schema"></a>

#### view.schema() ⇒ <code>[ &#x27;Promise&#x27; ].&lt;Object&gt;</code>
The schema of this [view](#module_perspective..view). A schema is an
Object, the keys of which are the columns of this
[view](#module_perspective..view), and the values are their string type
names. If this [view](#module_perspective..view) is aggregated, theses will
be the aggregated types; otherwise these types will be the same as the
columns in the underlying [table](#module_perspective..table)

**Kind**: instance method of [<code>view</code>](#module_perspective..view)  
**Returns**: <code>[ &#x27;Promise&#x27; ].&lt;Object&gt;</code> - A Promise of this
[view](#module_perspective..view)'s schema.  

* * *

<a name="module_perspective..view+column_paths"></a>

#### view.column\_paths()
Returns an array of strings containing the column paths of the View
without any of the source columns.

A column path shows the columns that a given cell belongs to after pivots
are applied.

**Kind**: instance method of [<code>view</code>](#module_perspective..view)  

* * *

<a name="module_perspective..view+to_columns"></a>

#### view.to\_columns([options]) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;Array&gt;</code>
Serializes this view to JSON data in a column-oriented format.

**Kind**: instance method of [<code>view</code>](#module_perspective..view)  
**Returns**: <code>[ &#x27;Promise&#x27; ].&lt;Array&gt;</code> - A Promise resolving to An array of Objects
representing the rows of this [view](#module_perspective..view).  If this
[view](#module_perspective..view) had a "row_pivots" config parameter
supplied when constructed, each row Object will have a "__ROW_PATH__"
key, whose value specifies this row's aggregated path.  If this
[view](#module_perspective..view) had a "column_pivots" config parameter
supplied, the keys of this object will be comma-prepended with their
comma-separated column paths.  
**Params**

- [options] <code>Object</code> - An optional configuration object.
    - .start_row <code>number</code> - The starting row index from which to
serialize.
    - .end_row <code>number</code> - The ending row index from which to
serialize.
    - .start_col <code>number</code> - The starting column index from which to
serialize.
    - .end_col <code>number</code> - The ending column index from which to
serialize.
    - [.index] <code>boolean</code> <code> = false</code> - Should the index from the
underlying [table](#module_perspective..table) be in the output (as
`"__INDEX__"`).


* * *

<a name="module_perspective..view+to_json"></a>

#### view.to\_json([options]) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;Array&gt;</code>
Serializes this view to JSON data in a row-oriented format.

**Kind**: instance method of [<code>view</code>](#module_perspective..view)  
**Returns**: <code>[ &#x27;Promise&#x27; ].&lt;Array&gt;</code> - A Promise resolving to An array of Objects
representing the rows of this [view](#module_perspective..view).  If this
[view](#module_perspective..view) had a "row_pivots" config parameter
supplied when constructed, each row Object will have a "__ROW_PATH__"
key, whose value specifies this row's aggregated path.  If this
[view](#module_perspective..view) had a "column_pivots" config parameter
supplied, the keys of this object will be comma-prepended with their
comma-separated column paths.  
**Params**

- [options] <code>Object</code> - An optional configuration object.
    - .start_row <code>number</code> - The starting row index from which to
serialize.
    - .end_row <code>number</code> - The ending row index from which to
serialize.
    - .start_col <code>number</code> - The starting column index from which to
serialize.
    - .end_col <code>number</code> - The ending column index from which to
serialize.


* * *

<a name="module_perspective..view+to_csv"></a>

#### view.to\_csv([options]) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;string&gt;</code>
Serializes this view to CSV data in a standard format.

**Kind**: instance method of [<code>view</code>](#module_perspective..view)  
**Returns**: <code>[ &#x27;Promise&#x27; ].&lt;string&gt;</code> - A Promise resolving to a string in CSV format
representing the rows of this [view](#module_perspective..view).  If this
[view](#module_perspective..view) had a "row_pivots" config parameter
supplied when constructed, each row will have prepended those values
specified by this row's aggregated path.  If this
[view](#module_perspective..view) had a "column_pivots" config parameter
supplied, the keys of this object will be comma-prepended with their
comma-separated column paths.  
**Params**

- [options] <code>Object</code> - An optional configuration object.
    - .start_row <code>number</code> - The starting row index from which to
serialize.
    - .end_row <code>number</code> - The ending row index from which to
serialize.
    - .start_col <code>number</code> - The starting column index from which to
serialize.
    - .end_col <code>number</code> - The ending column index from which to
serialize.
    - .config <code>Object</code> - A config object for the Papaparse
[https://www.papaparse.com/docs#json-to-csv](https://www.papaparse.com/docs#json-to-csv) config object.


* * *

<a name="module_perspective..view+col_to_js_typed_array"></a>

#### view.col\_to\_js\_typed\_array(column_name, options) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;TypedArray&gt;</code>
Serializes a view column into a TypedArray.

**Kind**: instance method of [<code>view</code>](#module_perspective..view)  
**Returns**: <code>[ &#x27;Promise&#x27; ].&lt;TypedArray&gt;</code> - A promise resolving to a TypedArray
representing the data of the column as retrieved from the
[view](#module_perspective..view) - all pivots, aggregates, sorts, and
filters have been applied onto the values inside the TypedArray. The
TypedArray will be constructed based on data type - integers will resolve
to Int8Array, Int16Array, or Int32Array. Floats resolve to Float32Array
or Float64Array. If the column cannot be found, or is not of an
integer/float type, the Promise returns undefined.  
**Params**

- column_name <code>string</code> - The name of the column to serialize.
- options <code>Object</code> - An optional configuration object.
    - .data_slice <code>\*</code> - A data slice object from which to
serialize.
    - .start_row <code>number</code> - The starting row index from which to
serialize.
    - .end_row <code>number</code> - The ending row index from which to
serialize.


* * *

<a name="module_perspective..view+to_arrow"></a>

#### view.to\_arrow([options]) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;ArrayBuffer&gt;</code>
Serializes a view to the Apache Arrow data format.

**Kind**: instance method of [<code>view</code>](#module_perspective..view)  
**Returns**: <code>[ &#x27;Promise&#x27; ].&lt;ArrayBuffer&gt;</code> - An `ArrayBuffer` in the Apache Arrow
format containing data from the view.  
**Params**

- [options] <code>Object</code> - An optional configuration object.
    - .data_slice <code>\*</code> - A data slice object from which to
serialize.
    - .start_row <code>number</code> - The starting row index from which to
serialize.
    - .end_row <code>number</code> - The ending row index from which to
serialize.
    - .start_col <code>number</code> - The starting column index from which to
serialize.
    - .end_col <code>number</code> - The ending column index from which to
serialize.


* * *

<a name="module_perspective..view+num_rows"></a>

#### view.num\_rows() ⇒ <code>[ &#x27;Promise&#x27; ].&lt;number&gt;</code>
The number of aggregated rows in this [view](#module_perspective..view).
This is affected by the "row_pivots" configuration parameter supplied to
this [view](#module_perspective..view)'s contructor.

**Kind**: instance method of [<code>view</code>](#module_perspective..view)  
**Returns**: <code>[ &#x27;Promise&#x27; ].&lt;number&gt;</code> - The number of aggregated rows.  

* * *

<a name="module_perspective..view+num_columns"></a>

#### view.num\_columns() ⇒ <code>[ &#x27;Promise&#x27; ].&lt;number&gt;</code>
The number of aggregated columns in this [view](view).  This is affected
by the "column_pivots" configuration parameter supplied to this
[view](view)'s contructor.

**Kind**: instance method of [<code>view</code>](#module_perspective..view)  
**Returns**: <code>[ &#x27;Promise&#x27; ].&lt;number&gt;</code> - The number of aggregated columns.  

* * *

<a name="module_perspective..view+get_row_expanded"></a>

#### view.get\_row\_expanded() ⇒ <code>[ &#x27;Promise&#x27; ].&lt;bool&gt;</code>
Whether this row at index `idx` is in an expanded or collapsed state.

**Kind**: instance method of [<code>view</code>](#module_perspective..view)  
**Returns**: <code>[ &#x27;Promise&#x27; ].&lt;bool&gt;</code> - Whether this row is expanded.  

* * *

<a name="module_perspective..view+expand"></a>

#### view.expand() ⇒ <code>[ &#x27;Promise&#x27; ].&lt;void&gt;</code>
Expands the row at index `idx`.

**Kind**: instance method of [<code>view</code>](#module_perspective..view)  

* * *

<a name="module_perspective..view+collapse"></a>

#### view.collapse() ⇒ <code>[ &#x27;Promise&#x27; ].&lt;void&gt;</code>
Collapses the row at index `idx`.

**Kind**: instance method of [<code>view</code>](#module_perspective..view)  

* * *

<a name="module_perspective..view+set_depth"></a>

#### view.set\_depth()
Set expansion `depth` of the pivot tree.

**Kind**: instance method of [<code>view</code>](#module_perspective..view)  

* * *

<a name="module_perspective..view+on_update"></a>

#### view.on\_update(callback)
Register a callback with this [view](#module_perspective..view).  Whenever
the [view](#module_perspective..view)'s underlying table emits an update,
this callback will be invoked with the aggregated row deltas.

**Kind**: instance method of [<code>view</code>](#module_perspective..view)  
**Params**

- callback <code>function</code> - A callback function invoked on update.  The
parameter to this callback is dependent on the `mode` parameter:
    - "none" (default): The callback is invoked without an argument.
    - "cell": The callback is invoked with the new data for each updated
          cell, serialized to JSON format.
    - "row": The callback is invoked with an Arrow of the updated rows.


* * *

<a name="module_perspective..view+on_delete"></a>

#### view.on\_delete(callback)
Register a callback with this [view](#module_perspective..view).  Whenever
the [view](#module_perspective..view) is deleted, this callback will be
invoked.

**Kind**: instance method of [<code>view</code>](#module_perspective..view)  
**Params**

- callback <code>function</code> - A callback function invoked on delete.


* * *

<a name="module_perspective..view+remove_delete"></a>

#### view.remove\_delete(callback)
Unregister a previously registered delete callback with this
[view](#module_perspective..view).

**Kind**: instance method of [<code>view</code>](#module_perspective..view)  
**Params**

- callback <code>function</code> - A delete callback function to be removed


* * *

<a name="module_perspective..table"></a>

### perspective~table
**Kind**: inner class of [<code>perspective</code>](#module_perspective)  

* [~table](#module_perspective..table)
    * [new table()](#new_module_perspective..table_new)
    * [.clear()](#module_perspective..table+clear)
    * [.replace()](#module_perspective..table+replace)
    * [.delete()](#module_perspective..table+delete)
    * [.on_delete(callback)](#module_perspective..table+on_delete)
    * [.remove_delete(callback)](#module_perspective..table+remove_delete)
    * [.size()](#module_perspective..table+size) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;number&gt;</code>
    * [.schema(computed)](#module_perspective..table+schema) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;Object&gt;</code>
    * [.computed_schema()](#module_perspective..table+computed_schema) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;Object&gt;</code>
    * [.is_valid_filter([filter])](#module_perspective..table+is_valid_filter)
    * [.view([config])](#module_perspective..table+view) ⇒ <code>view</code>
    * [.update(data)](#module_perspective..table+update)
    * [.remove(data)](#module_perspective..table+remove)
    * [.add_computed(computed)](#module_perspective..table+add_computed)
    * [.columns(computed)](#module_perspective..table+columns) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;Array.&lt;string&gt;&gt;</code>


* * *

<a name="new_module_perspective..table_new"></a>

#### new table()
A Table object is the basic data container in Perspective.  Tables are
typed - they have an immutable set of column names, and a known type for
each.

<strong>Note</strong> This constructor is not public - Tables are created
by invoking the [table](#module_perspective..table) factory method, either
on the perspective module object, or an a
[module:perspective~worker](module:perspective~worker) instance.


* * *

<a name="module_perspective..table+clear"></a>

#### table.clear()
Remove all rows in this [table](#module_perspective..table) while preserving
the schema and construction options.

**Kind**: instance method of [<code>table</code>](#module_perspective..table)  

* * *

<a name="module_perspective..table+replace"></a>

#### table.replace()
Replace all rows in this [table](#module_perspective..table) the input data.

**Kind**: instance method of [<code>table</code>](#module_perspective..table)  

* * *

<a name="module_perspective..table+delete"></a>

#### table.delete()
Delete this [table](#module_perspective..table) and clean up all resources
associated with it. Table objects do not stop consuming resources or
processing updates when they are garbage collected - you must call this
method to reclaim these.

**Kind**: instance method of [<code>table</code>](#module_perspective..table)  

* * *

<a name="module_perspective..table+on_delete"></a>

#### table.on\_delete(callback)
Register a callback with this [table](#module_perspective..table).  Whenever
the [table](#module_perspective..table) is deleted, this callback will be
invoked.

**Kind**: instance method of [<code>table</code>](#module_perspective..table)  
**Params**

- callback <code>function</code> - A callback function invoked on delete.  The
    parameter to this callback shares a structure with the return type of
    [module:perspective~table#to_json](module:perspective~table#to_json).


* * *

<a name="module_perspective..table+remove_delete"></a>

#### table.remove\_delete(callback)
Unregister a previously registered delete callback with this
[table](#module_perspective..table).

**Kind**: instance method of [<code>table</code>](#module_perspective..table)  
**Params**

- callback <code>function</code> - A delete callback function to be removed


* * *

<a name="module_perspective..table+size"></a>

#### table.size() ⇒ <code>[ &#x27;Promise&#x27; ].&lt;number&gt;</code>
The number of accumulated rows in this [table](#module_perspective..table).
This is affected by the "index" configuration parameter supplied to this
[view](#module_perspective..view)'s contructor - as rows will be
overwritten when they share an idnex column.

**Kind**: instance method of [<code>table</code>](#module_perspective..table)  
**Returns**: <code>[ &#x27;Promise&#x27; ].&lt;number&gt;</code> - The number of accumulated rows.  

* * *

<a name="module_perspective..table+schema"></a>

#### table.schema(computed) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;Object&gt;</code>
The schema of this [table](#module_perspective..table).  A schema is an
Object whose keys are the columns of this
[table](#module_perspective..table), and whose values are their string type
names.

**Kind**: instance method of [<code>table</code>](#module_perspective..table)  
**Returns**: <code>[ &#x27;Promise&#x27; ].&lt;Object&gt;</code> - A Promise of this
[table](#module_perspective..table)'s schema.  
**Params**

- computed <code>boolean</code> - Should computed columns be included? (default
false)


* * *

<a name="module_perspective..table+computed_schema"></a>

#### table.computed\_schema() ⇒ <code>[ &#x27;Promise&#x27; ].&lt;Object&gt;</code>
The computed schema of this [table](#module_perspective..table). Returns a
schema of only computed columns added by the user, the keys of which are
computed columns and the values an Object containing the associated
column_name, column_type, and computation.

**Kind**: instance method of [<code>table</code>](#module_perspective..table)  
**Returns**: <code>[ &#x27;Promise&#x27; ].&lt;Object&gt;</code> - A Promise of this
[table](#module_perspective..table)'s computed schema.  

* * *

<a name="module_perspective..table+is_valid_filter"></a>

#### table.is\_valid\_filter([filter])
Validates a filter configuration, i.e. that the value to filter by is not
null or undefined.

**Kind**: instance method of [<code>table</code>](#module_perspective..table)  
**Params**

- [filter] <code>[ &#x27;Array&#x27; ].&lt;string&gt;</code> - a filter configuration to test.


* * *

<a name="module_perspective..table+view"></a>

#### table.view([config]) ⇒ <code>view</code>
Create a new [view](#module_perspective..view) from this table with a
specified configuration. For a conceptual understanding of the
configuration options, see the [Conceptual Overview](https://perspective.finos.org/docs/md/installation.html).

**Kind**: instance method of [<code>table</code>](#module_perspective..table)  
**Returns**: <code>view</code> - A new [view](#module_perspective..view) object for the
supplied configuration, bound to this table  
**Params**

- [config] <code>Object</code> - The configuration object for this
[view](#module_perspective..view).
    - [.row_pivots] <code>[ &#x27;Array&#x27; ].&lt;string&gt;</code> - An array of column names to
use as [Row Pivots](https://en.wikipedia.org/wiki/Pivot_table#Row_labels).
    - [.column_pivots] <code>[ &#x27;Array&#x27; ].&lt;string&gt;</code> - An array of column names to
use as [Column Pivots](https://en.wikipedia.org/wiki/Pivot_table#Column_labels).
    - [.columns] <code>[ &#x27;Array&#x27; ].&lt;Object&gt;</code> - An array of column names for the
output columns. If none are provided, all columns are output.
    - [.aggregates] <code>Object</code> - An object, the keys of which are
column names, and their respective values are the aggregates calculations
to use when this view has `row_pivots`. A column provided to
`config.columns` without an aggregate in this object, will use the
default aggregate calculation for its type.
    - [.filter] <code>[ &#x27;Array&#x27; ].&lt;Array.&lt;string&gt;&gt;</code> - An Array of Filter
configurations to apply. A filter configuration is an array of 3
elements: A column name, a supported filter comparison string (e.g.
'===', '>'), and a value to compare.
    - [.sort] <code>[ &#x27;Array&#x27; ].&lt;string&gt;</code> - An Array of Sort configurations to
apply. A sort configuration is an array of 2 elements: A column name, and
a sort direction, which are: "none", "asc", "desc", "col asc", "col
desc", "asc abs", "desc abs", "col asc abs", "col desc abs".

**Example**  
```js
var view = table.view({
     row_pivots: ["region"],
     columns: ["region"],
     aggregates: {"region": "dominant"},
     filter: [["client", "contains", "fred"]],
     sort: [["value", "asc"]]
});
```

* * *

<a name="module_perspective..table+update"></a>

#### table.update(data)
Updates the rows of a [table](#module_perspective..table). Updated rows are
pushed down to any derived [view](#module_perspective..view) objects.

**Kind**: instance method of [<code>table</code>](#module_perspective..table)  
**See**: [table](#module_perspective..table)  
**Params**

- data <code>Object.&lt;string, Array&gt;</code> | <code>Array.&lt;Object&gt;</code> | <code>string</code> - The input data
for this table. [table](#module_perspective..table)s are immutable after
creation, so this method cannot be called with a schema.

Otherwise, the supported input types are the same as the
[table](#module_perspective..table) constructor.


* * *

<a name="module_perspective..table+remove"></a>

#### table.remove(data)
Removes the rows of a [table](#module_perspective..table). Removed rows are
pushed down to any derived [view](#module_perspective..view) objects.

**Kind**: instance method of [<code>table</code>](#module_perspective..table)  
**See**: [table](#module_perspective..table)  
**Params**

- data <code>[ &#x27;Array&#x27; ].&lt;Object&gt;</code> - An array of primary keys to remove.


* * *

<a name="module_perspective..table+add_computed"></a>

#### table.add\_computed(computed)
Create a new table with the addition of new computed columns (defined as
javascript functions)

**Kind**: instance method of [<code>table</code>](#module_perspective..table)  
**Params**

- computed <code>Computation</code> - A computation specification object


* * *

<a name="module_perspective..table+columns"></a>

#### table.columns(computed) ⇒ <code>[ &#x27;Promise&#x27; ].&lt;Array.&lt;string&gt;&gt;</code>
The column names of this table.

**Kind**: instance method of [<code>table</code>](#module_perspective..table)  
**Returns**: <code>[ &#x27;Promise&#x27; ].&lt;Array.&lt;string&gt;&gt;</code> - An array of column names for this
table.  
**Params**

- computed <code>boolean</code> - Should computed columns be included? (default
false)


* * *

<a name="module_perspective..name_to_computation"></a>

### perspective~name\_to\_computation(name)
Map a string name of a computation function to a value in the
`t_computed_function_name` enum.

**Kind**: inner method of [<code>perspective</code>](#module_perspective)  
**Params**

- name <code>String</code> - The name of a computation function.


* * *

