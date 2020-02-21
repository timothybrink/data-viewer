const WebSocket = require('ws')
const EventEmitter = require('events')

module.exports = class Telemetry extends EventEmitter {
  /**
   * @param {Array} fields   An array of data identifiers, to be sent to the server
   * @param {String} server  The server to use. Defaults to localhost:3300
   */
  constructor(fields, server = 'localhost:3300') {
    super()
    this.server = 'ws://' + server
    this.finished = false
    this.wsOpen = false
    this.startTime = new Date()

    this.data = {}
    this.data.fields = fields
    this.data.que = []
    this.data.pending = []

    this.ws = new WebSocket(this.server)

    let gotHeaderConfirmation = false
    this.ws.on('open', () => {
      this.wsOpen = true
      this.ws.send(JSON.stringify({ headers: this.data.fields }))
      this.emit('open')
    })

    this.ws.on('message', msg => {
      let { error, command } = JSON.parse(msg)
      if (!error && !gotHeaderConfirmation) {
        gotHeaderConfirmation = true
        this.emit('confirmed')
      } else if (error) {
        this.emit('error', error)
      } else if (command) {
        this.emit('command', command)
      }
    })
  }

  /**
   * Update the server with a complete array of new data.
   * @param {Number} time The timestamp for the data (in MS since the start of data)
   * @param {Array} data An array of data values to send to the server
   */
  updateServer(time, data) {
    if (!this.wsOpen) {
      this.data.que.push(JSON.stringify({ time, data }))
      this.emit('queued')
      return
    } else if (this.data.que.length) {
      while (this.data.que.length > 0) {
        this.ws.send(this.data.que.shift())
      }
    }
    this.ws.send(JSON.stringify({ time, data }))
  }

  /**
   * Close the server connection.
   */
  close() {
    this.ws.close()
    this.wsOpen = false
    this.finished = true
    this.emit('close')
  }

  /**
   * Adds a piece of data to be sent to the server. Data passed to this function
   * is collected and eventually sent using Telemetry.updateServer(). Also takes care of
   * sending timestamps.
   * @param {String} field The data identifier to which the data belongs
   * @param {*} data The data to send
   */
  update(field, data) {
    this.data.pending.push({ field, data })

    let hasAllFields = this.data.fields.every(f => this.data.pending.find(pd => pd.field == f))

    if (hasAllFields) {
      let time = (new Date()) - this.startTime

      let dataArr = this.data.fields.map(f => {
        let index = this.data.pending.findIndex(pd => pd.field == f)
        let d = index == -1 ? this.missingData : this.data.pending[index].data
        if (index != -1) this.data.pending.splice(index, 1)
        return d
      })

      this.updateServer(time, dataArr)
    }
  }
}