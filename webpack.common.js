const { lstatSync, readdirSync } = require('fs');
const { basename, join, resolve } = require('path');
const S = require('sanctuary');
const webpack = require('webpack');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractCssChunks = require('extract-css-chunks-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PacktrackerPlugin = require('@packtracker/webpack-plugin');

const paths = require('./paths');

// The JS code for all visualizations is contained in this directory
const VIZ_JS_ROOT = join(__dirname, 'src', 'js');

const isDirectory = source => lstatSync(source).isDirectory();
const getFullPath = filename => join(VIZ_JS_ROOT, filename);

const getDirectories = rootDir => {
  const files = readdirSync(rootDir);
  const pipe = S.pipe([S.map(getFullPath), S.filter(isDirectory)]);
  const directories = pipe(files);
  return directories;
};

// Each visualization has its own directory and it contains an index.js file
const vizDirectories = getDirectories(VIZ_JS_ROOT);
const visualizations = S.map(basename)(vizDirectories);

const makeEntry = (fullPathToDir, _) => ({
  [basename(fullPathToDir)]: join(fullPathToDir, 'index.js'),
});

const vizEntries = S.map(makeEntry)(vizDirectories);

const initialEntry = {
  about: join(VIZ_JS_ROOT, 'about.ts'),
  index: join(VIZ_JS_ROOT, 'index.js'),
};

const entry = S.reduce(S.concat)(initialEntry)(vizEntries);

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
  // rule for .ts/.tsx files
  {
    test: /\.tsx?$/,
    exclude: [join(__dirname, 'node_modules')],
    use: {
      loader: 'ts-loader',
      options: {
        transpileOnly: false,
      },
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

  const plugins = [
    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled',
      generateStatsFile: true,
      logLevel: 'info',
      statsFilename: 'stats.json',
    }),
    new CleanWebpackPlugin({
      verbose: false,
    }),
    new webpack.DefinePlugin({
      VISUALIZATIONS: JSON.stringify(visualizations),
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
    // The Home page and the About page have their own HTML template
    new HtmlWebpackPlugin({
      // HtmlWebpackPlugin's title option does not seem to work
      chunks: ['index'],
      filename: 'index.html',
      hash: true,
      template: join(__dirname, 'src', 'templates', 'index.html'),
      templateParameters: {
        PUBLIC_URL,
        TITLE: 'Visualizations',
        VISUALIZATIONS: visualizations,
      },
    }),
    new HtmlWebpackPlugin({
      chunks: ['about'],
      filename: 'about.html',
      hash: true,
      template: join(__dirname, 'src', 'templates', 'about.html'),
      templateParameters: {
        PUBLIC_URL,
        TITLE: 'About',
      },
    }),
    // Each visualization shares the same HTML template
    ...visualizations.map(vizName => {
      const chunks = [vizName];
      const filename = join(`${vizName}`, 'index.html');
      const htmlPlugin = new HtmlWebpackPlugin({
        chunks,
        filename,
        /**
         * TODO: use hash: true
         * hash: true causes Referrer Policy: no-referrer-when-downgrade with
         * some visualizations (e.g. heatmap). Investigate.
         */
        hash: false,
        template: join(__dirname, 'src', 'templates', 'dataviz.html'),
        templateParameters: {
          PUBLIC_URL,
          TITLE: vizName,
        },
      });
      return htmlPlugin;
    }),
    // Some complex visualization has its own HTML template
    new HtmlWebpackPlugin({
      chunks: ['challenge'],
      filename: join('challenge', 'index.html'),
      hash: true,
      template: join(__dirname, 'src', 'templates', 'challenge.html'),
      templateParameters: {
        PUBLIC_URL,
        TITLE: 'challenge',
      },
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
