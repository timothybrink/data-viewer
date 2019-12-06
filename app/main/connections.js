const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const { ipcMain, webContents, Menu } = require('electron')

let serialPort;

module.exports.open = function () {
  webContents.getFocusedWebContents().send('open-connection-request')
}

ipcMain.on('open-connection-request', function (event, data) {
  let wc = webContents.getFocusedWebContents()
  // Assumes data to be of form { port: PORT, baudRate: BAUDRATE }

  serialPort = new SerialPort(data.port, { baudRate: data.baudRate || 9600 })

  let parser = new Readline()
  serialPort.pipe(parser)

  serialPort.on('open', function () {
    wc.send('connection-opened', data)

    // update menu
    let menu = Menu.getApplicationMenu()
    menu.getMenuItemById('open-connection-button').visible = false
    menu.getMenuItemById('close-connection-button').visible = true
    menu.getMenuItemById('open-connection-name').enabled = true
    menu.getMenuItemById('open-connection-name').label = data.port
  })

  parser.on('data', function (data) {
    wc.send('data', data)
  })

  serialPort.on('error', e => {
    console.error(e.message)
    wc.send('error', e.message)
  })
})

module.exports.close = function () {
  serialPort.close(() => {
    webContents.getFocusedWebContents().send('connection-closed')

    // update menu
    let menu = Menu.getApplicationMenu()
    menu.getMenuItemById('open-connection-button').visible = true
    menu.getMenuItemById('close-connection-button').visible = false
    menu.getMenuItemById('open-connection-name').label = 'No connections open'
    menu.getMenuItemById('open-connection-name').enabled = false
  })
}