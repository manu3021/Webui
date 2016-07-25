/// <reference path="mpcarecorder.common.js" />
/// <reference path="mpcarecorder.model.js" />
/// <reference path="mpcarecorder.datacontext.js" />
/// <reference path="mpcarecorder.validationcontext.js" />
window.mpcarecorderconfig.uicontext = (function ($, ko, datatcontext, validationcontext, common) {
    var configuicontext = {
        onmpcadeviceselectionchanged: onmpcadeviceselectionchanged,
        onregistrationstatusrefresh: onregistrationstatusrefresh,
        validateform: validateform
    }

    var currentDevice = null;

    function onmpcadeviceselectionchanged(data) {
        currentDevice = data;
        datatcontext.onmpcadeviceselected(currentDevice);
        setactivesettingform();
    }
    function onregistrationstatusrefresh(updatedentity) {
        loadmpcadeviceconfigform(updatedentity);
    }
    function validateform() {
        return validationcontext.validateForm("mpcarecordersetting");
    }

    function setactivesettingform() {
        if (currentDevice != null) {
            if (currentDevice.nodedata.EntityType.toLowerCase() == common.constants.entitytype) {
                loadmpcadeviceconfigform();
            }
        }
    }
    function loadmpcadeviceconfigform(updatedentity) {
        hideallforms();
        $("[data-accounttype='MPCADEVICECONFIGWRAPPER']").addClass("settingsform_active");
        $("[data-accounttype='MPCADEVICECONFIG']").addClass("settingsform_active");
        showloading(true);
        binddatatoactiveform(updatedentity);
    }
    function hideallforms() {
        $("[data-accounttype]").removeClass("settingsform_active");
        $("[data-accounttype]").addClass("settingsform");
    }
    function binddatatoactiveform(updatedentity) {
        var newrecordeentity;
        if (updatedentity) {
            var context = ko.contextFor($("#mpcarecordersetting")[0]);

            if (context == undefined || context.$data == undefined) {
                newrecordeentity = new datatcontext.recorderentity();
                newrecordeentity.Initialise(updatedentity);
                ko.applyBindings(newrecordeentity, document.getElementById("mpcarecordersetting"));
            }
            else {
                newrecordeentity = context.$data;
                newrecordeentity.Initialise(updatedentity);
            }
            validationcontext.setvalidationfor("mpcarecordersetting");
            showloading(false);
        }
        else {
            datatcontext.getrecorderdetail().done(function (jsondata) {
                var context = ko.contextFor($("#mpcarecordersetting")[0]);
                if (context == undefined || context.$data == undefined) {
                    newrecordeentity = new datatcontext.recorderentity();
                    newrecordeentity.Initialise(jsondata);
                    ko.applyBindings(newrecordeentity, document.getElementById("mpcarecordersetting"));
                }
                else {
                    newrecordeentity = context.$data;
                    newrecordeentity.Initialise(jsondata);
                }
                validationcontext.setvalidationfor("mpcarecordersetting");
                showloading(false);
                if (newrecordeentity.Status().toLowerCase() == common.constants.devicestatus.OFFLINE.toLowerCase()) {
                    alertify.alert(common.messages.recorder_devoffline_possible_errors)
                }
            }).error(function () {
            });
        }

    }

    var isalreadyloading = false;
    function showloading(isshow) {
        if (isshow && !isalreadyloading) {
            $(".contentarea").showLoading();
            isalreadyloading = true;
        }
        else if (!isshow && isalreadyloading) {
            $(".contentarea").hideLoading();
            isalreadyloading = false;
        }
    }
    $.subscribe(common.events.systemeventreceived, function (eventName, data) {
        if (data[0][window.mpcglobal.eventschema.EventCode] == window.mpcglobal.eventcodes.CONFIG_UPLOAD) {
            var context = ko.contextFor($("#mpcarecordersetting")[0]);
            if (context != undefined && context.$data != undefined
                && data[0][window.mpcglobal.eventschema.SourceId] == context.$data.Id
                && data[0][window.mpcglobal.eventschema.SourceType].toLowerCase() == common.constants.entitytype.toLowerCase()
                && context.$data.IsConfigUploaded() == false) {
                context.$data.dorefresh();
            }
        }
        else if (data[0][window.mpcglobal.eventschema.EventCode] == window.mpcglobal.eventcodes.RECORDER_CONNECTED) {
            var context = ko.contextFor($("#mpcarecordersetting")[0]);
            if (context != undefined && context.$data != undefined
                && data[0][window.mpcglobal.eventschema.SourceId] == context.$data.Id
                && data[0][window.mpcglobal.eventschema.SourceType].toLowerCase() == common.constants.entitytype.toLowerCase()
                && context.$data.IsRegistered() == false) {
                context.$data.dorefresh();
            }
        }
    });

    return configuicontext;
})(jQuery, ko, window.mpcarecorderconfig.datacontext, window.mpcarecorderconfig.validationcontext, window.mpcarecorderconfig.common);