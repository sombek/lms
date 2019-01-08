const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const student = require('./student');

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

app.post('/', function (req, res) {
    let form = {
        username: req.body.user,
        password: req.body.password
    };
    console.log('started with', form.username);
    student.getStudent(form)
        .then((student) => res.json({res: student}))
        .catch((err) => res.json({err: err}))
});//end get route


app.listen('4000');
console.log('Magic happens on port 4000');
exports = module.exports = app;
