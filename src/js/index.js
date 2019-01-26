import { select } from 'd3-selection';
import { version } from 'd3/package.json';
import '../css/main.css';

import(/* webpackChunkName: "About" */ /* webpackPrefetch: true */ './about.ts').then(
  module => {
    console.log('prefetch module', module);
  }
);
import(/* webpackChunkName: "Linechart" */ /* webpackPrefetch: true */ './linechart/index.js').then(
  module => {
    console.log('prefetch module', module);
  }
);
import(/* webpackChunkName: "Barchart" */ /* webpackPrefetch: true */ './barchart/index.js').then(
  module => {
    console.log('prefetch module', module);
  }
);

import(/* webpackChunkName: "Dolphins" */ /* webpackPrefetch: true */ './dolphins/index.js').then(
  module => {
    console.log('prefetch module', module);
  }
);

import(/* webpackChunkName: "Flags" */ /* webpackPrefetch: true */ './flags/index.js').then(
  module => {
    console.log('prefetch module', module);
  }
);

import(/* webpackChunkName: "Scatterplot" */ /* webpackPrefetch: true */ './scatterplot/index.js').then(
  module => {
    console.log('prefetch module', module);
  }
);

import(/* webpackChunkName: "Geomap" */ /* webpackPrefetch: true */ './geomap/index.js').then(
  module => {
    console.log('prefetch module', module);
  }
);

import(/* webpackChunkName: "Heatmap" */ /* webpackPrefetch: true */ './heatmap/index.js').then(
  module => {
    console.log('prefetch module', module);
  }
);

import(/* webpackChunkName: "Challenge" */ /* webpackPrefetch: true */ './challenge/index.js').then(
  module => {
    console.log('prefetch module', module);
  }
);

import(/* webpackChunkName: "SolarCorrelation" */ /* webpackPrefetch: true */ './solar-correlation/index.js').then(
  module => {
    console.log('prefetch module', module);
  }
);

import(/* webpackChunkName: "Horizon" */ /* webpackPrefetch: true */ './horizon/index.js').then(
  module => {
    console.log('prefetch module', module.default);
  }
);

select('footer')
  .insert('p', ':last-child')
  .classed('footer', true)
  .html(`D3 version: ${version}`);
