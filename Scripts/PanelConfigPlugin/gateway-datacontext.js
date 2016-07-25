/// <reference path="gateway-common.js" />
window.gatewayconfig.datacontext = (function ($, common) {
    var configdatacontext = {
        getpaneldetail: getpaneldetail,
        onpanelselected: onpanelselected,
        savepaneldetail: saveGateway,
        refreshdeviceregisterstatus: refreshdeviceregisterstatus,
        updatedevicepassword: updatedevicepassword,
        resetdevicepassword: resetdevicepassword,
        changeuniqueid: changeuniqueid,
        initializepanel: initializepanel,
        syncGateway: syncGateway,
        currentdevice: currentdevicedata
    }
    return configdatacontext;
    var currentDevice = null;
    var data = null;
    function onpanelselected(data) {
        currentDevice = data;
    }

    function currentdevicedata() {
        return currentDevice;
    }

    function getpaneldetail() {
        data = ({ gatewayId: currentDevice.nodedata.Id });
        return ajaxRequest("post", getpaneldetailurl(),data).done(function (jsonresult){
            currentDevice.updatecallback(jsonresult);
        });
    }

    function refreshdeviceregisterstatus(callback) {
        data = ({ gatewayId: currentDevice.nodedata.Id });
        return ajaxRequest("post", getdeviceregisterrefreshstatusurl(),data).done(function (jsonresult) {
            callback(jsonresult.isregistered, jsonresult.isconfigurationuploaded);
        });
    }

    function resetdevicepassword(data, callback) {
        data = ({ gatewayId: currentDevice.nodedata.Id, deviceName: data.UniqueId()});
        return ajaxRequest("post", getresetdevicepasswordurl(),data).done(function (jsonresult) {
            callback(jsonresult.Success);
        }).error(function (e) {
            alertify.error(common.messages.OpearationFailed);
        });
    }

    function updatedevicepassword(data, callback) {
        data = ({ gatewayId: currentDevice.nodedata.Id, deviceName: data.UniqueId() });
        return ajaxRequest("post", getdeviceupdatepasswordurl(),data).done(function (jsonresult) {
            if (jsonresult)
                callback(jsonresult);
            else
                alertify.error(common.messages.OpearationFailed);
        }).error(function (e) {
            alertify.error(common.messages.OpearationFailed);
        });
    }

    function syncGateway(callback) {
        data = ({ gatewayId: currentDevice.nodedata.Id });
        return ajaxRequest("POST", syncgatewayurl(),data).done(function (jsonresult) {
            callback(jsonresult.Success);            
        }).error(function (e) {
            
        });
    }

    function changeuniqueid(data, successcallback, errorcallback) {
        return new ajaxRequest("post", savepaneldetailurl(), data).done(function (jsonresult) {
            if (jsonresult.Success) {
                if (successcallback != null && successcallback != undefined) {
                    successcallback(jsonresult.data);
                }
                data.Name(data.UniqueId());
                jsonresult.data.Name = data.UniqueId();
                jsonresult.data.Status = data.Status();
                currentDevice.updatecallback(jsonresult.data);
            }
            else {
                if (errorcallback != null && errorcallback != undefined) {
                    errorcallback(jsonresult.errorMessage);
                }
            }
        }).error(function () { });
    }

    function saveGateway(data, successcallback, errorcallback) {
        return new ajaxRequest("post", savepaneldetailurl(), data).done(function (jsonresult) {
            if (jsonresult.Success) {
                if(successcallback != null && successcallback != undefined){
                    successcallback(jsonresult.data);
                }
                currentDevice.updatecallback(jsonresult.data);
            }
            else {
                errorcallback(jsonresult.errorMessage);
            }
        }).error(function () {
        });
    }

    function initializepanel(data, successcallback, errorcallback) {
        data = ({ gatewayId: currentDevice.nodedata.Id });
        return new ajaxRequest("post", initializepanelurl(),data).done(function (jsonresult) {
            if (jsonresult.Success) {
                if (successcallback != null && successcallback != undefined) {
                    successcallback(jsonresult.data);
                }
            }
            else {
                errorcallback(jsonresult.errorMessage);
            }
        }).error(function () {
        });
    }

    function initializepanelurl() {
        return $("#gatewayConfigUrl").attr("data-url") + "/InitializePanel";//?gatewayId=" + gatewayId;
    }

    function getpaneldetailurl() {
        return $("#gatewayConfigUrl").attr("data-url") + "/GetDevice";//?gatewayId=" + gatewayId;
    }

    function savepaneldetailurl() {
        return $("#gatewayConfigUrl").attr("data-url") + "/SaveGateway";
    }

    function getdeviceregisterrefreshstatusurl() {
        return $("#gatewayConfigUrl").attr("data-url") + "/GetGatewayRegisterStatus";//?gatewayId=" + gatewayId;
    }

    function syncgatewayurl(gatewayId) {
        return $("#gatewayConfigUrl").attr("data-url") + "/SyncGateway";//?gatewayId=" + gatewayId;
    }

    function getresetdevicepasswordurl() {
        return $("#gatewayConfigUrl").attr("data-url") + "/ResetDevicePassword";//?gatewayId=" + gatewayId + "&deviceName=" + devicename;
    }

    function getdeviceupdatepasswordurl() {
        return $("#gatewayConfigUrl").attr("data-url") + "/UpdateDevicePassword";//?gatewayId=" + gatewayId + "&deviceName=" + devicename;
    }

})($, window.gatewayconfig.common);