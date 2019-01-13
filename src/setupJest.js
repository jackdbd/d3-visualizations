import {
  toBeEmpty,
  toBeInTheDocument,
  toBeVisible,
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
  toHaveClass,
  toHaveTextContent,
});
