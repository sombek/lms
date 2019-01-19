const request = require('request-promise');
const querystring = require('querystring');
const cheerio = require('cheerio');

module.exports = {
    getFromRCYCI_SIS: (reqBody) => new Promise((resolve, reject) => {
        let form = {
            userid: reqBody.user,
            pwd: reqBody.password,
            timezoneOffset: -180
        };

        const cookieJar = request.jar();
        const formData = querystring.stringify(form);
        const options = {
            headers: {
                'Content-Length': formData.length,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0'
            },
            followAllRedirects: true,
            uri: 'http://sis.rcyci.edu.sa/psp/ps/EMPLOYEE/HRMS?cmd=login&languageCd=ENG',
            body: formData,
            method: 'POST',
            jar: cookieJar,

            rejectUnauthorized: false,
            requestCert: true,
            agent: false,
        };
        request(options, (err, res, body) => {
            //error cases
            if (err) return reject('Server Not Available');
            // if (res.statusCode === 503) return reject('error: Database is not available');
            // let $ = cheerio.load(body);
            // if ($("#loginErrorMessage")[0])
            //     if ($("#loginErrorMessage")[0].children[0])
            //         if ($("#loginErrorMessage")[0].children[0].data)
            //             return reject('error: Wrong Password Or Username');


            let student = {
                //Add the cookieJar for each student
                jar: cookieJar
            };


            Promise.all([getFromRcyci(reqBody), getAttRCYCI_SIS(student), getCoursesRCYCI_SIS(student)])
                .then((values) => {
                    student.results = [];
                    student.courses = values[0].courses;
                    let courses = values[1];

                    student.courses = student.courses.map((course) => course.split('-')[0]);
                    courses = courses.map((course) => {
                        return {
                            courseName: course.course_name.split(' ').join(''),
                            hours: course.count,
                            percentage: course.precentage
                        }
                    });

                    let unique_courses = courses;
                    courses = courses.map((course) => course.courseName);
                    for (const stu_course of student.courses)
                        if (!courses.includes(stu_course.trim()))
                            unique_courses.push({
                                courseName: stu_course,
                                hours: 0,
                                percentage: 0
                            });
                    unique_courses = unique_courses.filter((course) => course.courseName.charCodeAt(0) !== 160);

                    student.results = unique_courses;
                    student.university = "RCYCI";
                    student.name = values[2].name;
                    return resolve(student);
                })
                .catch((e) => reject(e));
        })
    })
};

getCoursesRCYCI_SIS = (student) => {
    const options = {
        followAllRedirects: true,
        headers: {
            'User-Agent': 'Mozilla/5.0'
        },
        uri: 'http://sis.rcyci.edu.sa/psc/ps/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES.SSR_SSENRL_LIST.GBL',
        qs: {
            IsFolder: "false",
            ACAD_CAREER: "UGRD",
            INSTITUTION: "RCYCI",
            STRM: "2182",
        },
        method: 'GET',
        jar: student.jar
    };
    return new Promise((resolve, reject) =>
        request(options, (err, res, body) => {
            if (err) return reject('Can\'t get courses');

            try {
                let student_courses = [];

                const $ = cheerio.load(body);
                const courses = $('.PAGROUPDIVIDER');
                const name = $('#DERIVED_SSTSNAV_PERSON_NAME')[0].children[0].data.split(' ').slice(0, 2).join(' ');

                courses.each((i, course) => {
                    let courseName = course.children[0].data;
                    student_courses.push({
                        courseName: courseName.substring(0, courseName.indexOf('-')).trim()
                    })
                });

                student.courses = student_courses;
                student.name = name;
                return resolve(student)
            }
            catch (e) {
                return reject('Can\'t get courses');
            }

        })
    );
};

getAttRCYCI_SIS = (student) => {
    return new Promise((resolve, reject) => {
        request(({
            followAllRedirects: true,
            headers: {
                'User-Agent': 'Mozilla/5.0'
            },
            uri: 'http://sis.rcyci.edu.sa/psc/ps/EMPLOYEE/HRMS/c/RCY_STD_ATTEND.RCY_STD_ATTEND.GBL',
            qs: {
                FolderPath: "PORTAL_ROOT_OBJECT.CO_EMPLOYEE_SELF_SERVICE.RCY_STD_ATTEND_GBL",
                IsFolder: 'false',
                IgnoreParamTempl: "FolderPath,IsFolder"
            },
            method: 'GET',
            jar: student.jar
        }), (err, res, body) => {
            if (err)
                return reject('Something went wrong');

            let $ = cheerio.load(body);


            let counter = 0;
            let courseText = '';
            let courseCode = '';
            let precentage = '';
            let count = '';
            let attendance_courses = [];
            try {
                const rows = $(".PSLEVEL1GRIDWBO")[0].children[1].children[2].children[0].children[1].children[1].children;
                for (const row of rows) {
                    if (row.children || row.type !== "text")
                        for (const record of row.children) {
                            if (record.name === "td" && record.type === "tag" && record.children[1]) {
                                if (counter === 2)
                                    courseText = record.children[1].children[0].children[0].data;
                                if (counter === 3)
                                    courseCode = record.children[1].children[0].children[0].data;
                                if (counter === 5)
                                    precentage = record.children[1].children[0].children[0].data;
                                if (counter === 6) {
                                    count = record.children[1].children[0].children[0].data;
                                    attendance_courses.push({
                                        course_name: courseText + ' ' + courseCode,
                                        precentage: precentage,
                                        count: count
                                    })
                                }
                                counter++;
                            }
                        }
                    counter = 0
                }
                return resolve(attendance_courses);
            } catch (e) {
                return reject(e.message + ', Some thing went wrong please check again');
            }
        });
    });
};

getFromRcyci = (reqBody) => new Promise((resolve, reject) => {
    let form = {
        username: reqBody.user,
        password: reqBody.password
    };

    const cookieJar = request.jar();
    const formData = querystring.stringify(form);
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
        return resolve(getCourses($));
    });//end of request
});


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
        } catch (e) {
            console.error('Error while parsing the homepage to get the courses and links');
            return new Error('Error while parsing the homepage to get the courses and links');
        }
    });
    return student;
};
