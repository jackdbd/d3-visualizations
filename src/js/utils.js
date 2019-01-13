import { select, selectAll } from 'd3-selection';

const defaultMargin = {
  bottom: 30,
  left: 50,
  right: 50,
  top: 10,
};

const displayError = (selector, url, error) => {
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

const createComponent = (
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

export { createComponent, displayError };
