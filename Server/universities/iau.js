const request = require('request-promise');
const querystring = require('querystring');
const cheerio = require('cheerio');

module.exports = {
    getFromIAU: (reqBody) => new Promise((resolve, reject) => {
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
            uri: 'https://sis.iau.edu.sa/psc/hcs9prd/?cmd=login&amp;languageCd=ENG',
            body: formData,
            method: 'POST',
            jar: cookieJar,

            rejectUnauthorized: false,
            requestCert: true,
            agent: false,
        };
        request(options, (err, res, body) => {
            //error cases
            if (err) return reject('Server Not Available, Try Again');
            // if (res.statusCode === 503) return reject('error: Database is not available');
            // let $ = cheerio.load(body);
            // if ($("#loginErrorMessage")[0])
            //     if ($("#loginErrorMessage")[0].children[0])
            //         if ($("#loginErrorMessage")[0].children[0].data)
            //             return reject('error: Wrong Password Or Username');

            let student = {
                //Add the cookieJar for each student
                jar: cookieJar,
                session: res.headers['set-cookie'][1]
            };

            getCoursesIAU(student)
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

getCoursesIAU = (student) => {
    const data = "ICAJAX=1&ICNAVTYPEDROPDOWN=0&ICType=Panel&ICElementNum=0&ICStateNum=35&ICAction=%23ICList&ICXPos=0&ICYPos=0&ResponsetoDiffFrame=-1&TargetFrameName=None&FacetPath=None&ICFocus=&ICSaveWarningFilter=0&ICChanged=-1&ICAutoSave=0&ICResubmit=0&ICSID=UlkH1Cn%2BMSOjgfqDN28xf198eRqTJnadoQVr8yOcsXA%3D&ICAGTarget=true&ICActionPrompt=false&ICTypeAheadID=&ICBcDomData=UnknownValue&ICPanelHelpUrl=&ICPanelName=&ICFind=&ICAddCount=&ICAPPCLSDATA=";
    const options = {
        headers: {
            'Pragma': 'no-cache',
            'Origin': 'https://sis.iau.edu.sa',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8,la;q=0.7',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': '*/*',
            'Cache-Control': 'no-cache',
            'Referer': 'https://sis.iau.edu.sa/psc/hcs9prd/EMPLOYEE/SA/c/MANAGE_ACADEMIC_RECORDS.STDNT_ATTEND_TERM.GBL?&ICAGTarget=start',
            'Connection': 'keep-alive',

            'Content-Length': data.length,
        },
        uri: 'https://sis.iau.edu.sa/psc/hcs9prd/EMPLOYEE/SA/c/NUI_FRAMEWORK.PT_AGSTARTPAGE_NUI.GBL',
        method: 'POST',
        jar: student.jar,

        body: data,

        withCredentials: false,

        rejectUnauthorized: false,
        requestCert: false,
        agent: false,
    };
    return new Promise((resolve, reject) =>
        request(options, (err, res, body) => {
            console.log(err, res, body);
            if (err) return reject('Can\'t get courses');

            try {
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

getAttIAU = (student) => {
    return new Promise((resolve, reject) => {
        request(({
            followAllRedirects: true,
            uri: `https://sis.iau.edu.sa/psc/hcs9prd/EMPLOYEE/SA/c/NUI_FRAMEWORK.PT_AGSTARTPAGE_NUI.GBL?CONTEXTIDPARAMS=TEMPLATE_ID%3aPTPPNAVCOL&scname=ADMN_NAV_COL_PAGE&PanelCollapsible=Y&PTPPB_GROUPLET_ID=E_SERVICE&CRefName=ADMN_NAVCOLL_27`,
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

getNameIAU = (student) => {
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


