const yadl = require('@tbrink/yadl')
window.$ = require('jquery')
const GoldenLayout = require('golden-layout')
const { remote } = require('electron')
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')

const pfs = {
  readdir: promisify(fs.readdir),
  readFile: promisify(fs.readFile),
}

const ui = {}

ui.layout = {}
ui.config = {
  content: [{
    type: 'row',
    content: []
  }]
}

ui.configPath = path.join(remote.app.getPath('userData'), 'uiConfig')
ui.accelerators = []

// Not sure about this. Used to reload the entire page, which I guess should be ok still..
ui.configDialog = new Dialog(function (parent) {
  pfs.readdir(ui.configPath)
    .then(configFiles => {
      let selectEl
      parent
        .append(yadl.create('form')
          .append(yadl.create('label').text('Config to load:').setAttribute('for', 'configFile'))
          .append(selectEl = yadl.create('select').setAttribute('value', 'ui.json').setAttribute('name', 'configFile'))
          .append(yadl.create('input').setAttribute('type', 'submit').setAttribute('value', 'Load'))
          .append(yadl.create('input').setAttribute('type', 'button').setAttribute('value', 'Cancel').listen('click', e => { e.preventDefault(); ui.configDialog.hide() }))
          .listen('submit', function (e) {
            e.preventDefault()

            alert('not implemented')
          })
        )

      configFiles.forEach(file => {
        selectEl.append(yadl.create('option').text(file).setAttribute('value', file))
      })
    })
})

/**
 * Initiate the ui. Adds UI components (charts/texts) from the preferences file
 * (ui.json by default) and initiates the Golden Layout object.
 */
ui.init = function () {
  // Set up application menu
  this.appMenu = new ApplicationMenu([
    {
      label: 'Data',
      submenu: [
        {
          label: 'Export as .CSV',
          click: () => {
            let csv = dataMgr.exportAsCSV()
            
            // ask where to save
          }
        },
        {
          label: 'Clear',
          click: () => {
            dataMgr.clear()
          },
          accelerator: 'c'
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Load configuration file',
          click: () => { this.configDialog.show() }
        }
      ]
    }
  ])

  window.addEventListener('load', e => {
    this.appMenu.init(yadl.select('.app-menu'))

    ui.toastElement = yadl.create('.toast').attach()
    ui.disabler = yadl.create('.disabler').attach()
  })

  pfs.readdir(ui.configPath)
    .then(configFiles => {
      let lastUiConfig = localStorage.getItem('lastUiConfig')
      if (lastUiConfig) return lastUiConfig
      else if (configFiles[0]) {
        let url = path.join(ui.configPath, configFiles[0])
        localStorage.setItem('lastUiConfig', url)
        return url
      } else {
        let url = path.join(remote.app.getAppPath(), 'ui', 'config', 'ui.json')
        localStorage.setItem('lastUiConfig', url)
        return url
      }
    })
    .then(filename => pfs.readFile(filename, 'utf8'))
    .then(JSON.parse)
    .then(prefs => {
      // Set up the ui
      ui.layout = prefs

      let [width, height] = prefs.gridSize.split('x').map(Number)
      ui.height = height
      ui.width = width

      prefs.components.forEach(ui.addComponent)

      for (let x = 0; x < ui.config.content[0].content.length; x++) {
        if (!ui.config.content[0].content[x]) {
          console.warn('UI: Config: Removing empty column!')
          ui.config.content[0].content.splice(x, 1)
        } else {
          let column = ui.config.content[0].content[x]
          for (let y = 0; y < column.content.length; y++) {
            if (!column.content[y]) {
              console.warn('UI: Config: Removing empty row position!')
              column.content.splice(y, 1)
            }
          }
        }
      }

      let container = document.querySelector('.gl-container')
      container.style.height = (window.innerHeight - 33) + 'px'
      ui._glObj = new GoldenLayout(ui.config, container)
      ui._glObj.registerComponent('textComponent', ui.textComponent)
      ui._glObj.registerComponent('chartComponent', ui.chartComponent)
      ui._glObj.registerComponent('commandComponent', ui.commandComponent)
      ui._glObj.init()
      window.addEventListener('resize', function (e) {
        container.style.height = (window.innerHeight - 33) + 'px'
        container.style.width = window.innerWidth + 'px'
        ui._glObj.updateSize()
      })

      ui.initAccelerators()
    })
    .catch(console.error)
}

/**
 * Add a Golden Layout component to the GL config, given the user's
 * component defined in ui.json
 */
ui.addComponent = function (component) {
  let [x, y] = component.position.split(' ').map(Number)

  if (!ui.config.content[0].content[x])
    ui.config.content[0].content[x] = { type: 'column', content: [] }

  let newComponent = {
    type: 'component',
    componentName: component.type + 'Component'
  }
  let fields = []
  if (typeof component.dataName == 'string')
    fields = [component.dataName]
  else
    fields = component.dataName

  newComponent.componentState = {
    fields,
    description: component.description,
    color: component.color,
    commands: component.commands,
    scale: component.scale,
    displaySamples: component.displaySamples
  }
  let position = ui.config.content[0].content[x].content[y]
  if (position && position.type == 'stack') {
    // There is already a stack. Add newComponent
    position.content.push(newComponent)
  } else if (position && position.type == 'component') {
    // No stack, need to wrap the old component in a stack.
    ui.config.content[0].content[x].content[y] = { type: 'stack', content: [position, newComponent] }
  } else {
    ui.config.content[0].content[x].content[y] = newComponent
  }
}

/**
 * The chart component. This function is passed to GoldenLayout#registerComponent.
 */
ui.chartComponent = function (container, state) {
  let graph = new Graph(container.getElement()[0], state.fields.map(dataMgr.getDataSet))
  graph.options.color = state.color
  graph.options.scale = state.scale || 'auto'
  graph.options.shiftSize = state.displaySamples || 100
  graph.init()
  container.setTitle(state.description)
  return graph
}

/**
 * The text component. This function is passed to GoldenLayout#registerComponent.
 */
ui.textComponent = function (container, state) {
  let textViewer = new TextViewer(container.getElement()[0], state.fields.map(dataMgr.getDataSet))
  textViewer.init()
  container.setTitle(state.description)
  return textViewer
}

/**
 * The command component. This function is passed to GoldenLayout#registerComponent.
 */
ui.commandComponent = function (container, state) {
  let commandPanel = new CommandPanel(container.getElement()[0], state.commands)
  commandPanel.init()
  container.setTitle(state.description || 'Commands')
  return commandPanel
}

ui.initAccelerators = function () {
  window.addEventListener('keydown', function (e) {
    let accel = ui.accelerators.find(a => a.key == e.key)
    if (!accel) return

    e.preventDefault()
    if (typeof accel.handler == 'function') accel.handler(e)
  })
}

ui.toast = function (message, time = 5) {
  ui.toastElement.text(message)
  ui.toastElement.setClass('visible')

  if (time != 0)
    setTimeout(() => ui.toastElement.removeClass('visible'), time * 1000)
}

ui.addAccelerator = function (key, handler) {
  ui.accelerators.push({key, handler})
}

ui.clearData = function () {
  let charts = ui._glObj.root.getComponentsByName('chartComponent')
  charts.forEach(c => c.clear())
}

ui.disable = function (msg) {
  ui.toast(msg, 0)
  ui.disabler.setClass('visible')
}

ui.enable = function () {
  if (ui.toastElement)
    ui.toastElement.removeClass('visible')
  if (ui.disabler)
    ui.disabler.removeClass('visible')
}