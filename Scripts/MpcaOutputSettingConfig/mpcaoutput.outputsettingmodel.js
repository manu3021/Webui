/// <reference path="mpcaoutput.outputsettingmodel.js" />
/// <reference path="mpcaouput.datacontext.js" />
/// <reference path="mpcaoutput.common.js" />
/// <reference path="mpcaoutput.uicontext.js" />
window.mpcaoutput = window.mpcaoutput || {};
window.mpcaoutput.outputsettingmodel = (function (ko, common, datacontext, uicontext) {
    var FeatureModel = function (name, value, index) {
        var self = this;
        self.FeatureName = name;
        self.FeatureValue = value;
        self.RepeatIndex = index;
    }
    var VMDResultmodel = function (Id, Name, IsEnabled) {
        var self = this;
        self.Id = ko.observable(Id);
        self.Name = ko.observable(Name);
        self.IsEnabled = ko.observable(IsEnabled);
        self.toJson = function () {
            return ko.toJSON(self);
        }
    }
    var VMDViewmodel = function (updatecountcallback) {
        var self = this;
        var updatecntclbk = updatecountcallback;
        self.IsInitialised = false;
        self.Cameras = ko.observableArray([]);
        self.VMDCameraFeatures = [];
        self.AddVMDInfo = function (result) {
            if (!self.IsInitialised) {
                self.Cameras([]);
                if (result == undefined || result == null)
                    return;
                var cameraResultmodel = $.map(result, function (cam) {
                    var isselected = false;
                    $.each(self.VMDCameraFeatures, function (index, feature) {
                        if (feature.FeatureValue == cam.Id) {
                            isselected = true;
                        }
                    });
                    return new VMDResultmodel(cam.Id, cam.Name, isselected);
                });
                self.Cameras(cameraResultmodel);
                self.IsInitialised = true;
            }
        }
        self.doVMDSettingDone = function () {
            if (updatecntclbk) {
                var count = 0;
                $.each(self.Cameras(), function (index, item) {
                    if (item.IsEnabled()) {
                        count++;
                    }
                });
                updatecntclbk(count);
            }
            window.mpcaoutput.uicontext.HideVMDpopover();
        }
        self.toJson = function () {
            return ko.toJSON(self);
        }
    }
    var TriggerResult = function (Id, Name, IsEnabled) {
        var self = this;
        self.Id = ko.observable(Id);
        self.Name = ko.observable(Name);
        self.IsEnabled = ko.observable(IsEnabled);
        self.toJson = function () {
            return ko.toJSON(self);
        }
    }
    var Triggermodel = function (updatecountcallback) {
        var self = this;
        var updatecntclbk = updatecountcallback;
        self.IsInitialised = false;
        self.Triggers = ko.observableArray([]);
        self.TriggerFeatures = [];
        self.AddTriggerInfo = function (result) {
            if (!self.IsInitialised) {
                self.Triggers([]);
                if (result == undefined || result == null)
                    return;
                var TriggerResultmodel = $.map(result, function (trgr) {
                    var isselected = false;
                    $.each(self.TriggerFeatures, function (index, feature) {
                        if (feature.FeatureValue == trgr.Id) {
                            isselected = true;
                        }
                    });
                    return new TriggerResult(trgr.Id, trgr.Name, isselected);
                });
                self.Triggers(TriggerResultmodel);
                self.IsInitialised = true;
            }
        }
        self.doTriggerSettingDone = function () {
            if (updatecntclbk) {
                var count = 0;
                $.each(self.Triggers(), function (index, item) {
                    if (item.IsEnabled()) {
                        count++;
                    }
                });
                updatecntclbk(count);
            }
            window.mpcaoutput.uicontext.HideTriggerpopover();
        }
        self.toJson = function () {
            return ko.toJSON(self);
        }
    }
    var OutputsettingResults = function (data) {
        var self = this;
        var isinitialized = false;
        self.LabelName = ko.observable(common.messages.outputlabel + data.Address);
        self.Id = ko.observable(data.Id);
        self.ParentId = ko.observable(data.ParentId);
        self.Name = ko.observable(data.Name);
        self.Address = ko.observable(data.Address);
        self.Features = [];
        self.PulseTime = { Sec: 0 };
        self.IsActive = false;
        self.NCNOval = ko.observable(0);
        self.TriggerNum = ko.observable(0);
        self.updatetriggercount = function (count) {
            if (count != undefined) {
                self.TriggerNum(count);
            }
        };
        self.showerror = function () {
            window.mpcaoutput.uicontext.showError();
        }
        self.hideerror = function () {
            window.mpcaoutput.uicontext.hideError();
        }
        self.TriggerModel = ko.observable(new Triggermodel(self.updatetriggercount));
        self.VMDnum = ko.observable(0);
        self.updatevmdcameracount = function (count) {
            if (count != undefined) {
                self.VMDnum(count);
            }
        };
        self.VMDmodel = ko.observable(new VMDViewmodel(self.updatevmdcameracount));
        self.Durations = ko.observableArray([]);
        self.SelectedDuration = ko.observable();
        self.Activatedeactivateval = ko.observable(0);
        self.enabledisableval = ko.observable(data.IsActive ? 1 : 0);
        self.IsError = ko.observable(false);
        self.Errormessage = ko.observable("");
        self.Activatedeactivateval.subscribe(function (newval) {
            if (isinitialized) {
                var context = ko.contextFor(document.getElementById('ActivateDeactivebtn'));
                if ((context != null) && (context != undefined)) {
                    var viewmodel = context.$data;
                    var recorderId = context.$data.ParentId();
                    var currentstate = newval == 1 ? true : false;
                    var address = self.Address();
                    window.mpcaoutput.datacontext.ActivateOutput(recorderId, currentstate, address).done(function (jsondata) {
                        var result = jsondata;
                        if (jsondata == false) {
                            alertify.error(common.messages.output_act_fail);
                        }
                        else {
                            alertify.success(common.messages.output_activated);
                        }
                    });
                }
            }
        });
        self.enabledisableval.subscribe(function (newval) {
            self.IsActive = newval == "1" ? true : false;
        });

        self.toJson = function () {
            var ncnoValue = self.NCNOval() == 1 ? common.constants.outputlevel.NC : common.constants.outputlevel.NO;
            var featureoOutputEntitylst = [];
            featureoOutputEntitylst.push(new FeatureModel(common.constants.feature.OutputLevel, ncnoValue, 0));
            if (self.TriggerModel().IsInitialised) {
                var tIndex = 0;
                $.each(self.TriggerModel().Triggers(), function (index, item) {
                    if (item.IsEnabled()) {
                        featureoOutputEntitylst.push(new FeatureModel(common.constants.feature.TriggerId, item.Id(), tIndex++));
                    }
                });
            }
            else {
                //User never opened the popup-dialog, so add existing features as it is
                $.each(self.TriggerModel().TriggerFeatures, function (index, item) {
                    featureoOutputEntitylst.push(item);
                });
            }

            if (self.VMDmodel().IsInitialised) {
                var tIndex = 0;
                $.each(self.VMDmodel().Cameras(), function (index, item) {
                    if (item.IsEnabled()) {
                        featureoOutputEntitylst.push(new FeatureModel(common.constants.feature.CameraId, item.Id(), tIndex++));
                    }
                });
            }
            else {
                //User never opened the popup-dialog, so add existing features as it is
                $.each(self.VMDmodel().VMDCameraFeatures, function (index, item) {
                    featureoOutputEntitylst.push(item);
                });
            }

            self.Features = featureoOutputEntitylst;
            self.PulseTime.Sec = self.SelectedDuration().Value;
        }
        self.showTriggerpopover = function (data, event) {
            var currentPopoverTarget = event.currentTarget
            var currentmodel = ko.contextFor(currentPopoverTarget)
            window.mpcaoutput.uicontext.showTriggerpopover(currentmodel, currentPopoverTarget);
        }
        self.showVMDpopover = function (data, event) {
            var currentPopoverTarget = event.currentTarget
            var currentmodel = ko.contextFor(currentPopoverTarget)
            window.mpcaoutput.uicontext.showVMDpopover(currentmodel, currentPopoverTarget);
        }

        var isdurationinitialised = false;
        function Getduration() {
            var durations = [];
            if (!isdurationinitialised) {
                for (var i = 1; i <= 10; i++) {
                    durations.push({ Key: i, Value: i });
                }
                isdurationinitialised = true;
            }
            return durations;
        }

        self.InitialiseComplete = function () {
            isinitialized = true;
        }

        function Init() {
            var triggers = [];
            var vmdcameras = [];
            var durts = Getduration();
            self.Durations(durts);
            $.each(data.Features, function (index, item) {
                if (item.FeatureName == common.constants.feature.TriggerId) {
                    triggers.push(item);
                }
                else if (item.FeatureName == common.constants.feature.CameraId) {
                    vmdcameras.push(item);
                }
                else if (item.FeatureName == common.constants.feature.OutputLevel) {
                    self.NCNOval(item.FeatureValue.toUpperCase() == common.constants.outputlevel.NC ? 1 : 0);
                }
            });
            self.TriggerNum(triggers.length);
            self.VMDnum(vmdcameras.length);
            self.TriggerModel().TriggerFeatures = triggers;
            self.VMDmodel().VMDCameraFeatures = vmdcameras;
            $.each(self.Durations(), function (index, item) {
                if (item.Key == data.PulseTime.Sec) {
                    self.SelectedDuration(item);
                }
            });

        }
        Init();
    }
    var Outputsetting = function () {
        var self = this;
        var outputresultviewmodel = null;


        self.dosavesettings = function (event, data) {
            var isvalid = true;
            window.mpcaoutput.uicontext.hideError();
            $.each(self.Outputsettings(), function (index, item) {
                if ($.trim(item.Name()) == "") {
                    item.IsError(true);
                    item.Errormessage(common.messages.output_pls_ent_nam);
                    isvalid = false;
                    window.mpcainput.uicontext.showError();
                    return;
                }
                if ($.trim(item.Name().length) > 30) {
                    item.IsError(true);
                    item.Errormessage(common.messages.output_opnam_cnt_grt);
                    isvalid = false;
                    window.mpcainput.uicontext.showError();
                    return;
                }
                item.IsError(false);
                item.Errormessage("");


            });
            if (isvalid) {
                window.mpcaoutput.datacontext.saveoutputdetail(self.toJson(), function (successresult) {
                    var msg = window.mpcaoutput.common.messages.output_save_success;
                    if (successresult.recorderstatus && successresult.recorderstatus.toLowerCase() != common.constants.recorderstatus.ONLINE.toLowerCase()) {
                        msg += "." + window.mpcaoutput.common.messages.devoffline_cnfgdwnOnOnl;
                    }
                    alertify.success(msg);
                }, function (errorresult) {
                    alertify.error(errorresult.error);
                });
            }
        }
        self.Outputsettings = ko.observableArray([]);
        self.AddOutputInfo = function (OutputInfo) {
            try {
                var outputs = $.map(OutputInfo, function (data) {
                    return new OutputsettingResults(data);
                });
                self.Outputsettings(outputs);
            } catch (e) {
                console.error("Output Setting Add Output Error", e.message);
            }
        }
        self.InitialiseComplete = function () {
            $.each(self.Outputsettings(), function (index, item) {
                item.InitialiseComplete();
            });
        }
        self.toJson = function () {
            $.each(self.Outputsettings(), function (index, item) {
                item.toJson();
            });
            return ko.toJSON(self.Outputsettings());
        }
    }

    window.mpcaoutput.datacontext.Outputsetting = Outputsetting;
    window.mpcaoutput.datacontext.Triggermodel = Triggermodel;
    window.mpcaoutput.datacontext.VMDViewmodel = VMDViewmodel;

})(ko, window.mpcaoutput.common, window.mpcaoutput.datacontext, window.mpcaoutput.uicontext);

