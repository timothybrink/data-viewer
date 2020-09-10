const EventEmitter = require('events')

module.exports = class TestPlugin extends EventEmitter {
  constructor(options) {
    super()
    this.thing = 'test'
    this.length = options.length
    this.startTime = null
  }

  init() {
    this.emit('data', [1, 2, 1, 1], 0)
    this.startTime = new Date()

    let i = setInterval(() => {
      this.emit('data',
        [
          Math.round(Math.random() * 1000),
          Math.round(Math.random() * 1000),
          Math.round(Math.random() * 1000),
          Math.round(Math.random() * 1000)
        ],
        (new Date()) - this.startTime)
    }, this.length)

    setTimeout(() => {
      clearInterval(i)
      this.emit('close')
    }, 15000)

    return ['test1', 'test2', 'test3', 'test4']
  }

  processCommand(command) {
    console.log('Test plugin got command ' + command)
  }
}