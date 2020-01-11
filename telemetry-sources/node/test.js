const Telemetry = require('./Telemetry')

let t = new Telemetry(['test1', 'test2', 'test3', 'test4'])

t.on('open', () => {
  t.update('test2', 2)
  t.update('test1', 1)
  t.update('test3', 1)
  t.update('test4', 1)

  setInterval(() => {
    t.update('test2', Math.round(Math.random() * 1000))
    t.update('test1', Math.round(Math.random() * 1000))
    t.update('test3', Math.round(Math.random() * 1000))
    t.update('test4', Math.round(Math.random() * 1000))
  }, 100)
})

setTimeout(() => { t.close(); process.exit() }, 5000)