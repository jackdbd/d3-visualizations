import * as d3 from 'd3';

require('../sass/main.sass');

d3.select('body').insert('p', ':first-child').html(`D3 version: ${d3.version}`);
