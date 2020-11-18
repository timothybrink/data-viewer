/**
 * Main plugin manager.
 */

const fs = require('fs')
const path = require('path')

function log(msg) {
  console.log('PLUGIN_MGR: ' + msg)
}

const PLUGIN_DIRECTORY = path.join(__dirname, 'plugins')
const PLUGIN_CONFIG_PATH = process.argv[2]

/**
 * Requires 'index.js' in every subfolder of ./plugins.
 */
let plugins = fs.readdirSync(PLUGIN_DIRECTORY)
log('Plugins found: ' + plugins.join(','))

plugins.forEach(pluginName => {
  // Constructor exported from index.js
  let PluginClass = require(path.join(PLUGIN_DIRECTORY, pluginName, 'index.js'))

  // Options are in appData/pluginConfig, named with the plugin name
  let options = require(path.join(PLUGIN_CONFIG_PATH, `${pluginName}.json`))

  // Options object is passed directly to the constructor
  let instance = new PluginClass(options)

  // Initialize called on the instance; expects an array of headers returned.
  if (!instance.init) throw new Error('Plugin instances require a init() method!')

  let headers = instance.init()
  if (!headers && !Array.isArray(headers)) throw new Error('init() must return an array of headers!')

  // Pass the dataOpen event up
  process.send({ event: 'dataOpen', dataId: pluginName, data: headers }, err => {
    if (err) console.error(err)
  })

  if (!instance.on) throw new Error('Plugins must be an EventEmitter')
  instance.on('data', (data, time) => {
    if (!data || !time) throw new Error('Data events must have data and time arguments!')

    // Pass it up
    process.send({ event: 'data', dataId: pluginName, data, time }, err => {
      if (err) console.error(err)
    })
  })

  instance.on('close', () => {
    // Pass it up
    process.send({ event: 'dataClose', dataId: pluginName }, err => {
      if (err) console.error(err)
    })
  })

  log('initialized plugin ' + pluginName)
})