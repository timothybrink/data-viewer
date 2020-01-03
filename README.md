# Data Viewer

A simple telemetry server/UI, built in JS.

Things to work on:

 - Better time-based graphing

So still a work in progress.

## Installation

Clone this repo, npm install, and run `npm start`

## Usage

The idea is that node server.js runs a telemetry server on localhost:3300 (or a specified host and port). You can then send data to it, or open localhost:3300 in a browser and look at the incoming telemetry. Data is sent by means of HTTP get requests or a WebSocket connection. There's info on formatting in server.js. As for the UI, it can be customized by the UI.json file (in the ui/config/ directory), and you can load different json files from the ui.
There are also two telemetry sources in the telemetry-sources directory: a Python module, to simplify telemetry from Python, and a Node.js module for getting data from serial ports.

## Contact

For any questions, problems, etc. (better documentation?) feel free to contact me at [contact@timothybrink.dev](mailto:contact@timothybrink.dev). 