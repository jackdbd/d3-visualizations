const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {

  entry: {
    'font-awesome': './font-awesome.config.js',
    index: path.join(__dirname, 'src', 'js', 'index.js'),
    barchart: path.join(__dirname, 'src', 'js', 'barchart.js'),
    linechart: path.join(__dirname, 'src', 'js', 'linechart.js'),
    about: path.join(__dirname, 'src', 'js', 'about.js'),
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].[chunkhash].bundle.js',
    sourceMapFilename: '[file].map',
  },

  target: 'web',

  module: {
    rules: [
      // rule for .js/.jsx files
      {
        test: /\.(js|jsx)$/,
        include: [
          path.join(__dirname, 'js', 'src'),
        ],
        exclude: [
          path.join(__dirname, 'node_modules'),
        ],
        use: {
          loader: 'babel-loader',
        },
      },
      // rule for .css files
      {
        test: /\.css$/,
        include: path.join(__dirname, 'src', 'css'),
        use: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }),
      },
      // rule for .sass files
      {
        test: /\.(sass|scss)$/,
        include: [
          path.join(__dirname, 'src', 'sass'),
        ],
        use: ExtractTextPlugin.extract({ fallback: 'style-loader', use: ['css-loader', 'sass-loader'] }),
      },
      // rule for .woff2 font files (font-awesome)
      {
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        // Limiting the size of the woff fonts breaks font-awesome ONLY for extract text plugin
        use: 'url-loader',
      },
      // rule for .ttf/.eot/.svg files (font-awesome and fonts)
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: {
          loader: 'file-loader',
          options: {
            name: './fonts/[name].[ext]',
          },
        },
      },
    ],
  },

  devtool: 'cheap-source-map',

  plugins: [
    new CleanWebpackPlugin(
      ['dist'],
      { root: __dirname, exclude: ['favicon.ico'], verbose: true }),
    new ExtractTextPlugin('[name].[chunkhash].bundle.css'),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'templates', 'index.html'),
      hash: true,
      filename: 'index.html',
      chunks: ['commons', 'font-awesome', 'index'],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'templates', 'barchart.html'),
      hash: true,
      filename: 'barchart.html',
      chunks: ['commons', 'font-awesome', 'barchart'],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'templates', 'linechart.html'),
      hash: true,
      filename: 'linechart.html',
      chunks: ['commons', 'font-awesome', 'linechart'],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'templates', 'about.html'),
      hash: true,
      filename: 'about.html',
      chunks: ['commons', 'about'],
    }),
    new CopyWebpackPlugin(
      [
        { from: path.join(__dirname, 'src', 'data'), to: path.join(__dirname, 'dist', 'data') },
      ], { debug: 'warning' }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      filename: '[name].[chunkhash].bundle.js',
      chunks: ['barchart', 'linechart'],
    }),
  ],

  // include jQuery from a CDN instead of bundling it
  externals: {
    jquery: 'jQuery',
  },

  devServer: {
    host: 'localhost',
    port: 8080,
    contentBase: path.join(__dirname, 'dist'),
    inline: true, // live reloading
    stats: {
      colors: true,
      reasons: true,
      chunks: false,
      modules: false,
    },
  },

  performance: {
    hints: 'warning',
  },

};
