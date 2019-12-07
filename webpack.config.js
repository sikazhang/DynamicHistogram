/**
 * @file webpack.config.js
 * @author sikazhang
 * @date 2019-12-07
 */
const path = require('path');

module.exports = {
    entry: {
        app: path.join(__dirname, 'examples/src', 'app.js')
    },
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'examples')
    },
    resolve: {
        alias: {
            utils: path.join(__dirname, 'src/utils/')
        }
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'public'),
        overlay: true,
        stats: 'errors-only',
        compress: true
    },
    mode: 'development'
};
