import * as d3 from 'd3';

const d3RequestType = require('../../node_modules/d3-request/src/type');
const topojson = require('topojson');

require('../sass/main.sass');
require('../sass/geomap.sass');

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
