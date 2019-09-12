const path = require('path');
const webpack = require('webpack')

const {
  NODE_ENV = 'development',
  WEBPACK_PORT,
} = process.env;

module.exports = {
  mode: NODE_ENV === 'production' ? 'production' : 'development',
  entry: [
    './src/app/main.js'
  ],
  devtool: NODE_ENV === 'production' ? undefined : 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    }),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: `bundle.${NODE_ENV}.js`,
    publicPath: '/',
  },
  devServer: {
    publicPath: '/assets',
    port: WEBPACK_PORT,
    historyApiFallback: true,
  },
};
