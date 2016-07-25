/// <reference path="viewer.datacontext.js" />
/// <reference path="viewer.uicontext.js" />

window.viewerconfig = window.viewerconfig || {};
window.viewerconfig.salvolayout = (function ($, common, datacontext, uicontext) {
    var CameraNode = null;
    var cameraArr = [];
    var Panelnumber = 0;
    var events = {
        salvodrop: "salvodropped",
    };
    var Doormodel = function (data) {
        var self = this;
        data = data || {};
        self.doorid = ko.observable(data.Id);
        self.doorname = ko.computed(function () {
            return data.Name;
        });
    };
    var salvoentityInstanceInfo = function (data) {
        var self = this;

        if (data.iscamera() && data.sessionmodel && data.sessionmodel.cameraid() != "" && data.IsLive()) {
            self.EntityInstanceIdField = ko.observable(data.sessionmodel.cameraid());
            self.EntityTypeField = ko.observable("camera");
            self.EntityInstanceNameField = ko.observable(data.sessionmodel.cameraname())
        }
        else if (data.isdoor() && data.doorsessionmodel && data.doorsessionmodel.doorid() != "") {
            self.EntityInstanceIdField = ko.observable(data.doorsessionmodel.doorid());
            self.EntityTypeField = ko.observable("Door");
            self.EntityInstanceNameField = ko.observable(data.doorsessionmodel.doorname());
        }
        else {
            self.EntityInstanceIdField = ko.observable("");
            self.EntityTypeField = ko.observable("");
        }
        self.PanelNumberField = ko.observable(Panelnumber);
    }
    var Panelmodel = function (data) {
        var self = this;
        data = data || {};
        self.ClipEntity = null;
        self.dropui = null;
        self.panelid = ko.observable("");
        //self.status = ko.observable("");
        self.EntityName = ko.observable("");
        self.paneltitle = ko.observable("");
        self.erroricon = ko.observable("");
        self.erromessage = ko.observable("");
        self.issuccess = ko.observable(false);
        self.issalvoview = ko.observable(false);
        self.isdoor = ko.observable(false);
        self.iscamera = ko.observable(false);
        self.isError = ko.observable(false);
        self.IsLive = ko.observable(false);
        self.Liveplaybackicon = ko.observable("");
        self.showreload = ko.observable(true);
        //self.issalvoimage = ko.observable(true);
        self.sessionmodel = new Sessionmodel();
        self.DropfailedText = ko.observable(common.messages.VideoError);
        self.doorsessionmodel = new DoorSessionmodel();
        //self.iscustomimage = ko.observable(false);
        self.isclosevisible = ko.observable(false);
        self.isrequesting = ko.observable(false);
        self.IsSelected = ko.observable(false);
        self.SelectionState = ko.computed(function () {
            if (self.IsSelected()) {
                datacontext.CurrentPanelmodel = self;
                window.viewerconfig.uicontext.showrecord();
                return "panelSelectSelected";
            }

            else {
                hiderecord();
                return "panelSelectNormal";
            }
        });
        self.isdropped = ko.observable(false);
        self.isdropped.subscribe(function (newvalue) {
            var currentPanel = self;
            if (newvalue) {
                $(currentPanel.dropui).parent("li").removeClass(".ui-state-default emptyVideoStyle");
            }
            else {
                $(currentPanel.dropui).parent("li").addClass(".ui-state-default emptyVideoStyle");
            }
        });
        self.panelwidth = ko.observable("");
        self.panelmargin = ko.observable("");
        function hiderecord() {
            var Recordele = $(document).find("#Recordall");
            var Recordoneele = $(document).find("#Record");
            $(Recordoneele).removeClass("showrecord");
            $(Recordele).removeClass("hiderecord");
        }

        self.getPanelClickdetails = function (data, event) {
            datacontext.CurrentPanelmodel = self;
            var base = ko.contextFor(event.currentTarget);
            console.dir(base.$root);
            base.$root.SelectPanel(self);
            window.viewerconfig.uicontext.Hidepopover();
        };

        self.closepanel = function (data, event, ishide) {
            //self.iscustomimage(false);
            self.Liveplaybackicon("");
            self.isrequesting(false);
            self.issuccess(false);
            self.isdropped(false);
            if (self.iscamera() && self.sessionmodel)
                self.sessionmodel.closesession(self.dropui);
            else if (self.isdoor() && self.doorsessionmodel) {
                //self.doorsessionmodel.DooreventResult([]);
                self.doorsessionmodel.doorclosesession(self.dropui);
            }
            //if (ishide != undefined && ishide == true)
            //    self.issalvoimage(false);
            //else
            //    self.issalvoimage(true);
            self.iscamera(false);
            self.isdoor(false);
            self.isError(false);;
            self.isshowdoorvisible(false);
            //window.viewerconfig.uicontext.Hidepopover();
        };

        self.Retryvideostream = function (data, event) {
            datacontext.CurrentPanelmodel = self;
            window.viewerconfig.uicontext.RetryVideoStream();
        };
        self.show = function (pwidth) {
            self.panelwidth(pwidth);
            self.panelmargin("11px");
            self.isshow(true);
            if ($("#" + self.panelid()) && $($("#" + self.panelid()).parent(".emptyVideoStyle")))
                $($("#" + self.panelid()).parent(".emptyVideoStyle")).removeClass("hideVideoStyle");
        };
        self.hide = function (isclose) {
            if (isclose) {
                self.closepanel(null, null, true);
            }
            self.panelwidth("0");
            self.panelmargin("0");
            self.isshow(false);
            if ($("#" + self.panelid()) && $($("#" + self.panelid()).parent(".emptyVideoStyle")))
                $($("#" + self.panelid()).parent(".emptyVideoStyle")).addClass("hideVideoStyle");
        };
        self.isshowdoorvisible = ko.observable(false);
        self.showdoorassociation = function (data, event) {
            window.viewerconfig.uicontext.showdoorassociation(event.currentTarget);
        };
        self.associateddoors = ko.observableArray([]);
        self.isshow = ko.observable(true);
        self.doaddpanelitem = function (event, data) {
            window.viewerconfig.uicontext.selectUniversalOption(common.constants.Views.UNIVERSAL_LIST);
            window.viewerconfig.uicontext.showUniversalView();
        };
    }
    var Sessionmodel = function (data) {
        var self = this;
        data = data || {};
        self.playerOptions = null;
        self.PlayerInstance = null;
        self.IsActive = false;
        self.cameraid = ko.observable("");
        self.clipid = ko.observable("");
        self.cameraname = ko.observable("");
        self.authorizationstatus = ko.observable("");
        self.sessionid = ko.observable("");
        self.starttime = ko.observable("");
        self.LiveStreamurl = ko.observable("");
        self.PlayBackStreamurl = ko.observable(""); 
        self.startDateTimeObj = ko.observable(new Date()),        
        self.playingDateTime = ko.observable(""); 
        self.playingSec = 0;
        self.playerid = "";
        self.ClipDetail = null;
        /* live view  insitialization */
        self.InitializeLiveviewsession = function (camId, ssId, camName, liveUrl, mCurrentPanel) {
            try {
                self.sessionid(ssId);
                self.cameraname(camName);
                self.cameraid(camId);
                self.LiveStreamurl(liveUrl);
                self.playerid = "Player_" + self.cameraid();
                //Initializeplayer(self.playerid());
                if (mCurrentPanel.issalvoview())
                    var playerContainer = $(document.getElementById(mCurrentPanel.panelid())).children(".playercontainer")
                else
                    var playerContainer = $(mCurrentPanel.dropui).children(".playercontainer");
                self.setupPlayer(true, playerContainer, mCurrentPanel);
                mCurrentPanel.issuccess(true);
                //mCurrentPanel.isclosevisible(true);
            } catch (e) {
                console.error("Sessionmodel::Error on initializing live session on the Panel");
            }
        }
        /* Playback insitialization */
        self.IntializePlaybackSession = function (clipData, ssId, playUrl, CameraId, mCurrentPanel) {
            self.sessionid(ssId);
            self.cameraid(clipData.CameraId);
            self.clipid(clipData.ClipId());
            self.cameraname(clipData.CameraName() + "_" + clipData.ClipId());
            self.starttime(ToJavaScriptDate(clipData.StartDate()));
            self.startDateTimeObj(new Date(clipData.StartDate()).addSeconds(-1 * clipData.Prevent()));
            self.playingDateTime(ToJavaScriptDate(new Date(clipData.StartDate()).addSeconds(-1 * clipData.Prevent())));
            self.playingSec = 0;
            self.PlayBackStreamurl(playUrl);
            self.playerid = "Player_" + clipData.ClipId();
            var playerContainer = $(mCurrentPanel.dropui).children(".playercontainer");
            self.setupPlayer(false, playerContainer, mCurrentPanel);
            self.ClipDetail = clipData;            
            //mCurrentPanel.isclosevisible(true);
        }        
        self.IntializeClipExportSession = function (clipData, ssId, exportUrl, CameraId, mCurrentPanel) {
            self.sessionid(ssId);
            self.cameraid(clipData.CameraId);
            self.clipid(clipData.ClipId());
            self.cameraname(clipData.CameraName() + "_" + clipData.ClipId());
            self.starttime(ToJavaScriptDate(clipData.StartDate()));            
            self.PlayBackStreamurl(playUrl);
            self.playerid = "Player_" + clipData.ClipId();
            var playerContainer = $(mCurrentPanel.dropui).children(".playercontainer");
            self.setupPlayer(false, playerContainer, mCurrentPanel);
            self.ClipDetail = clipData;            
        }
        function ToJavaScriptDate(value) {
            var formattedDate = new Date(value);
            var final = moment(formattedDate).format(common.constants.datetimeformat);
            return final;
        }

        self.OnPostPlaybackSeekData = function (self, offset) {
            var Seekoffset = offset;
            try {
                datacontext.PostPlaybackSeekData(self.ClipDetail, self.sessionid(), Seekoffset).done(function (jsondata) {
                    //var stream = jsondata;
                    //if (stream.VideoResultstring.toLowerCase() == common.constants.videostatus.SUCCESS) {
                    //    console.log("seek data successfully posted");
                    //}
                    //else { console.log("failure in seek data post"); }
                    self.PlayerInstance.play(true);
                });
            }
            catch (e) {
                console.log(e);
            }
        }

        //function getplayerOptions(isLive, options) {
        //    var url = null;
        //    if (isLive) {
        //        url = self.LiveStreamurl();
        //    }
        //    else
        //        url = self.PlayBackStreamurl();
        //    self.playerOptions = {
        //        //image: common.getPlayerLoadingImage(), --This code is commented because latest jwplayer (6.11) is showing the image even after LIVE video playing
        //        file: url,
        //        flashplayer: options.flashpath,
        //        html5player: options.html5path,
        //        height: '100%',
        //        width: '100%',
        //        primary: "html5",
        //        provider: 'http',
        //        //aspectratio: "4:3",
        //        mute: false,
        //        controls: !isLive,
        //        autostart: true,
        //        fallback: true,
        //        plugins: {
        //            "ova-jw": {
        //                "ads": {
        //                    "pauseOnClickThrough": !isLive
        //                }
        //            }
        //        }
        //    };
        //    return self.playerOptions;
        //}
        self.setupPlayer = function (isLive, dropPanel, mCurrentPanel) {
            try {
                var url = null;
                if (isLive) {
                    url = self.LiveStreamurl();
                }
                else
                    url = self.PlayBackStreamurl();
                window.mpcplayer.getplayeroptions(isLive, url, "100%", "100%", null, function (playeroptions) {
                    doPlay(isLive, dropPanel, mCurrentPanel, playeroptions);
                });
            } catch (e) {
                console.error("4:Sessionmodel::Error on setting up the player");
            }
        }
        function doPlay(isLive, dropPanel, mCurrentPanel, playeroptions) {
            try {
                var base = ko.contextFor(document.getElementById("viewersalvowrapper"));
                var playerWrapperId = self.playerid + "_PlayerWrapper";
                var $playerWrapper = $("<div></div>");
                $playerWrapper.attr("id", playerWrapperId);
                $(dropPanel).html($playerWrapper);
                self.PlayerInstance = jwplayer(playerWrapperId).setup(playeroptions);

                self.PlayerInstance.onReady(function () {
                    self.IsActive = true;
                });

                self.PlayerInstance.onBeforePlay(function () {
                    console.dir(self.PlayerInstance.getState());
                });
                self.PlayerInstance.onPlay(function () {
                    if (!isLive && self.PlayerInstance.getCaptionsList() && self.PlayerInstance.getCaptionsList().length > 0) {
                        self.PlayerInstance.setCurrentCaptions(1);
                    }
                });
                self.PlayerInstance.onDisplayClick(function () {
                    base.$root.SelectPanel(mCurrentPanel);
                    if (isLive) {
                        self.PlayerInstance.play(true);
                    }
                });
                self.PlayerInstance.onSeek(function (callback) {
                    if (self.ClipDetail.Local()) {
                        self.PlayerInstance.play(false);
                        var seekdata = callback;
                        var offset = null;
                        if (seekdata) {
                            offset = seekdata.offset;
                            self.OnPostPlaybackSeekData(self, offset);
                        }
                    }
                });                
                self.PlayerInstance.onTime(function (event) {                    
                    var secs = (Math.floor(event.position)), playingDateTime;
                    if (secs != self.playingSec) {
                        self.playingSec = secs;  
                        playingDateTime = new Date(self.startDateTimeObj().getTime() + (self.playingSec * 1000));
                        self.playingDateTime(ToJavaScriptDate(playingDateTime));
                    }
                });
                self.PlayerInstance.onResize(function () {
                    console.dir(self.PlayerInstance.getState());
                });

                self.PlayerInstance.onPause(function (oldstate) {
                    console.info("Player onPause");
                    if (isLive) {
                        self.PlayerInstance.play(true);
                    }
                    console.dir(self.PlayerInstance.getState());
                });
                self.PlayerInstance.onBuffer(function (oldstate) {
                    console.info("Player onBuffer");
                    if (isLive) {
                        self.PlayerInstance.play(true);
                    }
                    console.dir(self.PlayerInstance.getState());
                });
                self.PlayerInstance.releaseState(function (event) {
                    console.info("Player releaseState");
                });
                self.PlayerInstance.onIdle(function (oldstate) {
                    console.info("Player is Idle");
                });
                self.PlayerInstance.onError(function () {
                    //mCurrentPanel.isError(true);
                    if (isLive) {
                        console.info("Player Error: setting live play=TRUE");
                        self.PlayerInstance.play(true);
                    }
                    console.info("Player Error");
                });
                //self.PlayerInstance.setFullscreen(true);
                self.PlayerInstance.play(true);
                console.log("4:Sessionmodel::Player settings success: Started Video Play");
            } catch (e) {
                console.error("4:Sessionmodel::Error on setting up the player");
            }
        }
        self.closesession = function (dropPanel) {
            try {
                var playerContainer = $(dropPanel).children(".playercontainer");
                var playerWrapperId = self.playerid + "_PlayerWrapper";
                if ((self.ClipDetail == null) || (self.ClipDetail == undefined)) {
                    console.log($.inArray(self.cameraid(), common.cameraArr));
                    common.cameraArr.splice($.inArray(self.cameraid(), common.cameraArr), $.inArray(self.cameraid(), common.cameraArr) >= 0 ? 1 : 0);
                    if (self.IsActive)
                        datacontext.sendStopCamerarequest(self.cameraid(), self.sessionid());
                }
                else {
                    console.log($.inArray(self.ClipDetail.CameraId + self.ClipDetail.ClipId(), common.cameraArr));
                    common.cameraArr.splice($.inArray(self.ClipDetail.CameraId + self.ClipDetail.ClipId(), common.cameraArr), $.inArray(self.ClipDetail.CameraId + self.ClipDetail.ClipId(), common.cameraArr) >= 0 ? 1 : 0);
                    if (self.IsActive)
                        datacontext.sendPlayBackStopRequest(self.cameraid(), self.sessionid());
                }

                if (self.playerid != "" && self.IsActive) {
                    $(playerContainer).html("");
                    self.cameraid("REMOVED");
                    self.PlayerInstance.remove();
                    self.PlayerInstance = null;

                }
                Reset();
            } catch (e) {
                console.error(e);
            }
        }
        function Reset() {
            self.playerOptions = null;
            self.PlayerInstance = null;
            self.IsActive = false;
            self.cameraid("");
            self.clipid("");
            self.cameraname("");
            self.playingDateTime("");
            self.sessionid("");
            self.LiveStreamurl("");
            self.PlayBackStreamurl("");
            self.playerid = "";
            self.ClipDetail = null;
        }
    }
    var DoorEventResultmodel = function (data) {
        var self = this;
        data = data || {};
        self.SessionId = null;
        self.BlobTypeName = ko.observable(data.BlobTypeName);
        self.CredentialNumber = data.CredentialNumber != "" && data.CredentialNumber != undefined ? "(" + data.CredentialNumber + ")" : "";
        self.DeviceState = ko.observable(data.DeviceState);
        self.DisplayName = ko.observable(data.DisplayName);
        self.EventCode = ko.observable(data.EventCode);
        self.EventCodeType = Resources["EventCode_" + data.EventCode];
        self.OriginTime = ko.observable(data.OriginTime);
        self.ImagePath = data.BlobId ? common.getPhotoPath(data.BlobId) : "";
        self.OrigintimeDisplay = ko.computed(function () {
            if (self.OriginTime() && self.OriginTime() != "")
                var Origindatetime = (typeof self.OriginTime() == 'string' ? new Date(self.OriginTime().match(/\d+/)[0] * 1) : self.OriginTime());//Date(parseInt(self.OriginTime().replace('/Date(', '').replace(')/', '').replace('-', '')))
            return "Date Time: " + Origindatetime;
        });
        function ToJavaScriptDate(value) {
            var formattedDate = new Date(value);
            var final = moment(formattedDate).format(common.constants.datetimeformat);
            return final;
        }
    }
    var DoorSessionmodel = function (data) {
        var self = this;
        data = data || {};
        self.doorid = ko.observable("");
        self.Isdoorlock = ko.observable(false);
        self.doorname = ko.observable("");
        self.authorizationstatus = ko.observable("");
        self.doorstatus = ko.observable("Open & Normal");
        self.Dooraction = ko.observable(common.constants.DoorActions.LOCK.toLowerCase());
        self.IsPanelOnline = false;
        self.Doorstatusicon = ko.observable("doorUnlock-icon");

        self.sessionid = ko.observable("");
        self.DooreventResult = ko.observableArray([]);
        self.dooreventDetail = null;
        self.Isdoorlock.subscribe(function (newval) {
            if (newval) {
                self.Dooraction(common.constants.DoorActions.UNLOCK.toLowerCase());
                self.Doorstatusicon("doorLock-icon");
            }
            else {
                self.Dooraction(common.constants.DoorActions.LOCK.toLowerCase());
                self.Doorstatusicon("doorUnlock-icon");
            }
        })
        self.Initializedoorevent = function (doorevents, mCurrentPanel) {
            self.Reset();
            //$(mCurrentPanel.dropui).parent("li").removeClass(".ui-state-default emptyVideoStyle");
            self.AddDooreventResult(doorevents.Events);
            self.SetDoorStatus(doorevents.DoorStatus);
        }
        self.Performaction = function (data, event) {
            datacontext.CurrentPanelmodel = self;
            window.viewerconfig.uicontext.Performaction(datacontext.CurrentPanelmodel);
        }
        self.Reset = function () {
            self.DooreventResult([]);
            self.doorstatus("Unblocked & Normal");
        }
        self.AddDooreventResult = function (doorevents) {
            if (doorevents == undefined || doorevents == null)
                return
            for (var i = 0; i < doorevents.length; i++) {
                this.DooreventResult.push(new DoorEventResultmodel(doorevents[i]));
            }
        };
        self.SetDoorStatus = function (doorstatus) {
            if (doorstatus == undefined || doorstatus.length < 3)
                return;

            if (doorstatus.length > 3) {
                if (doorstatus[3].toLowerCase() == common.constants.DoorStatus.Panel_Status.OFFLINE) {
                    self.Isdoorlock(false);
                    self.doorstatus(common.messages.device_offline);
                    self.IsPanelOnline = false;
                    return;
                }
            }
            self.IsPanelOnline = true;
            var alrmnrmstatus = "Normal";
            var opnclsstatus = "Unblocked";
            if (doorstatus[0].toLowerCase() == common.constants.DoorStatus.Alarm_Normal.ALARM) {
                alrmnrmstatus = "Alarm";
            }
            if (doorstatus[1].toLowerCase() == common.constants.DoorStatus.Lock_Unlock.LOCK) {
                self.Isdoorlock(true);
            }
            else {
                self.Isdoorlock(false);
            }
            if (doorstatus[2].toLowerCase() == common.constants.DoorStatus.Block_Unblock.BLOCK) {
                opnclsstatus = "Access Blocked";
            }            
            self.doorstatus(opnclsstatus + " & " + alrmnrmstatus);
        };
        self.doorclosesession = function (dropPanel) {
            if (dropPanel == undefined) {
                console.log("droppanel is null");
            }

            self.DooreventResult([]);

            console.log($.inArray(self.doorid(), common.cameraArr));
            //var curpanel = ko.contextFor(dropPanel).$data;
            //$(dropPanel).parent("li").addClass(".ui-state-default emptyVideoStyle");
            var doorId = self.doorid();//curpanel.doorsessionmodel.doorid();
            common.cameraArr.splice($.inArray(doorId, common.cameraArr), $.inArray(doorId, common.cameraArr) >= 0 ? 1 : 0);
            self.doorid("");
        }
    }
    var SalvoViewmodel = function () {
        var self = this;
        panelmodel = new Panelmodel();
        self.issalvoclear = false;
        self.Panels = ko.observableArray([]);
        //self.isUpdatesalvo = ko.observable(false);
        self.Salvoname = ko.observable("");
        self.SalvoId = ko.observable("");
        self.isSalvoname = ko.observable(false);
        self.salvoLayout = ko.observable("");
        self.SalvoViewPanelEntityInfo = ko.observableArray([]);
        self.LivePanels = ko.observableArray([]);
        self.salvowidth = ko.observable("");
        self.salvomargin = ko.observable("");
        self.salvotopmargin = ko.observable("");
        self.SalvoMode = ko.observable("");
        self.RecordedCameraList = ko.observableArray([]),
        //self.ActiveSalvoList = ko.observableArray([]),
        self.Salvolist = ko.observableArray([]),
        self.isfullscreen = ko.observable(false);

        function initialise() {
            showActivePanels(common.salvomode.GRID8, null);
        };
        function showActivePanels(sOpt, SalvoViewEntityInfoField) {

            self.SalvoMode(sOpt);

            var count = 1;
            var pWidth = "22%";
            var sMargin = "3%";
            var sWidth = "100%";
            var sTopmargin = "";
            if (sOpt.toUpperCase() == common.salvomode.GRID1.toUpperCase()) {
                count = 1;
                pWidth = "63%";
                sMargin = "26%";
                sWidth = "73%";
                sTopmargin = "";
            }
            else if (sOpt.toUpperCase() == common.salvomode.GRID4.toUpperCase()) {
                count = 4;
                pWidth = "33%";
                sMargin = "22%";
                sWidth = "77%";
                sTopmargin = "";
            }
            else if (sOpt.toUpperCase() == common.salvomode.GRID6.toUpperCase()) {
                count = 6;
                pWidth = "30%";
                sMargin = "11%";
                sWidth = "82%";
                sTopmargin = "";
            }
            else if (sOpt.toUpperCase() == common.salvomode.GRID8.toUpperCase()) {
                count = 8;
                pWidth = "22%";
                sMargin = "3%";
                sWidth = "100%";
                sTopmargin = "";

            }

            if (self.Panels == undefined || self.Panels().length <= 0) {
                for (var i = 0; i < count; i++) {
                    var pmodel = new Panelmodel();
                    pmodel.panelid("jwplayer" + guid());
                    if (SalvoViewEntityInfoField != null) {
                        for (var j = 0; j < SalvoViewEntityInfoField.length; j++) {
                            console.log(" print j " + j);
                            if (i == SalvoViewEntityInfoField[j].PanelNumberField) {
                                if (SalvoViewEntityInfoField[j].EntityTypeField != null) {
                                    if (SalvoViewEntityInfoField[j].EntityTypeField.toLowerCase() == window.viewerconfig.common.Enumeration.EntityType.CAMERA.toLowerCase()) {
                                        pmodel.iscamera(true);
                                        pmodel.sessionmodel.cameraid(SalvoViewEntityInfoField[j].EntityInstanceIdField);
                                        pmodel.sessionmodel.cameraname(SalvoViewEntityInfoField[j].EntityInstanceNameField);
                                        pmodel.sessionmodel.authorizationstatus(SalvoViewEntityInfoField[j].AuthorizationStatus);
                                    }

                                    if (SalvoViewEntityInfoField[j].EntityTypeField.toLowerCase() == window.viewerconfig.common.Enumeration.EntityType.DOOR.toLowerCase()) {
                                        pmodel.isdoor(true);
                                        pmodel.doorsessionmodel.doorid(SalvoViewEntityInfoField[j].EntityInstanceIdField);
                                        //pmodel.doorname(SalvoViewEntityInfoField[j].EntityInstanceNameField);
                                        pmodel.doorsessionmodel.doorname(SalvoViewEntityInfoField[j].EntityInstanceNameField);
                                        pmodel.doorsessionmodel.authorizationstatus(SalvoViewEntityInfoField[j].AuthorizationStatus);
                                    }
                                }

                            }

                        }
                    }
                    pmodel.show(pWidth);
                    self.Panels.push(pmodel);

                }
            }
            else {
                if (!self.isfullscreen()) {
                    //Removing non-dropped panels blindly
                    for (var i = self.Panels().length - 1 ; i >= 0; i--) {
                        if (!self.Panels()[i].isdropped())
                            self.Panels().splice(i, 1);
                    }

                    //Refilling panel array, if the no. of dropped panels are less than total panels required in salvo
                    for (var i = self.Panels().length ; i < count; i++) {
                        var pmodel = new Panelmodel();
                        pmodel.panelid("jwplayer" + guid());

                        self.Panels.push(pmodel);
                    }
                }
                //This logic is to make sure that only the no. of panels required are shown(even though all are dropped)            
                for (var p in self.Panels()) {
                    var pmodel = self.Panels()[p];

                    if (count == 0) {
                        pmodel.hide(pmodel.isdropped());
                    }
                    else {
                        pmodel.show(pWidth);
                    }
                    //pmodel.isclosevisible(true);


                    if (count > 0)
                        count--;
                }

            }

            self.salvotopmargin(sTopmargin);
            self.salvomargin(sMargin);
            self.salvowidth(sWidth);
            self.salvoLayout(sOpt);
        }
        self.CloseSalvosesion = function () {
            //Removing non-dropped panels blindly
            for (var i = self.Panels().length - 1 ; i >= 0; i--) {
                if (!self.Panels()[i].isdropped())
                    self.Panels().splice(i, 1);
            }
            //This logic is to make sure that only the no. of panels required are shown(even though all are dropped)            
            for (var p in self.Panels()) {
                var pmodel = self.Panels()[p];
                pmodel.hide(pmodel.isdropped());
            }

        }
        self.CheckforDuplicateCamera = function (cameraId) {
            // Filter out all active panel
            // TO DO search across all the panel with matching camera id
            // return true if present else false
            try {

            } catch (e) {
                console.error("SalvoViewModel:Error while searching panels for matching camera id", e);
                return false;
            }
        }
        self.SelectPanel = function (paneltoSelect) {
            $.map(self.Panels(), function (pItem) {
                pItem.IsSelected(false);
            });
            paneltoSelect.IsSelected(true);
        }
        self.UnSelectAllPanel = function () {
            $.map(self.Panels(), function (pItem) {
                pItem.IsSelected(false);
            });
            window.viewerconfig.uicontext.Hidepopover();
            datacontext.CurrentPanelmodel = null;
        }
        function showFullscreenPanels(UlistOpen, issinglesalvo) {
            var sTopmargin = "";
            var count = 1;
            var pWidth = "";
            var sMargin = "";
            var sWidth = "";
            if (issinglesalvo || self.SalvoMode().toUpperCase() == common.salvomode.GRID1.toUpperCase()) {
                count = 1;
                if (!UlistOpen) {
                    sWidth = "72.5%";
                }
                else {
                    sWidth = "99.4%";
                }
                pWidth = "136%";
                sMargin = "0%";
                sTopmargin = "0%";
            }
            else if (self.SalvoMode().toUpperCase() == common.salvomode.GRID4.toUpperCase()) {
                count = 4;
                if (!UlistOpen) {
                    sWidth = "107%";
                }
                else {
                    sWidth = "146.5%";
                }
                sMargin = "0%";
                pWidth = "45%";
                sTopmargin = "0%";

            }
            else if (self.SalvoMode().toUpperCase() == common.salvomode.GRID6.toUpperCase()) {
                count = 6;
                if (!UlistOpen) {
                    sWidth = "106%";
                    sTopmargin = "9%";
                }
                else {
                    sWidth = "145%";
                    sTopmargin = "12%";
                }
                pWidth = "30%";
                sMargin = "0%";
            }
            else if (self.SalvoMode().toUpperCase() == common.salvomode.GRID8.toUpperCase()) {
                count = 8;
                if (!UlistOpen) {
                    sWidth = "104%";
                    sTopmargin = "14%";

                }
                else {
                    sWidth = "142%";
                    sTopmargin = "18%";
                }
                sMargin = "0%";
                pWidth = "22.5%";
            }

            for (var p in self.Panels()) {
                var pmodel = self.Panels()[p];
                if (issinglesalvo) {
                    if (datacontext.CurrentPanelmodel.panelid() == pmodel.panelid()) {
                        pmodel.show(pWidth);
                    }
                    else {
                        pmodel.hide(false);
                    }
                    //pmodel.isclosevisible(false);
                }
                else {
                    if (count == 0)
                        pmodel.hide(false);
                    else
                        pmodel.show(pWidth);
                    //pmodel.isclosevisible(false);

                    if (count > 0)
                        count--;
                }
            }
            self.salvomargin(sMargin);
            self.salvowidth(sWidth);
            self.salvotopmargin(sTopmargin);
        }
        function getSalvoRecorded() {
            for (var p in self.Panels()) {
                var pmodel = self.Panels()[p];

                if (pmodel.IsLive() && pmodel.isdropped()) {
                    self.RecordedCameraList.push(pmodel.sessionmodel.cameraid());
                }

            }
            if (self.RecordedCameraList.length > 0)
                window.viewerconfig.uicontext.RecordAll(self.RecordedCameraList);
            else
                return;
        }
        self.OnGetRecordSingleCameraData = function (data, event) {
            self.RecordedCameraList = [];
            if ((!datacontext.CurrentPanelmodel.IsLive()) && (!datacontext.CurrentPanelmodel.isdropped())) {
                alertify.alert(window.viewerconfig.common.messages.RecordPlayError);
                return;
            }
            self.RecordedCameraList.push(datacontext.CurrentPanelmodel.sessionmodel.cameraid());
            window.viewerconfig.uicontext.RecordAll(self.RecordedCameraList);
        }

        self.OncheckActiveSalvoList = function (data, event) {
            //self.ActiveSalvoList = [];
            //datacontext.CurrentPanelmodel = null;
            for (var p in self.Panels()) {
                var pmodel = self.Panels()[p];
                if ((pmodel.iscamera() && pmodel.sessionmodel && pmodel.sessionmodel.cameraid() != "" && pmodel.IsLive())
                    || (pmodel.isdoor() && pmodel.doorsessionmodel && pmodel.doorsessionmodel.doorid() != "")) {
                    //self.ActiveSalvoList.push(pmodel.sessionmodel.cameraid());
                    //if (self.ActiveSalvoList.length > 0)
                    //    datacontext.CurrentPanelmodel = self;
                    window.viewerconfig.uicontext.OpenSalvopopover(data, event);
                    return true;
                }
            }
            return false;
        }
        self.OnGetRecordAlldata = function (data, event) {
            self.RecordedCameraList = [];
            getSalvoRecorded();
        }
        self.onSalvoModeSelectionChanged = function (sOpt) {
            console.log(sOpt);
            if (self.SalvoMode() != sOpt) {
                self.UnSelectAllPanel();
                showActivePanels(sOpt, null);
            }
        }
        self.onClearAllSalvo = function (sOpt) {
            self.Salvoname("");
            console.log(sOpt);
            self.UnSelectAllPanel();
            self.CloseSalvosesion();
            self.Panels([]);
            showActivePanels(sOpt, null);
        }
        self.OnSelectedsalvofullscreen = function (UlistOpen) {
            showFullscreenPanels(UlistOpen, true);
            window.viewerconfig.uicontext.getfulscreenviewer();
            window.viewerconfig.uicontext.getFullScreen();
            self.isfullscreen(true);
        }
        self.OnFullscreenClick = function (UlistOpen) {
            showFullscreenPanels(UlistOpen, false);
            window.viewerconfig.uicontext.getfulscreenviewer();
            window.viewerconfig.uicontext.getFullScreen();
            self.isfullscreen(true);
        }
        self.OnExitfullscreenClick = function () {
            showActivePanels(self.SalvoMode(), null);
            self.isfullscreen(false);
        }
        self.ResetResult = function () {
            self.SalvoViewPanelEntityInfo([]);
        };
        self.GetSalvoInfo = function () {
            self.ResetResult();
            Panelnumber = 0;
            for (var p in self.Panels()) {
                var pmodel = self.Panels()[p];
                if ((pmodel.iscamera() && pmodel.sessionmodel && pmodel.sessionmodel.cameraid() != "" && pmodel.IsLive())
                    || (pmodel.isdoor() && pmodel.doorsessionmodel && pmodel.doorsessionmodel.doorid() != "")) {
                    var entityInstanceInfo = new salvoentityInstanceInfo(pmodel);
                    self.SalvoViewPanelEntityInfo.push(entityInstanceInfo);
                }
                Panelnumber = Panelnumber + 1;
            }
            return self.SalvoViewPanelEntityInfo();
        }
        self.Getsalvowiew = function (nodedata) {
            self.CloseSalvosesion();
            self.Panels([]);
            var gridoption = common.ConvertSalvoLayoutToGrid(nodedata.SalvoLayOutField);

            showActivePanels(gridoption, nodedata.SalvoViewEntityInfoField)

            self.SalvoId(nodedata.Id);
            self.Salvoname(nodedata.Name);
            self.isSalvoname(true);
            var isflashinstallchecked = false;
            for (var p in self.Panels()) {
                var pmodel = self.Panels()[p];
                if (pmodel.iscamera() && pmodel.sessionmodel.cameraid() != "") {
                    if (!isflashinstallchecked) {
                        window.viewerconfig.uicontext.checkforplayersupport();
                        isflashinstallchecked = true;
                    }
                    var destinationPanel = (ko.contextFor(document.getElementById(pmodel.panelid()))).$data;
                    window.viewerconfig.uicontext.getLiveUrlStream(destinationPanel, pmodel.sessionmodel.cameraid(), pmodel.sessionmodel.cameraname(), false, true, true);
                }
                else if (pmodel.isdoor() && pmodel.doorsessionmodel && pmodel.doorsessionmodel.doorid() != "") {
                    var destinationPanel = (ko.contextFor(document.getElementById(pmodel.panelid()))).$data;
                    window.viewerconfig.uicontext.getDoorLiveEvent(destinationPanel, pmodel.doorsessionmodel.doorid(), pmodel.doorsessionmodel.doorname(), false, true);
                }
            }
            window.viewerconfig.common.issalvoview = true;
            window.viewerconfig.uicontext.makesalvodroprecieverforcamera();
        }
        self.updatenewsalvoview = function (nodedata) {
            self.SalvoId(nodedata.Id);
            self.Salvoname(nodedata.Name);
            self.isSalvoname(true);
        }
        initialise();
    }

    window.viewerconfig.datacontext.SalvoViewmodel = SalvoViewmodel;
    window.viewerconfig.datacontext.Sessionmodel = Sessionmodel;
    window.viewerconfig.datacontext.Doormodel = Doormodel;
})(jQuery, window.viewerconfig.common, window.viewerconfig.datacontext, window.viewerconfig.uicontext);
