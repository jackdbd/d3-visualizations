import { range } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { scaleLinear } from 'd3-scale';
import { mouse, select, selectAll } from 'd3-selection';
import { curveCardinal, line } from 'd3-shape';
import { voronoi } from 'd3-voronoi';

import styles from './voronoi-scatterplot.module.css';

// create a d3 object with just the subset of functions that we need (i.e. we do
// a manual "tree shaking").
const d3 = Object.assign(
  {},
  {
    axisBottom,
    axisLeft,
    curveCardinal,
    line,
    mouse,
    range,
    scaleLinear,
    select,
    selectAll,
    voronoi,
  },
);

export const fn = (selector) => {
  const data = d3.range(50).map((d, i) => ({
    x: Math.random(),
    y: Math.random(),
    id: i,
    label: `Point ${i}`,
  }));

  // outer svg dimensions
  const width = 600;
  const height = 400;

  // padding around the chart where axes will go
  const padding = {
    top: 20,
    right: 20,
    bottom: 40,
    left: 50,
  };

  // inner chart dimensions, where the dots are plotted
  const plotAreaWidth = width - padding.left - padding.right;
  const plotAreaHeight = height - padding.top - padding.bottom;

  // radius of points in the scatterplot
  const pointRadius = 3;

  // initialize scales
  const xScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, plotAreaWidth]);

  const yScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([plotAreaHeight, 0]);

  const colorScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range(['#06a', '#0bb']);

  // select the root container where the chart will be added
  const container = d3.select(selector);

  // initialize main SVG
  const svg = container
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  // the main g where all the chart content goes inside
  const g = svg
    .append('g')
    .attr('transform', `translate(${padding.left} ${padding.top})`);

  // add in axis groups
  const xAxisG = g
    .append('g')
    .attr('class', styles['axis-x'])
    .attr('transform', `translate(0 ${plotAreaHeight + pointRadius})`);

  // x-axis label
  g.append('text')
    .attr(
      'transform',
      `translate(${plotAreaWidth / 2} ${plotAreaHeight + padding.bottom})`,
    )
    .attr('dy', -4) // adjust distance from the bottom edge
    .attr('class', styles['axis-label'])
    .attr('text-anchor', 'middle')
    .text('X Axis');

  const yAxisG = g
    .append('g')
    .attr('class', styles['axis-y'])
    .attr('transform', `translate(${-pointRadius} 0)`);

  // y-axis label
  g.append('text')
    .attr(
      'transform',
      `rotate(270) translate(${-plotAreaHeight / 2} ${-padding.left})`,
    )
    .attr('dy', 12) // adjust distance from the left edge
    .attr('class', styles['axis-label'])
    .attr('text-anchor', 'middle')
    .text('Y Axis');

  // set up axis generating functions
  const xTicks = Math.round(plotAreaWidth / 50);
  const yTicks = Math.round(plotAreaHeight / 50);

  const xAxis = d3
    .axisBottom(xScale)
    .ticks(xTicks)
    .tickSizeOuter(0);

  const yAxis = d3
    .axisLeft(yScale)
    .ticks(yTicks)
    .tickSizeOuter(0);

  // draw the axes
  yAxisG.call(yAxis);
  xAxisG.call(xAxis);

  // add in circles
  const circles = g.append('g').attr('class', styles.circles);

  const binding = circles
    .selectAll(styles['.data-point'])
    .data(data, d => d.id);

  binding
    .enter()
    .append('circle')
    .classed(styles['data-point'], true)
    .attr('r', pointRadius)
    .attr('cx', d => xScale(d.x))
    .attr('cy', d => yScale(d.y))
    .attr('fill', d => colorScale(d.y));

  // create a Voronoi diagram based on the data and the scales
  const voronoiDiagram = d3
    .voronoi()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y))
    .size([plotAreaWidth, plotAreaHeight])(data);

  // limit how far away the mouse can be from finding a Voronoi site
  const voronoiRadius = plotAreaWidth / 10;

  // add a circle for indicating the highlighted point

  const highlightedPoint = g
    .append('circle')
    .attr('class', styles['highlight-circle'])
    .attr('r', pointRadius + 5); // slightly larger than our points

  highlightedPoint
    .classed(styles['highlight-circle-visible'], false)
    .classed(styles['highlight-circle-hidden'], true);

  function highlight(d) {
    // console.warn('highlight', d, highlightedPoint);
    // no point to highlight - hide the circle
    if (!d) {
      highlightedPoint
        .classed(styles['highlight-circle-visible'], false)
        .classed(styles['highlight-circle-hidden'], true);

      // otherwise, show the highlight circle at the correct position
    } else {
      highlightedPoint
        .attr('cx', xScale(d.x))
        .attr('cy', yScale(d.y))
        .classed(styles['highlight-circle-visible'], true)
        .classed(styles['highlight-circle-hidden'], false);
    }
  }

  // callback for when the mouse moves across the overlay
  function mouseMoveHandler() {
    // get the current mouse position
    const [mx, my] = d3.mouse(this);
    // console.warn(
    //   `mouse at: x:${mx}, y:${mx} (max [${plotAreaWidth}, ${plotAreaHeight}])`
    // );

    // use the new diagram.find() function to find the Voronoi site
    // closest to the mouse, limited by max distance voronoiRadius
    const site = voronoiDiagram.find(mx, my, voronoiRadius);

    // highlight the point if we found one
    highlight(site && site.data);
  }

  // add the overlay on top of everything to take the mouse events
  g.append('rect')
    .attr('class', styles.overlay)
    .attr('width', plotAreaWidth)
    .attr('height', plotAreaHeight)
    .on('mousemove', mouseMoveHandler)
    .on('mouseleave', () => {
      // hide the highlight circle when the mouse leaves the chart
      highlight(null);
    });
};
