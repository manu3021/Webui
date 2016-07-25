window.clipdownload = window.clipdownload || {};

window.clipdownload.common = (function ($) {
    var constants = {
        datetimeformat: Resources.datetimeformat,//"MM/DD/YYYY hh:mm:ss A",
        Exportstatus: {
            SUCCESS: "success", ERR_NO_FREE_SESSION: "err_no_free_session", ERR_SESSION_ALREADY_EXISTS: "err_session_already_exists",
            ERR_WRONG_SESSIONID: "err_wrong_sessionid", ERR_UNEXPECTED: "err_unexpected", ERR_CLIP_NOT_FOUND: "err_clip_not_found", ERR_AUTH_FAILURE: "err_auth_failure",
            MAXIMUM_CONNECTION_EXISTS: "maximumconnectionexists"
        },
    };
    var noFreeSessionExportError = Resources.Viewer_Export_Error;
    var ClipExportvalidation = Resources.Viewer_Export_Name;
    var clip_duplicate = Resources.Clip_download;
    var Clipexportsuccess = Resources.Viewer_ClipExport_success;
    var Clipexportfailure = Resources.Viewer_ClipExport_Error;

    var messages = {
        noFreeSessionExportError: noFreeSessionExportError,
        ClipExportvalidation: ClipExportvalidation,
        Clipexportsuccess: Clipexportsuccess,
        Clipexportfailure: Clipexportfailure,
        clip_duplicate: clip_duplicate
    };    
    var guid = function () {
        this.s4 = function () {
            return Math.floor((1 + Math.random()) * 0x10000)
                       .toString(16)
                       .substring(1);
        }
    };
    guid.prototype.NewGuid = function () {
        return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
              this.s4() + '-' + this.s4() + this.s4() + this.s4();
    }

    function createUUID() {
        var uId = new guid().NewGuid();
        return uId;
    };

    return {
        constants: constants,
        createUUID: createUUID,
        messages: messages
    };
})(jQuery);
