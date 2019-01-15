import * as d3 from 'd3';
import { displayError } from '../utils';
import '../../css/scatterplot.css';

const draw = (selector, data) => {
  const margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40,
  };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // define an arbitrary epoch, so we can build dates relative to it
  const epoch = new Date();
  const seconds = data.map(d => d.Seconds);
  const dates = seconds.map(s => d3.timeSecond.offset(epoch, s));
  // const times = data.map(d => d3.timeParse('%M:%S')(d.Time));
  const bestTimeSec = seconds[0];
  const worstTimeSec = seconds[seconds.length - 1];
  const bestTimeDate = d3.timeSecond.offset(epoch, bestTimeSec);
  const worstTimeDate = d3.timeSecond.offset(epoch, worstTimeSec);

  const hasDopingAllegation = d => {
    if (d.Doping === '') {
      return false;
    }
    return true;
  };

  const formatRelativeToBest = d => {
    const offset = d - bestTimeDate;
    return d3.timeFormat('+%M:%S')(offset);
  };

  const xScale = d3
    .scaleTime()
    .domain([worstTimeDate, bestTimeDate])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .range([0, height])
    .domain(d3.extent(data, d => d.Place));

  const zScale = d3.scaleOrdinal(d3.schemeCategory10);

  const xAxis = d3
    .axisBottom()
    .scale(xScale)
    .tickFormat(formatRelativeToBest);
  // .ticks(10);

  const yAxis = d3.axisLeft().scale(yScale);

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
    .attr('class', 'tooltip')
    .style('opacity', 0);

  const htmlStr = d => {
    const firstStr = `<span>${d.Place}: ${d.Name} (${
      d.Nationality
    })</span><br>`;
    const secondStr = `<span>Time: ${d.Time} (${d.Year})</span>`;
    let thirdStr = '';
    if (hasDopingAllegation(d)) {
      thirdStr = `${firstStr}${secondStr}`;
    } else {
      thirdStr = `${firstStr}${secondStr}<br><span>${d.Doping}</span>`;
    }
    let str = thirdStr;
    if (d.URL) {
      str = `${thirdStr}<br><a href="${
        d.URL
      }" target="_blank">Doping Allegations</a>`;
    }
    return str;
  };

  svg
    .append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis)
    .append('text')
    .attr('x', width - 40)
    .attr('y', -6)
    .text('Time to Best');

  svg
    .append('g')
    .attr('class', 'axis axis--y')
    .call(yAxis)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '.71em')
    .style('text-anchor', 'end')
    .text('Ranking');

  const bikers = svg.append('g').attr('class', 'bikers');

  bikers
    .selectAll('.circle')
    .data(data)
    .enter()
    .append('circle') // use elements (in defs)
    .attr('class', 'circle')
    .attr('cx', (d, i) => xScale(dates[i]))
    .attr('cy', d => yScale(d.Place))
    .attr('r', 10)
    .style('fill', d => zScale(hasDopingAllegation(d)))
    .on('mouseover', d => {
      tooltip
        .transition()
        .duration(500)
        .style('opacity', 0.8);
      tooltip
        .html(htmlStr(d))
        .style('left', `${d3.event.layerX}px`)
        .style('top', `${d3.event.layerY - 28}px`);
    })
    .on('mouseout', () =>
      tooltip
        .transition()
        .duration(500)
        .style('opacity', 0)
    );
};

const fn = async (selector, url) => {
  let data;
  let error;
  try {
    data = await d3.json(url);
  } catch (err) {
    error = err;
  }
  if (!data) {
    displayError(selector, url, error);
  } else {
    draw(selector, data);
  }
};

export default fn;
