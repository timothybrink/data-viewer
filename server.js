const express = require('express')
const app = express()
const Connection = require('./Connection')

const PORT = '3300'

const connections = []

// The UI is served here.
app.use(express.static('./ui/'))

// Requested when initiating a telemetry stream. Sets up headers.
// Expected format: /init?headers=<JSON array>
app.get('/init', function (req, res, next) {
  try {
    // Get data headers
    let headers = JSON.parse(req.query.headers)

    // Generate connection id
    let id = Connection.generate_id()
    while (connections.find(i => i.id == id)) {
      id = Connection.generate_id()
    }

    connections.push(new Connection(id, headers))

    res.json({ done: true })
  } catch (e) {
    res.json({ done: false, error: 'JSON parse error' })
  }
})

// Requested when providing data.
// Expected format: /update?id=<id>&data=<JSON array>
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

    conn.update(data)

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

  res.send()
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