import { select, selectAll } from 'd3-selection';
// d3.event must be a live binding. See: https://stackoverflow.com/a/40048292
// I have no idea why, but d3Event works fine with planets and moons, but not with the sun
// import { event as d3Event } from 'd3-selection';
import { min, extent, range, descending } from 'd3-array';
import { format } from 'd3-format';
import { scaleLinear, scaleOrdinal, scaleThreshold, schemeCategory20 } from 'd3-scale';
import * as request from 'd3-request'; // submodule (contains d3.csv, d3.json)

// create a d3 object with only the subset of functions that we need
const d3 = Object.assign({},
  { select,
    selectAll,
    min,
    extent,
    range,
    descending,
    format,
    scaleLinear,
    scaleOrdinal,
    scaleThreshold,
    schemeCategory20,
  }, request);
import * as correlation from 'node-correlation';
import { createComponent } from './layout_manager';
import '../sass/main.sass';
import '../sass/solar-correlation.sass';

{
  const corrToOrbit = d => Math.floor(Math.abs(d) * 10) / 10;
  // Nearest and furthest orbits from the sun.
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
    const variables = data.columns;
    const targetVar = variables[iSun];
    const targetValues = data.map(d => +d[targetVar]); // string -> number
    const inputVars = variables.filter(v => v !== targetVar);

    const objects = inputVars.map((variable) => {
      // string -> number and filter out non-numeric variables
      const values = data.map(d => +d[variable]).filter(d => !Number.isNaN(d));
      const valuesCleaned = values.filter(d => !isNaN(d));
      const targetValuesCleaned = targetValues.filter(d => !isNaN(d));
      const length = d3.min([valuesCleaned.length, targetValuesCleaned.length]);
      const corr = correlation.calc(valuesCleaned.slice(0, length), targetValuesCleaned.slice(0, length));

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

  const margin = { top: 10, right: 50, bottom: 30, left: 50 };
  const solarCorrelationViz = createComponent('#solar-correlation', 1200, 800, margin);
  const chart = solarCorrelationViz.chart;
  const coords = solarCorrelationViz.coords;
  const header = solarCorrelationViz.header;
  const footer = solarCorrelationViz.footer;
  const tooltip = solarCorrelationViz.tooltip;

  const zScale = d3.scaleOrdinal(d3.schemeCategory20);
  // Note: for threshold scales, pick N values for the input domain, and N + 1
  // colors for the output range. The colors were chosen with color brewer 2.0
  // http://colorbrewer2.org/#type=diverging&scheme=RdYlGn&n=8
  const correlationColorScale = d3.scaleThreshold()
    .domain([-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75])
    .range(['#d73027', '#f46d43', '#fdae61', '#fee08b', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850']);

  const safetyMarginPx = 10;
  const furthestOrbitRadiusPx = (d3.min([coords.width, coords.height]) / 2) - safetyMarginPx;
  const nearestOrbitRadiusPx = furthestOrbitRadiusPx / orbitLevels.length;
  const sunRadiusPx = nearestOrbitRadiusPx * 0.5;
  const planetRadiusPx = nearestOrbitRadiusPx * 0.4;
  const moonRadiusPx = nearestOrbitRadiusPx * 0.2;

  const orbitScale = d3.scaleLinear()
    .domain(d3.extent(orbitLevels))
    .range([furthestOrbitRadiusPx, nearestOrbitRadiusPx]);

  const angles = d3.range(0, 330 + 1, 30); // degrees

  const getPlanetPosX = (orbit, i) => {
    const xOriginPx = coords.width / 2;
    const iAngle = i % angles.length;
    const angleDeg = -angles[iAngle];
    const angleRadians = angleDeg * (Math.PI / 180);
    const xPx = orbitScale(orbit) * Math.cos(angleRadians);
    return xOriginPx + xPx;
  };

  const getPlanetPosY = (orbit, i) => {
    const yOriginPx = coords.height / 2;
    const iAngle = i % angles.length;
    const angleDeg = -angles[iAngle];
    const angleRadians = angleDeg * (Math.PI / 180);
    const yPx = orbitScale(orbit) * Math.sin(angleRadians);
    return yOriginPx + yPx;
  };

  const getMoonPosX = (orbit, iOrbit, i) => {
    const xOriginPx = getPlanetPosX(orbit, iOrbit);
    const iAngle = i % angles.length;
    const angleDeg = -angles[iAngle];
    const angleRadians = angleDeg * (Math.PI / 180);
    const xPx = (planetRadiusPx + moonRadiusPx) * Math.cos(angleRadians);
    return xOriginPx + xPx;
  };

  const getMoonPosY = (orbit, iOrbit, i) => {
    const yOriginPx = getPlanetPosY(orbit, iOrbit);
    const iAngle = i % angles.length;
    const angleDeg = -angles[iAngle];
    const angleRadians = angleDeg * (Math.PI / 180);
    const yPx = (planetRadiusPx + moonRadiusPx) * Math.sin(angleRadians);
    return yOriginPx + yPx;
  };

  // TODO: when hovering on a planet, all moons should be listed and the orbit
  // should be highlighted.
  const mouseover = (d) => {
    tooltip.transition().duration(200).style('opacity', 0.9);
    let html = '';
    if (d.corrWithTarget) {
      const style = `"color: ${correlationColorScale(d.corrWithTarget)};"`;
      html = `<span style=${style}>${d.name} (${d3.format('.2f')(d.corrWithTarget)})</span>`;
    } else {
      html = `<span>${d.name}</span>`;
    }

    d3.selectAll('.orbit__trajectory, .orbit__label')
      .filter(traj => traj === d.orbit)
      .classed('orbit--highlighted', true);

    tooltip.html(html)
      .style('left', `${event.layerX}px`)
      .style('top', `${(event.layerY - 10)}px`);
  };

  const mouseout = (d) => {
    // console.log(`Leaving ${d.name}`);

    d3.selectAll('.orbit__trajectory, .orbit__label')
      .filter(traj => traj === d.orbit)
      .classed('orbit--highlighted', false);

    tooltip.transition().duration(500).style('opacity', 0);
  };

  header.select('.header > h1')
    .text('Solar Correlation Map');

  const SolarSystemGroup = chart.append('g')
    .attr('class', 'solar-system');

  const orbitsGroup = SolarSystemGroup.append('g')
    .attr('class', 'orbits');

  const drawPlanetarySystem = (dSystem, iSystem, systemSelection, iOrbit) => {
    // TODO: add text label to planet and moons
    // TODO: the position of the planet should depend on: iOrbit, iSystem
    systemSelection.append('circle')
      .datum(dSystem.planet)
      .attr('class', 'planet')
      .attr('cx', d => getPlanetPosX(d.orbit, iOrbit))
      .attr('cy', d => getPlanetPosY(d.orbit, iOrbit))
      .attr('r', planetRadiusPx)
      .style('fill', d => correlationColorScale(d.corrWithTarget))
      .on('mouseover', mouseover)
      .on('mouseout', mouseout);

    // TODO: the position of the moon should depend on: iOrbit, iSystem, iMoon
    systemSelection.selectAll('.moon')
      .data(dSystem.moons)
      .enter()
      .append('circle')
      .attr('class', 'moon')
      .attr('cx', (d, i) => getMoonPosX(d.orbit, iOrbit, i))
      .attr('cy', (d, i) => getMoonPosY(d.orbit, iOrbit, i))
      .attr('r', moonRadiusPx)
      .style('fill', d => zScale(d.name))
      .on('mouseover', mouseover)
      .on('mouseout', mouseout);
  };

  const drawOrbit = (dOrbit, iOrbit, orbitSelection) => {
    const orbitGroup = orbitSelection
      .append('g');

    orbitGroup.append('circle')
      .datum(dOrbit.orbit)
      .attr('cx', coords.width / 2)
      .attr('cy', coords.height / 2)
      .attr('r', d => orbitScale(d))
      .attr('class', 'orbit__trajectory');
      // .on('mouseover', d => console.log(`Orbit ${d}`));
    
    orbitGroup.append('text')
      .datum(dOrbit.orbit)
      .attr('x', coords.width / 2)
      // .attr('y', getPlanetPosY(dOrbit.orbit, 0))
      .attr('y', (coords.height / 2) - orbitScale(dOrbit.orbit))
      .text(dOrbit.orbit)
      .attr('class', 'orbit__label');

    const systems = orbitSelection.selectAll('.orbit__planetary-system')
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

  // TODO: now data are all the orbits (10)
  const drawAllOrbits = (data) => {
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

  // jedi.csv found here: https://github.com/Zapf-Consulting/solar-correlation-map/blob/master/jedi.csv
  d3.csv('../data/jedi.csv', (error, data) => {
  // mpg.csv found here: https://gist.github.com/omarish/5687264
  // d3.csv('../data/mpg.csv', (error, data) => {
    if (error) throw error;
    // TODO: clean data before drawing anything: remove all NaN values
    const iSun = 0; // sun is the output variable
    drawSun(data, iSun);
    const orbitsData = defineOrbits(data, iSun);
    drawAllOrbits(orbitsData);
  });
}
