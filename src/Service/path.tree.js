let Path = require('./path')
let logger = require('./../Log/Logger')

class PathTree {
  constructor () {
    this.tree = {
      '': {
        subtree: {}
      }
    }
    this.serializedTree = { '': {} }
  }

  createPathSubtree (path, fn) {
    path = Path.format(path)
    if (!Path.validate(path)) {
      logger.error(`Creating a new path failed. Invalid Path : ${path}`)
      return -1
    }
    let tokens = Path.getTokes(path)
    let tree = this.tree
    let stree = this.serializedTree
    for (let token of tokens) {
      if (tree[token] === undefined) {
        tree[token] = { subtree: {} }
      }
      if (token !== tokens[tokens.length - 1]) {
        tree = tree[token].subtree
      }else {
        tree = tree[token]
      }
      if (stree[token] === undefined) {
        stree[token] = {}
      }
      stree = stree[token]
    }

    if (fn) {
      tree.fn = fn
    }
    return tree
  }

}

module.exports = PathTree
