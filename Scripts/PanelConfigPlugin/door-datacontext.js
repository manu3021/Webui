/// <reference path="door-common.js" />
window.doorconfig.datacontext = (function ($, common) {
    var configdatacontext = {
        getdoordetail: getdoordetail,
        ondoorselected: ondoorselected,
        savedoordetail: savedoordetail,
        getassociateddevices: getassociateddevices
        //managedoorassociations: managedoorassociations
    }
    return configdatacontext;

    var currentDevice = null;

    function ondoorselected(data) {
        currentDevice = data;
    }

    function getdoordetail(callback) {
        data = ({ doorId: currentDevice.nodedata.Id });
        return new ajaxRequest("POST", getdoordetailurl(),data).done(function (jsonResult) {
            if (jsonResult.Success) {
                if (callback) {
                    callback(jsonResult.data);
                }                    
            }
        });
    }

    function savedoordetail(data, successcallback, errorcallback) {
        return new ajaxRequest("post", savedoordetailurl(), data).done(function (jsonresult) {
            if (jsonresult.Success) {
                if(successcallback != null && successcallback != undefined){
                    successcallback(jsonresult.data);
                }
                currentDevice.updatecallback(jsonresult.data, true);
            }
            else {
                errorcallback(jsonresult.errorMessage);
            }
        }).error(function () {
        });
    }

    function getdoordetailurl(doorId) {
        $('.popover').hide();
        return $("#doorConfigUrl").attr("data-url") + "/GetDoorDetails";//?doorId=" + doorId;
    }

    function savedoordetailurl() {
        return $("#doorConfigUrl").attr("data-url") + "/SaveDoorDetails";
    }

    function getassociateddevicesurl(doorId) {
        //return $("#doorConfigUrl").attr("data-url") + "/GetAssociatedDevices?doorId=" + doorId;
        return $("#doorConfigUrl").attr("data-url") + "/GetAssociatedDevices";
    }

    //function managedoorassociationssurl(doorId, associateddevices) {
    //    return $("#doorConfigUrl").attr("data-url") + "/ManageDoorAssociations";
    //}

    function getassociateddevices(doormodel, callback) {
        data = ({ doorId: doormodel.Id });
        return new ajaxRequest("POST", getassociateddevicesurl(), data).done(function (jsonresult) {
            if (jsonresult.Success) {
                var result = doormodel.InitialiseAssociatedDevices(jsonresult.data);
                callback(result);
            }
        }).error(function () {
            callback(null);
        });
    }

    //function managedoorassociations(associations) {
    //    return new ajaxRequest("get", managedoorassociationssurl(), associations).done(function (jsonresult) {
    //        if (jsonresult.Success) {
    //            alertify.success('assciated cameras to door successfully');
    //        }
    //    }).error(function (json) {
            
    //    });
    //}

   



})($, window.doorconfig.common);