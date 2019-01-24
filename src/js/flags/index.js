import flags from './flags';

export const selector = '#flags';
const blankImageUrl =
  'http://res.cloudinary.com/dbntyqfmz/image/upload/v1497704295/Transparent_k52dbx.gif';
const countriesUrl =
  'https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json';

flags(selector, [blankImageUrl, countriesUrl]);

export default flags;
