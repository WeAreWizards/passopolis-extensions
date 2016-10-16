var path = require('path');

module.exports = {
  entry: "./login/common/background.js",
  output: {
    path: __dirname,
    filename: "/tmp/bundle.js",
  },
  module: {
    loaders: [
      { test: /\.js$/,
        include: [
          path.resolve(__dirname, "login"),
        ],
        exclude: [
          path.resolve(__dirname, "node_modules"),
        ],
        loader: "babel-loader",
        query: {
          presets: ['es2015']
        },
        babelrc: false,
      },
    ],
  },
};
