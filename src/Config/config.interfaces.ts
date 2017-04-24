export interface ITransportServerConfig {
  type: string
  event: boolean
  port: number
}

export interface ISelfConfValue {
  name: string
  defaultSendStrategy: any // string or function
  logLevel: string
  seed: string[]
  transport: ITransportServerConfig[]
  host: string
  defaultBootstrap: boolean
  cli: {enable: boolean, stdio: string}
}

export interface ISystemConfValue {
  nodes: string[]
}

export interface IConfigValue {
  selfConf: ISelfConfValue,
  systemConf: ISystemConfValue,
}

export interface IConfig {
  joinNode: (node: string) => void
  ensureNode: (node: string) => void
  ensureNodes: (nodes: string[]) => void
  kickNode: (node: string) => void
  setSelfConf: (aConf: object, cmdLineArgs: string) => void
  setSystemConf: (aConf: object) => void
  addServer: (server: ITransportServerConfig) => void
  removeServer: (port: number) => void
  getSystemConf: () => ISystemConfValue
  getSelfConf: () => ISelfConfValue
  forget: () => void
}

export interface IConstants {
  events: {
    MESSAGE: string,
    PING: string
  }

  defaultConfig: {
    selfConf: ISelfConfValue,
    systemConf: ISystemConfValue
  }

  url: {
    CALL: string,
    PING: string,
    JOIN: string
  }
}
