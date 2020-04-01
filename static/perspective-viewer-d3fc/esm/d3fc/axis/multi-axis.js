import { select, line } from "d3";
import { axisOrdinalTop, axisOrdinalBottom, axisOrdinalLeft, axisOrdinalRight, dataJoin, rebindAll, exclude } from "d3fc";
import store from "./store";

const multiAxis = (orient, baseAxis, scale) => {
  let tickSizeOuter = 6;
  let tickSizeInner = 6;
  let axisStore = store("tickFormat", "ticks", "tickArguments", "tickValues", "tickPadding");

  let decorate = () => {};

  let groups = null;
  const groupDataJoin = dataJoin("g", "group");
  const domainPathDataJoin = dataJoin("path", "domain");

  const translate = (x, y) => isVertical() ? `translate(${y}, ${x})` : `translate(${x}, ${y})`;

  const pathTranspose = arr => isVertical() ? arr.map(d => [d[1], d[0]]) : arr;

  const isVertical = () => orient === "left" || orient === "right";

  const multiAxis = selection => {
    if (!groups) {
      axisStore(baseAxis(scale).decorate(decorate))(selection);
      return;
    }

    if (selection.selection) {
      groupDataJoin.transition(selection);
      domainPathDataJoin.transition(selection);
    }

    selection.each((data, index, group) => {
      const element = group[index];
      const container = select(element);
      const sign = orient === "bottom" || orient === "right" ? 1 : -1; // add the domain line

      const range = scale.range();
      const domainPathData = pathTranspose([[range[0], sign * tickSizeOuter], [range[0], 0], [range[1], 0], [range[1], sign * tickSizeOuter]]);
      const domainLine = domainPathDataJoin(container, [data]);
      domainLine.attr("d", line()(domainPathData)).attr("stroke", "#000").attr("fill", "none");
      const g = groupDataJoin(container, groups);

      const getAxisSize = i => Array.isArray(tickSizeInner) ? tickSizeInner[i] : tickSizeInner;

      const getAxisOffset = i => {
        let sum = 0;

        for (let n = 0; n < i; n++) {
          sum += getAxisSize(n);
        }

        return sum;
      };

      g.attr("transform", (d, i) => translate(0, sign * getAxisOffset(i))).each((group, i, nodes) => {
        const groupElement = select(nodes[i]);
        const groupScale = scaleFromGroup(scale, group);
        const useAxis = axisStore(baseAxis(groupScale)).decorate((s, data) => decorate(s, data, i)).tickSizeInner(getAxisSize(i)).tickOffset(d => groupScale.step(d) / 2);
        useAxis(groupElement);
        groupElement.select("path.domain").attr("visibility", "hidden");
      }); // exit

      g.exit().attr("transform", (d, i) => translate(0, sign * getAxisOffset(i)));
    });
  };

  const scaleFromGroup = (scale, group) => {
    function customScale(value) {
      const values = value.domain;
      return values.reduce((sum, d) => sum + scale(d), 0) / values.length;
    }

    customScale.ticks = () => {
      return group;
    };

    customScale.tickFormat = () => d => {
      return d.text;
    };

    customScale.copy = () => scaleFromGroup(scale, group);

    customScale.step = value => value.domain.length * scale.step();

    rebindAll(customScale, scale, exclude("ticks", "step", "copy"));
    return customScale;
  };

  multiAxis.tickSize = (...args) => {
    if (!args.length) {
      return tickSizeInner;
    }

    tickSizeInner = tickSizeOuter = Number(args[0]);
    return multiAxis;
  };

  multiAxis.tickSizeInner = (...args) => {
    if (!args.length) {
      return tickSizeInner;
    }

    tickSizeInner = Array.isArray(args[0]) ? args[0] : Number(args[0]);
    return multiAxis;
  };

  multiAxis.tickSizeOuter = (...args) => {
    if (!args.length) {
      return tickSizeOuter;
    }

    tickSizeOuter = Number(args[0]);
    return multiAxis;
  };

  multiAxis.decorate = (...args) => {
    if (!args.length) {
      return decorate;
    }

    decorate = args[0];
    return multiAxis;
  };

  multiAxis.groups = (...args) => {
    if (!args.length) {
      return groups;
    }

    groups = args[0];
    return multiAxis;
  };

  rebindAll(multiAxis, axisStore);
  return multiAxis;
};

export const multiAxisTop = scale => multiAxis("top", axisOrdinalTop, scale);
export const multiAxisBottom = scale => multiAxis("bottom", axisOrdinalBottom, scale);
export const multiAxisLeft = scale => multiAxis("left", axisOrdinalLeft, scale);
export const multiAxisRight = scale => multiAxis("right", axisOrdinalRight, scale);
//# sourceMappingURL=multi-axis.js.map