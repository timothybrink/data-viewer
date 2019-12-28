let ws = new WebSocket('ws://localhost:3300/wsui')

ws.addEventListener('open', function (event) {
  ws.send('open-conn')
  console.log('Connection to server initiated')
})

ws.addEventListener('message', function (event) {
  data = JSON.parse(event.data)
  if (data.event == 'data-opened') {
    dataMgr.initDataStream(data.id, data.headers)
  } else if (data.event == 'data-closed') {
    dataMgr.closeDataStream(data.id)
  } else if (data.data) {
    dataMgr.newData(data.id, data.data)
  }
})

ws.addEventListener('error', function (event) {
  console.error(event)
})

ws.addEventListener('close', function (event) {
  console.log('Connection closed')
})