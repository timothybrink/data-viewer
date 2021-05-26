# Data Viewer

A simple telemetry app.

Still in development, adding features as I need them...
Todo:
 - Stream data to file on server rather than keeping it in memory anywhere

## Installation

Clone this repo and run `npm install`.

## Usage

Run
```
npm run start
```
This will start the app. A telemetry server is started on localhost:3300.

### UI
The UI can be customized by JSON files in the ui/config/ directory. By default, ui.json will be loaded, but this can be changed from the View menu in the UI or by setting `?config=\<filename.json>` in the URL. There are a couple UI files with the repository; ui.json is a test configuration that demonstrates most of the possible configuration options.

The UI is made of a list of components, defined in the config file, each of which has a specific type: right now the three possible types are "chart", "text", and "command".

The initial positions of the components are configured with the "position" field, which is set to a string with "x y" format. If two components are given the same position, they will be stacked/tabbed. The UI itself is built with [Golden Layout](https://golden-layout.com), so panels can be moved/stacked/closed/minimized once the UI is loaded.

Descriptions essentially just define the title of the Golden Layout panel/tab.

Chart and Text components have a "dataName" field, which is set either to a single string or an array of strings, indicating the data identifier(s) for the data that will be displayed there.

Chart components also have a "color" field, which must be either a string or an array of strings (CSS color strings) indicating the colors to use in the graph, corresponding to the data identifiers in "dataName".

Command components define commands to send back to the data source. For now they consist of buttons. They are configured via a list in the "commands" field. Each command is an object that can have a "name", "command", "color", and "accelerator". The name is the display text on the button, the command is the data (i.e. string) that you want to send when the command is triggered, the color is the color of the button, and the accelerator defines a keyboard shortcut that will also trigger the command. The value of the last must be just a single letter or character (e.g. "g", " " for space, and so on). Combinations are not supported right now.

There is also a page (/cmd) that serves up just the commands that have been defined, optimized for mobile devices.

### Data sources

Data is sent to the UI by means of a WebSocket connection to the server. HTTP GET requests are also an option, but a slow one. Also I have not implemented commands for HTTP data sources, and currently don't plan to.

The WebSocket server is at 'ws://hostname:port', at the root. Traffic is expected to be in JSON (stringified). First send an object with a list of data identifiers corresponding to the data you will be sending: { headers: string[] }. An acknowledgement will be sent back (although there's really no need to check), and then the server is ready for data.

Data is expected as follows: { data: *[], time: Number }. The timestamp is required for graphing; the number of milliseconds since start would work great. The data is expected to be an array of some values (probably numbers), in the same order as the original array of data identifiers that was sent.

Commands will be sent to the data source in the following format: { command: * }.

To simplify all of this, there are three telemetry sources in the clients directory: a Python module, a generic Node.js module, and another Node.js module specifically for getting data from serial ports and relaying it to the server. See those for usage information. But of course you are not limited to those; anything will work as long as HTTP requests to the server (or ideally WebSockets) are possible.
