define('header', ['jquery', 'underscore', 'toastr', 'ko', 'config', 'router', 'datacontext'], function ($, _, toastr, ko, config, router, datacontext) {

    var currentexportpercentage = 0
    $.subscribe('clipdetails', function (data, exportmodel) {
        if (pageModel != undefined && exportmodel != undefined) {
            //pageModel.clipexportdetails = exportmodel;
            pageModel.AddClipResult(exportmodel);
        }
    });

    $.subscribe('exportvalue', function (data, clipData) {
        if (clipData) {
            currentexportpercentage = 0;
            if (pageModel != undefined) {
                pageModel.updateProgress(clipData);//clipData.Clipdetails, clipData.progressvalue());
            }
        }

    });

    $.subscribe("error", function (event, clipdata) {
        if (pageModel != undefined && clipdata != undefined && clipdata.Clipdetails != undefined)
            pageModel.errorprogress(clipdata);
    });
    var clientDate = new Date();
    var clientOffset = clientDate.getTimezoneOffset();

    var menuitemModel = function (data) {
        var self = this;
        self.title = ko.observable(data.title);
        self.url = ko.observable(data.url);
        self.tag = ko.observable(data.tag);
        self.icons = data.icons;
        self.icon = ko.observable(self.icons.normalicon);
        self.enableDetails = function () {
            this.icon(this.icons.hovericon);
        }
        self.normaldetail = function () {
            this.icon(this.icons.normalicon);
        }
        self.itemclick = function () {
            $.publish("userprofilemenuitemclick", self.toJson());
            //this.icon(this.icons.pressedicon);
            console.log(this.tag());
        }
        self.toJson = function () {
            return ko.toJSON(self);
        }
    },
    ClipExportProgressModel = function (data) {
        var self = this;
        data = data || {};
        self.SessionId = ko.observable(data.sessionid);
        self.downloadurl = ko.observable("");
        self.ClipId = ko.observable(data.Clipdetails.ClipId());
        self.isprogress = ko.observable(data.isprogress());
        self.progressvalue = ko.observable(currentexportpercentage);
        self.IsSave = ko.observable(false);
        self.isretry = ko.observable(false);
        self.isshowhide = ko.observable(true);
        self.SegmentStartIndex = ko.observable(data.Clipdetails.SegmentStartIndex());
        self.Local = ko.observable(data.Clipdetails.Local());
        self.ChannelId = ko.observable(data.Clipdetails.ChannelId());
        self.SegmentEndIndex = ko.observable(data.Clipdetails.SegmentEndIndex());
        self.URI = ko.observable(data.Clipdetails.URI());
        self.CameraName = ko.observable(data.Clipdetails.CameraName());
        self.DurationDisplay = ko.observable(data.Clipdetails.DurationDisplay());
        self.StartTimeDisplay = ko.observable(data.Clipdetails.StartTimeDisplay());
        self.cloudStatusDisplay = ko.observable(data.Clipdetails.cloudStatusDisplay());
        self.EventNameDisplay = ko.observable(data.Clipdetails.EventNameDisplay());
        self.ClipNameDisplay = ko.observable(data.Clipdetails.ClipNameDisplay());
        self.CameraId = data.Clipdetails.CameraId;
        self.ReInitialise = function (newdata) {
            data = newdata;
            self.SessionId(data.sessionid);
            self.downloadurl("");
            self.ClipId(data.Clipdetails.ClipId());
            self.isprogress(data.isprogress());
            self.progressvalue(currentexportpercentage);
            self.IsSave(false);
            self.isretry(false);
            self.isshowhide(true);
            self.SegmentStartIndex(data.Clipdetails.SegmentStartIndex());
            self.Local(data.Clipdetails.Local());
            self.ChannelId(data.Clipdetails.ChannelId());
            self.SegmentEndIndex(data.Clipdetails.SegmentEndIndex());
            self.URI(data.Clipdetails.URI());
            self.CameraName(data.Clipdetails.CameraName());
            self.DurationDisplay(data.Clipdetails.DurationDisplay());
            self.StartTimeDisplay(data.Clipdetails.StartTimeDisplay());
            self.cloudStatusDisplay(data.Clipdetails.cloudStatusDisplay());
            self.EventNameDisplay(data.Clipdetails.EventNameDisplay());
            self.ClipNameDisplay(data.Clipdetails.ClipNameDisplay());
            self.CameraId = data.Clipdetails.CameraId;
        };
        self.toJson = function () {
            return ko.toJSON(self);
        }
        self.RetryClipExport = function () {
            //var context = ko.contextFor(event.currentTarget);
            //var clipexportprogressmodel = context.$data;
            //var Exportmodel = pageModel.clipexportdetails;
            //Exportmodel.Clipdetails = clipexportprogressmodel;
            self.isretry(false);
            self.isshowhide(true);
            var newguid = createUUID();
            self.SessionId(newguid);
            data.sessionid = newguid;
            $.publish('RetryGetExport', data);
        }
        self.CancelExportclick = function () {
            //var context = ko.contextFor(event.currentTarget);
            //var Clipdata = context.$data;
            //var Exportmodel = pageModel.clipexportdetails;
            //Exportmodel.Clipdetails = Clipdata;
            data.Iscancel(true);
            data.isprogress(false);
            data.progressvalue("0");
            $.publish('cancelclip', data);
            RemoveItemfromlist(data);
        }
        function RemoveItemfromlist(Exportmodel) {
            pageModel.RemoveitemFromList(Exportmodel);
        }

        function ToJavaScriptDate(value) {
            var formattedDate = new Date(value);
            var final = moment(formattedDate).format(window.clipdownload.common.constants.datetimeformat);
            return final;
        }
    },
    alarmItemModel = function (data) {
        var self = this;
        self.Id = data.Id;
        self.title = data.SourceEntityName;
        self.time = data.AlarmTime;
        self.EventCodeType = Resources["EventCode_" + data.EventCode];
        self.CredentialNumber = data.CredentialNumber != "" && data.CredentialNumber != undefined ? "(" + data.CredentialNumber + ")" : "";
        self.MasterSourceEntityName = data.MasterSourceEntityName;
        self.icon = checkEventRange(data.EventCode, data.SeverityName, data.EventType);
        self.toJson = function () {
            return self.toJson(self);
        }
    },
    pageModel = null,
    callbacks = { navigatetoPage: null, navigatetohome: null },
    pageheaderViewmodel = function () {
        var self = this;
        self.msgs = ko.observableArray([]);
        self.messages = ko.computed(function () {
            var finaldata = $.map(self.msgs(), function (item) {
                return new alarmItemModel(item);
            });
            return finaldata;
        });
        self.Headername = ko.observable("Download")
        self.clipexportdetails = null;
        self.clipResults = ko.observableArray([]),
        self.clipexportrequestcount = ko.computed(function () {
            return self.clipResults().length;
        });
        self.clipexportrequestcount = ko.computed(function () {
            return self.clipResults().length;
        });
        self.IsRequestCount = ko.computed(function () {
            return (self.clipResults().length == 0) ? false : true;
        })
        self.RemoveitemFromList = function (Exportmodel) {
            _.filter(self.clipResults(), function (item) {
                if (item && item.CameraId == Exportmodel.Clipdetails.CameraId && item.ClipId() == Exportmodel.Clipdetails.ClipId()) {
                    self.clipResults.remove(item);
                }
            });

            if (self.clipResults().length <= 0) {
                Hidepopover();
            }
        };
        self.errorprogress = function (clipData) {
            var filteredresults = _.filter(self.clipResults(), function (item) {
                if (item.CameraId == clipData.Clipdetails.CameraId && item.ClipId() == clipData.Clipdetails.ClipId() && item.SessionId() == clipData.sessionid) {
                    return item;
                }
            });

            var clpexpprgmdl = null;
            if (filteredresults && filteredresults.length > 0) {
                clpexpprgmdl = filteredresults[0];
            }
            else {
                clpexpprgmdl = new ClipExportProgressModel(clipData);
                self.clipResults.splice(0, 0, clpexpprgmdl);
            }
            clpexpprgmdl.isprogress(false); clpexpprgmdl.isretry(true); clpexpprgmdl.isshowhide(true); clpexpprgmdl.IsSave(false);
        };
        self.updateProgress = function (clipData) {
            if (clipData != undefined && clipData.progressvalue) {
                var cd = clipData.Clipdetails;
                var value = clipData.progressvalue();
                _.filter(self.clipResults(), function (cr) {
                    if (cr && cd) {
                        if (cr.CameraId == cd.CameraId && cr.SessionId() == clipData.sessionid)
                            cr.progressvalue(value);
                        if (cr.progressvalue() == 100) {
                            cr.isshowhide(false);
                            cr.IsSave(true);
                        }
                    }
                });
            }
        };
        self.AddClipResult = function (exportmodel) {
            if (exportmodel == undefined || exportmodel == null)
                return;

            exportmodel.IsSave(true);
            exportmodel.isshowhide(true);
            if (exportmodel.isretry()) {
                $.each(self.clipResults(), function (index, item) {
                    if (item.CameraId == exportmodel.Clipdetails.CameraId && item.ClipId() == exportmodel.Clipdetails.ClipId() && item.SessionId() == exportmodel.sessionid) {
                        item.ReInitialise(exportmodel);
                    }
                });
            }
            else {
                var clipExportProgressModel = new ClipExportProgressModel(exportmodel);
                self.clipResults.splice(0, 0, clipExportProgressModel);
            }
        };
        self.msgTitle = ko.observable(Resources.Loading);
        self.userProfileMenu = ko.observableArray([]);
        self.pageTitle = ko.observable();
        self.pages = ko.observableArray([]);
        self.ishomepage = ko.observable();
        self.homepage = ko.computed(function () {
            return self.ishomepage();
        });
        self.headermenus = ko.observableArray([]);
        self.notifications = ko.observableArray([]);
        self.notificationsCount = ko.observable(0);
        self.notificationsCount.subscribe(function (value) {
            console.log("Notification Count: " + value);
        });
        self.notificationCountTxt = ko.observable("");
        self.selectedpage = null;
        self.navigatepage = function (data, event) {
            if (self.selectedpage == data) retrun;
            else {
                self.selectedpage = data;
            }
            try {
                $.map(self.pages(), function (pItem) {
                    pItem.IsPageSelected(pItem.PageIndex() == data.PageIndex());
                });
                if (callbacks.navigatetoPage)
                    callbacks.navigatetoPage(data.toJs());
            } catch (e) {
                console.error(e);
            }
        }
        self.IsHandBarVisible = ko.observable(true);
        self.ComputeHandBarVisible = ko.computed(function () {
            if (!self.IsHandBarVisible()) {
                return "pagetitleHandleBarHide";
            }
            else {
                return "pagetitleHandleBarShow";
            }
        });
        self.IsExapndable = ko.computed(function () {
            if (!self.IsHandBarVisible()) {
                return ""
            }
            else {
                return "dropdown";
            }
        });
        self.navigatetohome = function (data, event) {
            if (callbacks.navigatetohome)
                callbacks.navigatetohome();
        };
        self.navigateAlarm = function (data, event) {
            data.RegionName = "alarms";
            if (self.pageTitle() != 'Alarms') {
                if (callbacks.navigatetoPage)
                    callbacks.navigatetoPage(data);
            }
            $.publish("alarmnavigation", data);
        };
        self.showdownloadclips = function (data, event) {
            //var pageviewmodel = data;
            if (pageModel.clipResults().length > 0)
                showExportedClip(event.currentTarget);
        };
        self.showMessages = function (data, event) {
            showmessagesevent(event, self);
        };
    },
    headerDropMenu = function (data) {
        var self = this;
        data = data || {};
        self.PageName = ko.observable(data.PageName);
        self.PageIcon = ko.observable(data.PageIcon);
        self.PageIndex = ko.observable(data.PageIndex);
        self.RegionName = ko.observable(data.RegionName);
        self.IsPageSelected = ko.observable(false);
        self.toJs = function () {
            return ko.toJS(self);
        }
        self.toJson = function () {
            return ko.toJSON(self);
        }
    },
    getNotificationCount = function () {
        var initCount = 0;
        //var curr = new Date();
        //var startDate = curr.format('dd mmm yyyy') + " 00:00:00";
        //var endDate = curr.format('dd mmm yyyy') + " 23:59:59";
        datacontext.geteventslogcount(clientOffset, 'NEW', 'Alarm', null, null, function (jsondata) {
            if (jsondata.Success) {
                if (!jsondata.errorMessage) {
                    initCount = jsondata.data;
                    pageModel.notificationsCount(initCount);
                    pageModel.notificationCountTxt(abbrNum(initCount, 0));
                }
                else
                    alertify.error(jsondata.errorMessage);
            }
            else {
                if (jsondata.errorMessage)
                    alertify.error(jsondata.errorMessage);
            }
        }, function (errorMessage) { alertify.error(errorMessage); });
        return initCount;
    },

    downloadExpotedclip = function (data, event) {
        var context = ko.contextFor(event.currentTarget);
        var exportmodel = context.$data;
        exportmodel.Iscancel(false);
        if (exportmodel.SavePath() == "") {
            exportmodel.Error(common.messages.ClipExportvalidation);
            exportmodel.iserror(true);
            return;
        }
        else {
            exportmodel.Error("");
            exportmodel.iserror(false);
            window.viewerconfig.uicontext.ClipExport(exportmodel);
            $(document).find(".modal-backdrop").remove();
        }
    }

    showExportedClip = function (popoverTarget) {
        showExportedClip.currentPopoverTarget = popoverTarget
        var isPopoverShown = $(showExportedClip.currentPopoverTarget).attr("data-ispopovershown");
        $(showExportedClip.currentPopoverTarget).attr("data-ispopovershown", true);
        if (isPopoverShown == undefined && isPopoverShown == null) {
            $(showExportedClip.currentPopoverTarget).popover({
                title: "Download",
                html: true,
                content: $("#clipdownloadListTmpl").html(),
                trigger: 'click',
                placement: 'bottom'
            }).on('shown', function () {
                onpopovershown();
            }).popover("show");
        }
    }
    setpagetitle = function (title) {
        if (pageModel != null || pageModel != undefined)
            pageModel.pageTitle(title);
    },

      onpopovershown = function (data, event) {
          console.log("Exportdetails added record");
          ko.applyBindings(pageModel, document.getElementById("clipdownload_list"));
      }

    function Hidepopover(data, event) {
        // hide the current clip search popover 
        if (showExportedClip.currentPopoverTarget) {
            $(showExportedClip.currentPopoverTarget).popover('hide');
        }
    }
    showmessagesevent = function (event, popoverObseravable) {
        //var curr = new Date();
        //var startDate = curr.format('dd mmm yyyy') + " 00:00:00";
        //var endDate = curr.format('dd mmm yyyy') + " 23:59:59";
        var clientDate = new Date();
        var clientOffset = clientDate.getTimezoneOffset();
        datacontext.getalarms(clientOffset,0, 5, null, null, true, "New", null, null, function (jsondata) {
            if (jsondata.Success) {
                if (!jsondata.errorMessage) {
                    pageModel.msgs([]);
                    pageModel.msgs(jsondata.data);
                    if (jsondata.data.length == 0) {
                        pageModel.msgTitle(Resources.DB_NO_VALID_RECORDS);
                    }
                }
                else
                    alertify.error(jsondata.errorMessage);
            }
            else {
                if (jsondata.errorMessage)
                    alertify.error(jsondata.errorMessage);
            }
        }, function (errorMessage) { alertify.error(errorMessage); });
    },
    checkEventRange = function (EventCode, SeverityName, EventType) {
        if (EventType == 'Event') {
            if (5000 <= EventCode && EventCode <= 9999) {
                return "icon_doornor";
            }

            else if (10000 <= EventCode && EventCode <= 14999) {
                return "icon_videonor";
            }

            else if (15000 <= EventCode && EventCode <= 19999) {
                return "icon_firenor";
            }
        }
        switch (SeverityName) {
            case "Critical":
                if (5000 <= EventCode && EventCode <= 9999) {
                    return "icon_doorhigh";
                }

                else if (10000 <= EventCode && EventCode <= 14999) {
                    return "icon_videohigh";
                }

                else if (15000 <= EventCode && EventCode <= 19999) {
                    return "icon_firehigh";
                }
                break;
            case "Moderate":
                if (5000 <= EventCode && EventCode <= 9999) {
                    return "icon_doormod";
                }

                else if (10000 <= EventCode && EventCode <= 14999) {
                    return "icon_videomod";
                }

                else if (15000 <= EventCode && EventCode <= 19999) {
                    return "icon_firemod";
                }
                break;
            case "Major":
                if (5000 <= EventCode && EventCode <= 9999) {
                    return "icon_doormajor";
                }

                else if (10000 <= EventCode && EventCode <= 14999) {
                    return "icon_videomajor";
                }

                else if (15000 <= EventCode && EventCode <= 19999) {
                    return "icon_firemajor";
                }
                break;
            case "Normal":
                if (EventCode == 5040) {
                    return "icon_rules";
                }
                if (5000 <= EventCode && EventCode <= 9999) {
                    return "icon_doornor";
                }

                else if (10000 <= EventCode && EventCode <= 14999) {
                    return "icon_videonor";
                }

                else if (15000 <= EventCode && EventCode <= 19999) {
                    return "icon_firenor";
                }
                break;
        }
    },

    abbrNum = function (number, decPlaces) {
        // 2 decimal places => 100, 3 => 1000, etc
        decPlaces = Math.pow(10, decPlaces);

        // Enumerate number abbreviations
        var abbrev = ["K", "M", "B", "T"];

        // Go through the array backwards, so we do the largest first
        for (var i = abbrev.length - 1; i >= 0; i--) {

            // Convert array index to "1000", "1000000", etc
            var size = Math.pow(10, (i + 1) * 3);

            // If the number is bigger or equal do the abbreviation
            if (size <= number) {
                // Here, we multiply by decPlaces, round, and then divide by decPlaces.
                // This gives us nice rounding to a particular decimal place.
                //number = Math.round(number * decPlaces / size) / decPlaces;
                number = Math.floor(number * decPlaces / size) / decPlaces;

                // Handle special case where we round up to the next abbreviation
                if ((number == 1000) && (i < abbrev.length - 1)) {
                    number = 1;
                    i++;
                }

                // Add the letter for the abbreviation
                number += abbrev[i];

                // We are done... stop
                break;
            }
        }

        return number;
    },

    initialize = function (configuration) {
        if (pageModel == null) {
            getNotificationCount();
            pageModel = new pageheaderViewmodel();
            // { menuid: 1001, tag: 'FULLSCREEN', title: Resources.Fullscreen, url: '#', icons: { normalicon: 'icon_saveNormal', hovericon: 'images/icons/popup_profile/icon_loadNormal.png', pressedicon: 'images/icons/popup_profile/icon_saveNormal.png' } },
            var menus = [
                    { menuid: 1000, tag: 'PROFILE', title: Resources.ProfileDetails, url: '#', icons: { normalicon: 'icon_userNormal', hovericon: 'images/icons/popup_profile/icon_loadNormal.png', pressedicon: 'images/icons/popup_profile/icon_saveNormal.png' } },

                    { menuid: 1002, tag: 'HELP', title: Resources.Help, url: '#', icons: { normalicon: 'icon_helpNormal', hovericon: 'images/icons/popup_profile/icon_loadNormal.png', pressedicon: 'images/icons/popup_profile/icon_saveNormal.png' } },
                    { menuid: 1003, tag: 'LOGOUT', title: Resources.Logout, url: '#', icons: { normalicon: 'icon_logoutNormal', hovericon: 'images/icons/popup_profile/icon_loadNormal.png', pressedicon: 'images/icons/popup_profile/icon_saveNormal.png' } }
            ];
            pageModel.pageTitle(configuration.currentpage.title);
            pageModel.pages(
                $.map(configuration.pages(), function (pageItem) {
                    if (pageItem.PageType !== 'hidden') {
                        var hdm = new headerDropMenu({
                            RegionName: pageItem.RegionName,
                            PageName: pageItem.PageName,
                            PageIndex: pageItem.PageIndex,
                            PageIcon: "icon_" + pageItem.PageIndex
                        });
                        hdm.IsPageSelected(configuration.currentpage.pageindex == pageItem.PageIndex);
                        return hdm;
                    }
                }));
            pageModel.userProfileMenu($.map(menus, function (listItem) {
                return new menuitemModel(listItem)
            }));
            ko.applyBindings(pageModel, document.getElementById("page-header"));
            if (configuration.currentpage.pageindex == 0) {
                pageModel.IsHandBarVisible(false);
            }
        }
        else {
            pageModel.pageTitle(configuration.currentpage.title);
            if (configuration.currentpage.pageindex == 0) {
                pageModel.IsHandBarVisible(false);
            }
            else {
                pageModel.IsHandBarVisible(true);
            }
            $.map(pageModel.pages(), function (page) {
                page.IsPageSelected(page.PageIndex() == configuration.currentpage.pageindex);
            });
        }
    };
    $.subscribe("pushalarmcount", function (eventName, data) {
        var count = pageModel.notificationsCount() + data;
        pageModel.notificationsCount(count);
        pageModel.notificationCountTxt(abbrNum(count, 0));
    });
    $.subscribe('loadalarmcount', function (eventName, data) {
        if (data == true)
            getNotificationCount();
        else {
            var count = pageModel.notificationsCount() - data;
            pageModel.notificationsCount(count);
            pageModel.notificationCountTxt(abbrNum(count, 0));
        }
    });

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

    function createUUID() {
        var uId = new guid().NewGuid();
        return uId;
    };

    return {
        initialize: initialize,
        setpagetitle: setpagetitle,
        callbacks: callbacks
    };
});