/// <reference path="gateway-common.js" />
/// <reference path="gateway-model.js" />
/// <reference path="gateway-datacontext.js" />
/// <reference path="gateway-validationcontext.js" />
window.gatewayconfig.uicontext = (function ($, ko, datatcontext, validationcontext, common) {
    var configuicontext = {
        onpanelselectionchanged: onpanelselectionchanged,
        onregistrationstatusrefresh: onregistrationstatusrefresh,
        validateform: validateform,
        onsyncrefresh: onsyncrefresh,
        getDeviceTime: getDeviceTime
    }

    var currentDevice = null;
    var newpanelentity = null;
    function onpanelselectionchanged(data) {
        currentDevice = data;
        datatcontext.onpanelselected(data);
        setactivesettingform();
    }

    function onregistrationstatusrefresh() {
        loadpanelconfigform();
    }

    function onsyncrefresh() {
        $("#gatewayNotReg").hide();
        $("#editGateway").hide();
        toggleForm(true, false, null, newpanelentity);
    }

    function validateform() {
        if (($('#panel_chkselected').prop('checked') && $("#gatewaydeviceDateTime").find('input').val() == "")) {
            alertify.error(Resources.Panel_SelectDeviceDateTime);
            return false;
        }
        return validationcontext.validateForm("gatewayForm");
    }

    function setactivesettingform() {
        if (currentDevice != null && currentDevice.nodedata != null) {
            if (currentDevice.nodedata.EntityType.toLowerCase() == common.constants.entitytype && currentDevice.nodedata.DeviceType.Name.toLowerCase() == common.constants.devicetype) {
                loadpanelconfigform();
            }
        }
    }

    function loadpanelconfigform() {
        hideallforms();
        //$("[data-accounttype='GATEWAY']").addClass("settingsform_active").showLoading();
        $("#gatewayNotReg").hide();
        $("#editGateway").hide();
        binddatatoactiveform();
    }

    function hideallforms() {
        $("[data-accounttype='GATEWAY']").addClass("settingsform_active").showLoading();
        $("[data-accounttype!='GATEWAY']").removeClass("settingsform_active");
    }

    function binddatatoactiveform() {
        datatcontext.getpaneldetail().done(function (jsondata) {
            ko.cleanNode(document.getElementById("gatewayForm"));
            newpanelentity = new datatcontext.paneldeviceentity(jsondata);
            ko.applyBindings(newpanelentity, document.getElementById("gatewayForm"));
            validationcontext.setvalidationfor("gatewayForm");
            toggleForm(newpanelentity.IsRegistered(), newpanelentity.IsConfigurationUploaded(), newpanelentity.Status ? newpanelentity.Status() : "NotRegistered", newpanelentity);
            $("[data-accounttype='GATEWAY']").hideLoading();
        });
    }

    function toggleForm(isRegistered, isConfigUploaded, status, newpanelentity) {
        if(newpanelentity)
            newpanelentity.UpdateRefreshStatus();
        if (isRegistered && isConfigUploaded) {
            $("#gatewayNotReg").hide();
            $("#editGateway").show();
            if (currentDevice.nodedata.Name == newpanelentity.Name()) {
                currentDevice.nodedata.Status = status;
            }
        }
        else {
            $("#gatewayNotReg").show();
            $("#editGateway").hide();
        }
        currentDevice.updatecallback(currentDevice.nodedata);
    }

    function getDeviceTime() {
        if ($('#panel_chkselected').prop('checked') && $("#gatewaydeviceDateTime").find('input').val() != "") {
            return $("#gatewaydeviceDateTime").find('input').val().toDateString();
        }
        else
            return null;
    }
    $.subscribe(common.events.systemeventreceived, function (eventName, data) {
        if (data[0][window.mpcglobal.eventschema.EventCode] == window.mpcglobal.eventcodes.CONFIG_UPLOAD) {
            var context = ko.contextFor($("#gatewayForm")[0]);
            if (context != undefined && context.$data != undefined
                && data[0][window.mpcglobal.eventschema.SourceId] == context.$data.Id
                && data[0][window.mpcglobal.eventschema.SourceType].toLowerCase() == common.constants.sourcetype.toLowerCase()
                && context.$data.IsConfigurationUploaded() == false) {
                context.$data.dorefresh();
            }
        }
        else if (data[0][window.mpcglobal.eventschema.EventCode] == window.mpcglobal.eventcodes.PANEL_REGISTERED) {
            var context = ko.contextFor($("#gatewayForm")[0]);
            if (context != undefined && context.$data != undefined
                && data[0][window.mpcglobal.eventschema.SourceId] == context.$data.ParentId()
                && data[0][window.mpcglobal.eventschema.SourceType].toLowerCase() == common.constants.parententitytype.toLowerCase()
                && context.$data.IsRegistered() == false) {
                context.$data.dorefresh();
            }
        }
    });

    function init() {
        try {
            $('#gatewaydeviceDateTime').datetimepicker({
                //language: 'en',
                pick12HourFormat: false,
                format: Resources.datetime_picker_format
            });
        } catch (e) {
            console.error(e);
        }
    }
    init();
    return configuicontext;
})(jQuery, ko, window.gatewayconfig.datacontext, window.gatewayconfig.validationcontext, window.gatewayconfig.common);