import * as d3 from 'd3';

require('../sass/main.sass');
require('../sass/graph.sass');

{
  const draw = (graph) => {
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(d => d.id))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2));

    // const zScale = d3.scaleOrdinal(d3.schemeCategory20);

    const dragstarted = (d) => {
      if (!d3.event.active) {
        simulation.alphaTarget(0.3).restart();
      }
      d.fx = d.x;
      d.fy = d.y;
    };

    const dragged = (d) => {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    };

    const dragended = (d) => {
      if (!d3.event.active) {
        simulation.alphaTarget(0);
      }
      d.fx = null;
      d.fy = null;
    };

    const svg = d3.selectAll('.force-directed-graph')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const tooltip = d3.selectAll('.scatterplot').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(graph.links)
      .enter()
      .append('line')
      .attr('stroke-width', '1px');

    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(graph.nodes)
      .enter()

      // .append('circle')
      // .attr('r', '8px')
      // .style('fill', d => zScale(d.id))
      .append('image')
      .attr('xlink:href', 'https://github.com/favicon.ico')
      .attr('width', 16)
      .attr('height', 16)

      .on('mouseover', (d) => {
        const coordX = d3.event.layerX;
        const coordY = d3.event.layerY;
        // console.log(d.label);
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip.html(d.label)
          .style('left', `${coordX}px`)
          .style('top', `${coordY}px`);
      })
      .on('mouseout', () => tooltip.transition().duration(500).style('opacity', 0))
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended),
      );

    const ticked = () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      node
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    };

    node.append('title')
      .text(d => d.id);

    simulation
      .nodes(graph.nodes)
      .on('tick', ticked);

    simulation
      .force('link')
      .links(graph.links);
  };

  d3.json('./data/dolphins.json', (error, data) => {
    if (error) throw error;
    draw(data);
  });
}
