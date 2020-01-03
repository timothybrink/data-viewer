const ui = {}

ui.layout = {}
ui.config = {
  content: [{
    type: 'row',
    content: []
  }]
}

/**
 * Initiate the ui. Adds UI components (charts/texts) from the preferences file
 * (ui.json by default) and initiates the Golden Layout object.
 */
ui.init = function () {
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

      ui._glObj = new GoldenLayout(ui.config)
      ui._glObj.registerComponent('textComponent', ui.textComponent)
      ui._glObj.registerComponent('chartComponent', ui.chartComponent)
      ui._glObj.init()
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