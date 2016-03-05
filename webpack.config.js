// var webpack = require("webpack");
var path = require("path");

module.exports = {
    entry: {
        screenBundle: "./public/src/screenMain.js",
        ctrlBundle: "./public/src/ctrlMain.js"
    },
    resolve: {
        modulesDirectories: [
            "src"
        ]
    },
    output: {
        path: path.join(__dirname, "public"),
        filename: "[name].js"
    }, 
    watch: true
};
