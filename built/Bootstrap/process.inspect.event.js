/** @module bootstrapFunctions */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * will setup a message listener for the process to responde to `inspect` and `inspectJSON` events.
 * This will be used by xyz-cli. please see the source code for more information.
 * @function _processInspectionEvent
 * @param  {Object}            xyz   the automatically injected paramter referring to the current xyz instance.
 */
function _processInspectionEvent(xyz) {
    process.on('message', function (data) {
        // this process will responde with a json object containing basic info about the node
        if (data.title === 'inspectJSON') {
            process.send({ title: data.title, body: xyz.inspectJSON() });
        }
        else if (data.title === 'inspect') {
            process.send({ title: data.title, body: xyz.inspect() });
        }
    });
}
exports.default = _processInspectionEvent;
