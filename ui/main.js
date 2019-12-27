let ws = new WebSocket('ws://localhost:3300/ws')

ws.addEventListener('open', function (event) {
  ws.send('New connection')
})

ws.addEventListener('message', function (event) {
  console.log(event.data)
})