/// <reference path="mpcaoutput.common.js" />
/// <reference path="mpcaoutput.datacontext.js" />
/// <reference path="mpcaoutput.eventreciever.js" />



window.mpcaoutput.uicontext = (function ($, ko, datatcontext, common, validationcontext) {
    var currentDevice = null;
    var TriggerPopoverTarget = null;
    var VMDpopoverTarget = null;
    var CurrentnodeId = null;
    var currentPopoverTarget = null;
    var Triggerdata = null;

    function onmpcaoutputselectionchanged(data) {
        currentDevice = data;
        datatcontext.onmpcaoutputselected(currentDevice);
        setactivesettingform(currentDevice);
    }
    function setactivesettingform(currentData) {
        if (currentData && currentData.parentnodedata) {
            if (currentData.nodedata.EntityType.toLowerCase() == common.constants.entitytype.toLowerCase()
                && currentData.parentnodedata
                && currentData.parentnodedata.EntityType && currentData.parentnodedata.EntityType.toLowerCase() == common.constants.parententitytype
                && currentData.parentnodedata.DeviceType && currentData.parentnodedata.DeviceType.Name && currentData.parentnodedata.DeviceType.Name.toLowerCase() == common.constants.parentdevicetype) {
                CurrentnodeId = currentData.parentnodedata.Id;
                loadmpcaoutputconfigform(currentData.nodedata);
            }
        }
    }
    function loadmpcaoutputconfigform() {
        hideallforms();
        $("[data-accounttype='MPCADEVICECONFIGWRAPPER']").addClass("settingsform_active");
        $("[data-accounttype='MPCAOUTPUTCONFIG']").addClass("settingsform_active");
        binddatatoactiveform();
    }
    function hideallforms() {
        $("[data-accounttype]").removeClass("settingsform_active");
        $("[data-accounttype]").addClass("settingsform");
    }
    function binddatatoactiveform() {
        var context = ko.contextFor(document.getElementById("outputevntrecwrapper"));
        window.mpcaoutput.datacontext.getoutputdetail(currentDevice.parentnodedata.Id).done(function (jsondata) {
            var outputdata = jsondata;
            var outputsettingmodel;
            if (context == undefined || context.$data == undefined) {
                outputsettingmodel = new datatcontext.Outputsetting();
                if (outputdata != null) {
                    outputsettingmodel.AddOutputInfo(outputdata);
                }
                ko.applyBindings(outputsettingmodel, document.getElementById("outputevntrecwrapper"));
            }
            else {
                outputsettingmodel = context.$data;
                if (outputdata != null)
                    outputsettingmodel.AddOutputInfo(outputdata);
            }
            outputsettingmodel.InitialiseComplete();
        });
    };

    $('.mpcaOutput-table').on('click', function (e) {
        $('[data-ispopovershown="true"]').each(function () {
            //the 'is' for buttons that trigger popups
            //the 'has' for icons within a button that triggers a popup
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                $(this).popover('hide');
            }
        });
    });

    function showTriggerpopover(currentmodel, currentTriggerPopoverTarget) {
        TriggerPopoverTarget = currentTriggerPopoverTarget;
        var isPopoverShown = $(currentTriggerPopoverTarget).attr("data-ispopovershown");
        $(currentTriggerPopoverTarget).attr("data-ispopovershown", true);
        if (isPopoverShown == undefined && isPopoverShown == null) {
            $(currentTriggerPopoverTarget).popover({
                title: "Trigger",
                html: true,
                content: $("#triggerscript1").html(),
                trigger: 'click',
                placement: 'bottom'
            }).on('shown', function () {
                onTriggerpopovershown(currentmodel);
            }).popover("show");
        }
    }

    function showVMDpopover(currentmodel, currentPopoverTarget) {
        VMDpopoverTarget = currentPopoverTarget;
        var isPopoverShown = $(currentPopoverTarget).attr("data-ispopovershown");
        $(currentPopoverTarget).attr("data-ispopovershown", true);
        if (isPopoverShown == undefined && isPopoverShown == null) {
            $(currentPopoverTarget).popover({
                title: "VMD",
                html: true,
                content: $("#vmdscript1").html(),
                trigger: 'click',
                placement: 'bottom'
            }).on('shown', function () {
                onVMDpopovershown(currentmodel);
            }).popover("show");
        }
    }

    function HideTriggerpopover(data, event) {
        // hide the current clip search popover 
        if (TriggerPopoverTarget) {
            $(TriggerPopoverTarget).popover('hide');
        }
    }

    function HideVMDpopover(data, event) {
        // hide the current clip search popover 
        if (VMDpopoverTarget) {
            $(VMDpopoverTarget).popover('hide');
        }

    }

    function onTriggerpopovershown(currentmodel) {
        var outputsettingmodel = currentmodel.$data;
        ko.applyBindings(outputsettingmodel, document.getElementById("triggertemplate1"));
        window.mpcaoutput.datacontext.getTriggers(currentDevice.parentnodedata.Id, function (triggerdata) {
            if ((triggerdata != null) && (triggerdata != undefined)) {
                outputsettingmodel.TriggerModel().AddTriggerInfo(triggerdata);
            }
        });
    }

    function onVMDpopovershown(currentmodel) {
        var outputsettingmodel = currentmodel.$data;
        ko.applyBindings(outputsettingmodel, document.getElementById("VMDtemplate1"));
        window.mpcaoutput.datacontext.getVMDCameras(currentDevice.parentnodedata.Id, function (cameradata) {
            if ((cameradata != null) && (cameradata != undefined)) {
                outputsettingmodel.VMDmodel().AddVMDInfo(cameradata);
            }
        });
    }
    function showError() {
        $(".showerror").css("display", "block");
    }

    function hideError() {
        $(".showerror").css("display", "none");
    }
    function showloading(isshow) {
        if (!isshow) {
            isshow = true;
        }
    }
    var Outputuicontext = {
        onmpcaoutputselectionchanged: onmpcaoutputselectionchanged,
        showTriggerpopover: showTriggerpopover,
        showVMDpopover: showVMDpopover,
        Triggerdata: Triggerdata,
        HideTriggerpopover: HideTriggerpopover,
        HideVMDpopover: HideVMDpopover,
        hideError: hideError,
        showError: showError
    }
    return Outputuicontext;
})(jQuery, ko, window.mpcaoutput.datacontext, window.mpcaoutput.common, window.mpcaoutput.validationcontext);