/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import * as d3 from "d3";
import {groupFromKey} from "./seriesKey";

export function seriesColors(settings) {
    const col = settings.data && settings.data.length > 0 ? settings.data[0] : {};
    const domain = Object.keys(col).filter(k => k !== "__ROW_PATH__");
    return colorScale()
        .settings(settings)
        .domain(domain)();
}

export function seriesColorsFromGroups(settings) {
    const col = settings.data && settings.data.length > 0 ? settings.data[0] : {};
    const domain = [];
    Object.keys(col).forEach(key => {
        if (key !== "__ROW_PATH__") {
            const group = groupFromKey(key);
            if (!domain.includes(group)) {
                domain.push(group);
            }
        }
    });
    return colorScale()
        .settings(settings)
        .domain(domain)();
}

export function colorScale() {
    let domain = null;
    let defaultColors = null;
    let settings = {};
    let mapFunction = d => withOpacity(d, settings.colorStyles && settings.colorStyles.opacity);

    const colors = () => {
        const styles = settings.colorStyles;
        const defaults = defaultColors || [styles.series];
        if (defaults || domain.length > 1) {
            const range = domain.length > 1 ? styles.scheme : defaults;
            return d3.scaleOrdinal(range.map(mapFunction)).domain(domain);
        }
        return null;
    };

    colors.domain = (...args) => {
        if (!args.length) {
            return domain;
        }
        domain = args[0];
        return colors;
    };

    colors.defaultColors = (...args) => {
        if (!args.length) {
            return defaultColors;
        }
        defaultColors = args[0];
        return colors;
    };

    colors.mapFunction = (...args) => {
        if (!args.length) {
            return mapFunction;
        }
        mapFunction = args[0];
        return colors;
    };

    colors.settings = (...args) => {
        if (!args.length) {
            return settings;
        }
        settings = args[0];
        return colors;
    };

    return colors;
}

export function withoutOpacity(color) {
    return setOpacity(1)(color);
}

export function withOpacity(color, opacity = 0.5) {
    return setOpacity(opacity)(color);
}

export function setOpacity(opacity) {
    return color => {
        const decoded = d3.color(color);
        decoded.opacity = opacity;
        return decoded + "";
    };
}
