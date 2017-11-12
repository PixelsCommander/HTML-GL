var webpack = require('webpack');
var path = require('path');
//var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
//var Visualizer = require('webpack-visualizer-plugin');

module.exports = {
    entry: {
        'html-gl': './src/bootstrap',
        //'html-gl.min': './src/bootstrap.ts'
    },
    resolve: {
        extensions: [ '.ts', '.js', '*', '' ]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        sourceMapFilename: 'main.js.map'
    },
    devtool: 'inline-source-map',
    module: {
        loaders: [{
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: /node_modules/,
        }]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            sourceMap: true,
            include: /\.min\.js$/,
        })
    ],
}