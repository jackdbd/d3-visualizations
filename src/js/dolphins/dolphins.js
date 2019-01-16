import * as d3 from 'd3';
import { displayError } from '../utils';
import '../../css/vendor/flags.min.css';
import styles from './dolphins.module.css';

const draw = (selector, graph) => {
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
    .force('link', d3.forceLink().id(d => d.id))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width / 2, height / 2));

  const zScale = d3.scaleOrdinal(d3.schemeCategory10);

  /*
   * I think that for the drag behavior we have to reassign. Returning a new
   * object will NOT work.
   */
  const dragstarted = d => {
    if (!d3.event.active) {
      simulation.alphaTarget(0.3).restart();
    }
    // eslint-disable-next-line no-param-reassign
    d.fx = d.x;
    // eslint-disable-next-line no-param-reassign
    d.fy = d.y;
  };

  const dragged = d => {
    // eslint-disable-next-line no-param-reassign
    d.fx = d3.event.x;
    // eslint-disable-next-line no-param-reassign
    d.fy = d3.event.y;
  };

  const dragended = d => {
    if (!d3.event.active) {
      simulation.alphaTarget(0);
    }
    // eslint-disable-next-line no-param-reassign
    d.fx = null;
    // eslint-disable-next-line no-param-reassign
    d.fy = null;
  };

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
    .attr('class', styles.tooltip)
    .style('opacity', 0);

  const link = svg
    .append('g')
    // .attr('class', styles.links)
    .selectAll('line')
    .data(graph.links)
    .enter()
    .append('line')
    .attr('class', styles.graphLink)
    .attr('stroke-width', '1px');

  const node = svg
    .append('g')
    // .attr('class', styles.nodes)
    .selectAll('circle')
    .data(graph.nodes)
    .enter()
    .append('circle')
    .attr('class', styles.graphNode)
    .attr('r', '8px')
    .style('fill', d => zScale(d.id))
    .on('mouseover', d => {
      const coordX = d3.event.layerX;
      const coordY = d3.event.layerY;
      // console.log(d.label);
      tooltip
        .transition()
        .duration(200)
        .style('opacity', 0.9);
      tooltip
        .html(d.label)
        .style('left', `${coordX}px`)
        .style('top', `${coordY}px`);
    })
    .on('mouseout', () =>
      tooltip
        .transition()
        .duration(500)
        .style('opacity', 0)
    )
    .call(
      d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    );

  const ticked = () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    node.attr('cx', d => d.x).attr('cy', d => d.y);
  };

  node.append('title').text(d => d.id);

  simulation.nodes(graph.nodes).on('tick', ticked);

  simulation.force('link').links(graph.links);
};

const fn = async (selector, url) => {
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    displayError(selector, url, err);
    return;
  }
  let data;
  try {
    data = await res.json();
  } catch (err) {
    displayError(selector, url, err);
    return;
  }
  draw(selector, data);
};

export default fn;
