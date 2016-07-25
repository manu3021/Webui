/// <reference path="../Jwplayer/jwplayer.js" />
/// <reference path="viewer.datacontext.js" />
/// <reference path="viewer.uicontext.js" />
/// <reference path="viewer.common.js" />

window.viewerconfig.clipsearch = (function ($, ko, common, uicontext, datacontext) {

    var ClipExportmodel = function (data) {
        var self = this;
        data = data || {};
        self.isexport = ko.observable(true);
        self.isprogress = ko.observable(true);
        self.progressvalue = ko.observable("20");
        self.Local = ko.observable(true);
        self.sessionid = ko.observable("");
        self.FromExportDate = ko.observable("");
        self.ToExportDate = ko.observable("");
        self.IsSave = ko.observable(false);
        self.isshowhide = ko.observable(true);
        self.SavePath = ko.observable("");
        self.Error = ko.observable("");
        self.Clipdetails = null;
        self.exporturl = ko.observable("");
        self.iserror = ko.computed(function () {
            if (self.Error() != "") {
                return true;
            }
            return false;
        });
        self.ToErrormessage = ko.observable("");
        self.FromErrormessage = ko.observable("");
        self.isFrmdateerror = ko.computed(function () {
            if (self.FromErrormessage() != "") {
                return true;
            }
            return false;
        });
        self.isTodateerror = ko.computed(function () {
            if (self.ToErrormessage() != "") {
                return true;
            }
            return false;
        });
        self.Errormessage = ko.observable("abc");
        self.Iscancel = ko.observable(false);
        self.isretry = ko.observable(false);
        self.OnPC = ko.observable(true);
        self.exportlocation = ko.observable(common.constants.ExportLocation.OnPC);
        self.exportlocation.subscribe(function (newval) {
            if (newval == common.constants.ExportLocation.OnPC) {
                //window.viewerconfig.uicontext.showPath();
                self.OnPC(true);
            }
            else {
                //window.viewerconfig.uicontext.hidePath();
                self.OnPC(false);
            }
        });
        self.SavePath.subscribe(function (newval) {
            if ($.trim(newval) == "") {
                self.Error(common.messages.ClipExportvalidation);
                return;
            }
            self.Error("");
        });
        self.showerror = function (data, event) {
            window.viewerconfig.uicontext.showError(event.currentTarget);
        }
        self.hideerror = function (data, event) {
            window.viewerconfig.uicontext.hideError(event.currentTarget);
        }
        self.CancelExportclick = function (data, event) {
            var context = ko.contextFor(event.currentTarget);
            var exportmodel = context.$data;
            exportmodel.Iscancel(true);
            exportmodel.isprogress(false);
            exportmodel.progressvalue("0");
            window.viewerconfig.uicontext.hideexportModal(exportmodel);

        }
        self.ClickBtn = function (data, event) {
            var context = ko.contextFor(event.currentTarget);
            var exportmodel = context.$data;
            exportmodel.isprogress(true);
            exportmodel.Iscancel(false);
            exportmodel.SavePath($.trim(exportmodel.SavePath()));
            if (exportmodel.SavePath() == "") {
                exportmodel.Error(common.messages.ClipExportvalidation);
                return;
            }
            else if (exportmodel.SavePath().length > 32) {
                exportmodel.Error(Resources.max_char_error.format("32"));
                return;
            }
            else {
                exportmodel.Error("");
                if (exportmodel.Local()) {
                    if (window.viewerconfig.uicontext.validateExportdate(exportmodel)) {
                        window.viewerconfig.uicontext.ClipExport(exportmodel);
                        $(document).find(".modal-backdrop").remove();
                    }
                }
                else {
                    window.viewerconfig.uicontext.ClipExport(exportmodel);
                    $(document).find(".modal-backdrop").remove();
                }
            }
        }
        
        datacontext.ExportModal = ClipExportmodel;
    }


    var ClipResultmodel = function (data) {
        var self = this;
        data = data || {};

        //Properties
        self.SessionId = null;
        self.ClipId = ko.observable(data.ClipId);
        self.Duration = ko.observable(data.Duration);
        self.SeekedEndDate = ko.observable(data.SeekedEndDate);
        self.SeekedStartDate = ko.observable(data.SeekedStartDate);
        self.EndDate = ko.observable(data.EndDate);
        self.StartDate = ko.observable(data.StartDate);
        self.EventName = ko.observable(data.EventName);
        self.SegmentStartIndex = ko.observable(data.SegmentStartIndex);
        self.Local = ko.observable(data.Local);
        self.ChannelId = ko.observable(data.ChannelId);
        self.SegmentEndIndex = ko.observable(data.SegmentEndIndex);
        self.URI = ko.observable(data.URI);
        self.CameraName = ko.observable(data.CameraName);
        self.Prevent = ko.observable(data.Prevent);
        self.CameraId = data.CameraId;

        //Clone
        self.Clone = function () {
            var selfclone = new ClipResultmodel();
            selfclone.SessionId = self.SessionId;
            selfclone.ClipId(self.ClipId());
            selfclone.Duration(self.Duration());
            selfclone.SeekedEndDate(self.SeekedEndDate());
            selfclone.SeekedStartDate(self.SeekedStartDate());
            selfclone.EndDate(self.EndDate());
            selfclone.StartDate(self.StartDate());
            selfclone.EventName(self.EventName());
            selfclone.SegmentStartIndex(self.SegmentStartIndex());
            selfclone.Local(self.Local());
            selfclone.ChannelId(self.ChannelId());
            selfclone.SegmentEndIndex(self.SegmentEndIndex());
            selfclone.URI(self.URI());
            selfclone.CameraName(self.CameraName());
            selfclone.Prevent(self.Prevent());
            selfclone.CameraId = self.CameraId;

            return selfclone;
        }

        //functions
        self.DurationDisplay = ko.computed(function () {
            return Resources.Calendar_Duration + " : " + self.Duration();
        });
        self.StartTimeDisplay = ko.computed(function () {
            if (self.StartDate() != "")
                return Resources.Viewer_DateTime + " : " + (ToJavaScriptDate(self.StartDate()));

        });
        self.cloudStatusDisplay = ko.computed(function () {
            if (self.Local() == true)
                return Resources.Calendar_Onsite;
            else
                return Resources.Calendar_Offsite;

        });
        self.EventNameDisplay = ko.computed(function () {
            return Resources.Viewer_EventName + " : " + self.EventName();
        });
        self.ClipNameDisplay = ko.computed(function () {
            return Resources.Calendar_Clip_Id + " : " + self.ClipId();
        });
        self.toJson = function () {
            return ko.toJSON(self);
        }
        self.getclipExport = function (data, event) {
            var context = ko.contextFor(event.currentTarget);
            var clipresultmodel = context.$data;
            window.viewerconfig.uicontext.showClipExport(clipresultmodel);
        }
        function ToJavaScriptDate(value) {
            var formattedDate = new Date(value);
            var final = moment(formattedDate).format(common.constants.datetimeformat);
            return final;
        }
    }
    var ClipFiltermodel = function () {
        var self = this;
        self.FromDatetime = ko.observable("");
        self.ToDatetime = ko.observable("");
        self.IsMotionEvent = ko.observable(true);
        self.IsSchedule = ko.observable(false);
        self.IsTriggerEvent = ko.observable(false);
        self.IsOnsite = ko.observable(true);
        self.IsUserdriven = ko.observable(true);
        self.IsRuledriven = ko.observable(true);
        self.IsCloud = ko.observable(false);
        self.IsError = ko.observable(false);
        self.IsFilterError = ko.observable(false);
        self.Errormessage = ko.observable("");
        self.Exportname = ko.observable("Cancel");
        self.Filtermessage = ko.observable("");
        self.toJson = function () {
            //moment(self.ToDatetime(), common.constants.datetimeformat).utc().format('MM/DD/YYYY HH:mm:ss').toString();
            self.FromUTCDatetime = self.FromDatetime().toUTCDateString();
            self.ToUTCDatetime = self.ToDatetime().toUTCDateString();
            return ko.toJSON(self);
        }
    }
    var ClipViewmodel = function (issinglecamera) {
        var self = this;
        self.CameraName = ko.observable("");
        self.clipResults = ko.observableArray([]),
        self.ClipExportmodel = new ClipExportmodel();
        self.ClipFiltermodel = new ClipFiltermodel();
        self.loading = ko.observable("");
        self.showerror = function (data, event) {
            window.viewerconfig.uicontext.showError(event.currentTarget);
        }
        self.hideerror = function (data, event) {
            window.viewerconfig.uicontext.hideError(event.currentTarget);
        }
        self.Oncheckedbox = function () {
            if ((self.ClipFiltermodel.IsMotionEvent) || (self.ClipFiltermodel.IsSchedule) || (self.ClipFiltermodel.IsTriggerEvent) || (self.ClipFiltermodel.IsCloud) || (self.ClipFiltermodel.IsOnsite)) {
                self.ClipFiltermodel.IsFilterError()
            }
        }
        self.isvisibletext = ko.observable(false);
        self.issinglecamera = issinglecamera;
        self.AddClipResult = function (clips) {
            if (clips == undefined || clips == null)
                return
            var tempclips = self.clipResults();
            for (var i = 0; i < clips.length; i++) {
                var clipResultmodel = new ClipResultmodel(clips[i]);
                tempclips.push(clipResultmodel);
            }
            tempclips.sort(sortbydatetime);
            self.clipResults(tempclips);
        };

        self.Cancelclick = function (data, event) {
            window.viewerconfig.uicontext.Hidepopover();
        }
        self.Searchfilterclick = function (data, event) {
            var context = ko.contextFor(event.currentTarget);
            var viewmodel = context.$data;
            viewmodel.ResetResult();
            if (window.viewerconfig.uicontext.sngfiltertype == null) {
                window.viewerconfig.uicontext.sngfiltertype = common.Enumeration.DateRange.TODAY;
            }
            if (!window.viewerconfig.uicontext.validateclipsearchfilter(window.viewerconfig.uicontext.sngfiltertype, viewmodel))
                return false;
            window.viewerconfig.uicontext.showClipResult();
            datacontext.clipsearch(viewmodel, common.cameraId, function (callbackid) {
                if (viewmodel.clipResults() == undefined || viewmodel.clipResults().length <= 0) {
                    //show no results for the search only if for none of the cameras there is no search result
                    $("#loadingtxt").css("display", "block");
                    $("#loadingtxt").text(Resources.Viewer_ClipResult);
                }
                else {
                    //disable loading icon if it is visible
                    $("#loadingtxt").css("display", "none");
                }
            });

        }
        self.FilterType = function (data, event) {
            datacontext.updatedatetimeforfiltertype(event.currentTarget);
        };

        self.ResetFilter = function () {
            self.ClipFiltermodel = new ClipFiltermodel();
        };
        self.ResetResult = function () {
            self.clipResults([]);
        };
        self.toJson = function () {
            return ko.toJSON(self);
        }

        function sortbydatetime(c1, c2) {
            if (c1.StartDate() > c2.StartDate()) {
                return -1;
            }
            else if (c1.StartDate() < c2.StartDate()) {
                return 1;
            }
            else {
                return 0;
            }
        }
    }
    $(document).on('click', '.clipFilterHeader', function () {
        $(".clipSearchFilter").hide();
        $(".clipResults").show();

    });
    //$(document).on('timepicker', '#timepicker', function () {
    //    $(".clipSearchFilter").hide();
    //    $(".clipResults").show();
    //});
    //function showTime() {
    //    $('#timepicker').timepicker({
    //        minuteStep: 5,
    //        showInputs: false,
    //        disableFocus: true,
    //        showSeconds: true
    //    });
    //}
    //function showTime1() {
    //    $('#timepicker1').timepicker({
    //        minuteStep: 5,
    //        showInputs: false,
    //        disableFocus: true,
    //        showSeconds: true
    //    });
    //}
    window.viewerconfig.datacontext.ClipViewmodel = ClipViewmodel;
    window.viewerconfig.datacontext.getemptysearchmodel = function (type, cameraId) {
        var emptyclipmodel = new newClipmodel({
            ClipId: "", Duration: "", StartTime: "", EndTime: "", EntityType: type, cameraId: cameraId
        });
        return emptysearchmodel;
    }
})(jQuery, ko, window.viewerconfig.common, window.viewerconfig.uicontext, window.viewerconfig.datacontext);

