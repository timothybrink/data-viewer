const { ipcRenderer } = require('electron')
const dialog = require('./dialog')
const dataManager = require('./dataManager')
const yadl = require('@tbrink/yadl')

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
  dataManager.add(data)
})

ipcRenderer.on('connection-closed', function () {
  let d = dialog('Connection closed.')

  document.title = 'Serial Grapher'
  document.querySelector('#open-connection').textContent = 'No open connection'

  setTimeout(() => { d.close() }, 1000)
})

ipcRenderer.on('error', function (_event, data) {
  let d = dialog('Connection Error. See developer console for details.')

  console.log(data)

  setTimeout(() => { d.close() }, 2000)
})

const dataProfileDialog = document.querySelector('#data-profile-dialog')

ipcRenderer.on('data-profile-edit', function () {
  dataProfileDialog.hidden = false
})

yadl.select('#variable-select')
  .listen('change', function (e) {
    let dataProfile = dataManager.getDataProfile(this.value)

    yadl.select('#variable-name')
      .set('value', this.value)
    
    yadl.select('#variable-units')
      .set('value', dataProfile.variableUnits)
  })

yadl.select('#variable-name')
  .listen('change', function (e) {
    let selector = yadl.select('#variable-select')

    let variableName = selector.get('value')
    dataManager.updateDataProfile(variableName, 'variable-name', this.value)

    let oldValue
    if (this.oldValue)
      oldValue = this.oldValue
    else
      oldValue = this.defaultValue

    selector.children.forEach(i => {
      if (i.get('value') == oldValue) {
        i.set('value', this.value).set('textContent', this.value)
      }
    })

    this.oldValue = this.value
  })

yadl.select('#variable-units')
  .listen('change', function (e) {
    let variableName = yadl.select('#variable-select').get('value')
    dataManager.updateDataProfile(variableName, 'variable-units', this.value)
  })

dataManager.on('got-first-data', function (columns) {
  columns.forEach(i => {
    yadl.select('#variable-select')
      .append(yadl.create('option').set('value', i).set('textContent', i))
  })
})