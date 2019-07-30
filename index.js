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

// setting the enviromental variables
const PORT = process.env.PORT;
const APIKEY = process.env.APIKEY;
const SERVER_NAME = process.env.SERVER_NAME_LABEL || "Unknown server";

// api hashmap
const apiKeys = new Map();
apiKeys.set(APIKEY, { id: 1, name: 'Api key USER' });

app.use('/.well-known', express.static('./webrootPath/well-known'));

// middleware for checking the apikey
const signOptions = {
    issuer: "SPEC",
    subject: "pcid@spec.cl",
    audience: "http://spec.cl/",
    expiresIn: "30m",
    algorithm: "RS256"
};
const verifyOptions = {
    issuer: "SPEC",
    subject: "pcid@spec.cl",
    audience: "http://spec.cl/",
    expiresIn: "30m",
    algorithm: ["RS256"]
};
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
// app.use(apiKeyHandler);

try {
    console.log("testing before");
    const paths = JSON.parse(process.env.PROXIES_PATHS);
    if (Array.isArray(paths)) {
        paths.forEach(x => app.use(x.path, proxy(x.url)));
    } else {
        throw "Error";
    }
} catch (error) {
    console.log(" NO proxy path found")
}

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