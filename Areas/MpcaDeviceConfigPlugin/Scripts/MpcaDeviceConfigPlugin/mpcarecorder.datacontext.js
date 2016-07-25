/// <reference path="mpcarecorder.common.js" />
window.mpcarecorderconfig.datacontext = (function ($, common) {
    var configdatacontext = {
        getrecorderdetail: getrecorderdetail,
        onmpcadeviceselected: onmpcadeviceselected,
        saverecorderdetail: saverecorderdetail,
        refreshdevicestatus: refreshdevicestatus,
        rebootdevice: rebootdevice,
        resetpassword: resetpassword
    }
    return configdatacontext;
    var data = null;

    var currentDevice = null;
    function onmpcadeviceselected(data) {
        currentDevice = data;
    }
    function getrecorderdetail() {
        data = ({ recorderId: currentDevice.nodedata.Id });
        return ajaxRequest("post", getrecorderdetailurl(),data);
    }
    function saverecorderdetail(data, successcallback, errorcallback) {
        return new ajaxRequest("post", saverecorderdetailurl(), data).done(function (jsonresult) {
            if (jsonresult.success) {
                currentDevice.updatecallback(jsonresult.data);
                successcallback(jsonresult);
            }
            else {
                errorcallback(jsonresult);
            }
        }).error(function () {
        });;
    }
    function rebootdevice(uniqueid, callback) {
        data = ({ uniqueId: uniqueid });
        return new ajaxRequest("post", rebootdeviceurl(),data).done(function (jsonresult) {
            if (callback) {
                callback(jsonresult.success);
            }
        }).error(function () {
            if (callback) {
                callback(false);
            }
        });;
    }
    function refreshdevicestatus(callback, errorcallback) {
        data = ({ recorderId: currentDevice.nodedata.Id });
        return ajaxRequest("post", getrecorderdetailurl(),data).done(function (jsonresult) {
            if (jsonresult) {
                currentDevice.updatecallback(jsonresult);
                if (callback)
                    callback(jsonresult);
            }
            else {
                if (errorcallback)
                    errorcallback();
            }
        }).error(function () {
            if (errorcallback)
                errorcallback();
        });
    }
    function resetpassword(uniqueid, isnew, callback) {
        data = ({ recorderId: currentDevice.nodedata.Id, uniqueid: uniqueid, isnew: isnew });
        return new ajaxRequest("post", resetpasswordurl(),data).done(function (jsonresult) {
            if (callback) {
                callback(jsonresult.success);
            }
        }).error(function () {
            if (callback) {
                callback(false);
            }
        });;
    }

    function getrecorderdetailurl() {
        return $("#mpcadeviceconfigurl").attr("data-url") + "/GetRecorderDetail";//?recorderId=" + recorderId;
    }
    function saverecorderdetailurl() {
        return $("#mpcadeviceconfigurl").attr("data-url") + "/SaveRecorderDetail";
    }
    function rebootdeviceurl() {
        return $("#mpcadeviceconfigurl").attr("data-url") + "/RebootDevice";//?uniqueId=" + uniqueid;
    }
    function resetpasswordurl() {
        return $("#mpcadeviceconfigurl").attr("data-url") + "/ResetPassword";//?recorderId=" + recorderId + "&uniqueid=" + uniqueid + "&isnew=" + isnew;
    }
})(jQuery, window.mpcarecorderconfig.common);