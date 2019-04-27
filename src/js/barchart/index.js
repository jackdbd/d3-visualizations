import { ROOT_SELECTOR_ID } from '../utils';
import { fn } from './barchart';

const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json';

fn(ROOT_SELECTOR_ID, url);

export { fn, url };
