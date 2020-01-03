# Data Viewer

A simple telemetry server/UI, built in JS.

Features to add:

 - Better time-based graphing
 - Data export (currently the telem.py module has csv export built in, but I plan on moving that functionality to the server itself.)

So still a work in progress.

## Installation

Clone this repo, npm install, and run `npm start`

## Usage

The idea is that npm start runs a telemetry server on localhost:3300. You can then send data to it, or open localhost:3300 in a browser and look at the incoming telemetry. Data is sent by means of HTTP get requests or a WebSocket connection. There's info on formatting in server.js. As for the UI, it can be customized by the UI.json file (in the ui directory). Right now it's a test setup, but it should be pretty clear how to change it.

## Contact

For any questions, problems, etc. (better documentation?) feel free to contact me at [contact@timothybrink.dev](mailto:contact@timothybrink.dev). 