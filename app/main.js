const { app, BrowserWindow } = require('electron')
const path = require('path')
const setupMenu = require('./main/menu')

let win

app.on('ready', function () {
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'))

  // win.webContents.openDevTools()

  setupMenu(win.webContents)

  win.on('closed', () => {
    win = null
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})