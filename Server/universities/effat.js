const request = require('request-promise');
const querystring = require('querystring');
const cheerio = require('cheerio');

module.exports = {
    getFromEffat: (reqBody) => new Promise((resolve, reject) => {
        let form = {
            user_id: reqBody.user,
            password: reqBody.password
        };

        // S14105754
        // smartpositive
        const cookieJar = request.jar();
        const formData = querystring.stringify(form);
        const options = {
            headers: {
                'Content-Length': formData.length,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            followAllRedirects: true,
            uri: 'https://blackboard.effatuniversity.edu.sa/webapps/login/',
            body: formData,
            method: 'POST',
            jar: cookieJar
        };
        request(options, (err, res, body) => {
            //error cases
            if (err) return reject('Server Not Available');
            // if (res.statusCode === 503) return reject('error: Database is not available');
            let $ = cheerio.load(body);
            if ($("#loginErrorMessage")[0])
                if ($("#loginErrorMessage")[0].children[0])
                    if ($("#loginErrorMessage")[0].children[0].data)
                        return reject('error: Wrong Password Or Username');

            let student = {
                //Add the cookieJar for each student
                jar: cookieJar
            };

            getCoursesEffat(student)
                .then(student => {
                    let promises = student.courses.map(course => getAttEffat(course, student));

                    Promise.all(promises)
                        .then((data) => {
                            student.results = data;
                            return student;
                        })
                        .then((student) => {
                            getNameEffat(student)
                                .then((name) => {
                                    student.name = name;
                                    student.university = "EFFAT";
                                    console.log(student.name + ' resolved at '
                                        + new Date().toLocaleString(('de-DE', {
                                                hour: '2-digit', hour12: false,
                                                timeZone: 'Asia/Riyadh'
                                            })
                                        ) + " From effat university"
                                    );
                                    return resolve(student)
                                });
                        })
                })
                .catch((e) => reject(e.message));

        });//end of request
    })
};

getCoursesEffat = (student) => {
    const data = "action=refreshAjaxModule&modId=_22_1&tabId=_2_1&tab_tab_group_id=_2_1";
    const options = {
        followAllRedirects: true,
        headers: {
            'Content-Length': data.length,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        uri: 'https://blackboard.effatuniversity.edu.sa/webapps/portal/execute/tabs/tabAction',
        body: data,
        method: 'POST',
        jar: student.jar
    };
    return new Promise((resolve, reject) =>
        request(options, (err, res, body) => {
            if (err) return reject('Can\'t get courses');

            try {
                const currentSemesterCode = "201820";
                let student_courses = [];

                const $ = cheerio.load(body);
                const courses = $('li');

                courses.each((i, course) => {
                    let courseName = course.children[3].children[0].data;
                    let courseLink = course.children[3].attribs.href;
                    if (courseName.includes(currentSemesterCode))
                        student_courses.push({
                            courseName: courseName.substring(0, courseName.indexOf(':')).replace(currentSemesterCode, ''),
                            courseID: getJsonFromUrl(courseLink).id
                        })
                });

                student.courses = student_courses;
                return resolve(student)
            }
            catch (e) {
                return reject('Can\'t get courses');
            }

        })
    );
};

getAttEffat = (course, student) => {
    return new Promise((resolve, reject) => {
        request(({
            followAllRedirects: true,
            uri: `https://blackboard.effatuniversity.edu.sa/webapps/BU02-attendance-BBLEARN/links/tool.jsp?course_id=${course.courseID}&mode=view`,
            method: 'GET',
            jar: student.jar
        }), (err, res, body) => {
            if (err)
                return reject('Something went wrong');

            let $ = cheerio.load(body);
            const containerdiv = $('#containerdiv').find('center')[2];
            if (containerdiv === undefined ||
                containerdiv.children[0] === undefined ||
                containerdiv.children[0].children[0] === undefined ||
                containerdiv.children[0].children[0].children[1] === undefined ||
                containerdiv.children[0].children[0].children[1].children === undefined) {
                return reject('Some thing went wrong please check again');
            }

            let attendance_numbers = containerdiv.children[0].children[0].children[1].children;

            let attendance_object = {
                courseName: course.courseName,
                present: attendance_numbers[1].children[0].data,
                absent: attendance_numbers[2].children[0].data,
                late: attendance_numbers[3].children[0].data,
                excused: attendance_numbers[4].children[0].data,
                unexcused: attendance_numbers[5].children[0].data,
            };
            return resolve(attendance_object);
        });
    });
};

getNameEffat = (student) => {
    const options = {
        followAllRedirects: true,
        uri: 'https://blackboard.effatuniversity.edu.sa/webapps/',
        method: 'GET',
        jar: student.jar
    };
    return new Promise((resolve, reject) =>
        request(options, (err, res, body) => {
            if (err) return reject('Can\'t get name');
            try {
                let $ = cheerio.load(body);
                let name = $('#global-nav-link')[0].children[1].data;
                return resolve(name)
            }
            catch (e) {
                return reject('Can\'t get name');
            }

        })
    );
};


function getJsonFromUrl(url) {
    if (!url) url = location.search;
    let query = url.substr(1);
    let result = {};
    query.split("&").forEach(function (part) {
        var item = part.split("=");
        result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
}

