import { logger } from './../Log/Logger';
import { Path } from './path';

export class PathTree {
  tree: object; 
  serializedTree: object; 
  plainTree: any; 
  
  constructor () {
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
  createPathSubtree (path, fn) {
    let tokens = Path.getTokes(path)
    let tree = this.tree
    let stree = this.serializedTree
    for (let token of tokens) {
      if (tree[token] === undefined) {
        tree[token] = {subtree: {}}
      }
      if (token !== tokens[tokens.length - 1]) {
        tree = tree[token].subtree
      } else {
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
    this.plainTree.push({path: path, name: fn.name || 'anonymousFN'})
    return true
  }

  /**
   * Will return the function accosiated with a path.
   * Note that this function will be used at the receiver of a message.
   * It expects a RESOLVED path (no * included)
   */
  getPathFunction (path) {
    let pathTokens = path.split('/')
    let tree = this.tree[pathTokens[0]]
    let token
    for (let i = 1; i < pathTokens.length; i++) {
      token = pathTokens[i]
      if (tree.subtree[token]) {
        tree = tree.subtree[token]
      } else {
        return false
      }
    }
    return tree.fn
  }

  getPathFunctions (path) {
    let pathTokens = path.split('/')
    let tree = this.tree[pathTokens[0]]
    let token
    let fns = []
    for (let i = 1; i < pathTokens.length; i++) {
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

  getMatches (path, startTree = this.serializedTree) {}
}
