// wrapped in an anonymous function to encapsulate the program
(function() {

    // attach sockets
    var socket = io(window.location.href); // href allows for namespaces
    console.log('connected socketio');

    var pathName = window.location.pathname;

    // update html if in a room
    if (pathName !== "/") {
        document.getElementById("room-name").textContent = pathName.slice(1).replace("-", " ");
        document.querySelector("li.active").classList.toggle("active");
        document.querySelector("li.dropdown").classList.toggle("active");
    }

    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    // dynamically size the keyboard
    var w = window.innerWidth,
        h = window.innerHeight;

    var context = new AudioContext(),
        // declare settings for qwerty-hancock keyboard library
        settings = {
            id: 'keyboard',
            width: w - 50,
            height: h/2,
            startNote: 'A2',
            whiteNotesColour: '#000',
            blackNotesColour: '#fff',
            borderColour: '#000',
            activeColour: 'red',
            octaves: 2,
        },
        keyboard = new QwertyHancock(settings);

    // set up the user's keyboard
    var masterGain = context.createGain();
    var nodes = [];

    // default keyboard has volume 0.3 and square type
    var oscillatorType = 'square',
        gainValue = 0.3,
        id = -1; // defaults to -1 if not in a room

    masterGain.gain.value = gainValue;
    masterGain.connect(context.destination); 

    // creates an oscillator for a note and starts it
    function playNote(note, frequency) {
        var oscillator = context.createOscillator();
        oscillator.type = oscillatorType;
        oscillator.frequency.value = frequency;
        oscillator.connect(masterGain);
        oscillator.start(0);

        // save oscillator so it can be deactivated later
        nodes.push(oscillator);
    }

    // event listener for key presses
    keyboard.keyDown = function (note, frequency) {
        playNote(note, frequency, oscillatorType);

        // send the keypress to the server (socket.io)
        socket.emit('keydown', note, frequency, id);
    };

    // deactivates all currently active oscillators
    function stopNotes(note, frequency) {
        var new_nodes = [];

        for (var i = 0; i < nodes.length; i++) {
            if (Math.round(nodes[i].frequency.value) === Math.round(frequency)) {
                nodes[i].stop(0);
                nodes[i].disconnect();
            } else {
                new_nodes.push(nodes[i]);
            }
        }

        nodes = new_nodes;
    }

    // event listener for when a key is released
    keyboard.keyUp = function (note, frequency) {
        stopNotes(note, frequency);

        // send the keyup to the server (socket.io)
        socket.emit('keyup', note, frequency, id);
    };


    // custom options submission
    document.getElementById("options").addEventListener("submit", function(e) {
        e.preventDefault();
        // get the selected values from inside the form and save them
        oscillatorType = this.querySelector("#oscillator-type").value;
        gainValue = this.querySelector("#gain-val").value;
        masterGain.gain.value = gainValue;
        // send changes to other clients, if connected
        if (id !== -1) {
            socket.emit("changeConfig", {gainValue: gainValue, oscillatorType: oscillatorType}, id);
        }
    });

    // if off the homepage, attempt to connect to the current sound-room
    if (pathName !== "/") {
        var config = {
            type: "oscillator",
            gainValue: gainValue,
            oscillatorType: oscillatorType
        }
        socket.emit("addToRoom", config);
    }

    // finish setting up socket if connected successfully
    socket.on("enteredRoom", function(oldInstruments, assignedId) {
        console.log('entered the room, assigned id:', assignedId);
        id = assignedId;

        var instruments = {};

        // sets up other instruments in the sound-room using config from the server
        function setupInstrument(config, id) {
            // new gain for each instrument, but connected to the same context
            var new_masterGain = context.createGain();
            var newNodes = [];

            new_masterGain.gain.value = config.gainValue;
            new_masterGain.connect(context.destination); 

            // make object to store instrument functions
            var instr = {};

            if (config.type === "oscillator") {
                instr.playNote = function(note, frequency) {
                    var oscillator = context.createOscillator();
                    oscillator.type = config.oscillatorType;
                    oscillator.frequency.value = frequency;
                    oscillator.connect(new_masterGain);
                    oscillator.start(0);

                    newNodes.push(oscillator);
                }
                instr.stopNotes = function(note, frequency) {
                    var new_nodes = [];

                    for (var i = 0; i < newNodes.length; i++) {
                        if (Math.round(newNodes[i].frequency.value) === Math.round(frequency)) {
                            newNodes[i].stop(0);
                            newNodes[i].disconnect();
                        } else {
                            new_nodes.push(newNodes[i]);
                        }
                    }

                    newNodes = new_nodes;
                }
                instr.changeConfig = function(newConfig) {
                    new_masterGain.gain.value = newConfig.gainValue;
                    config.oscillatorType = newConfig.oscillatorType;
                }
            }

            instruments[id] = instr;
        }

        // setup the other instruments in the sound-room
        var oldKeys = Object.keys(oldInstruments);
        oldKeys.forEach(function(key) {
            setupInstrument(oldInstruments[key], key);
        });

        // socket.io

        // set up a new audio context when a new instrument connects to the room
        socket.on('newInstrument', function(config, id) {
            setupInstrument(config, id);
        });
        socket.on('keydown', function(note, frequency, id) {
            // access the correct instrument
            var instrument = instruments[id];
            instrument.playNote(note, frequency);
        });
        socket.on('keyup', function(note, frequency, id) {
            // access the correct instrument
            var instrument = instruments[id];
            instrument.stopNotes(note, frequency);
        });
        socket.on('changedConfig', function(config, id) {
            // access the correct instrument
            var instrument = instruments[id];
            instrument.changeConfig(config);
        });
    });

    // display an error message if the room is full
    socket.on("fullRoom", function() {
        document.getElementById("error-message").classList.toggle("hidden");
    });


    // put keyboard keys on the virtual piano

    var blackButtons = ["2", "W", "E", "T", "Y", "U", "O", "P", "]"];
    var blackNotes = Array.prototype.slice.call(document.querySelectorAll("[data-note-type='black']"));
    // dynamically set the style for the notes
    var blackNoteStyle = {
        "padding": parseInt(blackNotes[0].style.width) / 3 + "px",
        "margin-top": (h/2) / 10 + "px",
        "font-size": parseInt(blackNotes[0].style.width) / 2 + "px"
    }
    blackNotes.forEach(function(elem, idx) {
        // make element and style it
        var note = document.createElement("span");
        note.innerHTML = blackButtons[idx];
        note.id = 'black-note';
        Object.assign(note.style, blackNoteStyle);
        // attach element to DOM
        elem.appendChild(note);
    });

    var whiteButtons = ["1", "3", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "\\"];
    var whiteNotes = Array.prototype.slice.call(document.querySelectorAll("[data-note-type='white']"));
    // dynamically set the style for the notes
    var whiteWidth = parseInt(whiteNotes[0].style.width);
    var whiteHeight = parseInt(whiteNotes[0].style.height);
    var whiteNoteStyle = {
        "padding": (whiteWidth / 5) - 10 + (whiteHeight / 50) + "px",
        "margin-top": (2 * whiteHeight) / 3 + (whiteWidth / 5) + "px"
    };
    whiteNotes.forEach(function(elem, idx) {
        // make element and style it
        var note = document.createElement("span");
        note.innerHTML = whiteButtons[idx];
        note.id = 'white-note';
        Object.assign(note.style, whiteNoteStyle);
        // attach element to DOM
        elem.appendChild(note);
    });

})();
