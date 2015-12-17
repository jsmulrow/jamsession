# CS50 Final Project: Jam Session 
## by Jack Mulrow

Website URL: <a href="http://jam-session-app.herokuapp.com/">http://jam-session-app.herokuapp.com/</a>

Youtube Video URL: <a href="https://youtu.be/FdsIP_ZDvqI">https://youtu.be/FdsIP_ZDvqI</a>

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
