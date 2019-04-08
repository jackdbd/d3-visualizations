import '../css/main.css';

// const aboutModule = './about.ts';
// import(/* webpackChunkName: "About" */ /* webpackPrefetch: true */ aboutModule).then(
//   module => {
//     console.log('prefetch module', module);
//   }
// );

// import(/* webpackChunkName: "About" */ /* webpackPrefetch: true */ './about.ts').then(
//   module => {
//     console.log('prefetch module', module);
//   }
// );
// import(/* webpackChunkName: "Linechart" */ /* webpackPrefetch: true */ './linechart/index.js').then(
//   module => {
//     console.log('prefetch module', module);
//   }
// );
// import(/* webpackChunkName: "Barchart" */ /* webpackPrefetch: true */ './barchart/index.js').then(
//   module => {
//     console.log('prefetch module', module);
//   }
// );

// import(/* webpackChunkName: "Dolphins" */ /* webpackPrefetch: true */ './dolphins/index.js').then(
//   module => {
//     console.log('prefetch module', module);
//   }
// );

// import(/* webpackChunkName: "Flags" */ /* webpackPrefetch: true */ './flags/index.js').then(
//   module => {
//     console.log('prefetch module', module);
//   }
// );

// import(/* webpackChunkName: "Scatterplot" */ /* webpackPrefetch: true */ './scatterplot/index.js').then(
//   module => {
//     console.log('prefetch module', module);
//   }
// );

// import(/* webpackChunkName: "Geomap" */ /* webpackPrefetch: true */ './geomap/index.js').then(
//   module => {
//     console.log('prefetch module', module);
//   }
// );

// import(/* webpackChunkName: "Heatmap" */ /* webpackPrefetch: true */ './heatmap/index.js').then(
//   module => {
//     console.log('prefetch module', module);
//   }
// );

// import(/* webpackChunkName: "Challenge" */ /* webpackPrefetch: true */ './challenge/index.js').then(
//   module => {
//     console.log('prefetch module', module);
//   }
// );

// import(/* webpackChunkName: "SolarCorrelation" */ /* webpackPrefetch: true */ './solar-correlation/index.js').then(
//   module => {
//     console.log('prefetch module', module);
//   }
// );

// import(/* webpackChunkName: "Horizon" */ /* webpackPrefetch: true */ './horizon/index.js').then(
//   module => {
//     console.log('prefetch module', module.default);
//   }
// );

const swapLowWithHigh = card_image => {
  const hires_img_url = card_image.getAttribute('data-image-full');
  // console.warn('image_url', hires_img_url);
  const content_image = card_image.querySelector('img');
  content_image.src = hires_img_url;

  const listener = event => {
    card_image.style.backgroundImage = `url(${hires_img_url})`;
    const cn = card_image.className;
    card_image.className = `${cn} ${cn}--is-loaded`;
  };

  content_image.addEventListener('load', listener);
};

const lazyLoad = () => {
  const card_images = document.querySelectorAll('.grid__card__image');
  card_images.forEach(swapLowWithHigh);
};

window.addEventListener('load', () => {
  lazyLoad();
});
