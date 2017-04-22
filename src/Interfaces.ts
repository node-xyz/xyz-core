export interface IMessageConfig {
    servicePath: string; 
    payload?: any; 
    sendStrategy?: any;
    redirect?: boolean;  
    route?: string 
}

export interface INodeIdentifier {
    name: string;
    host: string;
    port: number;
    netId: string; 
    _identifier: string
}