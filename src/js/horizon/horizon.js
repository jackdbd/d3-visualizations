import * as d3Base from 'd3';
import { horizonChart } from 'd3-horizon-chart';
import { displayError } from '../utils';
import './horizon.module.css';

// create a d3 Object that includes the d3 library and additional plugins
const d3 = Object.assign(d3Base, { horizonChart });

const drawHorizonChart = (dStock, iStock, nodes) => {
  const thisDiv = nodes[iStock]; // it's a DOM element, NOT a d3 selection
  d3.horizonChart()
    .height(100)
    .title(dStock.name)
    // http://colorbrewer2.org/#type=sequential&scheme=Greens&n=5
    .colors(['#edf8e9', '#bae4b3', '#74c476', '#31a354', '#006d2c'])
    .call(thisDiv, dStock.values);
};

const draw = (selector, stocks) => {
  d3.selectAll(selector)
    .selectAll('.horizon')
    .data(stocks)
    .enter()
    .append('div')
    .attr('class', 'horizon')
    .each(drawHorizonChart);
};

const rowFunction = d => [d3.timeParse(d.Date), +d.Open];

const loadStockData = async stock => {
  const csvFile = `https://bost.ocks.org/mike/cubism/intro/stocks/${stock}.csv`;
  const requestInit = {};
  const promise = d3
    .csv(csvFile, requestInit, rowFunction)
    .catch(error => {
      throw error;
    })
    .then(data => {
      const rows = data.filter(d => d[1]).reverse();
      // const date = rows[0][0];
      const compare = rows[400][1];
      const values = rows.map(d => {
        const value = (d[1] - compare) / compare;
        return value;
      });
      const obj = {
        name: stock,
        values,
      };
      return obj;
    });
  return promise;
};

export const fn = async (selector, stocks) => {
  const promises = stocks.map(stock => loadStockData(stock));
  const promise = Promise.all(promises);
  let datasets;
  try {
    datasets = await promise;
  } catch (err) {
    displayError(selector, 'URL', err);
    return;
  }
  draw(selector, datasets);
};
