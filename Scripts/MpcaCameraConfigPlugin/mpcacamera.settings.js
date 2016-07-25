/// <reference path="mpcacamera.common.js" />
/// <reference path="mpcacamera.datacontext.js" />
/// <reference path="mpcacamera.uicontext.js" />
window.mpcacamerasetting.settingsmodel = (function (ko, datacontext, common) {
    var CamerasettingEntity = function (evntcallback) {
        var self = this;
        var iscamerachanged = true;
        var iscamerasettinginitialised = false;
        var iscamerastreaminitialised = false;
        var isstreamerdetailsfilled = false;
        var isnewlyaddedcamera = true;
        var isdiscoveredcameraselected = false;
        var isdisableupdatemaxbitrate = false;
        var devicecapabilityinfo;
        var data = data || {};
        var _tempAssociatedDevices = [];
        var _orgAssociatedDevices = [];
        //var addDevices = new libhash();
        //var deletedDevices = new libhash();
        var IsDirtyAssociatedDevices = false;
        var eventcallback = evntcallback;
        var defaultMask = common.constants.defaultMask;
        self.PasswordField = ko.observable(defaultMask);
        self.Id = "";
        self.ParentId = "";
        self.Name = ko.observable("");
        self.IsActive = ko.observable(false);
        self.DiscoverIPCamera = ko.observable();
        self.RTSPUrl = ko.observable("");
        self.Username = ko.observable("");
        self.Password = ko.observable("");
        self.MacAddress = "";
        self.IPAddress = "";
        self.currentassociationcount = ko.observable(0);
        self.deviceentities = ko.observableArray([]);
        self.SelectedCameraType = ko.observable();
        self.cameratypevalues = ko.observableArray([]);
        self.SelectedDiscoverCamera = ko.observable();
        self.discoveredcameras = ko.observableArray([]);

        self.SelectedModel = ko.observable();
        self.streamentities = ko.observableArray([]);
        self.SelectedFPS = ko.observable();
        self.fpsvalues = ko.observableArray([]);
        self.SelectedResolution = ko.observable();
        self.resolutionvalues = ko.observableArray([]);
        self.SelectedQuality = ko.observable();
        self.qualityvalues = ko.observableArray([]);
        //Only for Analog
        self.SelectedRecFPS = ko.observable();
        self.recfpsvalues = ko.observableArray([]);
        self.SelectedRecQuality = ko.observable();
        self.recqualityvalues = ko.observableArray([]);
        self.SelectedAnalogSlot = ko.observable();
        self.analogslots = ko.observableArray([]);

        self.SelectedPreEvent = ko.observable(-1);
        self.MinPreEvent = ko.observable(-1);
        self.MaxPreEvent = ko.observable(-1);
        self.SelectedOnsitePostEvent = ko.observable(-1);
        self.MinOnsitePostEvent = ko.observable(-1);
        self.MaxOnsitePostEvent = ko.observable(-1);
        self.SelectedOffsitePostEvent = ko.observable(-1);
        self.MinOffsitePostEvent = ko.observable(-1);
        self.MaxOffsitePostEvent = ko.observable(-1);
        self.MaxBitrateDuration = ko.observable(-1);

        self.associationtext = ko.computed(function () {
            return Resources.mpcaCam_Setting_Asocias + ": " + self.currentassociationcount();
        });

        self.IsIPCamera = ko.computed(function () {
            if (self.SelectedCameraType && self.SelectedCameraType()
                && self.SelectedCameraType().Key.toLowerCase() == common.constants.cameratypes.IPCamera.toLowerCase()) {
                return true;
            }
            return false;
        });
        self.IsAnalog = ko.computed(function () {
            if (self.SelectedCameraType && self.SelectedCameraType()
                && self.SelectedCameraType().Key.toLowerCase() == common.constants.cameratypes.AnalogCamera.toLowerCase()) {
                return true;
            }
            return false;
        });
        self.LoadDiscoveredCameras = ko.computed(function () {
            if (self.IsActive() && self.IsIPCamera()) {
                self.dodiscover();
            }
        });
        self.IsDisableQuality = ko.computed(function () {
            if (self.qualityvalues() && self.qualityvalues().length > 1) {
                return false;
            }
            else {
                return true;
            }
        });

        //For BL Model        
        self.CameraModel = null;
        self.FPS = null;
        self.Resolution = null;
        self.Quality = null;
        self.RecordingFPS = null;
        self.RecordingQuality = null;
        self.AnalogInput = null;
        self.PreEvent = null;
        self.OnsitePostEvent = null;
        self.OffsitePostEvent = null;
        self.MotionDetectionSetting = null;
        self.EventRecordings = [];
        self.ContinuousRecordings = [];
        self.MotionRecordings = [];
        self.AssociatedDevices = [];
        self.DisassociatedDevices = [];

        self.IsNumber = function (data, event) {
            var charCode = (event.which) ? event.which : event.keyCode
            if (charCode > 31 && (charCode < 48 || charCode > 57))
                return false;
            return true;
        }
        self.IsPreEventInRange = function (data, event) {
            if (self.SelectedPreEvent() > self.MaxPreEvent()) {
                self.SelectedPreEvent(self.MaxPreEvent());
            }
            if (!(self.SelectedPreEvent() && self.SelectedPreEvent() >= self.MinPreEvent())) {
                self.SelectedPreEvent(self.MinPreEvent());
            }
        }
        self.IsOnsitePostEventInRange = function (data, event) {
            if (self.SelectedOnsitePostEvent() > self.MaxOnsitePostEvent()) {
                self.SelectedOnsitePostEvent(self.MaxOnsitePostEvent());
            }
            if (!(self.SelectedOnsitePostEvent() && self.SelectedOnsitePostEvent() >= self.MinOnsitePostEvent())) {
                self.SelectedOnsitePostEvent(self.MinOnsitePostEvent());
            }
        }
        self.IsOffsitePostEventInRange = function (data, event) {
            if (self.SelectedOffsitePostEvent() > self.MaxOffsitePostEvent()) {
                self.SelectedOffsitePostEvent(self.MaxOffsitePostEvent());
            }
            if (!(self.SelectedOffsitePostEvent() && self.SelectedOffsitePostEvent() >= self.MinOffsitePostEvent())) {
                self.SelectedOffsitePostEvent(self.MinOffsitePostEvent());
            }
        }

        self.IsActive.subscribe(function (newval) {
            if (iscamerasettinginitialised && newval && self.IsAnalog()) {
                self.Name("");
            }
        });
        self.SelectedCameraType.subscribe(function (newtype) {
            if (iscamerasettinginitialised) {
                window.mpcacamerasetting.uicontext.showloading(true);
                if (eventcallback) {
                    eventcallback(common.events.oncameratypechanged, newtype.Key);
                }
                ClearModelDetails();
                datacontext.getstreamers(self, function () {
                    window.mpcacamerasetting.uicontext.showloading(false);
                });
            }
        });
        self.SelectedModel.subscribe(function (newmodel) {
            if (newmodel == undefined)
                return;
            window.mpcacamerasetting.uicontext.showloading(true);
            if (iscamerasettinginitialised && iscamerastreaminitialised) {
                if (!newmodel.isstreamdetailinitialised) {
                    ClearStreamerDetails();
                    datacontext.getstreamerdetail(newmodel.id).done(function (jsondata) {
                        if (jsondata.Success) {
                            newmodel.Initialise(jsondata.data);
                            FillStreamerDetails(newmodel);
                        }
                        window.mpcacamerasetting.uicontext.showloading(false);
                    }).error(function () {
                        window.mpcacamerasetting.uicontext.showloading(false);
                    });
                }
                else {
                    FillStreamerDetails(newmodel);
                    window.mpcacamerasetting.uicontext.showloading(false);
                }
            }
        });
        self.SelectedDiscoverCamera.subscribe(function (newcamera) {
            if (newcamera == undefined || !self.IsIPCamera())
                return;
            var streamentity = $(self.streamentities()).filter(function () {
                if (this.model() == newcamera.Model)
                    return this;
            })
            if (streamentity != undefined && streamentity.length > 0) {
                self.SelectedModel(streamentity[0]);
                self.Name(newcamera.DeviceName);
                self.RTSPUrl(newcamera.RtspUrl);
                self.MacAddress = newcamera.MacAddress;
                self.IPAddress = newcamera.IPAddress;
                self.Username(devicecapabilityinfo.DefaultCameraCredential.UserName);
                self.Password(devicecapabilityinfo.DefaultCameraCredential.Password);
                isdiscoveredcameraselected = true;
            }
        });
        self.SelectedResolution.subscribe(function (newval) {
            isdisableupdatemaxbitrate = true;
            RefillFPS(newval);
            RefillQuality(newval);
            RefillMaxPreEvent();
            isdisableupdatemaxbitrate = false;
            updatemaxduration(function () {
                updatedevicecapability();
            });
        });
        self.SelectedFPS.subscribe(function (newval) {
            if (self.IsIPCamera()) {
                updatemaxduration(function () {
                    updatedevicecapability();
                });
            }
            else {
                updatedevicecapability();
            }
        });
        self.SelectedQuality.subscribe(function (newval) {
            if (self.IsIPCamera()) {
                updatemaxduration(function () {
                    updatedevicecapability();
                });
            }
            else {
                updatedevicecapability();
            }
        });
        self.SelectedRecFPS.subscribe(function (newval) {
            updatemaxduration(function () {
                updatedevicecapability();
            });
        });
        self.SelectedRecQuality.subscribe(function (newval) {
            updatemaxduration(function () {
                updatedevicecapability();
            });
        });
        self.SelectedPreEvent.subscribe(function (newval) {
            if (newval == undefined || newval == null) {
                return;
            }

            var newmaxpostevnt = parseInt(self.MaxBitrateDuration()) - parseInt(newval);
            if (newmaxpostevnt < 0) {
                newmaxpostevnt = 0;
            }
            self.MaxOffsitePostEvent(newmaxpostevnt);

            updatedevicecapability();
            //});
        });
        self.MaxOffsitePostEvent.subscribe(function (newval) {
            if (iscamerasettinginitialised) {
                if (newval >= 0 && self.SelectedOffsitePostEvent() > 0 && newval < self.SelectedOffsitePostEvent()) {
                    self.SelectedOffsitePostEvent(newval);
                }
            }
        });
        self.MaxPreEvent.subscribe(function (newval) {
            if (iscamerasettinginitialised) {
                if (newval >= 0 && self.SelectedPreEvent() > 0 && newval < self.SelectedPreEvent()) {
                    self.SelectedPreEvent(newval);
                }
            }
        });
        self.MaxBitrateDuration.subscribe(function (newval) {
            var newmaxpostevnt = newval - parseInt(self.SelectedPreEvent());
            if (newmaxpostevnt < 0) {
                newmaxpostevnt = 0;
            }
            self.MaxOffsitePostEvent(newmaxpostevnt);
        });

        self.InitialiseStreamentities = function (newstreamentities) {
            iscamerastreaminitialised = false;
            self.streamentities(newstreamentities);
            if (self.IsIPCamera()) {
                var streamentity = $(newstreamentities).filter(function () {
                    if (this.model() == data.CameraModel)
                        return this;
                })
                if (streamentity != undefined && streamentity.length > 0) {
                    self.SelectedModel(streamentity[0]);
                }
            }
            else if (self.IsAnalog()) {
                if (newstreamentities != undefined && newstreamentities.length > 0)
                    self.SelectedModel(newstreamentities[0]);
            }

            if (self.SelectedModel()) {
                ClearStreamerDetails();
                datacontext.getstreamerdetail(self.SelectedModel().id).done(function (jsondata) {
                    if (jsondata.Success) {
                        self.SelectedModel().Initialise(jsondata.data);
                        FillStreamerDetails(self.SelectedModel());
                        window.mpcacamerasetting.uicontext.showloading(false);
                    }
                }).error(function () {
                });
            }
            iscamerastreaminitialised = true;
        };
        self.InitialiseAssociatedDevices = function (data) {
            self.deviceentities([]);
            if (!IsDirtyAssociatedDevices) {
                var newdeviceentities = $.map(data, function (device) {
                    var devItem = new datacontext.deviceEntity(device);
                    _tempAssociatedDevices.push(devItem);
                    _orgAssociatedDevices.push(devItem);
                    return devItem;
                });
                self.deviceentities(newdeviceentities);
            }
            else {
                var newdeviceentities = $.map(_tempAssociatedDevices, function (device) {
                    return device;
                });
                self.deviceentities(newdeviceentities);
            }
            self.currentassociationcount(self.deviceentities().length);
            return self.deviceentities();
        };
        self.adddeviceitem = function (newdeviceentity) {
            self.deviceentities.push(newdeviceentity);
            IsDirtyAssociatedDevices = true;
            $.publish(common.events.filterontreenodedropped, newdeviceentity);
        }
        self.removedeviceitem = function (data, event) {
            var context = ko.contextFor(event.target);
            self.deviceentities.remove(context.$data);
            IsDirtyAssociatedDevices = true;
            $.publish(common.events.removefilterfortreenode, context.$data);
        }
        self.camassociationsave = function () {
            _tempAssociatedDevices = self.deviceentities();
            self.deviceentities([]);
            self.currentassociationcount(_tempAssociatedDevices.length);
            window.mpcacamerasetting.uicontext.closecurrentDialog();
        }
        self.camassociationcancel = function () {
            self.deviceentities([]);
            window.mpcacamerasetting.uicontext.closecurrentDialog();
        }
        self.dosaveconfigure = function (callback) {
            var returnobject = null;
            var error = "";
            if (!self.IsActive()) {
                //Ignore all other values and just save Disable state
                returnobject = self;
            }
            else if (isnewlyaddedcamera && !isdiscoveredcameraselected && self.IsIPCamera()) {
                //this means no IP camera is selected from discovery while configuring IPCamera
                error = common.messages.enable_no_Ipcam_error;
            }
            else if (window.mpcacamerasetting.datacontext.currentcapabilitymodal.ActualValue() > 100) {
                error = common.messages.dev_cap_lmt_rchd;
            }
            else if (window.mpcacamerasetting.uicontext.validateform(common.constants.configtabs.Settings)) {
                setpasswordvalues();
                setvalues();
                returnobject = self;
            }

            if (callback) {
                callback(returnobject, error);
            }
        }
        self.updatesaveresult = function (success) {
            onsaveresetmodel(success);
        };
        self.showassociate = function (event, data) {
            window.mpcacamerasetting.uicontext.showassociatedialog();
        }
        self.SetFocus = function () {
        };
        self.IsCameraDisabled = function (val, isTempEnableDisable) {
            self.IsActive(!val);
            if (self.IsActive() && !isTempEnableDisable) {
                updatedevicecapability();
                if (iscamerasettinginitialised) {
                    FillAnalogSlots();
                }
            }
            if (!self.IsActive() && !isTempEnableDisable) {
                updatedevicecapability();
            }
        };
        self.dodiscover = function () {
            datacontext.getdiscovereddevices(function (issuccess, result) {
                if (issuccess) {
                    var cameras = $.map(result, function (disccamera) {
                        return new datacontext.discovermodel(disccamera);
                    });
                    self.discoveredcameras(cameras);
                }
            });
        };
        self.toJson = function () {
            return ko.toJSON(self);
        }

        function updatedevicecapability(isforceupdatecache) {
            if (iscamerasettinginitialised && iscamerastreaminitialised && isstreamerdetailsfilled
                && self.SelectedFPS() && self.SelectedRecFPS() && self.SelectedQuality() && self.SelectedRecQuality()) {
                var devcapparam = new datacontext.devcapabilityparam();
                devcapparam.isactivechannel = self.IsActive();
                devcapparam.channel = data.Address;
                devcapparam.frameratelive = parseInt(self.SelectedFPS().Key);
                devcapparam.qualitylive = self.SelectedQuality().Key;

                var recfps = self.SelectedRecFPS().Key;
                var recquality = self.SelectedRecQuality().Key;
                if (self.IsIPCamera()) {
                    if (!self.SelectedResolution())
                        return;
                    recfps = self.SelectedFPS().Key;
                    recquality = self.SelectedQuality().Key;
                    devcapparam.resolution = self.SelectedResolution().Key;
                }
                devcapparam.frameraterecord = parseInt(recfps);
                devcapparam.qualityrecord = recquality;
                devcapparam.preeventduration = parseInt(self.SelectedPreEvent());

                if (isforceupdatecache) {
                    datacontext.updatecapabilitycache(devcapparam);
                }
                else {
                    datacontext.updatecapabilityprogress(devcapparam);
                }
            }
        }
        function updatemaxduration(callback) {
            if (!isdisableupdatemaxbitrate && iscamerasettinginitialised && iscamerastreaminitialised && isstreamerdetailsfilled
                && self.SelectedFPS() && self.SelectedRecFPS() && self.SelectedQuality() && self.SelectedRecQuality()) {
                var devcapparam = new datacontext.devcapabilityparam();
                devcapparam.isactivechannel = self.IsActive();
                devcapparam.channel = data.Address;
                devcapparam.frameratelive = parseInt(self.SelectedFPS().Key);
                devcapparam.qualitylive = self.SelectedQuality().Key;

                var recfps = self.SelectedRecFPS().Key;
                var recquality = self.SelectedRecQuality().Key;
                if (self.IsIPCamera()) {
                    if (!self.SelectedResolution())
                        return;
                    recfps = self.SelectedFPS().Key;
                    recquality = self.SelectedQuality().Key;
                    devcapparam.resolution = self.SelectedResolution().Key;
                }
                devcapparam.frameraterecord = parseInt(recfps);
                devcapparam.qualityrecord = recquality;
                devcapparam.preeventduration = parseInt(self.SelectedPreEvent());

                datacontext.getmaxbitrateduration(devcapparam, function (maxduration) {
                    if (maxduration != self.MaxBitrateDuration()) {
                        iscamerachanged = false;
                        self.MaxBitrateDuration(maxduration);
                    }
                    else if (iscamerachanged) {
                        iscamerachanged = false;
                        var newmaxpostevnt = self.MaxBitrateDuration() - parseInt(self.SelectedPreEvent());
                        if (newmaxpostevnt < 0) {
                            newmaxpostevnt = 0;
                        }
                        self.MaxOffsitePostEvent(newmaxpostevnt);
                    }
                    if (callback)
                        callback();
                });
            }
        }
        function RefillFPS(newres) {
            if (iscamerasettinginitialised && iscamerastreaminitialised && isstreamerdetailsfilled) {
                var model = self.SelectedModel();
                self.fpsvalues($(model.fpsvalues).filter(function () {
                    if (newres) {
                        if (newres.Key.toLowerCase() == common.filters.resolutionFilters1080p.Resolution.toLowerCase()) {
                            if (parseInt(this.Key) <= parseInt(common.filters.resolutionFilters1080p.MaxFPSLimit)) {
                                return this;
                            }
                        }
                        else {
                            return this;
                        }
                    }
                    else {
                        return this;
                    }
                }));

                var maxFps = null;
                self.fpsvalues().each(function (index, item) {
                    if (maxFps == undefined) {
                        maxFps = item;
                    }
                    else if (parseInt(item.Key) > parseInt(maxFps.Key)) {
                        maxFps = item;
                    }
                });
                if (maxFps)
                    self.SelectedFPS(maxFps);
            }
        }
        function RefillQuality(newres) {
            if (iscamerasettinginitialised && iscamerastreaminitialised && isstreamerdetailsfilled) {
                var model = self.SelectedModel();
                self.qualityvalues($(model.qualityvalues).filter(function () {
                    if (newres) {
                        if (newres.Key.toLowerCase() == common.filters.resolutionFilters1080p.Resolution.toLowerCase()) {
                            if (this.Key.toLowerCase() == common.filters.resolutionFilters1080p.QualityValue.toLowerCase()) {
                                return this;
                            }
                        }
                        else {
                            return this;
                        }
                    }
                    else {
                        return this;
                    }
                }));

                if (self.qualityvalues().length > 0)
                    self.SelectedQuality(self.qualityvalues()[0]);
            }
        }
        function RefillMaxPreEvent() {
            if (isstreamerdetailsfilled && self.SelectedResolution()) { //iscamerasettinginitialised && iscamerastreaminitialised && isstreamerdetailsfilled) {
                var isnoncif = false;
                $.each(common.filters.resolutionFiltersNonCIF.Resolutions, function (index, res) {
                    if (self.SelectedResolution().Key.toLowerCase() == res.toLowerCase()) {
                        if (self.MaxPreEvent() > common.filters.resolutionFiltersNonCIF.MaxPreEvent) {
                            self.MaxPreEvent(common.filters.resolutionFiltersNonCIF.MaxPreEvent);
                        }
                        isnoncif = true;
                        return;
                    }
                });
                if (!isnoncif) {
                    self.MaxPreEvent(devicecapabilityinfo.RecordingClipDuration.MaxPreEvent);
                }
            }
        }
        function FillStreamerDetails(newmodel) {
            isstreamerdetailsfilled = false;
            //For Live
            self.resolutionvalues(newmodel.resolutionvalues);
            if (data.Resolution) {
                var resolution = $(newmodel.resolutionvalues).filter(function () {
                    if (this.Key.toLowerCase() == data.Resolution.toLowerCase())
                        return this;
                });
                if (resolution != undefined && resolution.length > 0)
                    self.SelectedResolution(resolution[0]);
            }

            self.fpsvalues($(newmodel.fpsvalues).filter(function () {
                if (self.SelectedResolution()) {
                    if (self.SelectedResolution().Key.toLowerCase() == common.filters.resolutionFilters1080p.Resolution.toLowerCase()) {
                        if (parseInt(this.Key) <= parseInt(common.filters.resolutionFilters1080p.MaxFPSLimit)) {
                            return this;
                        }
                    }
                    else {
                        return this;
                    }
                }
                else {
                    return this;
                }
            }));
            if (data.FPS) {
                var fps = $(self.fpsvalues()).filter(function () {
                    if (this.Key.toLowerCase() == data.FPS.toLowerCase()) {
                        return this;
                    }
                });
                if (fps != undefined && fps.length > 0)
                    self.SelectedFPS(fps[0]);
            }

            self.qualityvalues($(newmodel.qualityvalues).filter(function () {
                if (self.SelectedResolution()) {
                    if (self.SelectedResolution().Key.toLowerCase() == common.filters.resolutionFilters1080p.Resolution.toLowerCase()) {
                        if (this.Key.toLowerCase() == common.filters.resolutionFilters1080p.QualityValue.toLowerCase()) {
                            return this;
                        }
                    }
                    else {
                        return this;
                    }
                }
                else {
                    return this;
                }
            }));
            if (data.Quality) {
                var quality = $(self.qualityvalues()).filter(function () {
                    if (this.Key.toLowerCase() == data.Quality.toLowerCase())
                        return this;
                });
                if (quality != undefined && quality.length > 0)
                    self.SelectedQuality(quality[0]);
            }

            //For Recording
            self.recfpsvalues(newmodel.recfpsvalues);
            if (data.RecordingFPS) {
                var recfps = $(newmodel.recfpsvalues).filter(function () {
                    if (this.Key.toLowerCase() == data.RecordingFPS.toLowerCase())
                        return this;
                });
                if (recfps != undefined && recfps.length > 0)
                    self.SelectedRecFPS(recfps[0]);
            }

            self.recqualityvalues(newmodel.recqualityvalues);
            if (data.RecordingQuality) {
                var recquality = $(newmodel.recqualityvalues).filter(function () {
                    if (this.Key.toLowerCase() == data.RecordingQuality.toLowerCase())
                        return this;
                });
                if (recquality != undefined && recquality.length > 0)
                    self.SelectedRecQuality(recquality[0]);
            }

            isstreamerdetailsfilled = true;
            RefillMaxPreEvent();
            updatemaxduration(function () {
                updatedevicecapability();
            });
        }
        function FillAnalogSlots(callback) {            
            window.mpcacamerasetting.uicontext.showloading(true);
            datacontext.getdevicecapabilityinfo(function (capdata) {
                if (capdata != undefined) {
                    if (capdata.AnalogSlots != undefined && capdata.AnalogSlots.length > 0) {
                        datacontext.getusedanalogslots(self.Id, function (usedslots) {
                            var freeslots = $(capdata.AnalogSlots).filter(function () {
                                var isused = _.contains(usedslots, this.Key);
                                if (!isused) {
                                    return this;
                                }
                            });
                            self.analogslots(freeslots);
                            var analoginput = $(self.analogslots()).filter(function () {
                                if (this.Key == data.AnalogInput)
                                    return this;
                            });
                            if (analoginput != undefined && analoginput.length > 0)
                                self.SelectedAnalogSlot(analoginput[0]);

                            window.mpcacamerasetting.uicontext.showloading(false);

                            if (callback)
                                callback();
                        });
                    }
                }
            });
        }
        function ClearModelDetails() {
            self.SelectedModel();
            self.streamentities([]);
            ClearStreamerDetails();
        }
        function ClearStreamerDetails() {
            self.SelectedFPS();
            self.fpsvalues([]);
            self.SelectedResolution();
            self.resolutionvalues([]);
            self.SelectedQuality();
            self.qualityvalues([]);
            self.SelectedRecFPS();
            self.recfpsvalues([]);
            self.SelectedRecQuality();
            self.recqualityvalues([]);
        }
        function onsaveresetmodel(success) {
            if (success) {
                IsDirtyAssociatedDevices = false;
                isnewlyaddedcamera = false;
                _tempAssociatedDevices = [];
                _orgAssociatedDevices = [];
                updatedevicecapability(true);
            }
        }
        function setpasswordvalues() {
            if (defaultMask != self.PasswordField())
                self.Password(self.PasswordField());
        }
        function setvalues() {
            self.CameraModel = self.SelectedModel().model();
            if (self.SelectedFPS())
                self.FPS = self.SelectedFPS().Key;
            if (self.SelectedResolution())
                self.Resolution = self.SelectedResolution().Key;
            if (self.SelectedQuality())
                self.Quality = self.SelectedQuality().Key;
            if (self.SelectedRecFPS())
                self.RecordingFPS = self.SelectedRecFPS().Key;
            if (self.SelectedRecQuality())
                self.RecordingQuality = self.SelectedRecQuality().Key;
            if (self.SelectedAnalogSlot())
                self.AnalogInput = self.SelectedAnalogSlot().Key;
            self.PreEvent = self.SelectedPreEvent();
            self.OnsitePostEvent = self.SelectedOnsitePostEvent();
            self.OffsitePostEvent = self.SelectedOffsitePostEvent();
            self.CameraType = self.SelectedCameraType().Key;
            //self.IsActive(data.IsActive);
            self.DeviceType = data.DeviceType;
            self.Description = data.Description;
            self.Address = data.Address;
            self.SourceNumber = data.SourceNumber;
            self.DeviceSignalType = data.DeviceSignalType;
            self.TimezoneId = data.TimezoneId;
            self.AltCameraNumber = data.AltCameraNumber;

            self.AssociatedDevices = [];
            self.DisassociatedDevices = [];
            if (_orgAssociatedDevices != undefined) { //This means association dialog is openned atleast once
                if (_tempAssociatedDevices == undefined || _tempAssociatedDevices.length == 0) { //Everything is removed
                    for (var i = 0; i < _orgAssociatedDevices.length; i++) {
                        self.DisassociatedDevices.push(_orgAssociatedDevices[i]);
                    }
                }
                else {
                    for (var i = 0; i < _orgAssociatedDevices.length; i++) {
                        var isexists = false;
                        for (var j = 0; j < _tempAssociatedDevices.length; j++) {
                            if (_orgAssociatedDevices[i].Id().toLowerCase() == _tempAssociatedDevices[j].Id().toLowerCase())
                                isexists = true;
                        }
                        if (!isexists)
                            self.DisassociatedDevices.push(_orgAssociatedDevices[i]);
                    }
                    for (var i = 0; i < _tempAssociatedDevices.length; i++) {
                        var isexists = false;
                        for (var j = 0; j < _orgAssociatedDevices.length; j++) {
                            if (_tempAssociatedDevices[i].Id().toLowerCase() == _orgAssociatedDevices[j].Id().toLowerCase())
                                isexists = true;
                        }
                        if (!isexists)
                            self.AssociatedDevices.push(_tempAssociatedDevices[i]);
                    }
                }
            }
        }

        self.dofinalvalidate = function () {
            var errmsg = "";
            if (!self.IsActive()) {
                return errmsg;
            }

            //Check for postevent-trigger-motionsettings configuration
            if (self.SelectedOffsitePostEvent() > 0 || self.SelectedOnsitePostEvent() > 0) {
                if ((self.EventRecordings == undefined || self.EventRecordings.length <= 0)
                    && (self.MotionDetectionSetting == undefined || !self.MotionDetectionSetting.IsEnabled)) {
                    errmsg = common.messages.no_trg_motn_cnf;
                }
            }
            else {
                if (self.EventRecordings && self.EventRecordings.length > 0) {
                    errmsg = common.messages.no_post_evnt_trg_cnf;
                }
                else if (self.MotionDetectionSetting && self.MotionDetectionSetting.IsEnabled) {
                    errmsg = common.messages.no_post_evnt_motn_cnf;
                }
            }
            return errmsg;
        };
        self.Initialise = function (newdata) {
            window.mpcacamerasetting.uicontext.showloading(true);
            iscamerachanged = true;
            iscamerasettinginitialised = false;
            isnewlyaddedcamera = true;
            isdiscoveredcameraselected = false;
            data = newdata;
            self.Id = data.Id;
            self.ParentId = data.ParentId;
            self.Name(data.Name);
            self.IsActive(data.IsActive);
            self.RTSPUrl(data.RTSPUrl);
            self.Username(data.Username);
            self.Password(data.Password);
            self.MacAddress = data.MacAddress;
            self.IPAddress = data.IPAddress;
            self.SelectedPreEvent(data.PreEvent);
            self.SelectedOnsitePostEvent(data.OnsitePostEvent);
            self.SelectedOffsitePostEvent(data.OffsitePostEvent);
            IsDirtyAssociatedDevices = false;
            _tempAssociatedDevices = [];
            _orgAssociatedDevices = [];
            self.currentassociationcount(0);
            self.deviceentities([]);
            datacontext.getassociateddevices(self, true, function (associateddevices) {
                if (associateddevices) {
                    self.currentassociationcount(associateddevices.length);
                }
                datacontext.getdevicecapabilityinfo(function (capdata) {
                    if (capdata != undefined) {
                        devicecapabilityinfo = capdata;
                        if (capdata.RecordingClipDuration != undefined) {
                            self.MinPreEvent(capdata.RecordingClipDuration.MinPreEvent);
                            self.MaxPreEvent(capdata.RecordingClipDuration.MaxPreEvent);
                            self.MinOnsitePostEvent(capdata.RecordingClipDuration.MinOnsitePostEvent);
                            self.MaxOnsitePostEvent(capdata.RecordingClipDuration.MaxOnsitePostEvent);
                            self.MinOffsitePostEvent(capdata.RecordingClipDuration.MinOffsitePostEvent);
                            self.MaxOffsitePostEvent(capdata.RecordingClipDuration.MaxOffsitePostEvent);
                        }
                        if (capdata.CameraTypes != undefined && capdata.CameraTypes.length > 0) {
                            self.cameratypevalues(capdata.CameraTypes);
                            var cameratype = $(self.cameratypevalues()).filter(function () {
                                if (this.Key == data.CameraType)
                                    return this;
                            });
                            if (cameratype != undefined && cameratype.length > 0) {
                                self.SelectedCameraType(cameratype[0]);
                                if (eventcallback) {
                                    eventcallback(common.events.oncameratypechanged, cameratype[0].Key);
                                }
                            }
                        }

                        FillAnalogSlots(function () {
                            ClearModelDetails();
                            datacontext.getstreamers(self);

                            if (data.IsActive)
                                isnewlyaddedcamera = false;

                            iscamerasettinginitialised = true;
                        });
                    }
                });
            });
        }
    }
    datacontext.Cameramodel = CamerasettingEntity;
})(ko, window.mpcacamerasetting.datacontext, window.mpcacamerasetting.common);