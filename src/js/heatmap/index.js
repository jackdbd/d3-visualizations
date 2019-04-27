import { ROOT_SELECTOR_ID } from '../utils';
import { fn } from './heatmap';

const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';

fn(ROOT_SELECTOR_ID, url);

export { fn, url };
