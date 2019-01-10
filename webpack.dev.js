const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;

const devServer = {
  host: 'localhost',
  port: 8080,
  compress: true,
  contentBase: path.join(__dirname, 'build'),
  inline: true,
  stats: {
    colors: true,
    reasons: true,
    chunks: false,
    modules: false,
  },
};

const bundleAnalyzePlugin = new BundleAnalyzerPlugin({
  analyzerPort: 8888,
  openAnalyzer: false,
});

const config = merge(common, {
  devServer,
  mode: 'development',
  performance: {
    hints: 'warning',
  },
  plugins: [bundleAnalyzePlugin],
});

module.exports = config;
