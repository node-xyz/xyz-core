let ursa = require('ursa');
let fs = require('fs');
let logger = require('./../Log/Logger');
let privateKey;
let publicKeys = {};
module.exports = {
  readPrivateKey: (directory) => {
    privateKey = ursa.createPrivateKey(fs.readFileSync(directory));
    logger.verbose("Private RSA Key set");
  },

  readPublicKey: (node, direcotry) => {
    publicKeys[node] = ursa.createPublicKey(fs.readFileSync(direcotry));
    logger.verbose(`Public for ${node} detected`);
  },

  encryptPrivate: (msg) => {
    return privateKey.privateEncrypt(msg, 'utf8', 'base64');
  },

  encryptPublic: (node, msg) => {
    return publicKeys[node].encrypt(msg, 'utf8', 'base64');
  },
};
