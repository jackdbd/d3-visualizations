import scatterplot from './scatterplot';

export const selector = '#scatterplot';
export const url =
  'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

scatterplot(selector, url);

export default scatterplot;
