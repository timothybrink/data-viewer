class DataSet {
  constructor(name, column, connection) {
    this.name = name
    this.column = column
    this.connection = connection
    this.finished = false

    this.data = []
  }

  addData(data) {
    this.data.push(data)
  }
}