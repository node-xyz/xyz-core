function processInspectionEvent (xyz) {
  process.on('message', (data) => {
    // this process will responde with a json object containing basic info about the node
    if (data.title === 'inspectJSON') {
      process.send({title: data.title, body: xyz.inspectJSON()})
    } else if (data.title === 'inspect') {
      process.send({title: data.title, body: xyz.inspect()})
    }
  })
}

module.exports = processInspectionEvent
