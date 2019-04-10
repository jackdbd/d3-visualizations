import { fn } from './challenge';

const selectorStackedBarChart = '#dataviz-challenge-stacked-bar-chart';
const selectorBarChart = '#dataviz-challenge-bar-chart';
const url =
  'https://raw.githubusercontent.com/jackdbd/d3-visualizations/master/src/data/book_genres.tsv';

fn(selectorStackedBarChart, selectorBarChart, url);

export { fn, selectorBarChart, selectorStackedBarChart, url };
