const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    app: "./app/index.tsx",
  },
  output: {
    filename: "app.bundle.js",
    path: path.resolve(__dirname, "./public"),
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /\.css$/,
        loader: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        loader: "file-loader?limit=8192&name=assets/[name].[ext]?[hash]",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./app/index.ejs",
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "./app/favicon.ico" },
        { from: "./app/assets", to: "assets" },
      ],
    }),
  ],
  devtool: "eval",
  target: "electron-renderer",
  node: {
    process: true,
  },
  stats: {
    warningsFilter: warning => {
      // Ignora las advertencias que provienen de archivos CSS
      return /css-loader/.test(warning);
    },
  },  
};
