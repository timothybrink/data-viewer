/**
 * The differences between this and ui.js are mostly in
 * ommissions.
 */

const ui = {}

ui.layout = {}
ui.accelerators = []

ui.init = function () {
  window.addEventListener('load', e => {
    ui.toastElement = yadl.create('.toast').attach()
  })

  let sp = new URLSearchParams(window.location.search)
  let configFile = sp.get('config') || 'ui.json'
  return fetch('/config/' + configFile)
    .then(res => res.json())
    .then(prefs => {
      ui.layout = prefs

      let container = document.querySelector('.content')
      let components = prefs.components.filter(cmp => cmp.type == 'command')
      components.forEach(component => {
        ui.commandComponent(container, component.commands)
      })

      ui.initAccelerators()
    })
    .catch(console.error)
}

ui.commandComponent = function (container, commands) {
  let commandPanel = new CommandPanel(container, commands)
  commandPanel.init()
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

ui.toast = function (message) {
  ui.toastElement.text(message)
  ui.toastElement.setClass('visible')

  setTimeout(() => ui.toastElement.removeClass('visible'), 5000)
}

ui.addAccelerator = function (key, handler) {
  ui.accelerators.push({key, handler})
}