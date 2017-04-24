Object.defineProperty(exports, '__esModule', { value: true })
var path_1 = require('./path')
var PathTree = (function () {
  function PathTree () {
    this.tree = {
      '': {
        subtree: {}
      }
    }
    this.serializedTree = { '': {} }
    this.plainTree = []
  }
    /**
     * Note that the service layer is responsible for
     * 1- validating this path
     * 2- formatting it to standard value
     */
  PathTree.prototype.createPathSubtree = function (path, fn) {
    var tokens = path_1.Path.getTokens(path)
    var tree = this.tree
    var stree = this.serializedTree
    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
      var token = tokens_1[_i]
      if (tree[token] === undefined) {
        tree[token] = { subtree: {} }
      }
      if (token !== tokens[tokens.length - 1]) {
        tree = tree[token].subtree
      }
      else {
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
    this.plainTree.push({ path: path, name: fn['name'] || 'anonymousFN' })
    return true
  }
    /**
     * Will return the function accosiated with a path.
     * Note that this function will be used at the receiver of a message.
     * It expects a RESOLVED path (no * included)
     */
  PathTree.prototype.getPathFunction = function (path) {
    var pathTokens = path.split('/')
    var tree = this.tree[pathTokens[0]]
    var token
    for (var i = 1; i < pathTokens.length; i++) {
      token = pathTokens[i]
      if (tree.subtree[token]) {
        tree = tree.subtree[token]
      }
      else {
        return false
      }
    }
    return tree.fn
  }
  PathTree.prototype.getPathFunctions = function (path) {
    var pathTokens = path.split('/')
    var tree = this.tree[pathTokens[0]]
    var token
    var fns = []
    for (var i = 1; i < pathTokens.length; i++) {
      if (tree.fn) {
        fns.push(tree.fn)
      }
      token = pathTokens[i]
      if (tree.subtree[token]) {
        tree = tree.subtree[token]
      }
    }
    fns.push(tree.fn)
    return fns
  }
  PathTree.prototype.getMatches = function (path, startTree) {
    if (startTree === void 0) { startTree = this.serializedTree }
  }
  return PathTree
}())
exports.PathTree = PathTree
