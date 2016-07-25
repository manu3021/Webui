/// <reference path="mpcainput.common.js" />
window.mpcainput.datacontext = (function ($, common) {
    var inputconfigdatacontext = {
        getinputdetail: getinputdetail,
        onmpcainputselected: onmpcainputselected,
        saveInputdetail: saveinputdetail,
        getInputstatus: getInputstatus
    }
    var data = null;

    var currentDevice = null;
    function onmpcainputselected(data) {
        currentinput = data;
    }
    function getInputstatus(recorderId) {
        data = ({ recorderId: recorderId });
        return ajaxRequest("post", getInputstatusurl(),data);
    }
    function getinputdetail(recorderId) {
        data = ({ recorderId: recorderId });
        return ajaxRequest("post", getInputdetailurl(),data);
    }
    function saveinputdetail(inputsettings, successcallback, errorcallback) {
        return new ajaxRequest("POST", saveinputdetailurl(), inputsettings).done(function (jsonresult) {
            if (jsonresult.success) {
                successcallback(jsonresult);
            }
            else {
                errorcallback(jsonresult);
            }
        }).error(function () {
        });;
    }


    function getInputdetailurl(recorderId) {
       
        return $("#mpcainputconfigurl").attr("data-url");//+ "?recorderId=" + recorderId;
    }
    function saveinputdetailurl() {
        return $("#mpcainputsaveconfigurl").attr("data-url");
    }
    function getInputstatusurl() {
        return $("#mpcagetInputstatusurlurl").attr("data-url");//+ "?recorderId=" + recorderId;
    };

    return inputconfigdatacontext;
})(jQuery, window.mpcainput.common);