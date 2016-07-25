/// <reference path="mpcacamera.continusrecording.js" />
/// <reference path="mpcacamera.eventrecording.js" />
/// <reference path="mpcacamera.motionrecording.js" />
/// <reference path="mpcacamera.settings.js" />
/// <reference path="mpcacamera.datacontext.js" />

window.mpcacamerasetting.models = (function (ko, datacontext, common) {
    var inputModel = function (data) {
        var self = this;
        data = data || {};
        self.Id = ko.observable(data.Id);
        self.Name = ko.observable(data.Name);
        self.IsChecked = ko.observable(data.IsChecked);
    }
    datacontext.inputModel = inputModel;

    var panelmodel = function (data) {
        // Live Preview
        var self = this;
        data = data || {};
        self.paneltitle = ko.observable("");
        self.erroricon = ko.observable("");
        self.erromessage = ko.observable("");
        self.issuccess = ko.observable(false);
        self.isError = ko.observable(false);
        self.sessionmodel = new Sessionmodel();
        self.iscustomimage = ko.observable(false);
        self.isclosevisible = ko.observable(false);
        self.isrequesting = false;
        self.isshow = ko.observable(false);
        self.DropfailedText = ko.observable("");
        self.getPlayClickdetails = function (data, event) {
            datacontext.CurrentPanelmodel = self;
            var base = ko.contextFor(event.currentTarget);
            window.mpcacamerasetting.uicontext.GetLivepreview(datacontext.CurrentPanelmodel, base.$root.SettingsModel().Id, base.$root.SettingsModel().Name(), false, event.currentTarget.parentElement.id);
        };

        self.Retryvideostream = function (data, event) {
            datacontext.CurrentPanelmodel = self;
            window.mpcacamerasetting.uicontext.RetryVideoStream();
        };

        self.closepanel = function (data, event) {
            self.iscustomimage(false);
            self.isrequesting = false;
            self.issuccess(false);
            self.sessionmodel.closesession(self);
            self.isError(false);;
        };
    }
    datacontext.panelmodel = panelmodel;


    var scheduleModel = function (data, scheduletype) {
        var self = this;
        data = data || {};
        self.Id = ko.observable(data.Id);
        self.Name = ko.observable(data.Name);
        self.IsChecked = ko.observable(data.IsChecked);
        self.Type = scheduletype || common.constants.scheduletypes.Default;
        self.ShowSettings = function () {
            window.mpcacamerasetting.uicontext.showscheduledialog(self.Id(), self.Type);
        };
    }

    datacontext.scheduleModel = scheduleModel;

    var Sessionmodel = function (data) {
        var self = this;
        data = data || {};
        self.playerOptions = null;
        self.PlayerInstance = null;
        self.IsActive = false;
        self.cameraid = ko.observable("");
        self.cameraname = ko.observable("");
        self.sessionid = ko.observable("");
        self.LiveStreamurl = ko.observable("");
        self.playerid = "";
        /* live view  insitialization */
        self.InitializeLiveviewsession = function (camId, ssId, camName, liveUrl, PlayerPanel, playerSectionId) {
            self.sessionid(ssId);
            self.cameraname(camName);
            self.cameraid(camId);
            self.LiveStreamurl(liveUrl);
            self.playerid = "PreviewPlayer_" + self.cameraid() + '_' + playerSectionId;
            var playerContainer = $('#' + playerSectionId).find(".playercontainer");
            self.setupPlayer(true, playerContainer, PlayerPanel);
            PlayerPanel.issuccess(true);
            PlayerPanel.isclosevisible(true);
        }
        //function getplayerOptions(isLive) {
        //    var url = null;
        //    url = self.LiveStreamurl();
        //    self.playerOptions = {
        //        image: common.getPlayerLoadingImage(),
        //        flashplayer: window.location.href + '/Scripts/lib/jwplayer/jwplayer.flash.swf',
        //        html5player: window.location.href + '/Scripts/lib/jwplayer/jwplayer.html5.js',
        //        file: url,
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
        self.setupPlayer = function (isLive, Playpanel, mCurrentPanel) {
            var url = self.LiveStreamurl();
            window.mpcplayer.getplayeroptions(isLive, url, '100%', '100%', common.getPlayerLoadingImage(), function (playeroptions) {
                var playerWrapperId = self.playerid + "_PlayerWrapper";
                var $playerWrapper = $("<div></div>");
                $playerWrapper.attr("id", playerWrapperId);
                $(Playpanel).html($playerWrapper);
                self.PlayerInstance = jwplayer(playerWrapperId).setup(playeroptions);
                self.PlayerInstance.onReady(function () {
                    self.IsActive = true;
                });
                self.PlayerInstance.onBeforePlay(function () {
                    console.dir(self.PlayerInstance.getState());
                });

                self.PlayerInstance.onDisplayClick(function () {
                    if (isLive) {
                        self.PlayerInstance.play(true);
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
            });
        }
        self.closesession = function (Playermodel) {
            var playerContainer = $(document).find("#mpcaCamerasetting .playercontainer");
            var playerWrapperId = self.playerid + "_PlayerWrapper";
            if (self.IsActive)
                window.mpcacamerasetting.uicontext.CloseLivesession(self.cameraid(), self.sessionid());
            if (self.playerid != "" && self.IsActive) {
                $(playerContainer).html("");
                self.cameraid("REMOVED");
                self.PlayerInstance.remove();
                self.PlayerInstance = null;
            }
            Reset();
        }
        function Reset() {
            self.playerOptions = null;
            self.PlayerInstance = null;
            self.IsActive = false;
            self.cameraid("");
            self.cameraname("");
            self.sessionid("");
            self.LiveStreamurl("");
            self.playerid = "";
        }
    }

    datacontext.Sessionmodel = Sessionmodel;

    var streamEntity = function (data) {
        var self = this;
        self.id = data.Id;
        self.isstreamdetailinitialised = false;
        self.model = ko.observable(data.Model);
        self.fpsvalues = data.VideoQuality;
        self.resolutionvalues = data.Resolution;
        self.qualityvalues = data.Quality;
        self.recfpsvalues = data.RecordingVideoQuality;
        self.recresolutionvalues = data.RecordingResolution;
        self.recqualityvalues = data.RecordingQuality;
        self.Initialise = function (info) {
            self.fpsvalues = info.VideoQuality;
            self.resolutionvalues = info.Resolution;
            self.qualityvalues = info.Quality;
            self.recfpsvalues = info.RecordingVideoQuality;
            self.recresolutionvalues = info.RecordingResolution;
            self.recqualityvalues = info.RecordingQuality;
            self.isstreamdetailinitialised = true;
        };
    }
    datacontext.streamEntity = streamEntity;

    var deviceEntity = function (data) {
        var self = this;
        self.Id = ko.observable(data.Id);
        self.Name = ko.observable(data.Name);
        self.closeicon = ko.observable("icon-itemclose");
        self.enableclose = function () {
            self.closeicon("icon-itemclose-show");
        };
        self.disableclose = function () {
            self.closeicon("icon-itemclose");
        };
    }
    datacontext.deviceEntity = deviceEntity;

    var capabilitymodal = function (updatecallback) {
        var self = this;
        self.ActualValue = ko.observable(0);
        self.ProgressValue = ko.computed(function () {
            var rnd = Math.round(self.ActualValue());
            if (rnd >= 100) {
                return 100;
            }
            else {
                return rnd;
            }
        });
        self.ProgressText = ko.computed(function () {
            return self.ProgressValue() + "%";
        });
        self.ActualValue.subscribe(function (newval) {
            if (updatecallback)
                updatecallback(newval);
        });
    }
    datacontext.capabilitymodal = capabilitymodal;

    var discovermodel = function (data) {
        var self = this;
        self.Id = data.Id;
        self.DeviceName = data.DeviceName;
        self.IPAddress = data.IPAddress;
        self.HttpPort = data.HttpPort;
        self.MacAddress = data.MacAddress;
        self.IsDHCP = data.IsDHCP;
        self.RtspUrl = data.RtspUrl;
        self.Model = data.Model;
    }
    datacontext.discovermodel = discovermodel;

    var camerabasemodel = function () {
        var self = this;
        var data = data || {}
        var isTempEnableDisable = false;
        //sub-tabs
        self.SettingsModel = ko.observable(new datacontext.Cameramodel(EventHandler));
        self.PanelModel = ko.observable(new datacontext.panelmodel());
        self.EventRecordingModel = ko.observable(new datacontext.EventRecordingEntity());
        self.ContinuousRecordingModel = ko.observable(new datacontext.ContinuousRecordingEntity());
        self.MotionRecordingModel = ko.observable(new datacontext.MotionRecordingEntity());
        self.CapabilityModel = new datacontext.capabilitymodal(UpdateCapability);
        self.ErrorMessage = ko.observable("");
        self.IsError = ko.computed(function () {
            if (self.ErrorMessage() == "") {
                return false;
            }
            else {
                return true;
            }
        });

        self.IsDisableSave = ko.observable(false);
        self.IsDisabled = ko.observable(true);
        self.enabledisableval = ko.observable(1);
        self.enabledisableval.subscribe(function (newval) {
            var isdisabled = newval == "0" ? true : false;
            //This means camera was enabled but we are making disabled, so enable save option
            if (isdisabled && !isTempEnableDisable && !(Math.round(self.CapabilityModel.ActualValue()) >= 100)) {
                self.IsDisableSave(false);
                self.ErrorMessage("");
            }
            else if (!isdisabled && !isTempEnableDisable && Math.round(self.CapabilityModel.ActualValue()) >= 100) {
                self.enabledisableval(0);
                self.IsDisableSave(true);
                self.ErrorMessage(common.messages.dev_cap_lmt_rchd);
                return;
            }

            self.IsDisabled(isdisabled);
            self.SettingsModel().IsCameraDisabled(isdisabled, isTempEnableDisable);
            self.EventRecordingModel().IsCameraDisabled(isdisabled);
            self.ContinuousRecordingModel().IsCameraDisabled(isdisabled);
            self.MotionRecordingModel().IsCameraDisabled(isdisabled);
        });

        self.dosaveall = function () {
            self.SettingsModel().dosaveconfigure(function (passonmodel, returnerror) {
                self.ErrorMessage(returnerror);
                if (passonmodel) {
                    passonmodel = self.EventRecordingModel().dosaveconfigure(passonmodel);
                    if (passonmodel) {
                        passonmodel = self.ContinuousRecordingModel().dosaveconfigure(passonmodel);
                        if (passonmodel) {
                            passonmodel = self.MotionRecordingModel().dosaveconfigure(passonmodel);
                            if (passonmodel) {
                                var errmsg = passonmodel.dofinalvalidate();
                                self.ErrorMessage(errmsg);
                                if (!self.IsError()) {
                                    window.mpcacamerasetting.uicontext.showsaving(true);
                                    datacontext.savecameraconfigdetail(passonmodel, function (successresult) {
                                        window.mpcacamerasetting.uicontext.showsaving(false);
                                        self.SettingsModel().updatesaveresult(true);
                                        self.EventRecordingModel().updatesaveresult(true);
                                        self.ContinuousRecordingModel().updatesaveresult(true);
                                        self.MotionRecordingModel().updatesaveresult(true);
                                        var msg = common.messages.save_success;
                                        if (successresult.recorderstatus && successresult.recorderstatus.toLowerCase() != common.constants.recorderstatus.ONLINE.toLowerCase()) {
                                            msg += "." + common.messages.devoffline_cnfgdwnOnOnl;
                                        }
                                        alertify.success(msg);
                                        return true;
                                    }, function (errorresult) {
                                        window.mpcacamerasetting.uicontext.showsaving(false);
                                        self.SettingsModel().updatesaveresult(false);
                                        self.EventRecordingModel().updatesaveresult(false);
                                        self.ContinuousRecordingModel().updatesaveresult(false);
                                        self.MotionRecordingModel().updatesaveresult(false);
                                        if (errorresult) {
                                            alertify.error(errorresult.error);
                                        }
                                        else {
                                            alertify.error(common.messages.save_error);
                                        }
                                        return;
                                    });
                                }
                            }
                            else
                                window.mpcacamerasetting.uicontext.selectsubtab(common.constants.configtabs.MotionRecording);
                        }
                        else
                            window.mpcacamerasetting.uicontext.selectsubtab(common.constants.configtabs.ContinuousRecording);
                    }
                    else
                        window.mpcacamerasetting.uicontext.selectsubtab(common.constants.configtabs.EventRecording);
                }
                else {
                    window.mpcacamerasetting.uicontext.selectsubtab(common.constants.configtabs.Settings);
                    if (self.IsError()) {
                        alertify.error(self.ErrorMessage());
                    }
                }
            });
        };
        self.InitialiseActiveTab = function (tabid) {
            isTempEnableDisable = true;
            self.enabledisableval(data.IsActive ? 1 : 0);
            isTempEnableDisable = false;
            var activeli = $(tabid).children("li.active");
            if (activeli) {
                var activetab = activeli.children("[data-toggle='tab']");
                if (activetab && activetab.length > 0 && activetab[0].attributes["href"]) {
                    InitialiseTab(activetab[0].attributes["href"].value);
                }
            }
        }
        self.ontabselected = function (data, event) {
            if (event && event.currentTarget && event.currentTarget.attributes["href"]) {
                InitialiseTab(event.currentTarget.attributes["href"].value);
            }
        };

        function EventHandler(event, data) {
            self.MotionRecordingModel().FireEvent(event, data);
        }
        function UpdateCapability(newval) {
            if (newval > 100) {
                self.IsDisableSave(true);
                self.ErrorMessage(common.messages.dev_cap_lmt_rchd);
            }
            else {
                self.IsDisableSave(false);
                self.ErrorMessage("");
            }
        }
        function InitialiseTab(tabhref) {
            switch (tabhref) {
                case common.constants.configtabs.EventRecording: {
                    self.EventRecordingModel().SetFocus();
                    break;
                }
                case common.constants.configtabs.ContinuousRecording: {
                    self.ContinuousRecordingModel().SetFocus();
                    break;
                }
                case common.constants.configtabs.MotionRecording: {
                    self.MotionRecordingModel().SetFocus();
                    break;
                }
                default: {
                    self.SettingsModel().SetFocus();
                    break;
                }
            }
        }

        self.Initialise = function (newdata) {
            data = newdata;
            self.IsDisableSave(false);
            self.ErrorMessage("");
            self.IsDisabled(true);
            datacontext.currentcapabilitymodal = self.CapabilityModel;
            self.SettingsModel().Initialise(data);
            self.EventRecordingModel().Initialise(data);
            self.ContinuousRecordingModel().Initialise(data);
            self.MotionRecordingModel().Initialise(data);
            $('#mpcacameraRCDPreEvnt').spinner();
            $('#mpcacameraRCDOnsPstEvnt').spinner();
            $('#mpcacameraRCDOffPstEvnt').spinner();
            $('#motionrectime').spinner();
            $('#redmotionsensitiviy').spinner();
            $('#greenmotionsensitiviy').spinner();
            $('#bluemotionsensitiviy').spinner();
        }
    }
    datacontext.CameraBasemodel = camerabasemodel;
})(ko, window.mpcacamerasetting.datacontext, window.mpcacamerasetting.common);
