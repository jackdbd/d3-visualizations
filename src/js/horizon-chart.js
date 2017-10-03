import * as d3Base from 'd3';
import { horizonChart } from 'd3-horizon-chart';
import '../sass/main.sass';
import '../sass/horizon-chart.sass';

// create a d3 Object that includes the d3 library and additional plugins
const d3 = Object.assign(d3Base, { horizonChart });

const drawHorizonChart = (dStock, iStock, nodes) => {
  const thisDiv = nodes[iStock];  // it's a DOM element, NOT a d3 selection
  d3.horizonChart()
    .height(100)
    .title(dStock.name)
    // http://colorbrewer2.org/#type=sequential&scheme=Greens&n=5
    .colors(['#edf8e9','#bae4b3','#74c476','#31a354','#006d2c'])
    .call(thisDiv, dStock.values);
};

const draw = (error, stocks) => {
  if (error) throw error;
  console.log(stocks);
  const horizons = d3.selectAll('.horizon-chart').selectAll('.horizon')
    .data(stocks)
    .enter()
    .append('div')
    .attr('class', 'horizon')
    .each(drawHorizonChart);
    // Alternative: the arrow function will NOT work here though...
    // .each(function (stock) {
    //   d3.horizonChart()
    //     .title(stock.name)
    //     .call(this, stock.values)
    // });
};

const rowFunction = (d) => {
  return [d3.timeParse(d.Date), +d.Open];
};

const loadStockData = (stock, callback) => {
  const csvFile = `https://bost.ocks.org/mike/cubism/intro/stocks/${stock}.csv`;
  d3.csv(csvFile, rowFunction, (error, data) => {
    if (error) throw error;
    const rows = data.filter(d => d[1]).reverse();
    const date = rows[0][0];
    const compare = rows[400][1];
    let value = rows[0][1];
    const values = [];
    rows.forEach((d, i) => {
      values.push(value = (d[1] - compare) / compare);
    });
    const err = null;
    const obj = {
      name: stock,
      values,
    };
    callback(err, obj);
  });
};

const queue = d3.queue();
const stocks = ['AAPL', 'BIDU', 'SINA', 'GOOG', 'MSFT', 'YHOO'];
stocks.forEach((stock) => {
  queue.defer(loadStockData, stock);
});
queue.awaitAll(draw);
