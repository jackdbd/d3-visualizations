import * as d3 from 'd3';

require('../sass/main.sass');
// require font-awesome-sass-loader here or add it to the entry points in webpack.config.js
// require('font-awesome-sass-loader');

d3.select('body').insert('p', ':first-child').html(`D3 version: ${d3.version}`);

{
  const rowFunction = (d) => {
    const obj = {
      letter: d.letter,
      frequency: +d.frequency,
    };
    return obj;
  };

  const draw = (letterFrequencies) => {
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const xScale = d3.scaleBand()
      .range([0, width])
      .round(true)
      .paddingInner(0.1); // space between bars (it's a ratio)

    const yScale = d3.scaleLinear()
      .range([height, 0]);

    const xAxis = d3.axisBottom()
      .scale(xScale);

    const yAxis = d3.axisLeft()
      .scale(yScale)
      .ticks(10, '%');

    const svg = d3.selectAll('.barchart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.right})`);

    const tooltip = d3.selectAll('.barchart').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    xScale
      .domain(letterFrequencies.map(d => d.letter));
    yScale
      .domain([0, d3.max(letterFrequencies, d => d.frequency)]);

    svg.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);

    svg.append('g')
      .attr('class', 'axis axis--y')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Frequency');

    svg.selectAll('.bar').data(letterFrequencies)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.letter))
      .attr('width', xScale.bandwidth())
      .attr('y', d => yScale(d.frequency))
      .attr('height', d => height - yScale(d.frequency))
      .on('mouseover', (d) => {
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip.html(`Frequency: <span>${d.frequency}</span>`)
          .style('left', `${d3.event.layerX}px`)
          .style('top', `${(d3.event.layerY - 28)}px`);
      })
      .on('mouseout', () => tooltip.transition().duration(500).style('opacity', 0));
  };

  d3.tsv('./data/bardata.tsv', rowFunction, (error, data) => {
    if (error) throw error;
    draw(data);
  });
}

// -------------------------------------------------------------------------- //

{
  const rowFunction = (d) => {
    const obj = {
      date: d.date,
      close: +d.close,
    };
    return obj;
  };

  const draw = (stocks) => {
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const parseTime = d3.timeParse('%d-%b-%y');
    const bisectDate = d3.bisector(d => parseTime(d.date)).left;
    const formatCurrency = d3.format('($.2f');

    const xScale = d3.scaleTime()
      .range([0, width])
      .domain(d3.extent(stocks, d => parseTime(d.date))); // or, in alternative
      // .domain([new Date(parseTime(stocks[0].date)),
      //   new Date(parseTime(stocks[stocks.length - 1].date))]);

    const yScale = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(stocks, d => d.close)]);

    const line = d3.line()
      .x(d => xScale(parseTime(d.date)))
      .y(d => yScale(d.close));

    const xAxis = d3.axisBottom()
      .scale(xScale);

    const yAxis = d3.axisLeft()
      .scale(yScale);

    const svg = d3.selectAll('.linechart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const linepath = svg.append('g');

    const tooltip = d3.selectAll('.linechart').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    const focus = svg.append('g')
      .style('display', 'none');

    svg.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    svg.append('g')
      .attr('class', 'axis axis--y')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Price ($)');

    linepath.append('path')
      .attr('class', 'line')
      .attr('d', line(stocks));

    focus.append('circle')
      .attr('class', 'y')
      .style('fill', 'none')
      .style('stroke', 'blue')
      .attr('r', 4);

    const mousemove = () => {
      const coordX = d3.event.layerX;
      const date0 = xScale.invert(coordX);
      const i = bisectDate(stocks, date0, 1);
      const d0 = stocks[i - 1];
      let d1 = stocks[i];
      if (!d1) {
        d1 = stocks[i - 1];
      }
      let d = null;
      if ((date0 - parseTime(d0.date)) > (parseTime(d1.date) - date0)) {
        d = d1;
      } else {
        d = d0;
      }
      focus.select('circle.y')
        .attr('transform', `translate(${coordX}, ${yScale(d.close)})`);
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip.html(`${d.date}<br/>Close: <span>${formatCurrency(d.close)}</span>`)
        .style('left', `${d3.event.layerX}px`)
        .style('top', `${(d3.event.layerY - 28)}px`);
    };

    // append a rect element to capture mouse events
    svg.append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', () => focus.style('display', null))
      .on('mouseout', () => focus.style('display', 'none'))
      .on('mousemove', mousemove);
  };

  d3.tsv('./data/linedata.tsv', rowFunction, (error, data) => {
    if (error) throw error;
    draw(data);
  });
}

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
