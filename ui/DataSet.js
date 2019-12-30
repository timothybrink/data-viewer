class DataSet {
  constructor(name) {
    this.name = name
    this.column = -1
    this.connection = -1
    this.finished = false
    this.started = false

    this._cb = null
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
  }

  /**
   * Add new data to the dataset
   * @param {*} data The data to add to the dataset
   */
  addData(time, data) {
    // this.data.push({time, data})  // Not sure that this is necessary

    if (typeof this._cb == 'function')
      this._cb(this, time, data)
  }

  /**
   * Adds a callback to execute when new data is added.
   * @param {function} callback The callback to execute when new data is added
   */
  ondata(callback) {
    this._cb = callback
  }
}