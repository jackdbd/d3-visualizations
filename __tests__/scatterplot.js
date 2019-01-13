import scatterplot from '../src/js/scatterplot';

const dataUrl =
  'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
const name = 'scatterplot';
const selectorId = `#${name}`;

describe('scatterplot', () => {
  beforeEach(() => {
    const body = document.querySelector('body');
    const node = document.createElement('div');
    node.setAttribute('id', name);
    body.appendChild(node);
  });
  afterEach(() => {
    // Remove all body's children to make sure the tests are independent
    const body = document.querySelector('body');
    while (body.firstChild) {
      body.removeChild(body.firstChild);
    }
  });
  it('starts with <div="scatterplot">', () => {
    expect(document.querySelector('body')).not.toBeEmpty();
    const div = document.querySelector(selectorId);
    expect(div).toBeInTheDocument();
    expect(div).toBeVisible();
  });
  it('shows an error in #scatterplot (fetch not available)', async () => {
    await scatterplot(selectorId, dataUrl);
    expect(document.querySelector('.circles')).not.toBeInTheDocument();
    const div = document.querySelector(selectorId).firstChild;
    const h1Text = 'ReferenceError: fetch is not defined';
    expect(div.firstChild).toHaveTextContent(h1Text);
    const pText = `There was an error fetching the data at ${dataUrl}`;
    expect(div.lastChild).toHaveTextContent(pText);
  });
});
