const { Menu } = require('electron')
const connections = require('./connections')

module.exports = function (webContents) {
  console.log('setting up menu...')

  let template = [
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Connection',
      submenu: [
        { id: 'open-connection-name', label: 'No connections open', enabled: false },
        { type: 'separator' },
        {
          id: 'open-connection-button',
          label: 'Open connection...',
          click: function () {
            connections.open()
          }
        },
        {
          id: 'close-connection-button',
          label: 'Close connection',
          click: function () {
            connections.close()
          },
          visible: false
        }
      ]
    },
    {
      label: 'Options',
      submenu: [
        {
          label: 'Show text output',
          type: 'checkbox',
          checked: false,
          click: function (menuItem) {
            webContents.send('text-output-toggle', menuItem.checked)
          }
        },
        { type: 'separator' },
        {
          label: 'Shift graph',
          type: 'checkbox',
          checked: true,
          click: function () {
            webContents.send('shift-graph-toggle', this.checked)
          }
        },
        {
          label: 'No. of samples graphed...',
          click: function () {
            webContents.send('graph-size-open')
          }
        }
      ]
    }
  ]

  menu = Menu.buildFromTemplate(template)

  Menu.setApplicationMenu(menu)
}