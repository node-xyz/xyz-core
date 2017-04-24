export interface IxSentMessageMwParam {
    requestConfig : IxMessageConfig; 
    responseCallback : (err, body, resp) => void;
}

export interface IxSentMessage {
  userPayload : object; 
  xyzPayload : IxyzPayload; 
}

export interface IxyzPayload {
  senderId: string; 
  service?: string; 
}

export function _xResponse(resposenObject) {
  resposenObject['jsonify'] = (data, ...args) => {
    resposenObject.end(JSON.stringify(data), ...args)
  }
}

export interface IxReceivedMessage {
    message: any
    serverId : object
    meta : object
    response : () => void
}

export interface IxMessageConfig {
  hostname: string
  port:number 
  path: string
  method: string
  json: IxSentMessage
}

export interface ITransportSendConfig {
  redirect?: boolean
  route?: string
  node: string
  payload?: any
  service?: string
}
