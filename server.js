const express = require('express')
const app = express()
const expressWs = require('express-ws')(app)
const Connection = require('./Connection')
const { readdir } = require('fs')

const HOST = process.argv[2] || 'localhost'
const PORT = process.argv[3] || '3300'

const connections = []
const uiConnections = []

// The UI is served here.
app.use(express.static('./ui/'))

// Websocket route for UI
app.ws('/wsui', function (ws, req) {
  uiConnections.push(ws)

  ws.on('message', function (msg) {
    if (msg == 'open-conn') {
      connections.forEach(conn => ws.send(JSON.stringify({
        event: 'data-opened',
        id: conn.id,
        headers: conn.headers
      })))
    } else {
      try {
        let { command, id } = JSON.parse(msg)
        console.log('got command', command)
        let conn = connections.find(c => c.id == id)
        if (!conn) console.error('Connection not found!')
        else {
          let data = { command }
          conn.websocket.send(JSON.stringify(data))
        }
      } catch (e) {
        console.error(e)
      }
    }
  })

  ws.on('close', function () {
    uiConnections.splice(uiConnections.indexOf(ws), 1)
  })
})

app.get('/configs', function (req, res, next) {
  readdir('./ui/config', function (err, files) {
    if (err) return next(err)

    res.json(files)
  })
})

// WebSocket data sources
// Usage: connect to the server address (root). Then send a message with your
// data headers (JSON, like so: { headers: [] }). After that, you can send data
// in JSON in the following format: { data: <data>, time: <time> }
// Data from the ui (i.e. commands) will be sent to you in the following form: { command: * }
app.ws('/', function (ws, req) {
  // Generate connection id
  let id = Connection.generateId()
  while (connections.find(i => i.id == id)) {
    id = Connection.generateId()
  }

  let conn = new Connection(id, [], ws)
  connections.push(conn)
  console.log('New data connection (WS). ID:', id)

  ws.on('message', function (msg) {
    try {
      let { headers, data, time } = JSON.parse(msg)

      if (headers) {
        conn.headers = headers
        uiConnections.forEach(ws => ws.send(JSON.stringify({ event: 'data-opened', id, headers })))
        // acknowledge reciept of headers
        ws.send(JSON.stringify({ gotHeaders: true }))
      } else {
        conn.update(data)
        uiConnections.forEach(ws => ws.send(JSON.stringify({ id, time, data })))
      }
    } catch (e) {
      console.error(e.stack)
      ws.send(JSON.stringify({ error: e.message }))
    }
  })

  ws.on('close', function () {
    conn.close()
    connections.splice(connections.indexOf(conn), 1)
    uiConnections.forEach(ws => ws.send(JSON.stringify({ event: 'data-closed', id })))
    console.log('WS connection closed. ID:', id)
  })
})

// Requested when initiating a telemetry stream. Sets up headers.
// Expected format: /init?headers=<JSON array>&timeout=<timeout in MS>
app.get('/init', function (req, res, next) {
  try {
    // Get data headers
    let headers = JSON.parse(req.query.headers)
    let timeout = Number(req.query.timeout)

    // Generate connection id
    let id = Connection.generateId()
    while (connections.find(i => i.id == id)) {
      id = Connection.generateId()
    }

    connections.push(new Connection(id, headers, timeout))
    uiConnections.forEach(ws => ws.send(JSON.stringify({ event: 'data-opened', id, headers })))

    res.json({ done: true, id })
  } catch (e) {
    console.error(e.stack)
    res.json({ done: false, error: e.message })
  }
})

// Requested when providing data.
// Expected format: /update?id=<id>&time=<timestamp>&data=<JSON array>
const timeouts = []
app.get('/update', function (req, res, next) {
  try {
    // Get connection
    let id = Number(req.query.id)
    let conn = connections.find(i => i.id == id)

    // Clear previous timeout
    let timeoutIndex = timeouts.findIndex(t => t.id == id)
    if (timeouts[timeoutIndex]) {
      clearTimeout(timeouts[timeoutIndex].timeout)
      timeouts.splice(timeoutIndex, 1)
    } else {
      console.error('timeout not found')
    }

    if (!conn) {
      res.json({ done: false, error: 'Invalid ID' })
      return
    }

    // Get data
    let data = JSON.parse(req.query.data)
    let time = Number(req.query.time)

    conn.update(data)
    uiConnections.forEach(ws => ws.send(JSON.stringify({ id, time, data })))

    // Set timeout
    let timeout = setTimeout(() => {
      conn.close()
      connections.splice(connections.findIndex(i => i.id == id), 1)
      uiConnections.forEach(ws => ws.send(JSON.stringify({ event: 'data-closed', id })))
      console.log(`Connection ${id} closed (timeout).`)
    }, conn.timeout)
    timeouts.push({ id, timeout })

    res.send()
  } catch (e) {
    console.error(e.stack)
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
  connections.splice(connections.findIndex(i => i.id == id), 1)
  uiConnections.forEach(ws => ws.send(JSON.stringify({ event: 'data-closed', id })))
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

app.listen(PORT, HOST, function () {
  console.log(`Telemetry server listening on ${HOST}:${PORT}...`)
})