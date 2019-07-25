var homedir = require('path').join(require('os').homedir());
require('greenlock-express').create({

    version: 'draft-11'
    , server: 'https://acme-staging-v02.api.letsencrypt.org/directory'  // staging
    , email: 'john.doe@localhost'                                     // CHANGE THIS
    , agreeTos: true
    , approveDomains: ['localhost']              // CHANGE THIS
    , configDir: homedir
    , app: require('./index.js')
    , store: require('greenlock-store-fs')

    , communityMember: true
    //, debug: true
}).listen(4000);