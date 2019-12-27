const dialog = require('./dialog')
const Chart = require('chart.js')
const { ipcRenderer } = require('electron')

const options = {
  graph: {
    shift: true,
    shiftSize: 100,
    chartjsOptions: {
      elements: {
        line: {
          tension: 0
        }
      }
    }
  },
  data: {
    sep: '|',
    dataStartIndicator: '--begin-graph-data--'
  }
}

ipcRenderer.on('shift-graph-toggle', function (checked) {
  options.graph.shift = checked
})

ipcRenderer.on('graph-size-open', function () {
  let dialogElt = dialog(
    `<form action="dialog">
      <input type="text" name="graphSize" id="graphSize" placeholder="Enter a number of samples here..." value="100">
      <input type="submit" value="Set">
    </form>`, true)
    dialogElt.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault()

      options.graph.shiftSize = Number(this.graphSize.value)
      dialogElt.close()
    })
})

let mainChart

let dataHasBegun = false
let hasReceivedHeaders = false

module.exports = function (data) {
  if (dataHasBegun && hasReceivedHeaders) {
    graphDataRow(data.split(options.data.sep))

  } else if (dataHasBegun && !hasReceivedHeaders) {
    hasReceivedHeaders = true
    setupGraph(data.split(options.data.sep))

  } else if (data.includes(options.data.dataStartIndicator)) {
    dataHasBegun = true
    dialogElt = dialog('Data has begun.')

    setTimeout(() => {
      dialogElt.close()
    }, 1000)
  }
}

let usedColors = []
function generateUniqueColor() {
  function genColStr() {
    return Math.floor(Math.random() * 255)
  }

  let color
  do {
    color = `rgb(${genColStr()}, ${genColStr()}, ${genColStr()})`
  } while (usedColors.includes(color))

  usedColors.push(color)
  return color
}

function setupGraph(headers) {
  let chartCanvas = document.createElement('canvas')
  chartCanvas.width = window.innerWidth - 100
  chartCanvas.height = window.innerHeight - 100
  document.querySelector('.main-content').appendChild(chartCanvas)

  let type = 'line'

  let data = {
    labels: [],
    datasets: []
  }
  headers.forEach((column, i) => {
    // because time, in the first column, is the x axis
    if (i == 0) return

    data.datasets.push({
      label: column,
      borderColor: generateUniqueColor(),
      pointRadius: 0,
      data: [],
      backgroundColor: 'rgba(0,0,0,0)'
    })
  })

  mainChart = new Chart(chartCanvas, { type, data, options: options.graph.chartjsOptions })
  console.log(mainChart)
}

function graphDataRow(data) {
  // time, in the first column, goes on the x axis
  let xVal = data.shift()

  mainChart.data.labels.push(xVal)
  mainChart.data.datasets.forEach((dataset, i) => {
    dataset.data.push(data[i])
  })

  if (options.graph.shift) {
    while (mainChart.data.labels.length > options.graph.shiftSize) {
      mainChart.data.labels.shift()
      mainChart.data.datasets.forEach(dataset => {
        dataset.data.shift()
      })
    }
  }

  mainChart.update(0)
}