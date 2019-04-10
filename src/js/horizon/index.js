import { fn } from './horizon';

const selector = '#root';
const stocks = ['AAPL', 'BIDU', 'SINA', 'GOOG', 'MSFT', 'YHOO'];

fn(selector, stocks);

export { fn, selector, stocks };
