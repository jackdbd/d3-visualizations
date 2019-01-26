const path = require('path');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const DashboardPlugin = require('webpack-dashboard/plugin');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

const devServer = {
  compress: true,
  contentBase: path.join(__dirname, 'src'),
  host: 'localhost',
  hot: true,
  inline: true,
  open: true,
  overlay: true,
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
const dashboardPlugin = new DashboardPlugin();
const duplicatePackageCheckerPlugin = new DuplicatePackageCheckerPlugin({
  emitError: false,
  verbose: true,
  showHelp: true,
  strict: false,
});
const hotModuleReplacementPlugin = new webpack.HotModuleReplacementPlugin();

const config = (env, argv) => {
  const mode = 'development';
  const commonConfig = common(mode);
  return merge(commonConfig, {
    devServer,
    mode,
    performance: {
      hints: 'warning',
    },
    plugins: [
      bundleAnalyzerPlugin,
      dashboardPlugin,
      duplicatePackageCheckerPlugin,
      hotModuleReplacementPlugin,
    ],
  });
};

module.exports = config;
