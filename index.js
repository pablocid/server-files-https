const express = require('express');
const proxy = require('express-http-proxy');
const { readFileSync } = require('fs');
const { sign, verify } = require('jsonwebtoken');
const cors = require('cors');
const privateKEY = readFileSync('./private.key', 'utf8');
const publicKEY = readFileSync('./public.key', 'utf8');
const app = express();
// enable CORS
app.use(cors());

// SIGNING OPTIONS
const signOptions = {
    issuer: "SPEC",
    subject: "pcid@spec.cl",
    audience: "http://spec.cl/",
    expiresIn: "30m",
    algorithm: "RS256"
};

/*
 ====================   JWT Verify =====================
*/
const verifyOptions = {
    issuer: "SPEC",
    subject: "pcid@spec.cl",
    audience: "http://spec.cl/",
    expiresIn: "30m",
    algorithm: ["RS256"]
};

// setting the enviromental variables
const PORT = process.env.PORT;
const APIKEY = process.env.APIKEY;
const SERVER_NAME = process.env.SERVER_NAME_LABEL || "Unknown server";

// api hashmap
const apiKeys = new Map();
apiKeys.set(APIKEY, { id: 1, name: 'Api key USER' });

app.use('/.well-known', express.static('webrootPath/well-known'));
// middleware for checking the apikey

const apiKeyHandler = (req, res, next) => {
    if (!req.query.apikey && !req.query.token) { res.status(401).send('Forbidden access'); return; }

    if (apiKeys.has(req.query.apikey)) {
        req.authType = "apikey";
        next();
    } else {
        try {
            req.jwtPayload = verify(req.query.token, publicKEY, verifyOptions);
            req.authType = "token";
            next();
        }
        catch (error) {
            res.status(403).send('Unauthorized');
        }
    }

}
// if (process.env.PROD === "YES") { app.use(apiKeyHandler); }

app.use('/ameba00/files', proxy('192.168.1.100:8080'));
app.use('/ameba00/files-node', proxy('192.168.1.100:8081'));
app.use('/supertanker/files', proxy('192.168.1.101:8080'));
app.use('/supertanker/files-node', proxy('192.168.1.101:8081'));
app.use('/ilyushin/files', proxy('192.168.1.102:8080'));
app.use('/ilyushin/files-node', proxy('192.168.1.102:8081'));

const payload = { server: SERVER_NAME };

app.get('/login', function (req, res) {
    if (req.authType !== 'apikey') { res.send('loggin forbidden'); }
    res.send(sign({ ...payload, from: 'Local server testing ..' }, privateKEY, signOptions));
});
app.get('/is-logged', function (req, res) {
    res.json({ payload: req.jwtPayload, authType: req.authType, hola: "for testing" });
});
app.listen(PORT, () => {
    console.log(`Server File Https App listening on port ${PORT}!`);
});

module.exports = app;