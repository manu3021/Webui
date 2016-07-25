/// <reference path="date-format.js" />
window.mapconfig = window.mapconfig || {};
var supportedItemTypes = {
    type1: "CAMERA",
    type2: "DOOR"
}

//TODO refator marker initialize into method
var imagePath = "Content/images/sprite_icons.png";
var markertype = 'richmarker';
var data = null;
window.mapconfig.utility = (function () {
    var instance;
    var utilityObject = function () {
        this.tempMarker = null;
        this.searchautocompelete = null;
    };
    function createInstance() {
        if (instance == null)
            instance = new utilityObject();
        return instance;
    }
    return {
        getinstance: function () {
            return createInstance();
        }
    }
})();
window.mapconfig.common = (function ($) {
    var mapMode = { UNIVERSALMAPMODE: 1000, FLOORPLANMODE: 1001 },
        utility = window.mapconfig.utility.getinstance(),
        currentAccount = null;
    function onaccountselected(selectedAccount) {
        currentAccount = selectedAccount;
    }
    function getparameterizedUrl(url, data) {
        if (typeof data === 'object') {
            var queries = [];
            for (var i in data) {
                queries.push(i + '=' + data[i]);
            }
            url = url + (url.indexOf('?') != -1 ? '&' : '?') + queries.join('&');
        }
        return url;
    }
    function getaccountsUrl() {
        return $("#getaccountsurl").attr("data-url");//{ id: currentAccount.nodedata.id, nodeType: currentAccount.nodedata.EntityType });
    }
    var guid = function () {
        this.s4 = function () {
            return Math.floor((1 + Math.random()) * 0x10000)
                       .toString(16)
                       .substring(1);
        }
    };

    guid.prototype.NewGuid = function () {
        return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
              this.s4() + '-' + this.s4() + this.s4() + this.s4();
    }

    function createGUID() {
        var uId = new guid().NewGuid();
        return uId;
    };
    var getactionPath = function (actionname) {
        var url = $("#alarmConfigUrl").attr("data-url");
        url += "/" + actionname;
        return url;
    }
    return {
        getaccountsUrl: getaccountsUrl,
        utility: utility,
        mapmode: mapMode,
        createGUID: createGUID,
        getparameterizedUrl: getparameterizedUrl,
        getactionPath: getactionPath
    };

})($);

//TOD refactoe to attache to map related object
var selecteddoorId = null;


window.mapconfig.datacontext = (function ($, common) {
    var currentSelectedAccount = null,
        accoundetail = null, currentflooritem = null, currentPopoverTarget = null;
    currentSelectedAccountId = "A70D7DCE-4F1F-E211-AAA2-0050568F021A";
    var onflooritemselected = function (data, event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        if (currentflooritem && currentflooritem == data) {
            if ($(currentPopoverTarget).attr('data-ispopovershown') == 'true') {
                hidepopover();
                return;
            }
        }
        else {
            hidepopover();
        }
        currentflooritem = data;
        currentPopoverTarget = $("#popup_canvas1")[0];// event.currentTarget;
        if (data.status() != null && data.status() != "") {
            if (window.mapmode != 'config') {
                if (data.EntityType().toLowerCase() == "door") {
                    showdoorpopover(event, data);
                }
                else if (data.EntityType().toLowerCase() == "camera") {
                    if (data.status()[0].toLowerCase() == "videook" || data.status()[0].toLowerCase() == "videookmismatch" || data.status()[0].toLowerCase() == "online" || data.status()[0].toLowerCase() == "recordedon") {
                        showcamerapopover(event, data);
                    }
                    else {
                        alertify.error(Resources.MapPlugin_NoLiveVideo);
                    }
                }
            }
        }
    }
    var showcamerapopover = function (event, popoverObseravable) {
        var cameraid = currentflooritem.Id();
        console.log('Camera selected:' + cameraid);
        showcamerapopover.changeCamera(cameraid, currentPopoverTarget, popoverObseravable);
    }

    showcamerapopover.onpopovershown = function (event) {
        $(currentPopoverTarget).off("shown");
        try {
            var popover = $(currentPopoverTarget).data('popover');
            $(popover.$element[0]).children(".popover").addClass("mapcamera");
            var tip = popover.tip();
            var pcontentPanel = tip.find('.popover-content > *').find('.content');
            var playerWrapperId = currentflooritem.Id();
            var $playerWrapper = $("<div id=" + playerWrapperId + "></div>");
            $(pcontentPanel).html($playerWrapper);

            var sessionID = common.createGUID();
            getliveurl(playerWrapperId, sessionID);

        } catch (e) {
            console.error(e);
        }
    }

    showcamerapopover.changeCamera = function (cameraid, target, popoverObseravable) {
        $("#popup_canvas1").empty();
        var camerapopcontent = $("<div id='camera_" + cameraid + "'></div>");
        var popoverContent = camerapopcontent.append($("#camera-small-popup").html());
        $(currentPopoverTarget).popover('destroy');
        $(currentPopoverTarget).attr("data-ispopovershown", true);
        $(currentPopoverTarget).popover({
            html: true,
            content: popoverContent,
            container: 'div[id="popup_canvas1"]',
            title: currentflooritem.Name(),
            trigger: 'manual',
            placement: 'auto'
        }).on("shown", showcamerapopover.onpopovershown);
        $(currentPopoverTarget).popover('show');

    }
    var showdoorpopover = function (event, popoverObseravable) {
        event.stopPropagation();
        $("#popup_canvas1").empty();
        var doorid = currentflooritem.Id();
        console.log('Door selected:' + doorid);
        selecteddoorId = doorid;
        var dooraname = '<header><p id="doorname"></p><p id="status" class="status">Status: </p> <b id="statusicon" class="icon_locked"> </b></header>';
        $(currentPopoverTarget).popover('destroy');
        $(currentPopoverTarget).attr("data-ispopovershown", true);
        $(currentPopoverTarget).popover({
            html: true,
            content: $("#door-popup-map").html(),
            container: 'div[id="popup_canvas1"]',
            title: dooraname,
            trigger: 'manual',
            placement: 'auto'

        }).on("shown", function () {
            showdoorpopover.onpopovershown();
        });
        $(currentPopoverTarget).popover('show');

    }

    showdoorpopover.onpopovershown = function (e, d) {
        $(currentPopoverTarget).off("shown");
        var $node = $("#popup_canvas1").find('#eventsContainer');
        var context = ko.contextFor($node[0]);
        ko.cleanNode($node[0]);
        var activemodel = currentflooritem;
        var address = window.mapconfig.datacontext.activeModel.siteData.ContactInfo;
        var faddress = address.AddressLine1 + " ," + address.City + " ," + address.Region + " ," + address.Country + " ," + address.ZipCode;
        activemodel.Initpopoverdata(selecteddoorId, faddress, address.Phone);
        ko.applyBindings(activemodel, $node[0]);
        $('#doorname').text(currentflooritem.Name());
        geteventsummary(selecteddoorId, "DOOR", function (jsondata) {
            if (jsondata.Success) {
                $('#alarmeventcontainer').html('');
                var $node = $("#popup_canvas1").find('#eventsContainer');
                var context = ko.contextFor($node[0]);
                var model = context.$data;
                model.eventSummaryList.removeAll();
                var esdata = jsondata.data;
                if (jsondata.data.length > 0) {
                    for (var esindex in esdata) {
                        var esdataitem = new eventsummaryentity(esdata[esindex]);
                        model.eventSummaryList.push(esdataitem);
                    }

                }
            }
            getdevicestatus("DOOR", selecteddoorId, function (jsondata) {
                if (jsondata.Success) {
                    var data = _.filter(jsondata.data, function (item) { return item != "" });
                    var Status = _.map(jsondata.data, function (item) {
                        if (item.toLowerCase() == "unlocked") {
                            $('#statusicon').removeClass('icon_locked').addClass('icon_unlocked');
                        }
                        return Resources["DeviceStatus_" + item.replace(/\s/g, '')] || item;
                    });

                    $('#status').text(Resources.Status + ': ' + Status.join(", "));
                }            
                
            }, function (errorMessage) {
                alertify.error(errorMessage);
            });

        }, function (errorMessage) {
            alertify.error(errorMessage);
        });


    }

    var getPlayerImage = function () {
        return $('#playerImage').data('playerimage');
    }


    function bindAndSetupPlayer(eleId, url, isLive) {
        try {
            window.mpcplayer.getplayeroptions(isLive, url, 209, 372, getPlayerImage(), function (playeroptions) {
                var playerInstance = jwplayer(eleId).setup(playeroptions);
                playerInstance.onPause(function (oldstate) {
                    console.info("Player onPause");
                    if (isLive) {
                        playerInstance.play(true);
                    }
                    console.dir(playerInstance.getState());
                });
                playerInstance.onError(function () {
                    //mCurrentPanel.isError(true);
                    if (isLive) {
                        console.info("Player Error: setting live play=TRUE");
                        playerInstance.play(true);
                    }
                    console.info("Player Error");
                });
            });
        } catch (e) {
            throw e;
        }
    }


    function getfloorplandata(id) {
        data = ({ AccountId: id });
        return ajaxRequest("POST", getfloorplanurl(), data);
    }
    function savefloorplan(datamodel, successcallback, errorcallback) {
        return new ajaxRequest("post", savefloorplanurl(), datamodel).done(function (jsonresult) {
            if (jsonresult.Success) {
                successcallback(jsonresult);
            }
            else {
                errorcallback(jsonresult);
            }
        }).error(function () {
        });
    }
    var hidepopover = function (event, data) {
        if (window.mapmode == 'config') return;
        if (currentflooritem && currentflooritem.EntityType().toLowerCase() == "camera") {
            var cameraId = currentflooritem.Id();
            var Id = common.createGUID();
            sendStopCamerarequest(cameraId, Id, function (jsondata) {
                if (jsondata.Success) {
                }
                else {
                    if (jsondata.errorMessage)
                        alertify.error(jsondata.errorMessage);
                }
            }, function (errorMessage) {
                alertify.error(errorMessage);
            });
        }
        if ($(currentPopoverTarget).attr('data-ispopovershown') == 'true') {
            $(currentPopoverTarget).popover('hide');
            $(currentPopoverTarget).off("shown");
            $(currentPopoverTarget).attr('data-ispopovershown', false);
        }



    }

    function getfloorplanurl() {
        return $("#getfloorplanurl").attr("data-url");// + "?AccountId=" + id;

    }
    function savefloorplanurl() {
        return $("#savefloorplanurl").attr("data-url");

    }
    function getaccounts(url, data) {
        // data = ({ id: currentSelectedAccountId, nodeType: currentAccount.nodedata.EntityType });
        return ajaxRequest("POST", url, data);
    }
    function getaccountsurl() {
        return $("#baccounturl").attr("value");
    }
    function getfloorplanimage(id, cb) {
        if (cb) {
            var res = {};
            res.data = getfloorplanimageurl(id);
            res.Success = true;
            cb(res);
        }
    }

    function getfloorplanimageurl(id) {
        var url = $("#getfloorplanImageurl").data("url");
        url = url + "?accountId=" + id+"&bThumb=false";
        return url;
    }

    function getcontactdetails(id) {
        data = ({ accountId: id });
        return window.ajaxRequest("POST", getcontactdetailsurl(), data);
    }

    function getcontactdetailsurl() {
        var url = $("#getcontactdetailsurl").data("url");
        // url = url + "?accountId=" + id;
        return url;
    }

    function getdevicebyentitytype() {
        return ajaxRequest("POST", getdevicebyentitytypeurl()).done(function (jsonresult) {
            if (jsonresult.Success) {
                successcallback(jsonresult);
            }
            else {
                errorcallback(jsonresult);
            }
        }).error(function () {
        });

    }
    function getdevicebyentitytypeurl() {
        var url = $("#deviceActionsUrl").data("url");
        return url;
    }
    function getliveurl(cameraId, UniqueID) {
        if (!swfobject.hasFlashPlayerVersion("1")) {
            alertify.alert(Resources.plsinstflashplayer + '<br/><a href="https://get.adobe.com/flashplayer/" target="_blank">' + Resources.clkdwnadbflsplr + '</a>');
            return;
        }
        getstartLive(cameraId, UniqueID, function (jsondata) {
            if (jsondata.Success && jsondata.data && jsondata.data.VideoResultstring.toLowerCase() == "success" && jsondata.data.Url != "") {
                bindAndSetupPlayer(cameraId, jsondata.data.Url, true);
            }
            else {
                alertify.alert(Resources.mpcaCam_msg_Error_Live);
            }
        }, function (errorMessage) {
            alertify.alert(Resources.mpcaCam_msg_Error_Live);
        });
    }
    function getstartLive(cameraId, UniqueID, successCallback, errorCallback) {
        return ajaxRequest("POST", common.getactionPath("StartLive"), { cameraId: cameraId, UniqueID: UniqueID }).done(function (jsResult) {
            if (jsResult.Success) {
                if (successCallback)
                    successCallback(jsResult);
            }
        }).fail(function (jsResult) {
            if (errorCallback)
                errorCallback(Resources.General_error);
        });
    }
    function sendStopCamerarequest(cameraId, Id, successCallback, errorCallback) {
        return ajaxRequest("POST", common.getactionPath("PlaybackStopRequest"), { cameraId: cameraId, Id: Id }).done(function (jsResult) {
            if (jsResult.Success) {
                if (successCallback)
                    successCallback(jsResult);
            }
        }).fail(function (jsResult) {
            if (errorCallback)
                errorCallback(Resources.General_error);
        });
    }

    function geteventsummary(deviceId, entityType, successCallback, errorCallback) {
        var clientDate = new Date();
        var clientOffset = clientDate.getTimezoneOffset();
        return ajaxRequest("POST", common.getactionPath("geteventsummaybydeviceid"), { clientOffSet: clientOffset, deviceId: deviceId, entityType: entityType }).done(function (jsResult) {
            if (successCallback)
                successCallback(jsResult);
        }).fail(function () {
            if (errorCallback)
                errorCallback(Resources.General_error);
        });
    }

    function getdevicestatus(deviceType, entityInstanceId, successCallback, errorCallback) {
        return ajaxRequest("POST", common.getactionPath("getdevicestatus"), { deviceType: deviceType, entityInstanceId: entityInstanceId }).done(function (jsResult) {
            if (jsResult.Success) {
                if (successCallback)
                    successCallback(jsResult);
            }
        }).fail(function () {
            if (errorCallback)
                errorCallback(Resources.General_error);
        });
    }
    function performaction(entityId, entitytype, actionname, successcallback, errorcallback) {
        return ajaxRequest("POST", common.getactionPath('performaction'), { entityId: entityId, entitytype: entitytype, actionname: actionname }).done(function (jsonresult) {
            if (successcallback) {
                successcallback(jsonresult);
            }
        }).fail(function () {
            if (errorcallback) {
                errorcallback(Resources.General_error);
            }
        })
    };


    function eventSummaryDatasource(eventsummary) {
        var bContext = ko.contextFor(document.getElementById('mainpanel'));
        bContext.$data.eventSummaryData(eventsummary.data);
    }
    var eventSummaryData = function (eventssummary) {
        eventSummaryDatasource([]);
        var esEntities = $.map(eventssummary, function (esItem) {
            return new eventsummaryentity(esItem);
        });
        for (var esindex in esEntities) {
            eventSummaryDatasource.push(esEntities[esindex]);
        }
    }

    var eventsummaryentity = function (data) {
        OriginTime = new Date(parseInt(data.OriginTime.replace('/Date(', '').replace(')/', '').replace('-', '')));
        OriginTime = new Date(OriginTime.getTime() + OriginTime.getTimezoneOffset() * 60000);
        var dateString = OriginTime.format("dd mmm yyyy HH:MM:ss");
        var self = this;
        data = data || {};
        self.BlobTypeName = data.BlobTypeName;
        self.CredentialNumber = data.CredentialNumber != "" && data.CredentialNumber != undefined ? "(" + data.CredentialNumber + ")" : "";
        self.Data = data.Data;
        self.DeviceState = data.DeviceState;
        self.DisplayName = data.DisplayName;
        self.EventCode = data.EventCode;
        self.EventCodeType = Resources["EventCode_" + data.EventCode];
        self.FileName = data.FileName;
        self.OriginTime = dateString;
        self.ImagePath = data.BlobId ? getPhotoPath(data.BlobId) : ""; //data.ImagePath;
        self.toJson = function () {
            return self.toJson(self);
        }
    }
    var getPhotoPath = function (BlobId) {
        var url = "/UserConfig/GetPhoto?uid=" + BlobId + "&bThumb=true";
        return url;
    }
    return {
        getaccounts: getaccounts,
        getfloorplandata: getfloorplandata,
        savefloorplan: savefloorplan,
        getfloorplanimage: getfloorplanimage,
        showcamerapopover: showcamerapopover,
        showdoorpopover: showdoorpopover,
        getliveurl: getliveurl,
        getstartLive: getstartLive,
        sendStopCamerarequest: sendStopCamerarequest,
        geteventsummary: geteventsummary,
        eventSummaryData: eventSummaryData,
        getdevicestatus: getdevicestatus,
        eventSummaryDatasource: eventSummaryDatasource,
        eventsummaryentity: eventsummaryentity,
        getdevicebyentitytype: getdevicebyentitytype,
        performaction: performaction,
        getcontactdetails: getcontactdetails,
        hidepopover: hidepopover,
        onflooritemselected: onflooritemselected,
        currentPopoverTarget: currentPopoverTarget

    };
})($, window.mapconfig.common);



function popoverclearonclick(event, data) {
    window.mapconfig.datacontext.hidepopover();
    $('.floormapitem').removeClass('floormapitemSelected');
    $('.floormapiconcaption').removeClass('floormapitemSelected');
    $('[data-ispopovershown="true"]').each(function () {
        //the 'is' for buttons that trigger popups
        //the 'has' for icons within a button that triggers a popup
        if (!$(this).is(event.target) && $(this).has(event.target).length === 0 && $('.popover').has(event.target).length === 0) {
            $(this).popover('hide');
        }

    });
}

