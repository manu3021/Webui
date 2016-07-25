/// <reference path="mpcastorage.common.js" />
window.mpcastorageconfig.datacontext = (function ($, common) {
    var configdatacontext = {
        getstoragedetail: getstoragedetail,
        onmpcastorageselected: onmpcastorageselected,
        savestoragedetail: savestoragedetail,
        erasestorage: erasestorage,
        ejectstorage: ejectstorage
    }
    return configdatacontext;
    var data = null;
    var currentDevice = null;
    function onmpcastorageselected(data) {
        currentDevice = data;
    }
    function getstoragedetail() {
        data = ({ recorderId: currentDevice.parentnodedata.Id });
        return ajaxRequest("post", getstoragedetailurl(),data);
    }
    function savestoragedetail(storages, successcallback, errorcallback) {
        var postdata = {
            recorderId: currentDevice.parentnodedata.Id
        , storages: JSON.parse(storages)
        };
        return new ajaxRequest("POST", savestoragedetailurl(), postdata).done(function (jsonresult) {
            if (jsonresult.success) {
                successcallback(jsonresult);
            }
            else {
                errorcallback(jsonresult);
            }
        }).error(function () {
        });
    }
    function erasestorage(storagetype) {
        data = ({ recorderId: currentDevice.parentnodedata.Id, storageType: storagetype });
        ajaxRequest("post", geterasestorageurl(),data);
    }
    function ejectstorage(storagetype) {
        data = ({ recorderId: currentDevice.parentnodedata.Id, storageType: storagetype });
        ajaxRequest("post", getejectstorageurl(),data);
    }
   
    function getstoragedetailurl() {
        return $("#mpcastorageconfigurl").attr("data-url") + "/GetStorageDetail";//?recorderId=" + recorderId;
    }
    function savestoragedetailurl() {
        return $("#mpcastorageconfigurl").attr("data-url") + "/SaveStorageDetail";//?recorderId=" + recorderId;
    }
    function geterasestorageurl() {
        return $("#mpcastorageconfigurl").attr("data-url") + "/EraseDeviceStorage";//?recorderId=" + recorderId + "&storageType=" + storageType;
    }
    function getejectstorageurl() {
        return $("#mpcastorageconfigurl").attr("data-url") + "/EjectDeviceStorage";//?recorderId=" + recorderId + "&storageType=" + storageType;
    }

})(jQuery, window.mpcastorageconfig.common);