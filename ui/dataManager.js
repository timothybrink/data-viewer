const dataMgr = {}

dataMgr.datasets = []

/**
 * Add new data to the datasets by connection id.
 * @param {Number} id   The connection id from which the data came
 * @param {Number} time The timestamp for the data
 * @param {Array}  data The array of data to add (assumed to be in the same order as the original headers)
 */
dataMgr.newData = function (id, time, data) {
  let datasets = dataMgr.datasets.filter(ds => ds.connection == id)
  datasets.forEach(ds => ds.addData(time, data[ds.column]))
}

/**
 * Initiate a new data stream (from a given connection) with the given id and headers
 * @param {Number} id      The connection from which the data will be streamed
 * @param {Array}  headers The array of headers to use (i.e. the variables that will be streamed).
 *                         Assumed to be in the same order as the data arrays that will come.
 */
dataMgr.initDataStream = function (id, headers) {
  headers.forEach((colName, i) => {
    let ds = dataMgr.getDataSet(colName)
    ds.start(i, id)
  })
}

/**
 * Close a data stream by id. Marks all associated datasets as finished.
 * @param {Number} id The connection to close.
 */
dataMgr.closeDataStream = function (id) {
  let datasets = dataMgr.datasets.filter(ds => ds.connection == id)
  datasets.forEach(ds => {
    ds.finished = true
  })
}

/**
 * Get a data set object by data name (the name provided in the headers array.)
 * @param   {String}  fieldName The data name to search for
 * @returns {DataSet}
 */
dataMgr.getDataSet = function (fieldName) {
  let result = dataMgr.datasets.find(ds => fieldName == ds.name)

  // If the data connection with this variable isn't open yet, create a new DataSet
  // that will acquire the data when it does arrive.
  if (!result) {
    result = new DataSet(fieldName)
    dataMgr.datasets.push(result)
  }
  return result
}