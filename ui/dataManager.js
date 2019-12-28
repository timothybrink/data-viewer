const dataMgr = {}

dataMgr.datasets = []

dataMgr.newData = function (id, data) {
  let datasets = dataMgr.datasets.filter(ds => ds.connection == id)
  datasets.forEach(ds => ds.addData(data[ds.column]))
  graph.update(data)
}

dataMgr.initDataStream = function (id, headers) {
  headers.forEach((colName, i) => {
    dataMgr.datasets.push(new DataSet(colName, i, id))
  })
  graph.init(headers)
}

dataMgr.closeDataStream = function (id) {
  let datasets = dataMgr.datasets.filter(ds => ds.connection == id)
  datasets.forEach(ds => {
    ds.finished = true
  })
}