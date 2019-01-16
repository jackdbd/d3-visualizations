import dolphins from './dolphins';

export const selector = '#dolphins';
export const url =
  'https://raw.githubusercontent.com/jackdbd/d3-visualizations/master/src/data/dolphins.json';

dolphins(selector, url);

export default dolphins;
