import { select, selectAll } from 'd3-selection';

const defaultMargin = {
  bottom: 30,
  left: 50,
  right: 50,
  top: 10,
};

// ID of the html element where to render the visualization (without #).
export const ROOT_SELECTOR_NAME = 'root';
// ID of the html element where to render the visualization (with #)
export const ROOT_SELECTOR_ID = `#${ROOT_SELECTOR_NAME}`;

export const displayError = (selector, url, error) => {
  const div = selectAll(selector).append('div');
  div.append('h1').text(error.toString());
  const text = `There was an error fetching the data at ${url}`;
  div.append('p').text(text);
};

const computeLayout = (
  outerWidth = 444,
  outerHeight = 555,
  margin = defaultMargin,
) => {
  const width = outerWidth - margin.left - margin.right;
  const height = outerHeight - margin.top - margin.bottom;
  return {
    width,
    height,
    margin,
  };
};

export const createComponent = (
  nodeId,
  outerWidth = 1200,
  outerHeight = 600,
  margin = defaultMargin,
) => {
  const selection = select(nodeId);
  const { width, height } = computeLayout(outerWidth, outerHeight, margin);

  const container = selection
    .append('div')
    .attr('class', 'container')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  const header = container.append('header').attr('class', 'header');

  header
    .append('h1')
    .style('text-align', 'center')
    .text('This is the header');

  const chart = container
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.right})`);

  const footer = container.append('footer').attr('class', 'footer');

  footer.append('p').text('This is the footer');

  const coords = {
    width,
    height,
  };

  const tooltip = container
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  const viz = {
    chart,
    coords,
    header,
    footer,
    tooltip,
  };
  return viz;
};

/**
 * Promise that resolves when all resources of the page have been loaded.
 *
 * @see https://stackoverflow.com/questions/2414750/difference-between-domcontentloaded-and-load-events
 */
export const pageHasLoaded = () => {
  const promise = new Promise((resolve, reject) => {
    const onLoad = () => {
      resolve();
    };
    const onError = (event) => {
      console.error(event);
      reject(new Error('Something went wrong'));
    };
    window.onload = onLoad;
    window.onerror = onError;
  });
  return promise;
};
