const graph = {
  options: {
    shift: true,
    shiftSize: 100,
    chartjsOptions: {
      elements: {
        line: {
          tension: 0
        }
      }
    }
  }
}

graph.init = function (headers) {
  let chartCanvas = document.createElement('canvas')
  chartCanvas.width = window.innerWidth - 100
  chartCanvas.height = window.innerHeight - 100
  document.querySelector('.main-content').appendChild(chartCanvas)

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

  graph.mainChart = new Chart(chartCanvas, { type: 'line', data, options: graph.options.chartjsOptions })
}

graph.update = function (data) {
  // time, in the first column, goes on the x axis
  let xVal = data.shift()

  graph.mainChart.data.labels.push(xVal)
  graph.mainChart.data.datasets.forEach((dataset, i) => {
    dataset.data.push(data[i])
  })

  if (graph.options.shift) {
    while (graph.mainChart.data.labels.length > graph.options.shiftSize) {
      graph.mainChart.data.labels.shift()
      graph.mainChart.data.datasets.forEach(dataset => {
        dataset.data.shift()
      })
    }
  }

  graph.mainChart.update(0)
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