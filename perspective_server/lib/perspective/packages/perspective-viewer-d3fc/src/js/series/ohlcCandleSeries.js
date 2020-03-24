/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import * as fc from "d3fc";
import {colorScale, setOpacity} from "../series/seriesColors";

const isUp = d => d.closeValue >= d.openValue;

export function ohlcCandleSeries(settings, seriesCanvas, upColor) {
    const domain = upColor.domain();
    const downColor = colorScale()
        .domain(domain)
        .settings(settings)
        .defaultColors([settings.colorStyles["series-2"]])
        .mapFunction(setOpacity(0.5))();
    const avgColor = colorScale()
        .settings(settings)
        .domain(domain)();

    const series = seriesCanvas()
        .crossValue(d => d.crossValue)
        .openValue(d => d.openValue)
        .highValue(d => d.highValue)
        .lowValue(d => d.lowValue)
        .closeValue(d => d.closeValue)
        .decorate((context, d) => {
            const color = isUp(d) ? upColor(d.key) : downColor(d.key);
            context.fillStyle = color;
            context.strokeStyle = color;
        });

    const bollingerAverageSeries = fc
        .seriesCanvasLine()
        .mainValue(d => d.bollinger.average)
        .crossValue(d => d.crossValue)
        .decorate((context, d) => {
            context.strokeStyle = avgColor(d[0].key);
        });

    const bollingerAreaSeries = fc
        .seriesCanvasArea()
        .mainValue(d => d.bollinger.upper)
        .baseValue(d => d.bollinger.lower)
        .crossValue(d => d.crossValue)
        .decorate((context, d) => {
            context.fillStyle = setOpacity(0.25)(avgColor(d[0].key));
        });

    return fc.seriesCanvasMulti().series([bollingerAreaSeries, series, bollingerAverageSeries]);
}
