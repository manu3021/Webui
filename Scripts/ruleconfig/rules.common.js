/// <reference path="rules.common.js" />
/// <reference path="../../../../../Products/MaxProCloud/MaxproCloud.Shell/Scripts/Resources.js" />
window.ruleconfiguration = window.ruleconfiguration || {};
window.ruleconfiguration.common = (function ($, ko) {
    var deviceid = null, accountID = null;

    function getruletreeviewurl(parameter) {
        if (parameter)
            return getParameterizedUrl(getActionPathforTreeview("getaccounts"), parameter);
        else
            return getActionPathforTreeview("getaccounts")
    };

    function geteventviewurl() {
        return $("#ruleconfigurl").attr("data-url") + "/geteventslist";//?devicesID=" + deviceid;
    };

    function getpositiontreeviewurl() {
        return $("#ruleconfigurl").attr("data-url") + "/getpositionaccounts";
    };

    function getuserPhotourl() {
        return $("#ruleconfigurl").attr("data-usrurl") + "/getphoto";
    }
    function getuserdetailsurl() {
        return $("#ruleconfigurl").attr("data-url") + "/getusers";  //?accountID=" + accountID;
    };

    var actoinNames = {PUSHNOTIFICATION: { Name: "PushNotification",Tid: 4}, EMAIL: { Name: "Email", Tid: 2 }, SMS: { Name: "SMS", Tid: 1 }, DEVICE: { Name: "Device_Operation", Tid: 0 } };
    var thanThatOptions = { ACTIONS: 2, DEVICES: 1 }, ifthisOptions = { DEVICE: 1, SCHEDULE: 2, TIMEWINDOW: 3, UniversalEvent: 4 };
    var R_CONDITION = { AND: 1, OR: 2 };
    var ruleSettingType = { IFTHIS: 0, THANTHAT: 1 };
    var messages = {
        FAILEDTO_GET_RULES: Resources.FAILEDTO_GET_RULES,
        FAILEDTO_GET_EVENTS: Resources.FAILEDTO_GET_EVENTS,
        RULE_IFTHIS_AND_CONDITION_NOTSUPPORTED: Resources.RULE_IFTHIS_AND_CONDITION_NOTSUPPORTED,
        Rule_configure_then: Resources.Rule_configure_then,
        Rule_configure_when: Resources.Rule_configure_when,
        Rule_configure_when_then: Resources.Rule_configure_when_then,
        Rule_Position_Change_Alert: Resources.Rule_Position_Change_Alert
    },
    Labels = {
        ACTIVATE_RULE: "Activate",
        DEACTIVATE_RULE: "De-activate",
        ACTIVE_TEXT: "Active",
        INACTIVE_TEXT: "Inactive"
    };
    var modalOptions = { show: true, keyboard: false, backdrop: "static" };
    var ruleCategory = {
        None: 0,
        Simple: 1,
        Simple_Schedules: 2,
        Simple_OR: 3,
        SimpleSchedules_OR: 4,
        Combination_TimeInterval: 5,
        Combination_TimeInterval_Schedules: 6,
        Count_TimeInterval: 7,
        Count_TimeInterval_Schedules: 8
    };

    function getactionpath(actionname) {
        return $("#ruleconfigurl").attr("data-url") + "/" + actionname;
    }
    function getActionPathforTreeview(actionname) {
        return $("#ruleconfigurl").attr("data-treeurl") + "/" + actionname;

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
    return {
        ifthisOptions: ifthisOptions,
        thanThatOptions: thanThatOptions,
        ruleSettingType: ruleSettingType,
        actoinNames: actoinNames,
        geteventviewurl: geteventviewurl,
        getruletreeviewurl: getruletreeviewurl,
        getpositiontreeviewurl: getpositiontreeviewurl,
        getuserdetailsurl: getuserdetailsurl,
        getuserPhotourl: getuserPhotourl,
        messages: messages,
        getParameterizedUrl: getParameterizedUrl,
        getactionpath: getactionpath,
        labels: Labels,
        R_CONDITION: R_CONDITION,
        modalOptions: modalOptions,
        ruleCategory: ruleCategory
    }
})($, ko);
