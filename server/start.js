'use strict';
var chalk = require('chalk');

// create the server
var server = require('http').createServer();

// load the application
var app = require('./app');
server.on('request', app); // Attach the Express application.
require('./io')(server);   // Attach socket.io.

// start the server
var PORT = process.env.PORT || 8080;

server.listen(PORT, function () {
    console.log(chalk.blue('Server started on port', chalk.magenta(PORT)));
});
