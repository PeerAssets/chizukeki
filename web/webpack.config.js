var webpack = require("webpack");
var path = require("path");
var fs = require("fs");
var HtmlWebpackPlugin = require('html-webpack-plugin');

function nodeModule(mod){
  return path.resolve(__dirname, '../node_modules/' + mod)
}

module.exports = {

  entry: [
    'react-hot-loader/patch',
    path.join(__dirname, '../index.web.tsx')
  ],

  output: {
    path: path.join(__dirname, 'dist'),
    filename: "bundle.js",
    publicPath: process.env.PUBLIC_PATH || "/"
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: "eval-source-map",

  resolve: {
    symlinks: false,
    extensions: [ "*", ".js", ".jsx", ".ts", ".tsx", ".web.ts", ".web.tsx", ".web.js", ".web.jsx" ],
    alias: {
      'react-native$': 'react-native-web',
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
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      title: 'PeerAssets Wallet',
      chunksSortMode: 'dependency',
      template: path.resolve(__dirname, './index.ejs')
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      PUBLIC_PATH: '/'
    })
  ],

  module: {
    rules: [
      {
        test: /.jsx?|\.tsx?/,
        // Add every directory that needs to be compiled by Babel during the build
        include: [
          path.join(__dirname, '../index.web.tsx'),
          path.resolve(__dirname, '../src'),
          nodeModule('react-native-uncompiled'),
          nodeModule('react-native-web-lists'),
          nodeModule('react-native-easy-grid'),
          nodeModule('react-native-drawer'),
          nodeModule('react-native-modal'),
        ],

        use: [
          'react-hot-loader/webpack',
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
                plugins: ['react-native-web/babel', 'transform-regenerator'],
                // The 'react-native' preset is recommended (or use your own .babelrc)
                presets : [ 'react-native' ],
              }
            }
          }
        ]
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
        loader: "url-loader", // or directly file-loader
        include: [
          nodeModule('react-native-vector-icons'),
          nodeModule('native-base/Fonts'),
        ]
      },

      /* All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader"
      },

      {
        test: /\.scss$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          'sass-loader',
        ],
      }*/
    ]
  },

  devServer: {
    hot: true,
    historyApiFallback: true
  }

};
