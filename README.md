# Data Viewer

A simple telemetry server/UI, built in JS.

Still planning on adding a few features, such as commands from the ui to the source, and more UI options.

## Installation

Clone this repo, `npm install`, and run `npm start`

## Usage

The idea is that node server.js runs a telemetry server on localhost:3300 (or a specified host and port). You can then send data to it, or open localhost:3300 in a browser and look at the incoming telemetry. Data is sent by means of HTTP get requests or a WebSocket connection. There's info on formatting in server.js. As for the UI, it can be customized by the UI.json file (in the ui/config/ directory), and you can load different json files from the ui itself.
There are also three telemetry sources in the clients directory: a Python module, to simplify telemetry from Python, a generic Node.js module for sending telemetry to the server, and another specifically for getting data from serial ports and relaying it to the server.
There is also command functionality. This means that you can set up buttons in the ui.json files, with colors, titles, and keyboard shortcuts (just one key for now) that will send a given string back to the data source. There is an example in the ui.json file, and the node client shows how to receeve commmands. Along with this comes a page at /cmd that is just the buttons (optimized for mobile.)

## Contact

For any questions, problems, etc. (better documentation?) feel free to contact me at [contact@timothybrink.dev](mailto:contact@timothybrink.dev). 
