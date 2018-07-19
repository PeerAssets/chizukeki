var webpack = require('webpack')
const { output, plugins, ...common } = require('./webpack.common.js')

module.exports = {
  ...common,
  devtool: 'inline-cheap-module-source-map',
  output: {
    ...output,
    publicPath: '/'
  },
  devServer: {
    // contentBase: output.path,
    hot: true,
    historyApiFallback: true
  },
  plugins: [
    ...plugins,
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('DEVELOPMENT')
    }),
    new webpack.EnvironmentPlugin({
      PUBLIC_PATH: '/',
      KEY_GENERATOR: 'singleton',
      VALID_ISSUE_MODES: [
        'NONE',
        'CUSTOM',
        'ONCE',
        'MULTI',
        'MONO',
        'UNFLUSHABLE',
        'SUBSCRIPTION',
        'SINGLET',
      ].join(',')
    })
  ]
}
