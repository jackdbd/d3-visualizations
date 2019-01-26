import flags, { selector, url } from '../js/flags';

describe('flags', () => {
  beforeEach(() => {
    const body = document.querySelector('body');
    const node = document.createElement('div');
    node.setAttribute('id', 'flags');
    body.appendChild(node);
  });
  afterEach(() => {
    // Remove all body's children to make sure the tests are independent
    const body = document.querySelector('body');
    while (body.firstChild) {
      body.removeChild(body.firstChild);
    }
  });
  it('starts with <div id="flags" />', () => {
    expect(document.querySelector('body')).not.toBeEmpty();
    const div = document.querySelector(selector);
    expect(div).toBeInTheDocument();
    expect(div).toBeVisible();
  });
  it.skip('shows an error in #flags (fetch not available)', async () => {
    const div = document.querySelector(selector).firstChild;
    try {
      await flags(selector, url);
    } catch (err) {
      throw err;
    }
    const h1Text = 'ReferenceError: fetch is not defined';
    expect(div.firstChild).toHaveTextContent(h1Text);
    // const pText = `There was an error fetching the data at ${url}`;
    // expect(div.lastChild).toHaveTextContent(pText);
  });
});
