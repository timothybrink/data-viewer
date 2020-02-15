const SerialPortTelemetry = require('./SerialPortTelemetry')
const yargs = require('yargs')

yargs
  .option('port', {
    alias: 'p',
    type: 'string',
    description: 'Serial port to connect to'
  })
  .option('sep', {
    alias: 's',
    type: 'string',
    description: 'Data separator to use (e.g. \',\' or \'|\')'
  })
  .option('br', {
    alias: 'b',
    type: 'number',
    description: 'Baud rate to connect with'
  })
  .option('headers', {
    alias: 'h',
    type: 'array',
    description: 'Names for the data columns (in order)'
  })
  .option('server', {
    type: 'string',
    description: 'Telemetry server to connect to'
  })

argv = yargs.argv

if (!argv.headers || !argv.port) {
  console.error('Please include a port and headers!')
  process.exit(0)
}

console.log('Port:', argv.port)
console.log('Separator:', argv.sep || ',')
console.log('Baud rate:', argv.br)
console.log('Headers:', argv.headers)
console.log('Server:', argv.server)

let spt = new SerialPortTelemetry(argv.port, argv.br, argv.server)
spt.data.seperator = argv.seperator
spt.setHeaders(argv.headers)
spt.oncommand = function (command) {
  if (command == '#init') {
    spt.init()
  } else if (command == '#close') {
    spt.close(true)
  }
}