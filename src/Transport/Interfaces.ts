/**
 * 
 */
export interface IxSentMessageMwParam {
    requestConfig : object; 
    responseCallback : () => void;
}

/**
 * The object created in transport object
 */
export interface IxSentMessage {
  userPayload : object; 
  xyzPayload : IxyzPayload; 
}

/**
 * xyz payload portion of each message
 */
export interface IxyzPayload {
  senderId: string; 
  service?: string; 
}

/**
 * 
 * function that will wrapp response objects at receivers
 */
export function _xResponse(resposenObject) {
  resposenObject['jsonify'] = (data, ...args) => {
    resposenObject.end(JSON.stringify(data), ...args)
  }
}


/**
 * This class is the common class used for all middlewares
 */
export interface IxReceivedMessage {
    /**
     * payload of the message
     * usually contains `xyzPayload` and `userPayload` keys
     * @type {Any}
     */
    message: any

    /**
     * Port and type of the server
     * @type {Object}
     */
    serverId : object

    /**
     * metadata. dependes on the type of the server
     * @type {Object}
     */
    meta : object

    /**
     * Function to use for responding to this message
     * @type {Function}
     */
    response : () => void
}

/**
 * Generic object created ad transport layers
 */
export interface IxMessageConfig {
  hostname: string;
  port:number; 
  path: string; 
  method: string; 
  json: IxSentMessage
}
