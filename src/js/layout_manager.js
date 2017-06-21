// import * as d3 from 'd3';
const d3 = require('d3');

const computeLayout = (outerWidth, outerHeight) => {
  const margin = { top: 10, right: 20, bottom: 30, left: 250 };
  const width = outerWidth - margin.left - margin.right;
  const height = outerHeight - margin.top - margin.bottom;
  return {
    width,
    height,
    margin,
  };
};

const createComponent = (nodeId, outerWidth = 1200, outerHeight = 600) => {
  const selection = d3.select(nodeId);
  const { width, height, margin } = computeLayout(outerWidth, outerHeight);

  const container = selection
    .append('div')
    .attr('class', 'container')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  const header = container.append('header')
    .attr('class', 'header');

  header.append('h1')
    .style('text-align', 'center')
    .text('This is the header');

  const chart = container
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.right})`);

  const footer = container.append('footer')
    .attr('class', 'footer');

  footer.append('p')
    .text('This is the footer');

  const coords = {
    width,
    height,
  };

  const tooltip = container.append('div')
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

module.exports = {
  createComponent,
};
