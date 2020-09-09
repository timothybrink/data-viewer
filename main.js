const { app, BrowserWindow } = require('electron')
const url = require('url')
const path = require('path')
const fs = require('fs')

function createWindow() {
  // Create the browser window
  // Create the browser window.
  let win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    backgroundColor: '#1E1E1E',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    show: false,
  })

  // and load the index.html of the app.
  win.loadURL(url.format({
    protocol: 'file',
    pathname: path.join(__dirname, 'ui', 'index.html'),
  }))

  win.once('ready-to-show', function () {
    win.show()
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Set up telemetry config files
let uiConfigPath = path.join(app.getPath('userData'), 'uiConfig')
fs.mkdir(uiConfigPath, () => {
  console.log('Created config directory: ' + uiConfigPath)
})