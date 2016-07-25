/// <reference path="mpcaoutput.common.js" />
/// <reference path="mpcaoutput.uicontext.js" />

window.mpcaoutput.datacontext = (function ($, common) {
    var outputconfigdatacontext = {
        getoutputdetail: getoutputdetail,
        onmpcaoutputselected: onmpcaoutputselected,
        saveoutputdetail: saveoutputdetail,
        getVMDCameras: getVMDCameras,
        getTriggers: getTriggers,
        ActivateOutput: ActivateOutput
    }
    return outputconfigdatacontext;
    var data = null;
    var currentDevice = null;
    var triggerData = null;
    var vmdCameraData = null;
    function onmpcaoutputselected(data) {
        currentOutput = data;
        triggerData = null;
        vmdCameraData = null;
    }
    function ActivateOutput(recorderId, Currentstate, Address) {
        data = ({ RecorderId: recorderId, Address: Address, Currentstate: Currentstate });
        return ajaxRequest("post", activateOutputurl(),data);
    }
    function getTriggers(recorderId, successcallback, errorcallback) {
        data = ({ recorderId: recorderId });
        if (triggerData) {
            if (successcallback) {
                successcallback(triggerData);
                return;
            }
        }
        return new ajaxRequest("post", getTriggersurl(),data).done(function (jsonresult) {
            if (jsonresult != null && jsonresult != undefined) {
                triggerData = jsonresult;
                if (successcallback) {
                    successcallback(jsonresult);
                }
            }
            else {
                if (errorcallback)
                    errorcallback();
            }
        }).error(function () {
            if (errorcallback)
                errorcallback();
        });
    }
    function getVMDCameras(recorderId, successcallback, errorcallback) {
        data = ({ recorderId: recorderId });
        if (vmdCameraData) {
            if (successcallback) {
                successcallback(vmdCameraData);
                return;
            }
        }
        return new ajaxRequest("post", getVMDCamerasurl(),data).done(function (jsonresult) {
            if (jsonresult != null && jsonresult != undefined) {
                vmdCameraData = jsonresult;
                if (successcallback) {
                    successcallback(jsonresult);
                }
            }
            else {
                if (errorcallback)
                    errorcallback();
            }
        }).error(function () {
            if (errorcallback)
                errorcallback();
        });
    }
    function getoutputdetail(recorderId) {
        data = ({ recorderId: recorderId });
        return ajaxRequest("post", getoutputdetailurl(),data);
    }
    function saveoutputdetail(outputsettings, successcallback, errorcallback) {
        blockUI();
        return new ajaxRequest("POST", saveoutputdetailurl(), outputsettings).done(function (jsonresult) {
            if (jsonresult.success) {
                successcallback(jsonresult);
                unblockUI();
            }
            else {
                errorcallback(jsonresult);
                unblockUI();
            }
        }).error(function () {
        });;
    }

    function activateOutputurl(recorderId, Address, Currentstate) {
        return $("#activateOutputurl").attr("data-url");// + "?RecorderId=" + recorderId + "&Address=" + Address + "&Currentstate=" + Currentstate;
    }

    function getVMDCamerasurl() {
        return $("#mpcaCameraconfigurl").attr("data-url");// + "?recorderId=" + recorderId;
    }

    function getTriggersurl() {
        return $("#mpcaInputconfigurl").attr("data-url");// + "?recorderId=" + recorderId;
    }

    function getoutputdetailurl() {
        return $("#mpcaOutputconfigurl").attr("data-url");// + "?recorderId=" + recorderId;
    }
    function saveoutputdetailurl() {
        return $("#mpcaoutputsaveconfigurl").attr("data-url");
    }

})(jQuery, window.mpcaoutput.common);