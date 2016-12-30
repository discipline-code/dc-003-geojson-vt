const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: [
    'webpack-dev-server/client?http://localhost:9000/',
    path.resolve(__dirname, 'src/index.js')
  ],
  output: {
    path: path.join(__dirname, 'dist'), // Output path 
    filename: 'bundle.js', // Name of the bundle file generated
  },
  devServer: {
    port: 9000, // Development server port
    host: '0.0.0.0', // Host
    outputPath: path.join(__dirname, 'dist')
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, 'src/static'),
        to: path.join(__dirname, 'dist') 
      }
    ])
  ],
  target: 'web',
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        include: [ // Include just the necessary files
          path.resolve(__dirname, 'src/index.js')
        ],
        loader: 'babel',
        query: { presets: ['es2015'] }
      }
    ]
  }
};
