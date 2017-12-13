var webpack = require("webpack");
var path = require("path");
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {

  entry: [
    'react-hot-loader/patch',
    path.join(__dirname, '../index.web.tsx')
  ],

  output: {
    path: path.join(__dirname, 'dist'),
    filename: "bundle.js",
    publicPath: "/"
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
    extensions: [ ".js", "jsx", ".ts", ".tsx", ".web.js", ".web.jsx" ],
    alias: {
      'react-native': 'react-native-web',
      'react-router-native': 'react-router',
    },
  },

  plugins: [
    new webpack.ProvidePlugin({
      'regeneratorRuntime': 'regenerator-runtime/runtime'
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      title: 'react native',
      chunksSortMode: 'dependency',
      template: path.resolve(__dirname, './index.ejs')
    }),
  ],

  module: {
    rules: [
      {
        test: /.jsx?|\.tsx?$/,
        // Add every directory that needs to be compiled by Babel during the build
        include: [
          path.join(__dirname, '../index.web.tsx'),
          path.resolve(__dirname, '../src'),
          path.resolve(__dirname, '../node_modules/react-native-uncompiled'),
          path.resolve(__dirname, '../node_modules/react-native-elements'),
          path.resolve(__dirname, '../node_modules/react-native-vector-icons'),
          path.resolve(__dirname, '../node_modules/react-native-ui-kitten'),
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
