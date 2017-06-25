export interface ITransportSentMessageMwParam {
  requestConfig: ITransportSentMessageConfig
  responseCallback: (err, body, resp) => void
}

export interface ITransportSentMessageBody {
  userPayload: object
  xyzPayload: ITransportSentMesssageXyzPayload
}

export interface ITransportSentMesssageXyzPayload {
  senderId: string
  service?: string
}

export function _xResponse (resposenObject) {
  resposenObject['jsonify'] = (data, ...args) => {
    resposenObject.end(JSON.stringify(data), ...args)
  }
}

export interface IServerId {
  type: string,
  port: number
}

export interface ITransportReceivedMessage {
  message: any
  serverId: IServerId
  meta: any
  response: () => void
}

export interface ITransportSentMessageConfig {
  hostname: string
  port: number
  path: string
  method: string
  json: ITransportSentMessageBody
}

export interface ITransportSendMessageParams {
  redirect?: boolean
  route?: string
  node: string
  payload?: any
  service?: string
}
