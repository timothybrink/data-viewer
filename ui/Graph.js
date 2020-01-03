class Graph {
  constructor(element, datasets) {
    this.parent = element
    this.options = {
      shift: true,
      shiftSize: 100,
      color: 'rgb(0, 0, 0)',
      chartjsOptions: {
        elements: {
          line: {
            tension: 0
          }
        }
      }
    }
    this.datasets = datasets
    this.updateData = []
    this.needsUpdate = new Array(datasets.length)
    this.needsUpdate.fill(false)
  }

  init() {
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
      dataset.ondata((ds, t, d) => {this.newData(ds, t, d)})
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

    this.chart.data.labels.push(time)
    this.chart.data.datasets.forEach((dataset, i) => {
      dataset.data.push(data[i])
    })

    if (this.options.shift) {
      while (this.chart.data.labels.length > this.options.shiftSize) {
        this.chart.data.labels.shift()
        this.chart.data.datasets.forEach(dataset => {
          dataset.data.shift()
        })
      }
    }

    this.chart.update(0)
  }
}