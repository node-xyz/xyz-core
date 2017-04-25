import { IxyzMessageConfig } from './../xyz.interfaces'

export interface IServDiscMwParam {
  opt: IxyzMessageConfig,
  responseCallback: (err: any, body: any , response: any) => void,
  targets: {node: string, service: string}[]
}

export interface IServOptions {
  resolveLocally: boolean
}
