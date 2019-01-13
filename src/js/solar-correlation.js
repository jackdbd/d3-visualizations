import { select, selectAll } from 'd3-selection';
// d3.event must be a live binding. See: https://stackoverflow.com/a/40048292
// I have no idea why, but d3Event works fine with planets and moons, but not with the sun
// import { event as d3Event } from 'd3-selection';
import { min, extent, range, descending } from 'd3-array';
import { format } from 'd3-format';
import { scaleLinear, scaleOrdinal, scaleThreshold } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { csv } from 'd3-fetch';
import { legendColor } from 'd3-svg-legend';
// eslint-disable-next-line no-unused-vars
import { transition } from 'd3-transition';
import * as Future from 'fluture';
import * as correlation from 'node-correlation';
import { createComponent, displayError } from './utils';
import '../css/solar-correlation.css';

// create a d3 object with only the subset of functions that we need
const d3 = Object.assign(
  {},
  {
    csv,
    descending,
    extent,
    format,
    legendColor,
    min,
    range,
    scaleLinear,
    scaleOrdinal,
    scaleThreshold,
    schemeCategory10,
    select,
    selectAll,
  }
);

const definePlanetarySystems = (bodies, absInterCorrThreshold, angleGen) => {
  const planetarySystems = [];
  const tmpBodies = bodies.slice(0); // clone bodies

  while (tmpBodies.length > 0) {
    // sort in-place
    tmpBodies.sort((a, b) =>
      d3.descending(a.absCorrWithTarget, b.absCorrWithTarget)
    );
    const indexes = [0];
    const planet = tmpBodies[0];
    const radiansFromSun = angleGen.next().value;
    const otherBodies = tmpBodies.filter(ob => ob.name !== planet.name);
    const moons = [];
    otherBodies.forEach((ob, i) => {
      const interCorr = correlation.calc(ob.values, planet.values);
      const absInterCorr = Math.abs(interCorr);
      // console.log(`Intercorr between ${ob.name} and ${planet.name}: ${interCorr}`);
      // console.log(`Abs intercorr between ${ob.name} and ${planet.name}: ${absInterCorr}`);
      if (absInterCorr > absInterCorrThreshold) {
        // add the absolute intercorrelation from this moon and its planet
        moons.push({
          ...ob,
          absInterCorr,
        });
        const iMoon = i + 1; // +1 is because the first element is the planet
        indexes.push(iMoon);
      }
    });
    const planetarySystem = Object.assign(
      {},
      { planet, moons, radiansFromSun }
    );
    const decreasingIndexes = indexes.reverse();
    decreasingIndexes.forEach(index => tmpBodies.splice(index, 1));
    planetarySystems.push(planetarySystem);
  }
  return planetarySystems;
};

const corrToOrbit = d => Math.floor(Math.abs(d) * 10) / 10;
// Nearest and furthest orbits from the sun.
// Because of double-precision floating point issues, I define these variables
// as integer, and I'll divide by 10 later.
// https://github.com/d3/d3-array/blob/master/README.md#range
const nearest = 9;
const furthest = 0;
const orbitStep = 1;
const orbitLevels = d3
  .range(nearest, furthest - orbitStep, -orbitStep)
  .map(d => d / 10);

const defineOrbits = (data, iSun) => {
  const variables = data.columns;
  const targetVar = variables[iSun];
  const targetValues = data.map(d => +d[targetVar]); // string -> number
  const inputVars = variables.filter(v => v !== targetVar);

  // The placement of planetary systems on orbits depends on the planetary
  // systems on the same orbit AND the ones on previous orbits. A convenient
  // way to keep track of the angle with the sun is a generator.
  const degreesFromSun = d3.range(0, -360, -30);
  const radiansFromSun = degreesFromSun.map(d => d * (Math.PI / 180));
  function* angleGenerator() {
    let index = 0;
    while (true) {
      yield radiansFromSun[index];
      index = (index + 1) % radiansFromSun.length;
    }
  }
  const angleGen = angleGenerator(); // spits out an angle in radians

  // place input variables in orbits. After this function we still don't know
  // if a variable is a planet or a moon.
  const objects = inputVars.map(variable => {
    const values = data.map(d => +d[variable]).filter(d => !Number.isNaN(d));
    // eslint-disable-next-line no-restricted-globals
    const valuesCleaned = values.filter(d => !isNaN(d));
    // eslint-disable-next-line no-restricted-globals
    const targetValuesCleaned = targetValues.filter(d => !isNaN(d));
    const length = d3.min([valuesCleaned.length, targetValuesCleaned.length]);
    const corr = correlation.calc(
      valuesCleaned.slice(0, length),
      targetValuesCleaned.slice(0, length)
    );

    const obj = {
      values,
      name: variable,
      corrWithTarget: corr,
      absCorrWithTarget: Math.abs(corr),
      orbit: corrToOrbit(corr),
    };
    return obj;
  });

  // define the planetary systems for each orbit. Note that a single orbit can
  // contain 0, 1, or more planetary systems.
  const orbits = orbitLevels.map(dOrbit => {
    const bodies = objects.filter(obj => obj.orbit === dOrbit);
    const planetarySystemsOnOrbit = definePlanetarySystems(
      bodies,
      0.5,
      angleGen
    );
    const obj = {
      orbit: dOrbit,
      systems: planetarySystemsOnOrbit,
    };
    return obj;
  });
  return orbits;
};

const margin = {
  top: 10,
  right: 50,
  bottom: 30,
  left: 50,
};
const solarCorrelationViz = createComponent(
  '#solar-correlation',
  1200,
  800,
  margin
);
const { chart, coords, header, tooltip } = solarCorrelationViz;

const zScale = d3.scaleOrdinal(d3.schemeCategory10);
// Note: for threshold scales, pick N values for the input domain, and N + 1
// colors for the output range. The colors were chosen with color brewer 2.0
// http://colorbrewer2.org/#type=diverging&scheme=RdYlGn&n=8
const correlationColorScale = d3
  .scaleThreshold()
  .domain([-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75])
  .range([
    '#d73027',
    '#f46d43',
    '#fdae61',
    '#fee08b',
    '#d9ef8b',
    '#a6d96a',
    '#66bd63',
    '#1a9850',
  ]);

// http://colorbrewer2.org/#type=sequential&scheme=Greys&n=4
const correlationLinearColorScale = d3
  .scaleLinear()
  .domain([nearest / 10, furthest / 10])
  .range(['#f7f7f7', '#cccccc', '#969696', '#525252']);

const safetyMarginPx = 10;
const furthestOrbitRadiusPx =
  d3.min([coords.width, coords.height]) / 2 - safetyMarginPx;
const nearestOrbitRadiusPx = furthestOrbitRadiusPx / orbitLevels.length;
const sunRadiusPx = nearestOrbitRadiusPx * 0.5;
const planetRadiusPx = nearestOrbitRadiusPx * 0.4;
const moonRadiusPx = nearestOrbitRadiusPx * 0.2;

const orbitScale = d3
  .scaleLinear()
  .domain(d3.extent(orbitLevels))
  .range([furthestOrbitRadiusPx, nearestOrbitRadiusPx]);

const getPlanetPosX = (dOrbit, radiansFromSun) => {
  const xOriginPx = coords.width / 2;
  const xPx = orbitScale(dOrbit) * Math.cos(radiansFromSun);
  return xOriginPx + xPx;
};

const getPlanetPosY = (dOrbit, radiansFromSun) => {
  const yOriginPx = coords.height / 2;
  const yPx = orbitScale(dOrbit) * Math.sin(radiansFromSun);
  return yOriginPx + yPx;
};

const getMoonPosX = (dOrbit, radiansFromSun, radiansFromPlanet) => {
  const xOriginPx = getPlanetPosX(dOrbit, radiansFromSun);
  const xPx = (planetRadiusPx + moonRadiusPx) * Math.cos(radiansFromPlanet);
  return xOriginPx + xPx;
};

const getMoonPosY = (dOrbit, radiansFromSun, radiansFromPlanet) => {
  const yOriginPx = getPlanetPosY(dOrbit, radiansFromSun);
  const yPx = (planetRadiusPx + moonRadiusPx) * Math.sin(radiansFromPlanet);
  return yOriginPx + yPx;
};

// linearColorScale
d3.scaleLinear()
  .domain([furthest / 10, nearest / 10])
  .range(['rgb(46, 73, 123)', 'rgb(71, 187, 94)']);

chart
  .append('g')
  .attr('class', 'legendLinear')
  .attr('transform', 'translate(20,20)');

// colorLegend
d3.legendColor()
  .title('Pearson Correlation')
  .shapeWidth(30)
  .cells(orbitLevels.length)
  .orient('vertical')
  .ascending(true)
  .scale(correlationLinearColorScale);

// chart.select('.legendLinear').call(colorLegend);

const mouseover = d => {
  tooltip
    .transition()
    .duration(200)
    .style('opacity', 0.9);
  let html = '';
  if (d.corrWithTarget) {
    const style = `"color: ${correlationColorScale(d.corrWithTarget)};"`;
    html = `<span style=${style}>${d.name} (${d3.format('.2f')(
      d.corrWithTarget
    )})</span>`;
  } else {
    html = `<span>${d.name}</span>`;
  }

  d3.selectAll('.orbit__trajectory')
    .filter(traj => traj === d.orbit)
    // .attr('orbit--highlighted', true)
    .style('stroke', 'black');

  d3.selectAll('.orbit__label')
    .filter(traj => traj === d.orbit)
    .style('fill', 'black');

  tooltip
    .html(html)
    // eslint-disable-next-line no-restricted-globals
    .style('left', `${event.layerX}px`)
    // eslint-disable-next-line no-restricted-globals
    .style('top', `${event.layerY - 10}px`);
};

const mouseout = d => {
  // console.log(`Leaving ${d.name}`);

  d3.selectAll('.orbit__trajectory')
    .filter(traj => traj === d.orbit)
    .style('stroke', correlationLinearColorScale(d.orbit));

  d3.selectAll('.orbit__label')
    .filter(traj => traj === d.orbit)
    .style('fill', '#a9a9a9');

  tooltip
    .transition()
    .duration(500)
    .style('opacity', 0);
};

header.select('.header > h1').text('Solar Correlation Map');

const SolarSystemGroup = chart.append('g').attr('class', 'solar-system');

const orbitsGroup = SolarSystemGroup.append('g').attr('class', 'orbits');

const drawPlanetarySystem = (dSystem, iSystem, systemSelection, iOrbit) => {
  console.warn(
    'drawPlanetarySystem',
    dSystem,
    iSystem,
    systemSelection,
    iOrbit
  );
  systemSelection
    .append('circle')
    .datum(dSystem.planet)
    .attr('class', 'planet')
    .attr('cx', d => getPlanetPosX(d.orbit, dSystem.radiansFromSun))
    .attr('cy', d => getPlanetPosY(d.orbit, dSystem.radiansFromSun))
    .attr('r', planetRadiusPx)
    .style('fill', d => correlationColorScale(d.corrWithTarget))
    .on('mouseover', mouseover)
    .on('mouseout', mouseout);

  const thisText = systemSelection
    .append('text')
    .datum(dSystem)
    .attr('x', getPlanetPosX(dSystem.planet.orbit, dSystem.radiansFromSun))
    .attr('y', getPlanetPosY(dSystem.planet.orbit, dSystem.radiansFromSun));

  // No need to use a generator to place the moons. The position of a moon in
  // a planetary system does NOT depend on other planetary systems.
  const degreesFromPlanet = d3.range(0, -360, -60);
  const radiansFromPlanet = degreesFromPlanet.map(d => d * (Math.PI / 180));
  systemSelection
    .selectAll('.moon')
    .data(dSystem.moons)
    .enter()
    .append('circle')
    .attr('class', 'moon')
    .attr('cx', (d, i) =>
      getMoonPosX(d.orbit, dSystem.radiansFromSun, radiansFromPlanet[i])
    )
    .attr('cy', (d, i) =>
      getMoonPosY(d.orbit, dSystem.radiansFromSun, radiansFromPlanet[i])
    )
    .attr('r', moonRadiusPx)
    .style('fill', d => zScale(d.name))
    .on('mouseover', mouseover)
    .on('mouseout', mouseout);

  // It seems that the spread operator is supported out of the box, but not
  // the rest operator. Maybe I should include it in the .babelrc as a plugin.
  const bodies = [dSystem.planet, ...dSystem.moons];
  thisText
    .selectAll('tspan')
    .data(bodies)
    .enter()
    .append('tspan')
    .attr('x', getPlanetPosX(dSystem.planet.orbit, dSystem.radiansFromSun))
    .attr('dy', (d, i) => (i === 0 ? '0' : '1em'))
    .text((d, i) => (i === 0 ? `${d.name}` : `- ${d.name}`));
};

const drawOrbit = (dOrbit, iOrbit, orbitSelection) => {
  const orbitGroup = orbitSelection.append('g');

  orbitGroup
    .append('circle')
    .datum(dOrbit.orbit)
    .attr('cx', coords.width / 2)
    .attr('cy', coords.height / 2)
    .attr('r', d => orbitScale(d))
    .attr('class', 'orbit__trajectory')
    .style('stroke', correlationLinearColorScale(dOrbit.orbit));
  // .on('mouseover', d => console.log(`Orbit ${d}`));

  orbitGroup
    .append('text')
    .datum(dOrbit.orbit)
    .attr('x', coords.width / 2)
    .attr('y', coords.height / 2 - orbitScale(dOrbit.orbit))
    .text(dOrbit.orbit)
    .attr('class', 'orbit__label');

  const systems = orbitSelection
    .selectAll('.orbit__planetary-system')
    .data(dOrbit.systems)
    .enter()
    .append('g')
    .attr('class', 'orbit__planetary-system');

  systems.each((dSystem, iSystem, gSystems) => {
    const systemSelection = d3.select(gSystems[iSystem]);
    return drawPlanetarySystem(dSystem, iSystem, systemSelection, iOrbit);
  });
};

const drawSun = (data, iSun) => {
  const variables = data.columns;
  const targetVar = variables[iSun];
  const sun = SolarSystemGroup.append('g')
    .datum({ name: targetVar })
    .attr('class', 'sun');

  sun
    .append('circle')
    .attr('cx', coords.width / 2)
    .attr('cy', coords.height / 2)
    .attr('r', sunRadiusPx)
    .on('mouseover', mouseover)
    .on('mouseout', mouseout);
};

const drawAllOrbits = data => {
  const orbits = orbitsGroup
    .selectAll('g')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'orbit');

  orbits.each((dOrbit, iOrbit, gOrbits) => {
    const orbitSelection = d3.select(gOrbits[iOrbit]);
    return drawOrbit(dOrbit, iOrbit, orbitSelection);
  });
};

// jedi.csv found here: https://github.com/Zapf-Consulting/solar-correlation-map/blob/master/jedi.csv
const jediUrl =
  'https://raw.githubusercontent.com/jackdbd/d3-visualizations/master/src/data/jedi.csv';

// create unary functions so they can be used in `.fork`
const displayErrorBounded = displayError.bind(
  this,
  '#solar-correlation',
  jediUrl
);

const draw = data => {
  const iSun = 0; // sun is the output variable
  drawSun(data, iSun);
  const orbitsData = defineOrbits(data, iSun);
  drawAllOrbits(orbitsData);
};

const fn = url => {
  const promise = d3.csv(url);
  return promise;
};
const future = Future.encaseP(fn);

future(jediUrl).fork(displayErrorBounded, draw);
