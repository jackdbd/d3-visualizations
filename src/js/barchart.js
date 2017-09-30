// inefficient import for webpack
import * as d3 from 'd3';
// import * as d3Tip from 'd3-tip';
// more efficient imports (but it needs to be done in every file)
// import * as d3Scale from '../../node_modules/d3-scale';
// import * as d3Selection from '../../node_modules/d3-selection';
// import * as d3Axis from '../../node_modules/d3-axis';

require('../sass/main.sass');
require('../sass/barchart.sass');

{
  const draw = (dataset) => {
    const gdp = dataset.data.map(x => x[1]);

    const margin = { top: 20, right: 20, bottom: 30, left: 100 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const parseTime = d3.timeParse('%Y-%m-%d');
    const dates = dataset.data.map(x => parseTime(x[0]));

    const xScale = d3.scaleTime()
      .domain(d3.extent(dates))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(gdp, d => d)])
      .range([height, 0]);

    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    const formatCurrency = d3.format('$,.2f');

    const tooltip = d3.selectAll('.barchart').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    const mouseover = (d) => {
      tooltip.transition().duration(200).style('opacity', 0.9);
      const currentDateTime = new Date(d[0]);
      const year = currentDateTime.getFullYear();
      const month = currentDateTime.getMonth();
      const dollars = d[1];
      const html = `<span>${formatCurrency(dollars)} Billion</span><br>
        <span>${year} - ${months[month]}</span>`;
      tooltip.html(html)
        .style('left', `${d3.event.layerX}px`)
        .style('top', `${(d3.event.layerY - 28)}px`);
    };

    // d3-tip doesn't capture mouse events, so it stays in the upper-left corner
    // It seems d3-tip is not 100% compatible with D3v4
    // const tip = d3Tip()
    // .attr('class', 'd3-tip')
    // .direction('n')
    // .html((d) => {
    //   const currentDateTime = new Date(d[0]);
    //   const year = currentDateTime.getFullYear();
    //   const month = currentDateTime.getMonth();
    //   const dollars = d[1];
    //   const html = `<span>${formatCurrency(dollars)} Billion</span><br>
    //     <span>${year} - ${months[month]}</span>`;
    //   return html;
    // });

    const xAxis = d3.axisBottom()
      .scale(xScale)
      .tickValues(d3.timeYears(dates[0], dates[dates.length - 1], 5));

    const yAxis = d3.axisLeft()
      .scale(yScale)
      .ticks(10, '')
      .tickFormat(d3.format('.0s'));

    const svg = d3.selectAll('.barchart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.right})`);

    // svg.call(tip);

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
      .text('Gross Domestic Product, USA ($ Billion)');

    svg.selectAll('.bar').data(dataset.data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(new Date(d[0])))
      // .attr('x', d => xScale(d[0]))
      // .attr('width', xScale.bandwidth())
      .attr('width', (width / dates.length) + 1)
      .attr('y', d => yScale(d[1]))
      .attr('height', d => height - yScale(d[1]))
      // .on('mouseover', tip.show)
      // .on('mouseout', tip.hide);
      .on('mouseover', mouseover)
      .on('mouseout', () => tooltip.transition().duration(500).style('opacity', 0));
  };

  d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json', (error, data) => {
    if (error) throw error;
    draw(data);
  });
}
