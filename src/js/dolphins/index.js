import { ROOT_SELECTOR_ID } from '../utils';
import { fn } from './dolphins';

const url =
  'https://raw.githubusercontent.com/jackdbd/d3-visualizations/master/src/data/dolphins.json';

fn(ROOT_SELECTOR_ID, url);

export { fn, url };
