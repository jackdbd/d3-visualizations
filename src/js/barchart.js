import { extent, max } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { format } from 'd3-format';
import { scaleLinear, scaleTime } from 'd3-scale';
import { event, selectAll } from 'd3-selection';
import { timeYears } from 'd3-time';
import { timeParse } from 'd3-time-format';
// eslint-disable-next-line no-unused-vars
import { transition } from 'd3-transition';
import * as Future from 'fluture';
import { displayError } from './utils';
import '../css/barchart.css';

function draw(dataset) {
  const gdp = dataset.data.map(x => x[1]);
  const margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 100,
  };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const parseTime = timeParse('%Y-%m-%d');
  const dates = dataset.data.map(x => parseTime(x[0]));

  const xScale = scaleTime()
    .domain(extent(dates))
    .range([0, width]);

  const yScale = scaleLinear()
    .domain([0, max(gdp, d => d)])
    .range([height, 0]);

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

  const formatCurrency = format('$,.2f');

  const tooltip = selectAll('.barchart')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  const mouseover = d => {
    tooltip
      .transition()
      .duration(200)
      .style('opacity', 0.9);
    const currentDateTime = new Date(d[0]);
    const year = currentDateTime.getFullYear();
    const month = currentDateTime.getMonth();
    const dollars = d[1];
    const html = `<span>${formatCurrency(dollars)} Billion</span><br>
        <span>${year} - ${months[month]}</span>`;
    tooltip
      .html(html)
      .style('left', `${event.layerX}px`)
      .style('top', `${event.layerY - 28}px`);
  };

  // d3-tip doesn't capture mouse events, so it stays in the upper-left corner
  // It seems d3-tip is not 100% compatible with D3v4
  // const tip = d3Tip()
  // .attr('class', 'd3-tip')
  // .direction('n')
  // .html((d) => {
  //   const currentDateTime = new Date(d[0]);
  //   const year = currentDateTime.getFullYear();
  //   const month = currentDateTime.getMonth();
  //   const dollars = d[1];
  //   const html = `<span>${formatCurrency(dollars)} Billion</span><br>
  //     <span>${year} - ${months[month]}</span>`;
  //   return html;
  // });

  const xAxis = axisBottom()
    .scale(xScale)
    .tickValues(timeYears(dates[0], dates[dates.length - 1], 5));

  const yAxis = axisLeft()
    .scale(yScale)
    .ticks(10, '')
    .tickFormat(format('.0s'));

  const svg = selectAll('.barchart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.right})`);

  // svg.call(tip);

  svg
    .append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis);

  svg
    .append('g')
    .attr('class', 'axis axis--y')
    .call(yAxis)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '.71em')
    .style('text-anchor', 'end')
    .text('Gross Domestic Product, USA ($ Billion)');

  svg
    .selectAll('.bar')
    .data(dataset.data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale(new Date(d[0])))
    // .attr('x', d => xScale(d[0]))
    // .attr('width', xScale.bandwidth())
    .attr('width', width / dates.length + 1)
    .attr('y', d => yScale(d[1]))
    .attr('height', d => height - yScale(d[1]))
    // .on('mouseover', tip.show)
    // .on('mouseout', tip.hide);
    .on('mouseover', mouseover)
    .on('mouseout', () =>
      tooltip
        .transition()
        .duration(500)
        .style('opacity', 0)
    );
}

const gdpData =
  'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json';
// fetch(gdpData)
//   .catch(error => {
//     throw error;
//   })
//   .then(async res => {
//     const data = await res.json();
//     draw(data);
//   });

// create a unary function so it can be used in `.fork`
const displayErrorBounded = displayError.bind(this, '.barchart', gdpData);

// convert fetch (which returns a Promise) into a function that returns a Future
const fetchf = Future.encaseP(fetch);

fetchf(gdpData)
  .chain(res => Future.tryP(_ => res.json()))
  .fork(displayErrorBounded, draw);
