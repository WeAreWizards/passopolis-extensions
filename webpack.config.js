module.exports = {
  entry: "./login/common/background.js",
  output: {
    path: __dirname,
    filename: "/tmp/bundle.js",
  },
  module: {
    loaders: [
      { test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        presets: ["es2015"],
        babelrc: false,
      },
    ]
  }
};
