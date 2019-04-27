import '../css/main.css';

let VISUALIZATIONS;
console.warn('VISUALIZATIONS', VISUALIZATIONS);

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

const swapLowWithHigh = (cardImg) => {
  const hiResImgUrl = cardImg.getAttribute('data-image-full');
  // console.warn('image_url', hires_img_url);
  const contentImg = cardImg.querySelector('img');
  contentImg.src = hiResImgUrl;

  const listener = () => {
    // eslint-disable-next-line no-param-reassign
    cardImg.style.backgroundImage = `url(${hiResImgUrl})`;

    const cn = cardImg.className;

    // eslint-disable-next-line no-param-reassign
    cardImg.className = `${cn} ${cn}--is-loaded`;
  };

  contentImg.addEventListener('load', listener);
};

const lazyLoad = () => {
  const cardImages = document.querySelectorAll('.grid__card__image');
  cardImages.forEach(swapLowWithHigh);
};

window.addEventListener('load', () => {
  lazyLoad();
});
