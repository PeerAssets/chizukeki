var webpack = require("webpack")
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const { output, plugins, ...common }= require('./webpack.common.js')

module.exports = {
  ...common,
  devtool: false,
  output: {
    ...output,
    publicPath: '/chizukeki'
  },
  plugins: [
    ...plugins,
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.EnvironmentPlugin({
      PUBLIC_PATH: '/chizukeki',
      KEY_GENERATOR: 'singleton'
    }),
    new UglifyJSPlugin({
      sourceMap: true
    }),
  ]
}
