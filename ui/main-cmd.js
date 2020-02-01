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
    try {
      data = JSON.parse(event.data)

      if (data.event == 'data-opened') {
        dataConnectionIds.push(data.id)
      }

      else if (data.event == 'data-closed') {
        dataConnectionIds.splice(dataConnectionIds.indexOf(data.id), 1)
      }
    } catch (e) {
      console.error(e)
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
  ui.disable('Connection to server closed. Trying again in 5 seconds.')
  console.log('Connection to server closed.')
})