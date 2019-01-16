const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractCssChunks = require('extract-css-chunks-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const paths = require('./paths');

module.exports = mode => {
  const PUBLIC_URL = mode === 'production' ? paths.publicUrl : '';

  const rules = [
    // rule for .js/.jsx files
    {
      test: /\.(js|jsx)$/,
      include: [path.join(__dirname, 'js', 'src')],
      exclude: [path.join(__dirname, 'node_modules')],
      use: {
        loader: 'babel-loader',
      },
    },
    // rule for .css files
    {
      test: /\.css$/,
      include: path.join(__dirname, 'src', 'css'),
      use: [ExtractCssChunks.loader, 'css-loader'],
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
      include: path.join(__dirname, 'src', 'images'),
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

  const pages = fs
    .readdirSync(path.resolve(__dirname, 'src', 'templates'))
    .filter(fileName => fileName.endsWith('.html'));

  const plugins = [
    new CleanWebpackPlugin(['build'], {
      root: __dirname,
      exclude: ['favicon.ico', 'Transparent.gif'],
      verbose: true,
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
        hash: true,
        template: path.join(__dirname, 'src', 'templates', filename),
        templateParameters: {
          PUBLIC_URL,
        },
      });
      return htmlPlugin;
    }),
  ];

  const config = {
    devtool: 'source-map',
    entry: {
      about: path.join(__dirname, 'src', 'js', 'about.ts'),
      barchart: path.join(__dirname, 'src', 'js', 'barchart', 'index.js'),
      challenge: path.join(__dirname, 'src', 'js', 'challenge.js'),
      dolphins: path.join(__dirname, 'src', 'js', 'dolphins.js'),
      flags: path.join(__dirname, 'src', 'js', 'flags.js'),
      geomap: path.join(__dirname, 'src', 'js', 'geomap.js'),
      heatmap: path.join(__dirname, 'src', 'js', 'heatmap.js'),
      index: path.join(__dirname, 'src', 'js', 'index.js'),
      'horizon-chart': path.join(__dirname, 'src', 'js', 'horizon-chart.js'),
      linechart: path.join(__dirname, 'src', 'js', 'linechart', 'index.js'),
      scatterplot: path.join(__dirname, 'src', 'js', 'scatterplot', 'index.js'),
      'solar-correlation': path.join(
        __dirname,
        'src',
        'js',
        'solar-correlation.js'
      ),
    },
    module: {
      rules,
    },
    output: {
      filename: '[name].[chunkhash].js',
      path: path.resolve(__dirname, 'build'),
      publicPath: '/',
      sourceMapFilename: '[file].map',
    },
    plugins,
    target: 'web',
  };
  return config;
};
