Object.defineProperty(exports, '__esModule', { value: true })
exports.Path = {
  validate: function (path) {
    if (path === '/') {
      return true
    }
    return /^(\/((\*)|([a-zA-Z]|[1-9])+))*$/.test(path)
  },
  format: function (path) {
        /**
         * If it doesn't start with '/', append to it
         */
    if (path.slice(0, 1) !== '/') {
      path = '/' + path
    }
        /**
         * If it ends with a '/', remove it
         */
    if (path.slice(-1) === '/') {
      path = path.slice(0, -1)
    }
        /**
         * Replace (/)* with a single slash
         */
    while (path !== path.replace(/\/{2,}/, '/')) {
      path = path.replace(/\/{2,}/, '/')
    }
    return path
  },
  merge: function (src, dest, prefix, child) {
    return src.concat(dest.map(function (obj) {
      return prefix.slice(1) + '/' + child + '/' + obj
    }))
  },
    /**
     * matches a path with the path.tree of another node
     * @param {String} path the path to be matched.
     * @param {Object} serializedTree  serializedTree of a node
     *
     */
  match: function (path, serializedTree) {
    var matches = []
    var pathToken = path.split('/')
    var pathIndex = 0
    var pathTree = serializedTree
    var computedPath = ''
    while (Object.keys(pathTree).length) {
            // wildcard is seen
      if (pathToken[pathIndex] === '*') {
                // last token // TODO redundant
        if (pathIndex === pathToken.length - 1) {
          for (var child in pathTree) {
            matches = this.merge(matches, this.match('' + child, pathTree), computedPath, '')
          }
          break
        }
        else {
                    // intermediate token
          for (var child in pathTree) {
            matches = this.merge(matches, this.match('' + pathToken.slice(pathIndex + 1).join('/'), pathTree[child]), computedPath, child)
          }
          break
        }
      }
      else if (pathTree[pathToken[pathIndex]]) {
        if (pathTree[pathToken[pathIndex]]) {
          computedPath = computedPath + '/' + pathToken[pathIndex]
          if (pathIndex === pathToken.length - 1) {
            matches.push(computedPath.slice(1))
            break
          }
          pathTree = pathTree[pathToken[pathIndex]]
          pathIndex += 1
        }
        else {
          break
        }
      }
            else {
        break
      }
    }
        // TODO Fix this
    return matches.map(function (el) { return el.replace('//', '/') })
  },
  getTokens: function (path) {
    return path.split('/')
  }
}
