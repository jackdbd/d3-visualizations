const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;

const devServer = {
  compress: true,
  contentBase: path.join(__dirname, 'build'),
  host: 'localhost',
  inline: true,
  port: 8080,
  stats: {
    chunks: false,
    colors: true,
    modules: false,
    reasons: true,
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
