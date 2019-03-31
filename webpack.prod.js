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
  splitChunks: {
    chunks: 'async',
    minSize: 30000,
    maxSize: 0,
    minChunks: 1,
    maxAsyncRequests: 5,
    maxInitialRequests: 3,
    automaticNameDelimiter: '~',
    name: true,
    cacheGroups: {
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        priority: -10,
      },
      default: {
        minChunks: 2,
        priority: -20,
        reuseExistingChunk: true,
      },
    },
  },
};

const config = (env, argv) => {
  const mode = 'production';
  const commonConfig = common(mode);
  return merge(commonConfig, {
    devtool: 'cheap-module-source-map',
    mode,
    optimization,
    plugins: [compressionPlugin],
  });
};

module.exports = config;
