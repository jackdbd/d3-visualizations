const { lstatSync, readdirSync } = require('fs');
const { basename, join, resolve } = require('path');
const R = require('ramda');
const S = require('sanctuary');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractCssChunks = require('extract-css-chunks-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PacktrackerPlugin = require('@packtracker/webpack-plugin');

const paths = require('./paths');

// The HTML code for all visualizations is contained in this directory
const VIZ_HTML_ROOT = resolve(__dirname, 'src', 'templates');

const isHTMLPage = fileName => fileName.endsWith('.html');

const getPages = rootDir => {
  const files = readdirSync(rootDir);
  const pages = S.filter(isHTMLPage)(files);
  // const pages = R.filter(isHTMLPage, files);
  return pages;
};

// The JS code for all visualizations is contained in this directory
const VIZ_JS_ROOT = join(__dirname, 'src', 'js');

const isDirectory = source => lstatSync(source).isDirectory();
const getFullPath = filename => join(VIZ_JS_ROOT, filename);

const getDirectories = rootDir => {
  const files = readdirSync(rootDir);
  const pipe = S.pipe([S.map(getFullPath), S.filter(isDirectory)]);
  const directories = pipe(files);
  // const directories = R.pipe(
  //   R.map(getFullPath),
  //   R.filter(isDirectory)
  // )(files);
  return directories;
};

// Each visualization has its own directory and it contains an index.js file
const vizDirectories = getDirectories(VIZ_JS_ROOT);

const makeEntry = (fullPathToDir, _) => ({
  [basename(fullPathToDir)]: join(fullPathToDir, 'index.js'),
});

const vizEntries = S.map(makeEntry)(vizDirectories);
// const vizEntries = R.map(makeEntry, vizDirectories);

const initialEntry = {
  index: join(VIZ_JS_ROOT, 'index.js'),
  about: join(VIZ_JS_ROOT, 'about.ts'),
};

const entry = R.reduce(Object.assign, initialEntry, vizEntries);

const rules = [
  // rule for .js/.jsx files
  {
    test: /\.(jsx?)$/,
    include: [join(__dirname, 'js', 'src')],
    exclude: [join(__dirname, 'node_modules')],
    use: {
      loader: 'babel-loader',
    },
  },
  // rule for standard (global) CSS files
  {
    test: /\.css$/,
    include: [join(__dirname, 'src', 'css')],
    use: [ExtractCssChunks.loader, 'css-loader'],
  },
  // rule for CSS modules
  {
    test: /\.module\.css$/,
    include: [join(__dirname, 'src', 'js')],
    loaders: [
      ExtractCssChunks.loader,
      {
        loader: 'css-loader',
        options: {
          localIdentName: '[path]__[name]__[local]--[hash:base64:5]',
          modules: true,
        },
      },
    ],
  },
  // rule for .woff2 font files
  {
    test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    use: 'url-loader',
  },
  // rule for .ttf/.eot/.svg files
  {
    test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    use: {
      loader: 'file-loader',
      options: {
        name: './fonts/[name].[ext]',
      },
    },
  },
  // rule for images (add svg? How to distinguish a svg font from a svg image?)
  {
    test: /\.(gif|jpe?g|png)$/i,
    include: join(__dirname, 'src', 'images'),
    loaders: [
      'file-loader',
      {
        loader: 'image-webpack-loader',
        options: {
          mozjpeg: {
            progressive: true,
            quality: 65,
          },
          // optipng.enabled: false will disable optipng
          optipng: {
            enabled: false,
          },
          pngquant: {
            quality: '65-90',
            speed: 4,
          },
          gifsicle: {
            interlaced: false,
          },
          // the webp option will enable WEBP
          webp: {
            quality: 75,
          },
        },
      },
    ],
  },
];

module.exports = mode => {
  const PUBLIC_URL = mode === 'production' ? paths.publicUrl : '';

  const pages = getPages(VIZ_HTML_ROOT);

  const plugins = [
    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled',
      generateStatsFile: true,
      statsFilename: 'stats.json',
    }),
    new CleanWebpackPlugin(['build'], {
      root: __dirname,
      exclude: ['favicon.ico', 'Transparent.gif'],
      verbose: true,
    }),
    new FaviconsWebpackPlugin({
      inject: true,
      logo: join(__dirname, 'src', 'images', 'logo.png'),
      title: 'd3-visualizations',
    }),
    new PacktrackerPlugin({
      branch: process.env.TRAVIS_BRANCH, // https://docs.packtracker.io/faq#why-cant-the-plugin-determine-my-branch-name
      fail_build: true,
      project_token: '00c60136-3fba-4ebc-8675-8c5fcb870228',
      upload: process.env.CI === 'true', // upload stats.json only in CI
    }),
    new ExtractCssChunks({
      chunkFilename: '[id].css',
      cssModules: true,
      filename: '[name].css',
      orderWarning: true,
      reloadAll: true,
    }),
    ...pages.map(filename => {
      const name = filename.split('.')[0];
      const htmlPlugin = new HtmlWebpackPlugin({
        chunks: [name],
        filename,
        hash: false,
        template: join(__dirname, 'src', 'templates', filename),
        templateParameters: {
          PUBLIC_URL,
        },
      });
      return htmlPlugin;
    }),
  ];

  const config = {
    entry,
    module: {
      rules,
    },
    output: {
      filename: '[name].[hash].js',
      path: resolve(__dirname, 'build'),
      sourceMapFilename: '[file].map',
    },
    plugins,
    target: 'web',
  };
  return config;
};
