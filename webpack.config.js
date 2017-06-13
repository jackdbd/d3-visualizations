const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: [
    // add font-awesome-sass-loader as an entry point here, or require it in index.js
    'font-awesome-sass-loader!./font-awesome.config.js',
    path.join(__dirname, 'src', 'js', 'index.js'),
  ],

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
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
    new ExtractTextPlugin('bundle.css'),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'templates', 'index.html'),
      filename: 'index.html',
      hash: true,
    }),
    new CopyWebpackPlugin(
      [
        { from: path.join(__dirname, 'src', 'data'), to: path.join(__dirname, 'dist', 'data') },
      ], { debug: 'warning' }),
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
  },

  performance: {
    hints: 'warning',
  },

};
