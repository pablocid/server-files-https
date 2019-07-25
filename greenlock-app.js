var homedir = require('path').join(require('os').homedir());
require('greenlock-express').create({

    version: 'draft-11'
    , server: process.env.STAGE  // staging
    , email: process.env.EMAIL    // CHANGE THIS
    , agreeTos: true
    , approveDomains: [process.env.DOMAIN]              // CHANGE THIS
    , store: require("le-store-certbot").create({
        configDir: require("path").join(require("os").homedir(), "acme", "etc"),
        webrootPath: "./webrootPath"
    })
    , app: require('./index.js')
    , store: require('greenlock-store-fs')
    , communityMember: true
    , debug: process.env.DEBUG_HTTPS
}).listen(80, 443);