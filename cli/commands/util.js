const fs = require('fs')

function isXYZDirectory() {
  try {
    fs.accessSync(`${process.cwd()}/xyz.json`, fs.F_OK)
    return true
  } catch (err) {
    return false
  }
}

function doesMsExist(name) {
  try {
    fs.accessSync(`${process.cwd()}/${name}/${name}.json`)
    return true
  } catch (err) {
    return false
  }
}

module.exports = {
  isXYZDirectory: isXYZDirectory,
  doesMsExist: doesMsExist
}
