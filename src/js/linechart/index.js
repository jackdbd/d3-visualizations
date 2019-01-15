import linechart from './linechart';

export const selector = '#linechart';
export const url =
  'https://raw.githubusercontent.com/jackdbd/d3-visualizations/master/src/data/linedata_missing_samples.tsv';

linechart(selector, url);

export default linechart;
