const rcyci = require('./universities/rcyci');
const rcyci_sis = require('./universities/rcyci_peoplesoft');
const iau = require('./universities/iau');
const effat = require('./universities/effat');

module.exports = {
    getStudent: (reqBody) => {
        switch (reqBody.university) {
            case "RCYCI":
                return rcyci_sis.getFromRCYCI_SIS(reqBody);
            case "IAU":
                return iau.getFromIAU(reqBody);
            case "EFFAT":
                return effat.getFromEffat(reqBody)
        }
    }
};