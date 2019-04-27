import { ROOT_SELECTOR_ID } from '../utils';
import { fn } from './solar-correlation';

// jedi.csv found here: https://github.com/Zapf-Consulting/solar-correlation-map/blob/master/jedi.csv
const url = 'https://raw.githubusercontent.com/jackdbd/d3-visualizations/master/src/data/jedi.csv';

fn(ROOT_SELECTOR_ID, url);

export { fn, url };
