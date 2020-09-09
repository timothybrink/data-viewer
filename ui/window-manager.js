const currentElectronWindow = require('electron').remote.getCurrentWindow()

// titlebar active/inactive styling
currentElectronWindow.on('focus', function (e) {
  this.document.querySelector('.titlebar').classList.add('active')
})

currentElectronWindow.on('blur', function (e) {
  this.document.querySelector('.titlebar').classList.remove('active')
})

// window controls
yadl.select('#window-controls-close')
  .listen('click', function () {
    currentElectronWindow.close()
  })

yadl.select('#window-controls-min')
  .listen('click', function () {
    currentElectronWindow.minimize()
  })

yadl.select('#window-controls-max')
  .listen('click', function () {
    currentElectronWindow.maximize()
  })

yadl.select('#window-controls-unmax')
  .listen('click', function () {
    currentElectronWindow.unmaximize()
  })

// listeners for max and unmax events, to show/hide the button
currentElectronWindow.on('maximize', function () {
  yadl.select('#window-controls-max')
    .classList.add('hidden')
  yadl.select('#window-controls-unmax')
    .classList.remove('hidden')
})

currentElectronWindow.on('unmaximize', function () {
  yadl.select('#window-controls-unmax')
    .classList.add('hidden')
  yadl.select('#window-controls-max')
    .classList.remove('hidden')
})