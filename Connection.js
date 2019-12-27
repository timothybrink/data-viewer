module.exports = class Connection {
  static generateId() {
    return Math.round(Math.random() * 10000)
  }

  constructor(id, headers) {
    this.id = id
    this.headers = headers
    this.data = []
    this.finished = false
  }

  addUpdater(fn) {
    this.updater = fn
  }

  update(data) {
    this.data.push(data)
    this.updater(data)
  }

  close() {
    this.finished = true
  }
}