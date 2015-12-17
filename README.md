# CS50 Final Project: Jam Session 
## by Jack Mulrow

Website URL: <a href="http://jam-session-app.herokuapp.com/">http://jam-session-app.herokuapp.com/</a>

Youtube Video URL: <a href="https://youtu.be/FdsIP_ZDvqI">https://youtu.be/FdsIP_ZDvqI</a>

## Documentation

### What is Jam Session -
My project is a website that lets users play a synthetic keyboard with other users in real-time. 

### How to use Jam Session -
You can play the keyboard by clicking keys on the keyboard or the keys listed. To play with up to 4 other users, users must enter a "sound-room" by selecting one from the dropdown button near the top of the page. Every user inside a particular sound room will hear all the notes played by other users in that same sound-room. Users can only play by themselves on the home page. There is a small menu that allows users to customize the sounds their synthetic keyboard produces. They can select the type of oscillator used to generate sounds (square, sine, sawtooth, or triangle) and can select a volume from 0 to 1.0. Changes are only processed when the "save" button is clicked. If a room already has 5 users playing in it, new users going to that room will be unable to join, but can still play by themselves in that room.

### How are the files organized -
The browser directory has the JavaScript and CSS files that I wrote for the front-end. The server directory has the NodeJS server I wrote and the socket.io file I wrote to configure the server. The dist and node_modules folders have JavaScript libraries that I installed or downloaded from 3rd parties. Package.json and the Procfile are configuration files for npm and heroku. The .gitignore is for github and so is the README.md.

### How to run Jam Session -
The easiest way to use my website is to go to it's deployment: http://jam-session-app.herokuapp.com/. If you want to run it locally, use your terminal to navigate to the jam_session directory 
(or whatever you called it), type "npm install" (assuming you have Node installed already), then type "npm start" and go to localhost:8080.


*For best results, use Google Chrome*

## Design

- The Server -
Jam Session uses a server written using NodeJS, which is a JavaScript runtime that allows
JavaScript code to be run outside a browser. More specifically it uses the Express library 
to handle requests. The views folder contains the index.html file, which is served for all 
requests, and the favicon. Also included is the app directory, which sets up the middleware 
to serve static files (like node modules, JavaScript, and CSS). Also included is the code 
for socket.io, which is how my website lets users play music together in real-time.

- Socket io -
This file loads in the socket.io library at the top, and exports a function that will accept 
a server object. When that function is run, a new io object is made and 4 "rooms" are made 
with that object. Each of these rooms has a url associated with it, and allows for different 
sound-rooms. Each room is run through the setupRoom function, which attaches a series of 
"event listeners" for different events that will get sent to the server from each browser 
connected to each particular room. The key things the server does is keep track of how many 
instruments are in a room and their configuration, send these configurations to each new browser 
that connects to the room, limit the number of browsers per room to 5, broadcast key presses 
and key press endings to each browser connected to the room, and remove instruments from its 
memory when browsers disconnect / leave a room.

- The Front-End -
There is only one html page that is served to the client, index.html. I chose to do this because 
the sound rooms look almost identical to the home page, the only thing I change is a few lines 
of text (which I do with JavaScript). There is one JavaScript file, main.js, and one CSS file, 
main.css. The Javascript file contains at the top the necessary code to set up the socket.io 
connection. Next the url is parsed and text fields are updated as necessary. After that the 
keyboard is set up using a library called qwerty-hancock, and the audio context is set up, using
the Web Audio API. The playNote function, which creates oscillators attached to the main gain
using the frequencies mapped to each note by qwerty-hancock, and stopNotes function, which
detaches every active oscillator. These two functions were inspired by an article I read on 
the Web Audio API. These functions are used in the event listeners for the keydown and keyup 
events (defined by qwerty-hancock), and also socket.io events are emitted, which send info 
about the keypresses to the server, which broadcasts them to all other connected browsers 
(if the current browser is connected). Next is the event listener for the keyboard configuration, 
which adjusts local Web Audio variables and sends the new configuration to the server, which 
is sent to all connected browsers in the same sound-room. Next the browser attempts to enter 
the current room by sending an event to the server, if the server responds with the event 
indicating the room had space, then more socket.io listeners are set up allowing the browser 
to play notes for the other instruments in the room. If the room is full an error message 
is shown. Lastly, the keyboard keys associated with each piano key is added to each key in 
the html (this wasn't an option included in qwerty-hancock, so I had to do it myself). The 
entire code is wrapped in an anonymous function to keep it out of the global namespace, and 
the script tag comes after the body tag closes so it will load after the rest of the DOM. An 
effort was also made to not use jQuery so fewer scripts would need to be loaded.
