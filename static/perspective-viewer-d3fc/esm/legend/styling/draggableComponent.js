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
      this.style.left = `${this.offsetLeft + offsets.x}px`;
      this.style.top = `${this.offsetTop + offsets.y}px`;
      const position = {
        left: this.style.left,
        top: this.style.top
      };
      settings.legend = { ...settings.legend,
        ...position
      };

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
      node.style.left = `${node.offsetLeft + offsets.x}px`;
      node.style.top = `${node.offsetTop + offsets.y}px`;
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