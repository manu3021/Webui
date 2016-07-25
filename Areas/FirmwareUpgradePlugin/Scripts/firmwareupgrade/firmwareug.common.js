window.firmwareug = window.firmwareug || {};

window.firmwareug.common = (function ($, ko, global) {
    var events = {
        treeItemSelectedEvent: "treeviewitemselected",
        tabselectedevent: "tabselectionchanged"

    };
    var constants = {
        tabId: "#firmwareUpgrade",
        devicestatus: {ONLINE: "online", OFFLINE: "offline"},
        accounttypes: { GENERAL: "general", CUSTOMER: "customer", SITE: "site", GROUP: "group", TIME: "time", DEVICE: "device", CAMERA: "camera", PANEL: "panel", CREDENTIAL: "credential", RECORDER: "recorder", SCHEDULE: "schedules", CREDENTIALHOLDER: "credentialholders", LOGICALTYPE: "logcaltype" }
    };
    var fugRouteTable = [];
    function RegisterRoutes() {
    }
    function getrouteInfo(elementName, viewname, controller) {
    }
    function Initialize() {
        RegisterRoutes();
    }
    function getactionpath(actionname) {
        return $("#fugviewContainer").attr("data-url") + "/" + actionname;
    }
    var getParameterizedUrl = function (url, data) {
        if (typeof data === 'object') {
            var queries = [];
            for (var i in data) {
                queries.push(i + '=' + data[i]);
            }
            url = url + (url.indexOf('?') != -1 ? '&' : '?') + queries.join('&');
        }
        return url;
    }
    Initialize();
    return {
        events: events,
        constants: constants,
        getactionpath: getactionpath,
        getParameterizedUrl: getParameterizedUrl

    };
})($, ko, window);