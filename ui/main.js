ui.init()

class Connection extends EventTarget {
  constructor() {
    super()
    this.open = false
  }
  /**
   * Set the state of the connection (open, not open)
   * @param {Boolean} open Set if the connection is open or not
   */
  set(open) {
    if (this.open !== open) {
      let event = new Event(open ? 'open' : 'close')
      this.dispatchEvent(event)
      this.open = open
    }
  }
}

let dataConnectionIds = []
let ws
let connectionStatus = new Connection()

function initWebSocket(retry) {
  // Open websocket to server
  ws = new WebSocket(`ws://${location.host}/wsui`)
  if (retry) console.log('Trying to connect...')

  ws.addEventListener('open', function (event) {
    ws.send('open-conn')
    connectionStatus.set(true)
  })

  ws.addEventListener('message', function (event) {
    // We got something from the server:
    data = JSON.parse(event.data)
    // Not data, just a message telling us the server has a new data source
    if (data.event == 'data-opened') {
      console.log('Headers received:', data.headers)
      dataMgr.initDataStream(data.id, data.headers)
      dataConnectionIds.push(data.id)
    }
    // Not data either, a message telling us that a connection to the
    // server was closed
    else if (data.event == 'data-closed') {
      console.log('Data stream', data.id, 'closed.')
      dataMgr.closeDataStream(data.id)
      dataConnectionIds.splice(dataConnectionIds.indexOf(data.id), 1)
    }
    // Data was recieved from the source with the given id.
    else if (data.data) {
      dataMgr.newData(data.id, data.time, data.data)
    }
  })

  ws.addEventListener('close', function (event) {
    connectionStatus.set(false)
    setTimeout(() => initWebSocket(true), 5000)
  })
}

initWebSocket()

connectionStatus.addEventListener('open', e => {
  ui.enable()
  console.log('Connection to server open')
})
connectionStatus.addEventListener('close', e => {
  ui.disable('Connection to server lost. Trying again in 5 seconds.')
  console.log('Connection to server lost.')
})