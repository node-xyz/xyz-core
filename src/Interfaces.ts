export interface IMessageConfig {
    servicePath: string; 
    payload?: any; 
    sendStrategy?: any;
    redirect: boolean;  
}

export interface INodeIdentifier {
    name: string;
    host: string;
    port: number;
    netId: string; 
    _identifier: string
}