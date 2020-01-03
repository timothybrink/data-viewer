module.exports = class Connection {
  static generateId() {
    return Math.round(Math.random() * 10000)
  }

  constructor(id, headers, websocket) {
    this.id = id
    this.headers = headers
    if (typeof websocket == 'number')
      this.timeout = websocket
    else
      this.websocket = websocket
    this.data = []
    this.finished = false
  }

  update(data) {
    this.data.push(data)
  }

  close() {
    this.finished = true
  }
}