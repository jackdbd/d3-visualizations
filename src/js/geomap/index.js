import { fn } from './geomap';

const selector = '#root';

const worldMapUrl = 'https://d3js.org/world-50m.v1.json';
const meteoritesUrl =
  'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json';

const urls = [worldMapUrl, meteoritesUrl];

fn(selector, urls);

export { fn, selector, urls };
