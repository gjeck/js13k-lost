const path = require('path')
const webpack = require('webpack')
const htmlWebpackPlugin = require('html-webpack-plugin')
const extractTextPlugin = require('extract-text-webpack-plugin')

const isProduction = process.env.npm_lifecycle_event === 'build'

let config = {
  entry: {
    main: './src/index.js'
  },
  output: {
    path: path.join(__dirname, 'dist/app'),
    filename: '[name].js'
  },
  module: {
    rules: [{
      test: /\.js$/,
      enforce: 'pre',
      exclude: /node_modules/,
      loader: 'eslint-loader'
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            [ 'env', { 'modules': false } ]
          ]
        }
      }
    }, {
      test: /\.css$/,
      use: extractTextPlugin.extract({
        fallback: "style-loader",
        use: "css-loader"
      })
    }, {
      test: /\.(png|svg)$/,
      use: {
        loader: 'file-loader'
      }
    }]
  },
  plugins: [
    new htmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.html',
      minify: !isProduction ? false : {
        removeAttributeQuotes: true,
        collapseWhitespace: true,
        html5: true,
        minifyCSS: true,
        removeComments: true,
        removeEmptyAttributes: true,
      }
    }),
    new extractTextPlugin('[name].css')
  ],
  stats: 'minimal',
  devServer: {
    stats: 'minimal'
  }
}

if(!isProduction) {
  config.devtool = 'eval-source-map'
} else {
  config.plugins = config.plugins.concat([
    new webpack.optimize.ModuleConcatenationPlugin()
  ])
}

module.exports = config
