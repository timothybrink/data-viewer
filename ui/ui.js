const ui = {}

ui.layout = {}
ui.config = {
  content: [{
    type: 'row',
    content: []
  }]
}

ui.configDialog = new Dialog(function (parent) {
  fetch('/configs')
    .then(res => res.json())
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

            let sp = new URLSearchParams(window.location.search)
            sp.set('config', this.configFile.value)
            window.location.search = sp.toString()
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
            let element = yadl.create('a')
              .setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv))
              .setAttribute('download', 'data.csv')
              .style('display', 'none')
              .attach()
            element._element.click()
            element.remove()
          }
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
  })

  let sp = new URLSearchParams(window.location.search)
  let configFile = sp.get('config') || 'ui.json'
  return fetch('/config/' + configFile)
    .then(res => res.json())
    .then(prefs => {
      // Set up the ui
      ui.layout = prefs

      let [width, height] = prefs.gridSize.split('x').map(Number)
      ui.height = height
      ui.width = width

      prefs.components.forEach(ui.addComponent)

      let container = document.querySelector('.gl-container')
      container.style.height = (window.innerHeight - 33) + 'px'
      ui._glObj = new GoldenLayout(ui.config, container)
      ui._glObj.registerComponent('textComponent', ui.textComponent)
      ui._glObj.registerComponent('chartComponent', ui.chartComponent)
      ui._glObj.init()
      window.addEventListener('resize', function (e) {
        container.style.height = (window.innerHeight - 33) + 'px'
        container.style.width = window.innerWidth + 'px'
        ui._glObj.updateSize()
      })
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