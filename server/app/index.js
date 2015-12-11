'use strict';
var path = require('path');
var express = require('express');
var favicon = require('serve-favicon');
var app = express();
module.exports = app;

// middleware to serve static files
var root = path.join(__dirname, '../..');
app.use(express.static(path.join(root, './node_modules')));
app.use(express.static(path.join(root, './browser')));
app.use(express.static(path.join(root, './dist')));
app.use(favicon(path.join(root, '/server/app/views/favicon.ico')));

// send the index file for all requests
var indexPath = path.join(__dirname, './views/index.html');
app.get('/*', function (req, res) {
    res.sendFile(indexPath);
});

// error catching
app.use(function (err, req, res, next) {
    console.error(err, typeof next);
    res.status(err.status || 500).send(err.message || 'Internal server error.');
});
