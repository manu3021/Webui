/// <reference path="mpcacamera.common.js" />
window.mpcacamerasetting.continuousrecordingmodel = (function (ko, datacontext, common) {
    var ContinuousRecordingEntity = function () {
        var self = this;
        var data = data || {};
        var iscontinuousrecordinginitialised = false;
        self.CameraContinuousRecording = ko.observableArray([]);
        self.IsCameraDisabled = ko.observable(true);
        self.Initialise = function (newdata) {
            iscontinuousrecordinginitialised = false;
            data = newdata;
            self.CameraContinuousRecording([]);
            datacontext.getcontinuousscheduledetails().done(function (jsondata) {
                if (jsondata.Success) {
                    FillContinuousSchedules(jsondata.data);
                    FillContinuousRecording(data.ContinuousRecordings);
                    iscontinuousrecordinginitialised = true;
                    window.mpcacamerasetting.uicontext.showloading(false);
                } else {
                    //Handle error
                    window.mpcacamerasetting.uicontext.showloading(false);
                }
            }).error(function () {
                //Handle error
                window.mpcacamerasetting.uicontext.showloading(false);
            });
        };
        self.SetFocus = function () {
            if (!iscontinuousrecordinginitialised) {
                window.mpcacamerasetting.uicontext.showloading(true);
            }
        };        
        self.dosaveconfigure = function (passonmodel) {
            if (window.mpcacamerasetting.uicontext.validateform(common.constants.configtabs.ContinuousRecording)) {
                passonmodel.ContinuousRecordings = [];
                passonmodel.ContinuousRecordings = $.map(self.CameraContinuousRecording(), function (item) {
                    if (item && item.IsChecked())
                        return item.Id();
                });
                return passonmodel;
            }
            return null;
        }
        self.updatesaveresult = function (success) {
            onsaveresetmodel(success);
        };

        function onsaveresetmodel(success) {

        }

        function FillContinuousSchedules(schedules) {
            if (schedules) {
                self.CameraContinuousRecording($.map(schedules, function (iItem) {
                    return new datacontext.scheduleModel(iItem, common.constants.scheduletypes.Continuous);
                }));
            }
        }

        function FillContinuousRecording(recordingdata) {
            if (recordingdata) {
                for (var j = 0; j < self.CameraContinuousRecording().length; j++) {
                    if (self.CameraContinuousRecording()[j].Id() != null) {
                        for (var k = 0; k < recordingdata.length; k++) {
                            if (recordingdata[k] != null) {
                                if (self.CameraContinuousRecording()[j].Id() == recordingdata[k]) {
                                    self.CameraContinuousRecording()[j].IsChecked(true);
                                }
                            }
                        }
                    }
                }
            }
        }

        $.subscribe(common.events.mpcascheduleupdate, function (event, data) {
            if (data && data.Type.value == common.constants.scheduletypes.Continuous.value) {
                for (var j = 0; j < self.CameraContinuousRecording().length; j++) {
                    if (self.CameraContinuousRecording()[j].Id() == data.Id) {
                        self.CameraContinuousRecording()[j].Name(data.Name);
                        break;
                    }
                }
            }
        });
    }

    datacontext.ContinuousRecordingEntity = ContinuousRecordingEntity;

})(ko, window.mpcacamerasetting.datacontext, window.mpcacamerasetting.common);