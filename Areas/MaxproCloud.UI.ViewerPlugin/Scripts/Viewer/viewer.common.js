window.viewerconfig = window.viewerconfig || {};
window.viewerconfig.common = (function ($) {
    var constants = {
        treeentities: ["GENERAL", "CUSTOMER", "DEALER", "GROUP", "SITE", "CAMERA", "DOOR"],
        droppableentities: { CAMERA: "camera", DOOR: "door" },
        datetimeformat: Resources.datetimeformat,//"MM/DD/YYYY HH:mm:ss",//
        Exportdatetimeformat: "hh:mm:ss A",
        videostatus: {
            SUCCESS: "success", ERR_DB_DUPLICATE_RECORD: "Duplicate error", MAXIMUM_CONNECTION_EXISTS: "maximumconnectionexists"
        },
        RecordingStatus: {
            Fail: "Fail", CameraDisabled: "CameraDisabled", AlreadyInProgress: "AlreadyInProgress", Success: "Success"
        },
        ExportLocation: {
            OnPC: "onpc", OnDeviceUsb: "ondeviceusb"
        },
        DoorActions: { LOCK: "deenergize", UNLOCK: "energize" },
        DoorStatus: {
            Alarm_Normal: { ALARM: "alarm", NORMAL: "normal" },
            Open_Close: { OPEN: "open", CLOSE: "closed" },
            Lock_Unlock: {LOCK: 'locked', UNLOCK: 'unlocked'},
            Block_Unblock: { BLOCK: "access blocked", UNBLOCK: "unblocked" },
            Panel_Status: { OFFLINE: "panel_offline", ONLINE: "panel_online" }
        },
        Views: { SALVO_LIST: "Salvolist", UNIVERSAL_LIST: "Ulist", ALARM_LIST: "Alarmlist" }
    };
    var Enumeration = {
        DeviceStatus: { DISABLE: "disable" },
        DateRange: { TODAY: "today", YESTERDAY: "yesterday", CUSTOM: "custom" },
        EntityType: { CAMERA: "camera", RECORDER: "recorder", GENERAL: "general", CUSTOMER: "customer", GROUP: "group", PANEL: "panel", SALVO: "salvo", DOOR: "door", READER: "reader", INPUT: "input", OUTPUT: "output", PANEL_INPUT_NODE: "panel_input_node", PANEL_OUTPUT_NODE: "panel_output_node", INPUT_NODE: "input_node", OUTPUT_NODE: "output_node", SCHEDULES: "schedules", CREDENTIALHOLDERS: "credentialholders", SITE: "site", DEALER: "dealer" },
        Salvolayout: { SALVO1X1: "salvo1x1", SALVO2X2: "salvo2x2", SALVO2X3: "salvo2x3", SALVO2X4: "salvo2x4" }
    };
    var events = {
        treeviewitemselectedevent: "treeviewitemselected",
        Salvotreeitemadd: "Salvotreeitemadd",
        Salvotreeitemupdate: "Salvotreeitemupdate",
        clipsearch: "clipsearch",
        universalclipsearch: "universalclipsearch",
        onapptabchangeevent: "ontabchangeevent"
    };

    var issalvoview = false;
    var salvodata = null;
    var filtertype = Enumeration.DateRange.TODAY;
    var cameraId = null;
    var isupdate = false;
    var SiteId = null;
    var cameraArr = [];
    var DoorId = null;
    var RecordPlayError = Resources.Viewer_LiveSessionRecordPlayBackCanotRecorded;
    var VideoError = Resources.Viewer_VideoError;
    var Salnameerror = Resources.viewer_salvonameError;
    var DoorError = Resources.Viewer_DoorError;
    var duplicateCamera = Resources.Viewer_duplicateCamera;
    var duplicateclip = Resources.Viewer_duplicateclip;
    var DateError = Resources.Viewer_Dateerror;
    var TodaydtError = Resources.Viewer_Todaydateerror;
    var yesterdaydtError = Resources.Viewer_Yesterdayerror;
    var ErrorLiveStream = Resources.Viewer_ErrorLiveStream;
    var Requestmsg = Resources.Viewer_Requestmsg;
    var clipsearch = Resources.Viewer_Clipsearch;
    var successfullsearch = Resources.Viewer_Successfullsearch;
    var AlreadyRequesting = Resources.Viewer_AlreadyRequesting;
    var ClipStorageError = Resources.Viewer_ClipStorageError;
    var ClipEventError = Resources.Viewer_ClipEventError;
    var clipresult = Resources.Viewer_ClipResult;
    var clipresulterr = Resources.Viewer_Clipresulterr;
    var camerapublished = Resources.Viewer_camerapublished;
    var clipdroppublished = Resources.Viewer_Clipdroppublished;
    var ClipExportvalidation = Resources.Viewer_Export_Name;
    var duplicatedoor = Resources.Viewer_DuplicateDoor;
    var DoorActionSuccess = Resources.Viewer_DoorAction_Success;
    var DoorActionfailure = Resources.Viewer_DoorAction_Failure;
    var RequestDoorEvent = Resources.Viewer_DoorEvent_request;
    var Viwer_Salvosave = Resources.Viwer_Salvosave;
    var Viewer_salvoUpdate = Resources.Viewer_salvoUpdate;
    var viewer_salvonameerror = Resources.viewer_salvonameerror;
    var viewer_salvosaveerror = Resources.viewer_salvosaveerror;
    var viewer_salvoupdatefailed = Resources.viewer_salvoupdatefailed;
    var viewer_SalvoEmptysalvosaveupdate = Resources.viewer_SalvoEmptysalvosaveupdate;
    var viewe_salvonameduplicateerror = Resources.Viewer_AlreadyExists;
    var videoNoFreeSession = Resources.Viewer_NoFreeSession;
    var device_offline = Resources.DEVICE_OFFLINE;
    var viewersalvominlength = Resources.Salvo_Min;
    var viewersalvomaxlength = Resources.Salvo_Max;

    var playbtnArr = [];
    var clipArr = [];
    var sessionArr = [];
    var RecorderArr = [];
    var treviewmessages = "";
    var Exportpercentage = "";
    var messages = {
        ErrorLiveStream: ErrorLiveStream,
        viewe_salvonameduplicateerror: viewe_salvonameduplicateerror,
        duplicateCamera: duplicateCamera,
        duplicateclip: duplicateclip,
        treviewmessages: treviewmessages,
        Requestmsg: Requestmsg,
        successfullsearch: successfullsearch,
        DateError: DateError,
        ClipEventError: ClipEventError,
        ClipStorageError: ClipStorageError,
        TodaydtError: TodaydtError,
        yesterdaydtError: yesterdaydtError,
        clipresulterr: clipresulterr,
        camerapublished: camerapublished,
        clipdroppublished: clipdroppublished,
        AlreadyRequesting: AlreadyRequesting,
        clipresult: clipresult,
        ClipExportvalidation: ClipExportvalidation,
        duplicatedoor: duplicatedoor,
        DoorActionSuccess: DoorActionSuccess,
        DoorActionfailure: DoorActionfailure,
        VideoError: VideoError,
        DoorError: DoorError,
        RequestDoorEvent: RequestDoorEvent,
        viewer_salvonameerror: viewer_salvonameerror,
        Viwer_Salvosave: Viwer_Salvosave,
        Viewer_salvoUpdate: Viewer_salvoUpdate,
        viewer_salvosaveerror: viewer_salvosaveerror,
        viewer_salvoupdatefailed: viewer_salvoupdatefailed,
        viewer_SalvoEmptysalvosaveupdate: viewer_SalvoEmptysalvosaveupdate,
        RecordPlayError: RecordPlayError,
        videoNoFreeSession: videoNoFreeSession,
        device_offline: device_offline,
        viewersalvominlength: viewersalvominlength,
        viewersalvomaxlength: viewersalvomaxlength,
        plsinstflashplayer: Resources.plsinstflashplayer,
        instflsplgn: Resources.instflsplgn,
        clicktodownloadflashplayer: Resources.clkdwnadbflsplr
    };
    function convertToJSONDate(strDate) {
        var dt = new Date(strDate);
        var newDate = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds(), dt.getMilliseconds()));
        return newDate.getTime();
    }

    function getPlayerLoadingImage() {
        return $("#viewerpagebody").attr('data-playerimage')
    }
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

    function getviewerfootermenus() {

        return [
                    //{ id: "snapshot", title: 'Snapshot', iconclass: 'footericon footerSnapshot', popovercontentid: '', isvisible: '' },
                    { id: "Clip", title: Resources.lbl_Clip, iconclass: 'footericon footerClip', popovercontentid: 'clipSearchtemplate', isvisible: '', ishide: '' },
                    { id: "Recordall", title: Resources.Viewer_RecordAll, iconclass: 'footericon footerRecord', popovercontentid: '', isvisible: '', ishide: '' },
                    { id: "Record", title: Resources.Viewer_Record, iconclass: 'footericon footerRecord', popovercontentid: '', isvisible: 'showRecord', ishide: 'hideRecord' },
                    { id: "FullScreen", title: Resources.Fullscreen, iconclass: 'footericon footerFullscreen', popovercontentid: '', isvisible: '', ishide: '' },
                    { id: "NewSalvo", title: Resources.Viewer_NewSalvo, iconclass: 'footericon footerNewSalvo', popovercontentid: '', isvisible: '', ishide: '' },
                    { id: "SaveSalvo", title: Resources.Viewer_SaveSalvo, iconclass: 'footericon footerSaveSalvo', popovercontentid: '', isvisible: '', ishide: '' },
        ];
    }

    function getUlistitem() {

        return [
                    { id: constants.Views.UNIVERSAL_LIST, title: Resources.Viewer_UniversalListText, ishide: 'hideRecord' },
                    { id: constants.Views.SALVO_LIST, title: Resources.Salvos, ishide: '' }
        ];
    }

    // salvo selection 
    var salvomode = { GRID1: "grid1", GRID4: "grid4", GRID6: "grid6", GRID8: "grid8", GRID9: "grid9" };

    function ConvertSalvoLayoutToGrid(sLayout) {
        var gridoption = salvomode.GRID8;
        switch (sLayout.toLowerCase()) {
            case Enumeration.Salvolayout.SALVO1X1.toLowerCase():
                gridoption = salvomode.GRID1;
                break;
            case Enumeration.Salvolayout.SALVO2X2.toLowerCase():
                gridoption = salvomode.GRID4;
                break;
            case Enumeration.Salvolayout.SALVO2X3.toLowerCase():
                gridoption = salvomode.GRID6;
                break;
            case Enumeration.Salvolayout.SALVO2X4.toLowerCase():
                gridoption = salvomode.GRID8;
                break;
        }
        return gridoption;
    }
    function ConvertGridSalvoLayout(grid) {
        var sLayout = Enumeration.Salvolayout.SALVO2X4.toLowerCase();
        switch (grid.toLowerCase()) {
            case salvomode.GRID1:
                sLayout = Enumeration.Salvolayout.SALVO1X1.toLowerCase();
                break;
            case salvomode.GRID4:
                sLayout = Enumeration.Salvolayout.SALVO2X2.toLowerCase();
                break;
            case salvomode.GRID6:
                sLayout = Enumeration.Salvolayout.SALVO2X3.toLowerCase();
                break;
            case salvomode.GRID8:
                sLayout = Enumeration.Salvolayout.SALVO2X4.toLowerCase();
                break;
        }
        return sLayout;
    }

    var getPhotoPath = function (BlobId) {
        var url = "/UserConfig/GetPhoto?uid=" + BlobId + "&bThumb=true";
        return url;
    }
    return {

        salvomode: salvomode,
        getPlayerLoadingImage: getPlayerLoadingImage,
        Enumeration: Enumeration,
        messages: messages,
        constants: constants,
        events: events,
        createUUID: createUUID,
        cameraArr: cameraArr,
        clipArr: clipArr,
        SiteId: SiteId,
        playbtnArr: playbtnArr,
        sessionArr: sessionArr,
        RecorderArr: RecorderArr,
        clipsearch: clipsearch,
        getviewerfootermenus: getviewerfootermenus,
        convertToJSONDate: convertToJSONDate,
        cameraId: cameraId,
        isupdate: isupdate,
        filterType: filtertype,
        ClipResult: clipresult,
        Exportpercentage: Exportpercentage,
        DoorId: DoorId,
        getUlistitem: getUlistitem,
        salvodata: salvodata,
        issalvoview: issalvoview,
        ConvertSalvoLayoutToGrid: ConvertSalvoLayoutToGrid,
        ConvertGridSalvoLayout: ConvertGridSalvoLayout,
        getPhotoPath: getPhotoPath
    };
})(jQuery);
