import { bold, wrapper } from './../Util/Util'
import { logger } from './../Log/Logger'

export class SerializedNode {
  name: string
  path: string
  children: SerializedNode[]

  constructor (name: string, path: string) {
    this.name = name
    this.path = path
    this.children = []
  }

  getChild (name: string): SerializedNode {
    for (let node of this.children) {
      if (node.name === name) {
        return node
      }
    }
  }

  hasChild (name: string): boolean {
    for (let node of this.children) {
      if (node.name === name) {
        return true
      }
    }
    return false
  }
}

export class PathNode {
  name: string
  fn: () => any
  path: string
  depth: number
  children: PathNode[]

  constructor (name: string, path: string, depth: number, fn) {
    this.name = name
    this.depth = depth
    this.path = path
    this.children = []
    this.fn = fn
  }

  _inspect () {
    let indent = ''
    for ( let i = 0 ; i < this.depth - 1 ; i ++ ) indent += '|  '
    return `${indent}${bold(this.name)} @ ${this.depth} [${this.path}] [fn: ${this.fn ? this.fn['name'] || 'anonymousFN' : wrapper('yellow', 'null')}]\n`
  }

  inspect () {
    return this._inspect()
  }

  getChild (name): any {
    for (let node of this.children) {
      if (node.name === name) {
        return node
      }
    }
    return false
  }

  hasChild (name: string): boolean {
    for (let node of this.children) {
      if (node.name === name) {
        return true
      }
    }
    return false
  }

  addChild (name: string, fn = null) {
    let newNode = new PathNode(
      name,
      `${this.path}/${name}`,
      this.depth + 1,
      fn
    )
    this.children.push(newNode)
  }

  setFunction (fn) {
    this.fn = fn
  }
}
