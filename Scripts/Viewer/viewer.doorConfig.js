/// <reference path="viewer.datacontext.js" />
/// <reference path="viewer.uicontext.js" />
/// <reference path="viewer.common.js" />

window.viewerconfig = window.viewerconfig || {};
window.viewerconfig.doorConfig = (function ($, common, datacontext, uicontext) {
    var DooreventResultmodel = function (data) {
        var self = this;
        data = data || {};
        self.SessionId = null;
        self.DoorId = ko.observable(data.DoorId);
        self.EventCode = ko.observable(data.EventCode);
        self.OriginTime = ko.observable(data.OriginTime);
        self.DeviceState = ko.observable(data.DeviceState);
        self.CredentialNumber = ko.observable(data.CredentialNumber);
        self.DisplayName = ko.observable(data.DisplayName);
        self.Data = ko.observable(data.Data);
        self.BlobTypeName = ko.observable(data.BlobTypeName);
        self.FileName = ko.observable(data.FileName);

        self.toJson = function () {
            return ko.toJSON(self);
        }
    }
        var DoorViewmodel = function () {
            var self = this;
            self.CameraName = ko.observable("");
            self.DooreventResult = ko.observableArray([]),
            self.loading = ko.observable("");
            self.AddDooreventResult = function (doorevents) {
                if (doorevents == undefined || doorevents == null)
                    return
                for (var i = 0; i < doorevents.length; i++) {
                    var DooreventResultmodel = new DooreventResultmodel(doorevents[i]);
                    this.doorevents.push(DooreventResultmodel);
                }
            };
         }    
        
    window.viewerconfig.datacontext.DoorViewmodel = DoorViewmodel;
})(jQuery, ko, window.viewerconfig.common, window.viewerconfig.uicontext, window.viewerconfig.datacontext);



