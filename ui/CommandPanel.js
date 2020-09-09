// const { ipcRenderer } = require('electron')

class CommandPanel {
  static send(command) {
    if (!dataConnectionIds.length) {
      ui.toast('No open connections!')
      return
    }
    if (!ws) {
      // This hopefully means we're on electron.

      // For now we send it to the first data connection
      ipcRenderer.send('command', command, dataConnectionIds[0])
      console.log('Sent command ' + command)
    } else {
      // for now we just send the command to the first (and probably only)
      // data connection
      ws.send(JSON.stringify({ command, id: dataConnectionIds[0] }))
    }
  }

  static handleKeyStroke(command) {
    return function () {
      CommandPanel.send(command)
    }
  }

  static setupCommand(cmd, parent) {
    // The button
    yadl.create('.command-button')
      .text(cmd.name)
      .style('backgroundColor', cmd.color || '')
      .listen('click', function () { CommandPanel.send(cmd.command) })
      .attach(parent)

    // keystroke listener
    ui.addAccelerator(cmd.accelerator, this.handleKeyStroke(cmd.command))
  }

  constructor(element, commands) {
    this.parent = element
    this.commands = commands
    this.keys = []
  }

  init() {
    let wrapper = yadl.create('.command-button-wrapper')
      .attach(this.parent)
    this.commands.forEach(c => CommandPanel.setupCommand(c, wrapper))
  }
}