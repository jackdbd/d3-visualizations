const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const CompressionPlugin = require('compression-webpack-plugin');

const compressionPlugin = new CompressionPlugin({
  algorithm: 'gzip',
  cache: true,
  minRatio: 0.8,
});

const config = merge(common, {
  mode: 'production',
  plugins: [compressionPlugin],
});

module.exports = config;
