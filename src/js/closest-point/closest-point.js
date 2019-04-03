import * as d3 from 'd3';

import styles from './closest-point.module.css';

// const d3 = Object.assign(
//   {},
//   require('d3-format'),
//   require('d3-selection'),
//   require('d3-scale'),
//   require('d3-shape'),
//   require('d3-voronoi')
// );

const points = [
  [474, 276],
  [586, 393],
  [378, 388],
  [338, 323],
  [341, 138],
  [547, 252],
  [589, 148],
  [346, 227],
  [365, 108],
  [562, 62],
];

const distance2 = (p0, p1) => {
  const [x1, y1] = p1;
  const dx = p0.x - x1;
  const dy = p0.y - y1;
  return dx * dx + dy * dy;
};

const closestPoint = (pathNode, eventPoint) => {
  const pathLength = pathNode.getTotalLength();
  let precision = 8;
  let best;
  let bestLength;
  let bestDistance = Infinity;

  // linear scan for coarse approximation
  let scanPoint;
  let scanLength;
  let scanDistance;
  for (
    scanPoint = {}, scanLength = 0, scanDistance = 0;
    scanLength <= pathLength;
    scanLength += precision
  ) {
    // https://developer.mozilla.org/en-US/docs/Web/API/SVGPathElement/getPointAtLength#Browser_compatibility
    scanPoint = pathNode.getPointAtLength(scanLength);
    scanDistance = distance2(scanPoint, eventPoint);

    if (scanDistance < bestDistance) {
      best = scanPoint;
      bestLength = scanLength;
      bestDistance = scanDistance;
    }
  }

  // binary search for precise estimate
  precision /= 2;
  while (precision > 0.5) {
    const beforeLength = bestLength - precision;
    const before = pathNode.getPointAtLength(beforeLength);
    const beforeDistance = distance2(before, eventPoint);

    const afterLength = bestLength + precision;
    const after = pathNode.getPointAtLength(afterLength);
    const afterDistance = distance2(after, eventPoint);

    if (beforeLength >= 0 && beforeDistance < bestDistance) {
      best = before;
      bestLength = beforeLength;
      bestDistance = beforeDistance;
    } else if (afterLength <= pathLength && afterDistance < bestDistance) {
      best = after;
      bestLength = afterLength;
      bestDistance = afterDistance;
    } else {
      precision /= 2;
    }
  }

  best = [best.x, best.y];
  best.distance = Math.sqrt(bestDistance);
  return best;
};

export const draw = selector => {
  const margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40,
  };

  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const svg = d3
    .selectAll(selector)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr('class', styles.frame)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.right})`);

  const lineGenerator = d3.line().curve(d3.curveCardinal);

  const path = svg
    .append('path')
    .attr('class', styles.examplePath)
    // set this path's bound data to the line generator
    .datum(points)
    .attr('d', lineGenerator);

  const line = svg.append('line').attr('class', styles.exampleLine);

  const circle = svg
    .append('circle')
    .attr('cx', -10)
    .attr('cy', -10)
    .attr('r', 3.5);

  // append a rect element to capture mouse events
  svg
    .append('rect')
    .attr('class', styles.overlay)
    .attr('width', width)
    .attr('height', height)
    .on('mousemove', handleMouseMove);

  function handleMouseMove() {
    const [evX, evY] = d3.mouse(this);

    const [x, y] = closestPoint(path.node(), [evX, evY]);

    // console.warn('mousemove', evX, evY, x, y);

    line
      .attr('x1', x)
      .attr('y1', y)
      .attr('x2', evX)
      .attr('y2', evY);

    circle.attr('cx', x).attr('cy', y);
  }
};

export const drawVoronoi = selector => {
  const margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40,
  };

  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // generate random data for 50 points
  const data = d3.range(50).map((d, i) => ({
    x: Math.random(),
    y: Math.random(),
    id: i,
    label: `Point ${i}`,
  }));

  // const xScale = d3.scalePow().exponent(3);
  const xScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([height, 0]);

  // const formatPrecision = d3.format('.2f');

  const xAccessor = d => xScale(d.x);
  const yAccessor = d => yScale(d.y);

  const voronoi = d3
    .voronoi()
    .x(xAccessor)
    .y(yAccessor);

  const voronoiDiagram = voronoi(data);

  const lineGenerator = d3.line().curve(d3.curveCardinal);

  const svg = d3
    .selectAll(selector)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr('class', styles.frame)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.right})`);

  svg
    .append('rect')
    .attr('class', styles.overlay)
    .attr('width', width)
    .attr('height', height);

  const path = svg
    .append('path')
    .datum(points)
    .attr('class', styles.examplePath)
    .attr('d', lineGenerator);

  const cells = svg
    .append('g')
    .attr('class', styles.voronoi)
    .selectAll(`.${styles.voronoiPath}`)
    .data(voronoiDiagram.polygons());

  const cellEnter = cells
    .enter()
    .append('g')
    .attr('class', styles.voronoiCell);

  cellEnter
    .append('path')
    .attr('class', styles.voronoiCellBoundary)
    .attr('d', d => {
      const vertices = d.map(x => x);
      const pathD = `M${vertices.join('L')}Z`;
      return pathD;
    });

  cellEnter
    .append('circle')
    .attr('class', styles.voronoiCellCentroid)
    .attr('r', 5)
    .attr('cx', d => xScale(d.data.x))
    .attr('cy', d => yScale(d.data.y));

  // const output = d3.select('output');

  // const updateScaleAndResample = selection => {
  //   const inputNode = selection._groups[0][0];
  //   const datum = [+inputNode.min, +inputNode.max];
  //   xScale.domain(datum).range(datum);
  //   const invertedValue = xScale.invert(8);
  //   inputNode.value = invertedValue;
  //   const precision = xScale(inputNode.value);
  //   resample(precision);
  // };

  // d3.select('input').call(updateScaleAndResample);
  // .on('input', (d, i, nodes) => {
  //   const value = +nodes[i].value;
  //   const precision = xScale(value);
  //   resample(precision);
  // });

  // function resample(precision) {
  //   // console.warn('----- RESAMPLE -----');
  //   output.text(formatPrecision(precision));
  //   // TODO: for debugging, use filter to show only a few points and make it easier to reason about it.
  //   const data = sample(path.node(), precision).filter((d, i) => i < 3);
  //   // console.warn('data', data);
  //   const voronoiDiagram = voronoi(data);

  //   cells = cells.data(voronoiDiagram.cells);

  //   cells.exit().remove();

  //   const cellEnter = cells
  //     .enter()
  //     .append('g')
  //     .attr('class', 'cell');

  // cellEnter
  //   .append('circle')
  //   .attr('class', styles.voronoiCircle)
  //   .attr('r', d => {
  //     console.warn(d);
  //     return 0;
  //   })
  //   .attr('cx', 3)
  //   .attr('cy', yAccessor);
  // .attr('cx', (d, i) => {
  //   const { halfedges, site } = d;
  //   return site.data.x;
  // })
  // .attr('cy', (d, i) => {
  //   const { halfedges, site } = d;
  //   return site.data.y;
  // });

  //   cellEnter
  //     .append('path')
  //     .attr('class', styles.cellPath)
  //     .attr('d', d => {
  //       const { halfedges, site } = d;
  //       const { x, y } = site.data;
  //       // TODO: D3 version 4/5's Voronoi seems quite different from D3 version 3's.
  //       // const pathD = `M${d.halfedges.join('L')}Z`;
  //       // console.warn(voronoiDiagram);
  //       const { edges } = voronoiDiagram;
  //       const ee = edges.filter((d, i) => halfedges.indexOf(i) !== -1);
  //       const eee = ee.map(d => ({ left: d.left.data, right: d.right.data }));
  //       const lefts = eee.map(d => [d.left.x, d.left.y]);
  //       // const rights = eee.map(d => [d.right.x, d.right.y]);
  //       // console.warn(lefts.join('L'));
  //       const pathD = `M${x},${y} L${lefts.join('L')} L100,300} Z`;
  //       return pathD;
  //     });

  //   // cells.select('circle').attr('transform', d => `translate(${d.point})`);
  // }

  // function sample(pathNode, precision) {
  //   const pathLength = pathNode.getTotalLength();
  //   const samples = [];

  //   let sampleLength;
  //   for (
  //     sampleLength = 0;
  //     sampleLength <= pathLength;
  //     sampleLength += precision
  //   ) {
  //     samples.push(pathNode.getPointAtLength(sampleLength));
  //   }
  //   return samples;
  // }
};

export const drawVoronoiScatter = selector => {
  // const margin = {
  //   top: 20,
  //   right: 20,
  //   bottom: 30,
  //   left: 40,
  // };

  // generate random data for 50 points
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
    .classed('x-axis', true)
    .attr('transform', `translate(0 ${plotAreaHeight + pointRadius})`);

  // x-axis label
  g.append('text')
    .attr(
      'transform',
      `translate(${plotAreaWidth / 2} ${plotAreaHeight + padding.bottom})`
    )
    .attr('dy', -4) // adjust distance from the bottom edge
    .attr('class', 'axis-label')
    .attr('text-anchor', 'middle')
    .text('X Axis');

  const yAxisG = g
    .append('g')
    .classed('y-axis', true)
    .attr('transform', `translate(${-pointRadius} 0)`);

  // y-axis label
  g.append('text')
    .attr(
      'transform',
      `rotate(270) translate(${-plotAreaHeight / 2} ${-padding.left})`
    )
    .attr('dy', 12) // adjust distance from the left edge
    .attr('class', 'axis-label')
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
  const circles = g.append('g').attr('class', 'circles');

  const binding = circles.selectAll('.data-point').data(data, d => d.id);

  binding
    .enter()
    .append('circle')
    .classed('data-point', true)
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
  g.append('circle')
    .attr('class', 'highlight-circle')
    .attr('r', pointRadius + 2) // slightly larger than our points
    .style('fill', 'none')
    .style('display', 'none');

  // callback to highlight a point
  function highlight(d) {
    // no point to highlight - hide the circle
    if (!d) {
      d3.select('.highlight-circle').style('display', 'none');

      // otherwise, show the highlight circle at the correct position
    } else {
      d3.select('.highlight-circle')
        .style('display', '')
        .style('stroke', colorScale(d.y))
        .attr('cx', xScale(d.x))
        .attr('cy', yScale(d.y));
    }
  }

  // callback for when the mouse moves across the overlay
  function mouseMoveHandler() {
    // get the current mouse position
    const [mx, my] = d3.mouse(this);
    // console.warn(this, mx, my);

    // use the new diagram.find() function to find the Voronoi site
    // closest to the mouse, limited by max distance voronoiRadius
    const site = voronoiDiagram.find(mx, my, voronoiRadius);

    // highlight the point if we found one
    highlight(site && site.data);
  }

  // add the overlay on top of everything to take the mouse events
  g.append('rect')
    .attr('class', 'overlay')
    .attr('width', plotAreaWidth)
    .attr('height', plotAreaHeight)
    .style('fill', '#f00')
    .style('opacity', 0)
    .on('mousemove', mouseMoveHandler)
    .on('mouseleave', () => {
      // hide the highlight circle when the mouse leaves the chart
      highlight(null);
    });
};
