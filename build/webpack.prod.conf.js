'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const env = require('../config/prod.env')

const webpackConfig = merge(baseWebpackConfig, {
    module: {
        rules: [{
            test: /.css$/,
            use: [
                MiniCssExtractPlugin.loader, 
                "css-loader"
            ]
        }]
    },
    devtool: config.build.productionSourceMap ? config.build.devtool : false,
    output: {
        path: config.build.assetsRoot,
        filename: utils.assetsPath('js/[name].[chunkhash:8].js'),
        chunkFilename: utils.assetsPath('js/[id].[chunkhash:8].js')
    },
    optimization: {
        runtimeChunk: {
            name: "manifest"
        },
        minimizer: [
            new UglifyJsPlugin({
              cache: true,
              parallel: true,
              sourceMap: config.build.productionSourceMap,
              parallel: true
            }),
            new OptimizeCSSAssetsPlugin({})
        ],
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "all"
                },
                styles: {
                    name: 'styles',
                    test: /.scss|css$/,
                    chunks: 'all',
                    minChunks: 1,
                    enforce: true
                }
            }
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': env
        }),
        new MiniCssExtractPlugin({
            filename: "css/app.[name].[chunkhash:8].css",
            chunkFilename: "css/app.[id].[chunkhash:8].css"
        }),
        new OptimizeCSSAssetsPlugin({  
            assetNameRegExp: /\.style\.css$/g,
                  cssProcessor: require('cssnano'),
                  cssProcessorOptions: {
                discardComments: {
                    removeAll: true
                }
            },
                  canPrint: true
        }),
        new HtmlWebpackPlugin({
            filename: config.build.index,
            template: 'index.html',
            inject: true,
            favicon: path.resolve('favicon.ico'),
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
                // more options:
                // https://github.com/kangax/html-minifier#options-quick-reference
            },
            // chunksSortMode: 'dependency'
        }),
        // keep module.id stable when vender modules does not change
        new webpack.HashedModuleIdsPlugin(),
        // enable scope hoisting
        new webpack.optimize.ModuleConcatenationPlugin(),
        // copy custom static assets
        new CopyWebpackPlugin([{
            from: path.resolve(__dirname, '../static'),
            to: config.build.assetsSubDirectory,
            ignore: ['.*']
        }])
    ]
})

if (config.build.productionGzip) {
    const CompressionWebpackPlugin = require('compression-webpack-plugin')

    webpackConfig.plugins.push(
        new CompressionWebpackPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: new RegExp(
                '\\.(' +
                config.build.productionGzipExtensions.join('|') +
                ')$'
            ),
            threshold: 10240,
            minRatio: 0.8
        })
    )
}

if (config.build.bundleAnalyzerReport) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
