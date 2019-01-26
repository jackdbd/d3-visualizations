import solar, { selector, url } from '../js/solar-correlation';

describe('solar-correlation', () => {
  beforeEach(() => {
    const body = document.querySelector('body');
    const node = document.createElement('div');
    node.setAttribute('id', 'solar-correlation');
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
    const div = document.querySelector(selector);
    expect(div).toBeInTheDocument();
    expect(div).toBeVisible();
  });
  it('shows an error (fetch not available)', async () => {
    try {
      await solar(selector, url);
      throw new Error('should never happen');
    } catch (err) {
      expect(err.toString()).toContain('ReferenceError: fetch is not defined');
    }
  });
});
