/// <reference path="downloadeventreciever.js" />

window.clipdownload = window.clipdownload || {};
window.clipdownload.datacontext = (function ($, ko) {

    var clipdownloaddatacontext = {
        getClipExportStream: getClipExportStream,
        getExportpercentage: getExportpercentage,
        cancelClipExport: cancelClipExport,
        getdownload: getdownload,
    }
    var data = null;

    function getdownloadurl() {
        var url = $("#getdownloadurl").attr("data-url");
        return url;
    }
    function getdownload(fileurl, callback) {
        data = ({ fileurl: fileurl });
        return new ajaxRequest("GET", getdownloadurl(), data).done(function (jsondata) {
            if (callback) {
                callback(jsondata);
            }
        });
    }

    function getExportpercentageurl() {
        var url = $("#getexportpercentageurl").attr("data-url");
        return url;
    }

    function CancelClipExporturl() {
        var url = $("#Cancelclipexporturl").attr("data-url");
        return url;
    }


    function cancelClipExport(exportmodel) {
        data = ({ CameraId: exportmodel.Clipdetails.CameraId, sessionId: exportmodel.sessionid, ISLocal: exportmodel.Clipdetails.Local() });
        return new ajaxRequest("POST", CancelClipExporturl(), data);
    }

    function getExportpercentage(clipData, exportUUID) {
        clipData.exportUUID = exportUUID;
        return new ajaxRequest("POST", getExportpercentageurl(), clipData);
    }

    function getprencentage(clipData, exportUUID) {
        var timeZoneOffset = (new Date().getTimezoneOffset()) * -1;
        clipData.exportUUID = exportUUID;
        clipData.timeZoneOffset = timeZoneOffset;
        return new ajaxRequest("POST", getClipexporturl(), clipData);
    }

    function getClipexporturl() {
        var url = $("#getclipexporturl").attr("data-url");
        return url;
    }
    function getClipExportStream(clipData, exportUUID) {
        var timeZoneOffset = (new Date().getTimezoneOffset()) * -1;
        clipData.timeZoneOffset = timeZoneOffset;
        clipData.exportUUID = exportUUID;
        return new ajaxRequest("POST", getClipexporturl(), clipData);
    }


    return clipdownloaddatacontext;
})($, ko);