// import * as d3 from 'd3';
// We could require just the d3 modules we need with this trick.
const d3 = Object.assign(
  {},
  require('d3-array'),
  require('d3-selection'),
  require('d3-shape'),
  require('d3-timer')
);
import chroma from 'chroma-js';
import styles from './shapes.module.css';

const PHASE_DISPLACEMENT_DEGREES = 90;
const ANGLES = d3.range(0, 2 * Math.PI, Math.PI / 200);

// const COLORS = ['cyan', 'magenta', 'yellow'];

// const colorScale = chroma.scale(['yellow', 'red']);
// const toHex = (d, i) => colorScale(d).hex();
// const COLORS = d3.range(0, 1, 0.2).map(toHex);

const COLORS = chroma
  .scale(['#fafa6e', '#2A4858'])
  .mode('lch')
  .colors(6);

const degreesToRadians = degrees => (degrees * Math.PI) / 180;

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
    .attr('class', styles.frame);

  const shapeGenerator = (dColor, iColor) => {
    console.log(`Make shape generator for color: ${dColor}`);

    const angleAccessor = (d, _) => {
      const angle = d + iColor * degreesToRadians(PHASE_DISPLACEMENT_DEGREES);
      return angle;
    };

    const radiusAccessor = (d, _) => {
      const t = d3.now() / 1000;
      const radius =
        200 +
        Math.cos(d * 8 - (iColor * 2 * Math.PI) / 3 + t) *
          Math.pow((1 + Math.cos(d - t)) / 2, 3) *
          32;
      return radius;
    };

    const lineGenerator = d3
      .lineRadial()
      .curve(d3.curveLinearClosed)
      .angle(angleAccessor)
      .radius(radiusAccessor);

    return lineGenerator;
  };

  const pathsGroup = svg
    .append('g')
    .attr('class', styles.shapeGroup)
    .attr('transform', `translate(${width / 2},${height / 2})`);

  const paths = pathsGroup
    .selectAll('path')
    .data(COLORS)
    .enter()
    .append('path')
    .attr('class', styles.shapePath)
    .attr('stroke', d => d)
    // set each element's bound data to the line generator (so it's no longer the color)
    .datum(shapeGenerator);

  const updatePath = (dGenerator, i, nodes) => {
    const selection = d3.select(nodes[i]);
    selection.attr('d', dGenerator(ANGLES));
  };

  const gameLoop = elapsed => {
    paths.each(updatePath);
  };

  const delay = 500;
  d3.timer(gameLoop, delay);
};
