const querystring = require('querystring');
const request = require('request-promise');
const rcyci = require('./universities/rcyci');

module.exports = {
    getStudent: (form) => {
        const cookieJar = request.jar();
        const formData = querystring.stringify(form);
        return rcyci.getFromRcyci(cookieJar, formData)
    }
};

