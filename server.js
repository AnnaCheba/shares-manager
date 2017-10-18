/* eslint no-console: 0 */
const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const fileUpload = require('express-fileupload');
const uuidv4 = require('uuid/v4');
const config = require('./webpack.config.js');

const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 3000 : process.env.PORT;
const app = express();

if (isDeveloping) {
    const compiler = webpack(config);
    const middleware = webpackMiddleware(compiler, {
        publicPath: config.output.publicPath,
        contentBase: 'client',
        stats: {
            colors: true,
            hash: false,
            timings: true,
            chunks: false,
            chunkModules: false,
            modules: false,
        },
    });

    app.use(middleware);
    app.use(webpackHotMiddleware(compiler));
    app.get('/', (req, res) => {
        res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
        res.end();
    });
} else {
    app.use(express.static(`${__dirname}/dist`));
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist/index.html'));
    });
}

app.use(fileUpload());

// app.get('*', (req, res) => {
//     console.log('req', req);
// });

app.post('/rest/expenses/upload', (req, res) => {
    if (!req.files) {
        res.status(400).send(JSON.stringify({
            success: false,
            error: 'File was not uploaded',
        }));

        return;
    }

    const filePath = path.join(__dirname, 'tmp', `${uuidv4()}.csv`);

    req.files.file.mv(filePath, (err) => {
        if (err) {
            console.log('err', err);
            return;
        }

        console.log('file', req.files.file);

        parseUploadedFile(filePath).then((fileId) => {
            res.send(JSON.stringify({ success: true, fileId }));
        });
    });
});

app.get('/rest/getitems/:fileId', (req, res) => {
    console.log('/rest/getitems');
    getItems(req.params.fileId).then((data) => {
        res.send(JSON.stringify({ success: true, data }));
    });
});

app.listen(port, '0.0.0.0', (err) => {
    if (err) {
        console.log(err);
    }
    console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});

