import { ROOT_SELECTOR_ID, ROOT_SELECTOR_NAME } from '../js/utils';
import { fn, url } from '../js/scatterplot';

describe('scatterplot', () => {
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

  it.skip('shows an error in #root (fetch not available)', async () => {
    await fn(ROOT_SELECTOR_ID, url);
    expect(document.querySelector('.circles')).not.toBeInTheDocument();
    const div = document.querySelector(ROOT_SELECTOR_ID).firstChild;
    const h1Text = 'ReferenceError: fetch is not defined';
    expect(div.firstChild).toHaveTextContent(h1Text);
    const pText = `There was an error fetching the data at ${url}`;
    expect(div.lastChild).toHaveTextContent(pText);
  });
});
