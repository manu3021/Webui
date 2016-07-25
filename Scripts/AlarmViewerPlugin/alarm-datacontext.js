/// <reference path="alarm-common.js" />
window.alarmconfig.datacontext = (function ($, common) {
    var configdatacontext = {
        getalarmdetails: getalarmdetails,
        savealarmacknowledge: savealarmacknowledge,
        filterevents: filterevents,
        geteventsummary: geteventsummary,
        getactionbyevent: getactionbyevent,
        performaction: performaction,
        getdevicestatus: getdevicestatus,
        getsystemeventconfiguration: getsystemeventconfiguration,
        getsopbyeventtype: getsopbyeventtype,
        savesopbyeventtype: savesopbyeventtype,
        savesystemeventconfiguration: savesystemeventconfiguration,
        geteventslogcount: geteventslogcount,
        getclipurl: getclipurl,
        getstartLive: getstartLive,
        getAlarmFilters: getAlarmFilters,
        SaveAlarmSearch: SaveAlarmSearch,
        DeleteFilter: DeleteFilter,
        getAlarmFilterDetails: getAlarmFilterDetails,
        sendStopCamerarequest: sendStopCamerarequest,
        getsearchfiltereventtypes: getsearchfiltereventtypes,
        getAccountinfo: getAccountinfo
    }
    return configdatacontext;

    var data = null;

    function getsopbyeventtype(eventtypeid, successCallback, errorCallback) {
        data = ({ eventtypeid: eventtypeid });
        return ajaxRequest("POST", common.getactionPath("getsopbyeventtype"), data).done(function (jsonresult) {
            if (jsonresult.Success) {
                if (successCallback) {
                    successCallback(jsonresult.data);
                }
            }
            else {
                if (errorCallback) {
                    errorCallback(jsonresult.errorMessage);
                }
            }
        }).fail(function (jsonresult) {
            if (errorCallback) {
                errorCallback(Resources.General_error);
            }
        })
    }

    function savesopbyeventtype(data, successCallback, errorCallback) {
        return new ajaxRequest("post", common.getactionPath("savesopbyeventtype"), data).done(function (jsonresult) {
            if (jsonresult.Success) {
                if (successCallback) {
                    successCallback(jsonresult.data);
                }
            }
            else {
                if (errorCallback) {
                    errorCallback(jsonresult.errorMessage);
                }
            }
        }).fail(function () {
            if (errorCallback) {
                errorCallback(Resources.General_error);
            }
        });
    }

    function performaction(entityId, entitytype, actionname, successcallback, errorcallback) {
        data = ({ entityId: entityId, entitytype: entitytype, actionname: actionname });
        return ajaxRequest("POST", common.getactionPath('performaction'), data).done(function (jsonresult) {
            if (successcallback) {
                successcallback(jsonresult);
            }
        }).fail(function () {
            if (errorcallback) {
                errorcallback(Resources.General_error);
            }
        })
    };

    function filterevents(status, eventtype, successCallback, errorCallback) {
        data = ({ status: status, eventtype: eventtype });
        return ajaxRequest("POST", common.getactionPath("getevents"), data).done(function (jsResult) {
            if (successCallback)
                successCallback(jsResult);
        }).fail(function () {
            if (errorCallback)
                errorCallback(Resources.General_error);
        });
    }

    function getalarmdetails(clientOffset, startIndex, maxRecordCount, startDate, endDate, IsAlarm, EventStatus, EntityTypes, TextFilter, EventTypes, successCallback, errorCallback) {
        data = ({ ClinetOffSet: clientOffset, startIndex: startIndex, maxRecordCount: maxRecordCount, startDate: startDate, endDate: endDate, IsAlarm: IsAlarm, EventStatus: EventStatus, EntityTypes: EntityTypes, TextFilter: TextFilter, EventTypes: EventTypes });
        return ajaxRequest("POST", common.getactionPath("getevents"), data).done(function (jsResult) {
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

    function getactionbyevent(entityType, entityId, eventCode, successCallback, errorCallback) {
        data = ({ entityType: entityType, entityId: entityId, eventCode: eventCode });
        return ajaxRequest("POST", common.getactionPath("getactionbyevent"), data).done(function (jsResult) {
            if (successCallback)
                successCallback(jsResult);
        }).fail(function () {
            if (errorCallback)
                errorCallback(Resources.General_error);
        });
    }

    function savealarmacknowledge(eventIdentifiers, newStatus, comments, successCallback, errorCallback) {
        var ids = $.map(eventIdentifiers, function (item) { return item.Id });
        var data = JSON.stringify({ eventIdentifiers: ids, newStatus: newStatus, comments: comments });
        return ajaxRequest("POST", common.getactionPath("saveacknowledge"), data).done(function (jsResult) {
            if (jsResult.Success) {
                if (newStatus == "0")
                    alertify.success(common.messages.ack_save_success);
                else
                    alertify.success(common.messages.clr_save_success);
                if (successCallback)
                    successCallback(eventIdentifiers);
            }
            else {
                if (jsResult.errorMessage.indexOf('DB_NO_VALID_RECORDS') > 0) {
                    alertify.warning(common.messages.already_ack_msg);
                    successCallback(eventIdentifiers);
                }
                else {
                    errorCallback(jsResult.errorMessage, eventIdentifiers);
                    alertify.error(jsResult.errorMessage);
                }
            }
        }).fail(function () {
            if (newStatus == "0")
                alertify.error(common.messages.ack_save_error);
            else
                alertify.error(common.messages.clr_save_error);
            if (errorCallback)
                errorCallback(Resources.General_error);
        });
    }

    function getdevicestatus(deviceType, entityInstanceId, successCallback, errorCallback) {
        data = ({ deviceType: deviceType, entityInstanceId: entityInstanceId });
        return ajaxRequest("POST", common.getactionPath("getdevicestatus"), data).done(function (jsResult) {
            if (jsResult.Success) {
                if (successCallback)
                    successCallback(jsResult);
            }
        }).fail(function () {
            if (errorCallback)
                errorCallback(Resources.General_error);
        });
    }

    function geteventsummary(deviceId, entityType, successCallback, errorCallback) {
        var clientDate = new Date();
        var clientOffset = clientDate.getTimezoneOffset();
        data = ({ clientOffSet: clientOffset, deviceId: deviceId, entityType: entityType });
        return ajaxRequest("POST", common.getactionPath("geteventsummaybydeviceid"), data).done(function (jsResult) {
            if (successCallback)
                successCallback(jsResult);
        }).fail(function () {
            if (errorCallback)
                errorCallback(Resources.General_error);
        });
    }

    function getsystemeventconfiguration(accountId, successCallback, errorCallback) {
        data = ({ accountId: accountId });
        return ajaxRequest("POST", common.getactionPath("getsystemeventconfiguration"), data).done(function (jsResult) {
            if (jsResult.Success)
                successCallback(jsResult);
        }).fail(function () {
            if (errorCallback)
                errorCallback(Resources.General_error);
        });
    }

    function savesystemeventconfiguration(eventConfigurations, accountId, successCallback, errorCallback) {
        data = ({ eventConfigurations: eventConfigurations, accountId: accountId });
        return ajaxRequest("POST", common.getactionPath("savesystemeventconfiguration"), data).done(function (jsResult) {
            if (jsResult.Success) {
                alertify.success(Resources.Successfully_saved);
            }
            else {
                alertify.error(Resources.Save_failed);
            }
        }).fail(function () {
            alertify.error(Resources.Save_failed);
        });
    }

    function geteventslogcount(clientOffset, eventStatus, eventTypeName, startDate, endDate, successCallback, errorCallback) {
        data = ({ clientOffset: clientOffset, eventStatus: eventStatus, eventTypeName: eventTypeName, startDate: startDate, endDate: endDate });
        return ajaxRequest("POST", common.getactionPath("geteventslogcount"), data).done(function (jsResult) {
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

    function getclipurl(sessionId, clipId, cameraId, successCallback, errorCallback) {
        var tzoffset = (new Date().getTimezoneOffset()) * -1;
        data = ({ sessionId: sessionId, clipId: clipId, cameraId: cameraId, timeZoneOffset: tzoffset });
        return ajaxRequest("POST", common.getactionPath("SetupClipByClipId"), data).done(function (jsResult) {
            if (jsResult.Success) {
                if (successCallback)
                    successCallback(jsResult);
            }
            else {
                alertify.error(jsResult.Message);
            }
        }).fail(function (jsResult) {
            if (errorCallback)
                errorCallback(Resources.General_error);
        });
    }

    function getstartLive(cameraId, UniqueID, successCallback, errorCallback) {
        data=({ cameraId: cameraId, UniqueID: UniqueID });
        return ajaxRequest("POST", common.getactionPath("StartLive"), data).done(function (jsResult) {
            if (jsResult.Success) {
                if (successCallback)
                    successCallback(jsResult);
            }
            else {
                if (successCallback)
                    successCallback(jsResult);
            }
        }).fail(function (jsResult) {
            if (errorCallback)
                errorCallback(Resources.General_error);
        });
    }

    function getAlarmFilters(successCallback, errorCallback) {
        return ajaxRequest("POST", common.getactionPath("GetAlarmFilters")).done(function (jsResult) {
            if (successCallback)
                successCallback(jsResult);
        }).fail(function () {
            if (errorCallback)
                errorCallback(Resources.General_error);
        });
    }

    function SaveAlarmSearch(name) {
        var startDate = $("#alarmfrmdatetimepicker > input").val();
        var endDate = $("#alarmtodatetimepicker > input").val();
        if (startDate != undefined && startDate != "" && endDate != undefined && endDate != "") {
            if (new Date(startDate) > new Date(endDate)) {
                alertify.alert(Resources.Alram_EndDateshouldnotbeStartDate); return;
            }
        }
        var filters = window.alarmconfig.uicontext.serachfilter();
        var txtFilter = window.alarmconfig.uicontext.FilteredEntites;
        txtFilter = $.map(txtFilter(), function (item) {
            if (item.EntityType.indexOf('s_') != 0) {
                item.EntityType = 's_' + item.EntityType;
                item.EntityName = item.EntityName + ';' + item.Id;
            }
            return item;
        });
        filters = $.merge(filters, txtFilter);
        var data = $.map(filters, function (item) {
            var val = item.value || item.EntityName;
            return (item.key || item.EntityType) + ',' + (val.toLowerCase() == 'time' ? val + ';' + $('#alarmfrmdatetimepicker').find('input').val() + ';' + $('#alarmtodatetimepicker').find('input').val() : val);
        });
        var orgName = '';
        var strData = JSON.stringify({ alarmTypeDetails: data, sName: name.substring(0, 30) });
        if ((data != null && data != '') && (name != null && name.trim() != '')) {
            return ajaxRequest("POST", common.getactionPath("SaveAlarmSearch"), strData).done(function (jsResult) {
                if (jsResult.Success) {
                    alertify.success(common.messages.alarm_saveSearch);
                    //window.alarmconfig.uicontext.ClearFilter();
                    //$('.searchSpantagholder').children().remove();
                    //$('.search-filter-text').removeClass("alarm-search-btn-selected primary-button alarm-search-btn secondary-button");
                    //$('.search-filter-text').addClass("alarm-search-btn secondary-button");
                    getAlarmFilters(function (jsondata) {
                        if (jsondata.Success) {
                            if (!jsondata.errorMessage)
                                window.alarmconfig.uicontext.updateAlarmFilterDatasource(jsondata);
                            window.alarmconfig.uicontext.closeSaveFilterDialog();
                        }
                    }, function (errorMessage) {
                        alertify.error(errorMessage);
                    });
                }
                else {
                    alertify.error(jsResult.errorMessage);
                }
            }).fail(function () {
                alertify.error(common.messages.alarm_saveSearch_error);
            });
        }
        else {
            alertify.error(Resources.Alarm_NoFilter);
        }
    }

    function DeleteFilter(alarmFilterID, successCallback, errorCallback) {
        var data = JSON.stringify({ alarmFilterID: alarmFilterID });
        return ajaxRequest("POST", common.getactionPath("DeleteAlarmSearch"), data).done(function (jsResult) {
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

    function getAlarmFilterDetails(alarmFilterID, successCallback, errorCallback) {
        data = ({ alarmFilterID: alarmFilterID });
        return ajaxRequest("POST", common.getactionPath("GetAlarmFilterDetails"), data).done(function (jsResult) {
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

    function sendStopCamerarequest(cameraId, Id, successCallback, errorCallback) {
        data = JSON.stringify({ cameraId: cameraId, Id: Id });
        return ajaxRequest("POST", common.getactionPath("PlaybackStopRequest"), data).done(function (jsResult) {
            if (jsResult.Success) {
                if (successCallback)
                    successCallback(jsResult);
            }
        }).fail(function (jsResult) {
            if (errorCallback)
                errorCallback(Resources.General_error);
        });
    }

    function getsearchfiltereventtypes(domainType, successCallback, errorCallback) {
        data = ({ domainType: domainType });
        return ajaxRequest("POST", common.getactionPath("GetSearchFilterEventTypes"), data).done(function (jsResult) {
            if (jsResult.Success) {
                if (successCallback)
                    successCallback(jsResult);
            }
        }).fail(function (jsResult) {
            if (errorCallback)
                errorCallback(Resources.General_error);
        });
    };

    function getAccountinfo(accountId, successCallback, errorCallback) {
        data = ({ accountId: accountId });
        return ajaxRequest("POST", common.getConfigPath("GetAccountDetail"), data).done(function (jsResult) {
            if (jsResult.Success) {
                if (successCallback)
                    successCallback(jsResult.data);
            }
        }).fail(function (jsResult) {
            if (errorCallback)
                errorCallback(Resources.General_error);
        });
    }

})($, window.alarmconfig.common);