import { range } from 'd3-array';
// import { axisBottom, axisLeft } from 'd3-axis';
// import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
// import { curveCardinal, line } from 'd3-shape';
// import { voronoi } from 'd3-voronoi';

import './multi-line-chart.module.css';
console.log('styles')

// create a d3 object with just the subset of functions that we need (i.e. we do
// a manual "tree shaking").
// const d3 = Object.assign(
//   {},
//   {
//     axisBottom,
//     axisLeft,
//     curveCardinal,
//     line,
//     mouse,
//     range,
//     scaleLinear,
//     select,
//     selectAll,
//     voronoi,
//   }
// );

export const fn = (selector: any) => {
  const data = range(50).map((d: any, i: number) => ({
    id: i,
    label: `Point ${i}`,
    x: Math.random(),
    y: Math.random(),
  }));

  // outer svg dimensions
  const width = 600;
  const height = 400;

  // padding around the chart where axes will go
  const padding = {
    bottom: 40,
    left: 50,
    right: 20,
    top: 20,
  };

  // inner chart dimensions, where the dots are plotted
  const plotAreaWidth = width - padding.left - padding.right;
  const plotAreaHeight = height - padding.top - padding.bottom;

  // select the root container where the chart will be added
  const container = select(selector);

  // initialize main SVG
  const svg = container
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  // the main g where all the chart content goes inside
  const g = svg
    .append('g')
    .attr('transform', `translate(${padding.left} ${padding.top})`);
  // add the overlay on top of everything to take the mouse events
  g.append('rect')
    .attr('width', plotAreaWidth)
    .attr('height', plotAreaHeight);
};
