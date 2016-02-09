var webpack = require("webpack");
var path = require("path");

module.exports = {
    entry: "./public/src/main.js",
    resolve: {
        modulesDirectories: [
            "./public/src/"
        ]
    },
    output: {
        path: path.join(__dirname, "public"),
        filename: "bundle.js"
    }
};
