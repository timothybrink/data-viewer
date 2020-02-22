class DataEvent extends Event {
  constructor(time, data) {
    super('data')
    this.time = time
    this.data = data
  }
}

class DataSet extends EventTarget {
  constructor(name) {
    super()
    this.name = name
    this.column = -1
    this.connection = -1
    this.finished = false
    this.started = false

    this.data = []
  }

  /**
   * Start the data set (called when the connection to the server that contains
   * this field is opened)
   * @param {Number} column     The column index in which the data is contained
   * @param {Number} connection The connection in which the data is streamed
   */
  start(column, connection) {
    this.column = column
    this.connection = connection
    this.started = true

    this.dispatchEvent(new Event('start'))
  }

  /**
   * Add new data to the dataset
   * @param {*} data The data to add to the dataset
   */
  addData(time, data) {
    this.data.push({time, data})

    this.dispatchEvent(new DataEvent(time, data))
  }
}