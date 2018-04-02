var webpack = require("webpack")
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const merge = require('webpack-merge')
const { output, plugins, ...common }= require('./webpack.common.js')

module.exports = {
  ...common,
  devtool: 'source-map',
  output: {
    ...output,
    publicPath: '/chizukeki'
  },
  plugins: [
    ...plugins,
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      PUBLIC_PATH: '/chizukeki'
    }),
    new UglifyJSPlugin({
      sourceMap: true
    }),
  ]
}
