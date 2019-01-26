import { createComponent, displayError } from '../js/utils';

describe('createComponent', () => {
  beforeEach(() => {
    const body = document.querySelector('body');
    const node = document.createElement('div');
    node.setAttribute('id', 'container');
    body.appendChild(node);
  });
  afterEach(() => {
    // Remove all body's children to make sure the tests are independent
    const body = document.querySelector('body');
    while (body.firstChild) {
      body.removeChild(body.firstChild);
    }
  });
  it('creates a dataviz with the expected properties', () => {
    const viz = createComponent('#container');
    expect(viz).toHaveProperty('chart');
    expect(viz).toHaveProperty('coords');
    expect(viz).toHaveProperty('header');
    expect(viz).toHaveProperty('footer');
    expect(viz).toHaveProperty('tooltip');
  });
  it('has the expected coordinates', () => {
    const viz = createComponent('#container');
    expect(viz.coords).toHaveProperty('height');
    expect(viz.coords).toHaveProperty('width');
  });
  it('appends a <div /> with the expected child nodes', () => {
    createComponent('#container');
    const nodes = document.querySelector('#container > div').childNodes;
    expect(nodes.length).toBe(4);
    const [header, svg, footer, tooltip] = nodes;
    expect(header).toHaveClass('header');
    // the <svg> element has a <g> element for the d3 margin convention
    expect(svg.firstChild).toHaveAttribute('transform');
    expect(footer).toHaveClass('footer');
    expect(tooltip).toHaveClass('tooltip');
  });
});

describe('displayError', () => {
  beforeEach(() => {
    const body = document.querySelector('body');
    const node = document.createElement('div');
    node.setAttribute('id', 'container');
    body.appendChild(node);
  });
  afterEach(() => {
    // Remove all body's children to make sure the tests are independent
    const body = document.querySelector('body');
    while (body.firstChild) {
      body.removeChild(body.firstChild);
    }
  });
  it('appends a <div /> that shows an error message', () => {
    const url = 'some-broken-url';
    const error = new Error('Error Summary (h1)');
    displayError('#container', url, error);
    const summary = error.toString();
    const description = `There was an error fetching the data at ${url}`;
    const nodes = document.querySelector('#container > div').childNodes;
    expect(nodes.length).toBe(2);
    const [h1, p] = nodes;
    expect(h1).toHaveTextContent(summary);
    expect(p).toHaveTextContent(description);
  });
});
