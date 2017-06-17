import * as d3 from 'd3';

require('../sass/main.sass');

d3.select('footer').insert('p', ':last-child').html(`D3 version: ${d3.version}`);
