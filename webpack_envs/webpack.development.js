const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BUILD_DIR = path.resolve(__dirname, "../dist");
const APP_DIR = path.resolve(__dirname, "../app");
module.exports = {
  watch: true,
  entry: ["@babel/polyfill", APP_DIR + "/index.jsx"],
  output: {
    path: BUILD_DIR,
    filename: "labo-workspace-components.js",
    libraryTarget: "umd",
    library: "labows",
  },
  devtool: "cheap-module-source-map",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: [
          path.resolve(__dirname, "node_modules"),
          path.resolve(__dirname, "dist"),
          path.resolve(__dirname, "__tests__"),
          path.resolve(__dirname, "sass"),
          path.resolve(__dirname, "webpack_envs"),
          path.resolve(__dirname, ".github"),
        ],
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
            cacheCompression: false,
          },
        },
      },
      {
        test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)|\.gif($|\?)/,
        loader: "url-loader",
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
          },
          "sass-loader",
        ],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "labo-workspace-components.css",
    }),
  ],
};
