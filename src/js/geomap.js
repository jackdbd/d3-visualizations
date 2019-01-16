import * as d3Array from 'd3-array';
import { hsl } from 'd3-color';
import { json as d3Json } from 'd3-fetch';
import { format } from 'd3-format';
import { geoMercator, geoPath as d3GeoPath } from 'd3-geo';
import { interpolateCubehelix } from 'd3-interpolate';
import { scaleLinear, scaleOrdinal, scaleSqrt, scaleThreshold } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { event, selectAll } from 'd3-selection';
import { timeFormat } from 'd3-time-format';
import { zoom } from 'd3-zoom';
import { feature } from 'topojson';
import '../css/geomap.css';

// const d3RequestType = require('../../node_modules/d3-request/src/type');

// {
//   const draw = (error, fipsStateCodes, topology) => {
//     const margin = { top: 20, right: 20, bottom: 30, left: 40 };
//     const width = 960 - margin.left - margin.right;
//     const height = 650 - margin.top - margin.bottom;

//     const zScale = scaleOrdinal(schemeCategory10);

//     const path = geoPath();

//     const svg = selectAll("#geo-map")
//       .append("svg")
//       .attr("width", width + margin.left + margin.right)
//       .attr("height", height + margin.top + margin.bottom)
//       .append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`);

//     const usa = svg.append("g").attr("class", "usa");

//     const counties = usa.append("g").attr("class", "counties");

//     const states = usa.append("g").attr("class", "states");

//     const tooltip = selectAll("#geo-map")
//       .append("div")
//       .attr("class", "tooltip")
//       .style("opacity", 0);

//     const mouseover = d => {
//       tooltip
//         .transition()
//         .duration(200)
//         .style("opacity", 0.9);
//       const obj = fipsStateCodes.filter(x => x.STATE === d.id)[0];
//       tooltip
//         .html(`${d.id}: ${obj.STATE_NAME}`)
//         .style("left", `${event.layerX}px`)
//         .style("top", `${event.layerY - 28}px`);
//     };

//     counties
//       .selectAll("path")
//       .data(feature(topology, topology.objects.counties).features)
//       .enter()
//       .append("path")
//       .attr("class", "county")
//       .attr("d", path)
//       .style("fill", "white")
//       .style("stroke", "black");
//     // .on('mouseover', () => console.log('county'));

//     states
//       .selectAll("path")
//       .data(feature(topology, topology.objects.states).features)
//       .enter()
//       .append("path")
//       .attr("class", "state")
//       .attr("d", path)
//       .style("fill", d => zScale(d.id))
//       // .on('mouseover', () => console.log('state'));
//       .on("mouseover", mouseover)
//       .on("mouseout", () =>
//         tooltip
//           .transition()
//           .duration(500)
//           .style("opacity", 0)
//       );

//     svg
//       .append("path")
//       .attr("class", "state-border")
//       .attr(
//         "d",
//         path(mesh(topology, topology.objects.states, (a, b) => a !== b))
//       )
//       .style("fill", "none")
//       .style("opacity", 0.2)
//       .style("stroke", "black");
//   };

//   const d3Psv = d3RequestType.default("text/plain", xhr => {
//     const psv = dsv("|");
//     return psv.parse(xhr.responseText);
//   });

//   // National FIPS and GNIS Codes File can be downloaded here:
//   // https://www.census.gov/geo/reference/ansi_statetables.html

//   const queue = queue();
//   queue
//     .defer(d3Psv, "../data/us_states_fips_codes.txt")
//     .defer(d3Json, "https://d3js.org/us-10m.v1.json")
//     .await(draw);
// }

// -------------------------------------------------------------------------- //

const worldMapUrl = 'https://d3js.org/world-50m.v1.json';
const meteoritesUrl =
  'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json';
// const worldMapUrl = '../data/world-50m.v1.json';
// const meteoritesUrl = '../data/meteorite-strike-data.json';

const draw = (topologyWorld, meteorites) => {
  const margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40,
  };
  const width = 960 - margin.left - margin.right;
  const height = 650 - margin.top - margin.bottom;

  const svg = selectAll('#geo-map')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // append a background as big as the svg to handle zoom & pan behavior
  svg
    .append('rect')
    .attr('class', 'background')
    .attr('width', width)
    .attr('height', height);

  const world = svg.append('g').attr('class', 'world');

  const countries = world.append('g').attr('class', 'countries');

  const impacts = world.append('g').attr('class', 'impacts');

  const projection = geoMercator();
  // const projection = d3.geoAzimuthalEqualArea();
  // const projection = d3.geoConicEqualArea();
  // const projection = d3.geoEquirectangular();
  // const projection = d3.geoTransverseMercator();
  const geoPath = d3GeoPath().projection(projection);

  const zoomed = () => {
    svg.attr('transform', event.transform);
  };

  // Note: panning the map at zoom level 1 causes jitter. Is it a d3 bug?
  // Panning at other zoom level is ok
  const zoomBehavior = zoom()
    .scaleExtent([1, 100])
    .on('zoom', zoomed);

  svg.call(zoomBehavior);

  const tooltip = selectAll('#geo-map')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  const countryScale = scaleOrdinal(schemeCategory10);

  const featureCollection = feature(
    topologyWorld,
    topologyWorld.objects.countries
  );
  const featuresWorld = featureCollection.features;

  countries
    .selectAll('path')
    .data(featuresWorld)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', geoPath)
    // .style('fill', 'none')
    // .attr('stroke', '#000000');
    .style('fill', d => countryScale(d.id));

  /**
   * Create a meteorite data sample from a feature
   * @param {Object} f - Feature.
   * @return {Object} d - The meteorite.
   */
  const createDataSample = f => {
    const props = f.properties;
    const mass = +props.mass; // string -> number
    const d = {
      mass,
      coords: f.geometry.coordinates,
      id: props.id,
      name: props.name,
      recclass: props.recclass,
      date: new Date(props.year),
    };
    return d;
  };

  /* Some data samples are incomplete (41 out of 1000) and they don't include:
      - coordinates of the impact
      - meteorite's mass
      - year of the impact
    Missing information could be problematic for the d3 scales (e.g. mass = 0 in
    d3.scaleLog, missing year in d3.scaleTime) so we discard these samples.
    */
  const features = meteorites.features
    .filter(f => f.geometry)
    .filter(f => f.properties.mass)
    .filter(f => f.properties.year);
  const data = features.map(f => createDataSample(f));
  const masses = data.map(d => d.mass);

  /* A linear scale is not well-suited with this dataset because of a huge
    meteorite that fell in 1947 (Sikhote-Alin, mass: 23.000.000 g) */
  // const massSizeScale = d3.scaleLinear()
  //   .domain(d3.extent(masses))
  //   .range([1, 50]);

  // A power scale (with exponent 0.5) seems a good choice
  const massSizeScale = scaleSqrt()
    .domain(d3Array.extent(masses))
    .range([1, 50]);

  /* It's better to have only a small number of colors, so we use a threshold
    scale. By looking at the data, most of the meteorites have mass > 1000 g,
    so we use this value for the lower bound. We want to highlight the huge
    Sikhote-Alin, so we use 20 Tonne for the upper bound.
    domain: 1Kg, 100Kg, 500Kg, 1 Tonne (1000Kg), 10 Tonne, 20 Tonne */
  const domain = [1000, 100000, 500000, 1000000, 10000000, 20000000];

  // http://bl.ocks.org/syntagmatic/29bccce80df0f253c97e
  const generator = scaleLinear()
    .domain([0, (domain.length - 1) / 2, domain.length - 1])
    .range([hsl(-100, 0.95, 0.52), hsl(80, 1.15, 0.62), hsl(0, 0.55, 0.52)])
    .interpolate(interpolateCubehelix);

  const range = d3Array.range(domain.length).map(generator);

  const massColorScale = scaleThreshold()
    .domain(domain)
    .range(range);

  const mouseover = d => {
    // more human-readable units of measurements for the mass
    // https://github.com/d3/d3/issues/2241#issuecomment-150099953
    const formatSI = format('.3s');
    const s = formatSI(d.mass);
    let mass = 1;
    switch (s[s.length - 1]) {
      case 'k':
        mass = `${s.slice(0, -1)} kg`;
        break;
      case 'M':
        mass = `${s.slice(0, -1)} t`;
        break;
      default:
        mass = `${s} g`;
    }

    tooltip
      .transition()
      .duration(200)
      .style('opacity', 0.9);
    const lat = format('.2f')(d.coords[1]);
    const latitude = lat > 0 ? `${lat}°N` : `${-lat}°S`;
    const long = format('.2f')(d.coords[0]);
    const longitude = long > 0 ? `${long}°E` : `${-long}°W`;
    const date = timeFormat('%B %Y')(d.date);
    const html = `<span>${d.name}</span> (<span>${date}</span>)<br>
        <span>(${latitude}, ${longitude})</span><br>
        <span>${mass}</span><span> - Class: ${d.recclass}</span>`;
    tooltip
      .html(html)
      .style('left', `${event.layerX + 10}px`)
      .style('top', `${event.layerY - 10}px`);
  };

  impacts
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'meteorite-strike')
    .attr('cx', d => projection(d.coords)[0])
    .attr('cy', d => projection(d.coords)[1])
    .attr('r', d => massSizeScale(d.mass))
    .style('fill', d => massColorScale(d.mass))
    .on('mouseover', mouseover)
    .on('mouseout', () =>
      tooltip
        .transition()
        .duration(500)
        .style('opacity', 0)
    );
};

// fetch(worldMapUrl)
//   .catch(error => {
//     throw error;
//   })
//   .then(async res => {
//     const topologyWorld = await res.json();
//     // console.log("topologyWorld", topologyWorld);
//     fetch(meteoritesUrl)
//       .catch(error => {
//         throw error;
//       })
//       .then(async response => {
//         const meteorites = await response.json();
//         // console.log("meteorites", meteorites);
//         draw(topologyWorld, meteorites);
//       });
//   });

const urls = [worldMapUrl, meteoritesUrl];
const promise = Promise.all(urls.map(url => d3Json(url)));

promise
  .catch(error => {
    throw error;
  })
  .then(datasets => {
    draw(...datasets);
  });
