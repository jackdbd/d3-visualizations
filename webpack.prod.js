const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const compressionPlugin = new CompressionPlugin({
  algorithm: 'gzip',
  cache: true,
  minRatio: 0.8,
});

const optimization = {
  minimizer: [
    new TerserPlugin({
      // Use multi-process parallel running to improve the build speed
      parallel: true,
      // Enable file caching
      cache: true,
    }),
  ],
};

const config = merge(common, {
  mode: 'production',
  optimization,
  plugins: [compressionPlugin],
});

module.exports = config;
