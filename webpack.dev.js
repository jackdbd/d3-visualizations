const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;

const devServer = {
  compress: true,
  contentBase: path.join(__dirname, 'src'),
  host: 'localhost',
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

const config = (env, argv) => {
  const mode = 'development';
  const commonConfig = common(mode);
  return merge(commonConfig, {
    devServer,
    mode,
    performance: {
      hints: 'warning',
    },
    plugins: [bundleAnalyzerPlugin],
  });
};

module.exports = config;
