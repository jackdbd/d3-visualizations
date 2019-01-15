import barchart, { selector, url } from '../js/barchart';

describe('barchart', () => {
  beforeEach(() => {
    const body = document.querySelector('body');
    const node = document.createElement('div');
    node.setAttribute('id', 'barchart');
    body.appendChild(node);
  });
  afterEach(() => {
    // Remove all body's children to make sure the tests are independent
    const body = document.querySelector('body');
    while (body.firstChild) {
      body.removeChild(body.firstChild);
    }
  });
  it('starts with <div id="barchart" />', () => {
    expect(document.querySelector('body')).not.toBeEmpty();
    const div = document.querySelector(selector);
    expect(div).toBeInTheDocument();
    expect(div).toBeVisible();
  });
  it('shows an error in #barchart (fetch not available)', () => {
    barchart(selector, url);
    const div = document.querySelector(selector).firstChild;
    const h1Text = 'ReferenceError: fetch is not defined';
    expect(div.firstChild).toHaveTextContent(h1Text);
    const pText = `There was an error fetching the data at ${url}`;
    expect(div.lastChild).toHaveTextContent(pText);
  });
});
