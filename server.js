const express = require('express')
const app = express()
const expressWs = require('express-ws')(app)
const Connection = require('./Connection')

const PORT = '3300'

const connections = []
const uiConnections = []

// The UI is served here.
app.use(express.static('./ui/'))

// Websocket route for UI
app.ws('/wsui', function (ws, req) {
  uiConnections.push(ws)

  ws.on('message', function (msg) {
    if (msg == 'open-conn') {
      console.log('New UI Connection')
      connections.forEach(conn => ws.send(JSON.stringify({
        event: 'data-opened',
        id: conn.id,
        headers: conn.headers
      })))
    }
  })

  ws.on('close', function () {
    uiConnections.splice(uiConnections.indexOf(ws), 1)
  })
})

// Requested when initiating a telemetry stream. Sets up headers.
// Expected format: /init?headers=<JSON array>
app.get('/init', function (req, res, next) {
  try {
    // Get data headers
    let headers = JSON.parse(req.query.headers)

    // Generate connection id
    let id = Connection.generateId()
    while (connections.find(i => i.id == id)) {
      id = Connection.generateId()
    }

    connections.push(new Connection(id, headers))
    uiConnections.forEach(ws => ws.send(JSON.stringify({ event: 'data-opened', id, headers })))

    res.json({ done: true, id })
  } catch (e) {
    console.error(e.stack)
    res.json({ done: false, error: 'JSON parse error' })
  }
})

// Requested when providing data.
// Expected format: /update?id=<id>&time=<timestamp>&data=<JSON array>
app.get('/update', function (req, res, next) {
  try {
    // Get connection
    let id = Number(req.query.id)
    let conn = connections.find(i => i.id == id)

    if (!conn) {
      res.json({ done: false, error: 'Invalid ID' })
      return
    }

    // Get data
    let data = JSON.parse(req.query.data)
    let time = Number(req.query.time)

    conn.update(data)
    uiConnections.forEach(ws => ws.send(JSON.stringify({ id, time, data })))

    res.send()
  } catch (e) {
    res.json({ done: false, error: 'Something is wrong with your update request' })
  }
})

// Requested when closing a telemetry stream.
// Expected format: /close?id=<id>
app.get('/close', function (req, res, next) {
  // Get connection
  let id = Number(req.query.id)
  let conn = connections.find(i => i.id == id)

  if (!conn) {
    res.json({ done: false, error: 'Invalid ID' })
    return
  }

  conn.close()
  uiConnections.forEach(ws => ws.send(JSON.stringify({event: 'data-closed', id})))
  console.log('Connection closed.')

  res.json({ done: true })
})

// Error handling
app.use(function (req, res) {
  res.status(404).send('Not found.')
})

app.use(function (err, req, res, next) {
  if (res.headersSent)
    return next(err)

  console.error(err.stack)
  res.status(500).send('Error 500')
})

app.listen(PORT, function () {
  console.log(`Telemetry server listening on port ${PORT}...`)
})