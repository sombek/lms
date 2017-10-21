var express = require('express');
var app = express();
var path = require('path');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var request = require('request-promise');
var querystring = require('querystring');
var cheerio = require('cheerio');

let form = {
    username: '',
    password: ''
};

var cookieJar = request.jar();
var student ={
	name:'',
	courses:[],
	links:[]
};
let GlobalFlag = false;



var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
	    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});

app.post('/', function(req, res, next) {
	function get(){
		if(GlobalFlag==false){
			form.username = req.body.user;
			form.password = req.body.password;
			GlobalFlag = true;
			
		getStudent()
			.then((student)=>{
				const promises = [];
				for(i=0;i<student.links.length;i++){
					promises.push(getAtt(student.links[i]));
				}
				Promise.all(promises)
					.then(data => {
						var dataName = {name:student.name,dat:data}
						student.courses = [];
						student.links = [];
						student.name = '';
						GlobalFlag = false;
						res.json(dataName);
					});
			})
			.catch((err)=>{
				student.courses = [];
				student.links = [];
				student.name = '';
				GlobalFlag = false;
				res.json({err:err});
      	});
		}
		else{
			setTimeout(function(){
			 get();
		 }, 100);
		}
	}
	get();
});//end get route


function getStudent(){
	return new Promise((resolve,reject)=>{
		var formData = querystring.stringify(form);
		var contentLength = formData.length;
		request({
			headers: {
				'Content-Length': contentLength,
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			followAllRedirects: true,
			uri: 'http://lms.yic.edu.sa/moodle/login/index.php',
			body: formData,
			method: 'POST',
    		jar: cookieJar
		},(err,res,body)=>{
			student.courses = [];
			student.links = [];
			student.name = '';
			//error cases
			if(err) {
				console.log('rejected');
				return reject('Server Not Available');
			}
			if(res.statusCode === 503){
				console.log('rejected Database not available');
				return reject('error: Database is not available');
			}
			if(res.headers.expires == ''){
				console.log('rejected Wroung Password Or Username');
				return reject('error: Wroung Password Or Username');
			}
			
			//Get body
			$ = cheerio.load(body);
			
			//Loop in the body to get the student's courses
			$('h4','#region-main').each(function(){
				var course = this.children[0].data;
				student.courses.push(course);
				var url = this.parent.parent.children[1].children[0].children[0].children[0].children[1].children[0].attribs.href+'&tab=attendance&att_week=1';
				student.links.push(url);
			});
			
			//Get the name of student then clean it
			name = $('a.dropdown-toggle','#essentialnavbar').text();
			student.name = name.split(' ').slice(0,2).join(' ');
			if(student.name.includes(',')){
				student.name = name.split(',').slice(0,2).join(' ');
			}
			console.log(student.name + ' resolved at '+ new Date().toLocaleString(('de-DE', {hour: '2-digit',   hour12: false, timeZone: 'Asia/Riyadh' })));
			
			return resolve(student);
		});//end of request
	});//end of promise
};
function getAtt(url) {
    return new Promise((resolve, reject)=> {
				request(({
					followAllRedirects: true,
    				uri: url,
    				method: 'GET',
    				jar: cookieJar
				}),(err,res,body)=>{
					if(err) return reject('Something went wroung');
					$ = cheerio.load(body);	
					var course = $('#page-navbar').find('span');
					if(course[5] === undefined ||
						course[5].children[0] === undefined ||
						course[5].children[0].children[0] === undefined ||
						course[5].children[0].children[0].children[0] === undefined ||
						course[5].children[0].children[0].children[0].data === undefined){
						console.log('rejected something undefined');
						return reject('Some thing went wroung please check again');
					}
					var courseName =course[5].children[0].children[0].children[0].data;
					$('tr','#region-main').each(function(){
						Total_Absence=this.children[3].children[0].data;
						if(Total_Absence!=null){
							if(Total_Absence.indexOf('Hours')!=-1){
								for (var i=0; i < student.courses.length; i++) {
									if (student.courses[i].includes(courseName.split(' ').slice(0,1))){
										var attendace_object = {
											courseName:courseName,
											attendace:Total_Absence
										};
										return resolve(attendace_object);
								}
							}
						}
        			}
				});//end of each absence loop
			});
		});
};



app.listen('3000')
console.log('Magic happens on port 3000');
exports = module.exports = app;
