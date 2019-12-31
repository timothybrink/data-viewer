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
  return fetch('/ui.json')
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
  ui.config.content[0].content[x].content[y] = newComponent
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