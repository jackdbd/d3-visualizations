import { ROOT_SELECTOR_ID, ROOT_SELECTOR_NAME } from '../js/utils';
import { fn, url } from '../js/linechart';

describe('linechart', () => {
  beforeEach(() => {
    const body = document.querySelector('body');
    const node = document.createElement('div');
    node.setAttribute('id', ROOT_SELECTOR_NAME);
    body.appendChild(node);
  });

  afterEach(() => {
    // Remove all body's children to make sure the tests are independent
    const body = document.querySelector('body');
    while (body.firstChild) {
      body.removeChild(body.firstChild);
    }
  });

  it('starts with <div id="root" />', () => {
    expect(document.querySelector('body')).not.toBeEmpty();
    const div = document.querySelector(ROOT_SELECTOR_ID);
    expect(div).toBeInTheDocument();
    expect(div).toBeVisible();
  });

  /**
   * TODO: this test fails because d3-svg-annotation makes use of
   * .getComputedTextLength, which seems not available in jest-dom.
   */
  it.skip('has some <path /> elements', async () => {
    try {
      await fn(ROOT_SELECTOR_ID, url);
    } catch (err) {
      throw err;
    }
    // expect(true).toBeTruthy();
    const paths = document.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });
});
