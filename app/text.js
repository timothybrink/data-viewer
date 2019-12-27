const { ipcRenderer } = require('electron')

let autoscrollOn = true
let displayText = false

ipcRenderer.on('text-output-toggle', function (event, data) {
  displayText = data
})

let parent = document.querySelector('#text-output')

module.exports.show = function (data) {
  if (displayText) {
    let elt = document.createElement('div')

    elt.innerHTML = data
    parent.appendChild(elt)

    if (autoscrollOn) {
      elt.scrollIntoView()
    }

    if (parent.children.length > 500) {
      parent.firstChild.remove()
    }
  }
}

module.exports.isOn = function () {
  return displayText
}