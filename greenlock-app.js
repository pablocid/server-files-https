require('greenlock-express')
    .create({
        version: 'draft-11',
        server: process.env.PROD === "YES" ? "https://acme-v02.api.letsencrypt.org/directory" : "https://acme-staging-v02.api.letsencrypt.org/directory",
        email: process.env.EMAIL,
        servername: process.env.SERVERNAME,
        agreeTos: true,
        configDir: './certs',
        approveDomains: [process.env.DOMAIN],
        challenges: { 'http-01': require('le-challenge-fs').create({ webrootPath: './webrootPath/well-known/acme-challenge' }) },
        store: require('le-store-certbot').create({ webrootPath: './webrootPath/well-known/acme-challenge' }),
        app: require('./index.js'),
        debug: process.env.DEBUG_HTTPS
    })
    .listen(80, 443);