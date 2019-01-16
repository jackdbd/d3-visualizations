import geomap from './geomap';

export const selector = '#geo-map';

const worldMapUrl = 'https://d3js.org/world-50m.v1.json';
const meteoritesUrl =
  'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json';

export const urls = [worldMapUrl, meteoritesUrl];

geomap(selector, urls);

export default geomap;
