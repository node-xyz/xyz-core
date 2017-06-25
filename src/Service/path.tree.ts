import { PathNode, SerializedNode } from './path.node'
import { ISubtree } from './path.tree'
import { logger } from './../Log/Logger'
import { Path } from './path'

enum TRAVERSE_RESULT {
  understep,
  fit,
  overstep
}

interface ITraversalResult {
  status: TRAVERSE_RESULT
  node: PathNode
}

export class PathTree {
  root: PathNode
  sRoot: SerializedNode
  serializedTree: SerializedNode

  plainTree: object[]

  constructor () {
    this.root = new PathNode('', '', 0, null)
    this.sRoot = new SerializedNode('', '')
    // TODO: this is only to avoid refactoring
    this.serializedTree = this.sRoot
    this.plainTree = []
  }

  inspect () {
    return this._inspect(this.root, '')
  }

  _inspect (node: PathNode = this.root, indent: string = '|  ') {
    let consoleValue = ''

    for ( let child of node.children ) {
      consoleValue += (indent + child._inspect() )

      if ( child.children.length ) {
        consoleValue += this._inspect(child, indent)
      }
    }

    return consoleValue
  }

  createPathSubtree (path: string, fn: () => any): boolean {
    if ( this.isRoot(path) ) {
      this.root.fn = fn
      return true
    }
    let tokens = this.tokenize(path)
    let currentNode = this.root
    let currentSNode = this.sRoot

    let last = tokens[tokens.length - 1]
    for ( let token of tokens ) {
      if ( !currentNode.hasChild(token) ) {
        // add child to main tree
        currentNode.addChild(token, token === last ? fn : null)

        // add child to serialized tree
        currentSNode.children.push(new SerializedNode(token, `${currentSNode.path}/${token}`))
      }
      currentSNode = currentSNode.getChild(token)
      currentNode = currentNode.getChild(token)
    }
    this.plainTree.push({ path: path, name: fn['name'] || 'anonymousFN' })
    return true
  }

  getPathFunction (path: string) {
    if ( this.isRoot(path) ) return this.root.fn
    let tokes = this.tokenize(path)
    let currentNode = this.root
    for ( let token of tokes) {
      if ( currentNode.hasChild(token) ) {
        currentNode = currentNode.getChild(token)
      } else {
        return false
      }
    }
    return currentNode.fn
  }

  isRoot (path) {
    if ( path === '/' ) return true
  }

  // deprecated
  traverse (path: string): ITraversalResult {
    let tokens = this.tokenize(path)
    let currentNode: PathNode = this.root
    let currentIndex: number = 0
    let currentToken: string = tokens[currentIndex]
    let maxIndex: number = tokens.length - 1

    while (currentNode.getChild(currentToken)) {
      currentIndex ++
      currentToken = tokens[currentIndex]
    }

    if ( currentIndex === currentNode.depth ) {
      return { status: TRAVERSE_RESULT.fit, node: currentNode }
    }
    if ( currentIndex > currentNode.depth ) {
      return { status: TRAVERSE_RESULT.overstep, node: currentNode }
    }
    if ( currentIndex < currentNode.depth ) {
      return {status: TRAVERSE_RESULT.understep, node: currentNode }
    }
  }

  tokenize (path: string): string[] {
    return path.split('/').slice(1)
  }
}

export interface ITree {
  [index: string]: ISubtree
}

export interface ISubtree {
  subtree: ITree
  fn?: () => any
}
