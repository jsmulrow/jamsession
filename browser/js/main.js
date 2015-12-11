// attach sockets
var socket = io(window.location.href); // href allows for namespaces
console.log('connected socketio');

var pathName = window.location.pathname;

// update html if in a room
if (pathName !== "/") {
    $("#room-name").text(pathName.slice(1).replace("-", " "));
    $("li.active").toggleClass("active");
    $("li.dropdown").toggleClass("active");
}

socket.on('connect', function() {
    console.log('browser connected to server (i.e. node)');
});

window.AudioContext = window.AudioContext || window.webkitAudioContext;

// dynamically size the keyboard
var w = window.innerWidth,
    h = window.innerHeight;

console.log(w, h);

var context = new AudioContext(),
    // have to update colors in the source code lol
    settings = {
        id: 'keyboard',
        // width: 600,
        width: w - 50,
        height: h/2,
        startNote: 'A2',
        // whiteNotesColour: '#fff',
        whiteNotesColour: '#000',
        // blackNotesColour: '#000',
        blackNotesColour: '#fff',
        // borderColour: '#fff',
        borderColour: '#000',
        activeColour: 'red',
        octaves: 2,
        // hoverColour: 'red'
    },
    keyboard = new QwertyHancock(settings);

var masterGain = context.createGain();
var nodes = [];

var oscillatorType = 'square',
    gainValue = 0.3,
    id = -1;

masterGain.gain.value = gainValue;
masterGain.connect(context.destination); 

keyboard.keyDown = function (note, frequency) {
    playNote(note, frequency, oscillatorType);

    // socket io
    socket.emit('keydown', note, frequency, id);
};

function playNote(note, frequency, type) {
    var oscillator = context.createOscillator();
    oscillator.type = oscillatorType;
    oscillator.frequency.value = frequency;
    oscillator.connect(masterGain);
    oscillator.start(0);

    nodes.push(oscillator);
}

keyboard.keyUp = function (note, frequency) {
    stopNotes(note, frequency);

    // socket io
    socket.emit('keyup', note, frequency, id);
};

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

// custom options
$("#options").submit(function(e) {
    e.preventDefault();
    oscillatorType = $(this).find("#oscillator-type").val();
    gainValue = $(this).find("#gain-val").val();
    masterGain.gain.value = gainValue;
    console.log('update type', oscillatorType, gainValue);
    // send changes to other clients, if connected
    if (id != -1) {
        // update this to be more robust later
        socket.emit("changeConfig", {gainValue: gainValue, oscillatorType: oscillatorType}, id);
    }
});
$("#oscillator-type").val(oscillatorType);
$("#gain-val").val(gainValue);


// attempt to connect to the room
var config = {
    type: "oscillator",
    gainValue: gainValue,
    oscillatorType: oscillatorType
}
socket.emit("addToRoom", config);

// finish setting up socket if connected successfully
socket.on("enteredRoom", function(oldInstruments, assignedId) {
    console.log('entered the room, assigned id:', assignedId);
    id = assignedId;

    var instruments = {};

    console.log("the old instruments", oldInstruments);

    // setup the old instruments
    var oldKeys = Object.keys(oldInstruments);
    oldKeys.forEach(function(key) {
        setupInstrument(oldInstruments[key], key);
    });

    function setupInstrument(config, id) {
        // new gain for each instrument, but connected to the same context
        var new_masterGain = context.createGain();
        var newNodes = [];

        new_masterGain.gain.value = config.gainValue;
        new_masterGain.connect(context.destination); 

        // make object to store instrument functions
        var instr = {};

        var newPlayNote;
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

    // socket.io

    // set up a new audio context when a new instrument connects to the room
    socket.on('newInstrument', function(config, id) {
        console.log('got a new instrument', config, id);
        setupInstrument(config, id);
    });
    socket.on('keydown', function(note, frequency, id) {

        console.log("instrument", id, "played a note");
        console.log("instruments", instruments);

        // access the correct instrument
        var instrument = instruments[id];
        instrument.playNote(note, frequency);
    });
    socket.on('keyup', function(note, frequency, id) {
        // access the correct instrument
        var instrument = instruments[id];
        instrument.stopNotes(note, frequency);
    });
    socket.on('changedConfig', function(newConfig, id) {
        // access the correct instrument
        var instrument = instruments[id];
        instrument.changeConfig(newConfig);
    });
});

// failure script
socket.on("fullRoom", function() {
    console.log('the room was full, can still jam locally');
    $("#error-message").toggleClass("hidden");
});


///// showing codes on the keys

var blackButtons = ["2", "W", "E", "T", "Y", "U", "O", "P", "]"];
// var blackNotes = $("[data-note-type='black']");
var blackNotes = Array.prototype.slice.call(document.querySelectorAll("[data-note-type='black']"));
// dynamically set the style for the notes
var blackNoteStyle = {
    "padding": parseInt(blackNotes[0].style.width) / 3 + "px",
    "margin-top": parseInt(blackNotes[0].style.height) / 10 + "px",
    "font-size": parseInt(blackNotes[0].style.width) / 2 + "px"
}
blackNotes.forEach(function(elem, idx) {
    // make element and style it
    var note = document.createElement("span");
    note.innerHTML = blackButtons[idx];
    note.id = 'black-note';
    note.style.padding = blackNoteStyle.padding;
    note.style["margin-top"] = blackNoteStyle["margin-top"];
    note.style["font-size"] = blackNoteStyle["font-size"];
    // attach element to DOM
    elem.appendChild(note);
});

var whiteButtons = ["1", "3", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "\\"];
var whiteNotes = Array.prototype.slice.call(document.querySelectorAll("[data-note-type='white']"));
// dynamically set the style for the notes
var whiteNoteStyle = {
    "padding": (parseInt(whiteNotes[0].style.width) / 5) - 10 + (parseInt(whiteNotes[0].style.height) / 50) + "px",
    "font-size": parseInt(whiteNotes[0].style.width) / 5 + "px",
}
whiteNoteStyle.margin = (parseInt(whiteNotes[0].style.width) - parseInt(whiteNoteStyle["font-size"]) - parseInt(whiteNoteStyle.padding)) / 2 + "px"; 
whiteNoteStyle["margin-top"] = 2*parseInt(whiteNotes[0].style.height)/3 + parseInt(whiteNoteStyle["font-size"]) + "px",
whiteNotes.forEach(function(elem, idx) {
    // make element and style it
    var note = document.createElement("span");
    note.innerHTML = whiteButtons[idx];
    note.id = 'white-note';
    note.style.padding = whiteNoteStyle.padding;
    // note.style.margin = whiteNoteStyle.margin;
    note.style["margin-top"] = whiteNoteStyle["margin-top"];
    // note.style["font-size"] = whiteNoteStyle["font-size"];
    // attach element to DOM
    elem.appendChild(note);
});

console.log("c4's style", document.getElementById("C4").style.height);