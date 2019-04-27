import { extent, max, merge } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { DSVParsedArray, DSVRowString } from 'd3-dsv';
import { tsv } from 'd3-fetch';
import { scaleLinear, scaleTime } from 'd3-scale';
import { mouse, select } from 'd3-selection';
import { line } from 'd3-shape';
import { timeParse } from 'd3-time-format';
import { voronoi, VoronoiSite } from 'd3-voronoi';
import { encaseP, ResolveFunction } from 'fluture';

// When using CSS modules with Typescript, we have to create a .d.ts file for
// each CSS module, otherwise ES6 import syntax won't work. Since it's tedious,
// I just require the CSS module.
// https://medium.com/@sapegin/css-modules-with-typescript-and-webpack-6b221ebe5f10

// tslint:disable-next-line:no-var-requires
const styles = require('./multi-line-chart.module.css');

// Unfortunately this TSV file is not really tidy data.

interface ICityDatum {
  city: string;
  date: Date;
  value: number;
}

interface IParsedDatum {
  city: string;
  monthKeys: string[];
  months: Date[];
  values: ICityDatum[];
}

interface ICityDatumWithIndex extends ICityDatum {
  cityIndex: number;
}

const margin = {
  bottom: 40,
  left: 50,
  right: 20,
  top: 20,
};

/**
 * Create the DOM nodes used in this viz, and return D3's selections and scales.
 */
const prepareDOM = (selector: string) => {
  // outer svg dimensions
  const width = 600;
  const height = 400;

  const container = select(selector);

  const svg = container
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  const chart = svg
    .append('g')
    .attr('class', styles.viz)
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const xScale = scaleTime().range([0, width]);

  const yScale = scaleLinear().range([height, 0]);

  const axisX = chart
    .append('g')
    .attr('class', `${styles.axis} ${styles['axis--x']}`)
    .attr('transform', `translate(0, ${height})`);

  const axisY = chart
    .append('g')
    .attr('class', `${styles.axis} ${styles['axis--y']}`);

  const cities = chart.append('g').attr('class', styles.cities);

  const focus = chart
    .append('g')
    .attr('transform', 'translate(-100,-100)')
    .attr('class', styles.focus);

  focus.append('circle').attr('r', 3.5);

  focus.append('text').attr('y', -10);

  const voronoiGroup = chart.append('g').attr('class', styles.voronoi);

  const input = container
    .append('label')
    .attr('class', styles.label)
    .attr('for', 'show-voronoi')
    .text('Show Voronoi')
    .append('input')
    .attr('type', 'checkbox')
    .attr('id', 'show-voronoi');

  // toggle the checkbox to show/hide the Voronoi diagram
  input.on('change', function () {
    voronoiGroup.classed(styles['voronoi--show'], this.checked);
  });

  const scales = {
    x: xScale,
    y: yScale,
  };

  const selections = {
    axisX,
    axisY,
    chart,
    cities,
    focus,
    svg,
    voronoiGroup,
  };

  return {
    scales,
    selections,
  };
};

/**
 * Parse a row of the TSV file (data wrangling here could be improved).
 */
const init = (r: DSVRowString<string>, iRow: number, columns: string[]) => {
  const monthKeys = columns.slice(1);
  const months = monthKeys.map(timeParse('%Y-%m')) as Date[];
  const city = r.name!.replace(/ (msa|necta div|met necta|met div)$/i, '');

  const makeCityData = (k: string, i: number) => {
    const rawValue = r[k] as string;
    const value = parseFloat(rawValue) / 100;
    return {
      city,
      date: months[i],
      value,
    };
  };

  const values = monthKeys.map(makeCityData);

  const o = {
    city,
    monthKeys,
    months,
    values,
  };

  return o;
};

export const fn = async (selector: string, url: string) => {
  const { scales, selections } = prepareDOM(selector);

  const draw: ResolveFunction<DSVParsedArray<IParsedDatum>> = rows => {
    // console.log(' --- ALL DATA --- ', rows);

    // All data rows should contain the same months (I am not 100% sure though)
    const extrema = extent(rows[0].months) as [Date, Date];
    // D3's scales are mutable (while D3's selections are immutable)
    // https://github.com/d3/d3-scale/issues/121
    scales.x.domain(extrema);

    const accessorY = (d: IParsedDatum) => {
      const innerAccessor = (datum: ICityDatum) => datum.value;
      return max(d.values, innerAccessor);
    };

    const maxY = max(rows, accessorY) as number;
    scales.y.domain([0, maxY]).nice();

    const { axisX, axisY, chart, cities, focus, voronoiGroup } = selections;

    axisX.call(axisBottom(scales.x));

    axisY
      .call(axisLeft(scales.y).ticks(10, '%'))
      .append('text')
      .attr('x', 4)
      .attr('y', 0.5)
      .attr('dy', '0.32em')
      .style('text-anchor', 'start')
      .style('fill', '#000')
      .style('font-weight', 'bold')
      .text('Unemployment Rate');

    const makeCity = (d: IParsedDatum, i: number) => {
      const city = d.values.map(cityDatum => {
        return {
          city: cityDatum.city,
          cityIndex: i,
          date: cityDatum.date,
          value: cityDatum.value,
        };
      });
      return city;
    };
    const cityData = rows.map(makeCity);
    const mergedData = merge<ICityDatumWithIndex>(cityData);

    const lineGenerator = line<ICityDatumWithIndex>()
      .x(d => scales.x(d.date))
      .y(d => scales.y(d.value));

    cities
      .selectAll('path')
      .data(cityData)
      .enter()
      .append('path')
      .attr('class', styles.city)
      .attr('d', d => {
        const lineData = d.map(datum => {
          return {
            city: datum.city,
            cityIndex: datum.cityIndex,
            date: datum.date,
            value: datum.value,
          };
        });
        const dPath = lineGenerator(lineData);
        return dPath;
      });

    const node = selections.svg.node() as SVGElement;

    const voronoiExtent = [
      [-margin.left, -margin.top],
      [node.clientWidth + margin.right, node.clientHeight + margin.bottom],
    ] as [[number, number], [number, number]];

    const voronoiLayout = voronoi<ICityDatumWithIndex>()
      .x(d => scales.x(d.date))
      .y(d => scales.y(d.value))
      .extent(voronoiExtent);

    const voronoiDiagram = voronoiLayout(mergedData);

    const polygons = voronoiDiagram.polygons();

    voronoiGroup
      .selectAll('path')
      .data(polygons)
      .enter()
      .append('path')
      .attr('d', d => {
        const pathD = d ? `M${d.join('L')}Z` : null;
        return pathD;
      });

    type Site = VoronoiSite<ICityDatumWithIndex> | null;
    let site: Site = null;
    const RADIUS = 25;

    /**
     * Handle mouseover on a Voronoi site.
     *
     * We don't attach this function to a SVG element as an event listener.
     * We simply call it in the mouseover event handler.
     */
    const mouseover = (d: Site) => {
      // console.log('mouseover', d);
      if (d) {
        const x = scales.x(d.data.date);
        const y = scales.y(d.data.value);
        const i = d.data.cityIndex;
        const sel = `.${styles.city}:nth-child(${i + 1})`;
        select(sel).classed(styles['city--hover'], true);
        focus.attr('transform', `translate(${x},${y})`);
        focus.select('text').text(d.data.city);
      }
    };

    /**
     * Handle mouseout on a Voronoi site.
     *
     * We don't attach this function to a SVG element as an event listener.
     * We simply call it in the mouseover event handler.
     */
    const mouseout = (d: Site) => {
      // console.log('mouseout', d);
      if (d) {
        const i = d.data.cityIndex;
        const sel = `.${styles.city}:nth-child(${i + 1})`;
        select(sel).classed(styles['city--hover'], false);
        focus.attr('transform', 'translate(-100,-100)');
      }
    };

    /**
     * Handle mouseover on the entire chart.
     *
     * There is no data binding for the `chart`, which is a SVG `<g>` element.
     * This means that in the event handler `d` is `undefined`, `i` is `0`, and
     * nodes is `[g]`.
     * We also avoid using an arrow function because we want `this` to be the
     * `<g>` element.
     */
    chart.on('mousemove', function () {
      const [x, y] = mouse(this);
      const newsite = voronoiDiagram.find(x, y, RADIUS);
      if (newsite !== site) {
        if (site) {
          mouseout(site);
        }
        site = newsite;
        if (site) {
          mouseover(site);
        }
      }
    });

    // console.log('--- VORONOI ---', voronoiLayout, voronoiDiagram, polygons);
  };

  // convert a promise-returning function to a future-returning function
  const tsvf = encaseP(() => tsv(url, init));

  tsvf(url).fork(console.error, draw);
};
