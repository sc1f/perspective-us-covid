/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import * as d3 from "d3";
import * as fc from "d3fc";
import {flattenArray} from "./flatten";

export const scale = () => d3.scaleTime();

export const domain = () => {
    const base = fc.extentTime();

    let valueNames = ["crossValue"];

    const _domain = data => {
        base.accessors(valueNames.map(v => d => new Date(d[v])));

        return getDataExtent(flattenArray(data));
    };

    fc.rebindAll(_domain, base, fc.exclude("include", "paddingStrategy"));

    const getMinimumGap = data => {
        const gaps = valueNames.map(valueName =>
            data
                .map(d => new Date(d[valueName]).getTime())
                .sort((a, b) => a - b)
                .filter((d, i, a) => i === 0 || d !== a[i - 1])
                .reduce((acc, d, i, src) => (i === 0 || acc <= d - src[i - 1] ? acc : Math.abs(d - src[i - 1])))
        );

        return Math.min(...gaps);
    };

    const getDataExtent = data => {
        const dataWidth = getMinimumGap(data);
        return base.padUnit("domain").pad([dataWidth / 2, dataWidth / 2])(data);
    };

    _domain.valueName = (...args) => {
        if (!args.length) {
            return valueNames[0];
        }
        valueNames = [args[0]];
        return _domain;
    };
    _domain.valueNames = (...args) => {
        if (!args.length) {
            return valueNames;
        }
        valueNames = args[0];
        return _domain;
    };

    return _domain;
};

export const labelFunction = valueName => d => new Date(d[valueName][0]);
