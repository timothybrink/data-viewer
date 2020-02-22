class DataEvent extends Event {
  constructor(time, data) {
    super('data')
    this.time = time
    this.data = data
  }
}

class DataSet extends EventTarget {
  static parseName(name) {
    let parts = name.split(' ')

    if (parts.length == 1) {
      return {type: 'basic', name}
    } else {
      let allowedOps = ['-', '+']
      let operators = []
      let variables = []
      if (!allowedOps.includes(parts[0]))
        operators.push('+')
      parts.forEach(element => {
        if (allowedOps.includes(element))
          operators.push(element)
        else
          variables.push(element)
      })
      return {type: 'expression', name, operators, variables}
    }
  }

  constructor(name) {
    super()
    
    this.name = name
    let parsed = this.constructor.parseName(name)
    if (parsed.type != 'basic') {
      this.operators = parsed.operators
      this.variables = parsed.variables
    }
    this.type = parsed.type
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
    if (Array.isArray(column) && this.type != 'expression')
      throw new Error('Dataset supposed to be an expression!')
    else if (Array.isArray(column)) {
      this.columnIndexes = this.variables.map(v => column.indexOf(v))
      if (!this.columnIndexes.every(i => i >= 0))
        throw new Error('varName not found!')
    }
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
    if (this.type == 'basic') {
      // data is just the data in the column
      this.data.push({time, data})
    } else {
      // data is the entire array, so compute it
      data = this.computeField(data)
      this.data.push({time, data})
    }
    
    this.dispatchEvent(new DataEvent(time, data))
  }

  computeField(dataArr) {
    let values = this.columnIndexes.map(i => dataArr[i])

    let final = 0
    for (let i = 0; i < values.length; i++) {
      let op = this.operators[i]
      let val = values[i]
      if (op == '-') {
        final -= val
      } else if (op == '+') {
        final += val
      }
    }

    return final
  }
}