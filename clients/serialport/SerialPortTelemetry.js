const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const WebSocket = require('ws')

module.exports = class SerialPortTelemetry {
  constructor(port, baudRate = 9600, server = 'localhost:3300') {
    this.port = port
    this.baudRate = baudRate
    this.server = 'ws://' + server
    this.finished = false
    this.ws = null
    this.wsOpen = false

    this.data = {}
    this.data.fields = []
    this.data.separator = ','
    this.data.queue = []
    this.data.initiator = '#start'
    this.data.started = false
  }

  setHeaders(headers) {
    this.data.fields = headers
    this.initiateServer()
  }

  init() {
    this.serialPort = new SerialPort(this.port, { baudRate: this.baudRate })

    this.parser = new Readline()
    this.serialPort.pipe(this.parser)

    this.serialPort.on('open', () => console.log('Serial connection open'))

    this.parser.on('data', data => {
      // Expects the serial client to sent a initiator string before
      // sending data to the telemetry string. This is to remove junk
      // data from old serial sessions.
      if (!this.data.started) {
        this.data.started = data.includes(this.data.initiator)
        return
      }
      data = data.split(this.data.separator)

      // Tries to make data numbers
      data = data.map(val => {
        if (isNaN(Number(val)))
          return val
        else
          return Number(val)
      })
      
      if (data.length != this.data.fields.length + 1)
        console.log('Something is wrong with the incoming data...')
      // Assumes time is in the first column
      this.update(data.shift(), data)
    })

    this.serialPort.on('error', e => {
      console.error(e.message)
      process.exit(0)
    })
  }

  initiateServer() {
    this.ws = new WebSocket(this.server)

    let gotHeaderConfirmation = false
    this.ws.on('open', () => {
      this.wsOpen = true
      this.ws.send(JSON.stringify({ headers: this.data.fields }))
    })

    this.ws.on('message', msg => {
      let { error } = JSON.parse(msg)
      if (!error && !gotHeaderConfirmation) {
        gotHeaderConfirmation = true
        console.log('Server connection initiated.')
      } else if (error) {
        console.error('Connection error:', error)
      }
    })
  }

  update(time, data) {
    if (!this.wsOpen) {
      this.data.queue.push(JSON.stringify({ time, data }))
      return console.log('Websocket not yet open!')
    } else if (this.data.queue.length) {
      for (let i = 0; i < this.data.queue.length; i++) {
        this.ws.send(this.data.queue.shift())
      }
    }
    this.ws.send(JSON.stringify({ time, data }))
  }

  close() {
    this.serialPort.close(err => {
      if (!err) console.log('Serial connection closed.')

      this.ws.close()
      console.log('Telemetry connection closed')
    })
  }
}