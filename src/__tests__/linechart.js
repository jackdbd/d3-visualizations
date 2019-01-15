import linechart, { selector, url } from '../js/linechart';

describe('linechart', () => {
  beforeEach(() => {
    const body = document.querySelector('body');
    const node = document.createElement('div');
    node.setAttribute('id', 'linechart');
    body.appendChild(node);
  });
  afterEach(() => {
    // Remove all body's children to make sure the tests are independent
    const body = document.querySelector('body');
    while (body.firstChild) {
      body.removeChild(body.firstChild);
    }
  });
  it('starts with <div id="linechart" />', () => {
    expect(document.querySelector('body')).not.toBeEmpty();
    const div = document.querySelector(selector);
    expect(div).toBeInTheDocument();
    expect(div).toBeVisible();
  });
  it('shows an error in #linechart (fetch not available)', () => {
    linechart(selector, url);
    const div = document.querySelector(selector).firstChild;
    const h1Text = 'ReferenceError: fetch is not defined';
    expect(div.firstChild).toHaveTextContent(h1Text);
    const pText = `There was an error fetching the data at ${url}`;
    expect(div.lastChild).toHaveTextContent(pText);
  });
});
