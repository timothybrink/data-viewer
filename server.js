const express = require('express')
const app  = express()

const PORT = '3300'

// Requested when initiating a telemetry stream. Sets up headers.
app.get('/init')

// Requested when providing data.
app.get('/update')

// Requested when closing a telemetry stream.
app.get('/close')

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