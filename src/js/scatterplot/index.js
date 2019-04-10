import { fn } from './scatterplot';

const selector = '#root';
const url =
  'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

fn(selector, url);

export { fn, selector, url };
