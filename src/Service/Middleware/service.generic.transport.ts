import { logger } from './../../Log/Logger';
import { ITransportSendConfig } from './../../Transport/Interfaces';
import { IServDiscMwParam } from './../service.interfaces'
import XYZ from './../../xyz'
import * as http from 'http'

export function _genericTransportInvoke(params: IServDiscMwParam, next, end, xyz: XYZ) {
    const targets = params.targets
    const transport = xyz.serviceRepository.transport
    const responseCallback = params.responseCallback
    const logger = xyz.logger

    logger.verbose(`SR :: Generic service discovery message emitter. invoking Transport layer with ${params.targets.map(o => o.node + o.service).join(', ')} | service: ${params.opt.servicePath}.`)
    
    if ( targets.length === 0 ) {
        logger.warn(`Sending a message to ${params.opt.servicePath} from first find strategy failed (Local Response)`)
        responseCallback(http.STATUS_CODES[404], null, null)
    }

    else if ( targets.length === 1 ) {
        let config: ITransportSendConfig = {
            redirect: params.opt.redirect, 
            route: params.opt.route,
            node: params.targets[0].node,
            payload: params.opt.payload ,
            service: params.targets[0].service
        }

        transport.send(config, responseCallback)
        end()        
    }   
    else if (targets.length > 1)  {
        let wait = 0 
        let responses = {} 
        for ( let target of targets ) {
            
            let config: ITransportSendConfig = {
                redirect: params.opt.redirect, 
                route: params.opt.route,
                node: target.node,
                payload: params.opt.payload ,
                service: target.service
            }

            if ( responseCallback ) {
                transport.send(config, function(_target, err, body, response){
                    responses[`${target.node}:${target.service}`] = [err, body]
                    wait += 1
                    if (wait === targets.length) {
                        responseCallback(null, responses, null)
                        if (end) end()
                    }
                }.bind(null, target))
            }
            else {
                transport.send(config)
            }

        }
    }
}
