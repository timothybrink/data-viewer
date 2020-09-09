const { ipcRenderer } = require('electron')

ui.init()

let dataConnectionIds = []

ipcRenderer.on('dataOpen', function (event, id, headers) {
  console.log('Headers received:', headers)
  dataMgr.initDataStream(id, headers)
  dataConnectionIds.push(id)
})

ipcRenderer.on('dataClose', function (event, id) {
  console.log('Data stream', id, 'closed.')
  dataMgr.closeDataStream(id)
  dataConnectionIds.splice(dataConnectionIds.indexOf(id), 1)
})

ipcRenderer.on('data', function (event, id, time, data) {
  dataMgr.newData(id, time, data)
})