/// <reference path="common.js" />
window.configuration.datacontext = (function ($, common) {
    var configdataContext = {
        getconfioptions: getconfioptions,
        onaccountselected: onaccountselected,
        getaccountdetail: getaccountdetail,
        saveaccountsettings: saveaccountsettings,
        savedevicesettings: savedevicesettings,
        getdeleteoptions: getdeleteoptions,
        getnewaccountentity: getnewaccountentity,
        adddevice: savenewdevice,
        addaccount: savenewaccount,
        getdevicemodeltypes: getdevicemodeltypes,
        deleteaccount: deleteaccount,
        deletedevice: deletedevice,
        getfloorPlanImage: getfloorPlanImage,
        changePackage: changePackage,
        upgradePackage:upgradePackage,
        activatePackage: activatePackage,
        deletePackage: deletePackage,
        getpackagedetail: getpackagedetail,
        changeRetentionDays: changeRetentionDays,
        getPackageSummary: getPackageSummary
    };
    var currentSelectedAccount = null;
    var accoundetail = null;
    var data = null;
    function savenewdevice(data, successcallback, errorcallback) {
        return new ajaxRequest("post", saverecoderurl(), data).done(function (jsonResult) {
            if (jsonResult.success) {
                if (successcallback != undefined && successcallback != null)
                    successcallback(jsonResult.data);
            } else {
                if (errorcallback != undefined)
                    errorcallback(jsonResult.errorMessage);
                console.log(jsonResult.errorMessage);
            }
        }).fail(function () { });
    }
    function deletedevice(devicetype, deviceid, successcallback, errorcallback) {
        data = ({ devicetype: devicetype, deviceId: deviceid });
        return new ajaxRequest("post", deletedeviceurl(),data).done(function (jsonResult) {
            if (jsonResult.success) {
                if (successcallback != null && successcallback != undefined) {
                    successcallback(jsonResult.data);
                }
            }
            else {
                if (errorcallback != null && errorcallback != undefined) {
                    errorcallback(jsonResult.errorMessage);
                }
            }

        }).fail(function () {
        });
    }
    function getdeleteoptions(deleteoptionsobservable) {
        var deleOptions = [];
        var options1 = new configdataContext.optionmenuitem({ Id: "1001", Name: Resources.Delete }),
            options2 = new configdataContext.optionmenuitem({ Id: "1002", Name: Resources.Export });
        options3 = new configdataContext.optionmenuitem({ Id: "1003", Name: Resources.Import });
        deleOptions.push(options1);
        deleOptions.push(options2);
        deleOptions.push(options3);
        deleteoptionsobservable(deleOptions);
    }
    function getnewaccountentity(type) {
        var newentity = configdataContext.accountdetailentity({ Name: "", EntityType: type });
        newentity.Isnew(true);
        return newentity;
    }
    function onaccountselected(data) {
        currentSelectedAccount = data;
    }
    function savedevicesettings(data, errorcallback) {
        return new ajaxRequest("POST", saverecoderurl(), data).done(function (jsonresult) {
            if (jsonresult.success) {
                $.publish(common.events.deviceaddedsuccess, data);
                // update tree object
                currentSelectedAccount.callback($.parseJSON(data.toJson()));
            }
            else {
                if (errorcallback != undefined)
                    errorcallback(jsonresult.errorMessage);
                $.publish(common.events.deviceaddedfailed, data);
            }
        }).error(function () {
        });;
    }
    function saveaccountsettings(data, successcallback, errorcallback) {
        return new ajaxRequest("POST", savecustomerurl(), data).done(function (jsonresult) {
            if (jsonresult.success) {
                successcallback(jsonresult);
                $.publish(common.events.accountupdatesuccess, jsonresult);
                // update tree object
                currentSelectedAccount.updatecallback($.parseJSON(data.toJson()));
            }
            else {
                if (errorcallback != undefined)
                    errorcallback(jsonresult.errorMessage);
                $.publish(common.events.accountUpdateFailed, data);
            }
        }).error(function () {
        });;
    }
    function savenewaccount(data, successcallback, errorcallback) {
        return new ajaxRequest("POST", savenewaccounturl(), data).done(function (jsonResult) {
            if (jsonResult.success) {
                if (successcallback != undefined && successcallback != null)
                    successcallback(jsonResult);
            }
            else {
                if (errorcallback != undefined)
                    errorcallback(jsonResult.errorMessage);
            }
        }).fail(function () {
            errorcallback(Resources.General_error);
        });
    }
    function getaccountdetail() {
        data = ({ accountid: currentSelectedAccount.nodedata.Id });
        return ajaxRequest("POST", getaccountdetailurl(),data);
    }
    function getpackagedetail() {
        data = ({ accountid: currentSelectedAccount.nodedata.Id });
        return ajaxRequest("POST", getpackagetdetailurl(),data);
    }
    function getconfioptions(accountType,successcb, errorObservable) {
        // ajaxRequest("GET", getmenuitemurl(accountType))
        data = ({ accountType: accountType });
        ajaxRequest("POST", getmenuitemurl(),data)
          .done(getsucceeded)
          .fail(getfailed);
        function getsucceeded(data) {
            window.configuration.configviewmodel.configOptions.removeAll();
            var configOptionslist = $.map(data, function (item) {
                var menu = new createoptionitem(item);
                    window.configuration.configviewmodel.configOptions.push(menu);
                    return menu;
            });
            if (successcb)
                successcb(window.configuration.configviewmodel.configOptions);
           // configoptionsObservable(configOptionslist);
           // window.configuration.configviewmodel.refreshmenu();
        }
        function createoptionitem(data) {
            return new configdataContext.optionmenuitem(data);
        }
        function getfailed() {
            errorObservable(Resources.Erroronfetchingmenuitems);
        }
    }
    function deleteaccount(id) {
        data = ({accountId:id});
        return ajaxRequest("POST", deleteaccounturl(),data);
    }
    function getfloorPlanImage(accountId, photoObserable, errorObserable) {
        photoObserable(getfloorplanimageurl(accountId));
       
    }
    function changePackage(SelectedpackageId, AccountId, RetentionDays, successcallback, errorcallback) {
        try {
            data = ({ SelectedpackageId: SelectedpackageId, AccountId: AccountId, RetentionDays: RetentionDays });
            return new ajaxRequest("POST", changepackageurl(),data).done(function (jsonResult) {
                if (jsonResult.Success) {
                    if (successcallback != null && successcallback != undefined) {
                        successcallback(jsonResult.data);
                    }
                }
                else {
                    if (errorcallback != null && errorcallback != undefined) {
                        errorcallback(jsonResult.errorMessage);
                    }
                }

            }).fail(function () {
            });

        } catch (e) {
            console.log(e.message);
        }
    }
    function upgradePackage(SelectedpackageId, AccountId, RetentionDays, IsDowngrade, successcallback, errorcallback) {
        try {
            data = ({ SelectedpackageId: SelectedpackageId, AccountId: AccountId, RetentionDays: RetentionDays, IsDowngrade: IsDowngrade });
            return new ajaxRequest("POST", upgradepackageurl(),data).done(function (jsonResult) {
                if (jsonResult.Success) {
                    if (successcallback != null && successcallback != undefined) {
                        successcallback(jsonResult.data);
                    }
                }
                else {
                    if (errorcallback != null && errorcallback != undefined) {
                        errorcallback(jsonResult);
                    }
                }

            }).fail(function () {
            });

        } catch (e) {
            console.log(e.message);
        }
    }
    function activatePackage(data, IsDowngrade,successcallback, errorcallback) {
        try {
            data.IsDowngrade = IsDowngrade;
            return new ajaxRequest("POST", activatepackageurl(), data).done(function (jsonResult) {
                if (jsonResult.Success) {
                    if (successcallback != null && successcallback != undefined) {
                        successcallback(jsonResult.data);
                    }
                }
                else {
                    if (errorcallback != null && errorcallback != undefined) {
                        errorcallback(jsonResult.errorMessage);
                    }
                }

            }).fail(function () {
            });

        } catch (e) {
            console.log(e.message);
        }
    }
    function deletePackage(successcallback, errorcallback) {
        try {
            data = ({ accountid: currentSelectedAccount.nodedata.Id });
            return new ajaxRequest("POST", deletepackageurl(),data).done(function (jsonResult) {
                if (jsonResult.Success) {
                    if (successcallback != null && successcallback != undefined) {
                        successcallback(jsonResult);
                    }
                }
                else {
                    if (errorcallback != null && errorcallback != undefined) {
                        errorcallback(jsonResult.errorMessage);
                    }
                }

            }).fail(function () {
            });

        } catch (e) {
            console.log(e.message);
        }
    }
    function changeRetentionDays(SelectedpackageId, AccountId, RetentionDays, successcallback, errorcallback) {
        try {
            data = ({ SelectedpackageId: SelectedpackageId, AccountId: AccountId, RetentionDays: RetentionDays });
            return new ajaxRequest("POST", changeretentiondaysurl(),data).done(function (jsonResult) {
                if (jsonResult.Success) {
                    if (successcallback != null && successcallback != undefined) {
                        successcallback(jsonResult.data);
                    }
                }
                else {
                    if (errorcallback != null && errorcallback != undefined) {
                        errorcallback(jsonResult.errorMessage);
                    }
                }

            }).fail(function () {
            });

        } catch (e) {
            console.log(e.message);
        }
    }
    function getPackageSummary() {
        try {
            data = ({ accountid: currentSelectedAccount.nodedata.Id });
            return new ajaxRequest("POST", getpackagesummaryurl(),data);

        } catch (e) {
            console.log(e.message);
        }
    }
    function init() {
    }
    init();
    return configdataContext;
    function getdevicemodeltypes(devicemodelobservable) {
        // get from ajax using device controller
        return new ajaxRequest("POST", devicetypeurl()).done(function (jsonData) {
            devicemodelobservable(jsonData.devicetypes);
        }).fail(function () {
            console.error("get device model types failed");
        });

    }
    function getpackagetdetailurl() {

        return $("#configurl").attr("data-url") + "/GetPackageDetails";
    }
    function changepackageurl() {
        //return $("#configurl").attr("data-url") + "/ChangePackage?accountid=" + accountid;
        return $("#configurl").attr("data-url") + "/ChangePackage";//?SelectedpackageId=" + SelectedpackageId + "&AccountId=" + AccountId + "&RetentionDays=" + RetentionDays;
    }
    function changeretentiondaysurl() {
        //return $("#configurl").attr("data-url") + "/ChangePackage?accountid=" + accountid;
        return $("#configurl").attr("data-url") + "/ChangeRetentionDays";//?SelectedpackageId=" + SelectedpackageId + "&AccountId=" + AccountId + "&RetentionDays=" + RetentionDays;
    }
    function activatepackageurl(IsDowngrade) {
        //return $("#configurl").attr("data-url") + "/ChangePackage?accountid=" + accountid;
        return $("#configurl").attr("data-url") + "/ActivatePackage";//?IsDowngrade=" + IsDowngrade;
    }
    function upgradepackageurl() {
        //return $("#configurl").attr("data-url") + "/ChangePackage?accountid=" + accountid;
        return $("#configurl").attr("data-url") + "/UpgradePackage";//?SelectedpackageId=" + SelectedpackageId + "&AccountId=" + AccountId + "&RetentionDays=" + RetentionDays + "&IsDowngrade=" + IsDowngrade;
    }
    function deletepackageurl() {
        return $("#configurl").attr("data-url") + "/DeletePackage";//?accountid=" + accountid;
    }
    function getpackagesummaryurl() {

        return $("#configurl").attr("data-url") + "/GetPackageSummary";//?accountid=" + accountid;
    }
    function getaccountdetailurl() {

        return $("#configurl").attr("data-url") + "/getaccountdetail";
    }
    function getmenuitemurl() {
        return $("#getmenuitemurl").attr("data-url");
    }
    function savecustomerurl() {
        return $("#savecustomerurl").attr("data-url");
    }
    function devicetypeurl() {
        return $("#devicetypeurl").attr("data-url");
    }
    function saverecoderurl() {
        return $("#saverecoderurl").attr("data-url");
    }
    function savenewaccounturl() {
        return $("#savenewaccounturl").attr("data-url");
    }
    function deleteaccounturl() {
        var url = $("#deleteaccounturl").attr("data-url");
       // url = url + "?accountId=" + id;
        return url;
    }
    function deletedeviceurl() {
        var url = $('#deletedeviceurl').attr('data-url');
       // url = url + '?devicetype=' + devicetype + '&deviceId=' + deviceid;
        return url;
    }
    function getfloorplanimageurl(id) {
        var url = $("#getfloorplanimageurl").attr("data-url");
        url = url + "?accountId=" + id + "&bThumb=false";;
        return  url;
    }
})($, window.configuration.common);