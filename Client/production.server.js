const fs = require('fs');
const https = require('https');
const express = require('express');

const path = require('path');

const app = express();
app.use(express.static('nodePublic'));

app.get('/portfolio', function (req, res) {
    return res.sendfile("./nodePublic/portfolio/index.html");
});

app.get('/', function (req, res) {
    return res.sendfile("./nodePublic/build/index.html");
});

const options = {
    key: fs.readFileSync(path.resolve(__dirname, '../example_com.key'), 'utf8'),
    cert: fs.readFileSync(path.resolve(__dirname, '../updullah_me.crt'), 'utf8'),
    passphrase: ''
};
const server = https.createServer(options, app);
server.listen(443, () => console.log('running client securely on 443'));