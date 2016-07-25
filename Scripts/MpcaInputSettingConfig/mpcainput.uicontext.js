/// <reference path="mpcainput.common.js" />
/// <reference path="mpcainput.datacontext.js" />
/// <reference path="mpcainput.eventreciever.js" />


window.mpcainput.uicontext = (function ($, ko, datatcontext, common) {
    var currentDevice = null;
    var CurrentnodeId = null;
    function onmpcainputselectionchanged(data) {
        currentDevice = data;
        datatcontext.onmpcainputselected(currentDevice);
        setactivesettingform(currentDevice);
    }

    function setactivesettingform(currentData) {
        if (currentData && currentData.parentnodedata) {
            if (currentData.nodedata.EntityType.toLowerCase() == common.constants.entitytype.toLowerCase()
               && currentData.parentnodedata
               && currentData.parentnodedata.EntityType && currentData.parentnodedata.EntityType.toLowerCase() == common.constants.parententitytype
               && currentData.parentnodedata.DeviceType && currentData.parentnodedata.DeviceType.Name && currentData.parentnodedata.DeviceType.Name.toLowerCase() == common.constants.parentdevicetype) {
                loadmpcainputconfigform(currentData.nodedata);
            }
        }
    }
    function loadmpcainputconfigform(nodedata) {
        hideallforms();
        $("[data-accounttype='MPCADEVICECONFIGWRAPPER']").addClass("settingsform_active");
        $("[data-accounttype='MPCAINPUTCONFIG']").addClass("settingsform_active");
        binddatatoactiveform(nodedata);

    }
    function hideallforms() {
        $("[data-accounttype]").removeClass("settingsform_active");
        $("[data-accounttype]").addClass("settingsform");
    }







    function binddatatoactiveform() {
        var inputsetting = ko.contextFor(document.getElementById("inputevntrecwrapper"));
        var inputsettingmodel;
        window.mpcainput.datacontext.getinputdetail(currentDevice.parentnodedata.Id).done(function (jsondata) {
            var inputdata = jsondata;
            var inputsettingmodel;
            if ((inputsetting == undefined) || (inputsetting.$data == undefined)) {
                inputsettingmodel = new window.mpcainput.datacontext.InputsettingViewmodel();
                if (inputdata != null)
                    inputsettingmodel.AddInputInfo(inputdata);
                ko.applyBindings(inputsettingmodel, document.getElementById("inputevntrecwrapper"));
            }
            else {
                inputsettingmodel = inputsetting.$data;
                if (inputdata != null)
                    inputsettingmodel.AddInputInfo(inputdata);
            }
        });
        datatcontext.getInputstatus(currentDevice.parentnodedata.Id).done(function (jsondata) {
            var inputstatus = ko.contextFor(document.getElementById("inputevntrecwrapper"));
            var statusdata = jsondata
            if (statusdata && statusdata != null && inputstatus) {
                inputstatus.$data.UpdateStatusModel(statusdata);
            }
        });
    };
    function showloading(isshow) {
        if (!isshow) {
            isshow = true;
        }
    }
    function showError() {
        $(".showerror").css("display", "block");
    }

    function hideError() {
        $(".showerror").css("display", "none");
    }

    var inputuicontext = {
        onmpcainputselectionchanged: onmpcainputselectionchanged,
        hideError: hideError,
        showError: showError
    }
    return inputuicontext;
})(jQuery, ko, window.mpcainput.datacontext, window.mpcainput.common);