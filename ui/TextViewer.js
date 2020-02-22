class TextViewer {
  constructor(element, datasets) {
    this.parent = element
    this.options = { showTime: true, timeLabel: 'Timestamp' }
    this.datasets = datasets

    this.elements = []

    this.updateData = []
    this.needsUpdate = new Array(datasets.length)
    this.needsUpdate.fill(false)
  }

  init() {
    let createElement = labelText => {
      let container = document.createElement('div')
      container.classList.add('text-output-container')
      let label = document.createElement('span')
      label.textContent = labelText + ': '
      container.appendChild(label)
      let element = document.createElement('span')
      container.appendChild(element)
      this.parent.appendChild(container)
      return element
    }

    if (this.options.showTime) {
      this.timeLabel = createElement(this.options.timeLabel)
      this.timeLabel.textContent = '0'
    }

    this.datasets.forEach(dataset => {
      this.elements.push(createElement(dataset.name))

      let tv = this
      dataset.addEventListener('data', function (e) { tv.newData(this, e.time, e.data) })
    })
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
    if (this.options.showTime) {
      this.timeLabel.textContent = this.updateTime
    }

    this.elements.forEach(element => {
      element.textContent = this.updateData
    })

    // reset status
    this.updateTime = 0
    this.updateData = []
    this.needsUpdate.fill(false)
  }
}