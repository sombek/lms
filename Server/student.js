const rcyci = require('./universities/rcyci');
const effat = require('./universities/effat');

module.exports = {
    getStudent: (reqBody) => {
        switch (reqBody.university) {
            case "RCYCI":
                return rcyci.getFromRcyci(reqBody);
            case "EFFAT":
                return effat.getFromEffat(reqBody)
        }
    }
};

