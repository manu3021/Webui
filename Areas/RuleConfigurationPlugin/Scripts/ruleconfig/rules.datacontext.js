/// <reference path="rules.common.js" />
window.ruleconfiguration.datacontext = (function ($, ko, common) {
    var ruleContext = {
        getruleslist: getrules,
        getruledetail: getruledetail,
        getevents: getevents,
        getusers: getusers,
        getuserphoto: getuserphoto,
        getdevicesfor: getdevicesfor,
        addnewrule: addnewrule,
        deleterule: deleterule,
        updaterule: updateRule,
        getSchedules: getSchedules,
        getDeviceActions: getDeviceActions,
        getSupportedUserActions: getSupportedUserActions,
        activatedeactivaterule: activatedeactivaterule
    };
    var data=null;
    function getSupportedUserActions(accoutId) {
        try {
            return ajaxRequest("POST", common.getactionpath("getsupporteduseractions"), { accountId: accoutId });
        } catch (e) {
            console.error(e);
        }
    }
    function getDeviceActions(devices) {
        try {
            var deviceData = {
                toJson: function () {
                    return ko.toJSON(devices);
                }
            }
            return ajaxRequest("POST", common.getactionpath("FetchDeviceActions"), deviceData);
        } catch (e) {
            console.error(e);
        }

        //try {
        //    var url = common.getParameterizedUrl(common.getactionpath("getdeviceactions"), { devices: devices });
        //    return ajaxRequest("POST", url);
        //} catch (e) {
        //    console.error(e);
        //}
    }
    function addnewrule(data, successCallback, errorCallback) {
        try {
            if (data != undefined && data != null) {
                return ajaxRequest("POST", window.ruleconfiguration.common.getactionpath("saveruledata"), data).done(function (jsResult) {
                    if (jsResult.Success) {
                        if (successCallback)
                            successCallback(jsResult);
                    }
                    else {
                        errorCallback(jsResult);
                    }
                });;
            }
        } catch (e) {
            console.error("Rule details add  Error:" + e.message);
        }

    }
    function updateRule(ruleData, successCallback, errorCallback) {
        try {
            var url = common.getactionpath("updateruledata");
            return ajaxRequest("POST", url, ruleData).done(function (jRes) {
                if (jRes.Success) {
                    if (successCallback)
                        successCallback(jRes);
                }
                else {
                    if (errorCallback)
                        errorCallback("Failed to update");
                }
            }).error(function () {
                if (errorCallback)
                    errorCallback("Failed to update");
            });
        } catch (e) {
            console.error(e);
        }
    }
    function deleterule(ruleId, successCallback, errorCallback) {
        try {           
           
            return ajaxRequest("POST", common.getactionpath("deleterule"),{ ruleId: ruleId }).done(function (jRes) {
                if (jRes.Success) {
                    if (successCallback)
                        successCallback(jRes);
                }
                else {
                    if (errorCallback)
                        errorCallback("Failed to delete");
                }
            }).error(function () {

                if (errorCallback)
                    errorCallback("Failed to delete");
            });
        } catch (e) {
            console.error(e);
        }
    }
    function activatedeactivaterule(isactive, ruleId, successCallback, errorCallback) {
        try {            
            return ajaxRequest("POST", common.getactionpath("activatedeactivaterule"), { isactive: isactive, ruleId: ruleId }).done(function (jRes) {
                if (jRes.Success) {
                    if (successCallback)
                        successCallback(jRes);
                }
                else {
                    if (errorCallback) {
                        if (isactive)
                            errorCallback("Failed to deactivate");
                        else
                            errorCallback("Failed to activate");
                    }
                }
            }).error(function () {

                if (errorCallback) {
                    if (isactive)
                        errorCallback("Failed to deactivate");
                    else
                        errorCallback("Failed to activate");
                }
            });
        } catch (e) {
            console.error(e);
        }
    }
    function getrules(successCallback, errorCallback) {
        return ajaxRequest("POST", common.getactionpath("getrulesforuser")).done(function (jsonData) {
            if (jsonData.Success) { successCallback(jsonData); }
        }).fail(function () {
            errorCallback(common.messages.FAILEDTO_GET_RULES);
        });
    }
    function getevents(entityTypes, successCallback, errorCallback) {
        return ajaxRequest("POST", common.geteventviewurl(), { entityTypes: entityTypes }).done(function (jsonData) {
            if (jsonData.Success) { successCallback(jsonData); }
        }).fail(function () {
            errorCallback(common.messages.FAILEDTO_GET_EVENTS);
        });
    }

    function getuserphoto(userid, photoObservable) {
        try {
            return ajaxRequest("POST", window.ruleconfiguration.common.getuserPhotourl(), { uid: userid }).done(function (jsonData) {
                if (jsonData.Success) {
                    if (photoObservable)
                        photoObservable(jsonData.data);
                }
            }).fail(function () {
                //errorCallback(common.messages.FAILEDTO_GET_USERS);
            });
        } catch (e) {
        }
    }

    function getusers(accountid,successCallback, errorCallback) {
        return ajaxRequest("POST", window.ruleconfiguration.common.getuserdetailsurl(), { accountID: accountid}).done(function (jsonData) {
            if (jsonData.Success) { successCallback(jsonData); }
        }).fail(function () {
            errorCallback(common.messages.FAILEDTO_GET_USERS);
        });
    }
    function getruledetail(ruleId, successCallback, errorCallback) {
        try {
            //TO DO
            //var url = $("#sec_viewrulecntr").attr("data-url");
            var url = common.getactionpath("getruledetail");// "/RuleConfig/GetRuleDetail";
            console.log("url test" + url);
            //url = url + "?ruleId=" + ruleId;
            data = ({ruleId:ruleId});
            return ajaxRequest("POST", url,data).done(function (jsonData) {
                if (jsonData.Success) {
                    successCallback(jsonData);
                }
            }).fail(function () {
                errorCallback(common.messages.FAILEDTO_GET_RULES);
            });
        } catch (e) {
            console.error("Error on getruledetail", e);
        }

    }
    function getdevicesfor(siteId, successCakllback, errorCallback) {
        return ajaxRequest("POST", common.getactionpath("getavailabledevices"), { siteId: siteId }).done(function (jsonResult) {
            if (jsonResult.Success) {
                if (successCakllback)
                    successCakllback(jsonResult.data);
            }
            else {
                if (errorCallback)
                    errorCallback(jsonResult.errorMessage);
            }
        }).fail(function () {
            if (errorCallback)
                errorCallback(Resources.General_error);
        });
    }
    function getSchedules(siteId) {
        //var url = common.getParameterizedUrl(common.getactionpath("getschdules"), { positionId: siteId });
        return ajaxRequest("POST", common.getactionpath("getschdules"), { positionId: siteId });
    }
   
    return ruleContext;
})($, ko, window.ruleconfiguration.common);