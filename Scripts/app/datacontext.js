define('datacontext', ['jquery', 'underscore', 'ko'], function ($, _, ko) {
    var signout = function () {
        return new ajaxRequest("post", signouturl()).done(function (jsonData) {
            if (jsonData.success)
                window.location = jsonData.redirect || location.href;
        })
    };

    function signouturl() {        
        return $("#signout").attr("data-url");
    }
    var getactionPath = function (actionname) {
        var url = $("#getalarm").attr("data-url");
        var url = url + "/" + actionname;
        return url;
    }
    var getparameterizedUrl = function (url, data) {
        if (typeof data === 'object') {
            var queries = [];
            for (var i in data) {
                queries.push(i + '=' + data[i]);
            }
            url = url + (url.indexOf('?') != -1 ? '&' : '?') + queries.join('&');
        }
        return url;
    }
    function geteventslogcount(clientOffset, eventStatus, eventTypeName, startDate, endDate, successCallback, errorCallback) {
        return ajaxRequest("POST", getactionPath("geteventslogcount"), ({ clientOffset: clientOffset, eventStatus: eventStatus, eventTypeName: eventTypeName, startDate: startDate, endDate: endDate })).done(function (jsResult) {
            if (jsResult.Success) {
                successCallback(jsResult);
            }
            else {
                alertify.error(Resources.DB_NO_VALID_RECORDS);
            }            
        }).fail(function () {
            alertify.error(Resources.DB_NO_VALID_RECORDS);
        });        
    }
    function getalarms(clientOffset, startIndex, maxRecordCount, startDate, endDate, IsAlarm, EventStatus, EntityTypes, TextFilter, successCallback, errorCallback) {
        var data = JSON.stringify({ startIndex: startIndex, maxRecordCount: maxRecordCount, startDate: startDate, endDate: endDate, IsAlarm: IsAlarm, EventStatus: EventStatus, EntityTypes: EntityTypes, TextFilter: TextFilter, ClinetOffSet: clientOffset });
        return ajaxRequest("POST", getactionPath("getevents"), data).done(function (jsResult) {
            if (jsResult.Success) {
                if (successCallback)
                    successCallback(jsResult);
            }
            else if (jsResult.errorMessage) {
                errorCallback(jsResult.errorMessage);
            }

        }).fail(function () {
            if (errorCallback)
                errorCallback(Resources.General_error);
        });
    }
    return {
        geteventslogcount: geteventslogcount,
        getalarms: getalarms,
        signout: signout
    };
});