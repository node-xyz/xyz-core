export interface ITransportServer  {
    type: string; 
    event: boolean; 
    port: number;
}

export interface IselfConf {
    name: string; 
    defaultSendStrategy: any; // string or function
    logLevel:string; 
    seed: string[]; 
    transport: ITransportServer[];
    host: string;
    defaultBootstrap: boolean;
    cli: {enable: boolean, stdio: string};  
}; 

export interface IsystemConf {
    nodes: string[]
}

export interface IConfig {
    selfConf: IselfConf,
    systemConf: IsystemConf, 
}

export interface IConfigObject {
    joinNode: (node: string) => void ;
    ensureNode: (node: string) => void ;
    ensureNodes: (nodes: string[]) => void ; 
    kickNode: (node: string) => void ;  
    setSelfConf: (aConf: object, cmdLineArgs: string) => void ; 
    setSystemConf: (aConf: object) => void ; 
    addServer: (server: ITransportServer) => void ;
    removeServer: (port: number) => void ; 
    getSystemConf: () => IsystemConf ; 
    getSelfConf: () => IselfConf; 
    forget: () => void ;
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