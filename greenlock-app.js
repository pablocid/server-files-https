var homedir = require('path').join(require('os').homedir());
require('greenlock-express').create({

    version: 'draft-11'
    , server: process.env.STAGE  // staging
    , email: process.env.EMAIL    // CHANGE THIS
    , agreeTos: true
    , approveDomains: [process.env.DOMAIN]              // CHANGE THIS
    , configDir: process.env.CERT_DIR
    , app: require('./index.js')
    , store: require('greenlock-store-fs')
    , communityMember: true
    , debug: process.env.DEBUG_HTTPS
}).listen(80, 443);