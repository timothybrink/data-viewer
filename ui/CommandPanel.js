class CommandPanel {
  static send(command) {
    if (!ws) return console.error('WS not defined!')
    if (!dataConnectionIds.length) {
      let dialog = new Dialog(parent => parent
        .append(yadl.create('div').text('No connections are open yet!'))
        .append(yadl.create('button').text('Close').listen('click', e => { e.preventDefault(); dialog.hide() }))
      )
      dialog.show()
      return
    }

    // for now we just send the command to the first (and probably only)
    // data connection
    ws.send(JSON.stringify({ command, id: dataConnectionIds[0] }))
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