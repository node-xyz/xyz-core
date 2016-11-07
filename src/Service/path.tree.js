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
        tree[token] = { subtree: {}}
      }
      if (token !== tokens[tokens.length - 1]) {
        tree = tree[token].subtree
      }else {
        tree = tree[token]
      }
      if (stree[token] === undefined) {
        stree[token] = { subtree: {}}
      }
      stree = stree[token]
    }

    if (fn) {
      tree.fn = fn
    }
    return tree
  }

  merge (src, dest, prefix, child) {
    // console.log(`merging ${src} && ${dest} $$ ${prefix} $$ ${child}`)
    for (let key in src) {
      src[key] = src[key].concat(dest[key].map((obj) => {
        return { fn: obj.fn,  path: `${prefix.slice(1)}/${child}/${obj.path}` }
      })
      )
    }
  }

  getPathFunction (path) {
    let pathTokens = path.split('/')
    let tree = this.tree
    for (let token of pathTokens) {
      if (tree[token]) {
        if (token === pathTokens[pathTokens.length - 1]) {
          return tree[token].fn
        } else {
          tree = tree[token].subtree
        }
      }else {
        return false
      }
    }
  }

  getMatches (path, startTree = this.tree) {
    debugger
    let matches = {
      percise: [],
      children: []
    }
    let pathToken = path.split('/')
    let pathIndex = 0
    let pathTree = startTree
    let computedPath = ''
    // console.log(`calling with ${path} , ${JSON.stringify(startTree)}`)
    while (Object.keys(pathTree).length) {
      // console.log(computedPath , pathTree, pathIndex)
      // wildcard is seen
      // console.log(`curretn search ${pathToken[pathIndex]}` , pathIndex , pathToken, pathTree)
      if (pathToken[pathIndex] === '*') {
        // last token
        if (pathIndex === pathToken.length - 1) {
          for ( let child in pathTree) {
            // console.log(`## go inside ${child}`)
            this.merge(matches, this.getMatches(`${child}` , pathTree), computedPath, '')
          }
          break
        }
        // intermediate token
        else {
          // console.log(1, pathToken , pathTree)
          for ( let child in pathTree) {
            // console.log(`go inside ${child}`)
            this.merge(matches, this.getMatches(`${pathToken.slice(pathIndex+1).join('/')}` , pathTree[child].subtree), computedPath, child)
          // console.log(matches)
          }
          break
        }
      }
      else if (pathTree[pathToken[pathIndex]]) {
        if (pathTree[pathToken[pathIndex]].subtree) {
          computedPath = computedPath + '/' + pathToken[pathIndex]
          if (pathIndex === pathToken.length - 1) {
            console.log(`found ${computedPath} , ${pathTree}`)
            matches['percise'].push({path: computedPath.slice(1), fn: pathTree[pathToken[pathIndex]].fn})
            break
          }
          pathTree = pathTree[pathToken[pathIndex]].subtree
          pathIndex += 1
        }else {
          break
        }
      } else {
        break
      }
    }
    return matches
  }
}

module.exports = PathTree

// let pt = new PathTree()
//
// let dummy = function () { console.log('dummy')}
// pt.createPathSubtree('/math/add/decimal', dummy)
// pt.createPathSubtree('/math/add/float', dummy)
// pt.createPathSubtree('/math/sub/decimal', dummy)
// pt.createPathSubtree('/math/sub/float', dummy)
// pt.createPathSubtree('/foo/bar/buzz/duck/go', dummy)
// pt.createPathSubtree('/foo/bar1/buzz1/duck/go', dummy)
// pt.createPathSubtree('/foo/bar1/buzz1/duck/g1', dummy)
//
// console.log(pt.getMatches('/math/add/float'))
// console.log(pt.getMatches('/foo/*/*/duck/go'))
// console.log(pt.getMatches('/math/add/*'))
// console.log(pt.getMatches('/math/*'))
// console.log(pt.getMatches('/math'))
// console.log(pt.getMatches('/math/add/wrong'))
// console.log(pt.getMatches('/math/add/decimal/extra'))
// console.log(pt.getMatches('/foo/*/*/duck/go'))
