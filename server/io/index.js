'use strict';
var socketio = require('socket.io');
var _ = require('lodash');
var io = null;

module.exports = function(server) {

    if (io) return io;

    io = socketio(server);

    // encapsulates setting up the event listeners for a sound-room
    function setupRoom(io) {
        // local memory for each room
        var instruments = {};
        var maxInstruments = 5;
        var capacity = 0;

        io.on('connection', function(socket) {
            // unique string to identify each connected user
            var socketId = socket.id.slice(0,5);

            socket.on('disconnect', function() {
                // don't reduce capacity if the socket was not connected, also don't go below 0
                if (capacity > 0 && _.has(instruments, socketId)) capacity -= 1;
                // remove the disconnected instrument from memory
                delete instruments[socketId];
            });

            socket.on('addToRoom', function(config) {
                if (capacity >= maxInstruments) {
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
                    // keep track of users in the room
                    capacity += 1;
                }
            });

            socket.on('keydown', function(note, frequency, id) {
                // pass the note's information to every other user in the room
                socket.broadcast.emit('keydown', note, frequency, id);
            });

            socket.on('keyup', function(note, frequency, id) {
                // pass the note's information to every other user in the room
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

    // enable sockets for sound-rooms, not the homepage
    var one = io.of('/room-one');
    setupRoom(one);

    var two = io.of('/room-two');
    setupRoom(two);

    var three = io.of('/room-three');
    setupRoom(three);

    var four = io.of('/room-four');
    setupRoom(four);

    return io;
};
