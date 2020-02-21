class Graph {
  constructor(element, datasets) {
    this.parent = element
    this.options = {
      shift: true,
      shiftSize: 100,
      color: 'rgb(0, 0, 0)',
      scale: 'auto',
      chartjsOptions: {
        elements: {
          line: {
            tension: 0
          }
        },
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              unit: 'seconds',
              stepSize: 1,
              displayFormats: {
                seconds: 'ss'
              }
            },
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Time'
            },
            ticks: {
              major: {
                fontStyle: 'bold',
                fontColor: '#FF0000'
              }
            },
            gridLines: {
              color: '#777'
            }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'value'
            },
            ticks: {
              fontColor: '#777'
            },
            gridLines: {
              color: '#777'
            }
          }]
        }
      }
    }
    this.datasets = datasets
    this.updateData = []
    this.needsUpdate = new Array(datasets.length)
    this.needsUpdate.fill(false)
  }

  init() {
    // move options to chartjsOptions if necessary
    if (this.options.scale != 'auto') {
      this.options.chartjsOptions.scales.yAxes[0].ticks.suggestedMin = this.options.scale[0]
      this.options.chartjsOptions.scales.yAxes[0].ticks.suggestedMax = this.options.scale[1]
    }

    this.canvas = document.createElement('canvas')
    this.canvas.width = this.parent.clientWidth
    this.canvas.height = this.parent.clientHeight
    this.parent.appendChild(this.canvas)

    let data = {
      labels: [],
      datasets: []
    }
    this.datasets.forEach((dataset, i) => {
      let color = this.options.color
      if (Array.isArray(color))
        color = color[i]

      data.datasets.push({
        label: dataset.name,
        borderColor: color,
        pointRadius: 0,
        data: [],
        backgroundColor: 'rgba(0,0,0,0)'
      })
      dataset.ondata((ds, t, d) => { this.newData(ds, t, d) })
    })

    this.chart = new Chart(this.canvas, { type: 'line', data, options: this.options.chartjsOptions })
  }

  newData(dataset, time, data) {
    let i = this.datasets.indexOf(dataset)
    this.needsUpdate[i] = true
    this.updateData[i] = data
    this.updateTime = time

    // if all need update, call this.update().
    if (this.needsUpdate.every(i => i))
      this.update()
  }

  update() {
    let time = this.updateTime
    let data = this.updateData
    this.updateTime = 0
    this.updateData = []
    this.needsUpdate.fill(false)

    this.chart.data.datasets.forEach((dataset, i) => {
      dataset.data.push({ t: time, y: data[i] })

      if (this.options.shift && dataset.data.length > this.options.shiftSize) {
        dataset.data.shift()
      }
    })

    this.chart.update()
  }

  clear() {
    for (let i = 0; i < this.chart.data.datasets.length; i++) {
      this.chart.data.datasets[i].data = []
    }
    this.chart.update()
  }
}
