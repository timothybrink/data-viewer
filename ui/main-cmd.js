ui.init()

// Open websocket to server
let ws = new WebSocket(`ws://${location.host}/wsui`)
let dataConnectionIds = []

ws.addEventListener('open', function (event) {
  ws.send('open-conn')
  console.log('Connection to server initiated')
})

ws.addEventListener('message', function (event) {
  try {
    data = JSON.parse(event.data)

    if (data.event == 'data-opened') {
      dataConnectionIds.push(data.id)
    }

    else if (data.event == 'data-closed') {
      dataConnectionIds.splice(dataConnectionIds.indexOf(data.id), 1)
    }
  } catch (e) {
    console.error(e)
  }
})

ws.addEventListener('error', function (event) {
  console.error(event)
})

ws.addEventListener('close', function (event) {
  console.log('Connection closed')
})