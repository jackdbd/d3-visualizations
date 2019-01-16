import heatmap from './heatmap';

export const selector = '#heatmap';
export const url =
  'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';

heatmap(selector, url);

export default heatmap;
