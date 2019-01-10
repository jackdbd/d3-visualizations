import { select } from 'd3-selection';
import { version } from 'd3/package.json';
import '../css/main.css';

select('footer')
  .insert('p', ':last-child')
  .classed('footer', true)
  .html(`D3 version: ${version}`);
