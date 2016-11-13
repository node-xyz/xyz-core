let http = require('http')
const logger = require('./../../Log/Logger')
const Path = require('./../path')

function sendToAll (params, next, done) {
  let servicePath = params[0],
    userPayload = params[1],
    foreignNodes = params[2],
    transportClient = params[3]
  responseCallback = params[4]

  let serviceTokens = servicePath.split('/')
  let wait = 0
  let calls = []
  let responses = {}
  for (let node in foreignNodes) {
    matches = Path.match(servicePath, foreignNodes[node])
    if (matches.length) {
      for (let match of matches) {
        calls.push({ match: match,  node: node })
      }
    }
  }

  for (let call of calls) {
    logger.debug(`SEND TO ALL :: determined node for service ${call.match} by first find strategy ${call.node}`)
    // TODO fix this with arrow function / bind

    if (responseCallback) {
      transportClient.send(call.match, call.node , userPayload, function (_call, err, body, response) {
        responses[`${_call.node}:${_call.match}`] = [err, body]
        wait += 1
        if (wait === calls.length) {
          responseCallback(null, responses)
        }
      }.bind(null, call))
    }else {
      transportClient.send(call.match, call.node , userPayload)
    }
  }

  // if no node matched
  if (!calls.length) {
    logger.warn(`Sending a message to ${servicePath} from send to all strategy failed (Local Response)`)
    if (responseCallback) {
      responseCallback(http.STATUS_CODES[404], null, null)
    }
  }
}

module.exports = sendToAll
