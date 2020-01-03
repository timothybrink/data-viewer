# Data Viewer

A simple telemetry server/UI, built in JS.

Features to add:

 - Better time-based graphing
 - Data export

So still a work in progress.

## Installation

Clone this repo, npm install, and run `npm start`

## Usage

The idea is that npm start runs a telemetry server on localhost:3300. You can then send data to it, or open localhost:3300 in a browser and look at the incoming telemetry. Data is sent by means of HTTP get requests or a WebSocket connection. There's info on formatting in server.js. As for the UI, it can be customized by the UI.json file (in the ui directory). Right now it's a test setup, but it should be pretty clear how to change it.
There are also two telemetry sources in the telemetry-sources directory: a Python module, to simplify telemetry from Python, and a Node.js module for getting data from serial ports.

## Contact

For any questions, problems, etc. (better documentation?) feel free to contact me at [contact@timothybrink.dev](mailto:contact@timothybrink.dev). 