class CommandPanel {
  constructor(element, commands) {
    this.parent = element
    this.commands = commands
  }

  createButton(cmd) {
    return yadl.create('.command-button')
      .text(cmd.name)
      .style('backgroundColor', cmd.color || '')
      .listen('click', function (e) {
        if (!ws) return console.error('WS not defined!')
        if (!dataConnectionIds.length) {
          let dialog = new Dialog(parent => parent
            .append(yadl.create('div').text('No connections are open yet!'))
            .append(yadl.create('button').text('Close').listen('click', e => {e.preventDefault(); dialog.hide()}))
            )
          dialog.show()
          return
        }

        // for now we just send the command to the first (and probably only)
        // data connection
        ws.send(JSON.stringify({ command: cmd.command, id: dataConnectionIds[0] }))
      })
  }

  init() {
    let wrapper = yadl.create('.command-button-wrapper')
      .attach(this.parent)
    let buttons = this.commands.map(c => this.createButton(c))
    buttons.forEach(e => {
      e.attach(wrapper)
    })
  }
}