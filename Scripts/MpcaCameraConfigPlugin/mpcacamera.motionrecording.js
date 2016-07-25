/// <reference path="mpcacamera.common.js" />
window.mpcacamerasetting.motionrecordingmodel = (function (ko, datacontext, common) {
    var regionEntity = function (label, pmodel) {
        var self = this;
        var data = {};
        var parentmodel = pmodel;
        self.Label = label;
        self.onofftoggle = ko.observable(0);
        self.IsEnabled = ko.observable(false);
        //self.IsEnabled.subscribe(function (newval) {
        //    SetEnableFlag(newval);
        //});
        self.onofftoggle.subscribe(function(newval){
            if (newval == "1") {
                SetEnableFlag(true, true);
            }
            else {
                SetEnableFlag(false, true);
            }
        });
        self.Name = "Region" + label;
        self.LocalMask = 0;
        self.RectX1 = 0;
        self.RectY1 = 0;
        self.RectX2 = 0;
        self.RectY2 = 0;
        self.LocalMaskLength = 0;
        self.Sensitivity = 1;
        self.SelectedSensitivity = ko.observable(1);
        self.SelectedSensitivity.subscribe(function (newval) {
            self.Sensitivity = newval;
        });
        self.onselectregion = function (data, event) {
            $(event.currentTarget).removeClass('icon_edit_selected');//.addClass('icon_edit')
            if (!self.IsEnabled()) {
                return;
            }
            var index = parseInt(self.Label);
            $(event.currentTarget).addClass('icon_edit_selected');
            parentmodel.selectregion(index);
        };
        self.Reset = function () {
            self.Name = "Region" + label;
            self.LocalMask = 0;
            self.RectX1 = 0;
            self.RectY1 = 0;
            self.RectX2 = 0;
            self.RectY2 = 0;
            self.LocalMaskLength = 0;
            self.SelectedSensitivity(1);
            self.onofftoggle(0);
        };
        self.Initialise = function (initdata) {
            data = initdata;
            self.Label = data.Label;
            self.Name = data.Name;
            self.LocalMask = data.LocalMask;
            self.RectX1 = data.RectX1;
            self.RectY1 = data.RectY1;
            self.RectX2 = data.RectX2;
            self.RectY2 = data.RectY2;
            self.LocalMaskLength = data.LocalMaskLength;
            if (data.Sensitivity == undefined || data.MinSensitivity == undefined || data.MaxSensitivity == undefined)
                self.SelectedSensitivity(1);
            else if (data.Sensitivity < data.MinSensitivity)
                self.SelectedSensitivity(data.MinSensitivity);
            else if (data.Sensitivity > data.MaxSensitivity)
                self.SelectedSensitivity(data.MaxSensitivity);
            else
                self.SelectedSensitivity(data.Sensitivity);
            self.onofftoggle(data.IsEnabled ? 1 : 0);
        };
        function SetEnableFlag(val, isupdateprop) {
            if (isupdateprop) {
                self.IsEnabled(val);
            }
            if (!self.IsEnabled()) {
                self.SelectedSensitivity(1);
                $("#regionicon" + self.Label).addClass("disable");
                $("#regionicon" + self.Label).removeClass('icon_edit_selected');
            }
            else {
                $("#regionicon" + self.Label).removeClass("disable");
            }
            if (parentmodel) {
                parentmodel.redraw();
            }
        }
    }
    var MotionRecordingEntity = function () {
        var self = this;
        var data = data || {};
        var isinitialised = false;
        self.IsNumber = function (data, event) {
            var charCode = (event.which) ? event.which : event.keyCode
            if (charCode > 31 && (charCode < 48 || charCode > 57))
                return false;
            return true;
        }
        self.IsInRange = function (data, event) {
            if (self.SelectedHoldTime() > self.MaxHoldTime()) {
                self.SelectedHoldTime(self.MaxHoldTime());
            }
            if (!(self.SelectedHoldTime() && self.SelectedHoldTime() >= self.MinHoldTime())) {
                self.SelectedHoldTime(self.MinHoldTime());
            }
        }
        //-------------------------Motion region Start
        self.VMDPanelModel = ko.observable(new datacontext.panelmodel());

        self.VMDPanelModel().issuccess.subscribe(function (newval) {
            if (newval)
                self.showallcanvas();
            else
                self.hideallcanvas();
        });
        self.VMDPanelModel().isError.subscribe(function (newval) {
            if (newval)
                self.hideallcanvas()
            else {
                if (ismotionrecordinginitialised)
                    self.showallcanvas();
            }
        });
        self.regionColors = { 0: "#ff0000", 1: "#00ff00", 2: "#0000ff" }, currentNode = 0;

        self.getRandomColor = function (id) {
            if (id != undefined)
                return self.regionColors[id];
            else {
                return "#fff";
            }
        }
        self.context = null;
        self.canvas = null;
        self.Regions = ko.observableArray([]);

        self.tool = {
            tool: this,
            started: false,
            mousedown: function (ev) {
                if (self.selectedregion() == -1) {
                    alertify.error(Resources.mpcaCam_SelectARegion);
                    return;
                }
                strokeColor = self.getRandomColor(self.selectedregion());
                self.context.strokeStyle = strokeColor;
                self.tool.started = true;
                self.tool.x0 = ev._x;
                self.tool.y0 = ev._y;
            },

            mousemove: function (ev, cb) {

                if (!self.tool.started) {
                    return;
                }

                var x = Math.min(ev._x, self.tool.x0),
                    y = Math.min(ev._y, self.tool.y0),
                    w = Math.abs(ev._x - self.tool.x0),
                    h = Math.abs(ev._y - self.tool.y0);

                self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);

                if (!w || !h) {
                    return;
                }
                //   console.log('x:' + x + ' y:' + y + ' x1:' + w + ' y2' + h);
                self.context.strokeRect(x, y, w, h);
                if (cb)
                    cb(x, y, w, h);
            },

            mouseup: function (ev) {
                if (self.tool.started) {
                    self.tool.mousemove(ev, function (x, y, w, h) {
                        self.UpdateRegion(x, y, w, h);
                    });
                    self.tool.started = false;
                    // self.img_update();
                }
            }
        };
        self.selectedregion = ko.observable(-1);

        self.selectregion = function (index) {
            self.selectedregion(index);
            for (var i = 0; i <= 2; i++) {
                if (index != i) {
                    $("#regionicon" + i).removeClass('icon_edit_selected');
                }
            }
        }

        self.UpdateRegion = function (x, y, w, h) {
            var newregion = null;
            switch (self.selectedregion()) {
                case 0: {
                    newregion = self.redRegion();
                    break;
                }
                case 1: {
                    newregion = self.greenRegion();
                    break;
                }
                case 2: {
                    newregion = self.blueRegion();
                    break;
                }
                default:
            }
            if (newregion != null) {
                newregion.RectX1 = x;
                newregion.RectY1 = y;
                newregion.RectX2 = w;
                newregion.RectY2 = h;
            }
            self.redraw();
        }
        self.tool_default = 'rect';
        self.getcolor = function () {
            return "#fff";
        }
        self.init = function () {
            isinitialised = false;
            self.canvaso = document.getElementById('motionregioncanvas');
            if (self.canvaso) {
                if (!self.canvaso.getContext) {
                    console.log('Error: no canvas.getContext!');
                    return;
                }
                var strokeColor = self.getRandomColor();
                self.contexto = self.canvaso.getContext('2d');
                self.contexto.strokeStyle = strokeColor;
                if (!self.contexto) {
                    console.log('Error: failed to getContext!');
                    return;
                }
            }
            else {
                console.log('Error: I cannot find the canvas element!');
                return;
            }

            self.canvas = document.getElementById('vmdregioncanvas_draw');
            if (self.canvas) {
                self.context = self.canvas.getContext('2d');
                self.context.strokeStyle = strokeColor;
                self.canvas.addEventListener('mousedown', self.ev_canvas, false);
                self.canvas.addEventListener('mousemove', self.ev_canvas, false);
                self.canvas.addEventListener('mouseup', self.ev_canvas, false);
            }
            else {
                console.log('Error: I cannot find draw canvas element!');
                return;
            }
            self.hideallcanvas();
            self.redRegion().Reset();
            self.blueRegion().Reset();
            self.greenRegion().Reset();
            $('.motionRegion b').removeClass('icon_edit_selected').addClass('icon_edit');
            isinitialised = true;
        }
        self.ev_canvas = function (ev) {
            if (ev.layerX || ev.layerX == 0) { // Firefox
                ev._x = ev.layerX;
                ev._y = ev.layerY;
            } else if (ev.offsetX || ev.offsetX == 0) { // Opera
                ev._x = ev.offsetX;
                ev._y = ev.offsetY;
            }

            // Call the event handler of the tool.
            var func = self.tool[ev.type];
            if (func) {
                func(ev);
            }
        }
        self.draw = function (region) {
            var strokeColor = self.getRandomColor(parseInt(region.Label));
            self.contexto.strokeStyle = strokeColor;
            if (!region.IsEnabled()) {
                self.contexto.save();
                self.contexto.setLineDash([6]);
                self.contexto.strokeRect(region.RectX1, region.RectY1, region.RectX2, region.RectY2);
                self.contexto.setLineDash(self.context.getLineDash());
                self.contexto.restore();
            }
            else {
                self.contexto.strokeRect(region.RectX1, region.RectY1, region.RectX2, region.RectY2);
            }
        }
        // completes a drawing operation.
        self.redraw = function () {
            if (!isinitialised) {
                return;
            }
            self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);
            self.contexto.clearRect(0, 0, self.canvaso.width, self.canvaso.height);
            self.draw(self.redRegion());
            self.draw(self.greenRegion());
            self.draw(self.blueRegion());

        }
        self.hideallcanvas = function () {
            $('.regioncanvas').hide();
        }
        self.showallcanvas = function () {
            $('.regioncanvas').show();

            self.redraw();
        }

        //-------------------------Motion region End
        var ismotionrecordinginitialised = false;
        self.IsAnalog = ko.observable(false);
        self.IsMotionEnabled = ko.observable(false);
        self.MinHoldTime = ko.observable(-1);
        self.MaxHoldTime = ko.observable(-1);
        self.SelectedHoldTime = ko.observable(-1);
        self.MinSensitivity = ko.observable(-1);
        self.MaxSensitivity = ko.observable(-1);
        //self.SelectedSensitivity = ko.observable(-1);
        self.MotionRecordingSchedules = ko.observableArray([]);
        self.IsCameraDisabled = ko.observable(true);
        self.IsSmartVMDLimitReached = ko.observable(true);
        self.OtherSVMDCount = ko.observable(0);
        self.IsAnalog.subscribe(function (newval) {
            checksvmd(self.OtherSVMDCount());
        });
        self.IsMotionEnabled.subscribe(function (newval) {
            checksvmd(self.OtherSVMDCount());
        });
        self.OtherSVMDCount.subscribe(function (newcount) {
            checksvmd(newcount);
        });
        self.IsSmartVMDLimitReached.subscribe(function (newval) {
            if (newval && ismotionrecordinginitialised) {
                alertify.error(common.messages.svmd_lmt_rchd);
            }
        });
        function checksvmd(newcount) {
            if (self.IsAnalog() && self.IsMotionEnabled()) {
                if ((self.redRegion && self.redRegion().IsEnabled()) || (self.greenRegion && self.greenRegion().IsEnabled())
                    || (self.blueRegion && self.blueRegion().IsEnabled())) {
                    if (newcount + 1 > common.constants.analogsmartvmdmaxcount) {
                        self.IsSmartVMDLimitReached(true);
                        return;
                    }
                }
                else {
                    if (newcount >= common.constants.analogsmartvmdmaxcount) {
                        self.IsSmartVMDLimitReached(true);
                        return;
                    }
                }
            }
            self.IsSmartVMDLimitReached(false);
        }
        self.IsVMDRegionApplicable = ko.computed(function () {
            if (self.IsAnalog() && self.IsMotionEnabled() && !self.IsSmartVMDLimitReached()) {
                return true;
            }
            return false;
        });
        self.FireEvent = function (event, data) {
            if (event == common.events.oncameratypechanged) {
                if (data && data.toLowerCase() == common.constants.cameratypes.AnalogCamera.toLowerCase()) {
                    self.IsAnalog(true);
                    SetOtherSVMDCount();
                }
                else {
                    self.IsAnalog(false);
                }
            }
        }
        self.Initialise = function (newdata) {

            ismotionrecordinginitialised = false;
            data = newdata;
            self.MotionRecordingSchedules([]);
            if (data && data.CameraType.toLowerCase() == common.constants.cameratypes.AnalogCamera.toLowerCase()) {
                self.IsAnalog(true);
            }
            else {
                self.IsAnalog(false);
            }
            if (data.MotionDetectionSetting && data.MotionDetectionSetting.IsEnabled) {
                self.IsMotionEnabled(true);
            }
            else {
                self.IsMotionEnabled(false);
            }
            self.MinHoldTime(-1);
            self.MaxHoldTime(-1);
            self.SelectedHoldTime(-1);
            self.MinSensitivity(-1);
            self.MaxSensitivity(-1);
            self.IsCameraDisabled(true);
            self.IsSmartVMDLimitReached(true);
            self.OtherSVMDCount(0);

            datacontext.getdevicecapabilityinfo(function (devcapab) {
                if (devcapab && devcapab.MotionDetection) {
                    self.MinHoldTime(devcapab.MotionDetection.MinHoldTime);
                    self.MaxHoldTime(devcapab.MotionDetection.MaxHoldTime);
                    self.MinSensitivity(devcapab.MotionDetection.MinSensitivity);
                    self.MaxSensitivity(devcapab.MotionDetection.MaxSensitivity);

                    if (!isinitialised) {
                        self.init();
                    }

                    if (data.MotionDetectionSetting && data.MotionDetectionSetting.IsEnabled) {
                        self.IsMotionEnabled(data.MotionDetectionSetting.IsEnabled);
                        if (data.MotionDetectionSetting.HoldTime < self.MinHoldTime())
                            self.SelectedHoldTime(self.MinHoldTime());
                        else if (data.MotionDetectionSetting.HoldTime > self.MaxHoldTime())
                            self.SelectedHoldTime(self.MaxHoldTime());
                        else
                            self.SelectedHoldTime(data.MotionDetectionSetting.HoldTime);

                        if (self.IsAnalog()) {
                            $.each(data.MotionDetectionSetting.Regions, function (i, item) {
                                item.MinSensitivity = self.MinSensitivity();
                                item.MaxSensitivity = self.MaxSensitivity();
                                var index = parseInt(item.Label);
                                switch (index) {
                                    case 0: {
                                        self.redRegion().Initialise(item);
                                        break;
                                    }
                                    case 1: {
                                        self.greenRegion().Initialise(item);
                                        break;
                                    }
                                    case 2: {
                                        self.blueRegion().Initialise(item);
                                        break;
                                    }
                                    default:
                                }
                            });
                            self.redraw();
                        }
                    }
                    else {
                        self.IsMotionEnabled(false);
                        self.SelectedHoldTime(self.MinHoldTime());
                        //self.SelectedSensitivity(self.MinSensitivity());
                    }
                    self.IsSmartVMDLimitReached(false);
                    if (self.IsAnalog()) {
                        SetOtherSVMDCount();
                    }
                }
            });

            datacontext.getmotionscheduledetails().done(function (jsondata) {
                if (jsondata.Success) {
                    FillMotionSchedules(jsondata.data);
                    FillMotionRecordings(data.MotionRecordings);
                    ismotionrecordinginitialised = true;
                    window.mpcacamerasetting.uicontext.showloading(false);
                } else {
                    //Handle error
                    window.mpcacamerasetting.uicontext.showloading(false);
                }
            });

        };
        self.SetFocus = function () {
            if (!ismotionrecordinginitialised) {
                window.mpcacamerasetting.uicontext.showloading(true);
            }
        };
        self.dosaveconfigure = function (passonmodel) {
            if (window.mpcacamerasetting.uicontext.validateform(common.constants.configtabs.MotionRecording)) {
                passonmodel.MotionRecordings = [];
                passonmodel.MotionRecordings = $.map(self.MotionRecordingSchedules(), function (item) {
                    if (item && item.IsChecked())
                        return item.Id();
                });
                self.Regions.removeAll();
                if (self.IsAnalog()) {
                    if (!self.IsMotionEnabled()) {
                        self.redRegion().onofftoggle(self.IsMotionEnabled() ? 1 : 0);
                        self.greenRegion().onofftoggle(self.IsMotionEnabled() ? 1 : 0);
                        self.blueRegion().onofftoggle(self.IsMotionEnabled() ? 1 : 0);
                    }
                    self.Regions.push(self.redRegion());
                    self.Regions.push(self.greenRegion());
                    self.Regions.push(self.blueRegion());
                }
                var globalsensitivityValue = (self.IsAnalog() && self.IsMotionEnabled()) ? getGlobalSensitivity(self.Regions()) : 1;
                var holdtimeValue = self.IsMotionEnabled() ? self.SelectedHoldTime() : 0;
                var motiondetectionsetting = {
                    IsEnabled: self.IsMotionEnabled(),
                    HoldTime: holdtimeValue,
                    Sensitivity: globalsensitivityValue,
                    Regions: self.Regions()
                }
                passonmodel.MotionDetectionSetting = motiondetectionsetting;
                return passonmodel;
            }
            return null;
        }
        self.updatesaveresult = function (success) {
            onsaveresetmodel(success);
        };

        var greenReg = new regionEntity(1, self);
        self.greenRegion = ko.observable(greenReg);

        var redReg = new regionEntity(0, self);
        self.redRegion = ko.observable(redReg);

        var blueReg = new regionEntity(2, self);
        self.blueRegion = ko.observable(blueReg);

        function SetOtherSVMDCount() {
            datacontext.getallcameradetails(function (allcameradetails) {
                var svmdconfigcount = 0;
                if (allcameradetails != null) {
                    $.each(allcameradetails, function (index, item) {
                        if (item.Id != data.Id && item.CameraType.toLowerCase() == common.constants.cameratypes.AnalogCamera.toLowerCase()) {
                            if (item.MotionDetectionSetting && item.MotionDetectionSetting.IsEnabled && item.MotionDetectionSetting.Regions
                                && item.MotionDetectionSetting.Regions.length > 0) {
                                var issvmdtunned = false;
                                $.each(item.MotionDetectionSetting.Regions, function (regIndex, regItem) {
                                    if (regItem.IsEnabled) {
                                        issvmdtunned = true;
                                    }
                                });
                                if (issvmdtunned) {
                                    svmdconfigcount++;
                                }
                            }
                        }
                    });
                }
                self.OtherSVMDCount(svmdconfigcount);
                checksvmd(self.OtherSVMDCount());
            });
        }

        function getGlobalSensitivity(regions) {
            var glblsens = 1;
            if (regions && regions.length > 0) {
                $.each(regions, function (index, item) {
                    if (item.IsEnabled() && glblsens < item.Sensitivity) {
                        glblsens = item.Sensitivity;
                    }
                });
            }
            return glblsens;
        }
        function onsaveresetmodel(success) {

        }

        function FillMotionSchedules(schedules) {
            if (schedules) {
                self.MotionRecordingSchedules($.map(schedules, function (iItem) {
                    return new datacontext.scheduleModel(iItem, common.constants.scheduletypes.MotionBased);
                }));
            }
        };

        function FillMotionRecordings(recordingdata) {
            if (recordingdata) {
                for (var j = 0; j < self.MotionRecordingSchedules().length; j++) {
                    if (self.MotionRecordingSchedules()[j].Id() != null) {
                        for (var k = 0; k < recordingdata.length; k++) {
                            if (recordingdata[k] != null) {
                                if (self.MotionRecordingSchedules()[j].Id() == recordingdata[k]) {
                                    self.MotionRecordingSchedules()[j].IsChecked(true);
                                }
                            }
                        }
                    }
                }
            }
        }


        $.subscribe(common.events.mpcascheduleupdate, function (event, data) {
            if (data && data.Type.value == common.constants.scheduletypes.MotionBased.value) {
                for (var j = 0; j < self.MotionRecordingSchedules().length; j++) {
                    if (self.MotionRecordingSchedules()[j].Id() == data.Id) {
                        self.MotionRecordingSchedules()[j].Name(data.Name);
                        break;
                    }
                }
            }
        });
    }

    datacontext.MotionRecordingEntity = MotionRecordingEntity;

})(ko, window.mpcacamerasetting.datacontext, window.mpcacamerasetting.common);