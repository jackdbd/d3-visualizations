import * as d3 from 'd3';
import { displayError } from './utils';
// import * as aaa from 'd3-scale-chromatic';
// import '../css/heatmap.css';

const d3ScaleChromatic = require('d3-scale-chromatic');
// console.warn(aaa, d3ScaleChromatic);

const draw = (selector, data) => {
  const margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 100,
  };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;
  const barHeight = height / 12;
  const barWidth = width / (data.monthlyVariance.length / 12);
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const date = year => new Date(Date.parse(year));

  const xScale = d3
    .scaleTime()
    .range([0, width])
    .domain(d3.extent(data.monthlyVariance, d => date(d.year)));

  const yScale = d3
    .scaleLinear()
    .range([height, 0])
    .domain([0, 12]);

  // https://github.com/d3/d3-scale-chromatic
  // some DIVERGING schemes:
  // interpolateRdBu
  // interpolateSpectral
  // some SEQUENTIAL (Single Hue) schemes:
  // interpolateOranges
  // some SEQUENTIAL (Multi Hue) schemes:
  // interpolateYlOrRd
  const zScale = d3
    .scaleSequential(d3ScaleChromatic.interpolateRdBu)
    .domain([
      d3.max(data.monthlyVariance, d => d.variance),
      d3.min(data.monthlyVariance, d => d.variance),
    ]);

  const xAxis = d3.axisBottom().scale(xScale);

  const h3 = d3.selectAll(selector).append('h3');
  h3.text(
    `Variance of the global temperature across ${data.years} years.`,
  ).style('text-align', 'center');

  const svg = d3
    .selectAll(selector)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const tooltip = d3
    .selectAll(selector)
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  const mouseover = (d) => {
    const variance = d.variance < 0 ? `${d.variance.toFixed(3)}` : `+${d.variance.toFixed(3)}`;
    tooltip
      .transition()
      .duration(200)
      .style('opacity', 0.9);
    tooltip
      .html(`${months[months.length - d.month]} ${d.year}<br>${variance} °C`)
      .style('left', `${d3.event.layerX}px`)
      .style('top', `${d3.event.layerY - 28}px`);
  };

  svg
    .append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis);

  svg.append('g').attr('class', 'axis axis--y');

  const heatBars = svg.append('g').attr('class', 'heatBars');

  heatBars
    .selectAll('.heatBar')
    .data(data.monthlyVariance)
    .enter()
    .append('rect')
    .attr('class', 'heatBar')
    .attr('x', d => xScale(new Date(d.year, 0)))
    .attr('width', barWidth)
    .attr('y', d => yScale(d.month))
    .attr('height', barHeight)
    .style('fill', d => zScale(d.variance))
    .on('mouseover', mouseover)
    .on('mouseout', () => tooltip
      .transition()
      .duration(500)
      .style('opacity', 0));

  const monthLabels = svg.append('g').attr('class', 'monthLabels');

  const monthLabelXOffset = -5; // does not depend on font-size
  const monthLabelYOffset = 6; // depends on font-size

  monthLabels
    .selectAll('text')
    .data(months)
    .enter()
    .append('text')
    .attr('class', 'month')
    .attr('x', monthLabelXOffset)
    .attr('y', (d, i) => barHeight / 2 + barHeight * i + monthLabelYOffset)
    .attr('text-anchor', 'end')
    .text(d => `${d}`);
};

const selector = '#heatmap';
const temperaturesUrl = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';

d3.json(temperaturesUrl)
  .catch(error => displayError(selector, temperaturesUrl, error))
  .then((data) => {
    const years = 100;
    const reducedDataset = {
      years,
      baseTemperature: data.baseTemperature,
      monthlyVariance: data.monthlyVariance.slice(0, years * 12),
    };
    draw(selector, reducedDataset);
  });
