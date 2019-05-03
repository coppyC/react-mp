const path = require('path')
const webpack = require('webpack')
const CopyPlugin = require('copy-webpack-plugin')
const ReactMpPlugin = require('@react-mp/plugin')

/** @type {webpack.Configuration} */
const config = {
  entry: ReactMpPlugin.entry,
  mode: 'none',
  devtool: 'source-map',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      { test: /(?!\.test)\.tsx?$/, loader: "ts-loader" },
      { test: /\/pages\/([^/]\/)*[a-z][^/]*\.tsx$/, loaders: ["ts-loader", ReactMpPlugin.loader] },
      { test: /\.jsx$/, loader: 'babel-loader' },
      { test: /\/pages\/([^/]\/)*[a-z][^/]*\.jsx$/, loaders: [ 'babel-loader', path.resolve('loader.js') ] },
      {
        test: /\.css$/,
        use: [
          'file-loader?' + 'name=pages/[name].wxss',
          'extract-loader',
          'css-loader'
        ],
      },

    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src/')
    }
  },
  plugins: [
    new ReactMpPlugin(),
    new CopyPlugin([
      { from: 'node_modules/react-mp/element', to: 'react' },
    ])
  ],

  optimization: {
    splitChunks: {
      cacheGroups: {
        others: {
          name: 'js/others',
          minChunks: 2,
          chunks: 'initial',
          priority: 0,
        },
        utils: {
          name: 'js/utils',
          minSize: 1,
          test: /[\\/]utils[\\/]/,
          chunks: 'all',
          priority: 8,
        },
        components: {
          name: 'js/components',
          minSize: 1,
          test: /[\\/]components[\\/]/,
          chunks: 'all',
          priority: 9,
        },
        npm: {
          name: 'js/npm',
          minSize: 1,
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
          priority: 10,
        }
      }
    }
  }
}

module.exports = config
