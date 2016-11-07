let logger = require('./../Log/Logger')

let Path = {
  validate: function (path) {
    if (path === '/') {
      return true
    }
    return /^(\/([a-zA-Z]|[1-9]|\*)+)*$/.test(path)
  },

  format: function (path) {
    if (path.slice(0, 1) !== '/') {
      path = '/' + path
    }
    if (path.slice(-1) === '/') {
      path = path.slice(0, -1)
    }
    return path
  },

  merge: function (src, dest, prefix, child) {
    // console.log(`merging ${src} && ${dest} $$ ${prefix} $$ ${child}`)
    return src.concat(dest.map((obj) => {
      // console.log(obj)
      return `${prefix.slice(1)}/${child}/${obj}`
    })
    )
  },

  match(path, serializedTree) {
    let matches = []
    let pathToken = path.split('/')
    let pathIndex = 0
    let pathTree = serializedTree
    let computedPath = ''
    // console.log(`calling with ${path} , ${JSON.stringify(serializedTree)}`)
    while (Object.keys(pathTree).length) {
      // console.log(computedPath , pathTree, pathIndex)
      // wildcard is seen
      // console.log(`curretn search ${pathToken[pathIndex]}` , pathIndex , pathToken, pathTree)
      if (pathToken[pathIndex] === '*') {
        // console.log(1, pathToken , pathTree)
        // last token // TODO redundant
        if (pathIndex === pathToken.length - 1) {
          for ( let child in pathTree) {
            // console.log(`## go inside ${child}`)
            matches = this.merge(matches, this.match(`${child}` , pathTree), computedPath, '')
          }
          break
        }
        // intermediate token
        else {
          for ( let child in pathTree) {
            // console.log(`go inside ${child}`)
            matches = this.merge(matches, this.match(`${pathToken.slice(pathIndex+1).join('/')}` , pathTree[child]), computedPath, child)
          // console.log(matches)
          }
          break
        }
      }
      else if (pathTree[pathToken[pathIndex]]) {
        if (pathTree[pathToken[pathIndex]]) {
          computedPath = computedPath + '/' + pathToken[pathIndex]
          if (pathIndex === pathToken.length - 1) {
            // console.log(`found ${computedPath} , ${pathTree}`)
            matches.push(computedPath.slice(1))
            break
          }
          pathTree = pathTree[pathToken[pathIndex]]
          pathIndex += 1
        }else {
          break
        }
      } else {
        break
      }
    }
    return matches
  },

  getTokes: function (path) {
    return path.split('/')
  }
}

module.exports = Path

let PathTree = require('./path.tree')
let pt = new PathTree()

let dummy = function () { console.log('dummy')}
pt.createPathSubtree('/math/add/decimal', dummy)
pt.createPathSubtree('/math/add/float', dummy)
pt.createPathSubtree('/math/sub/decimal', dummy)
pt.createPathSubtree('/math/sub/float', dummy)
pt.createPathSubtree('/foo/bar/buzz/duck/go', dummy)
pt.createPathSubtree('/foo/bar1/buzz1/duck/go', dummy)
pt.createPathSubtree('/foo/bar1/buzz1/duck/g1', dummy)

console.log(Path.match('/math/add/float', pt.serializedTree))
console.log(Path.match('/math/add/wrong', pt.serializedTree))
console.log(Path.match('/math/add/decimal/extra', pt.serializedTree))
console.log(Path.match('/math', pt.serializedTree))
console.log(Path.match('/foo/*/*/duck/go', pt.serializedTree))
console.log(Path.match('/math/add/*', pt.serializedTree))
console.log(Path.match('/math/*', pt.serializedTree))
console.log(Path.match('/foo/*/*/duck/go', pt.serializedTree))
