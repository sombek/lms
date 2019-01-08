const express = require('express');
const app = express();
const request = require('request-promise');
const querystring = require('querystring');
const cheerio = require('cheerio');
const bodyParser = require('body-parser');

const cookieJar = request.jar();

let GlobalFlag = false;
let form = {
    username: '',
    password: ''
};

let student = {
    name: '',
    courses: [],
    links: []
};
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});

app.post('/', function (req, res) {
    function get() {
        if (GlobalFlag === false) {
            form.username = req.body.user;
            form.password = req.body.password;
            GlobalFlag = true;

            getStudent()
                .then((student) => {
                    const promises = [];
                    for (i = 0; i < student.links.length; i++)
                        promises.push(getAtt(student.links[i]));

                    Promise.all(promises)
                        .then(data => {
                            let dataName = {name: student.name, dat: data}
                            student.courses = [];
                            student.links = [];
                            student.name = '';
                            GlobalFlag = false;
                            res.json(dataName);
                        });
                })
                .catch((err) => {
                    student.courses = [];
                    student.links = [];
                    student.name = '';
                    GlobalFlag = false;
                    res.json({err: err});
                });
        }
        else
            setTimeout(get, 100);
    }

    get();
});//end get route


function getStudent() {
    return new Promise((resolve, reject) => {
        const formData = querystring.stringify(form);
        request({
            headers: {
                'Content-Length': formData.length,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            followAllRedirects: true,
            uri: 'http://lms.yic.edu.sa/moodle/login/index.php',
            body: formData,
            method: 'POST',
            jar: cookieJar
        }, (err, res, body) => {
            student.courses = [];
            student.links = [];
            student.name = '';
            //error cases
            if (err) {
                console.log('rejected');
                return reject('Server Not Available');
            }
            if (res.statusCode === 503) {
                console.log('rejected Database not available');
                return reject('error: Database is not available');
            }
            if (res.headers.expires === '') {
                console.log('rejected Wrong Password Or Username');
                return reject('error: Wrong Password Or Username');
            }

            //Get body
            $ = cheerio.load(body);

            //Loop in the body to get the student's courses
            let titles = $('h4', '#region-main .rc_box');
            titles.each((i, node) => {
                try {
                    let course = node.children[0].data;
                    student.courses.push(course);
                    let url = node.parent.parent.children[1].children[0].children[0].children[0].children[1].children[0].attribs.href + '&tab=attendance&att_week=1';
                    student.links.push(url);
                } catch (e) {
                    console.log('Error while parsing the homepage to get the courses and links');
                    return reject('error: while parsing the homepage to get the courses and links');
                }
            });

            //Get the name of student then clean it
            let name = $('a.dropdown-toggle', '#essentialnavbar').text();
            student.name = name.split(' ').slice(0, 2).join(' ');
            if (student.name.includes(','))
                student.name = student.name.split(',').slice(0, 2).join(' ');

            console.log(student.name + ' resolved at '
                + new Date().toLocaleString(('de-DE', {
                        hour: '2-digit', hour12: false,
                        timeZone: 'Asia/Riyadh'
                    })
                )
            );
            return resolve(student);
        });//end of request
    });//end of promise
}

function getAtt(url) {
    return new Promise((resolve, reject) => {
        request(({
            followAllRedirects: true,
            uri: url,
            method: 'GET',
            jar: cookieJar
        }), (err, res, body) => {
            if (err) return reject('Something went wroung');
            $ = cheerio.load(body);
            let course = $('#page-navbar').find('span');
            if (course[5] === undefined ||
                course[5].children[0] === undefined ||
                course[5].children[0].children[0] === undefined ||
                course[5].children[0].children[0].children[0] === undefined ||
                course[5].children[0].children[0].children[0].data === undefined) {
                console.log('rejected something undefined');
                return reject('Some thing went wrong please check again');
            }
            let courseName = course[5].children[0].children[0].children[0].data;
            $('tr', '#region-main').each(function () {
                Total_Absence = this.children[3].children[0].data;
                if (Total_Absence != null) {
                    if (Total_Absence.indexOf('Hours') !== -1) {
                        for (var i = 0; i < student.courses.length; i++) {
                            if (student.courses[i].includes(courseName.split(' ').slice(0, 1))) {
                                var attendace_object = {
                                    courseName: courseName,
                                    attendace: Total_Absence
                                };
                                return resolve(attendace_object);
                            }
                        }
                    }
                }
            });//end of each absence loop
        });
    });
}


app.listen('4000');
console.log('Magic happens on port 3000');
exports = module.exports = app;
