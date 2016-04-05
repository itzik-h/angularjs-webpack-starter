"use strict";

const webpack = require("webpack");

const webpackMerge = require("webpack-merge"); // Used to merge webpack configs
const commonConfig = require("./webpack.common.js"); // common configuration between environments

// Helpers
const helpers = require("./helpers");

// Webpack Plugins

// Metadata
const METADATA = webpackMerge(commonConfig.metadata, {
    HOST: process.env.HOST || "localhost",
    PORT: process.env.PORT || 3000,
    ENV: process.env.ENV = process.env.NODE_ENV = "development",
    HMR: helpers.hasProcessFlag("hot"),
    PRODUCTION: false,
    DEVELOPMENT: true,
});

/*
 * Config
 * IMPORTANT: notice that the configuration below is MERGED with the common configuration (commonConfig)
 * reference: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = webpackMerge(commonConfig, {
    // static data for index.html
    metadata: METADATA,
    
    // Developer tool to enhance debugging
    // reference: https://webpack.github.io/docs/configuration.html#devtool
    // reference: https://github.com/webpack/docs/wiki/build-performance#sourcemaps
    devtool: "source-map",

    // Cache generated modules and chunks to improve performance for multiple incremental builds.
    // Enabled by default in watch mode.
    // You can pass false to disable it
    // reference: http://webpack.github.io/docs/configuration.html#cache
    //cache: true,
    
    // Switch loaders to debug mode
    // reference: http://webpack.github.io/docs/configuration.html#debug
    debug: true,

    // Options affecting the normal modules.
    // reference: http://webpack.github.io/docs/configuration.html#module
    module: {
        // An array of automatically applied loaders.
        //
        // IMPORTANT: The loaders here are resolved relative to the resource which they are applied to.
        // This means they are not resolved relative to the configuration file.
        //
        // reference: http://webpack.github.io/docs/configuration.html#module-loaders
        loaders: [
            // Support for .ts files.
            // reference: https://github.com/s-panferov/awesome-typescript-loader
            {
                test: /\.ts$/,
                loader: "awesome-typescript",
                exclude: [
                    /\.e2e\.ts$/, // exclude end-to-end tests
                    /\.spec\.ts$/, // exclude unit tests
                ],
            },
        ],
    },

    // Add additional plugins to the compiler.
    // reference: http://webpack.github.io/docs/configuration.html#plugins
    plugins: [
        // Environment helpers (when adding more properties make sure you include them in environment.d.ts)
        // Plugin: DefinePlugin
        // Description: Define free variables.
        // Useful for having development builds with debug logging or adding global constants.
        // reference: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
        // NOTE: when adding more properties make sure you include them in custom-typings.d.ts
        new webpack.DefinePlugin({
            "ENV": JSON.stringify(METADATA.ENV),
            "NODE_ENV": JSON.stringify(METADATA.ENV),
            "HMR": METADATA.HMR,
            "PRODUCTION": METADATA.PRODUCTION,
            "DEVELOPMENT": METADATA.DEVELOPMENT,
            "process.env": {
                "ENV": JSON.stringify(METADATA.ENV),
                "NODE_ENV": JSON.stringify(METADATA.ENV),
                "HMR": METADATA.HMR,
                "PRODUCTION": METADATA.PRODUCTION,
                "DEVELOPMENT": METADATA.DEVELOPMENT,
            },
        }),
    ],
        
    // Static analysis linter for TypeScript advanced options configuration
    // Description: An extensible linter for the TypeScript language.
    // reference: https://github.com/wbuchwalter/tslint-loader
    tslint: {
        emitErrors: false,
        failOnHint: false,
        resourcePath: "src",
    },
    
    // Webpack Development Server configuration
    // Description: The webpack-dev-server is a little node.js Express server.
    // The server emits information about the compilation state to the client,
    // which reacts to those events.
    // reference: https://webpack.github.io/docs/webpack-dev-server.html
    devServer: {
        port: METADATA.PORT,
        host: METADATA.HOST,

        // HTML5 History API support: no need for # in URLs
        // automatically redirect 404 errors to the index.html page
        historyApiFallback: true,

        // file watch configuration
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000,
        },
        contentBase: helpers.root("src/app"), // necessary so that assets are accessible
        
        // Can be used to add specific headers
        headers: {
            // enable CORS
            "Access-Control-Allow-Origin": "*",
        },
    },
});
