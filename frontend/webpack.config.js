const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 5000,
  },
  module: {
    rules: [
      // Load ts and tsx files with ts-loader
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      // Load css files
      // import files as `import * as css from "file.css";`
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env':{
        'API_URL': JSON.stringify(process.env.API_URL)
      }
    }),
  ]
};