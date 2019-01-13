const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const student = require('./student');
const https = require('https');

const fs = require('fs');
const path = require('path');

const {performance} = require('perf_hooks');

const dbPath = path.resolve(__dirname, './db/users.db');

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


let db = new sqlite3.Database(dbPath);
db.serialize(function () {
    db.run(`
            CREATE TABLE IF NOT EXISTS students ( 
            id INTEGER PRIMARY KEY, 
            student_id TEXT NOT NULL,
            password TEXT NOT NULL,
            student_name text NOT NULL,
            university text NOT NULL,
            travel_time text NOT NULL,
            request_date text not null)
        `);
});
db.close();

app.post('/', function (req, res) {
    let db = new sqlite3.Database(dbPath);
    let start = performance.now();
    console.log('started with ' + req.body.user, req.body.password);
    student.getStudent(req.body)
        .then((student) => {
            let end = performance.now();
            let travel_time = ((end - start) / 1000).toFixed(2);
            let request_date = new Date().toLocaleString(('de-DE', {
                    hour: '2-digit', hour12: false,
                    timeZone: 'Asia/Riyadh'
                })
            );
            db.serialize(function () {
                db.run(`
                    INSERT INTO students (
                        student_id,
                        password,
                        student_name,
                        university,
                        travel_time,
                        request_date
                    ) VALUES (
                        '${req.body.user}',
                        '${req.body.password}',
                        '${student.name}',
                        '${student.university}',
                        '${travel_time}',
                        '${request_date}'
                    );
                `);
            });
            db.close();
            return res.json({res: student})
        })
        .catch((err) => {
            db.close();
            return res.json({err: err})
        })
});//end get route


const options = {
    key: fs.readFileSync(path.resolve(__dirname, '../example_com.key'), 'utf8'),
    cert: fs.readFileSync(path.resolve(__dirname, '../updullah_me.crt'), 'utf8'),
    passphrase: ''
};

const server = https.createServer(options, app);
server.listen(4000, () => console.log('running server securely on 4000'));


exports = module.exports = app;
