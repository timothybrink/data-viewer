const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const http = require('http')

module.exports = class SerialPortTelemetry {
  // Add a fields argument to use instead of those found in the data... works better generally.
  // But fall back to fields found in the data.
  constructor(port, baudRate = 9600, server = 'http://localhost:3300') {
    this.port = port
    this.baudRate = baudRate
    this.server = server
    this.finished = false
    this.serverId = 0

    this.data = {}
    this.data.fields = []
    this.data.separator = ','
  }

  init() {
    this.serialPort = new SerialPort(this.port, { baudRate: this.baudRate })

    this.parser = new Readline()
    this.serialPort.pipe(this.parser)

    this.serialPort.on('open', () => console.log('Serial connection open'))

    this.parser.on('data', data => {
      if (!this.data.fields.length) {
        data = data.split(this.data.separator)
        data.shift()
        this.data.fields = data
        this.initiateServer()
      } else {
        data = data.split(this.data.separator)
        // Assumes time is in the first column
        this.update(data.shift(), data)
      }
    })

    this.serialPort.on('error', e => {
      console.error(e.message)
    })
  }

  initiateServer() {
    http.get(this.server + `/init?headers=${JSON.stringify(this.data.fields)}`, res => {
      if (res.statusCode != 200)
        console.log(res.statusCode)

      let data = []
      res.on('data', chunk => data.push(chunk))
      res.on('end', () => {
        data = data.map(b => b.toString('utf-8')).join('')
        let { done, id, error } = JSON.parse(data)
        if (done) {
          this.serverId = Number(id)
          console.log('Telemetry connection initiated.')
        } else {
          console.log('Connection not initated. Error:', error)
        }
      })
    })
  }

  update(time, data) {
    http.get(this.server + `/update?id=${this.serverId}&time=${time}&data=${JSON.stringify(data)}`, res => {
      if (res.statusCode != 200)
        console.log(res.statusCode)

      let data = []
      res.on('data', chunk => data.push(chunk))
      res.on('end', () => {
        let str = data.map(b => b.toString('utf-8')).join('')
        if (str) {
          let { done, error } = JSON.parse(str)
          if (!done)
            console.log(error, this.serverId)
        }
      })
    })
  }

  close() {
    this.serialPort.close(err => {
      if (!err) console.log('Serial connection closed.')

      http.get(this.server + `/close?id=${this.serverId}`, (err, data) => {
        if (err) return console.error(err)

        data = JSON.parse(data)

        if (data.done) {
          this.serverId = 0
        }
        this.finished = true
        console.log('Telemetry connection closed')
      })
    })
  }
}