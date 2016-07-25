/// <reference path="mpcaInput.datacontext.js" />
/// <reference path="mpcaInput.model.js" />
/// <reference path="mpcaoutput.common.js" />
/// <reference path="mpcainput.uicontext.js" />

window.mpcainput.inputsettingmodel = (function (ko, common, datacontext, uicontext) {
    var FeatureModel = function (name, value, index) {
        var self = this;
        self.FeatureName = name;
        self.FeatureValue = value;
        self.RepeatIndex = index;
    }
    var Inputentity = function (inputdata) {
        var self = this;
        self.Id = ko.observable(inputdata.Id);
        self.ParentId = ko.observable(inputdata.ParentId);
        self.Name = ko.observable(inputdata.Name);
        self.LabelName = ko.observable(common.messages.inputlabel + inputdata.Address);
        self.Address = ko.observable(inputdata.Address);
        self.isNormallyOpen = ko.observable(false);
        self.IsActive = inputdata.IsActive;
        self.statusclass = ko.observable("");
        self.enabledisableval = ko.observable(inputdata.IsActive ? 1 : 0);
        self.NCNOval = ko.observable(0);
        self.Features = [];
        self.IsError = ko.observable(false);
        self.Errormessage = ko.observable("");
        self.showerror = function () {
            window.mpcainput.uicontext.showError();
        }
        self.hideerror = function () {
            window.mpcainput.uicontext.hideError();
        }
        self.enabledisableval.subscribe(function (newval) {
            if (newval == "1") {
                self.statusclass("mpcaRedStatus");
            }
            else {
                self.statusclass("mpcaGreyStatus");
            }
        });
        self.toJson = function () {
            self.IsActive = self.enabledisableval() == "1" ? true : false;
            var inputlevel = new FeatureModel(common.constants.feature.InputLevel, self.NCNOval() == "1" ? "High" : "Low", 0);
            self.Features = [inputlevel];

            return ko.toJSON(self);
        }
        function Init() {
            if ((inputdata.Features != null) && (inputdata.Features.length > 0)) {
                $.each(inputdata.Features, function (index, item) {
                    if (item.FeatureName == common.constants.feature.InputLevel) {
                        self.NCNOval(item.FeatureValue == "High" ? 1 : 0);
                    }
                });
            }
        }
        Init();
    }

    var InputsettingViewmodel = function () {
        var self = this;
        self.Inputsettings = ko.observableArray([]);
        self.ErrorMessage = ko.observable("");
        self.UpdateStatusModel = function (statusinfo) {
            $.each(self.Inputsettings(), function (uindex, inputitem) {
                if (inputitem.enabledisableval() == "1") {
                    $.each(statusinfo, function (mindex, moditem) {
                        if (inputitem.Address() == (moditem.Id)) {
                            if (moditem.NormalState.toLowerCase() == moditem.CurrentState.toLowerCase())
                                inputitem.statusclass('mpcaGreenStatus');
                            else
                                inputitem.statusclass('mpcaRedStatus');
                        }
                    });
                }
                else {
                    inputitem.statusclass('mpcaGreyStatus');
                }
            });
        }
        self.AddInputInfo = function (result) {
            self.Inputsettings([]);
            if (result == undefined || result == null)
                return;
            var InputResults = $.map(result, function (item) {
                return new Inputentity(item);
            });
            self.Inputsettings(InputResults);
        }
        self.dosavesettings = function (event, data) {
            var isvalid = true;
            window.mpcainput.uicontext.hideError();
            $.each(self.Inputsettings(), function (index, item) {
                if ($.trim(item.Name()) == "") {
                    item.IsError(true);
                    item.Errormessage(common.messages.input_pls_ent_inpnam);
                    isvalid = false;
                    window.mpcainput.uicontext.showError();
                    return;
                }
                if ($.trim(item.Name().length) > 30) {
                    item.IsError(true);
                    item.Errormessage(common.messages.input_inpnam_cnt_grt);
                    isvalid = false;
                    window.mpcainput.uicontext.showError();
                    return;
                }
                item.IsError(false);
                item.Errormessage("");
            });
            if (isvalid) {
                blockUI();
                window.mpcainput.datacontext.saveInputdetail(self.toJson(), function (successresult) {
                    var msg = window.mpcainput.common.messages.input_save_success;
                    if (successresult.recorderstatus && successresult.recorderstatus.toLowerCase() != common.constants.recorderstatus.ONLINE.toLowerCase()) {
                        msg += "." + window.mpcainput.common.messages.devoffline_cnfgdwnOnOnl;
                    }
                    alertify.success(msg);
                    unblockUI();
                }, function (errorresult) {
                    alertify.error(errorresult.error);
                    unblockUI();
                });
            }
        }
        self.toJson = function () {
            $.each(self.Inputsettings(), function (index, item) {
                item.toJson();
            });
            return ko.toJSON(self.Inputsettings());
        }
    }
    datacontext.inputsetting = Inputentity;
    window.mpcainput.datacontext.InputsettingViewmodel = InputsettingViewmodel;
})(ko, window.mpcainput.common, window.mpcainput.datacontext, window.mpcainput.uicontext);

