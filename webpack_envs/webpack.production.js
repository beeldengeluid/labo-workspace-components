const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BUILD_DIR = path.resolve(__dirname, "../dist");
const APP_DIR = path.resolve(__dirname, "../app");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin"); //https://github.com/webpack-contrib/css-minimizer-webpack-plugin
const TerserPlugin = require("terser-webpack-plugin"); //https://webpack.js.org/plugins/terser-webpack-plugin/

module.exports = {
  entry: ["@babel/polyfill", APP_DIR + "/index.jsx"],
  output: {
    path: BUILD_DIR,
    filename: "labo-workspace-components.js",
    libraryTarget: "umd",
    library: "labows",
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: { toplevel: true },
          mangle: {}, // Note `mangle.properties` is `false` by default.
          keep_fnames: true, //deprecated apparently
        },
      }),
      new CssMinimizerPlugin(),
    ],
  },
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
        loader: "babel-loader",
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
  performance: {
    maxEntrypointSize: 4096000,
    maxAssetSize: 4096000,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "labo-workspace-components.css",
    }),
  ],
};
