import "core-js/modules/es.array.iterator";
import "core-js/modules/web.dom-collections.iterator";

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
import { enforceContainerBoundaries } from "./enforceContainerBoundaries";
const horizontalHandleClass = "horizontal-drag-handle";
const verticalHandleClass = "vertical-drag-handle";
const cornerHandleClass = "corner-drag-handle";
const handlesContainerId = "dragHandles";
const fillOpacity = 0.0;
const resizeEvent = "resize";
export function resizableComponent() {
  let handleWidthPx = 9;
  let zIndex = 3;
  let settings = null;
  const minDimensionsPx = {
    height: 100,
    width: 100
  };
  const maxDimensionsPx = {
    height: null,
    width: null
  };
  const callbacks = [];

  const executeCallbacks = (event, direction) => callbacks.filter(callback => callback.event === event).forEach(callback => callback.execute(direction));

  const resizable = container => {
    if (handlesContainerExists(container)) {
      return;
    }

    const dragHelper = {
      left: () => executeCallbacks(resizeEvent, {
        horizontal: dragLeft(d3.event),
        vertical: false
      }),
      top: () => executeCallbacks(resizeEvent, {
        horizontal: false,
        vertical: dragTop(d3.event)
      }),
      right: () => executeCallbacks(resizeEvent, {
        horizontal: dragRight(d3.event),
        vertical: false
      }),
      bottom: () => executeCallbacks(resizeEvent, {
        horizontal: false,
        vertical: dragBottom(d3.event)
      }),
      topleft: () => executeCallbacks(resizeEvent, {
        horizontal: dragLeft(d3.event),
        vertical: dragTop(d3.event)
      }),
      topright: () => executeCallbacks(resizeEvent, {
        horizontal: dragRight(d3.event),
        vertical: dragTop(d3.event)
      }),
      bottomright: () => executeCallbacks(resizeEvent, {
        horizontal: dragRight(d3.event),
        vertical: dragBottom(d3.event)
      }),
      bottomleft: () => executeCallbacks(resizeEvent, {
        horizontal: dragLeft(d3.event),
        vertical: dragBottom(d3.event)
      })
    };
    const containerNode = container.node();

    if (settings.legend) {
      containerNode.style.height = settings.legend.height;
      containerNode.style.width = settings.legend.width;
    }

    const containerRect = containerNode.getBoundingClientRect();
    const handles = container.append("svg").attr("id", handlesContainerId).attr("width", containerRect.width).attr("height", containerRect.height);
    const handlesGroup = handles.append("g");

    const isVertical = d => d === "left" || d === "right";

    const xCoordHelper = {
      left: 0,
      top: handleWidthPx,
      right: containerRect.width - handleWidthPx,
      bottom: handleWidthPx
    };
    const yCoordHelper = {
      left: handleWidthPx,
      top: 0,
      right: handleWidthPx,
      bottom: containerRect.height - handleWidthPx
    };
    const edgeHandles = ["left", "top", "right", "bottom"];
    const [leftHandle, topHandle, rightHandle, bottomHandle] = edgeHandles.map(edge => handlesGroup.append("rect").attr("id", "drag".concat(edge)).attr("class", isVertical(edge) ? verticalHandleClass : horizontalHandleClass).attr("y", yCoordHelper[edge]).attr("x", xCoordHelper[edge]).attr("height", isVertical(edge) ? containerRect.height - handleWidthPx * 2 : handleWidthPx).attr("width", isVertical(edge) ? handleWidthPx : containerRect.width - handleWidthPx * 2).attr("fill", isVertical(edge) ? "lightgreen" : "lightblue").attr("fill-opacity", fillOpacity).style("z-index", zIndex).attr("cursor", isVertical(edge) ? "ew-resize" : "ns-resize").call(d3.drag().on("drag", dragHelper[edge])));

    const concatCornerEdges = corner => "".concat(corner[0]).concat(corner[1]);

    const cornerCursorHelper = {
      topleft: "nwse",
      topright: "nesw",
      bottomright: "nwse",
      bottomleft: "nesw"
    };
    const cornerHandles = [["top", "left"], ["top", "right"], ["bottom", "right"], ["bottom", "left"]];
    const [topLeftHandle, topRightHandle, bottomRightHandle, bottomLeftHandle] = cornerHandles.map(corner => handlesGroup.append("rect").attr("id", "drag".concat(concatCornerEdges(corner))).attr("class", "".concat(cornerHandleClass, " ").concat(corner[0], " ").concat(corner[1])).attr("height", handleWidthPx).attr("width", handleWidthPx).attr("fill", "red").attr("fill-opacity", fillOpacity).style("z-index", zIndex).attr("cursor", "".concat(cornerCursorHelper[concatCornerEdges(corner)], "-resize")).call(d3.drag().on("drag", dragHelper[concatCornerEdges(corner)])));
    enforceMaxDimensions("height", "y", bottomHandle);
    enforceMaxDimensions("width", "x", rightHandle);
    pinCorners(handles);

    function dragLeft(event) {
      const offset = enforceDistToParallelBarConstraints(enforceContainerBoundaries(leftHandle.node(), event.x, 0).x, handles, "width", (x, y) => x - y);
      containerNode.style.left = "".concat(containerNode.offsetLeft + offset, "px");
      containerNode.style.width = "".concat(containerNode.offsetWidth - offset, "px");
      updateSettings();
      return resizeAndRelocateHandles(rightHandle, offset, "width", "x");
    }

    function dragRight(event) {
      const offset = -enforceDistToParallelBarConstraints(enforceContainerBoundaries(rightHandle.node(), event.dx, 0).x, handles, "width", (x, y) => x + y);
      if (pointerFallenBehindAbsoluteCoordinates(offset, "x", rightHandle, event)) return false;
      containerNode.style.width = "".concat(containerNode.offsetWidth - offset, "px");
      updateSettings();
      return resizeAndRelocateHandles(rightHandle, offset, "width", "x");
    }

    function dragTop(event) {
      const offset = enforceDistToParallelBarConstraints(enforceContainerBoundaries(topHandle.node(), 0, event.y).y, handles, "height", (x, y) => x - y);
      containerNode.style.top = "".concat(containerNode.offsetTop + offset, "px");
      containerNode.style.height = "".concat(containerNode.offsetHeight - offset, "px");
      updateSettings();
      return resizeAndRelocateHandles(bottomHandle, offset, "height", "y");
    }

    function dragBottom(event) {
      const offset = -enforceDistToParallelBarConstraints(enforceContainerBoundaries(bottomHandle.node(), 0, event.dy).y, handles, "height", (x, y) => x + y);
      if (pointerFallenBehindAbsoluteCoordinates(offset, "y", bottomHandle, event)) return false;
      containerNode.style.height = "".concat(containerNode.offsetHeight - offset, "px");
      updateSettings();
      return resizeAndRelocateHandles(bottomHandle, offset, "height", "y");
    }

    function updateSettings() {
      const dimensions = {
        top: containerNode.style.top,
        left: containerNode.style.left,
        height: containerNode.style.height,
        width: containerNode.style.width
      };
      settings.legend = _objectSpread({}, settings.legend, {}, dimensions);
    }

    function resizeAndRelocateHandles(handle, offset, dimension, axis) {
      extendHandlesBox(handles, dimension, offset);
      pinHandleToHandleBoxEdge(handle, axis, offset);
      extendPerpendicularHandles(handles, offset, dimension, dimension === "height" ? verticalHandleClass : horizontalHandleClass);
      pinCorners(handles);
      return offset != 0;
    }

    function pinCorners(handles) {
      topLeftHandle.attr("y", 0, "x", 0);
      topRightHandle.attr("y", 0).attr("x", handles.attr("width") - handleWidthPx);
      bottomRightHandle.attr("y", handles.attr("height") - handleWidthPx).attr("x", handles.attr("width") - handleWidthPx);
      bottomLeftHandle.attr("y", handles.attr("height") - handleWidthPx).attr("x", 0);
    }

    function enforceMaxDimensions(dimension, axis, relativeHandle) {
      if (!!maxDimensionsPx[dimension] && maxDimensionsPx[dimension] < containerRect[dimension]) {
        containerNode.style[dimension] = "".concat(maxDimensionsPx[dimension], "px");
        resizeAndRelocateHandles(relativeHandle, containerRect[dimension] - maxDimensionsPx[dimension], dimension, axis);
      }
    }
  };

  resizable.on = (event, callback) => {
    callbacks.push({
      event: event,
      execute: callback
    });
    return resizable;
  };

  resizable.zIndex = input => {
    zIndex = input;
    return resizable;
  };

  resizable.settings = (...args) => {
    if (!args.length) {
      return settings;
    }

    settings = args[0];
    return resizable;
  };

  resizable.minWidth = input => {
    minDimensionsPx.width = input;
    if (!!maxDimensionsPx.width) maxDimensionsPx.width = Math.max(minDimensionsPx.width, maxDimensionsPx.width);
    return resizable;
  };

  resizable.minHeight = input => {
    minDimensionsPx.height = input;
    if (!!maxDimensionsPx.height) maxDimensionsPx.height = Math.max(minDimensionsPx.height, maxDimensionsPx.height);
    return resizable;
  };

  resizable.handleWidth = input => {
    handleWidthPx = input;
    return resizable;
  };

  resizable.maxWidth = input => {
    maxDimensionsPx.width = input;
    minDimensionsPx.width = Math.min(minDimensionsPx.width, maxDimensionsPx.width);
    return resizable;
  };

  resizable.maxHeight = input => {
    maxDimensionsPx.height = input;
    minDimensionsPx.height = Math.min(minDimensionsPx.height, maxDimensionsPx.height);
    return resizable;
  };

  function pointerFallenBehindAbsoluteCoordinates(offset, axis, handle, event) {
    const becauseCrossedMinSize = (offset, axis, handle, event) => offset < 0 && event[axis] < Number(handle.attr(axis));

    const becauseExitedCoordinateSpace = (offset, axis, handle, event) => offset > 0 && event[axis] > Number(handle.attr(axis));

    return becauseCrossedMinSize(offset, axis, handle, event) || becauseExitedCoordinateSpace(offset, axis, handle, event);
  }

  function enforceDistToParallelBarConstraints(offset, dragHandleContainer, dimension, operatorFunction) {
    const anticipatedDimension = operatorFunction(Number(dragHandleContainer.attr(dimension)), offset);

    if (anticipatedDimension < minDimensionsPx[dimension]) {
      const difference = minDimensionsPx[dimension] - anticipatedDimension;
      return operatorFunction(offset, difference);
    }

    if (!!maxDimensionsPx[dimension] && anticipatedDimension > maxDimensionsPx[dimension]) {
      const difference = maxDimensionsPx[dimension] - anticipatedDimension;
      return operatorFunction(offset, difference);
    }

    return offset;
  }

  return resizable;
} // "dimension" referring to width or height

const extendPerpendicularHandles = (handles, offset, dimension, orientationClass) => {
  const perpendicularHandles = handles.selectAll(".".concat(orientationClass));
  perpendicularHandles.each((_, i, nodes) => {
    const handleNode = nodes[i];
    const handleElement = d3.select(handleNode);
    handleElement.attr(dimension, handleNode.getBoundingClientRect()[dimension] - offset);
  });
};

const handlesContainerExists = container => container.select("#".concat(handlesContainerId)).size() > 0;

const pinHandleToHandleBoxEdge = (handle, axis, offset) => handle.attr(axis, Number(handle.attr(axis)) - offset);

const extendHandlesBox = (handles, dimension, offset) => handles.attr(dimension, handles.node().getBoundingClientRect()[dimension] - offset);
//# sourceMappingURL=resizableComponent.js.map