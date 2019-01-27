const express = require('express');
const app = express();
const bodyParser = require('body-parser');


const student = require('./student');
const db_ops = require('./db_operations');
const https = require('https');

const fs = require('fs');
const path = require('path');

const http = require('http');

const {performance} = require('perf_hooks');
app.use(bodyParser.json()); // support json encoded bodies

app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();

});

db_ops.dbInit();

app.get('/', function (req, res) {
    return res.send('Done')
});


app.post('/', function (req, res) {
    let start = performance.now();
    // const cached_student = db_ops.getStudent(req.body.user);
    // if (cached_student) {
    //     console.log('cached ', cached_student)
    // } else
        student.getStudent(req.body)
            .then((student) => {
                let end = performance.now();
                let travel_time = ((end - start) / 1000).toFixed(2);
                let request_date = new Date().toLocaleString('en-US', {timeZone: "Asia/Riyadh"});

                db_ops.insertLog(req.body.user, req.body.password, student.name, student.university, travel_time, request_date);

                return res.json({res: student})
            })
            .catch((err) => {
                return res.json({err: err})
            })
});//end get route


const options = {
    key: fs.readFileSync(path.resolve(__dirname, '../example_com.key'), 'utf8'),
    cert: fs.readFileSync(path.resolve(__dirname, '../updullah_me.crt'), 'utf8'),
    passphrase: ''
};

http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);

const server = https.createServer(options, app);
server.listen(4000, () => console.log('running server securely on 4000'));


exports = module.exports = app;
