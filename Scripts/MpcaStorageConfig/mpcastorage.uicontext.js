/// <reference path="mpcastorage.common.js" />
/// <reference path="mpcastorage.model.js" />
/// <reference path="mpcastorage.datacontext.js" />
/// <reference path="mpcastorage.validationcontext.js" />
window.mpcastorageconfig.uicontext = (function ($, ko, datatcontext, validationcontext, common) {
    var configuicontext = {
        onmpcastorageselectionchanged: onmpcastorageselectionchanged,
        validateform: validateform
    }

    var currentData = null;

    function onmpcastorageselectionchanged(data) {
        currentData = data;
        datatcontext.onmpcastorageselected(currentData);
        setactivesettingform();
    }
    function validateform() {
        return validationcontext.validateForm("mpcastoragesetting");
    }

    function setactivesettingform() {
        if (currentData && currentData.parentnodedata) {
            if (currentData.nodedata.EntityType.toLowerCase() == common.constants.entitytype
                && currentData.parentnodedata
                && currentData.parentnodedata.EntityType && currentData.parentnodedata.EntityType.toLowerCase() == common.constants.parententitytype
                && currentData.parentnodedata.DeviceType && currentData.parentnodedata.DeviceType.Name && currentData.parentnodedata.DeviceType.Name.toLowerCase() == common.constants.parentdevicetype) {
                loadmpcastorageconfigform();
            }
        }
    }
    function loadmpcastorageconfigform() {
        hideallforms();
        $("[data-accounttype='MPCADEVICECONFIGWRAPPER']").addClass("settingsform_active");
        $("[data-accounttype='MPCASTORAGECONFIG']").addClass("settingsform_active");
        showloading(true);
        binddatatoactiveform();
    }
    function hideallforms() {
        $("[data-accounttype]").removeClass("settingsform_active");
        $("[data-accounttype]").addClass("settingsform");
    }
    function binddatatoactiveform() {
        datatcontext.getstoragedetail().done(function (jsondata) {
            if (jsondata.success) {
                var context = ko.contextFor($("#mpcastoragesetting")[0]);
                var newstorageentity;
                if (context == undefined || context.$data == undefined) {
                    newstorageentity = new datatcontext.storageentity();
                    newstorageentity.Initialise(currentData.nodedata.Id, jsondata.data);
                    ko.applyBindings(newstorageentity, document.getElementById("mpcastoragesetting"));
                }
                else {
                    newstorageentity = context.$data;
                    newstorageentity.Initialise(currentData.nodedata.Id, jsondata.data);
                }
                validationcontext.setvalidationfor("mpcastoragesetting");
                showloading(false);
            }
        }).error(function () {
        });
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

    return configuicontext;
})(jQuery, ko, window.mpcastorageconfig.datacontext, window.mpcastorageconfig.validationcontext, window.mpcastorageconfig.common);