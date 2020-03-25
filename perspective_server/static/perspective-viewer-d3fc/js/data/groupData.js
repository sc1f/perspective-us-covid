/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import {labelFunction} from "../axis/axisLabel";
import {splitIntoMultiSeries} from "./splitIntoMultiSeries";

export function groupData(settings, data) {
    const stack = {stack: false};
    const groupedSeries = splitIntoMultiSeries(settings, data, stack).map(data => groupPointDataByMainValue(settings, data, stack));

    if (settings.mainValues.length > 1) {
        const flattenedSeries = groupedSeries.reduce((a, b) => a.concat(b));
        return flattenedSeries;
    }

    return groupedSeries;
}

export function groupAndStackData(settings, data) {
    const stack = {stack: true};
    return splitIntoMultiSeries(settings, data, stack).map(data => groupPointDataByMainValue(settings, data, stack));
}

function seriesDataFn(settings, data, {stack = false}) {
    const labelfn = labelFunction(settings);

    return mainValue => {
        const baseValue = col => (stack ? col[`__BASE_VALUE__${mainValue.name}`] || 0 : 0);
        const series = data.map((col, i) => ({
            crossValue: labelfn(col, i),
            mainValue: !!col[mainValue.name] ? col[mainValue.name] : null,
            baseValue: baseValue(col),
            key: col.__KEY__ ? `${col.__KEY__}|${mainValue.name}` : mainValue.name,
            row: col.row || col
        }));
        series.key = series[0].key;
        return series;
    };
}

function groupPointDataByMainValue(settings, data, {stack = false}) {
    // Split data into a group for each aggregate (mainValue)
    const seriesFn = seriesDataFn(settings, data, {stack});

    if (settings.mainValues.length > 1) {
        return settings.mainValues.map(seriesFn);
    } else {
        return seriesFn(settings.mainValues[0]);
    }
}
