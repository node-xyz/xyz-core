import { IselfConf, IsystemConf } from './interface';
export interface Itransport {
    type: string; 
    event: boolean; 
    port: number;
}

export interface IselfConf {
    name: string; 
    defaultSendStrategy: any; // string or function
    logLevel:string; 
    seed: string[]; 
    transport: Itransport[];
    host: string;
    defaultBootstrap: boolean;
    cli: {enable: boolean, stdio: string};  
}; 

export interface IsystemConf {
    nodes: string[]
}

export interface IConfig {
    selfConf: IselfConf,
    systemConf: IsystemConf
}

export interface IConstants {
    events: {
        MESSAGE: string, 
        PING: string
    }; 

    defaultConfig: {
        selfConf: IselfConf,
        systemConf: IsystemConf
    };

    url: {
        CALL: string,
        PING: string,
        JOIN: string
    }
}