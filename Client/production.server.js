const fs = require('fs');
const https = require('https');
const express = require('express');

const app = express();
app.use(express.static('build'));
app.get('/', function (req, res) {
    return res.end('<p>This server serves up static files.</p>');
});

const options = {
    key: fs.readFileSync('../example_com.key', 'utf8'),
    cert: fs.readFileSync('../updullah_me.crt', 'utf8'),
    passphrase: process.env.HTTPS_PASSPHRASE || ''
};
const server = https.createServer(options, app);
server.listen(3000, () => console.log('running client securely on 3000'));