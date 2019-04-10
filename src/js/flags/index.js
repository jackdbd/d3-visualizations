import { fn } from './flags';

const selector = '#root';
const blankImageUrl =
  'http://res.cloudinary.com/dbntyqfmz/image/upload/v1497704295/Transparent_k52dbx.gif';
const countriesUrl =
  'https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json';

fn(selector, [blankImageUrl, countriesUrl]);

export { fn, selector };
