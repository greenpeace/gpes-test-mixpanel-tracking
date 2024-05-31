/* jshint browser: true, esversion: 6 */
/* global URLSearchParams, console */

const cookieTrackingManager = {

    /**
     * Consent data
     */
    consent: {

    },

    /**
     * Testing function that allows to restore the defaults for consent data
     */
    restoreDefault: function () {

        this.consent = {
            updated: 20200123,
            allowAll: true,
            denyAll: false,
            cats: {
                analytics: true,
                segmentation: true,
                advertisement: false
            }
        };

    },

    /**
     * Reads the stored cookie preferences
     * @returns {object} Returns stored cookie preferences or {}
     */
    read: function () {

        const consentString = localStorage.cookieSettings;
        if (consentString === undefined) {
            return {};
        }
        const consentObject = JSON.parse(consentString);
        this.consent = consentObject;

    },

    /**
     * Write the cookie options
     */
    write: function () {

        this.consent.updated = this.getCurrentDay();
        const consentString = JSON.stringify(this.consent);
        localStorage.cookieSettings = consentString;

    },

    /**
     * Errase all cookies for users that do not want to be tracked, and write their preferences
     */
    erraseAll: function () {

        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }

        const localKeys = Object.keys(localStorage);
        localKeys.forEach(key => {
            localStorage.removeItem(key);
        });

        const sesKeys = Object.keys(sessionStorage);
        sesKeys.forEach(key => {
            sessionStorage.removeItem(key);
        });

        this.write();

    },

    /**
     * Checks if a specific tracker can track
     * @param   {string} category Category of the tracker
     * @returns {boolean}
     */
    canItrack: function (category) {

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has("tracking")) {
            if (urlParams.get("tracking") == "deny_all") {
                return false;
            }
            if (urlParams.get("tracking") == "allow_all") {
                return true;
            }
        }
        
        if (navigator.doNotTrack == "1") {
            return false;
        }

        if (typeof (this.consent.updated) === "number") {

            if (this.daysSinceConsent() > 365 * 2) {
                return false;
            }

        }

        if (this.consent.denyAll === true) {
            return false;
        }
        if (this.consent.allowAll === true) {
            return true;
        }

        if (this.consent.cats !== undefined) {
            if (this.consent.cats[category] === true) {
                return true;
            } else if (this.consent.cats[category] === false) {
                return false;
            } else {
                console.error("This cookie category does not exist");
            }
        }

        return false;

    },

    /**
     * Gets current day in the format 20201231
     * @returns {number}
     */
    getCurrentDay: function () {

        const today = new Date();
        const year = String(today.getFullYear());
        const monthTemp = today.getMonth() + 1;
        let month;
        if (monthTemp < 10) {
            month = "0" + String(monthTemp);
        } else {
            month = String(monthTemp);
        }
        const dayTemp = today.getDate();
        let day;
        if (dayTemp < 10) {
            day = "0" + String(dayTemp);
        } else {
            day = String(dayTemp);
        }
        return Number(year + month + day);

    },

    /**
     * Calculates the number of days since the user answered to consent
     * @returns {number} Days since consent, float
     */
    daysSinceConsent: function () {

        if (typeof (this.consent.updated) === "number") {

            const now = new Date();

            const consentUpdatedString = this.consent.updated.toString();
            const year = Number(consentUpdatedString.substring(0, 4));
            const month = Number(consentUpdatedString.substring(4, 6)) - 1;
            const day = Number(consentUpdatedString.substring(6, 8));
            const updatedDate = new Date(year, month, day); // Values from this.consent.updated

            const milisecondsSinceConsent = now - updatedDate;
            const daysSinceConsent = milisecondsSinceConsent / 1000 / 60 / 60 / 24;

            return daysSinceConsent;

        } else {
            console.error("Consent date was not defined");
        }
    },


    /**
     * Checks if the UI has to ask consent
     * @returns {boolean} Returns true if it has to ask consent
     */
    needToAskConsent: function () {

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has("tracking")) {
            if (urlParams.get("tracking") == "deny_all" || urlParams.get("tracking") == "allow_all" ) {
                return false;
            }
        }
        
        if (typeof (this.consent.updated) !== "number") {
            return true;
        } else {
            if (this.daysSinceConsent() > 365 * 2) {
                return true;
            } else {
                return false;
            }
        }

        console.error("Can't determine if I need to ask for consent");
        return true;
    }

};

