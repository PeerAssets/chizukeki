var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const nodeModule = mod => resolveApp(`node_modules/${mod}`)

module.exports = {

  entry: [
    resolveApp('index.web.tsx')
  ],

  output: {
    path: resolveApp('web/dist'),
    filename: 'bundle.js',
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: 'inline-cheap-module-source-map',

  resolve: {
    symlinks: false,
    extensions: [ '*', '.js', '.jsx', '.ts', '.tsx', '.web.ts', '.web.tsx', '.web.js', '.web.jsx' ],
    alias: {
      'react-router-native': 'react-router',
      'react-native/Libraries/Renderer/shims/ReactNativePropRegistry': 'react-native-web/dist/modules/ReactNativePropRegistry/index.js',
      'react-native-vector-icons/Fonts': nodeModule('react-native-vector-icons/Fonts'),
      'react-native-vector-icons': 'react-native-vector-icons/dist',
    },
  },

  plugins: [
    new webpack.ProvidePlugin({
      'regeneratorRuntime': 'regenerator-runtime/runtime'
    }),
    new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({
      title: 'PeerAssets Wallet',
      chunksSortMode: 'dependency',
      template: path.resolve(__dirname, '../index.ejs')
    }),
  ],

  module: {
    rules: [
      {
        test: /.jsx?|\.tsx?|\.json/,
        // Add every directory that needs to be compiled by Babel during the build
        include: [
          resolveApp('index.web.tsx'),
          resolveApp('src/'),
          nodeModule('react-native-uncompiled'),
          nodeModule('native-base'),
          nodeModule('react-native-web-lists'),
          nodeModule('react-native-easy-grid'),
          nodeModule('react-native-drawer'),
          nodeModule('react-native-modal'),
        ],

        use: [
          {
            loader: 'awesome-typescript-loader',
            options: {
              useWebpackText: true,
              useTranspileModule: true,
              doTypeCheck: true,
              forkChecker: true,

              useBabel: true,
              useCache: true,
              babelOptions: {
                babelrc: false,
                // This aliases 'react-native' to 'react-native-web' and includes only
                // the modules needed by the app
                plugins: [
                  'react-hot-loader/babel',
                  'react-native-web',
                  'transform-regenerator'
                ],
                // The 'react-native' preset is recommended (or use your own .babelrc)
                presets : [ 'react-native' ],
              }
            }
          }
        ]
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
        include: [
          nodeModule('native-base'),
        ],
      },
      // This is needed for webpack to import static images in JavaScript files
      {
        test: /\.(gif|jpe?g|png|svg)$/,
        use: {
          loader: 'url-loader',
          options: {
            name: '[name].[ext]'
          }
        }
      },
      {
        test: /\.ttf$/,
        loader: 'url-loader', // or directly file-loader
        include: [
          nodeModule('react-native-vector-icons'),
          nodeModule('native-base/Fonts'),
        ]
      }
    ]
  }

};
