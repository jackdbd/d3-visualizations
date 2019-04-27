import { ROOT_SELECTOR_ID } from '../utils';
import { fn } from './linechart';

const url = 'https://raw.githubusercontent.com/jackdbd/d3-visualizations/master/src/data/linedata_missing_samples.tsv';

fn(ROOT_SELECTOR_ID, url);

export { fn, url };
