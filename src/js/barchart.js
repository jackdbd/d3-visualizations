import * as d3 from 'd3';

require('../sass/main.sass');
require('../sass/barchart.sass');

{
  const rowFunction = (d) => {
    const obj = {
      letter: d.letter,
      frequency: +d.frequency,
    };
    return obj;
  };

  const draw = (letterFrequencies) => {
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const xScale = d3.scaleBand()
      .range([0, width])
      .round(true)
      .paddingInner(0.1); // space between bars (it's a ratio)

    const yScale = d3.scaleLinear()
      .range([height, 0]);

    const xAxis = d3.axisBottom()
      .scale(xScale);

    const yAxis = d3.axisLeft()
      .scale(yScale)
      .ticks(10, '%');

    const svg = d3.selectAll('.barchart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.right})`);

    const tooltip = d3.selectAll('.barchart').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    xScale
      .domain(letterFrequencies.map(d => d.letter));
    yScale
      .domain([0, d3.max(letterFrequencies, d => d.frequency)]);

    svg.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);

    svg.append('g')
      .attr('class', 'axis axis--y')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Frequency');

    svg.selectAll('.bar').data(letterFrequencies)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.letter))
      .attr('width', xScale.bandwidth())
      .attr('y', d => yScale(d.frequency))
      .attr('height', d => height - yScale(d.frequency))
      .on('mouseover', (d) => {
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip.html(`Frequency: <span>${d.frequency}</span>`)
          .style('left', `${d3.event.layerX}px`)
          .style('top', `${(d3.event.layerY - 28)}px`);
      })
      .on('mouseout', () => tooltip.transition().duration(500).style('opacity', 0));
  };

  d3.tsv('./data/bardata.tsv', rowFunction, (error, data) => {
    if (error) throw error;
    draw(data);
  });
}
