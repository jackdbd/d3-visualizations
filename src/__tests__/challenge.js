import challenge, {
  selectorStackedBarChart,
  selectorBarChart,
  url,
} from '../js/challenge';

describe('challenge', () => {
  beforeEach(() => {
    const body = document.querySelector('body');
    const node0 = document.createElement('div');
    node0.setAttribute('id', 'dataviz-challenge-stacked-bar-chart');
    const node1 = document.createElement('div');
    node1.setAttribute('id', 'dataviz-challenge-bar-chart');
    body.appendChild(node0);
    body.appendChild(node1);
  });
  afterEach(() => {
    // Remove all body's children to make sure the tests are independent
    const body = document.querySelector('body');
    while (body.firstChild) {
      body.removeChild(body.firstChild);
    }
  });
  it('starts with the expected <div /> elements', () => {
    expect(document.querySelector('body')).not.toBeEmpty();
    const div0 = document.querySelector(selectorStackedBarChart);
    expect(div0).toBeInTheDocument();
    expect(div0).toBeVisible();
    const div1 = document.querySelector(selectorBarChart);
    expect(div1).toBeInTheDocument();
    expect(div1).toBeVisible();
  });
  it('shows an error (fetch not available)', async () => {
    try {
      await challenge(selectorStackedBarChart, selectorBarChart, url);
      throw new Error('should never happen');
    } catch (err) {
      expect(err.toString()).toContain('ReferenceError: fetch is not defined');
    }
  });
});
