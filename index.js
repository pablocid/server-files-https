const express = require('express');
const { readFileSync } = require('fs');
const { sign, verify } = require('jsonwebtoken');
var cors = require('cors');
const privateKEY = readFileSync('./private.key', 'utf8');
const publicKEY = readFileSync('./public.key', 'utf8');
const app = express();

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
const SERVER_NAME = process.env.SERVER_NAME || "Unknown server";

// api hashmap
const apiKeys = new Map();
apiKeys.set(APIKEY, { id: 1, name: 'Api key USER' });

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
app.use(apiKeyHandler);

// enable CORS
app.use(cors());

const payload = { server: SERVER_NAME };

const foldertoServePath = process.env.FOLDERPATH;
 
app.use('/files', express.static(foldertoServePath));

app.get('/login', function (req, res) {
    if (req.authType !== 'apikey') { res.send('loggin forbidden'); }
    res.send(sign({ ...payload, from: 'Local server testing ..' }, privateKEY, signOptions));
});
app.get('/is-logged', function (req, res) {
    res.json({ payload: req.jwtPayload, authType: req.authType, hola: "oliasflksajdfl" });
});
app.listen(PORT, () => {
    console.log(`MemoryApp listening on port ${PORT}!`);
});
