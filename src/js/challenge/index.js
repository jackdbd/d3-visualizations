import challenge from './challenge';

export const selectorStackedBarChart = '#dataviz-challenge-stacked-bar-chart';
export const selectorBarChart = '#dataviz-challenge-bar-chart';
export const url =
  'https://raw.githubusercontent.com/jackdbd/d3-visualizations/master/src/data/book_genres.tsv';

challenge(selectorStackedBarChart, selectorBarChart, url);

export default challenge;
