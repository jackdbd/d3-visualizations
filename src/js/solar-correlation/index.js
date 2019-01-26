import solar from './solar-correlation';

export const selector = '#solar-correlation';

// jedi.csv found here: https://github.com/Zapf-Consulting/solar-correlation-map/blob/master/jedi.csv
export const url =
  'https://raw.githubusercontent.com/jackdbd/d3-visualizations/master/src/data/jedi.csv';

solar(selector, url);

export default solar;
