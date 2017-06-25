import { SerializedNode } from './path.node'

export interface IPath {
  validate: (path: string) => boolean
  format: (path: string) => string
  merge: (src, dst, prefix, child) => string
  match: (path: string, serializeTree: SerializedNode, partial: boolean) => string[]
  hasChild: (node: SerializedNode, token: string) => boolean
  getChild: (node: SerializedNode, token: string) => SerializedNode
}

export let Path: IPath = {
  validate: function (path: string): boolean {
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
    return src.concat(dest.map((obj) => {
      return `${prefix.slice(1)}/${child}/${obj}`
    })
    )
  },

  match (path: string, serializeTree: SerializedNode, partial: boolean = false) {
    let matches = []
    let tokens: Array<string> = path.split('/').slice(1)
    let currentNode = serializeTree

    let index = 0
    for ( let token of tokens ) {
      // wildcard
      if ( token === '*' ) {
        for ( let candidate of currentNode.children ) {
          let candidateResult = Path.match(tokens.slice(index).join('/'), candidate, false)
          matches = matches.concat(candidateResult)
        }
        return matches
      } else {
        if ( Path.hasChild(currentNode, token) ) {
          currentNode = Path.getChild(currentNode, token)
        } else {
          return []
        }
      }
      index ++
    }
    if ( path !== '/' ) matches.push(currentNode.path)
    return matches
  },

  hasChild (node: SerializedNode, token: string) {
    for ( let child of node.children ) {
      if ( child.name === token ) return true
    }
    return false
  },

  getChild (node: SerializedNode, token: string) {
    for ( let child of node.children ) {
      if ( child.name === token ) return child
    }
  }
}
