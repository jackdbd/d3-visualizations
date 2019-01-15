const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;

const devServer = {
  compress: true,
  contentBase: path.join(__dirname, 'src'),
  host: 'localhost',
  // hot: true,
  inline: true,
  open: true,
  port: 8080,
  stats: {
    chunks: false,
    colors: true,
    modules: false,
    reasons: true,
  },
};

const bundleAnalyzerPlugin = new BundleAnalyzerPlugin({
  analyzerPort: 8888,
  openAnalyzer: false,
});

const config = merge(common, {
  devServer,
  mode: 'development',
  performance: {
    hints: 'warning',
  },
  plugins: [bundleAnalyzerPlugin],
});

module.exports = config;
