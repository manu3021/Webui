/// <reference path="viewer.uicontext.js" />
/// <reference path="viewer.salvo.js" />
/// <reference path="viewer.common.js" />
/// <reference path="viewer.datacontext.js" />



window.viewerconfig = window.viewerconfig || {};

window.viewerconfig.validations = (function ($, validator) {
    var errorCssClass = "validationError";
    var ValidationMessages = {
        default_Max: Resources.default_Max,
        salvo_Name_Required: Resources.Salvo_Required,
        salvo_Name_Min: Resources.Salvo_Min,
    };
    var configvalidation = {
        salvoSaveContent1: {
            rules: {
                salvoname: {
                    required: true,
                    minlength: 3,
                    maxlength: 30,
                }
            },
            messages: {
                salvoname: {
                    required: ValidationMessages.salvo_Name_Required,
                    minlength: ValidationMessages.salvo_Name_Min,
                }
            }
        },

    };
    function validteIfentered(element) {
        return $(element).val().length > 0;
    }
    return {
        configvalidation: configvalidation,
        errorCssClass: errorCssClass
    };
})(jQuery, jQuery.validator);
window.viewerconfig.validationcontext = (function ($, validation) {
    function setvalidationfor(formid, isNew) {
        window.globalvalidationcontext.setvalidationfor(formid, isNew, validation);
    }
    function validateForm(formId) {
        return window.globalvalidationcontext.validateForm(formId);
    }
    return {
        validateForm: validateForm,
        setvalidationfor: setvalidationfor
    };
})(jQuery, window.viewerconfig.validations);


window.viewerconfig.salvomanagement = (function ($, common, datacontext, uicontext, validationcontext) {

    var SalvoViewEntityInfoField = function (data) {
        var self = this;
        self.EntityInstanceIdField = ko.observable(data.EntityInstanceIdField());
        self.EntityTypeField = ko.observable(data.EntityTypeField());
        self.PanelNumberField = ko.observable(data.PanelNumberField());
        self.EntityInstanceNameField = ko.observable(data.EntityInstanceNameField());

    }
    var SalvoModel = function (data) {
        var self = this
        data = data || {}
        self.Name = ko.observable(data.Name);
        self.Errormessage = ko.observable("Error");
        self.Id = ko.observable(data.Id);
        self.SalvoLayOutField = ko.observable(data.SalvoLayOutField);
        self.SalvoViewEntityInfoField = ko.observableArray([]);
        self.AddInstanceInfo = function (eInstanceInfo) {
            try {
                for (var i = 0; i < eInstanceInfo.length; i++) {
                    self.SalvoViewEntityInfoField.push(new SalvoViewEntityInfoField(eInstanceInfo[i]));
                }
            } catch (e) {
                console.error("Salvo management Add salvo Error", e.message);
            }
        }
        self.RemoveInstanceInfo = function (einstanceId) {
            try {
                var eFresult = _.find(self.entityInstanceInfos(), function (ei) {
                    return ei.Id == einstanceId.Id;
                });
                if (eFresult) {
                    self.entityInstanceInfos.remove(eFresult);
                }
            } catch (e) {
                console.error("Salvo management Remove salvo Error", e.message);
            }
        }
        self.toJson = function () {
            return ko.toJSON(self);
        }
    }

    var SalvomanageViewmodel = function () {
        var self = this;
        self.Name = ko.observable("");
        self.Id = ko.observable("");
        self.Errormessage = ko.observable("");//window.viewerconfig.common.messages.viewer_salvonameerror);      
        //self.isUpdatesalvo = ko.observable(false);
        self.IsError = ko.observable(false);
        self.showerror = function (data, event) {
            window.viewerconfig.uicontext.showError(event.currentTarget);
        }
        self.hideerror = function (data, event) {
            window.viewerconfig.uicontext.hideError(event.currentTarget);
        }
        self.Cancelsalvo = function (data, event) {
            window.viewerconfig.uicontext.Hidesalvosavepopover();
        }

        self.SaveSalvoInfo = function (data, event) {
            var salvoToadd = PrepareSalvoModel();
            // call data context and pass sllmm
            // send information to server
            if (window.viewerconfig.validationcontext.validateForm('salvoSaveContent1')) {
                if (salvoToadd.SalvoViewEntityInfoField().length > 0) {
                    var svm = ko.contextFor(document.getElementById('viewersalvowrapper'));
                    blockUI();
                    if ((svm.$data.Salvoname() != salvoToadd.Name())) {
                        window.viewerconfig.datacontext.SaveSalvo(salvoToadd).done(function (jsondata) {
                            var savesalvo = jsondata;
                            if (jsondata.success) {
                                //After new salvo added assign new id
                                salvoToadd.Id(jsondata.data.Id);

                                alertify.success(window.viewerconfig.common.messages.Viwer_Salvosave);
                                window.viewerconfig.uicontext.CallbackSaveNewSalvo(salvoToadd, savesalvo.data);
                                window.viewerconfig.uicontext.Hidesalvosavepopover();
                                unblockUI();
                                //$.publish(window.viewerconfig.common.events.Salvotreeitemadd, savesalvo.data);
                            }
                            else {
                                if (jsondata.errorMessage.toLowerCase() == window.viewerconfig.common.constants.videostatus.ERR_DB_DUPLICATE_RECORD.toLowerCase()) {
                                    alertify.error(window.viewerconfig.common.messages.viewe_salvonameduplicateerror);
                                }
                                else {
                                    alertify.error(window.viewerconfig.common.messages.viewer_salvosaveerror);
                                }
                                unblockUI();
                            }
                        });
                    }
                    else {
                        window.viewerconfig.datacontext.UpdateSalvo(salvoToadd).done(function (jsondata) {
                            var savesalvo = jsondata;
                            if (jsondata.success) {
                                alertify.success(window.viewerconfig.common.messages.Viewer_salvoUpdate);
                                window.viewerconfig.uicontext.CallbackUpdateSalvo(salvoToadd);
                                window.viewerconfig.uicontext.Hidesalvosavepopover();
                            }

                            else
                                alertify.error(window.viewerconfig.common.messages.viewer_salvoupdatefailed);
                            unblockUI();
                        });
                    }
                }
                else {
                    alertify.error(window.viewerconfig.common.messages.viewer_SalvoEmptysalvosaveupdate);
                }
            }
        }

        function PrepareSalvoModel() {
            try {
                var salvoId = null;
                // Viewer salvo
                // TO DO: prepare salvo model with information
                // 1. get the salvo context
                // 2. Call get salvo info on salvo view model
                var svm = ko.contextFor(document.getElementById('viewersalvowrapper'));
                if (svm) {
                    var sInfo = svm.$data.GetSalvoInfo();
                }
                //if (!(svm.$data.Salvoname() == undefined) && !(svm.$data.Salvoname() == ""))
                //    svm.$data.isUpdatesalvo(window.viewerconfig.common.isupdate);
                if (window.viewerconfig.common.salvodata != null) {
                    salvoId = window.viewerconfig.common.salvodata.nodedata.Id;
                }

                var slmm = new SalvoModel({ Name: self.Name(), SalvoLayOutField: svm.$data.salvoLayout(), Id: salvoId });
                if (slmm.Name() != "")
                    self.IsError(false);
                slmm.AddInstanceInfo(sInfo);
                //slmm.isUpdatesalvo(false);
                return slmm;
            } catch (e) {
                console.error("Error on prepare salvo model salvo managemnet Error:", e.message);
            }
        }
    }

    window.viewerconfig.datacontext.SalvomanageViewmodel = SalvomanageViewmodel;
})(jQuery, ko, window.viewerconfig.common, window.viewerconfig.uicontext, window.viewerconfig.datacontext, window.viewerconfig.salvolayout, window.viewerconfig.validationcontext);
