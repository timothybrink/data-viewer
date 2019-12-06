const { ipcRenderer } = require('electron')
const dialog = require('./dialog')
const graphOut = require('./graph')
const textOut = require('./text')

ipcRenderer.on('open-connection-request', function (e) {
  dialogElt = dialog(
    `<form action="dialog">
      <br>
      <label for="port">Serial port:</label>
      <input type="text" value="/dev/ttyACM0" name="port" id="port">
      <br>
      <label for="baudRate">Baud rate:</label>
      <input type="number" value="9600" name="baudRate" id="baudRate">
      <br>
      <input type="submit" value="Connect">
    </form>`, true)

  dialogElt.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault()

    let port = this.port.value
    let baudRate = Number(this.baudRate.value)

    ipcRenderer.send('open-connection-request', { port, baudRate })
  })
})

ipcRenderer.on('connection-opened', function (_event, data) {
  let d = dialog('Connection opened')

  document.title += ' - ' + data.port

  document.querySelector('#open-connection').textContent = 'Open connection: ' + data.port

  setTimeout(() => { d.close() }, 1000)
})

ipcRenderer.on('data', function (_event, data) {
  graphOut(data)
  textOut.show(data)
})

ipcRenderer.on('connection-closed', function () {
  let d = dialog('Connection closed.')

  document.title = 'Serial Grapher'
  document.querySelector('#open-connection').textContent = 'No open connection'

  setTimeout(() => { d.close() }, 1000)
})

ipcRenderer.on('error', function (_event, data) {
  let d = dialog('Connection Error.')

  console.log(data)

  setTimeout(() => { d.close() }, 2000)
})