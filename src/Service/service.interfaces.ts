import { IMessageConfig } from './../Interfaces';

export interface IServDiscMwParam {
    opt: IMessageConfig, 
    responseCallback: (err: any, body:any , response: any) => void,
    targets: {node: string, service: string}[]
}