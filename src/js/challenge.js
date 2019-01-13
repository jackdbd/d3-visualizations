import * as d3 from 'd3';
import * as Future from 'fluture';
import { createComponent, displayError } from './utils';
import '../css/challenge.css';

const rowFunction = (d) => {
  /* there is no releationship between the number of books of a given genre,
  and the number of books of other genres (e.g. a single person could buy 1
  Satire book and: 10 Science Fiction books + 2 Drama books, etc...) */
  const genre = d[''];
  const obj = {
    genre,
  };
  const entries = Object.entries(d).filter(e => e[0] !== '');
  let total = 0;
  entries.forEach((e) => {
    const otherGenre = e[0];
    const numBooks = +e[1];
    obj[otherGenre] = numBooks;
    total += numBooks;
  });
  obj.total = total;
  return obj;
};

const zScale = d3.scaleOrdinal(d3.schemeCategory10);

const stackedBarChartViz = createComponent(
  '#dataviz-challenge-stacked-bar-chart',
);
const stackedBarChart = stackedBarChartViz.chart;
const {
  coords, footer, header, tooltip,
} = stackedBarChartViz;

header.select('.header > h1').text('Data Visualization Challenge');

const barChartViz = createComponent('#dataviz-challenge-bar-chart');
const barChart = barChartViz.chart;
// const { [barChart]: chart, [coord1]: coord } = barChartViz;
const coords1 = barChartViz.coords;
const header1 = barChartViz.header;
const footer1 = barChartViz.footer;
const tooltip1 = barChartViz.tooltip;

const barChartXAxis = barChart
  .append('g')
  .attr('class', 'axis axis--x')
  .attr('transform', `translate(0, ${coords1.height})`);

const barChartYAxis = barChart.append('g').attr('class', 'axis axis--y');

let selectedGenre = 'Science fiction'; // it will change dynamically

const updateBarChart = (genreSel, arr) => {
  const mouseover = (d) => {
    const html = `<span>${d.genre}</span><br><span>${d.books}</span>`;
    tooltip
      .html(html)
      .style('left', `${d3.event.layerX}px`)
      .style('top', `${d3.event.layerY - 10}px`);
  };

  const dataset = arr.filter(d => d.genre === genreSel)[0];
  const strHeader = `${dataset.genre}`;
  header1
    .style('background-color', zScale(dataset.genre))
    .select('h1')
    .text(strHeader);

  const spanFigure2 = '<span><strong>Figure 2: </strong><span>';
  const spanGenreTotal = `<span>${dataset[dataset.genre]}<span>`;
  const spanGenre = `<span>${dataset.genre}</span>`;
  const spanTotal = `<span>${dataset.total}<span>`;
  const htmlFooter1 = `${spanFigure2}${spanGenreTotal} <span>customers bought at least 1</span> ${spanGenre}
    <span>book. These customers bought a total of ${spanTotal} books</span>.`;
  footer1.select('p').html(htmlFooter1);

  const entries = Object.entries(dataset).filter(
    e => e[0] !== 'genre' && e[0] !== 'total',
  );
  const arrData = [];
  entries.forEach((e) => {
    const genre = e[0];
    const books = +e[1];
    const obj = {
      genre,
      books,
    };
    arrData.push(obj);
  });
  const data = arrData.sort((a, b) => a.books - b.books);
  const keys1 = data.map(d => d.genre);

  const xScale1 = d3
    .scaleLinear()
    .domain([0, d3.max(data.map(d => d.books))])
    .range([0, coords1.width]);

  const yScale1 = d3
    .scaleBand()
    .domain(keys1)
    .range([coords1.height, 0])
    .round(true)
    .paddingInner(0.2); // space between bars (it's a ratio)

  const xAxis1 = d3.axisBottom().scale(xScale1);

  const yAxis1 = d3.axisLeft().scale(yScale1);

  barChartXAxis.call(xAxis1);

  barChartYAxis.call(yAxis1);

  const rects = barChart.selectAll('rect').data(data);

  // enter + update section (merge is new in D3 v4)
  rects
    .enter()
    .append('rect')
    .merge(rects)
    .attr('x', 0)
    .attr('y', d => yScale1(d.genre))
    .attr('width', d => xScale1(d.books))
    .attr('height', yScale1.bandwidth())
    .style('fill', d => zScale(d.genre))
    .on('mouseover', mouseover)
    .on('mouseout', () => tooltip1
      .transition()
      .duration(500)
      .style('opacity', 0));
};

const draw = (dataset) => {
  // const numBooks = data.map(arr => arr.map(obj => obj.books));
  // const sums = numBooks.map(arr => arr.reduce((acc, n) => acc + n, 0)); // or
  // const sums = numBooks.map(arr => d3.sum(arr)); // less mind bending :-)

  // sort in descending order
  const data = dataset.sort((a, b) => a.total - b.total);
  const keys = data.map(d => d.genre); // this is sorted because data is sorted
  const totals = data.map(d => d.total);
  const overallTotal = d3.sum(totals);
  // const popularBooksGenres = keys.slice(0, 3);
  // const popularTotals = totals.slice(0, 3);
  const spanFigure = '<span><strong>Figure 1: </strong><span>';
  const popularGenres = `
    ${keys[keys.length - 1]} (${totals[totals.length - 1]}),
    ${keys[keys.length - 2]} (${totals[totals.length - 2]}), and 
    ${keys[keys.length - 3]} (${totals[totals.length - 3]}).`;
  const htmlFooter = `<p>${spanFigure}A total of ${overallTotal} were bought. 
    The three most popular genres are: ${popularGenres}</p>`;
  footer.select('p').html(htmlFooter);

  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(totals)])
    .range([0, coords.width]);

  const yScale = d3
    .scaleBand()
    .domain(keys)
    .range([coords.height, 0])
    .round(true)
    .paddingInner(0.2); // space between bars (it's a ratio)

  const xAxis = d3.axisBottom().scale(xScale);

  const yAxis = d3.axisLeft().scale(yScale);

  const mouseover = (d) => {
    tooltip
      .transition()
      .duration(200)
      .style('opacity', 0.9);

    // this is not what I want
    // const genre = d.data.genre;
    // const numBooks = d.data[genre];

    // This is what I want. Is there a simpler way?
    const pxWidth = xScale(d[1]) - xScale(d[0]);
    const num = xScale.invert(pxWidth);
    const entries = Object.entries(d.data).filter(e => e[0] !== 'genre');
    const books = entries.map(e => e[1]);
    const diffs = books.map(x => Math.abs(x - num));
    const index = diffs.indexOf(d3.min(diffs));
    const genre = entries[index][0];
    const numBooks = entries[index][1];
    const html = `<span>${genre}</span><br><span>${numBooks}</span>`;
    tooltip
      .html(html)
      .style('left', `${d3.event.layerX}px`)
      .style('top', `${d3.event.layerY - 10}px`);

    updateBarChart(genre, data);
  };

  stackedBarChart
    .append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', `translate(0, ${coords.height})`)
    .call(xAxis);

  stackedBarChart
    .append('g')
    .attr('class', 'axis axis--y')
    .call(yAxis);

  const stackData = d3.stack().keys(keys)(data);

  const stackLayout = stackedBarChart.append('g').attr('class', 'stackLayout');

  const layers = stackLayout
    .selectAll('g')
    .data(stackData)
    .enter()
    .append('g')
    .attr('class', d => `layer ${d.key}`)
    .style('fill', d => zScale(d.key));

  layers
    .selectAll('rect')
    .data(d => d)
    .enter()
    .append('rect')
    .attr('class', (d, i) => `other-genre ${keys[i]}`)
    .attr('x', d => xScale(d[0]))
    .attr('y', d => yScale(d.data.genre))
    .attr('width', d => xScale(d[1]) - xScale(d[0]))
    .attr('height', yScale.bandwidth())
    .on('mouseover', mouseover)
    .on('mouseout', () => tooltip
      .transition()
      .duration(500)
      .style('opacity', 0));

  const legend = stackedBarChart
    .append('g')
    .attr('class', 'legend')
    .attr('text-anchor', 'end')
    .selectAll('g')
    .data(keys.slice().reverse())
    .enter()
    .append('g')
    .attr('transform', (d, i) => `translate(0,${i * 20 + 40})`);

  legend
    .append('rect')
    .attr('x', coords.width - 19)
    .attr('width', 19)
    .attr('height', 19)
    .attr('fill', zScale);

  legend
    .append('text')
    .attr('x', coords.width - 24)
    .attr('y', 9.5)
    .attr('dy', '0.32em')
    .text(d => d)
    .on('mouseover', (d) => {
      selectedGenre = d;
      updateBarChart(selectedGenre, data);
    });

  stackedBarChart
    .select('.axis--y')
    .selectAll('text')
    .on('mouseover', (d) => {
      selectedGenre = d;
      updateBarChart(selectedGenre, data);
    });

  updateBarChart(selectedGenre, data);
};

const dataUrl = 'https://raw.githubusercontent.com/jackdbd/d3-visualizations/master/src/data/book_genres.tsv';

// create a unary function so it can be used in `.fork`
const displayErrorBounded = displayError.bind(
  this,
  '#dataviz-challenge-stacked-bar-chart',
  dataUrl,
);

const fetchf = Future.encaseP(fetch);

fetchf(dataUrl)
  .chain((res) => {
    const promise = d3.tsv(res.url);
    return Future.tryP(_ => promise);
  })
  .map(rawData => rawData.map(rowFunction))
  .fork(displayErrorBounded, draw);
