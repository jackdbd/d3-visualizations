import { ROOT_SELECTOR_ID, ROOT_SELECTOR_NAME } from '../js/utils';
import { fn, url } from '../js/solar-correlation';

describe('solar-correlation', () => {
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

  it('starts with the expected <div /> element', () => {
    expect(document.querySelector('body')).not.toBeEmpty();
    const div = document.querySelector(ROOT_SELECTOR_ID);
    expect(div).toBeInTheDocument();
    expect(div).toBeVisible();
  });

  it.skip('shows an error (fetch not available)', async () => {
    try {
      await fn(ROOT_SELECTOR_ID, url);
      throw new Error('should never happen');
    } catch (err) {
      expect(err.toString()).toContain('ReferenceError: fetch is not defined');
    }
  });
});
