// include a fetch polyfill, otherwise fetch would not be available in jest-dom
import 'cross-fetch/polyfill';

import {
  toBeEmpty,
  toBeInTheDocument,
  toBeVisible,
  toContainElement,
  toHaveAttribute,
  toHaveClass,
  toHaveTextContent,
} from 'jest-dom';
import 'jest-dom/extend-expect';

/* Extend jest with custom matchers for the DOM.
 * https://github.com/gnapse/jest-dom
 */
expect.extend({
  toBeEmpty,
  toBeInTheDocument,
  toBeVisible,
  toContainElement,
  toHaveAttribute,
  toHaveClass,
  toHaveTextContent,
});
