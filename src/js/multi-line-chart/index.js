import { ROOT_SELECTOR_ID } from '../utils';
import { fn } from './multi-line-chart.ts';

const url = 'https://raw.githubusercontent.com/jackdbd/d3-visualizations/typescript-viz/src/data/unemployment.tsv';

fn(ROOT_SELECTOR_ID, url);

export { fn };
