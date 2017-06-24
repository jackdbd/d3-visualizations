import * as d3 from 'd3';

const correlation = require('node-correlation');
const createComponent = require('./layout_manager').createComponent;


require('../sass/main.sass');
require('../sass/solar-correlation.sass');

{
  const corrToOrbit = d => Math.floor(Math.abs(d) * 10) / 10;
  // Nearest and furtherst orbits from the sun.
  // Because of double-precision floating point issues, I define these variables
  // as integer, and I'll divide by 10 later.
  // https://github.com/d3/d3-array/blob/master/README.md#range
  const nearest = 9;
  const furthest = 0;
  const orbitStep = 1;
  const orbitLevels = d3.range(nearest, furthest - orbitStep, -orbitStep)
    .map(d => d / 10);

  // ------------------------------------------------------------------------ //

  const definePlanetarySystems = (dOrbit, iOrbit, bodies, absInterCorrThreshold) => {
    const planetarySystems = [];
    const tmpBodies = bodies.slice(0); // clone bodies

    while (tmpBodies.length > 0) {
      // sort in-place
      tmpBodies.sort((a, b) => d3.descending(a.absCorrWithTarget, b.absCorrWithTarget));
      const planetarySystem = {
        planet: {},
        moons: [],
      };
      const indexes = [0];
      const planet = tmpBodies[0];
      const otherBodies = tmpBodies.filter(ob => ob.name !== planet.name);
      const moons = [];
      otherBodies.forEach((ob, i) => {
        const interCorr = correlation.calc(ob.values, planet.values);
        const absInterCorr = Math.abs(interCorr);
        // console.log(`Intercorr between ${ob.name} and ${planet.name}: ${interCorr}`);
        // console.log(`Abs intercorr between ${ob.name} and ${planet.name}: ${absInterCorr}`);
        if (absInterCorr > absInterCorrThreshold) {
          // add the absolute intercorrelation from this moon and its planet
          ob.absInterCorr = absInterCorr;
          moons.push(ob);
          const iMoon = i + 1; // +1 is because the first element is the planet
          indexes.push(iMoon);
        }
      });
      Object.assign(planetarySystem.planet, planet);
      Object.assign(planetarySystem.moons, moons);
      const decreasingIndexes = indexes.reverse();
      decreasingIndexes.forEach(index => tmpBodies.splice(index, 1));
      planetarySystems.push(planetarySystem);
    }
    return planetarySystems;
  };

  const defineOrbits = (data, iSun) => {
    // The Sun is not returned. I don't think it's needed. I could change my mind though...
    const variables = Object.keys(data[0]);
    const targetVar = variables[iSun];
    const targetValues = data.map(d => +d[targetVar]); // string -> number
    const inputVars = variables.filter(v => v !== targetVar);

    const objects = inputVars.map((variable) => {
      const values = data.map(d => +d[variable]); // string -> number
      const corr = correlation.calc(values, targetValues);

      const obj = {
        values,
        name: variable,
        corrWithTarget: corr,
        absCorrWithTarget: Math.abs(corr),
        orbit: corrToOrbit(corr),
      };
      return obj;
    });

    const orbits = orbitLevels.map((dOrbit, iOrbit) => {
      const bodies = objects.filter(obj => obj.orbit === dOrbit);
      const planetarySystemsOnOrbit = definePlanetarySystems(dOrbit, iOrbit, bodies, 0.5);
      const obj = {
        orbit: dOrbit,
        systems: planetarySystemsOnOrbit,
      };
      return obj;
    });
    return orbits;
  };

  // ------------------------------------------------------------------------ //

  const solarCorrelationViz = createComponent('#solar-correlation', 1200, 800);
  const chart = solarCorrelationViz.chart;
  const coords = solarCorrelationViz.coords;
  const header = solarCorrelationViz.header;
  const footer = solarCorrelationViz.footer;
  const tooltip = solarCorrelationViz.tooltip;

  const zScale = d3.scaleOrdinal(d3.schemeCategory20);

  const safetyMarginPx = 10;
  const furthestOrbitRadiusPx = (d3.min([coords.width, coords.height]) / 2) - safetyMarginPx;
  const nearestOrbitRadiusPx = furthestOrbitRadiusPx / orbitLevels.length;
  const sunRadiusPx = nearestOrbitRadiusPx * 0.75;
  const planetRadiusPx = nearestOrbitRadiusPx * 0.5;
  const moonRadiusPx = nearestOrbitRadiusPx * 0.2;

  const orbitScale = d3.scaleLinear()
    .domain(d3.extent(orbitLevels))
    .range([furthestOrbitRadiusPx, nearestOrbitRadiusPx]);

  const angles = d3.range(0, 330 + 1, 30); // degrees

  const getX = (orbit, i, isMoon) => {
    const iAngle = i % angles.length;
    const angleDeg = angles[iAngle];
    const angleRadians = angleDeg * (Math.PI / 180);
    const xOriginPx = coords.width / 2;
    const xPx = orbitScale(orbit) * Math.cos(angleRadians);
    // TODO: use planetRadiusPx for moons
    return xOriginPx + xPx;
  };

  const getY = (orbit, i, isMoon) => {
    const iAngle = i % angles.length;
    const angleDeg = angles[iAngle];
    const angleRadians = angleDeg * (Math.PI / 180);
    const yOriginPx = coords.height / 2;
    const yPx = orbitScale(orbit) * Math.sin(angleRadians);
    // TODO: use planetRadiusPx for moons
    return yOriginPx + yPx;
  };

  const mouseover = (d) => {
    tooltip.transition().duration(200).style('opacity', 0.9);
    const html = `<span>${d}</span>`;
    tooltip.html(html)
      .style('left', `${d3.event.layerX}px`)
      .style('top', `${(d3.event.layerY - 10)}px`);
  };

  const mouseout = (d) => {
    console.log(`Leaving ${d.name}`);
    tooltip.transition().duration(500).style('opacity', 0);
  };

  header.select('.header > h1')
    .text('Solar Correlation Map');

  const SolarSystemGroup = chart.append('g')
    .attr('class', 'solar-system');

  const sun = SolarSystemGroup.append('g')
    .datum('sun')
    .attr('class', 'sun');

  const orbitsGroup = SolarSystemGroup.append('g')
    .attr('class', 'orbits');

  const drawPlanetarySystem = (dSystem, iSystem, systemSelection, iOrbit) => {
    systemSelection.append('circle')
      .datum(dSystem)
      .attr('class', 'planet')
      .attr('cx', d => getX(d.planet.orbit, iOrbit))
      .attr('cy', d => getY(d.planet.orbit, iOrbit))
      .attr('r', planetRadiusPx)
      .style('fill', d => zScale(d.planet.name))
      .on('mouseover', d => console.log(`Planet ${d.planet.name} (moons: ${d.moons})`));

    systemSelection.selectAll('.moon')
      .data(dSystem.moons)
      .enter()
      .append('circle')
      .attr('class', 'moon')
      .attr('cx', d => getX(d.orbit, iOrbit, false))
      .attr('cy', d => getY(d.orbit, iOrbit, false))
      .attr('r', moonRadiusPx)
      .style('fill', d => zScale(d.name))
      .on('mouseover', d => console.log(`Moon ${d.name}`));
  };

  const drawOrbit = (dOrbit, iOrbit, orbitSelection) => {
    const orbitGroup = orbitSelection
      .append('g')
      .attr('class', 'trajectory');

    orbitGroup.append('circle')
      .datum(dOrbit.orbit)
      .attr('cx', coords.width / 2)
      .attr('cy', coords.height / 2)
      .attr('r', d => orbitScale(d))
      .style('stroke', d => zScale(d))
      .on('mouseover', d => console.log(`Orbit ${d}`));

    const systems = orbitSelection.selectAll('.planetary-system')
      .data(dOrbit.systems)
      .enter()
      .append('g')
      .attr('class', 'planetary-system');

    systems.each((dSystem, iSystem, gSystems) => {
      const systemSelection = d3.select(gSystems[iSystem]);
      return drawPlanetarySystem(dSystem, iSystem, systemSelection, iOrbit);
    });
  };

  // TODO: now data are all the orbits (10)
  const draw = (data) => {
    sun
      .append('circle')
      .attr('cx', coords.width / 2)
      .attr('cy', coords.height / 2)
      .attr('r', sunRadiusPx)
      .on('mouseover', mouseover)
      .on('mouseout', mouseout);

    const orbits = orbitsGroup.selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'orbit');

    orbits.each((dOrbit, iOrbit, gOrbits) => {
      const orbitSelection = d3.select(gOrbits[iOrbit]);
      return drawOrbit(dOrbit, iOrbit, orbitSelection);
    });
  };

  d3.csv('../data/jedi.csv', (error, data) => {
    if (error) throw error;
    //  iSun = 0; // sun is the output variable. TODO: replace 0 with input
    const orbits = defineOrbits(data, 0);
    draw(orbits);
  });
}
