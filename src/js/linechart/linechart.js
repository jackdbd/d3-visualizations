import * as d3Base from 'd3';
import * as d3Annotation from 'd3-svg-annotation';
import { lineChunked } from 'd3-line-chunked';
// import * as Future from 'fluture';
import { displayError } from '../utils';
import styles from './linechart.module.css';

// create a d3 Object that includes the d3 library and additional plugins
const d3 = Object.assign(d3Base, { lineChunked });

const rowFunction = (d) => {
  const obj = {
    close: +d.close,
    date: d.date,
  };
  return obj;
};

const draw = (selector, stocks) => {
  const margin = {
    bottom: 30,
    left: 40,
    right: 20,
    top: 20,
  };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const parseTime = d3.timeParse('%d-%b-%y');
  const bisectDate = d3.bisector(d => parseTime(d.date)).left;
  const formatCurrency = d3.format('($.2f');

  const xScale = d3
    .scaleTime()
    .range([0, width])
    .domain(d3.extent(stocks, d => parseTime(d.date))); // or, in alternative
  // .domain([new Date(parseTime(stocks[0].date)),
  //   new Date(parseTime(stocks[stocks.length - 1].date))]);

  const yScale = d3
    .scaleLinear()
    .range([height, 0])
    .domain([0, d3.max(stocks, d => d.close)]);

  const annotationType = d3Annotation.annotationCalloutCircle;
  const annotations = [
    {
      id: 'my-annotation',
      note: {
        label: 'Longer text to show text wrapping',
        title: 'Annotations!',
      },
      // can use x, y directly instead of data
      data: { date: '18-Sep-09', close: 185.02 },
      dy: 137,
      dx: 162,
      subject: { radius: 50, radiusPadding: 5 },
    },
    {
      note: { label: 'Longer text to show text wrapping' },
      x: 700, // px
      y: 225, // px
      dy: 137,
      dx: 162,
      subject: { radius: 50, radiusPadding: 10 },
      type: d3Annotation.annotationCalloutElbow,
      connector: { end: 'arrow' },
    },
  ];

  const makeAnnotations = d3Annotation
    .annotation()
    .editMode(false) // true seems not to work
    .type(annotationType)
    // accessors & accessorsInverse not needed if using x,y in annotations JSON
    .accessors({
      x: d => xScale(parseTime(d.date)),
      y: d => yScale(d.close),
    })
    // .accessorsInverse({
    //   date: d => d3.timeFormat(x.invert(d.x)),
    //   close: d => y.invert(d.y),
    // })
    .annotations(annotations);

  // d3 lineChunked plugin configuration
  // Note 1: we have to be careful when we load data from csv, json, etc
  // because the datum d MUST be available (otherwise it would not be loaded
  // and parsed) BUT the value we are looking for must not be defined. This
  // is tricky, and probably we'll need to parse the data first, replace
  // missing/invalid data with some specific value (e.g. 'NA') and the use
  // that value here to define which datum is defined and which one is not.
  // Note 2: if you want to use transitions, you need to install another
  // plugin: d3-interpolate-path
  // if d3-line-chunked was imported with import * d3LineChunked from 'd3-line-chunked'
  // const lineChunked = d3LineChunked.lineChunked()
  // if d3-line-chunked was imported with import { lineChunked } from 'd3-line-chunked'
  const lineC = d3
    .lineChunked()
    .x(d => xScale(parseTime(d.date)))
    .y(d => yScale(d.close))
    // .curve(d3.curveLinear)
    .defined(d => d.close !== 0)
    .lineStyles({
      stroke: '#0bb',
    });

  // traditional line with .defined()
  // const line = d3.line()
  // .x(d => xScale(parseTime(d.date)))
  // .y(d => yScale(d.close))
  // .defined(d => d.close !== 0);

  const xAxis = d3.axisBottom().scale(xScale);

  const yAxis = d3.axisLeft().scale(yScale);

  const svg = d3
    .selectAll(selector)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  svg
    .append('g')
    .attr('class', 'annotation-group')
    .call(makeAnnotations);

  const linepath = svg.append('g');

  const tooltip = d3
    .selectAll(selector)
    .append('div')
    .attr('class', styles.tooltip);

  const focus = svg.append('g').style('display', 'none');

  svg
    .append('g')
    .attr('class', styles.axisX)
    .attr('transform', `translate(0,${height})`)
    .call(xAxis);

  svg
    .append('g')
    .attr('class', styles.axisY)
    .call(yAxis)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '.71em')
    .style('text-anchor', 'end')
    .text('Price ($)');

  // traditional line with the d3 API
  // linepath.append('path')
  //   .attr('class', 'line')
  //   .attr('d', line(stocks));

  // line with the d3 lineChunked plugin
  linepath.datum(stocks).call(lineC);

  focus
    .append('circle')
    .style('fill', 'none')
    .style('stroke', 'blue')
    .attr('r', 4);

  const mousemove = () => {
    const coordX = d3.event.layerX;
    const date0 = xScale.invert(coordX);
    const i = bisectDate(stocks, date0, 1);
    const d0 = stocks[i - 1];
    let d1 = stocks[i];
    if (!d1) {
      d1 = stocks[i - 1];
    }
    let d = null;
    if (date0 - parseTime(d0.date) > parseTime(d1.date) - date0) {
      d = d1;
    } else {
      d = d0;
    }
    focus
      .select('circle.y')
      .attr('transform', `translate(${coordX}, ${yScale(d.close)})`);
    tooltip
      .transition()
      .duration(200)
      .style('opacity', 0.9);
    tooltip
      .html(`${d.date}<br/>Close: <span>${formatCurrency(d.close)}</span>`)
      .style('left', `${d3.event.layerX}px`)
      .style('top', `${d3.event.layerY - 28}px`)
      .style('position', 'absolute');
  };

  // append a rect element to capture mouse events
  svg
    .append('rect')
    .attr('class', styles.overlay)
    .attr('width', width)
    .attr('height', height)
    .style('fill', 'none')
    .style('pointer-events', 'all')
    .on('mouseover', () => focus.style('display', null))
    .on('mouseout', () => focus.style('display', 'none'))
    .on('mousemove', mousemove);
};

export const fn = async (selector, url) => {
  // create a unary function so it can be used in `.fork`
  const displayErrorBounded = displayError.bind(this, selector, url);
  const drawBounded = draw.bind(this, selector);

  // fetchf(url)
  //   .chain(res => {
  //     const promise = d3.tsv(res.url);
  //     return Future.tryP(_ => promise);
  //   })
  //   .map(rawData => rawData.map(rowFunction))
  //   .fork(displayErrorBounded, drawBounded);

  let rawData;
  try {
    rawData = await d3.tsv(url);
  } catch (error) {
    displayErrorBounded(error);
    return;
  }
  let data;
  try {
    data = await rawData.map(rowFunction);
  } catch (error) {
    displayErrorBounded(error);
  }
  drawBounded(data);
};
