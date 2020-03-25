# Visualizing COVID-19 in the United States with [Perspective](https://perspective.finos.org)

This repository contains a [`perspective-python`](https://perspective.finos.org) server that cleans and serves data on state-level and county-level COVID-19 infections in the United States, augmented with state and county population and other relevant data. The dataset is exposed as a Websocket interface for a `perspective-workspace` dashboard front-end.

Combining `perspective-python` and `perspective-workspace` allows you to process and transform large datasets on the server, and stream data as necessary to the browser. It also allows separation of concerns between ingesting/cleaning/augmenting data with displaying and visualizing such data.

#### [See it in action](#)

#### Data Attribution

- State-level data from the [COVID Tracking Project](https://covidtracking.com/)
- County-level data from [USAFacts](https://usafacts.org/visualizations/coronavirus-covid-19-spread-map/)

### How does this work?

### What is Perspective?

Perspective is a streaming data visualization engine for Javascript and Python. Built on top of a lightning-fast C++ engine,
Perspective uses [WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly) in the browser to create a fast,
memory-efficient data visualization and transformation engine capable of handling large datasets with streaming changes.

`perspective-workspace` is a [Lumino](https://github.com/jupyterlab/lumino)-based web framework for data dashboards. Leveraging
Perspective's speed and visualization library, `perspective-workspace` makes it easy to build dashboards that draw from
various datasources and provide for quick data exploration and dissection.

`perspective-python` is designed for total interoperability with its Javascript counterpart, and can be used as a server-side
solution to transform and host data for visualization in the browser using Perspective. Additionally, `perspective-python` can
be used in JupyterLab as a widget, which allows quick exploration and visualization of data within an already-powerful
data science toolset.

This repository contains a Jupyter notebook, which uses Pandas and `perspective-python` to explore and visualize the
datasets before committing them to a server-based architecture. To run this notebook, make sure you have `perspective-python`
installed:

```bash
pip install pyarrow==0.15.1 # pyarrow is a hard dependency
pip install perspective-python
jupyter labextension install @finos/perspective-jupyterlab # install the jupyterlab plugin
```

For more information about installing Perspective, see the [Install Documentation](https://perspective.finos.org/docs/md/installation.html).