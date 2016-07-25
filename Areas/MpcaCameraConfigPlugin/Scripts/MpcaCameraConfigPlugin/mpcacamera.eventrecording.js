/// <reference path="mpcacamera.common.js" />
window.mpcacamerasetting.eventrecordingmodel = (function (ko, datacontext, common) {
    var EventRecordingEntity = function () {
        var self = this;
        var data = data || {};
        var iseventrecordinginitialised = false;
        self.CameraEventRecordings = ko.observableArray([]);
        self.IsCameraDisabled = ko.observable(true);
        self.Initialise = function (newdata) {
            iseventrecordinginitialised = false;
            data = newdata;
            self.CameraEventRecordings([]);
            datacontext.getinputdetails().done(function (jsondata) {
                if (jsondata.Success) {
                    FillInputs(jsondata.data);
                    FillEventRecording(data.EventRecordings);
                    iseventrecordinginitialised = true;
                    window.mpcacamerasetting.uicontext.showloading(false);
                } else {
                    //Handle error
                    window.mpcacamerasetting.uicontext.showloading(false);
                }
            });
        };
        self.SetFocus = function () {
            if (!iseventrecordinginitialised) {
                window.mpcacamerasetting.uicontext.showloading(true);
            }
        };
        self.dosaveconfigure = function (passonmodel) {
            if (window.mpcacamerasetting.uicontext.validateform(common.constants.configtabs.EventRecording)) {
                passonmodel.EventRecordings = [];
                passonmodel.EventRecordings = $.map(self.CameraEventRecordings(), function (item) {
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

        function FillInputs(inputs) {
            if (inputs) {
                self.CameraEventRecordings($.map(inputs, function (iItem) {
                    return new datacontext.inputModel(iItem);
                }));
            }
        }

        function FillEventRecording(recordingdata) {
            if (recordingdata) {
                for (var j = 0; j < self.CameraEventRecordings().length; j++) {
                    if (self.CameraEventRecordings()[j].Id() != null) {
                        for (var k = 0; k < recordingdata.length; k++) {
                            if (recordingdata[k] != null) {
                                if (self.CameraEventRecordings()[j].Id() == recordingdata[k]) {
                                    self.CameraEventRecordings()[j].IsChecked(true);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    datacontext.EventRecordingEntity = EventRecordingEntity;

})(ko, window.mpcacamerasetting.datacontext, window.mpcacamerasetting.common);