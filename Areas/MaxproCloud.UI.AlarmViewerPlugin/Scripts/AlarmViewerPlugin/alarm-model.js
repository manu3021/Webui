/// <reference path="alarm-common.js" />
/// <reference path="alarm-datacontext.js" />
/// <reference path="alarm-uicontext.js" />
var pageRowCount = window.alarmconfig.common.constants.pagerowcount;
window.alarmconfig.alarmmodel = (function ($, ko, common, datacontext) {
    var alarmentity = function (data) {
        var self = this;
        data = data || {};
        self.Id = data.Id;
        self.CredentialNumber = data.CredentialNumber != "" && data.CredentialNumber != undefined ? "(" + data.CredentialNumber + ")" : "";
        self.AccountName = data.AccountName;
        self.AlarmDate = data.AlarmDate;
        self.AlarmTime = data.AlarmTime;
        self.EventType = data.EventType;
        self.AccountId = data.AccountId;
        self.OriginTime = data.OriginTime;
        self.SeverityName = Resources["Severity_" + data.SeverityName] || data.SeverityName;
        self.IgnoreCameraEventCodes = ([10003, 10004]);
        self.SeverityColor = common.checkSeverityColor(data.SeverityName);
        self.DoorAdditionalInfo = _.filter(data.AdditionalInfo, function (item) { return item.Key == "DOOR" || item.key == "DOOR" });
        if (self.DoorAdditionalInfo.length > 0) {
            if (self.DoorAdditionalInfo[0].Value) {
                self.DoorId = self.DoorAdditionalInfo[0].Value[0]['ID'];
                self.DoorName = self.DoorAdditionalInfo[0].Value[0]['Name'];
            }
            else if (self.DoorAdditionalInfo[0].value) {
                self.DoorId = self.DoorAdditionalInfo[0].value[0]['ID'];
                self.DoorName = self.DoorAdditionalInfo[0].value[0]['Name'];
            }
        }
        else {
            self.DoorId = "";
            self.DoorName = "";
        }
        self.CameraAdditionalInfo = _.filter(data.AdditionalInfo, function (item) { return (item.Key == "CAMERA" || item.key == "CAMERA") && $.inArray(data.EventCode, self.IgnoreCameraEventCodes) < 0 });
        if (self.CameraAdditionalInfo.length > 0) {
            if (self.CameraAdditionalInfo[0].Value) {
                self.CameraId = self.CameraAdditionalInfo[0].Value[0]['ID'];
                self.CameraName = self.CameraAdditionalInfo[0].Value[0]['Name'];
            }
            else if (self.CameraAdditionalInfo[0].value) {
                self.CameraId = self.CameraAdditionalInfo[0].value[0]['ID'];
                self.CameraName = self.CameraAdditionalInfo[0].value[0]['Name'];
            }
        }
        else {
            self.CameraId = "";
            self.CameraName = "";
        }
        self.MapAdditionalInfo = _.filter(data.AdditionalInfo, function (item) { return item.key == "FLOOR_MAP" || item.key == "FLOOR_MAP_LOCATION" || item.Key == "FLOOR_MAP" || item.Key == "FLOOR_MAP_LOCATION" });
        if (self.MapAdditionalInfo.length > 0) {
            if (self.MapAdditionalInfo[0].Value) {
                self.MapId = self.MapAdditionalInfo[0].Value[0]['ID'];
                self.MapName = self.MapAdditionalInfo[0].Value[0]['Name'];
            }
            else if (self.MapAdditionalInfo[0].value) {
                self.MapId = self.MapAdditionalInfo[0].value[0]['ID'];
                self.MapName = self.MapAdditionalInfo[0].value[0]['Name'];
            }
        }
        else {
            self.MapId = "";
            self.MapName = "";
        }
        self.ClipId = _.first(_.filter(data.Features, function (item) { return item.Name == "ClipId" || item.name == "ClipId" }));
        self.ClipUrl = _.first(_.filter(data.Features, function (item) { return item.Name == "ClipUrl" || item.name == "ClipUrl" }));
        self.Location = data.Location;
        self.EventCode = data.EventCode;
        self.EventCodeType = Resources["EventCode_" + data.EventCode];
        self.SourceEntityName = data.SourceEntityName;
        self.MasterSourceEntityName = data.MasterSourceEntityName;
        self.MasterSourceEntityType = data.MasterSourceEntityType;
        self.Status = ko.observable(data.Status);
        self.IsSelected = ko.observable(false);
        self.Actions = ko.observableArray([]);
        self.SourceEntityType = data.SourceEntityType;
        self.SourceEntityId = data.SourceEntityId;
        self.IsAcknowledge = ko.computed(function () { return self.Status().toLowerCase() != "new"; });
        self.ShowAcknowledge = ko.computed(function () { return self.Status().toLowerCase() == "new" && self.SeverityName != "" && self.EventType != "Event"; });
        self.IsClear = ko.computed(function () { return self.Status().toLowerCase() == "clear"; });
        self.IsSelected.subscribe(function (newValue) {
            if (!newValue && $('[name="chkAll"]').prop('checked')) {
                $('[name="chkAll"]').prop('checked', false);
            }
            if (newValue && $('.eventid:checked').length == $('.eventid').length)
                $('[name="chkAll"]').prop('checked', true);
        });
        self.IsSelectedTr = ko.computed(function () {
            var cssclass = '';
            if (self.IsSelected()) {
                cssclass = 'selectedTr';
            }
            else if (!self.IsSelected()) {
                if (self.IsAcknowledge()) {
                    cssclass = 'read';
                }
                else {
                    cssclass = 'unread';
                }
            }
            return cssclass;
        });
        self.AckButton = function (data, event) {
            var status = "Acknowledge";
            datacontext.savealarmacknowledge([self], 0, status, function (jsResult) {
                self.Status("ACKNOWLEDGE");
                //self.IsSelected(false); abilasha ET observation 
                if (!isNaN($("#alarmsTotalCount").val()) && $("#alarmsTotalCount").val() != "" && $("#alarmsTotalCount").val() != "0" && $("#alarmsTotalCount").val() != 0) {
                    var init = $("#alarmsTotalCount").val() - 1;
                }
                if (data["EventType"].toLowerCase() == 'alarm' && !isNaN($("#alarmsUnAckCount").val()) && $("#alarmsUnAckCount").val() != "" && $("#alarmsTotalCount").val() != "0" && $("#alarmsTotalCount").val() != 0) {
                    var initUnAckCount = $("#alarmsUnAckCount").val() - 1;
                }

                if (isNaN($("#alarmsTotalCount").val())) {
                    console.log("TotalCount" + $("#alarmsTotalCount").val());
                }

                window.alarmconfig.uicontext.loadEventCount(init, initUnAckCount);
                if (!datacontext.isFilterApplied() && !datacontext.showUnFreezeBtn())
                    window.alarmconfig.alarmViewmodel.filteredData();
                //var curr = new Date();
                //if (new Date(self.OriginTime).setHours(0, 0, 0, 0) == curr.setHours(0, 0, 0, 0)) {
                $.publish('loadalarmcount', 1);
                console.log("1 Alarm(s) Acknowledged");
                //}
            }, function (errorMessage) {
                self.Status("NEW");
            });
        }
        self.Type = common.checkEventRange(data.EventCode, data.SeverityName, data.EventType);
        self.threeActioncontentClick = function (data, event) {
            window.alarmconfig.uicontext.showgetactionbyevent(event, self);
        }
        self.IsActionsLinkToShow = ko.computed(function () {
            if (data.EventType == 'Alarm' && (data.EventCode != 5040 && 5000 <= data.EventCode && data.EventCode <= 9999)) {
                return true;
            }
            return false;
        });
        self.performaction = function (data, event) {
            window.alarmconfig.uicontext.showgetactionbyevent.onbuttonclick(event);
            $('#actions span > button').each(function () {
                $(this).removeClass('primary-button').removeClass('secondary-button').addClass('secondary-button');
            })
            $(event.target).removeClass('primary-button').removeClass('secondary-button').addClass('primary-button');
        }
        self.Features = data.Features;
        self.DoorPopOverClick = function (data, event) {
            window.alarmconfig.uicontext.showdoorpopover(event, self);
        }
        self.CameraPopOverClick = function (data, event) {
            window.alarmconfig.uicontext.showcamerapopover(event, self);
        }
        self.MultipleClips = ko.observableArray([]);
        self.MultipleCameraPopOverClick = function (data, event) {
            $("#multiple-videos").modal({ show: true, keyboard: false, backdrop: "static" });
            var checkRuleorNot = false;
            if (data.EventCode == 5040) {
                checkRuleorNot = true;
            }
            window.alarmconfig.alarmViewmodel.showClipRecordedTitle(checkRuleorNot);
            $('.alarm-full-video-body').empty().append('<ul data-bind="foreach:$data"><li data-bind="click:$data.IsHighlighted() ? null : $data.SingleClipClick,css: { highlightMultiClip: $data.IsHighlighted() }"><span class="alarm-event-clip-name" data-bind="text:$data.CameraName"></span><span class="alarm-event-clip-details" data-bind="text:$data.EventCodeType"></span><span class="alarm-event-clip-details" data-bind="text:$data.OriginTime"></span></li></ul>');
            ko.cleanNode(document.getElementById("multiple-videos"));
            ko.applyBindings(self.MultipleClips(), document.getElementById("multiple-videos"));
            $('.highlightMultiClip').removeClass('highlightMultiClip');
        }
        if (data.Features) {
            var items = $.map(data.Features, function (item) {
                if (item.Name.toLowerCase() == "cameraid") {
                    var camDetail = item.Value.split(',');
                    if (camDetail.length > 0) {
                        self.CameraId = camDetail[0];
                        self.ClipId = camDetail[1];
                    }
                    else {
                        self.CameraId = "";
                        self.ClipId = "";
                    }
                    return new datacontext.alarmMultiClipModel(self);
                }
            });
            if (items && items != null && items.length > 1) {
                self.MultipleClips(items);
            }
        }
        if (_.first(self.CameraAdditionalInfo) && data.EventCode != 5040) {
            var dataSource;
            if (_.first(self.CameraAdditionalInfo).value && _.first(self.CameraAdditionalInfo).value.length > 1) {
                dataSource = _.first(self.CameraAdditionalInfo).value;
            }
            if (_.first(self.CameraAdditionalInfo).Value && _.first(self.CameraAdditionalInfo).Value.length > 1) {
                dataSource = _.first(self.CameraAdditionalInfo).Value;
            }
            var cameraDatasource = [];
            for (var index in dataSource) {
                var resThere = _.findWhere(cameraDatasource, { ID: dataSource[index].ID });
                if (!resThere)
                    cameraDatasource.push(dataSource[index]);
            }
            var items = $.map(cameraDatasource, function (item) {
                if (item.ID && item.ID != null) {
                    self.CameraId = item.ID;
                }
                self.ClipId = "";
                return new datacontext.alarmMultiClipModel(self);
            });
            if (items && items != null && items.length > 1) {
                self.MultipleClips(items);
            }
        }
        self.IsSourceMasterareSame = ko.computed(function () {
            if (self.SourceEntityName && self.MasterSourceEntityName && self.SourceEntityName != null && self.MasterSourceEntityName != null && self.SourceEntityName.toLowerCase() == self.MasterSourceEntityName.toLowerCase()) {
                return false;
            }
            return true;
        });
        self.toJson = function () {
            return self.toJson(self);
        }
    }
    datacontext.alarmentity = alarmentity;
})($, ko, window.alarmconfig.common, window.alarmconfig.datacontext);

window.alarmconfig.eventsummarymodel = (function ($, ko, common, datacontext) {
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
        self.ImagePath = data.BlobId ? common.getPhotoPath(data.BlobId) : "";//data.ImagePath;
        self.toJson = function () {
            return self.toJson(self);
        }
    }
    datacontext.eventsummaryentity = eventsummaryentity;

})($, ko, window.alarmconfig.common, window.alarmconfig.datacontext);

window.alarmconfig.alarmViewmodel = (function ($, datacontext, validationContext) {
    var self = this;
    var severityentity = function (data) {
        var self = this;
        data = data || {};
        self.Id = data.Id;
        self.Name = Resources["EventCode_" + data.EventCode];
        self.Description = data.Description;
        self.Priority = data.Priority;
        self.EventType = ko.observable(data.EventType);
        self.Severity = ko.observable(data.Severity);
        self.toJson = function () { return self.toJson(self); }
    }
    var alarmConfigPage = function () {
        var self = this;
        self.AlarmEventModel = ko.observable(new alarmEventModel());
        self.AlarmConfigModel = ko.observable(new alarmConfigModel());
    }
    var alarmConfigModel = function () {
        var self = this;
        self.CriticalDropped = ko.computed({
            read: function () {
                return true;
            },
            write: function (value) {
                value.EventType("Alarm");
                value.Severity("Critical");
            }
        });
        self.MajorDropped = ko.computed({
            read: function () {
                return true;
            },
            write: function (value) {
                value.EventType("Alarm");
                value.Severity("Major");
            }
        });
        self.ModerateDropped = ko.computed({
            read: function () {
                return true;
            },
            write: function (value) {
                value.EventType("Alarm");
                value.Severity("Moderate");
            }
        });
        self.NormalDropped = ko.computed({
            read: function () {
                return true;
            },
            write: function (value) {
                value.EventType("Alarm");
                value.Severity("Normal");
            }
        });
        self.EventDropped = ko.computed({
            read: function () {
                return true;
            },
            write: function (value) {
                value.EventType("Event");
                value.Severity("");
            }
        });
    }
    var alarmEventModel = function () {
        var filtered = null;
        var self = this;
        self.AllEvents = ko.observableArray([]);
        self.Events = ko.computed(function () {
            return _.filter(self.AllEvents(), function (item) { if (item.EventType().toLowerCase() == "event") return item; });
        });
        self.CriticalEvents = ko.computed(function () {
            return _.filter(self.AllEvents(), function (item) { if (item.EventType().toLowerCase() == "alarm" && item.Severity().toLowerCase() == "critical") return item; });
        });
        self.MajorEvents = ko.computed(function () {
            return _.filter(self.AllEvents(), function (item) { if (item.EventType().toLowerCase() == "alarm" && item.Severity().toLowerCase() == "major") return item; });
        });
        self.ModerateEvents = ko.computed(function () {
            return _.filter(self.AllEvents(), function (item) { if (item.EventType().toLowerCase() == "alarm" && item.Severity().toLowerCase() == "moderate") return item; });
        });
        self.NormalEvents = ko.computed(function () {
            return _.filter(self.AllEvents(), function (item) { if (item.EventType().toLowerCase() == "alarm" && item.Severity().toLowerCase() == "normal") return item; });
        });
        self.Save = function (data, event) {
            var context = ko.contextFor(event.currentTarget);
            datacontext.savesystemeventconfiguration(context.$data.AlarmEventModel().AllEvents(), "A70D7DCE-4F1F-E211-AAA2-0050568F021A", success, error);
        }
        self.Cancel = function (data, event) {
            alertify.confirm(Resources.Alarm_WantToProceed, function (e) {
                if (e) {
                    self.AllEvents([]);
                    window.alarmconfig.uicontext.changeView(true);
                }
            });
        }
        self.Initialize = function (events) {
            self.AllEvents([]);
            self.AllEvents($.map(events, function (esItem) {
                return new severityentity(esItem);
            }));
        }
        self.MoveClick = function (data, event) {
            window.alarmconfig.uicontext.showmovepopover(event, self);
        }
        function success(items) {
            var test;
        }
        function error(items) {
            var test;
        }
    }
    datacontext.alarmConfigModel = alarmConfigModel;
    var alarmDatasource = ko.observableArray([]);
    var searchFilterEventTypeVideoDatasource = ko.observableArray([]);
    var searchFilterEventTypeAccessDatasource = ko.observableArray([]);
    var alarmFilterDatasource = ko.observableArray([]);
    var filteredDatasource = ko.observableArray([]);
    var pageSize = ko.observable(pageRowCount);
    var pageIndex = ko.observable(0);
    var previousPage = function () {
        pageIndex(pageIndex() - 1);
    };
    var nextPage = function () {
        pageIndex(pageIndex() + 1);
    };
    var maxPageIndex = ko.dependentObservable(function () {
        if (filteredDatasource != undefined && filteredDatasource().length > 0) {
            return Math.ceil(filteredDatasource().length / pageSize()) - 1;
        } else {
            return 0;
        }
    }, window.alarmconfig.alarmViewmodel);
    var pagedRows = ko.dependentObservable(function () {
        if (filteredDatasource != undefined && filteredDatasource().length > 0) {
            var size = pageSize();
            var start = pageIndex() * size;
            var slicedArr = filteredDatasource.slice(start, start + size);
            if (slicedArr.length == 0) {
                size = pageSize();
                start = 0; pageIndex(0);
                slicedArr = filteredDatasource.slice(start, start + size);
            }
            if (slicedArr.length <= pageRowCount && filteredDatasource().length > pageRowCount) {
                start = start - pageRowCount + slicedArr.length;
                start = start < 0 ? 0 : start;
                slicedArr = filteredDatasource.slice(start, start + size);
            }
            return slicedArr;
        } else { return filteredDatasource; }
    }, window.alarmconfig.alarmViewmodel);
    var eventSummaryDatasource = ko.observableArray([]);
    var severityMasterDatasource = ko.observableArray([]);
    var severityEventDatasource = ko.observableArray([]);
    var filteredAlarmDatasource = function (events) {
        if (events) {
            alarmDatasource([]);
            var alEntities = $.map(events, function (aItem) {
                return new datacontext.alarmentity(aItem);
            });
            for (var alindex in alEntities) {
                var resThere = _.findWhere(alarmDatasource(), { Id: alEntities[alindex].Id });
                if (!resThere)
                    alarmDatasource.push(alEntities[alindex]);
            }
            if (!datacontext.isFilterApplied())
                filteredData();
        }
    }
    var historyAlarmDatasource = function (filtereddata) {
        var newlyfetcheddata = [];
        var alEntities = $.map(filtereddata, function (aItem) {
            return new datacontext.alarmentity(aItem);
        });
        //alEntities.sort(function (a, b) {
        //    return new Date(a.OriginTime) - new Date(b.OriginTime);
        //});
        for (var alindex in alEntities) {
            var resThere = _.findWhere(alarmDatasource(), { Id: alEntities[alindex].Id });
            if (!resThere) {
                alarmDatasource.push(alEntities[alindex]);
                newlyfetcheddata.push(alEntities[alindex]);
            }
        }
        if (!datacontext.isFilterApplied()) {
            filteredData();
        }

        return newlyfetcheddata;
    }

    var updateAlarmDatasource = function (events) {
        var newlyfetcheddata = [];
        if (events) {
            var alEntities = $.map(events, function (aItem) {
                return new datacontext.alarmentity(aItem);
            });
            //alEntities.sort(function (a, b) {
            //    return new Date(a.OriginTime) - new Date(b.OriginTime);
            //});			
            for (var alindex in alEntities) {
                var resThere = _.findWhere(alarmDatasource(), { Id: alEntities[alindex].Id });
                if (!resThere) {
                    alarmDatasource.unshift(alEntities[alindex]);
                    newlyfetcheddata.push(alEntities[alindex]);
                }
            }
            if (!datacontext.isFilterApplied() && !datacontext.showUnFreezeBtn()) {
                //Close all the popovers
                $('.webui-popover').remove();
                filteredData();
            }
            if (datacontext.showUnFreezeBtn()) {
                datacontext.freezeCount(datacontext.freezeCount() + 1);
            }
            else {
                var filters = window.alarmconfig.uicontext.serachfilter();
                var searchTxtBox = $('.alarm-search-textbox');
                var orgTxt = searchTxtBox.val();
                if (searchTxtBox.val() != '' || filters.length > 0 && datacontext.filterApplied()) {
                    window.alarmconfig.uicontext.filterAlarms(alEntities, [{ name: 'live', keyCode: 13 }]);
                    searchTxtBox.val(orgTxt);
                }
            }
        }
        return newlyfetcheddata;
    }

    var freezedAlarmDataSource = function (events) {
        var newlyfetcheddata = [];
        if (events) {
            var alEntities = $.map(events, function (aItem) {
                return new datacontext.alarmentity(aItem);
            });
            for (var alindex in alEntities) {
                var resThere = _.findWhere(filteredDatasource(), { Id: alEntities[alindex].Id });
                if (!resThere) {
                    filteredDatasource.push(alEntities[alindex]);
                    newlyfetcheddata.push(alEntities[alindex]);
                }
            }
        }
        return newlyfetcheddata;
    }
    var updateAlarmFilterDatasource = function (events) {
        if (events) {
            alarmFilterDatasource([]);
            var alEntities = $.map(events.Result[0].Value, function (aItem) {
                return new datacontext.alarmFilterentity(aItem);
            });
            for (var i = 0 ; i < alEntities.length; i++) {
                var resThere = _.findWhere(alarmFilterDatasource(), { alarmFilterID: alEntities[i].alarmFilterID });
                if (!resThere)
                    alarmFilterDatasource.unshift(alEntities[i]);
            }
        }
    }
    var acknowledgeAll = function (status) {
        var filter = $("#alarmFilter").val();
        var resultEnt = _.filter(filteredDatasource(), function (item) {
            return item.IsSelected();
        });
        if (status.toLowerCase() == "acknowledge") {
            if (resultEnt.length == 0) {
                alertify.confirm(Resources.Alarm_DoYouText + " " + status + " " + Resources.Alarm_AllText + $('#alarmsUnAckCount').val() + Resources.Alarm_AlarmQuestion, function (checked) {
                    if (checked) {
                        //var newids = _.filter(filteredDatasource(), function (item) {
                        //    return item.Status().toLowerCase() == "new" && item.EventType.toLowerCase() == "alarm";
                        //});
                        var newids = [];
                        //if (newids.length > 0) {
                        datacontext.savealarmacknowledge(newids, 0, status, onSuccessAck, onFailAck);
                        //$.publish('loadalarmcount', true);
                        //}
                        //else
                        //  alertify.alert("Selected event(s) already acknowledged.");
                    }
                });
            }
            else {
                var resultEnt = _.filter(resultEnt, function (item) {
                    return item.Status().toLowerCase() == "new" && item.EventType.toLowerCase() == "alarm";
                });
                if (resultEnt.length > 0) {
                    datacontext.savealarmacknowledge(resultEnt, 0, status, onSuccessAck, onFailAck);
                    //$.publish('loadalarmcount', true);
                }
                else
                    alertify.alert(Resources.Alram_SelectedEventsAcknowledged);
            }
        }
        else if (status.toLowerCase() == "clear") {

            if (resultEnt.length == 0) {
                alertify.confirm(Resources.Alarm_DoYouText + " " + status +" "+ Resources.Alarm_AllQuestion, function (checked) {
                    if (checked) {
                        var newids = _.filter(filteredDatasource(), function (item) {
                            return (item.Status().toLowerCase() == "acknowledge" || item.EventType.toLowerCase() == "event");
                        });
                        var resultEventCount = _.filter(newids, function (item) {
                            return (item.EventType.toLowerCase() == "event");
                        });
                        var resultAckCount = _.filter(newids, function (item) {
                            return (item.Status().toLowerCase() == "acknowledge");
                        });
                        if (newids.length > 0) {
                            if (filter == "Event")
                                onSuccessClr(resultEventCount);
                            else if (filter == "ACKNOWLEDGE")
                                onSuccessClr(resultAckCount)
                            else {
                                onSuccessClr(newids);//message for both clear and clear all
                                alertify.success(window.alarmconfig.common.messages.clr_save_success);
                            }
                            if (filter != "ACKNOWLEDGE") {
                                if (!isNaN($("#alarmsTotalCount").val()) && $("#alarmsTotalCount").val() != "" && $("#alarmsTotalCount").val() != "0" && $("#alarmsTotalCount").val() != 0) {
                                    var init = parseInt($("#alarmsTotalCount").val()) - resultEventCount.length;
                                    window.alarmconfig.uicontext.loadEventCount(init);
                                }
                                if (isNaN($("#alarmsTotalCount").val())) {
                                    console.log("TotalCount" + $("#alarmsTotalCount").val());
                                }
                            }
                            //datacontext.savealarmacknowledge(newids, 1, status, onSuccessClr, onFailClr);
                            if (!datacontext.isFilterApplied())
                                filteredData();
                        }
                        else
                            alertify.alert(Resources.Alarm_AcknowledgebeforeClear);
                    }
                });
            }
            else {
                var resultEnt = _.filter(resultEnt, function (item) {
                    return (item.Status().toLowerCase() == "acknowledge" || item.EventType.toLowerCase() == "event");
                });
                var resultEventCount = _.filter(resultEnt, function (item) {
                    return (item.EventType.toLowerCase() == "event");
                });
                var resultAckCount = _.filter(resultEnt, function (item) {
                    return (item.Status().toLowerCase() == "acknowledge");
                });
                if (resultEnt.length > 0) {
                    if (filter == "Event")
                        onSuccessClr(resultEventCount);
                    else if (filter == "ACKNOWLEDGE")
                        onSuccessClr(resultAckCount)
                    else {
                        onSuccessClr(resultEnt);
                        alertify.success(window.alarmconfig.common.messages.clr_save_success);
                    }
                    if (filter != "ACKNOWLEDGE") {
                        if (!isNaN($("#alarmsTotalCount").val()) && $("#alarmsTotalCount").val() != "" && $("#alarmsTotalCount").val() != "0" && $("#alarmsTotalCount").val() != 0) {
                            var init = parseInt($("#alarmsTotalCount").val()) - resultEventCount.length;
                            window.alarmconfig.uicontext.loadEventCount(init);
                        }
                        if (isNaN($("#alarmsTotalCount").val())) {
                            console.log("TotalCount" + $("#alarmsTotalCount").val());
                        }
                    }
                    //datacontext.savealarmacknowledge(resultEnt, 1, status, onSuccessClr, onFailClr);
                    if (!datacontext.isFilterApplied())
                        filteredData();
                }
                else
                    alertify.alert(Resources.Alarm_AcknowledgebeforeClear);
            }
        }
        //Abilasha ET observation
        //$.map(window.alarmconfig.alarmViewmodel.filteredDatasource(), function (item) {
        //    item.IsSelected(false);
        //    return item;
        //});

        function onSuccessAck(items) {
            if (items.length == 0) {
                items = _.filter(filteredDatasource(), function (item) {
                    return item.EventType.toLowerCase() == "alarm";
                });
                for (var i = 0; i < items.length; i++) {
                    items[i].Status("ACKNOWLEDGE");
                }
                var clientDate = new Date();
                var clientOffset = clientDate.getTimezoneOffset();
                datacontext.geteventslogcount(clientOffset, 'NEW', 'Alarm', null, null, function (jsondata) {
                    if (jsondata.Success) {
                        if (!jsondata.errorMessage) {
                            var initCount = jsondata.data;
                            if (initCount == 0) {
                                $("#alarmsTotalCount").val("0");
                                $("#alarmsUnAckCount").val("0");
                                $(".alarmCount").html("(0)");
                            }
                            window.alarmconfig.uicontext.loadEventCount(initCount, initCount);
                        }
                        else
                            alertify.error(jsondata.errorMessage);
                    }
                    else {
                        if (jsondata.errorMessage)
                            alertify.error(jsondata.errorMessage);
                    }
                }, function (errorMessage) { alertify.error(errorMessage); });
                $.publish('loadalarmcount', true);
                console.log("All Alarm(s) Acknowledged");
            }
            else {
                for (var i = 0; i < items.length; i++) {
                    items[i].Status("ACKNOWLEDGE");
                }
                if (!isNaN($("#alarmsTotalCount").val()) && $("#alarmsTotalCount").val() != "" && $("#alarmsTotalCount").val() != "0" && $("#alarmsTotalCount").val() != 0) {
                    var init = $("#alarmsTotalCount").val() - items.length;
                }
                if (!isNaN($("#alarmsUnAckCount").val()) && $("#alarmsUnAckCount").val() != "" && $("#alarmsTotalCount").val() != "0" && $("#alarmsTotalCount").val() != 0) {
                    var initUnAckCount = $("#alarmsUnAckCount").val() - items.length;
                }
                if (isNaN($("#alarmsTotalCount").val())) {
                    console.log("TotalCount" + $("#alarmsTotalCount").val());
                }
                window.alarmconfig.uicontext.loadEventCount(init, initUnAckCount);
                $.publish('loadalarmcount', items.length);
                console.log(items.length + " Alarm(s) Acknowledged");
            }
            if (!datacontext.isFilterApplied() && !datacontext.showUnFreezeBtn()) {
                filteredData();
                getDataAftrAck();
            }
        }
        function onFailAck(message, items) {
        }
        function onSuccessClr(items) {
            if (items.length > 0)
                alarmDatasource.removeAll(items);
            if (datacontext.isFilterApplied()) {
                filteredDatasource.removeAll(items)
            }
            //for (var i = 0; i < items.length; i++) {
            //    items[i].Status("CLEAR");
            //}
        }
        function onFailClr(message, items) {
        }
        //$('[name="chkAll"]').prop('checked', false);
    }
    var filteredData = function () {
        filteredDatasource([]);
        var filtered;
        var filter = $("#alarmFilter").val();
        $("#filterText").html(filter);
        $('.eventAck').show();
        $('#SaveSearch').hide();
        switch (filter) {
            case "AllAlarms":
                filtered = _.filter(alarmDatasource(), function (item) {
                    return item;
                });
                $("#filterText").html(Resources.AllAlarms);
                break;
            case "ACKNOWLEDGE":
                filtered = _.filter(alarmDatasource(), function (item) {
                    return item.Status() == filter;
                });
                $("#filterText").html(Resources.Acknowledged);
                $('.eventAck').hide();
                break;
            case "NEW":
                filtered = _.filter(alarmDatasource(), function (item) {
                    return item.Status() == filter && item.EventType.toLowerCase() == "alarm";
                });
                $("#filterText").html(Resources.UnAcknowledged);
                break;
            case "Event":
                filtered = _.filter(alarmDatasource(), function (item) {
                    return item.EventType == filter;
                });
                $("#filterText").html(Resources.Events);
                $('.eventAck').hide();
                break;
        }
        //filtered.sort(function (a, b) {
        //    return new Date(a.OriginTime) - new Date(b.OriginTime);
        //});

        filteredDatasource(filtered);
        // for (var alindex in filtered) {
        // filteredDatasource.unshift(filtered[alindex]);
        // }        
        $(".alarmCount").css('display', 'inline-block');
        if ($("#alarmFilter").val() != "AllAlarms")
            $(".alarmCount").html("(" + filtered.length + ")");
        if ($("#alarmFilter").val() == "AllAlarms" || $("#alarmFilter").val() == "NEW") {
            $(".alarmCount").html("(0)");
            switch ($("#alarmFilter").val()) {
                case "AllAlarms":
                    if (!isNaN($("#alarmsTotalCount").val()) && $("#alarmsTotalCount").val() != "" && $("#alarmsTotalCount").val() != "0" && $("#alarmsTotalCount").val() != 0) {
                        $(".alarmCount").html("(" + $("#alarmsTotalCount").val() + ")");
                    }
                    break;
                case "NEW":
                    if (!isNaN($("#alarmsUnAckCount").val()) && $("#alarmsUnAckCount").val() != "" && $("#alarmsUnAckCount").val() != "0" && $("#alarmsUnAckCount").val() != 0) {
                        $(".alarmCount").html("(" + $("#alarmsUnAckCount").val() + ")");
                    }
                    break;
            }

            if (isNaN($("#alarmsTotalCount").val())) {
                console.log("TotalCount" + $("#alarmsTotalCount").val());
            }
        }
        if ($("#alarmFilter").val() == "ACKNOWLEDGE") {
            $(".alarmCount").css('display', 'none');
        }
        //if ($("#alarmFilter").val() == "NEW") {
        //    $(".alarmCount").html("(" + $("#alarmsUnAckCount").val() + ")");
        //}
    }
    var getDataAftrAck = function () {
        if (filteredDatasource().length == 0) {
            var clientDate = new Date();
            var clientOffset = clientDate.getTimezoneOffset();
            datacontext.getalarmdetails(clientOffset, 0, 15, null, null, true, "New", null, null, null, function (jsondata) {
                if (jsondata.Success) {
                    if (!jsondata.errorMessage)
                        historyAlarmDatasource(jsondata.data, true);
                    else
                        alertify.error(jsondata.errorMessage);
                }
            }, function (errorMessage) {
                alertify.error(errorMessage);
            });
        }
    }
    //self.alarmSearch = function (data, event) {
    //    window.alarmconfig.uicontext.filterAlarms(data, event);
    //}
    var eventSummaryData = function (eventssummary) {
        eventSummaryDatasource([]);
        var esEntities = $.map(eventssummary, function (esItem) {
            return new datacontext.eventsummaryentity(esItem);
        });
        for (var esindex in esEntities) {
            eventSummaryDatasource.push(esEntities[esindex]);
        }
    }
    self.FilterName = ko.observable("");
    self.IsError = ko.observable(false);
    self.Errormessage = ko.observable("");
    var severityMasterData = function (events) {
        var alConfig = new alarmConfigPage();
        alConfig.AlarmEventModel().Initialize(events);
        return alConfig;
    }
    self.ShowPopUpForFilterName = function (data, event) {
        if (alarmFilterDatasource().length < $('#filterCount').val()) {
            $('.alarm-filter-save').parents('.alarm-new-cus').removeClass('open');
            self.FilterName("");
            window.alarmconfig.uicontext.showSaveFilterDialog();
            ko.cleanNode(document.getElementById("save-filters"));
            ko.applyBindings(self, document.getElementById("save-filters"));
        }
        else
            alertify.error(Resources.Exceeded_Maximum_Limit);
    }
    self.showerror = function () {
        window.alarmconfig.uicontext.showError();
    }
    self.hideerror = function () {
        window.alarmconfig.uicontext.hideError();
    }
    self.SaveAlarmSearch = function (data, event) {
        if ($.trim(event.currentTarget.value || data.FilterName()) == "") {
            self.IsError(true);
            self.Errormessage(Resources.Filter_Name_Required);
            return;
        }
        else {
            if ($.trim(event.currentTarget.value || data.FilterName()).length < 2) {
                self.IsError(true);
                self.Errormessage(Resources.Min_Two_Characters_Required);
                return;
            }
            else if ($.trim(event.currentTarget.value || data.FilterName()).length > 30) {
                self.IsError(true);
                self.Errormessage(Resources.More_Than_Thirty_Characters_Not_Allowed);
                return;
            }
            else {
                self.IsError(false);
            }
        }
        var isValidName = _.filter(alarmFilterDatasource(), function (item) {
            var filterName = (event.currentTarget.value || data.FilterName()).trim();
            return item.entityName.toLowerCase() == filterName.toLowerCase();
        }).length > 0 ? false : true;
        if (event && ((event.type == "keyup" && $(event)[0].keyCode == 13) || event.type == "click")) {
            if (isValidName) {
                event.stopPropagation();
                datacontext.SaveAlarmSearch(data.FilterName());
            }
            else
                alertify.error(Resources.Filter_Name_Already_Exists);
        }
    }
    self.closeAlarmSearch = function (data, event) {
        window.alarmconfig.uicontext.closeSaveFilterDialog();
    }
    var severityMasterData = function (events) {
        var alConfig = new alarmConfigPage();
        alConfig.AlarmEventModel().Initialize(events);
        return alConfig;
    }
    self.freezeAlarm = function (data, event) {
        var freezeStatus = null;
        var filters = window.alarmconfig.uicontext.serachfilter(), searchTxtBox = $('.alarm-search-textbox');
        var appledFilter = (searchTxtBox.val() != '' || filters.length != 0);
        if (event) {
            freezeStatus = $(event.currentTarget).data('value');
        }
        else {
            freezeStatus = data;
        }
        if ((event || showUnFreezeBtn()) && appledFilter) {
            checkFreezeCombination(2);
        }
        else if (!event && appledFilter) {
            checkFreezeCombination(1);
        }
        else {
            datacontext.freezeCount(0);
            checkFreezeCombination(0);
        }
        if (freezeStatus == 'freeze') {
            self.showFreezeRow(true);
            if (event && searchTxtBox.val() == '' && filters.length == 0) {
                datacontext.freezeCount(0);
            }
            if (event) {
                self.showUnFreezeBtn(true);
            }
        }
        else {
            datacontext.freezeCount(0);
            if ((!event || !appledFilter) && !showUnFreezeBtn()) {
                self.showFreezeRow(false);
                $('#SaveSearch').hide();
                filteredDatasource(alarmDatasource());
                filteredData();
                datacontext.isFilterApplied(false);
                self.showUnFreezeBtn(false);
            }
            else if (event && !appledFilter && showUnFreezeBtn()) {
                self.showFreezeRow(false);
                filteredDatasource(alarmDatasource());
                filteredData();
                datacontext.isFilterApplied(false);
                self.showUnFreezeBtn(false);
            }
            else if (event && appledFilter && showUnFreezeBtn()) {
                self.showUnFreezeBtn(false);
                self.showFreezeRow(true);
                $('#SaveSearch').show();
                window.alarmconfig.uicontext.filterAlarms(null, [{ name: 'history', keyCode: 13 }]);
            }
            //window.alarmconfig.uicontext.ClearFilter();
        }
    }
    self.AcknowledgeAll = function (data, event) {
        if ($('.eventid[isclear!=true]').length != 0) {
            var status = "Acknowledge";
            acknowledgeAll(status);
            $("#alarmPageCount").val(0);
        }
    }
    self.ClearAll = function (data, event) {
        if ($('.eventid[isclear!=true]').length != 0) {
            var clientDate = new Date();
            var clientOffset = clientDate.getTimezoneOffset();
            var status = "Clear";
            acknowledgeAll(status);
            var filters = window.alarmconfig.uicontext.serachfilter();
            var isTimeFilterApplied = _.filter(filters, function (item) {
                return item.key.toLowerCase() == 'time';
            });
            if (isTimeFilterApplied.length > 0)
                timeBasedFilter(filters, FilteredEntites());
            if (!datacontext.isFilterApplied() && isTimeFilterApplied.length == 0) {
                datacontext.getalarmdetails(clientOffset, 0, 15, null, null, true, "New", null, null, null, function (jsondata) {
                    if (jsondata.Success) {
                        if (!jsondata.errorMessage)
                            window.alarmconfig.uicontext.updateAlarmDatasource(jsondata, true);
                        else
                            alertify.error(jsondata.errorMessage);
                    }
                    else {
                        if (jsondata.errorMessage)
                            alertify.error(jsondata.errorMessage);
                    }
                }, function (errorMessage) { alertify.error(errorMessage); });
            }
            $("#alarmPageCount").val(15);
        }
    }
    self.showUnFreezeBtn = ko.observable(false);
    self.showFreezeBtn = ko.observable(true);
    self.freezeCount = ko.observable(0);
    self.showAlarmDCM = ko.observable(false);
    self.showFreezeRow = ko.observable(false);
    datacontext.showFreezeBtn = showFreezeBtn;
    datacontext.showUnFreezeBtn = showUnFreezeBtn;
    datacontext.freezeAlarm = freezeAlarm;
    datacontext.freezeCount = freezeCount;
    datacontext.showAlarmDCM = showAlarmDCM;
    datacontext.showFreezeRow = showFreezeRow;
    self.checkFreezeCombination = ko.observable(0);
    self.tryWssConnection = function (data, event) {
        window.dashboardconfig.services.socketService.initMonitor();
    }
    self.showTypeCol = ko.observable(true);
    self.showSeverityCol = ko.observable(true);
    self.showTimeandDateCol = ko.observable(true);
    self.showLocationCol = ko.observable(true);
    self.showAICol = ko.observable(true);
    self.showClipRecordedTitle = ko.observable(true);
    self.showAlarmsVideoError = ko.observable(false);
    self.videoErrorMessage = ko.observable("");
    self.showDateErr = ko.observable(false);
    datacontext.filterApplied = ko.observable(false);
    //var fillsearchFilterEventTypes = function (data) {
    //    var items = $.map(data, function (item) {
    //        return new datacontext.searchFilterEventTypes(item);
    //    });
    //    if (items) {
    //        searchFilterEventTypeAccessDatasource(_.filter(items, function (item) {
    //            if (item.ParentType.toLowerCase() == 'access')
    //                return item;
    //        }));
    //        searchFilterEventTypeVideoDatasource(_.filter(items, function (item) {
    //            if (item.ParentType.toLowerCase() == 'video')
    //                return item;
    //        }));
    //    }
    //}
    var fillsearchFilterEventTypes = function (data) {
        var items = $.map(data, function (item) {
            return new datacontext.searchFilterEventTypes(item);
        });
        if (items) {
            searchFilterEventTypeAccessDatasource(_.filter(items, function (item) {
                if (item.ParentType.toLowerCase() == 'access') {
                    item.Name = Resources["EventCode_" + item.ID]
                    return item;
                }
            }));
            searchFilterEventTypeVideoDatasource(_.filter(items, function (item) {
                if (item.ParentType.toLowerCase() == 'video') {
                    item.Name = Resources["EventCode_" + item.ID]
                    return item;
                }
            }));
        }
    }
    self.searchAlram = function (data, event) {
        window.alarmconfig.uicontext.filterAlarms(null, [{ name: 'history', keyCode: 13 }]);
    }

    var thiscontext = {
        eventSummaryDatasource: eventSummaryDatasource,
        acknowledgeAll: acknowledgeAll,
        updateAlarmDatasource: updateAlarmDatasource,
        filteredAlarmDatasource: filteredAlarmDatasource,
        alarmDatasource: alarmDatasource,
        filteredData: filteredData,
        getDataAftrAck: getDataAftrAck,
        filteredDatasource: filteredDatasource,
        eventSummaryData: eventSummaryData,
        severityMasterData: severityMasterData,
        severityMasterDatasource: severityMasterDatasource,
        severityEventDatasource: severityEventDatasource,
        historyAlarmDatasource: historyAlarmDatasource,
        updateAlarmFilterDatasource: updateAlarmFilterDatasource,
        alarmFilterDatasource: alarmFilterDatasource,
        freezedAlarmDataSource: freezedAlarmDataSource,
        fillsearchFilterEventTypes: fillsearchFilterEventTypes,
        searchFilterEventTypeVideoDatasource: searchFilterEventTypeVideoDatasource,
        searchFilterEventTypeAccessDatasource: searchFilterEventTypeAccessDatasource,
        maxPageIndex: maxPageIndex,
        pageSize: pageSize,
        pageIndex: pageIndex,
        previousPage: previousPage,
        nextPage: nextPage,
        pagedRows: pagedRows,
        checkFreezeCombination: checkFreezeCombination,
        showClipRecordedTitle: showClipRecordedTitle,
        showAlarmsVideoError: showAlarmsVideoError,
        videoErrorMessage: videoErrorMessage,
        showDateErr: showDateErr,
        searchAlram: searchAlram
    };
    return thiscontext;
})($, window.alarmconfig.datacontext, window.alarmconfig.validationcontext);

window.alarmconfig.alarmFiltermodel = (function ($, ko, common, datacontext) {
    var alarmFilterentity = function (data) {
        var self = this;
        self.entityName = data.entityName;
        self.alarmFilterID = data.alarmFilterID;
        self.DeleteFilter = function (data, event) {
            event.stopPropagation();
            datacontext.DeleteFilter(self.alarmFilterID, function (jsondata) {
                if (jsondata.Success) {
                    alertify.success(Resources.Successfully_deleted);
                   
                    datacontext.getAlarmFilters(function (jsondata) {
                        if (jsondata.Success) {
                            if (!jsondata.errorMessage)
                                window.alarmconfig.uicontext.updateAlarmFilterDatasource(jsondata);
                        }
                    }, function (errorMessage) {
                        alertify.error(errorMessage);
                    });
                }
            }, function (errorMessage) {
                alertify.error(errorMessage);
            });
        }
        self.ApplyFilter = function (data, event) {
            //alert(self.alarmFilterID);
        }
        self.getAlarmFilterDetails = function (data, event) {
            datacontext.freezeCount(0);
            window.alarmconfig.uicontext.getAlarmFilterDetails(self.alarmFilterID);
        }

        self.toJson = function () {
            return self.toJson(self);
        }
    }
    datacontext.alarmFilterentity = alarmFilterentity;
})($, ko, window.alarmconfig.common, window.alarmconfig.datacontext);

window.alarmconfig.alarmFilterFillmodel = (function ($, ko, common, datacontext) {
    var alarmFilterFillEntity = function (data) {
        var self = this;
        self.EntityType = data.EntityType;
        self.EntityValue = data.EntityValue;
        self.toJson = function () {
            return self.toJson(self);
        }
    }
    datacontext.alarmFilterFillEntity = alarmFilterFillEntity;
})($, ko, window.alarmconfig.common, window.alarmconfig.datacontext);

window.alarmconfig.alarmMultiClipModel = (function ($, ko, common, datacontext) {
    var alarmMultiClipModel = function (data) {
        var self = this;
        CameraName = "";
        self.EventCodeType = data.EventCodeType;
        if (data.CameraAdditionalInfo != null && data.CameraAdditionalInfo.length > 0) {
            var cameras = _.first(data.CameraAdditionalInfo).Value || _.first(data.CameraAdditionalInfo).value;
            camName = _.filter(cameras, function (item) {
                if (item.ID == data.CameraId)
                    return item;
            });
            if (camName.length > 0)
                CameraName = _.first(camName).Name;
        }
        self.IsHighlighted = ko.observable(false);
        self.CameraName = CameraName;
        self.CameraId = data.CameraId;
        self.ClipId = data.ClipId;
        self.OriginTime = data.AlarmDate + " " + data.AlarmTime;
        self.Playerwrapperid = "MultiClipWrapper";
        self.SingleClipClick = function (data, event) {
            var multiClipContext = ko.contextFor(document.getElementById("multiple-videos")).$data;
            _.each(multiClipContext, function (item) {
                item.IsHighlighted(false);
            });
            self.IsHighlighted(true);
            window.alarmconfig.uicontext.multipClips(self, event);
        }
        self.toJson = function () {
            return self.toJson(self);
        }
    }
    datacontext.alarmMultiClipModel = alarmMultiClipModel;
})($, ko, window.alarmconfig.common, window.alarmconfig.datacontext);

window.alarmconfig.searchFilterEventTypesModel = (function ($, ko, common, datacontext) {
    var searchFilterEventTypes = function (data) {
        var self = this;
        self.ID = data.ID;
        self.Name = Resources["EventCode_" + data.ID];
        self.ParentType = data.ParentId;
        self.filterClick = function (data, event) {
            window.alarmconfig.uicontext.searchButtonClick(event.currentTarget);
        }
        self.toJson = function () {
            return self.toJson(self);
        }
    }
    datacontext.searchFilterEventTypes = searchFilterEventTypes;
})($, ko, window.alarmconfig.common, window.alarmconfig.datacontext);