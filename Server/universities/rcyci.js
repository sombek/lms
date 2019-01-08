const request = require('request-promise');
const cheerio = require('cheerio');

module.exports = {
    getFromRcyci: (cookieJar, formData) => new Promise((resolve, reject) => {
        const options = {
            headers: {
                'Content-Length': formData.length,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            followAllRedirects: true,
            uri: 'http://lms.yic.edu.sa/moodle/login/index.php',
            body: formData,
            method: 'POST',
            jar: cookieJar
        };

        request(options, (err, res, body) => {
            //error cases
            if (err) return reject('Server Not Available');
            if (res.statusCode === 503) return reject('error: Database is not available');
            if (res.headers.expires === '') return reject('error: Wrong Password Or Username');

            //Get body
            const $ = cheerio.load(body);

            let student;
            //Loop in the body to get the student's courses & links
            student = getCourses($);
            //Get the name of student then clean it
            student.name = getName($);
            //Add the cookieJar for each student
            student.jar = cookieJar;

            let promises = student.links.map((link) => getAtt(link, student));

            Promise.all(promises)
                .then((data) => {
                    student.results = data;

                    console.log(student.name + ' resolved at '
                        + new Date().toLocaleString(('de-DE', {
                                hour: '2-digit', hour12: false,
                                timeZone: 'Asia/Riyadh'
                            })
                        )
                    );
                    return resolve(student);
                });
        });//end of request
    })
};

getAtt = (url, student) => {
    return new Promise((resolve, reject) => {
        request(({
            followAllRedirects: true,
            uri: url,
            method: 'GET',
            jar: student.jar
        }), (err, res, body) => {
            if (err)
                return reject('Something went wrong');
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
                let Total_Absence = this.children[3].children[0].data;
                if (Total_Absence != null) {
                    if (Total_Absence.indexOf('Hours') !== -1) {
                        for (let i = 0; i < student.courses.length; i++) {
                            if (student.courses[i].includes(courseName.split(' ').slice(0, 1))) {
                                let attendance_object = {
                                    courseName: courseName,
                                    attendance: Total_Absence
                                };
                                return resolve(attendance_object);
                            }
                        }
                    }
                }
            });//end of each absence loop
        });
    });
};

getCourses = ($) => {
    let titles = $('h4', '#region-main .rc_box');
    let student = {
        name: '',
        courses: [],
        links: []
    };
    titles.each((i, node) => {
        try {
            let course = node.children[0].data;
            student.courses.push(course);
            let url = node.parent.parent.children[1].children[0].children[0].children[0].children[1].children[0].attribs.href + '&tab=attendance&att_week=1';
            student.links.push(url);
        }
        catch (e) {
            console.error('Error while parsing the homepage to get the courses and links');
            return new Error('Error while parsing the homepage to get the courses and links');
        }
    });
    return student;
};

getName = ($) => {
    let name = $('a.dropdown-toggle', '#essentialnavbar').text();
    name = name.split(' ').slice(0, 2).join(' ');
    if (name.includes(','))
        name = name.split(',').slice(0, 2).join(' ');
    return name;
};
