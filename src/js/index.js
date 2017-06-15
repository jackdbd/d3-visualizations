import * as d3 from 'd3';


const d3RequestType = require('../../node_modules/d3-request/src/type');
const topojson = require('topojson');
const d3ScaleChromatic = require('d3-scale-chromatic');

require('../sass/main.sass');

d3.select('body').insert('p', ':first-child').html(`D3 version: ${d3.version}`);

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

{
  const draw = (graph) => {
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(d => d.id))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2));

    const zScale = d3.scaleOrdinal(d3.schemeCategory20);

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
      .append('circle')
      .attr('r', '8px')
      .style('fill', d => zScale(d.id))
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
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
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

{
  const draw = (data) => {
    const margin = { top: 20, right: 20, bottom: 30, left: 100 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    const barHeight = height / 12;
    const barWidth = width / (data.monthlyVariance.length / 12);
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    const date = year => new Date(Date.parse(year));

    const xScale = d3.scaleTime()
      .range([0, width])
      .domain(d3.extent(data.monthlyVariance, d => date(d.year)));

    const yScale = d3.scaleLinear()
      .range([height, 0])
      .domain([0, 12]);

    // https://github.com/d3/d3-scale-chromatic
    // some DIVERGING schemes:
    // interpolateRdBu
    // interpolateSpectral
    // some SEQUENTIAL (Single Hue) schemes:
    // interpolateOranges
    // some SEQUENTIAL (Multi Hue) schemes:
    // interpolateYlOrRd
    const zScale = d3.scaleSequential(d3ScaleChromatic.interpolateRdBu)
      .domain([
        d3.max(data.monthlyVariance, d => d.variance),
        d3.min(data.monthlyVariance, d => d.variance)]);

    const xAxis = d3.axisBottom()
      .scale(xScale);

    const h3 = d3.selectAll('.heat-map').append('h3');
    h3
      .text(`Variance of the global temperature across ${data.years} years.`)
      .style('text-align', 'center');

    const svg = d3.selectAll('.heat-map')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const tooltip = d3.selectAll('.heat-map').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    const mouseover = (d) => {
      const variance = d.variance < 0 ? `${d.variance.toFixed(3)}` : `+${d.variance.toFixed(3)}`;
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip.html(`${months[months.length - d.month]} ${d.year}<br>${variance} °C`)
        .style('left', `${d3.event.layerX}px`)
        .style('top', `${(d3.event.layerY - 28)}px`);
    };

    svg.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);

    svg.append('g')
      .attr('class', 'axis axis--y');

    const heatBars = svg.append('g')
      .attr('class', 'heatBars');

    heatBars.selectAll('.heatBar').data(data.monthlyVariance)
      .enter()
      .append('rect')
      .attr('class', 'heatBar')
      .attr('x', d => xScale(new Date(d.year, 0)))
      .attr('width', barWidth)
      .attr('y', d => yScale(d.month))
      .attr('height', barHeight)
      .style('fill', d => zScale(d.variance))
      .on('mouseover', mouseover)
      .on('mouseout', () => tooltip.transition().duration(500).style('opacity', 0));

    const monthLabels = svg.append('g')
      .attr('class', 'monthLabels');

    const monthLabelXOffset = -5; // does not depend on font-size
    const monthLabelYOffset = 6; // depends on font-size

    monthLabels.selectAll('text').data(months)
      .enter()
      .append('text')
      .attr('class', 'month')
      .attr('x', monthLabelXOffset)
      .attr('y', (d, i) => (barHeight / 2) + (barHeight * i) + monthLabelYOffset)
      .attr('text-anchor', 'end')
      .text(d => `${d}`);
  };

  const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';
  d3.json(url, (error, data) => {
    if (error) throw error;
    const years = 100;
    const reducedDataset = {
      years,
      baseTemperature: data.baseTemperature,
      monthlyVariance: data.monthlyVariance.slice(0, years * 12),
    };
    draw(reducedDataset);
  });
}


{
  const draw = (error, fipsStateCodes, topology) => {
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 960 - margin.left - margin.right;
    const height = 650 - margin.top - margin.bottom;

    const zScale = d3.scaleOrdinal(d3.schemeCategory20);

    const path = d3.geoPath();

    const svg = d3.selectAll('.geo-map')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const usa = svg.append('g')
      .attr('class', 'usa');

    const counties = usa.append('g')
      .attr('class', 'counties');

    const states = usa.append('g')
      .attr('class', 'states');

    const tooltip = d3.selectAll('.heat-map').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    const mouseover = (d) => {
      tooltip.transition().duration(200).style('opacity', 0.9);
      const obj = fipsStateCodes.filter(x => x.STATE === d.id)[0];
      tooltip.html(`${d.id}: ${obj.STATE_NAME}`)
        .style('left', `${d3.event.layerX}px`)
        .style('top', `${(d3.event.layerY - 28)}px`);
    };

    counties.selectAll('path').data(topojson.feature(topology, topology.objects.counties).features)
      .enter()
      .append('path')
      .attr('class', 'county')
      .attr('d', path)
      .style('fill', 'white')
      .style('stroke', 'black');
    // .on('mouseover', () => console.log('county'));

    states.selectAll('path').data(topojson.feature(topology, topology.objects.states).features)
      .enter()
      .append('path')
      .attr('class', 'state')
      .attr('d', path)
      .style('fill', d => zScale(d.id))
    // .on('mouseover', () => console.log('state'));
      .on('mouseover', mouseover)
      .on('mouseout', () => tooltip.transition().duration(500).style('opacity', 0));

    svg.append('path')
      .attr('class', 'state-border')
      .attr('d', path(topojson.mesh(topology, topology.objects.states, (a, b) => a !== b)))
      .style('fill', 'none')
      .style('opacity', 0.2)
      .style('stroke', 'black');
  };

  const d3Psv = d3RequestType.default('text/plain', (xhr) => {
    const psv = d3.dsvFormat('|');
    return psv.parse(xhr.responseText);
  });

  // National FIPS and GNIS Codes File can be downloaded here:
  // https://www.census.gov/geo/reference/ansi_statetables.html

  const queue = d3.queue();
  queue
    .defer(d3Psv, '../data/us_states_fips_codes.txt')
    .defer(d3.json, 'https://d3js.org/us-10m.v1.json')
    .await(draw);
}
