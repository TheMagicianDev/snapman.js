const path = require('path');

const p = (pth) => path.resolve(__dirname, pth);

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'index.umd.js',
    path: path.resolve(__dirname, 'dist/bundle'),
    library: 'SnapmanJs',
  },
  mode: 'production',
  devtool: false,
  target: ['web', 'es5'],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'swc-loader',
        // use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    extensionAlias: {
      '.js': ['.ts'],
    },
    alias: {
      '/Snap': p('./src/Snap'),
      '/Snapman': p('./src/Snapman'),
      '/Utils': p('./src/Utils'),
    },
  },
};
