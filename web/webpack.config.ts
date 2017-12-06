import * as webpack from "webpack";
import * as path from "path";
var HtmlWebpackPlugin = require('html-webpack-plugin');

const config: webpack.Configuration  = {

  entry: [
    path.join(__dirname, '../index.web.ts')
  ],

  output: {
    path: path.join(__dirname, 'dist'),
    filename: "bundle.js",
    publicPath: "/"
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
    extensions: [".js", "jsx", ".ts", ".tsx"],
    alias: {
      'react-native': 'react-native-web',
      'react-router-native': 'react-router',
    },
  },

  plugins: [
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
        test: /\.tsx?$/,
        // Add every directory that needs to be compiled by Babel during the build
        include: [
          path.join(__dirname, '../index.web.ts'),
          path.resolve(__dirname, '../src'),
          path.resolve(__dirname, '../node_modules/react-native-uncompiled'),
          /node_modules\/react-native-/,
        ],
        exclude: /node_modules\/react-native-web\//,
        use: {
          loader: 'awesome-typescript-loader',
          options: {
            useBabel: true,
            useCache: true,
            babelOptions: {
              babelrc: false,
              // This aliases 'react-native' to 'react-native-web' and includes only
              // the modules needed by the app
              plugins: ['react-native-web/babel'],
              // The 'react-native' preset is recommended (or use your own .babelrc)
              presets: ['react-native']
            }
          }
        }
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

export default config;
