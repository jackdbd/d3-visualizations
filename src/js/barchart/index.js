import barchart from './barchart';

export const selector = '#barchart';
export const url =
  'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json';

barchart(selector, url);

export default barchart;
