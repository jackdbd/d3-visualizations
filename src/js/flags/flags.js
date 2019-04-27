import * as d3 from 'd3';
import { displayError } from '../utils';
import '../../css/vendor/flags.min.css';
import styles from './flags.module.css';

const draw = (selector, img, graph) => {
  const margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40,
  };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const simulation = d3
    .forceSimulation()
    .force('link', d3.forceLink()) // this dataset does not include id in nodes, so don't include it
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width / 2, height / 2));

  const tooltip = d3
    .selectAll(selector)
    .append('div')
    .attr('class', styles.tooltip)
    .style('opacity', 0);

  const dragstarted = (d) => {
    // console.warn('dragstarted', d);
    tooltip
      .transition()
      .duration(200)
      .style('visibility', 'hidden');
    if (!d3.event.active) {
      simulation.alphaTarget(0.3).restart();
    }
    return {
      ...d,
      fx: d.x,
      fy: d.y,
    };
  };

  // console.warn('dragged', d);
  const dragged = d => ({
    ...d,
    fx: d3.event.x,
    fy: d3.event.y,
  });
  const dragended = (d) => {
    // console.warn('dragended', d);
    tooltip.style('visibility', 'visible');
    if (!d3.event.active) {
      simulation.alphaTarget(0);
    }
    return {
      ...d,
      fx: null,
      fy: null,
    };
  };

  const div = d3
    .select(selector)
    .append('div')
    .attr('class', styles.flagsContainer);

  const svg = d3
    .selectAll(selector)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const link = svg
    .append('g')
    .attr('class', styles.graphLink)
    .selectAll('line')
    .data(graph.links)
    .enter()
    .append('line')
    .attr('stroke-width', '1px');

  const mouseover = (d) => {
    // the flags have an absolute position, so we need to use d3.event.pageY
    const coordX = d3.event.pageX;
    const coordY = d3.event.pageY;
    tooltip
      .transition()
      .duration(200)
      .style('opacity', 0.9);
    tooltip
      .html(d.country)
      .style('left', `${coordX}px`)
      .style('top', `${coordY}px`);
  };

  const mouseout = () => {
    tooltip
      .transition()
      .duration(500)
      .style('opacity', 0);
  };

  const dragBehavior = d3
    .drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);

  const node = div
    .selectAll('img')
    .data(graph.nodes)
    .enter()
    .append('img')
    .attr('src', img.src)
    .attr('class', d => `flag flag-${d.code}`)
    .attr('alt', d => d.country)
    .on('mouseover', mouseover)
    .on('mouseout', mouseout)
    .call(dragBehavior);

  const ticked = () => {
    // console.log('ticked');
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    node.style('left', d => `${d.x + 32}px`).style('top', d => `${d.y + 16}px`);
  };

  simulation.nodes(graph.nodes).on('tick', ticked);

  simulation.force('link').links(graph.links);
};

const imageload = (src) => {
  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.src = src;
    image.onload = () => {
      resolve(image);
    };
    image.onerror = () => {
      reject(new Error('Image failed to load'));
    };
  });
  return promise;
};

export const fn = async (selector, urls) => {
  const [imageUrl, countriesUrl] = urls;
  const p0 = imageload(imageUrl);
  const p1 = d3.json(countriesUrl);
  const promise = Promise.all([p0, p1]);

  let values;
  let error;
  try {
    values = await promise;
  } catch (err) {
    error = err;
  }
  if (!values) {
    displayError(selector, `${urls[0]} or ${urls[1]}`, error);
  } else {
    draw(selector, ...values);
  }
};
