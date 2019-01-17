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

            getCoursesRCYCI_SIS(student)
                .then(student => {
                    getAttRCYCI_SIS(student)
                        .then((courses) => {
                            student.results = [];
                            for (const course of courses)
                                for (const stu_course of student.courses)
                                    if (course.course_name === stu_course.courseName)
                                        student.results.push({
                                            courseName: stu_course.courseName,
                                            percentage: course.precentage,
                                            hours: course.count
                                        });
                                    else
                                        student.results.push({
                                            courseName: stu_course.courseName,
                                            percentage: 0,
                                            hours: 0
                                        });

                            student.university = "RCYCI";
                            return resolve(student);
                        })
                        .catch((e) => reject(e));
                })
                .catch((e) => reject(e.message));

        });//end of request
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
                    if (row.children)
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
                }
                return resolve(attendance_courses);
            } catch (e) {
                return reject(e.message + ', Some thing went wrong please check again');
            }
        });
    });
};

