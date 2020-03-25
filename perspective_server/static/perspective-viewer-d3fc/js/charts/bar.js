/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import * as fc from "d3fc";
import {axisFactory} from "../axis/axisFactory";
import {chartSvgFactory} from "../axis/chartFactory";
import {AXIS_TYPES} from "../axis/axisType";
import {barSeries} from "../series/barSeries";
import {seriesColors} from "../series/seriesColors";
import {groupAndStackData} from "../data/groupData";
import {colorLegend} from "../legend/legend";
import {filterData} from "../legend/filter";
import withGridLines from "../gridlines/gridlines";

import {hardLimitZeroPadding} from "../d3fc/padding/hardLimitZero";
import zoomableChart from "../zoom/zoomableChart";

function barChart(container, settings) {
    const data = groupAndStackData(settings, filterData(settings));
    const color = seriesColors(settings);

    const legend = colorLegend()
        .settings(settings)
        .scale(color);

    const bars = barSeries(settings, color).orient("horizontal");
    const series = fc
        .seriesSvgMulti()
        .mapping((data, index) => data[index])
        .series(data.map(() => bars));

    const xAxis = axisFactory(settings)
        .settingName("mainValues")
        .valueName("mainValue")
        .excludeType(AXIS_TYPES.ordinal)
        .include([0])
        .paddingStrategy(hardLimitZeroPadding())(data);
    const yAxis = axisFactory(settings)
        .excludeType(AXIS_TYPES.linear)
        .settingName("crossValues")
        .valueName("crossValue")
        .orient("vertical")(data);

    const chart = chartSvgFactory(xAxis, yAxis).plotArea(withGridLines(series, settings).orient("horizontal"));

    if (chart.yPaddingInner) {
        chart.yPaddingInner(0.5);
        chart.yPaddingOuter(0.25);
        bars.align("left");
    }
    chart.xNice && chart.xNice();

    const zoomChart = zoomableChart()
        .chart(chart)
        .settings(settings)
        .yScale(yAxis.scale);

    // render
    container.datum(data).call(zoomChart);
    container.call(legend);
}
barChart.plugin = {
    type: "d3_x_bar",
    name: "X Bar Chart",
    max_cells: 1000,
    max_columns: 50
};

export default barChart;
