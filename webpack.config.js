require('babel-core/register');

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';

const resolve = {
    extensions: ['', '.js', '.jsx', 'jsx', 'js', '.css'],
    fallback: path.join(__dirname, 'node_modules'),
    root: path.join(__dirname),
};

const entries = [];

if (isDev) {
    // entries.push('webpack-dev-server/client?http://localhost:8080');
    entries.push('webpack-hot-middleware/client?reload=true');
    // entries.push('webpack/hot/only-dev-server');
}

entries.push('./client/index.js');

const plugins = [
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': isDev ? JSON.stringify('development') : JSON.stringify('production')
        }
    }),
    new HtmlWebpackPlugin({
        template: 'client/index.html',
        inject: 'body',
        filename: 'index.html'
    }),
];

if (isDev) {
    plugins.push(new webpack.HotModuleReplacementPlugin());
} else {
    plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    )
}

module.exports = {
    entry: entries,
    // devtool: isDev ? 'cheap-module-eval-source-map' : null,
    output: {
        path: path.join(__dirname, '/dist/'),
        filename: '[name].js',
        sourceMapFileName: '[name].map',
        publicPath: '/', // Used in webpack-dev-server as the directory for bundle.js
    },
    plugins,
    devServer: {
        hot: true,
        contentBase: path.join(__dirname),
        publicPath: '/',
        proxy: {
            '/rest': {
                target: 'http://localhost:3000/'
            },
        },
    },
    resolve,
    resolveLoader: resolve,
    module: {
        loaders: [
            {
                test: /\.js?$/,
                loaders: ['react-hot', 'babel'],
                exclude: /node_modules/,
                include: path.join(__dirname),
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader',
            },
            {
                test: /\.png$/,
                loader: 'url-loader?limit=100000',
            },
        ],
    },
    debug: isDev,
    profile: false,
};
