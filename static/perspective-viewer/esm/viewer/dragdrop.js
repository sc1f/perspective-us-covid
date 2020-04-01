import "core-js/modules/es.string.replace";
import "core-js/modules/web.dom-collections.iterator";

/******************************************************************************
 *
 * Copyright (c) 2018, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import { swap } from "../utils.js";

function calc_index(event) {
  if (this._active_columns.children.length == 0) {
    return 0;
  } else {
    let is_last_null = false;

    for (let cidx in this._active_columns.children) {
      var _child$classList;

      let child = this._active_columns.children[cidx];
      is_last_null = is_last_null || (child === null || child === void 0 ? void 0 : (_child$classList = child.classList) === null || _child$classList === void 0 ? void 0 : _child$classList.contains("null-column"));

      if (child.offsetTop + child.offsetHeight > event.offsetY + this._active_columns.scrollTop) {
        return parseInt(cidx);
      }
    }

    let last_index = this._active_columns.children.length;

    if (is_last_null) {
      last_index--;
    }

    return last_index;
  }
}

export function dragend(event) {
  let div = event.target.getRootNode().host;
  let parent = div;

  if (parent.tagName === "PERSPECTIVE-VIEWER") {
    parent = event.target.parentElement;
  } else {
    parent = div.parentElement;
  }

  let idx = Array.prototype.slice.call(parent.children).indexOf(div.tagName === "PERSPECTIVE-ROW" ? div : event.target);
  let attr_name = parent.getAttribute("for");

  if (this.hasAttribute(attr_name)) {
    let attr_value = JSON.parse(this.getAttribute(attr_name));
    attr_value.splice(idx, 1);

    if (attr_value.length === 0) {
      this.removeAttribute(attr_name);
    } else {
      this.setAttribute(attr_name, JSON.stringify(attr_value));
    }
  }
}
export function drop(ev) {
  ev.preventDefault();
  ev.currentTarget.classList.remove("dropping");

  if (this._drop_target_hover) {
    this._drop_target_hover.removeAttribute("drop-target");
  }

  let data = ev.dataTransfer.getData("text");
  if (!data) return;
  data = JSON.parse(data); // Update the columns attribute

  let name = ev.currentTarget.querySelector("ul").getAttribute("for") || ev.currentTarget.getAttribute("id").replace("_", "-");
  let columns = JSON.parse(this.getAttribute(name) || "[]");
  let data_index = columns.indexOf(data[0]);

  if (data_index !== -1) {
    columns.splice(data_index, 1);
  }

  const filtering = name.indexOf("filter") > -1;

  if (filtering) {
    this.setAttribute(name, JSON.stringify(columns.concat([data])));
  } else if (name.indexOf("sort") > -1) {
    this.setAttribute(name, JSON.stringify(columns.concat([[data[0]]])));
  } else {
    this.setAttribute(name, JSON.stringify(columns.concat([data[0]])));
  } // Deselect the dropped column


  if (this._plugin.deselectMode === "pivots" && this._get_visible_column_count() > 1 && name !== "sort" && !filtering) {
    for (let x of this.shadowRoot.querySelectorAll("#active_columns perspective-row")) {
      if (x.getAttribute("name") === data[0]) {
        this._active_columns.removeChild(x);

        break;
      }
    }

    this._update_column_view();
  }

  this._debounce_update();
}
export function column_dragend(event) {
  let data = event.target.parentElement.parentElement;

  if (Array.prototype.slice(this._active_columns.children).indexOf(data) > -1 && this._get_visible_column_count() > 1 && event.dataTransfer.dropEffect !== "move") {
    this._active_columns.removeChild(data);

    this._update_column_view();
  }

  this._active_columns.classList.remove("dropping");
}
export function column_dragleave(event) {
  let src = event.relatedTarget;

  while (src && src !== this._active_columns) {
    src = src.parentElement;
  }

  if (src === null) {
    this._active_columns.classList.remove("dropping");

    if (this._drop_target_null) {
      this._active_columns.replaceChild(this._drop_target_null, this._drop_target_hover);

      delete this._drop_target_null;
    }

    if (this._drop_target_hover.parentElement === this._active_columns) {
      this._active_columns.removeChild(this._drop_target_hover);
    }

    if (this._original_index !== -1) {
      this._active_columns.insertBefore(this._drop_target_hover, this._active_columns.children[this._original_index]);
    }

    this._drop_target_hover.removeAttribute("drop-target");
  }
}

function _unset_drop_target_null() {
  if (this._drop_target_null) {
    if (this._drop_target_null.parentElement === this._active_columns) {
      swap(this._active_columns, this._drop_target_hover, this._drop_target_null);
    } else {
      this._active_columns.replaceChild(this._drop_target_null, this._drop_target_hover);
    }

    delete this._drop_target_null;
  }
}

function column_swap(new_index) {
  _unset_drop_target_null.call(this);

  if (this._active_columns.children[new_index]) {
    if (this._drop_target_hover !== this._active_columns.children[new_index]) {
      this._drop_target_null = this._active_columns.children[new_index];
      swap(this._active_columns, this._active_columns.children[new_index], this._drop_target_hover);
    }
  }
}

function column_replace(new_index) {
  _unset_drop_target_null.call(this);

  if (this._active_columns.children[new_index]) {
    this._drop_target_null = this._active_columns.children[new_index];

    this._active_columns.replaceChild(this._drop_target_hover, this._active_columns.children[new_index]);
  }
}

export function column_dragover(event) {
  var _this$_plugin$initial, _this$_plugin$initial2, _this$_plugin$initial3, _this$_plugin$initial4, _this$_plugin$initial5, _this$_plugin$initial6, _this$_plugin$initial7, _this$_plugin$initial8;

  event.preventDefault();
  event.dataTransfer.dropEffect = "move";

  if (event.currentTarget.className !== "dropping") {
    event.currentTarget.classList.add("dropping");
  }

  if (!this._drop_target_hover.hasAttribute("drop-target")) {
    this._drop_target_hover.toggleAttribute("drop-target", true);
  }

  let new_index = calc_index.call(this, event);
  const current_index = Array.prototype.slice.call(this._active_columns.children).indexOf(this._drop_target_hover);
  const over_elem = this._active_columns.children[new_index];
  const to_replace = new_index < ((_this$_plugin$initial = this._plugin.initial) === null || _this$_plugin$initial === void 0 ? void 0 : (_this$_plugin$initial2 = _this$_plugin$initial.names) === null || _this$_plugin$initial2 === void 0 ? void 0 : _this$_plugin$initial2.length) - 1;
  const is_diff = this._drop_target_hover !== this._active_columns.children[new_index];
  const from_active = this._original_index !== -1;
  const from_replace = from_active && this._original_index < ((_this$_plugin$initial3 = this._plugin.initial) === null || _this$_plugin$initial3 === void 0 ? void 0 : (_this$_plugin$initial4 = _this$_plugin$initial3.names) === null || _this$_plugin$initial4 === void 0 ? void 0 : _this$_plugin$initial4.length) - 1;
  const from_append = from_active && this._original_index >= ((_this$_plugin$initial5 = this._plugin.initial) === null || _this$_plugin$initial5 === void 0 ? void 0 : (_this$_plugin$initial6 = _this$_plugin$initial5.names) === null || _this$_plugin$initial6 === void 0 ? void 0 : _this$_plugin$initial6.length) - 1;
  const from_required = from_active && this._original_index < ((_this$_plugin$initial7 = this._plugin.initial) === null || _this$_plugin$initial7 === void 0 ? void 0 : _this$_plugin$initial7.count);
  const to_required = new_index < ((_this$_plugin$initial8 = this._plugin.initial) === null || _this$_plugin$initial8 === void 0 ? void 0 : _this$_plugin$initial8.count);
  const to_null = !to_required && (over_elem === null || over_elem === void 0 ? void 0 : over_elem.classList.contains("null-column"));

  if (from_required && to_null) {
    _unset_drop_target_null.call(this);
  } else if (to_replace && from_append && is_diff) {
    var _this$_plugin$initial9, _this$_plugin$initial10, _this$_plugin$initial11, _this$_plugin$initial12, _this$_active_columns;

    _unset_drop_target_null.call(this);

    const from_last = this._original_index === ((_this$_plugin$initial9 = this._plugin.initial) === null || _this$_plugin$initial9 === void 0 ? void 0 : (_this$_plugin$initial10 = _this$_plugin$initial9.names) === null || _this$_plugin$initial10 === void 0 ? void 0 : _this$_plugin$initial10.length) - 1 && this._drop_target_hover === this._active_columns.children[this._original_index] && this._active_columns.children.length === ((_this$_plugin$initial11 = this._plugin.initial) === null || _this$_plugin$initial11 === void 0 ? void 0 : (_this$_plugin$initial12 = _this$_plugin$initial11.names) === null || _this$_plugin$initial12 === void 0 ? void 0 : _this$_plugin$initial12.length);

    if (from_last) {
      this._drop_target_null = this._active_columns.children[new_index];
      swap(this._active_columns, this._active_columns.children[new_index], this._drop_target_hover);
    } else if (!((_this$_active_columns = this._active_columns.children[new_index]) === null || _this$_active_columns === void 0 ? void 0 : _this$_active_columns.classList.contains("null-column"))) {
      this._drop_target_null = this._active_columns.children[new_index];

      this._active_columns.replaceChild(this._drop_target_hover, this._active_columns.children[new_index]);

      this._active_columns.insertBefore(this._drop_target_null, this._active_columns.children[this._original_index]);
    } else {
      if (this._drop_target_hover !== this._active_columns.children[new_index]) {
        this._drop_target_null = this._active_columns.children[new_index];

        this._active_columns.replaceChild(this._drop_target_hover, this._active_columns.children[new_index]);
      }
    }
  } else if (to_replace && from_active && is_diff) {
    column_swap.call(this, new_index);
  } else if (to_replace && !from_active && is_diff) {
    column_replace.call(this, new_index);
  } else if (!to_replace && from_replace && is_diff) {
    column_swap.call(this, new_index);
  } else if (to_null && from_active) {
    column_swap.call(this, new_index);
  } else if (to_null && !from_active) {
    column_replace.call(this, new_index);
  } else if (current_index < new_index) {
    if (new_index + 1 < this._active_columns.children.length) {
      if (!this._active_columns.children[new_index + 1].hasAttribute("drop-target")) {
        _unset_drop_target_null.call(this);

        this._active_columns.insertBefore(this._drop_target_hover, this._active_columns.children[new_index + 1]);
      }
    } else {
      if (!this._active_columns.children[this._active_columns.children.length - 1].hasAttribute("drop-target")) {
        _unset_drop_target_null.call(this);

        this._active_columns.appendChild(this._drop_target_hover);
      }
    }
  } else if (new_index < this._active_columns.children.length) {
    if (!this._active_columns.children[new_index].hasAttribute("drop-target")) {
      _unset_drop_target_null.call(this);

      this._active_columns.insertBefore(this._drop_target_hover, this._active_columns.children[new_index]);
    }
  } else {
    if (!this._active_columns.children[this._active_columns.children.length - 1].hasAttribute("drop-target")) {
      _unset_drop_target_null.call(this);

      this._active_columns.appendChild(this._drop_target_hover);
    }
  }
}
export function column_drop(ev) {
  ev.preventDefault();
  delete this._drop_target_null;
  ev.currentTarget.classList.remove("dropping");

  if (this._drop_target_hover.parentElement === this._active_columns) {
    this._drop_target_hover.removeAttribute("drop-target");
  }

  let data = ev.dataTransfer.getData("text");
  if (!data) return;

  this._update_column_view();
}
export function dragenter(ev) {
  ev.stopPropagation();
  ev.preventDefault();
  ev.currentTarget.classList.add("dropping");
}
export function dragover(ev) {
  ev.stopPropagation();
  ev.preventDefault();
  ev.currentTarget.classList.add("dropping");
  ev.dataTransfer.dropEffect = "move";
}
export function dragleave(ev) {
  if (ev.currentTarget == ev.target) {
    ev.stopPropagation();
    ev.preventDefault();
    ev.currentTarget.classList.remove("dropping");
  }
}
//# sourceMappingURL=dragdrop.js.map