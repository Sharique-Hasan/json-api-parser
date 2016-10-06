'use strict';

var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var helpers = require('./helpers');
var path = require('path');

module.exports = {
  entry: {
    'polyfills': './src/polyfills.ts',
    'vendor': './src/vendor.ts',
    'src': './src/app.module.ts',
    'boostrap': './bootstrap/main.ts'
  },

  resolve: {
    extensions: ['', '.js', '.ts', '.json']
  },

  module: {
    preLoaders: [
      {
        test: /\.json$/,
        exclude: helpers.root('node_modules'),
        loader: "json",
      }
    ],
    loaders: [
      {
        test: /\.ts$/,
        loaders: ['ts', 'awesome-typescript-loader']
      },
      {
        test: /\.html$/,
        loader: 'html'
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
        loader: 'file?name=assets/[name].[hash].[ext]'
      },
      {
        test: /\.css$/,
        exclude: helpers.root('src', 'apps'),
        loader: ExtractTextPlugin.extract('css?sourceMap')
      },
      {
        test: /\.css$/,
        include: helpers.root('src', 'apps'),
        loader: 'raw'
      },
      {
        test: /\.(scss|sass)$/,
        include: helpers.root('src'),
        loaders: ['raw', 'sass']
      }
    ]
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: ['app', 'vendor', 'polyfills']
    }),

    new webpack.ContextReplacementPlugin(
        // The (\\|\/) piece accounts for path separators in *nix and Windows
        /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
        helpers.root('./src') // location of your src
    ),

    new HtmlWebpackPlugin({
      template: 'bootstrap/index.html'
    })
  ]
};
