module.exports = class Connection {
  static generateId() {
    return Math.round(Math.random() * 10000)
  }

  constructor(id, headers, timeout) {
    this.id = id
    this.headers = headers
    this.timeout = timeout
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