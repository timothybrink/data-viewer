const SerialPortTelemetry = require('./SerialPortTelemetry')

let port = process.argv[2]
let spt = new SerialPortTelemetry(port)
if (process.argv[3]) {
  spt.baudRate = Number(process.argv[3])
}
spt.init()