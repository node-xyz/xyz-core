export interface IxyzMessageConfig {
  servicePath: string
  payload?: any
  ndStrategy?: any
  rediect?: boolean
  route?: string
  redirect?: boolean
  sendStrategy: any
}

export interface IxyzNodeIdentifier {
  name: string
  host: string
  port: number
  netId: string
  _identifier: string
}
