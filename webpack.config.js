var webpack = require('webpack');
var path = require('path');
var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
//var Visualizer = require('webpack-visualizer-plugin');

module.exports = {
    entry: './src/gl-core.js',
    output: {
        path: './dist',
        filename: 'html-gl.js',
        sourceMapFilename: "main.js.map"
    },
    devtool: "#inline-source-map",
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
                //plugins: ['transform-runtime'],
                presets: ['es2015'],
            }
        }]
    },
    plugins: [
        //new Visualizer(),
        new uglifyJsPlugin({
            minimize: true,
            sourceMap: true,
            output: {
                comments: false
            },
            compressor: {
                warnings: false
            }
        })
    ]
}