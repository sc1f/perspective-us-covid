/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import { seriesCanvasOhlc } from "d3fc";
import ohlcCandle from "./ohlcCandle";
const ohlc = ohlcCandle(seriesCanvasOhlc);
ohlc.plugin = {
  type: "d3_ohlc",
  name: "OHLC Chart",
  max_cells: 3500,
  max_columns: 50,
  initial: {
    type: "number",
    count: 4,
    names: ["Open", "Close", "High", "Low"]
  },
  selectMode: "toggle"
};
export default ohlc;
//# sourceMappingURL=ohlc.js.map