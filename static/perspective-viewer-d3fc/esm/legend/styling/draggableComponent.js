function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import * as d3 from "d3";
import { getChartContainer } from "../../plugin/root";
import { enforceContainerBoundaries, margin } from "./enforceContainerBoundaries";
const resizeForDraggingEvent = "resize.for-dragging";
export function draggableComponent() {
  let pinned = true;
  let settings = null;

  const draggable = element => {
    const node = element.node();
    node.style.cursor = "move";

    if (settings.legend) {
      node.style.left = settings.legend.left;
      node.style.top = settings.legend.top;
    }

    const drag = d3.drag().on("drag", function () {
      const offsets = enforceContainerBoundaries(this, d3.event.dx, d3.event.dy);
      this.style.left = "".concat(this.offsetLeft + offsets.x, "px");
      this.style.top = "".concat(this.offsetTop + offsets.y, "px");
      const position = {
        left: this.style.left,
        top: this.style.top
      };
      settings.legend = _objectSpread({}, settings.legend, {}, position);

      if (isNodeInTopRight(node)) {
        pinned = pinNodeToTopRight(node);
        return;
      }

      pinned = unpinNodeFromTopRight(node, pinned);
    });
    element.call(drag);
  };

  draggable.settings = (...args) => {
    if (!args.length) {
      return settings;
    }

    settings = args[0];
    return draggable;
  };

  return draggable;
}

function unpinNodeFromTopRight(node, pinned) {
  if (pinned !== false) {
    // Default behaviour for the legend is to remain pinned to the top right
    // hand corner with a specific margin. Once the legend has moved we
    // cannot continue to use that css based approach.
    d3.select(window).on(resizeForDraggingEvent, function () {
      const offsets = enforceContainerBoundaries(node, 0, 0);
      node.style.left = "".concat(node.offsetLeft + offsets.x, "px");
      node.style.top = "".concat(node.offsetTop + offsets.y, "px");
    });
  }

  return false;
}

function pinNodeToTopRight(node) {
  d3.select(window).on(resizeForDraggingEvent, null);
  node.style.left = "auto";
  return true;
}

function isNodeInTopRight(node) {
  const nodeRect = node.getBoundingClientRect();
  const containerRect = d3.select(getChartContainer(node)).node().getBoundingClientRect();
  const fuzz = 5;
  return nodeRect.right + margin + fuzz >= containerRect.right && nodeRect.top - margin - fuzz <= containerRect.top;
}
//# sourceMappingURL=draggableComponent.js.map