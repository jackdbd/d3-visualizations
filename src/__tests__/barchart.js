import barchart, { selector, url } from '../js/barchart';
import styles from '../js/barchart/barchart.module.css';

describe('barchart', () => {
  beforeEach(async () => {
    const body = document.querySelector('body');
    const node = document.createElement('div');
    node.setAttribute('id', 'barchart');
    body.appendChild(node);

    // Create the barchart here to avoid repeating the code in each test (we
    // don't save time).
    try {
      await barchart(selector, url);
    } catch (err) {
      throw err;
    }
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
    expect(div.getAttribute('id')).toBe('barchart');
  });
  it('appends a <svg /> in the document', async () => {
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toBeVisible();
    expect(svg.children.length).toBeGreaterThan(0);
  });
  it('has the expectd Y Axis', () => {
    const text = document.querySelector(`.${styles.axisY}`);
    const axisYLabel = 'Gross Domestic Product, USA ($ Billion)';
    expect(text).toHaveTextContent(axisYLabel);
  });
  it('has some <rect /> elements', () => {
    const rects = document.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThan(0);
    expect(rects[0]).toHaveClass(styles.bar);
  });
  it('has an empty, invisible tooltip', () => {
    const tooltip = document.querySelector(`.${styles.tooltip}`);
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toBeEmpty();
    expect(tooltip).not.toBeVisible();
  });
});
