import * as d3 from 'd3';

require('../sass/main.sass');
require('../sass/scatterplot.sass');

{
  const rowFunction = (d) => {
    const obj = {
      // 'sepal length': +d['sepal length'],
      // 'sepal width': +d['sepal width'],
      'petal length': +d['petal length'],
      'petal width': +d['petal width'],
      species: `${d.species.charAt(0).toUpperCase()}${d.species.slice(1)}`,
    };
    return obj;
  };

  const draw = (data) => {
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const xScale = d3.scaleLinear()
      .range([0, width])
      .domain(d3.extent(data, d => d['petal length']));

    const yScale = d3.scaleLinear()
      .range([height, 0])
      .domain(d3.extent(data, d => d['petal width']));

    const zScale = d3.scaleOrdinal(d3.schemeCategory10);

    const xAxis = d3.axisBottom()
      .scale(xScale)
      .ticks(6);

    const yAxis = d3.axisLeft()
      .scale(yScale)
      .ticks(6);

    const svg = d3.selectAll('.scatterplot')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const tooltip = d3.selectAll('.scatterplot').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    svg.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .append('text')
      .attr('x', width - 30)
      .attr('y', -6)
      .text('Petal length');

    svg.append('g')
      .attr('class', 'axis axis--y')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Petal width');

    // append circles
    svg.selectAll('.circle').data(data)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('cx', d => xScale(d['petal length']))
      .attr('cy', d => yScale(d['petal width']))
      .attr('r', 10)
      .style('fill', d => zScale(d.species))
      .on('mouseover', (d) => {
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip.html(`<span>${d.species}</span><br>
        Petal length: ${d['petal length']}<br>
        Petal width: ${d['petal width']}`)
          .style('left', `${d3.event.layerX}px`)
          .style('top', `${(d3.event.layerY - 28)}px`);
      });
  };

  d3.csv('./data/flowers.csv', rowFunction, (error, data) => {
    if (error) throw error;
    draw(data);
  });
}
