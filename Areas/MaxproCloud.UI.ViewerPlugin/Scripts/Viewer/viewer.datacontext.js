/// <reference path="viewer.uicontext.js" />
/// <reference path="viewer.common.js" />

window.viewerconfig.datacontext = (function ($, ko, common, uicontext) {
    var viewerdatacontext = {
        getLiveurl: getLiveurl,
        oncameraselected: oncameraselected,
        sendStopCameraURL: sendStopCameraURL,
        sendStopCamerarequest: sendStopCamerarequest,
        getCameraStatus: getCameraStatus,
        getCameraclipSearch: getCameraclipSearch,
        clipsearch: clipsearch,
        getLivestream: getLivestream,
        getPlayBackStream: getPlayBackStream,
        sendPlayBackStopRequest: sendPlayBackStopRequest,
        updatedatetimeforfiltertype: updatedatetimeforfiltertype,
        getCameraByAccount: getCameraByAccount,
        getDoorEvent: getDoorEvent,
        getCameraByAccount: getCameraByAccount,
        getassociateddoors: getassociateddoors,
        getClipExportStream: getClipExportStream,
        getExportpercentage: getExportpercentage,
        cancelClipExport: cancelClipExport,
        getdownload: getdownload,
        Dooraction: DoorAction,
        SendRecordingStream: SendRecordingStream,
        SaveSalvo: SaveSalvo,
        UpdateSalvo: UpdateSalvo,
        DeleteSalvo: DeleteSalvo,
        PostPlaybackSeekData: PostPlaybackSeekData


    }
    var data = null;
    function PostPlaybackSeekDataurl()
    {
        var url = $("#PostPlaybackSeekDataurl").attr("data-url");
        return url;
    }
    function PostPlaybackSeekData(clipData, exportUUID, offset) {
        data = ({ clipData: clipData, playbackID: exportUUID, offset: offset });
        return new ajaxRequest("POST", PostPlaybackSeekDataurl(), data);
    }
    function DeleteSalvo(deleteurl) {
        url = deleteurl.toString().split('?')[0];
        queryStr = deleteurl.toString().split('?')[1];
        data = ({});
        var a = queryStr.split('&');
        for (var i = 0; i < a.length; i++) {
            var b = a[i].split('=');
            data[decodeURIComponent(b[0])] = decodeURIComponent(b[1]);
        }
        return ajaxRequest("POST", url, data);
    }

    function getassociateddoorurl() {
        var url = $("#getViewerurl").attr("data-url") + "/GetDoorsByCameraId";
        return url;
    }

    function SendRecordingStreamurl() {
        var url = $("#SendRecordingStreamurl").attr("data-url");
        return url;
    }


    // salvo Management method
    function SaveSalvo(salvoToadd) {
        return ajaxRequest("POST", SaveSalvourl(), salvoToadd);
    }

    // salvo Management method
    function UpdateSalvo(salvoToupdate) {
        return ajaxRequest("POST", UpdateSalvourl(), salvoToupdate);
    }


    function SaveSalvourl() {
        var url = $("#Createsalvourl").attr("data-url");
        return url;
    }

    function UpdateSalvourl() {
        var url = $("#Updatesalvourl").attr("data-url");
        return url;
    }


    //


    function SendRecordingStream(RecordData) {
        data = ({ RecordData: RecordData });
        return new ajaxRequest("POST", SendRecordingStreamurl(), data);

    }

    function getassociateddoors(cameraid) {
        data = ({ camerid: cameraid });
        return new ajaxRequest("POST", getassociateddoorurl(), data);
    }




    function getdownloadurl() {
        var url = $("#getdownloadurl").attr("data-url");
        return url;
    }

    function getdownload(fileurl, callback) {
        data = ({ fileurl: fileurl });
        return new ajaxRequest("POST", getdownloadurl(),data).done(function (jsondata) {
            if (callback) {
                callback(jsondata);
            }
        });
    }

    function getExportpercentageurl() {
        var url = $("#getexportpercentageurl").attr("data-url");
        return url;
    }
    function Dooractionurl() {
        var url = $("#Performaction").attr("data-url");
        return url;
    }

    function CancelClipExporturl() {
        var url = $("#Cancelclipexporturl").attr("data-url");
        return url;
    }

    function DoorAction(actionname, DoorId) {
        data = ({ actionname: actionname, DoorId: DoorId });
        return new ajaxRequest("POST", Dooractionurl(), data);
    }

    function cancelClipExport(exportmodel) {
        data = ({ CameraId: exportmodel.Clipdetails.CameraId, sessionId: exportmodel.sessionid, ISLocal: exportmodel.Clipdetails.Local() });
        return new ajaxRequest("POST", CancelClipExporturl(), data);
    }

    function getExportpercentage(clipData, exportUUID) {
        data = ({ clipData: clipData, exportUUID: exportUUID });
        return new ajaxRequest("POST", getExportpercentageurl(), clipData);
    }

    function updatedatetimeforfiltertype(target) {
        window.viewerconfig.uicontext.updatedatetimeforfiltertype(target);
    }
    function oncameraselected(data) {
        currentSelectedcamera = data;
    }
    function getCameraByAccountUrl() {
        var url = $("#getViewerurl").attr("data-url") + "/GetCamerasByAccounts";
        return url;
    }
    function getdoordetailurl() {
        var url = $("#getdoordetailurl").attr("data-url");
        return url;
    }

    function getCameraStatus() {
        var url = $("#getAllCamerawithStatusurl").attr("data-url");
        return url;
    }
    function getCameraclipSearch(cameraId) {
        var url = $("#getCameraClipSearch").attr("data-url");
        return url;
    }


    function getDoorEvent(DoorId, doortype, Startindex, Maxrow) {
        data = ({ doorId: DoorId, entityType: doortype, startindex: Startindex, Maxrow: Maxrow });
        return ajaxRequest("POST", getdoordetailurl(),data);
    }

    function clipsearch(clipviewmodel, cameraId, callback, errorcallback) {
        clipviewmodel.ClipFiltermodel.cameraId = cameraId;
        data = clipviewmodel.ClipFiltermodel;
        //if (typeof data.FromDatetime() == "string") {
        //    data.FromDatetime(data.FromDatetime().toDate());
        //    data.ToDatetime(data.ToDatetime().toDate());
        //}        
        ajaxRequest("POST", getCameraclipSearch(), data).done(function (jsondata) {
            if (jsondata != null) {
                clipviewmodel.AddClipResult(jsondata);
            }
            if (callback != undefined)
                callback(cameraId);
        }).error(function () {
            if (errorcallback != undefined)
                errorcallback();
        });
    }
    function getCameraByAccount(checkeditems, callback) {
        data = ({ checkeditems: checkeditems });
        ajaxRequest("POST", getCameraByAccountUrl(), data).done(function (jsondata) {
            if (callback != undefined) {
                callback(jsondata);
            }
        });
    }
    function getLivestream(cameraid, sessionid) {
        data = ({ cameraId: cameraid, Id: sessionid });
        return new ajaxRequest("POST", getLiveurl(),data);
    }
    function sendPlayBackStopRequest(cameraId, Id) {
        data = ({ cameraId: cameraId, Id: Id });
        return new ajaxRequest("POST", getPlaybackStopurl(), data);
    }
    function getPlayBackStream(clipData, PlaybackUUID) {
        var tzoffset = (new Date().getTimezoneOffset()) * -1;
        data = ({ clipData: clipData, PlaybackUUID: PlaybackUUID, timeZoneOffset: tzoffset });
        return new ajaxRequest("POST", getPlaybackurl(), data);
    }

    function getpercentage(DoorId, doortype, Startindex, Maxrow) {
        data = ({ DoorId: DoorId, doortype: doortype, Startindex: Startindex, Maxrow: Maxrow });
        return ajaxRequest("POST", getPercentage(), data);
    }
    function getprencentage(clipData, exportUUID) {
        var tzoffset = (new Date().getTimezoneOffset()) * -1;
        data = ({ clipData: clipData, exportUUID: exportUUID, timeZoneOffset: tzoffset });
        return new ajaxRequest("POST", getClipexporturl(), clipData);
    }

    function getClipexporturl() {
        var url = $("#getclipexporturl").attr("data-url");
        return url;
    }
    function getClipExportStream(clipData, exportUUID) {
        var tzoffset = (new Date().getTimezoneOffset()) * -1;
        data = ({ clipData: clipData, exportUUID: exportUUID, timeZoneOffset: tzoffset });
        return new ajaxRequest("POST", getClipexporturl(), clipData);
    }

    function getPlaybackurl() {
        var url = $("#getplayBackStream").attr("data-url");
        return url;
    }
    function getLiveurl() {
        var url = $("#getLiveUrl").attr("data-url");
        return url;
    }
    function getPlaybackStopurl() {
        var url = $("#playbackStopRequest").attr("data-url");
        return url;
    }
    function sendStopCamerarequest(cameraId, sessoinId) {
        data = ({ cameraId: cameraId, Id: sessoinId });
        return new ajaxRequest("Post", sendStopCameraURL(), data);
    }
    function sendStopCameraURL() {
        var url = $("#SendstopRequestUrl").attr("data-url");
        return url;

    }


    return viewerdatacontext;
})($, ko, window.viewerconfig.common, window.viewerconfig.uicontext);