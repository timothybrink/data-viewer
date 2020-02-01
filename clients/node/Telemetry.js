const WebSocket = require('ws')

module.exports = class Telemetry {
  /**
   * @param {Array} fields   An array of data identifiers, to be sent to the server
   * @param {String} server  The server to use. Defaults to localhost:3300
   */
  constructor(fields, server = 'localhost:3300') {
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
      if (typeof this._onopen == 'function') this._onopen()
    })

    this.ws.on('message', msg => {
      let { error, command } = JSON.parse(msg)
      if (!error && !gotHeaderConfirmation) {
        gotHeaderConfirmation = true
        console.log('Telemetry connection initiated.')
      } else if (error) {
        console.error('Connection error:', error)
      } else if (command) {
        if (typeof this._oncommand == 'function') this._oncommand(command)
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
      return console.log('Websocket not yet open!')
    } else if (this.data.que.length) {
      for (let i = 0; i < this.data.que.length; i++) {
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
    console.log('Telemetry connection closed')
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

  /**
   * Listen for events
   * @param {String} event      The event to listen for. Supported: 'open'
   * @param {Function} handler  The handler to call
   */
  on(event, handler) {
    this['_on' + event] = handler
  }
}