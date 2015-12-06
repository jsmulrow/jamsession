'use strict';
var socketio = require('socket.io');
var mongoose = require('mongoose');
var _ = require('lodash');
var io = null;

module.exports = function(server) {

    if (io) return io;

    io = socketio(server);

    // main namespace
    setupRoom(io, 'main');

    // other namespaces
    var jack = io.of('/jack');
    setupRoom(jack, 'jack');

    var one = io.of('/room-one');
    setupRoom(one, 'one');

    var two = io.of('/room-two');
    setupRoom(two, 'two');

    var three = io.of('/room-three');
    setupRoom(three, 'three');

    function setupRoom(io, name) {
        // local memory for each room
        var instruments = {};
        var maxInstruments = 4;

        io.on('connection', function(socket) {

            console.log('new client connected', socket.id, 'in room:', name);
            console.log('the instruments', instruments);

            var socketId = socket.id.slice(0,5);

            // log disconnection messages
            socket.on('disconnect', function() {
                console.log('A client has disconnected ', socketId);
                delete instruments[socketId];
            });

            socket.on('addToRoom', function(config) {
                console.log('got a new instrument', config);
                var len = instruments.length;
                if (len >= maxInstruments) {
                    // too many instruments in the room
                    socket.emit('fullRoom');
                } else {
                    // remember the instrument and send back its id number
                    var id = socketId;
                    instruments[id]= config;
                    // send old instruments to the new room (except this new one)
                    socket.emit('enteredRoom', _.omit(instruments, id), id);
                    // alert other clients about the new instrument
                    socket.broadcast.emit('newInstrument', config, id);
                }
            });

            socket.on('keydown', function(note, frequency, id) {
                console.log("instrument", id, "played a note");
                // I think I will need an id for which piano
                socket.broadcast.emit('keydown', note, frequency, id);
            });

            socket.on('keyup', function(note, frequency, id) {
                // console.log('keyup from ', socket.id, note, frequency);
                socket.broadcast.emit('keyup', note, frequency, id);
            });

            socket.on('changeConfig', function(newConfig, id) {
                // update stored config
                Object.assign(instruments[id], newConfig);
                // send changes to other sockets
                socket.broadcast.emit('changedConfig', newConfig, id);
            });

        });

    }
    
    return io;

};
