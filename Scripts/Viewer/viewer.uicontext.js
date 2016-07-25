/// <reference path="viewer.common.js" />
/// <reference path="viewer.eventreciever.js" />
/// <reference path="viewer.datacontext.js" />
/// <reference path="../Jwplayer/jwplayer.js" />
/// <reference path="viewer.clipsearch.js" />
/// <reference path="~/Scripts/mpc.widget.core.js" />
/// <reference path="viewer.validation.js" />
/// <reference path="viewer.salvo.js" />
/// <reference path="viewer.universial.js" />
/// <reference path="viewer.websoket.js" />
/// <reference path="viewer.salvomanagement.js" />

window.viewerconfig.uicontext = (function ($, ko, common, datacontext, jwplayer, clipsearch, salvolayout, websoket, salvomanagement) {
    var createcontrol = false;
    var currentPopoverTarget = null;
    var CurrentUllistitem = common.constants.Views.UNIVERSAL_LIST;
    var Currentpanel = null;
    var currentcontext11 = null;
    var currentDoorsPopoverTarget = null;
    var currentSavePopoverTarget = null;
    var currentSelecteditem = null;
    var LiveSalvoArr = [];
    var SlavoArr = [];
    var slavoele = null;
    var viewerHdr = null;
    var cameraId = null;
    var UlistOpen = false;
    var clipresultmodel = null;
    var selectedClipresult = null;
    var percentageresult = null;
    var ISSingle = false;
    var Currentexportmodel = null;
    var startdate = null;
    var Enddate = null;
    var ClipStartDate = null;
    var ClipEndDate = null;
    var salvodata = null;
    var isdropdownshown = false;
    var isflashplayerinstalled = false;
    modalOptions = { show: true, keyboard: false, backdrop: "static" },
    modalDialougs = {
        Clipexportmodal: "#exportClipModal"
    },
    configforms = {
        clipExportform: "clipExport_form",
        clipExportModalForm: "clipexportmodal_form"
    };

    $("#Ulistitem").css("display", "none");
    $("#salvotreeitem").css("display", "none");
    $(".navbar").css("display", "block");
    $(".icon-up").css("display", "none");
    $(".icon-fieldError").css("display", "block");


    var ulstfiltertype = common.Enumeration.DateRange.TODAY;
    var sngfiltertype = common.Enumeration.DateRange.TODAY;
    var currentpnl = null;
    vieweruicontext = {
        hideexportModal: hideExportModal,
        initialize: initialize,
        enableuniversalclipsearch: enableuniversalclipsearch,
        douniversalclipsearch: douniversalclipsearch,
        updatedatetimeforfiltertype: updatedatetimeforfiltertype,
        Hidepopover: Hidepopover,
        cameraId: cameraId,
        HideclipsearchFilter: HideclipsearchFilter,
        showClipResult: showClipResult,
        validateclipsearchfilter: validateclipsearchfilter,
        getfulscreenviewer: getfulscreenviewer,
        getFullScreen: getFullScreen,
        RetryVideoStream: RetryVideoStream,
        hideError: hideError,
        showError: showError,
        showdoorassociation: showdoorassociation,
        sngfiltertype: sngfiltertype,
        getWebsoketvents: getWebsoketvents,
        showClipExport: showClipExport,
        sngfiltertype: sngfiltertype,
        ClipExport: getClipExportStream,
        hiderecord1: hiderecord1,
        showPath: showPath,
        hidePath: hidePath,
        getDoorLiveEvent: getDoorLiveEvent,
        Performaction: Performaction,
        RecordAll: Recordlivestream,
        currentpnl: currentpnl,
        showrecord: showrecord,
        selectUniversalOption: selectUniversalOption,
        //SaveSalvo: SaveSalvo,
        getLiveUrlStream: getLiveUrlStream,
        ontreeitemselected: ontreeitemselected,
        Treeitemselectionchanged: Treeitemselectionchanged,
        Hidesalvosavepopover: Hidesalvosavepopover,
        makesalvodroprecieverforcamera: makesalvodroprecieverforcamera,
        updateUITreeSalvoOnNewSalvo: updateUITreeSalvoOnNewSalvo,
        OpenSalvopopover: OpenSalvopopover,
        //updatesalvotree: updatesalvotree,
        validateExportdate: validateExportdate,
        CallbackUpdateSalvo: CallbackUpdateSalvo,
        CallbackSaveNewSalvo: CallbackSaveNewSalvo,
        checkforplayersupport: checkforplayersupport,
        //FillCurrentSelectedItemEntityItemField: FillCurrentSelectedItemEntityItemField
        showUniversalView: showUniversalView
    }


    function TwoDigits(val) {
        if (val < 10) {
            return "0" + val;
        }

        return val;
    }
    function getExportform() {
        $('#exportClipModal').show();
    }
    function selectUniversalOption(ulistmodelid) {
        isdropdownshown = false;
        $(".icon-down").css("display", "inline-block");
        switch (ulistmodelid) {
            case common.constants.Views.SALVO_LIST:
                var divele = $(document).find("#universalListHeading")
                $(divele).children("span[id = 'ulheader']").text(Resources.Viewer_SalvoList);
                $("#treeitem").css("display", "none");
                $("#Ulistitem").css("display", "none");
                $("#Ulist").css("display", "block");
                $("#Salvolist").css("display", "none");
                $("#salvotreeitem").css("display", "block");
                salvotreeviewPlugin.getInstance().initialize($("#salvotree"));
                $("#Alarmlist").css("display", "block");
                $(".icon-up").css("display", "none");
                $("#viewer-universal-list .navbar").css("display", "none");
                break;
            case common.constants.Views.UNIVERSAL_LIST:
                var divele = $(document).find("#universalListHeading")
                $(divele).children("span[id = 'ulheader']").text(Resources.Viewer_UniversalListText);
                $("#treeitem").css("display", "block");
                $("#Ulistitem").css("display", "none");
                $("#Ulist").css("display", "none");
                $("#Salvolist").css("display", "block");
                $("#salvotreeitem").css("display", "none");
                $("#Alarmlist").css("display", "block");
                $(".icon-up").css("display", "none");
                $("#viewer-universal-list .navbar").css("display", "block");
                break;

            case common.constants.Views.ALARM_LIST:
                var divele = $(document).find("#universalListHeading")
                $(divele).children("span[id = 'ulheader']").text("Alarm List");
                $("#Ulist").css("display", "block");
                $("#Salvolist").css("display", "block");
                $("#Alarmlist").css("display", "none");

                break;
        }
        CurrentUllistitem = ulistmodelid;
    }
    //function SaveSalvo() {
    //    var Salvo = $("#clpsrch")[0];
    //    var context = ko.contextFor(Clipsearch);
    //}
    function showrecord() {
        var Recordele = $(document).find("#Recordall");
        var Recordoneele = $(document).find("#Record");
        $(Recordoneele).addClass("showrecord");
        $(Recordele).addClass("hiderecord");
    }


    function OpenSalvopopover(data, event) {
        //common.isupdate = true;
        currentSavePopoverTarget = event.currentTarget;
        var isPopoverShown = $(currentSavePopoverTarget).attr("data-ispopovershown");
        if (isPopoverShown == undefined && isPopoverShown == null) {
            $(currentSavePopoverTarget).attr("data-ispopovershown", true);
            $(currentSavePopoverTarget).popover({
                title: Resources.Viewer_SaveSalvo,
                html: true,
                content: $("#savesalvo").html(),
                trigger: 'click',
                placement: 'top'
            }).on('shown', function () {
                onsavesalvopopovershown()
            }).popover("show");
        }

    }

    function hiderecord1() {
        var Recordele = $(document).find("#Recordall");
        var Recordoneele = $(document).find("#Record");
        $(Recordoneele).removeClass("showrecord");
        $(Recordele).removeClass("hiderecord");
    }



    function showdoorassociation(target) {
        if (currentDoorsPopoverTarget) {
            currentDoorsPopoverTarget = null;
            return;
        }
        var ctxt = ko.contextFor(target);
        var pmodel = ctxt.$data;
        if (pmodel != undefined && pmodel != null && pmodel.sessionmodel != undefined
            && pmodel.sessionmodel.cameraid() != undefined && pmodel.sessionmodel.cameraid() != "") {
            currentDoorsPopoverTarget = target;
            pmodel.associateddoors([]);
            datacontext.getassociateddoors(pmodel.sessionmodel.cameraid()).done(function (jsondata) {
                if (jsondata != null) {
                    if (jsondata.length <= 0) {
                        return;
                    }
                    $.map(jsondata, function (item) {
                        var doormdl = new window.viewerconfig.datacontext.Doormodel(item);
                        pmodel.associateddoors().push(doormdl);
                    });
                    showdoorpopover();
                    ko.applyBindings(pmodel, document.getElementById("camdoorasc"));
                }
            }).error(function () {
            });
        }
    }


    function showdoorpopover() {
        var isPopoverShown = $(currentDoorsPopoverTarget).attr("data-ispopovershown");
        if (isPopoverShown == undefined && isPopoverShown == null) {
            $(currentDoorsPopoverTarget).attr("data-ispopovershown", true);
            $(currentDoorsPopoverTarget).popover({
                title: "",
                html: true,
                content: $("#doorassociationpaneltmpl").html(),
                trigger: 'click',
                placement: 'bottom'
            }).on('shown', function () {
            }).on('hidden', function () {
            }).popover("show");
        }
    }
    function Hidedoorpopover() {
        if (currentDoorsPopoverTarget) {
            $(currentDoorsPopoverTarget).popover('hide');
            $(currentDoorsPopoverTarget).hide();
        }
        currentDoorsPopoverTarget = null;
    }




    /*  Footer Section Starts : Footer viewmodel is required for the footer menu */
    var footermodel = function (data) {
        var self = this;
        self.id = data.id;
        self.title = data.title;
        self.iconclass = data.iconclass;
        if (data.ishide != "hideRecord")
            self.shouldShowfooter = true;
        else
            self.shouldShowfooter = false;

        self.popovercontentid = data.popovercontentid;
        self.footermenuclick = function (data, event) {
            var footerid = self.id.toLowerCase()
            switch (footerid) {

                case "fullscreen":
                    var salvocontext = ko.contextFor($("#viewersalvowrapper")[0]);
                    var salvoviewmodel = salvocontext.$data;
                    //   salvoviewmodel.panelmodel.isclosevisible(false);
                    if (datacontext.CurrentPanelmodel != undefined && datacontext.CurrentPanelmodel != null) {
                        salvoviewmodel.OnSelectedsalvofullscreen(UlistOpen);
                        $("#fullExitId").css("display", "block");
                    }
                    else {
                        salvoviewmodel.OnFullscreenClick(UlistOpen);
                        $("#fullExitId").css("display", "block");
                    }
                    break;
                case "record":
                case "recordall":
                    var salvocontext = ko.contextFor($("#viewersalvowrapper")[0]);
                    var salvoviewmodel = salvocontext.$data;
                    if (datacontext.CurrentPanelmodel == undefined && datacontext.CurrentPanelmodel == null) {
                        salvoviewmodel.OnGetRecordAlldata();
                    }
                    else {
                        /*
                        [USP-3162] Fix - Praneesh 30 Jan 2015
                        */
                        var isLiveVideo = datacontext.CurrentPanelmodel.IsLive();
                        if (isLiveVideo) {
                            salvoviewmodel.OnGetRecordSingleCameraData();
                        } else {
                            alertify.alert(Resources.Viewer_LiveStreamToRecord);
                        }
                        /*
                           [USP-3162 Fix - Close]
                       */
                    }
                    break;
                case "savesalvo":
                    var salvocontext = ko.contextFor($("#viewersalvowrapper")[0]);
                    var salvoviewmodel = salvocontext.$data;
                    if (!salvoviewmodel.OncheckActiveSalvoList(data, event))
                        alertify.alert(Resources.Viewer_AtleastOneLiveViewSaveSalvo);
                    break;
                case "newsalvo":
                    var context = ko.contextFor($("#viewersalvowrapper")[0]);
                    ClearAllPanels(context.$data);
                    break;

                    break;
                case "clip":
                    if (datacontext.CurrentPanelmodel != undefined && datacontext.CurrentPanelmodel != null && datacontext.CurrentPanelmodel.sessionmodel != undefined
                        && datacontext.CurrentPanelmodel.sessionmodel.cameraid() != undefined) {
                        common.cameraId = datacontext.CurrentPanelmodel.sessionmodel.cameraid();
                        ISSingle = true;
                        currentPopoverTarget = event.currentTarget;
                        var isPopoverShown = $(currentPopoverTarget).attr("data-ispopovershown");
                        if (isPopoverShown == undefined && isPopoverShown == null) {
                            $(currentPopoverTarget).attr("data-ispopovershown", true);
                            $(currentPopoverTarget).popover({
                                title: "",
                                html: true,
                                content: $("#" + self.popovercontentid).html(),
                                trigger: 'click',
                                placement: 'top'
                            }).on('shown', function () {
                                onpopovershown()
                            }).popover("show");
                        }
                    }
                    break;
                default: break;
            }
        }
    }

    function onsavesalvopopovershown() {
        //if (datacontext.CurrentPanelmodel == undefined || datacontext.CurrentPanelmodel == null) {
        //    Hidesalvosavepopover();
        //    return;
        //}
        //if ((datacontext.CurrentPanelmodel.sessionmodel = undefined) && (datacontext.CurrentPanelmodel.sessionmodel != null))
        //    var cameraid = datacontext.CurrentPanelmodel.sessionmodel.cameraid();
        //if ((datacontext.CurrentPanelmodel.doorsessionmodel = undefined) && (datacontext.CurrentPanelmodel.doorsessionmodel != null))
        //    var doorid = datacontext.CurrentPanelmodel.doorsessionmodel.doorid();

        //if ((cameraid == undefined || cameraid == "") ||  (doorid == undefined || doorid == "")){
        //    Hidesalvosavepopover();
        //    return;
        //}
        var salvoviewmodel = new window.viewerconfig.datacontext.SalvomanageViewmodel();
        var base = ko.contextFor(document.getElementById("viewersalvowrapper"));
        //if (base.$data.Salvoname() != null)
        //    window.viewerconfig.common.Salvoname = base.$data.Salvoname();
        salvoviewmodel.Name(base.$data.Salvoname());
        ko.applyBindings(salvoviewmodel/*base.$data*/, document.getElementById("salvoSaveContent1"));
        window.viewerconfig.validationcontext.setvalidationfor('salvoSaveContent1');

    }

    function Recordlivestream(RecordData) {
        /*
            [USP-3304] Fix - Praneesh 30 Jan 2015
        */
        //Check if RecordData (this holds only the salvos that have some data) object has atleast some data before sending the query out
        var noOfEmptySalvosSelectedEmpty = 0;
        for (var index = 0; index < RecordData.length; index++) {
            if (!(RecordData[index].length)) {  //Checking the length of CameraId 
                noOfEmptySalvosSelectedEmpty++;
            }
        }
        if (noOfEmptySalvosSelectedEmpty) {
            alertify.alert(Resources.Viewer_LiveSessionRecordPlayBackCanotRecorded);
            return;
        }
        /*
            [USP-3304 Fix - Close]
        */
        datacontext.SendRecordingStream(RecordData).done(function (jsondata) {
            var stream = jsondata;
            if (stream.Success && stream.data) {
                if (stream.data.length == 1) {
                    //For single camera
                    if (stream.data[0].Status.toLowerCase() == common.constants.RecordingStatus.AlreadyInProgress.toLowerCase()) {
                        alertify.error(Resources.Viewer_UserRecordingAlreadyProgress);
                    }
                    else if (stream.data[0].Status.toLowerCase() == common.constants.RecordingStatus.Success.toLowerCase()) {
                        alertify.success(Resources.Viewer_UserRecordingSuccess);
                    }
                    else {
                        alertify.error(Resources.Viewer_UserRecordingFailed);
                    }
                }
                else {
                    //For multiple cameras
                    var failcameras = "";
                    var alrycameras = "";
                    var discameras = "";
                    var successcnt = 0;
                    for (var i = 0; i < stream.data.length; i++) {
                        if (stream.data[i].Status.toLowerCase() == common.constants.RecordingStatus.Fail.toLowerCase()) {
                            failcameras += stream.data[i].Name + ",";
                        }
                        else if (stream.data[i].Status.toLowerCase() == common.constants.RecordingStatus.AlreadyInProgress.toLowerCase()) {
                            alrycameras += stream.data[i].Name + ",";
                        }
                        else if (stream.data[i].Status.toLowerCase() == common.constants.RecordingStatus.CameraDisabled.toLowerCase()) {
                            discameras += stream.data[i].Name + ",";
                        }
                        else if (stream.data[i].Status.toLowerCase() == common.constants.RecordingStatus.Success.toLowerCase()) {
                            successcnt++;
                        }
                    }

                    var errmessage = "";
                    if (successcnt != stream.data.length) {
                        if (failcameras != "") {
                            errmessage += "<br/> " + Resources.Viewer_ErrorMsg_1 + ": " + failcameras.substring(0, failcameras.length - 1);
                        }
                        if (alrycameras != "") {
                            errmessage += "<br/> " + Resources.Viewer_ErrorMsg_2 + ": " + alrycameras.substring(0, alrycameras.length - 1);
                        }
                        if (discameras != "") {
                            errmessage += "<br/> " + Resources.Viewer_ErrorMsg_3 + ": " + discameras.substring(0, discameras.length - 1);
                        }
                    }
                    var finalmsg = Resources.Viewer_finalMsg + ' <br/>' + Resources.Success + ': ' + successcnt + errmessage;
                    alertify.alert(finalmsg);
                }
            }
            else {
                alertify.error(Resources.Viewer_UserRecordingFailedWithDot);
            }
        });
        //var Todate = Date.today()
        //Todate = Todate.setHours(23, 59, 59, 0);
        //Todate = convertdatetimetostring(Todate);
        //var clipviewmodel = new datacontext.ClipViewmodel(true);
        //clipviewmodel.ClipFiltermodel.FromDatetime(Fromdate);
        //clipviewmodel.ClipFiltermodel.ToDatetime(Todate);
        //clipviewmodel.ClipFiltermodel.IsSchedule(true);
        //clipviewmodel.ClipFiltermodel.IsMotionEvent(true);
        //clipviewmodel.ClipFiltermodel.IsTriggerEvent(true);
        //clipviewmodel.ClipFiltermodel.IsOnsite(true);
        //clipviewmodel.ClipFiltermodel.IsUserdriven(true);
        //clipviewmodel.ClipFiltermodel.IsRuledriven(true);
        //clipviewmodel.CameraName(datacontext.CurrentPanelmodel.sessionmodel.cameraname());
        //datacontext.clipsearch(clipviewmodel, cameraid, function (callbackid) {
        //    if (clipviewmodel.clipResults() == undefined || clipviewmodel.clipResults().length <= 0) {
        //        //show no results for the search only if for none of the cameras there is no search result
        //        $("#loadingtxt").css("display", "block");
        //        $("#loadingtxt").text(window.viewerconfig.common.messages.clipresult);
        //    }
        //    else {
        //        //disable loading icon if it is visible
        //        $("#loadingtxt").css("display", "none");
        //    }
        //});

    }



    /** Demonstrates how to download a canvas an image with a single
       * direct click on a link.*/
    function doCanvas(ctx, canvas) {
        /* draw something */
        ctx.fillStyle = '#f90';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '60px sans-serif';
        ctx.fillText('Code Project', 10, canvas.height / 2 - 15);
        ctx.font = '26px sans-serif';
        ctx.fillText('Click link below to save this as image', 15, canvas.height / 2 + 35);
    }
    /* Footer Section Starts pop over for the clip Search menu single Camera 
    calling the clip search model and getting the clip search on load when clip
    is clicked in the footer menu. Datacontext clipsearch expects the clipviewmodel 
    ko binding winth div clpsrch.
    */
    function onpopovershown() {
        if (datacontext.CurrentPanelmodel == undefined || datacontext.CurrentPanelmodel == null) {
            Hidepopover();
            return;
        }
        var cameraid = datacontext.CurrentPanelmodel.sessionmodel.cameraid();
        if (cameraid == undefined || cameraid == "") {
            Hidepopover();
            return;
        }

        var startdate = Date.today();//.addDays(-1); 
        startdate = startdate.setHours(0, 0, 0, 0);
        Fromdate = convertdatetimetostring(startdate);
        var Todate = Date.today()
        Todate = Todate.setHours(23, 59, 59, 0);
        Todate = convertdatetimetostring(Todate);
        var clipviewmodel = new datacontext.ClipViewmodel(true);
        clipviewmodel.ClipFiltermodel.FromDatetime(Fromdate);
        clipviewmodel.ClipFiltermodel.ToDatetime(Todate);
        clipviewmodel.ClipFiltermodel.IsSchedule(true);
        clipviewmodel.ClipFiltermodel.IsMotionEvent(true);
        clipviewmodel.ClipFiltermodel.IsTriggerEvent(true);
        clipviewmodel.ClipFiltermodel.IsOnsite(true);
        clipviewmodel.ClipFiltermodel.IsUserdriven(true);
        clipviewmodel.ClipFiltermodel.IsRuledriven(true);
        clipviewmodel.CameraName(datacontext.CurrentPanelmodel.sessionmodel.cameraname());
        datacontext.clipsearch(clipviewmodel, cameraid, function (callbackid) {
            if (clipviewmodel.clipResults() == undefined || clipviewmodel.clipResults().length <= 0) {
                //show no results for the search only if for none of the cameras there is no search result
                $("#loadingtxt").css("display", "block");
                $("#loadingtxt").text(window.viewerconfig.common.messages.clipresult);
            }
            else {
                //disable loading icon if it is visible
                $("#loadingtxt").css("display", "none");
            }
        });
        ko.applyBindings(clipviewmodel, document.getElementById("clpsrch"));
        return;
    }

    function updateUITreeSalvoOnNewSalvo() {
        salvotreeviewPlugin.getInstance().UnSelectTreeNode();
    }

    function Hidesalvosavepopover() {
        // hide the current save salvo pop over 
        if (currentSavePopoverTarget) {
            $(currentSavePopoverTarget).popover('hide');
        }
    }

    function Hidepopover() {
        // hide the current clip search popover 
        if (currentPopoverTarget) {
            $(currentPopoverTarget).popover('hide');
        }
        ISSingle = false;
    }


    //Footermenu viewmodel
    var ViewerFooterViewModel = function () {
        var self = this;
        self.shouldShowfooter = ko.observable(true);
        self.shouldhidefooter = ko.observable(true);
        // Message initially visible
        self.Footermenu = $.map(window.viewerconfig.common.getviewerfootermenus(), function (item) {
            return new footermodel(item);
        });
    }
    /*  Footer Section Ends  */
    function RetryVideoStream() {
        try {
            if (datacontext.CurrentPanelmodel == undefined)
                return;
            datacontext.CurrentPanelmodel.isError(false);
            if (datacontext.CurrentPanelmodel.isdoor()) {
                getDoorLiveEvent(datacontext.CurrentPanelmodel, datacontext.CurrentPanelmodel.doorsessionmodel.doorid(), datacontext.CurrentPanelmodel.doorsessionmodel.doorname(), true)
            }
            else {
                if (datacontext.CurrentPanelmodel.IsLive())
                    getLiveUrlStream(datacontext.CurrentPanelmodel, datacontext.CurrentPanelmodel.sessionmodel.cameraid(), datacontext.CurrentPanelmodel.sessionmodel.cameraname(), true, false);
                else
                    getPlaybackStream(datacontext.CurrentPanelmodel, datacontext.CurrentPanelmodel.sessionmodel.ClipDetail, true)
            }
        } catch (e) {
            throw e;
        }

    }
    /*  Live stream camera Section starts    Calling datacontext live stream method 
        Assign to Setupplayer and Play JW player   adding panel to viewmodel panel array */
    function getLiveUrlStream(destinationPanel, cameraId, CameraName, retry, issalvoview, isskipcheckforplayersupport) {
        try {
            if (isskipcheckforplayersupport) {
            }
            else {
                checkforplayersupport();
            }

            var LiveUUID = common.createUUID();
            var PanelContext = null;

            //// Check if the request is from Salvo management mode
            //if (issalvoview) {
            //    //var destiele = document.getElementById(destinationPanel.panelid())
            //    PanelContext = document.getElementById(destinationPanel.panelid());
            //}
            //else {
            //    // Please add a comment for the context? 
            //    PanelContext = destinationPanel.context;
            //}
            //var mCurrentPanel = null;
            //if (!retry) {
            //    //
            //    mCurrentPanel = ko.contextFor(PanelContext).$data;
            //    mCurrentPanel.erromessage(common.messages.Requestmsg);
            //    mCurrentPanel.dropui = destinationPanel;

            //    //add the camera in watch list for checking duplicate camera
            //    common.cameraArr.push(cameraId);
            //}
            //else {
            //    mCurrentPanel = destinationPanel;
            //    mCurrentPanel.dropui = destinationPanel.panelid();
            //}


            // Check if the request is from Salvo management mode
            PanelContext = document.getElementById(destinationPanel.panelid());
            var mCurrentPanel = ko.contextFor(PanelContext).$data;
            mCurrentPanel.erromessage(common.messages.Requestmsg);
            mCurrentPanel.dropui = PanelContext;
            if (!retry) {
                //add the camera in watch list for checking duplicate camera
                common.cameraArr.push(cameraId);
            }
            mCurrentPanel.isdropped(true);
            mCurrentPanel.issalvoview(issalvoview);
            //mCurrentPanel.iscustomimage(true);
            mCurrentPanel.isrequesting(true);
            //mCurrentPanel.issalvoimage(false);
            mCurrentPanel.issuccess(false);
            mCurrentPanel.iscamera(true);
            mCurrentPanel.EntityName(CameraName);
            mCurrentPanel.showreload(true);
            mCurrentPanel.sessionmodel.cameraid(cameraId);
            //mCurrentPanel.isshowdoorvisible(true);
            //Make panel selected
            //var context = ko.contextFor($("#viewersalvowrapper")[0]);
            //var salvoviewmodel = context.$data;
            var base = ko.contextFor(document.getElementById("viewersalvowrapper"));
            base.$root.SelectPanel(mCurrentPanel);
            //salvoviewmodel.SelectPanel(mCurrentPanel);

            // Hide clip exoort popver if its on the Salvo
            Hidepopover();
            mCurrentPanel.IsLive(true);

            //check for flash player installation
            if (!isflashplayerinstalled) {
                mCurrentPanel.isrequesting(false);
                mCurrentPanel.Liveplaybackicon("viewerLiveStatus");
                mCurrentPanel.DropfailedText(common.messages.instflsplgn);
                mCurrentPanel.isError(true);
                console.log("2:flash player not installed for Live stream");
                return;
            }

            console.log("2:Sending request for Live stream playlist url");
            datacontext.getLivestream(cameraId, LiveUUID).done(function (jsondata) {
                mCurrentPanel.isrequesting(false);
                mCurrentPanel.Liveplaybackicon("viewerLiveStatus");
                var stream = jsondata;                
                if (mCurrentPanel.sessionmodel.authorizationstatus() == "" && stream.VideoResultstring.toLowerCase() == common.constants.videostatus.SUCCESS) {
                    console.log("3: Got Live playlist URL:" + stream.Url + "For the camera:" + CameraName);
                    //mCurrentPanel.iscustomimage(false);
                    mCurrentPanel.sessionmodel.InitializeLiveviewsession(cameraId, stream.SessionId, CameraName, stream.Url, mCurrentPanel);
                    mCurrentPanel.issuccess(true);
                    //mCurrentPanel.isclosevisible(true);
                }
                else if (mCurrentPanel.sessionmodel.authorizationstatus() != undefined && mCurrentPanel.sessionmodel.authorizationstatus() != "") {
                    mCurrentPanel.DropfailedText(mCurrentPanel.sessionmodel.authorizationstatus());
                    mCurrentPanel.isError(true);
                    mCurrentPanel.showreload(false);                    
                    console.log("3: Authorization failed");
                }
                else {
                    mCurrentPanel.DropfailedText(common.messages.VideoError);
                    mCurrentPanel.isError(true);
                    mCurrentPanel.showreload(true);
                    //mCurrentPanel.iscustomimage(false);                   
                    console.log("3: Didn't Get Live playlist URL Some error occured on Server/Request ");
                }
            }).error(function (e, jsondata) {
                mCurrentPanel.isrequesting(false);
                console.log(common.messages.ErrorLiveStream);
            });
        } catch (e) {
            console.error("Error on getLiveUrlStream:" + e.message);
        }


    }
    /*  live stream camera Section ends  */
    /*  Play back clipstream  for a camera Section starts  */
    function getPlaybackStream(destinationPanel, clipData, retry) {
        checkforplayersupport();
        var PlaybackUUID = common.createUUID();
        var mCurrentPanel = null;
        //if (!retry) {
        //    var PanelContext = destinationPanel.context;
        //    mCurrentPanel = ko.contextFor(PanelContext).$data;
        //    mCurrentPanel.erromessage(common.messages.Requestmsg);
        //    mCurrentPanel.dropui = destinationPanel;
        //}
        //else {
        //    mCurrentPanel = destinationPanel;
        //    mCurrentPanel.dropui = destinationPanel.panelid();
        //}

        // Check if the request is from Salvo management mode
        PanelContext = document.getElementById(destinationPanel.panelid());
        var mCurrentPanel = ko.contextFor(PanelContext).$data;
        mCurrentPanel.erromessage(common.messages.Requestmsg);
        mCurrentPanel.dropui = PanelContext;
        mCurrentPanel.isdropped(true);
        //mCurrentPanel.iscustomimage(true);
        mCurrentPanel.isrequesting(true);
        //mCurrentPanel.issalvoimage(false);
        mCurrentPanel.issuccess(false);
        mCurrentPanel.iscamera(true);
        mCurrentPanel.EntityName(clipData.CameraName() + "_" + clipData.ClipId());
        //mCurrentPanel.isshowdoorvisible(true);
        mCurrentPanel.sessionmodel.ClipDetail = clipData;
        if (!retry) {
            //add the camera in watch list for checking duplicate camera
            common.cameraArr.push(clipData.CameraId + clipData.ClipId());
        }
        mCurrentPanel.IsLive(false);
        //Make panel selected
        var base = ko.contextFor(document.getElementById("viewersalvowrapper"));
        base.$root.SelectPanel(mCurrentPanel);

        //check for flash player installation
        if (!isflashplayerinstalled) {
            mCurrentPanel.isrequesting(false);
            mCurrentPanel.Liveplaybackicon("viewerRecordStatus");
            mCurrentPanel.DropfailedText(common.messages.instflsplgn);
            mCurrentPanel.isError(true);
            console.log("2:flash player not installed for Live stream");
            return;
        }

        datacontext.getPlayBackStream(clipData, PlaybackUUID).done(function (jsondata) {
            mCurrentPanel.isrequesting(false);
            mCurrentPanel.Liveplaybackicon("viewerRecordStatus");
            var stream = jsondata;
            if (stream.VideoResultstring.toLowerCase() == common.constants.videostatus.SUCCESS) {
                //mCurrentPanel.iscustomimage(false);
                mCurrentPanel.issuccess(true);
                //mCurrentPanel.isclosevisible(true);
                mCurrentPanel.sessionmodel.IntializePlaybackSession(clipData, stream.SessionId, stream.Url, stream.CameraId, mCurrentPanel);
            }
            else {
                mCurrentPanel.isError(true);
                //mCurrentPanel.iscustomimage(false);
                if (stream.VideoResultstring.toLowerCase() == common.constants.videostatus.MAXIMUM_CONNECTION_EXISTS) {
                    mCurrentPanel.DropfailedText(common.messages.videoNoFreeSession);
                }
                else {
                    mCurrentPanel.DropfailedText(common.messages.VideoError);
                }
            }
        }).error(function (e, jsondata) {
            mCurrentPanel.isrequesting(false);
            console.log(common.messages.ErrorLiveStream);
        });
    }
    function getFullScreen() {
        if ((document.fullScreenElement && document.fullScreenElement !== null) || // alternative standard method  
        (!document.mozFullScreen && !document.webkitIsFullScreen)) { // current working methods  
            if (document.documentElement.requestFullScreen) {
                document.documentElement.requestFullScreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullScreen) {
                document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        }
    }
    function getExitFullScreen() {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }

        $("#page-header").css("display", "block");
        $("#viewerfooter").css("display", "block");
        $("#main").css("display", "block");
        $('#header-menu-box').css("display", "block");
        $("#viewerheader-two-rightmenu").css("display", "block");
        $(".header-menu-two").attr("display", "block");
        $('.viewer-header-menu-two').css("display", "block");
        $("#blob-show-universal-list").show();


    }

    function getDoorLiveEvent(destinationPanel, DoorID, DoorName, retry, issalvoview) {
        var Startindex = 0;
        var Maxrow = 4;
        //if (!issalvoview) {
        //    if (!retry) {
        //        var PanelContext = destinationPanel.context;
        //        mCurrentPanel = ko.contextFor(PanelContext).$data;
        //        mCurrentPanel.dropui = destinationPanel;
        //    }
        //    else {
        //        mCurrentPanel = destinationPanel;
        //        mCurrentPanel.dropui = destinationPanel.panelid();
        //        retry = false;
        //    }
        //}
        //else {
        //    mCurrentPanel = destinationPanel;
        //    mCurrentPanel.dropui = destinationPanel.panelid();
        //}

        var PanelContext = document.getElementById(destinationPanel.panelid());
        var mCurrentPanel = ko.contextFor(PanelContext).$data;
        mCurrentPanel.erromessage(common.messages.Requestmsg);
        mCurrentPanel.dropui = PanelContext;
        //mCurrentPanel.doorid(DoorID);
        mCurrentPanel.isdropped(true);
        //mCurrentPanel.iscustomimage(true);
        mCurrentPanel.isrequesting(true);
        //mCurrentPanel.issalvoimage(false);
        mCurrentPanel.isdoor(true);
        mCurrentPanel.issuccess(false);
        mCurrentPanel.doorsessionmodel.doorid(DoorID);
        mCurrentPanel.doorsessionmodel.doorname(DoorName);
        mCurrentPanel.erromessage(common.messages.RequestDoorEvent);
        if (!retry) {
            //add the camera in watch list for checking duplicate camera
            common.cameraArr.push(DoorID);
        }
        //Make panel selected
        var base = ko.contextFor(document.getElementById("viewersalvowrapper"));
        base.$root.SelectPanel(mCurrentPanel);
        datacontext.getDoorEvent(DoorID, "Door", Startindex, Maxrow).done(function (jsondata) {
            mCurrentPanel.isrequesting(false);
            var dooreventResult = jsondata;
            if (!dooreventResult.Success && dooreventResult.Message == "Authorization Failed") {
                mCurrentPanel.doorsessionmodel.authorizationstatus(Resources.Access_denied);
            }
            if (mCurrentPanel.doorsessionmodel.authorizationstatus() == "" && dooreventResult.Success) {
                //if (dooreventResult != undefined && dooreventResult.length != 0) {
                mCurrentPanel.doorsessionmodel.Initializedoorevent(dooreventResult.data, mCurrentPanel);
                //mCurrentPanel.iscustomimage(false);
                //mCurrentPanel.isdoor(true);
                mCurrentPanel.issuccess(true);
                currentpnl = mCurrentPanel;
                mCurrentPanel.DropfailedText("");
                //}
                //else {
                //mCurrentPanel.DropfailedText(common.messages.DoorError);
                //mCurrentPanel.isdoor(true);
                //mCurrentPanel.isError(true);
                //mCurrentPanel.iscustomimage(false);
                //}
            }
            else if (mCurrentPanel.doorsessionmodel.authorizationstatus() != undefined && mCurrentPanel.doorsessionmodel.authorizationstatus() != "")
            {
                mCurrentPanel.DropfailedText(mCurrentPanel.doorsessionmodel.authorizationstatus());
                mCurrentPanel.showreload(false);
                mCurrentPanel.isError(true);
            }
            else {
                mCurrentPanel.DropfailedText(common.messages.DoorError);
                //mCurrentPanel.isdoor(true);
                mCurrentPanel.isError(true);
            }
        }).error(function () {
            mCurrentPanel.DropfailedText(common.messages.DoorError);
            //mCurrentPanel.isdoor(true);
            mCurrentPanel.isError(true);
        });
    }


    function getWebsoketvents(data) {
        currentpnl.doorsessionmodel.Initializedoorevent(data);
    }


    function Performaction(Doorsessionmodel) {
        if(!Doorsessionmodel.IsPanelOnline){
            alertify.error(common.messages.device_offline);
            return;
        }

        var Doorstatus = [];
        var Currentdoorstatus = "";
        var Currentdoorstatus1 = " ";
        //common.cameraArr.push(Doorsessionmodel.doorid());
        datacontext.Dooraction(Doorsessionmodel.Dooraction(), Doorsessionmodel.doorid()).done(function (jsondata) {
            var dooractionResult = jsondata;
            if (dooractionResult.Success) {
                if (Doorsessionmodel.Dooraction().toLowerCase() == common.constants.DoorActions.LOCK.toLowerCase()) {
                    Doorsessionmodel.Isdoorlock(true);
                }
                else {
                    Doorsessionmodel.Isdoorlock(false);
                }
                alertify.success(common.messages.DoorActionSuccess);
            }
            else {
                alertify.error(common.messages.DoorActionfailure);
            }
        }).error(function () {
            alertify.error(common.messages.DoorActionfailure);
        });
    }



    function getfulscreenviewer() {

        $("#page-header").css("display", "none");
        $(".universalListOpen, .universalListClose, .salvosListOpen, .salvosListClose").animate({ "right": "-1500px" }, { queue: false, duration: 200 });
        $(".viewerVideo").animate({ "width": "100%" }, { queue: false, duration: 200 });
        $("#header-two-rightmenu").animate({ "left": "0px" }, { queue: false, duration: 200 });
        $("#blob-show-universal-list").animate({ queue: false, duration: 200 }).show();
        $("#viewerfooter").css("display", "none");
        $("#main").css("display", "none");
        $("#viewerheader-two-rightmenu").css("display", "none");
        $("#page-body").css("top", "-91px");
    }
    function ClearAllPanels(salvoviewmodel) {
        if (salvoviewmodel == undefined) {
            return;
        }
        common.issalvoview = false;
        updateUITreeSalvoOnNewSalvo();  // Function clears the UI Selection of Saved Salvo Item
        salvoviewmodel.onClearAllSalvo(salvoviewmodel.SalvoMode());
        makesalvodroprecieverforcamera();
        Hidesalvosavepopover();
        window.viewerconfig.common.salvodata = null;
        currentSelecteditem = null;
    }
    function wireupuievents() {
        $.subscribe(common.events.onapptabchangeevent, function (data, newtab) {
            if (newtab != "viewer") {
                var context = ko.contextFor($("#viewersalvowrapper")[0]);
                ClearAllPanels(context.$data);
            }
            else {
                selectUniversalOption(common.constants.Views.UNIVERSAL_LIST);
                showUniversalView();
            }
        });

        $(".clipHideFilter").click(function () {
            $(".viewerClipBody").show();
            $(".viewerHideBody").hide();
        });


        // single Clip search section 
        //$(document).on('timepicker', '#timepicker', function () {
        //    $(".clipSearchFilter").hide();
        //    $(".clipResults").show();
        //});
        //function showTime() {
        //    $('#timepicker').timepicker({
        //        minuteStep: 5,
        //        showInputs: false,
        //        disableFocus: true,
        //        showSeconds: true
        //    });
        //}
        //function showTime1() {
        //    $('#timepicker1').timepicker({
        //        minuteStep: 5,
        //        showInputs: false,
        //        disableFocus: true,
        //        showSeconds: true
        //    });
        //}
        // move
        //$("[data-toggle=popover]").mousedown(function () {
        //    // toggle popover when link is clicked
        //    $(this).popover('toggle');
        //});

        //$("[data-toggle=popover]").draggable({
        //    stop: function () {
        //        // show popover when drag stops
        //        $(this).popover('show');
        //    }
        //});

        $(document).on('click', '.clipFilterHeader', function () {
            $(".clipSearchFilter").hide();
            $(".clipBodyHeader").show();
        });
        $(document).on('click', '.clipBodyHeader', function () {
            $(".clipSearchFilter").show();
            $(".clipBodyHeader").hide();
            var clipviewmodel;
            var context = null;
            if (context != undefined && context.$data != undefined)
                clipviewmodel = context.$data;
            else
                clipviewmodel = new datacontext.ClipViewmodel(false);
            initdatetimepicker(sngfiltertype, true, clipviewmodel);
            //    $(".clipResults").hide();
        });
        $(document).on('click', '#cliplist', function () {
            $(".clipSearchFilter").show();
            $(".clipResults").hide();
        });
        $(document).on('click', '.clipFilterHeader', function () {
            $(".clipSearchFilter").hide();
            $(".clipResults").show();

        });

        function toggleviewerdropdown() {
            if (isdropdownshown) {
                switch (CurrentUllistitem) {
                    case common.constants.Views.SALVO_LIST:
                        $("#treeitem").css("display", "none");
                        $("#Ulistitem").css("display", "none");
                        $("#Ulist").css("display", "block");
                        $("#Salvolist").css("display", "none");
                        $("#salvotreeitem").css("display", "block");
                        salvotreeviewPlugin.getInstance().initialize($("#salvotree"));
                        $(".icon-down").css("display", "inline-block");
                        $(".icon-up").css("display", "none");
                        $("#viewer-universal-list .navbar").css("display", "none");
                        break;
                    case common.constants.Views.UNIVERSAL_LIST:
                        $("#treeitem").css("display", "block");
                        $("#Ulistitem").css("display", "none");
                        $("#Ulist").css("display", "none");
                        $("#Salvolist").css("display", "block");
                        $("#salvotreeitem").css("display", "none");
                        $(".icon-down").css("display", "inline-block");
                        $(".icon-up").css("display", "none");
                        $("#viewer-universal-list .navbar").css("display", "block");
                        break;
                }
            }
            else {
                $("#Ulistitem").css("display", "block");
                $("#treeitem").css("display", "none");
                $("#salvotreeitem").css("display", "none");
                $(".icon-down").css("display", "none");
                $(".icon-up").css("display", "inline-block");
                $("#viewer-universal-list .navbar").css("display", "none");
            }
            isdropdownshown = !isdropdownshown;
        }

        $(document).on('click', '#ulheader', function () {
            toggleviewerdropdown();
        });
        $(document).on('click', '.icon-down', function () {
            toggleviewerdropdown();
        });
        $(document).on('click', '.icon-up', function () {
            toggleviewerdropdown();
        });

        $(document).on('timepicker', '#timepicker', function () {
            $(".clipSearchFilter").hide();
            $(".clipResults").show();
        });


        $(document).on('mouseover', '.clipresultitem', function () {
            $('.clipresultitem').draggable({
                revert: "valid",
                cursor: "pointer",
                cursorAt: { top: -5, left: -5 },
                helper: function (event) {
                    var ctx = ko.contextFor(event.currentTarget);
                    return $("<div>" + "<label>" + ctx.$data.ClipNameDisplay() + "</label></div>").css({ minwidth: '30px', background: '#cbc4c4', Padding: '4px' });
                },
                revert: 'invalid',
                appendTo: 'body',
                start: function (e, ui) {
                    //$(ui.helper).addClass("tree-Camera-icon-VideoNotOK");
                }
            });
            $('.clipresultitem').draggable({ containment: "window" });
        });
        $(document).on('mouseover', '.singleclipresultitem', function () {
            $('.singleclipresultitem').draggable({
                revert: "valid",
                cursor: "pointer",
                cursorAt: { top: -5, left: -5 },
                helper: function (event) {
                    var ctx = ko.contextFor(event.currentTarget);
                    return $("<div>" + "<label>" + ctx.$data.ClipId() + "</label></div>").css({ background: '#cbc4c4', Padding: '4px' });
                },
                revert: 'invalid',
                appendTo: 'body',
                start: function (e, ui) {
                    //$(ui.helper).addClass("tree-Camera-icon-VideoNotOK");
                }
            });
            $('.singleclipresultitem').draggable({ containment: "window" });

        });

        $(document).on('mouseover', '.doorResultsText', function () {
            $('.doorResultsText').draggable({
                revert: "valid",
                cursor: "pointer",
                cursorAt: { top: -5, left: -5 },
                helper: function (event) {
                    var ctx = ko.contextFor(event.currentTarget);
                    var name = "door";
                    if (ctx && ctx.$data && ctx.$data.doorname()) {
                        name = ctx.$data.doorname();
                    }
                    return $("<div>" + "<label>" + name + "</label></div>").css({ background: '#cbc4c4', Padding: '4px' });
                },
                revert: 'invalid',
                appendTo: 'body',
                start: function (e, ui) {
                    //$(ui.helper).addClass("tree-Camera-icon-VideoNotOK");
                }
            });
            $('.doorResultsText').draggable({ containment: "window" });

        });


        $("#blob-show-universal-list").click(function () {
            showUniversalView();
        });

        $("#hide-universal-list, #hide-universal-list-close, #hide-salvo-list").click(function () {
            $(".universalListOpen, .universalListClose, .salvosListOpen, .salvosListClose").css("right", "-1500px");
            $(".grids").css("width", "100%");
            $("#viewerheader-two-rightmenu").css("left", "0px");
            $("#blob-show-universal-list").show();
            $("#hide-universal-list").hide();
            $(".icon-showUniveralList").show();
            UlistOpen = false;
            Hidepopover();
        });

        $(document).on('mouseover', '.videoContainer', function () {
            if (UlistOpen) {
                $(this).find(".close-icon").each(function (item) {
                    var cntxt = ko.contextFor(this);
                    if (cntxt && cntxt.$data && !cntxt.$data.isrequesting()) {
                        cntxt.$data.isclosevisible(true);
                    }
                });
            }
            else {
                $(this).find(".doorAssociation-icon").each(function (item) {
                    var cntxt = ko.contextFor(this);
                    if (cntxt && cntxt.$data && cntxt.$data.iscamera()) {
                        cntxt.$data.isshowdoorvisible(true);
                    }
                });
            }
        });
        $(document).on('mouseleave', '.videoContainer', function () {
            if (UlistOpen) {
                $(this).find(".close-icon").each(function (item) {
                    var cntxt = ko.contextFor(this);
                    if (cntxt && cntxt.$data) {
                        cntxt.$data.isclosevisible(false);
                    }
                });
            }
            else {
                Hidedoorpopover();
                $(this).find(".doorAssociation-icon").each(function (item) {
                    var cntxt = ko.contextFor(this);
                    if (cntxt && cntxt.$data && cntxt.$data.iscamera()) {
                        cntxt.$data.isshowdoorvisible(false);
                    }
                });
            }
        });

        $("#grid1").click(function () {
            var context = ko.contextFor($("#viewersalvowrapper")[0]);
            var salvoviewmodel = context.$data;
            salvoviewmodel.onSalvoModeSelectionChanged(common.salvomode.GRID1);
            makesalvodroprecieverforcamera();
        });
        $("#grid4").click(function () {
            var context = ko.contextFor($("#viewersalvowrapper")[0]);
            var salvoviewmodel = context.$data;
            salvoviewmodel.onSalvoModeSelectionChanged(common.salvomode.GRID4);
            makesalvodroprecieverforcamera();
        });
        $("#grid6").click(function () {
            var context = ko.contextFor($("#viewersalvowrapper")[0]);
            var salvoviewmodel = context.$data;
            salvoviewmodel.onSalvoModeSelectionChanged(common.salvomode.GRID6);
            makesalvodroprecieverforcamera();
        });
        $("#grid8").click(function () {
            var context = ko.contextFor($("#viewersalvowrapper")[0]);
            var salvoviewmodel = context.$data;
            salvoviewmodel.onSalvoModeSelectionChanged(common.salvomode.GRID8);
            makesalvodroprecieverforcamera();
        });

        $('.wrapper').delegate("i[id = 'fullExitId']", "click", function () {
            getExitFullScreen();
            if (UlistOpen) {
                $(".universalListOpen").css("right", "0px");
                $(".icon-showUniveralList").hide();
                $(".icon-showUniveralList-active").show();
            }
            else {
                $("#blob-show-universal-list").show();
                $(".icon-showUniveralList").show();
            }
            var context = ko.contextFor($("#viewersalvowrapper")[0]);
            var salvoviewmodel = context.$data;
            salvoviewmodel.OnExitfullscreenClick();

            $("#page-body").attr("style", "");
            $("#viewerpagebody").attr("class", "row");
            $(".nav").css("display", "block");
            $("#fullExitId").css("display", "none");
            makesalvodroprecieverforcamera();

        });

        $("#viewerpagebody").click(function (event, data) {
            if (event && event.target && (event.target.id == 'viewerpagebody' || event.target.id == 'viewersalvowrapper' || event.target.id == 'sortable')) {
                var context = ko.contextFor(document.getElementById('viewersalvowrapper'));
                if (context && context.$data) {
                    var salvomodel = context.$data;
                    salvomodel.UnSelectAllPanel();
                }
            }
        })
    }

    function showUniversalView() {
        $(".universalListOpen").css("right", "0px");
        $(".grids").css("width", "73%");
        $("#viewerheader-two-rightmenu").css("left", "-29%");
        $("#blob-show-universal-list").hide();
        $("#hide-universal-list").show();
        $("#viewerheader-two-rightmenu").show();
        ko.cleanNode('Ulistitem');
        UlistOpen = true;
    }
    function initializesalvo() {
        ko.applyBindings(new datacontext.SalvoViewmodel(), document.getElementById('viewersalvowrapper'));
        makesalvodroprecieverforcamera();
        $("#fullExitId").css("display", "none");
    }
    function checkforplayersupport() {
        //Check if flash is installed
        if (!swfobject.hasFlashPlayerVersion("1")) {
            isflashplayerinstalled = false;
            alertify.alert(common.messages.plsinstflashplayer + '<br/><a href="https://get.adobe.com/flashplayer/" target="_blank">' + common.messages.clicktodownloadflashplayer + '</a>');
            return;
        }
        isflashplayerinstalled = true;
    }
    function makesalvodroprecieverforcamera() {
        $('.videoContainer').droppable({
            accept: function (elem) {
                var context = ko.contextFor(elem[0]);
                if (context == undefined)
                    return false;
                var treenodemodel = context.$data;

                if (treenodemodel.ClipId)
                    return true;
                if (treenodemodel.doorid)
                    return true;
                if (treenodemodel.nodeobject == undefined || treenodemodel.nodeobject == null)
                    return false;
                if (treenodemodel.nodeobject.EntityType.toLowerCase() == common.constants.droppableentities.DOOR) {
                    return true;
                }
                if (treenodemodel.nodeobject.EntityType.toLowerCase() != common.constants.droppableentities.CAMERA) {
                    return false;
                }
                if (treenodemodel.statusclass().toLowerCase() == common.Enumeration.DeviceStatus.DISABLE) {
                    return false;
                }
                //if (treenodemodel.nodeobject.EntityType == "Door")
                //    return true;
                //if (treenodemodel.nodeobject.EntityType.toLowerCase() != common.constants.droppableentitytype.toLowerCase())
                //    return false;
                //if (treenodemodel.statusclass().toLowerCase() == common.Enumeration.CameraStatus.DISABLE) {
                //    return false;
                //}
                var drg = treenodemodel.draggable();
                if (drg == "false")
                    return false;
                return true;
            },
            tolerance: 'pointer',
            hoverClass: 'state-hover',
            drop: function (event, ui) {
                var dragContext = $(ui)[0].draggable.context;
                var cameraNode = ko.contextFor(dragContext).$data;
                if (cameraNode.ClipId) {
                    var ClipId = cameraNode.ClipId();
                    var result = _.contains(common.cameraArr, cameraNode.CameraId + ClipId); // $.inArray(ClipId, common.cameraArr)
                    if (!result) {
                        //check if any video is already playing
                        if ($(event.target) != undefined && $(event.target).length > 0) {
                            var vdcontainer = $(event.target)[0];
                            if (vdcontainer) {
                                var oldcontext = ko.contextFor($(event.target)[0]);
                                if (oldcontext && oldcontext.$data) {
                                    var oldPmodel = oldcontext.$data;
                                    if (oldPmodel && oldPmodel.isrequesting()) {
                                        alertify.alert(common.messages.AlreadyRequesting);
                                        return common.cameraArr;
                                    }
                                    if (oldPmodel) {
                                        oldPmodel.closepanel();
                                    }
                                }
                            }
                        }
                        var panelmodel = ko.contextFor($(this)[0]).$data;
                        $(this)
                        .find("div>div")
                        .html("Dropped"),
                        getPlaybackStream(panelmodel, cameraNode);
                        console.log(common.messages.clipdroppublished + cameraNode.ClipId());
                    }
                    else {
                        alertify.alert(cameraNode.ClipId() + " " + common.messages.duplicateclip);
                        return common.cameraArr;
                    }
                }

                    //else if (cameraNode.doorid) {
                    //    var DoorId = cameraNode.doorid();
                    //    var result = _.contains(common.cameraArr, DoorId);
                    //    if (!result) {
                    //        //check if any video is already playing
                    //        if ($(event.target) != undefined && $(event.target).length > 0) {
                    //            var vdcontainer = $(event.target)[0];
                    //            if (vdcontainer) {
                    //                var oldcontext = ko.contextFor($(event.target)[0]);
                    //                if (oldcontext && oldcontext.$data) {
                    //                    var oldPmodel = oldcontext.$data;
                    //                    if (oldPmodel && oldPmodel.isrequesting()) {
                    //                        alertify.alert(common.messages.AlreadyRequesting);
                    //                        return common.cameraArr;
                    //                    }
                    //                    if (oldPmodel && oldPmodel.sessionmodel) {
                    //                        oldPmodel.closepanel();
                    //                    }
                    //                }
                    //            }
                    //        }
                    //        $(this)
                    //        .find("div>div")
                    //        //.html("Dropped"),
                    //        getDoorLiveEvent($(this), cameraNode.doorid(), cameraNode.doorname(), false, false);
                    //        console.log("camera dropped published for " + cameraNode.doorid());
                    //    }
                    //    else {
                    //        alertify.alert(cameraNode.doorname() + " " + common.messages.duplicatedoor);
                    //        return common.cameraArr;
                    //    }
                    //}
                else if (cameraNode.doorid || (cameraNode.nodeobject && cameraNode.nodeobject.EntityType.toLowerCase() == common.constants.droppableentities.DOOR)) {
                    var DoorId = "";
                    var DoorName = "";
                    if (cameraNode.doorid) {
                        DoorId = cameraNode.doorid();
                        DoorName = cameraNode.doorname();
                    }
                    else {
                        DoorId = cameraNode.id();
                        DoorName = cameraNode.nodeobject.Name;
                    }
                    var result = _.contains(common.cameraArr, DoorId);
                    if (!result) {
                        //check if any video is already playing
                        if ($(event.target) != undefined && $(event.target).length > 0) {
                            var vdcontainer = $(event.target)[0];
                            if (vdcontainer) {
                                var oldcontext = ko.contextFor($(event.target)[0]);
                                if (oldcontext && oldcontext.$data) {
                                    var oldPmodel = oldcontext.$data;
                                    if (oldPmodel && oldPmodel.isrequesting()) {
                                        alertify.alert(common.messages.AlreadyRequesting);
                                        return common.cameraArr;
                                    }
                                    if (oldPmodel) {
                                        oldPmodel.closepanel();
                                    }
                                }
                            }
                        }
                        var panelmodel = ko.contextFor($(this)[0]).$data;
                        $(this)
                        .find("div>div")
                        //.html("Dropped"),

                        getDoorLiveEvent(panelmodel, DoorId, DoorName, false, false);
                        console.log("Associated Door dropped  published for " + DoorId);
                    }
                    else {
                        alertify.alert(DoorName + " " + common.messages.duplicatedoor);
                        return common.cameraArr;
                    }
                }
                else if (cameraNode.nodeobject && cameraNode.nodeobject.EntityType.toLowerCase() == common.constants.droppableentities.CAMERA) {
                    var CameraId = cameraNode.id();
                    var result = _.contains(common.cameraArr, CameraId);
                    if (!result) {
                        //check if any video is already playing
                        if ($(event.target) != undefined && $(event.target).length > 0) {
                            var vdcontainer = $(event.target)[0];
                            if (vdcontainer) {
                                var oldcontext = ko.contextFor($(event.target)[0]);
                                if (oldcontext && oldcontext.$data) {
                                    var oldPmodel = oldcontext.$data;
                                    if (oldPmodel && oldPmodel.isrequesting()) {
                                        alertify.alert(common.messages.AlreadyRequesting);
                                        return common.cameraArr;
                                    }
                                    if (oldPmodel) {
                                        oldPmodel.closepanel();
                                    }
                                }
                            }
                        }
                        console.log("1: User dropped Camera :" + cameraNode.id() + " ## On a panel:" + $(this).attr("id"));
                        var panelmodel = ko.contextFor($(this)[0]).$data;
                        getLiveUrlStream(panelmodel, cameraNode.id(), cameraNode.name(), false, false);

                    }
                    else {
                        alertify.alert(cameraNode.name() + " " + common.messages.duplicateCamera);
                        return common.cameraArr;
                    }
                }
            }
        });
    }


    /*Universal List Clip Search */
    var prevdaterange = "";
    var timeshow = true;
    var searchstates = { NORMAL_TREEMODE: "NORMAL_TREEMODE", CLIP_SEARCH_TREEMODE: "CLIP_SEARCH_TREEMODE", CLIP_RESULTMODE: "CLIP_RESULTMODE" };
    var currentsearchstate = searchstates.NORMAL_TREEMODE;
    var univdatetimepickerInitialised = false;
    var singlevdatetimepickerInitialised = false;

    $("#UlclipSearchButton").click(function () {
        $('#UlclipSearchButton').css("display", "none");
        $(".ulClipFilterIconHolder").css("display", "block");
        $(".icon-back").css("display", "block");
        enableuniversalclipsearch(true);
        currentsearchstate = searchstates.CLIP_SEARCH_TREEMODE;
    })
    $("#clpfltrdrpdwnspan").click(function () {
        var dOption = $(this).attr("data-dropdown");
        if (dOption == undefined || dOption == "0") {
            ShowClipSearchFilterDialog();
        }
        else {
            HideClipSearchFilterDialog();
        }
    })
    $("#ulSearchButton").click(function () {
        var ulClipSearchFilter = $("#ulClipSearchFilter")[0];
        var context = ko.contextFor(ulClipSearchFilter);
        var clipviewmodel = context.$data;
        if (!validateclipsearchfilter(ulstfiltertype, clipviewmodel)) {
            return false;
        }
        $("#uTreeview").css("display", "none");
        HideClipSearchFilterDialog();
        $(".ulsearchResultsBody").css("display", "block");
        $(".ulClipFilterIconHolder").css("display", "block");
        $(".icon-back").css("display", "block");
        $("#searchresultmsg").css("display", "block");
        $("#searchresultmsg").text("Loading...");
        douniversalclipsearch();
        currentsearchstate = searchstates.CLIP_RESULTMODE;
    })
    $("#ulCnclSearchButton").click(function () {
        if (currentsearchstate == searchstates.CLIP_SEARCH_TREEMODE) {
            $("#uTreeview").css("display", "block");
            HideClipSearchFilterDialog();
            $(".ulsearchResultsBody").css("display", "none");
            $(".ulClipFilterIconHolder").css("display", "block");
            $(".icon-back").css("display", "block");
        }
        else if (currentsearchstate == searchstates.CLIP_RESULTMODE) {
            $("#uTreeview").css("display", "none");
            HideClipSearchFilterDialog();
            $(".ulsearchResultsBody").css("display", "block");
            $(".ulClipFilterIconHolder").css("display", "block");
            $(".icon-back").css("display", "block");
        }
    })
    $(".icon-back").click(function () {
        HideClipSearchFilterDialog();
        //1-stage: move to tree
        if (currentsearchstate == searchstates.CLIP_SEARCH_TREEMODE) {
            $("#uTreeview").css("display", "block");
            HideClipSearchFilterDialog();
            $(".ulsearchResultsBody").css("display", "none");
            $(".ulClipFilterIconHolder").css("display", "none");
            $(".icon-back").css("display", "none");
            $('#UlclipSearchButton').css("display", "block");
            currentsearchstate = searchstates.NORMAL_TREEMODE;
            $.publish(window.viewerconfig.common.events.universalclipsearch, false);
        }

        //2-stage: move to tree with checkbox
        if (currentsearchstate == searchstates.CLIP_RESULTMODE) {
            $("#uTreeview").css("display", "block");
            HideClipSearchFilterDialog();
            $(".ulsearchResultsBody").css("display", "none");
            $(".ulClipFilterIconHolder").css("display", "block");
            $(".icon-back").css("display", "block");
            $('#UlclipSearchButton').css("display", "none");
            currentsearchstate = searchstates.CLIP_SEARCH_TREEMODE;
        }
    });
    function HideClipSearchFilterDialog() {
        $("#ulClipSearchFilter").animate("slow").css("display", "none");
        $("#clpfltrdrpdwnspan").attr("data-dropdown", "0");
    }
    function convertdatetimetostring(datetime) {
        var final = moment(datetime).format(common.constants.datetimeformat);
        return final;
    }
    function convertExportdatetimetostring(datetime) {
        var final = moment(datetime).format(common.constants.Exportdatetimeformat);
        return final;
    }

    function validateExportdate(exportmodel, isdontshowerror) {
        isdontshowerror = false;
        var exportfromdate = startdate;
        var maxendtime = convertdatetimetostring(new Date(exportfromdate).addMinutes(5));
        var minendtime = convertdatetimetostring(new Date(exportfromdate).addSeconds(5));
        var exportenddate = Enddate;

        if (moment(exportfromdate).valueOf() < moment(ClipStartDate).valueOf()) {
            if (isdontshowerror) {
                return false;
            }
            exportmodel.FromErrormessage(Resources.Viewer_ExportStartTimeLessThanClipStarttime);
            return false;
        }
        else {
            exportmodel.FromErrormessage("");
        }
        if (moment(exportenddate).valueOf() > moment(ClipEndDate).valueOf()) {
            if (isdontshowerror) {
                return false;
            }
            exportmodel.ToErrormessage(Resources.Viewer_ExportEndtimeGreaterThanClipEndtime);
            return false;
        }
        if (moment(exportfromdate).valueOf() > moment(exportenddate).valueOf()) {
            if (isdontshowerror) {
                return false;
            }
            exportmodel.ToErrormessage(Resources.Viewer_ClipEndTimeGreaterThanClipStartTime);
            return false;
        }
        if (moment(exportenddate).valueOf() > moment(maxendtime).valueOf()) {
            if (isdontshowerror) {
                return false;
            }
            exportmodel.ToErrormessage(Resources.Viewer_ClipExportTimeDurationNotMore5Minutes);
            return false;
        }
        if (moment(exportenddate).valueOf() < moment(minendtime).valueOf()) {
            if (isdontshowerror) {
                return false;
            }
            exportmodel.ToErrormessage(Resources.Viewer_ClipExportTimeDurationNotLess5Seconds);
            return false;
        }
        exportmodel.ToErrormessage("");
        return true;
    }

    function initExportdatetimepicker(exportmodel) {
        var pickdate = true;
        startdate = exportmodel.FromExportDate();
        Enddate = exportmodel.ToExportDate();

        $('#clipExportfrmtimepicker').datetimepicker('destroy');
        var dpfrom = $('#clipExportfrmtimepicker').datetimepicker({
            useSeconds: false,
            showToday: true,
            pick12HourFormat: false,
            pickDate: pickdate
        }).on('changeDate', function (e) {
            var ndate1 = $(dpfrom).data("datetimepicker").getLocalDate();
            startdate = convertdatetimetostring(ndate1);
            exportmodel.FromExportDate(convertdatetimetostring(ndate1));
            validateExportdate(exportmodel, true);
        });
        $('#clipExporttotimepicker').datetimepicker('destroy');
        var dpto = $('#clipExporttotimepicker').datetimepicker({
            useSeconds: false,
            showToday: true,
            pick12HourFormat: false,
            pickDate: pickdate
        }).on('changeDate', function (e) {
            var ndate = $(dpto).data("datetimepicker").getLocalDate();
            Enddate = convertdatetimetostring(ndate);
            exportmodel.ToExportDate(convertdatetimetostring(ndate));
            validateExportdate(exportmodel, true);
        });
        $(dpfrom).data("datetimepicker").setLocalDate(new Date(startdate));
        exportmodel.FromExportDate(convertdatetimetostring(startdate));
        $(dpto).data("datetimepicker").setLocalDate(new Date(Enddate));
        exportmodel.ToExportDate(convertdatetimetostring(Enddate));
    }



    function initdatetimepicker(filtertype, forcechange, clipviewmodel) {
        if (!forcechange && singlevdatetimepickerInitialised)
            return;
        singlevdatetimepickerInitialised = true;
        var pickdate = true;
        var startdate = Date.today();
        if (filtertype.toLowerCase() == common.Enumeration.DateRange.TODAY) {
            pickdate = false;
            filtertype = common.Enumeration.DateRange.TODAY;
            clipviewmodel.ClipFiltermodel.IsError(false);
            clipviewmodel.ClipFiltermodel.IsFilterError(false);
        }
        else if (filtertype.toLowerCase() == common.Enumeration.DateRange.YESTERDAY) {
            startdate = Date.today().addDays(-1);
            pickdate = false;
            filtertype = common.Enumeration.DateRange.YESTERDAY;
            clipviewmodel.ClipFiltermodel.IsError(false);
            clipviewmodel.ClipFiltermodel.IsFilterError(false);
        }
        else if (filtertype.toLowerCase() == common.Enumeration.DateRange.CUSTOM) {
            pickdate = true;
            filtertype = common.Enumeration.DateRange.CUSTOM;
            clipviewmodel.ClipFiltermodel.IsError(false);
            clipviewmodel.ClipFiltermodel.IsFilterError(false);
        }
        var enddate = new Date(startdate).addDays(1).addMilliseconds(-1000);
        $('#frmsingledatetimepicker').datetimepicker('destroy');
        var dpsinglefrom = $('#frmsingledatetimepicker').datetimepicker({
            useSeconds: false,
            showToday: true,
            pick12HourFormat: false,
            pickDate: pickdate
        }).on('changeDate', function (e) {
            var ndate = $(dpsinglefrom).data("datetimepicker").getLocalDate();
            validateclipsearchfilter(filtertype, clipviewmodel);
            clipviewmodel.ClipFiltermodel.FromDatetime(convertdatetimetostring(ndate));

        });
        $('#tosingledatetimepicker').datetimepicker('destroy');
        var dpsingleto = $('#tosingledatetimepicker').datetimepicker({
            useSeconds: false,
            showToday: true,
            pick12HourFormat: false,
            pickDate: pickdate
        }).on('changeDate', function (e) {
            var ndate = $(dpsingleto).data("datetimepicker").getLocalDate();
            validateclipsearchfilter(filtertype, clipviewmodel);
            clipviewmodel.ClipFiltermodel.ToDatetime(convertdatetimetostring(ndate));

        });
        if (filtertype.toLowerCase() != common.Enumeration.DateRange.CUSTOM) {
            $(dpsinglefrom).data("datetimepicker").setEndDate(enddate);
            $(dpsingleto).data("datetimepicker").setEndDate(enddate);
        }
        $(dpsinglefrom).data("datetimepicker").setLocalDate(startdate);
        clipviewmodel.ClipFiltermodel.FromDatetime(convertdatetimetostring(startdate));
        $(dpsingleto).data("datetimepicker").setLocalDate(enddate);
        clipviewmodel.ClipFiltermodel.ToDatetime(convertdatetimetostring(enddate));
    }
    function inituniversaldatetimepicker(filtertype, forcechange, clipviewmodel) {
        if (!forcechange && univdatetimepickerInitialised)
            return;
        univdatetimepickerInitialised = true;
        var pickdate = true;
        var startdate = Date.today();
        if (filtertype.toLowerCase() == common.Enumeration.DateRange.TODAY) {
            pickdate = false;
            clipviewmodel.ClipFiltermodel.IsError(false);
            clipviewmodel.ClipFiltermodel.IsFilterError(false);
        }
        else if (filtertype.toLowerCase() == common.Enumeration.DateRange.YESTERDAY) {
            startdate = Date.today().addDays(-1);
            pickdate = false;
            clipviewmodel.ClipFiltermodel.IsError(false);
            clipviewmodel.ClipFiltermodel.IsFilterError(false);
        }
        else if (filtertype.toLowerCase() == common.Enumeration.DateRange.CUSTOM) {
            pickdate = true;
            clipviewmodel.ClipFiltermodel.IsError(false);
            clipviewmodel.ClipFiltermodel.IsFilterError(false);
        }
        var enddate = new Date(startdate).addDays(1).addMilliseconds(-1000);
        $('#ulfrmdatetimepicker').datetimepicker('destroy');
        var dpfrom = $('#ulfrmdatetimepicker').datetimepicker({
            useSeconds: false,
            showToday: true,            
            pick12HourFormat: false,
            pickDate: pickdate
        }).on('changeDate', function (e) {
            validateclipsearchfilter(filtertype, clipviewmodel);
            var ndate = $(dpfrom).data("datetimepicker").getLocalDate();
            clipviewmodel.ClipFiltermodel.FromDatetime(convertdatetimetostring(ndate));
        });
        $('#ultodatetimepicker').datetimepicker('destroy');
        var dpto = $('#ultodatetimepicker').datetimepicker({
            useSeconds: false,
            showToday: true,            
            pick12HourFormat: false,
            pickDate: pickdate
        }).on('changeDate', function (e) {
            validateclipsearchfilter(filtertype, clipviewmodel);
            var ndate = $(dpto).data("datetimepicker").getLocalDate();
            clipviewmodel.ClipFiltermodel.ToDatetime(convertdatetimetostring(ndate));
        });
        if (filtertype.toLowerCase() != common.Enumeration.DateRange.CUSTOM) {
            $(dpfrom).data("datetimepicker").setEndDate(enddate);
            $(dpto).data("datetimepicker").setEndDate(enddate);
        }
        $(dpfrom).data("datetimepicker").setLocalDate(startdate);
        clipviewmodel.ClipFiltermodel.FromDatetime(convertdatetimetostring(startdate));
        $(dpto).data("datetimepicker").setLocalDate(enddate);
        clipviewmodel.ClipFiltermodel.ToDatetime(convertdatetimetostring(enddate));
    }
    function updatedatetimeforfiltertype(activeli) {
        var filtertype = $(activeli).children("[data-target]").attr("data-target");
        ulstfiltertype = filtertype;
        sngfiltertype = filtertype;
        window.viewerconfig.uicontext.sngfiltertype = filtertype;
        if (prevdaterange != filtertype) {
            var ulClipSearchFilter = $(activeli)[0];
            var context = ko.contextFor(ulClipSearchFilter);
            var clipviewmodel = context.$data;
            if (clipviewmodel.issinglecamera) {
                initdatetimepicker(filtertype, true, clipviewmodel);
            }
            else {
                inituniversaldatetimepicker(filtertype, true, clipviewmodel);
            }
            prevdaterange = common.filtertype;
        }
    }

    function initializeExporttime() {
        $('#clipExportfrmtimepicker').datetimepicker('destroy');
        $('#clipExporttotimepicker').datetimepicker('destroy');

        $('#clipExportfrmtimepicker, #clipExporttotimepicker').datetimepicker({
            language: 'en',
            pickDate: true,
            pick12HourFormat: false
        });
        var exportcontext = ko.contextFor(document.getElementById('exportClipModal'))
        var exportmodel = exportcontext.$data;
        initExportdatetimepicker(exportmodel);


        //  $('#clipExportfrmtimepicker').datetimepicker('destroy');
        //  var dpfrom = $('#clipExportfrmtimepicker').datetimepicker({
        //      useSeconds: false,
        //      showToday: true,
        //      pick12HourFormat: false,
        //      pickDate: pickdate
        //  }).on('changeDate', function (e) {
        ////      validateclipsearchfilter(filtertype, clipviewmodel);
        //      var ndate = $(dpfrom).data("datetimepicker").getLocalDate();
        //      clipviewmodel.ClipFiltermodel.FromDatetime(convertdatetimetostring(ndate));
        //  });

        //  var dpto = $('#clipExporttotimepicker').datetimepicker({
        //      useSeconds: false,
        //      showToday: true,
        //      pick12HourFormat: false,
        //      pickDate: pickdate
        //  }).on('changeDate', function (e) {
        //  //    validateclipsearchfilter(filtertype, clipviewmodel);
        //      var ndate = $(dpto).data("datetimepicker").getLocalDate();
        //      clipviewmodel.ClipFiltermodel.ToDatetime(convertdatetimetostring(ndate));
        //  });
    }
    //tree item selected 
    function ontreeitemselected(data) {
        currentSelecteditem = data;
    }
    // treeitenselectionchanged 
    function Treeitemselectionchanged(selecteditem) {
        try {
            if (currentSelecteditem && selecteditem && currentSelecteditem.nodedata.Id === selecteditem.nodedata.Id) {
                return;
            }
            ontreeitemselected(selecteditem);
            //currenttreeitem = currentSelecteditem;
            var salvoviewmodel = ko.contextFor(document.getElementById('viewersalvowrapper'));
            salvoviewmodel.$data.Getsalvowiew(selecteditem.nodedata);
            window.viewerconfig.common.salvodata = selecteditem;
        } catch (e) {
            console.error(e);
        }
    };

    function enableuniversalclipsearch(val) {
        universaltreeviewPlugin.getInstance().EnableCheckbox(val);
    }
    function ShowClipSearchFilterDialog() {
        var checkeditems = universaltreeviewPlugin.getInstance().GetCheckedItems();
        if (checkeditems && checkeditems.length > 0) {
            $("#ulClipSearchFilter").animate("slow").css("display", "block");
            $("#clpfltrdrpdwnspan").attr("data-dropdown", "1");

            var ulClipSearchFilter = $("#ulClipSearchFilter")[0];
            var ulsearchresults = $("#ulsearchresults")[0];
            var context = ko.contextFor(ulClipSearchFilter);
            var clipviewmodel;
            if (context != undefined && context.$data != undefined)
                clipviewmodel = context.$data;
            else
                clipviewmodel = new datacontext.ClipViewmodel(false);
            //clipviewmodel.ResetFilter();
            ko.applyBindings(clipviewmodel, ulClipSearchFilter);
            ko.applyBindings(clipviewmodel, ulsearchresults);
            prevdaterange = "";

            var activeli = $("#ulClipSearchFilter").find(".clipSearchNav").children(".active");
            var filtertype = $(activeli).children("[data-target]").attr("data-target");
            inituniversaldatetimepicker("today", false, clipviewmodel);
        }
    }
    function validateclipsearchfilter(filtertype, clipviewmodel) {

        if (filtertype.toLowerCase() == common.Enumeration.DateRange.TODAY) {
            var enddate = new Date(Date.today()).addDays(1).addMilliseconds(-1000);
            if (moment(clipviewmodel.ClipFiltermodel.FromDatetime()).valueOf() < moment(Date.today()).valueOf()) {
                clipviewmodel.ClipFiltermodel.Errormessage(common.messages.TodaydtError);
                clipviewmodel.ClipFiltermodel.IsError(true);
                return false;
            }

            if (moment(clipviewmodel.ClipFiltermodel.ToDatetime()).valueOf() > moment(enddate).valueOf()) {
                clipviewmodel.ClipFiltermodel.Errormessage(common.messages.TodaydtError);
                clipviewmodel.ClipFiltermodel.IsError(true);
                return false;
            }

        }
        if (filtertype.toLowerCase() == common.Enumeration.DateRange.YESTERDAY) {
            var startdate = Date.today().addDays(-1);
            var enddate = new Date(startdate).addDays(1).addMilliseconds(-1000);
            if (moment(clipviewmodel.ClipFiltermodel.FromDatetime()).valueOf() < moment(Date.today().addDays(-1)).valueOf()) {
                clipviewmodel.ClipFiltermodel.Errormessage(common.messages.yesterdaydtError);
                clipviewmodel.ClipFiltermodel.IsError(true);
                return false;
            }
            if (moment(clipviewmodel.ClipFiltermodel.ToDatetime()).valueOf() > moment(enddate).valueOf()) {
                clipviewmodel.ClipFiltermodel.Errormessage(common.messages.yesterdaydtError);
                clipviewmodel.ClipFiltermodel.IsError(true);
                return false;
            }

        }
        if (moment(clipviewmodel.ClipFiltermodel.FromDatetime()).valueOf() >= moment(clipviewmodel.ClipFiltermodel.ToDatetime()).valueOf()) {
            clipviewmodel.ClipFiltermodel.Errormessage(common.messages.DateError);
            clipviewmodel.ClipFiltermodel.IsError(true);
            return false;
        }

        if (!clipviewmodel.ClipFiltermodel.IsMotionEvent() && !clipviewmodel.ClipFiltermodel.IsSchedule() && !clipviewmodel.ClipFiltermodel.IsTriggerEvent() && !clipviewmodel.ClipFiltermodel.IsUserdriven() && !clipviewmodel.ClipFiltermodel.IsRuledriven()) {
            clipviewmodel.ClipFiltermodel.Filtermessage(common.messages.ClipEventError);
            clipviewmodel.ClipFiltermodel.IsError(false);
            clipviewmodel.ClipFiltermodel.IsFilterError(true);
            return false;
        }
        if (!clipviewmodel.ClipFiltermodel.IsOnsite() && !clipviewmodel.ClipFiltermodel.IsCloud()) {
            clipviewmodel.ClipFiltermodel.Filtermessage(common.messages.ClipStorageError);
            clipviewmodel.ClipFiltermodel.IsError(false);
            clipviewmodel.ClipFiltermodel.IsFilterError(true);
            return false;
        }
        clipviewmodel.ClipFiltermodel.IsError(false);
        clipviewmodel.ClipFiltermodel.IsFilterError(false);
        return true;
    }
    function douniversalclipsearch() {
        var checkeditems = universaltreeviewPlugin.getInstance().GetCheckedItems();
        if (checkeditems && checkeditems.length > 0) {
            var ulClipSearchFilter = $("#ulClipSearchFilter")[0];
            var context = ko.contextFor(ulClipSearchFilter);
            var clipviewmodel = context.$data;
            clipviewmodel.ResetResult();

            var checkedmodels = $.map(checkeditems, function (item) {
                return { Id: item.nodedata.Id, EntityType: item.nodedata.EntityType };
            });
            datacontext.getCameraByAccount(checkedmodels, function (cameras) {
                if (cameras != undefined && cameras.length > 0) {
                    var resultfound = false;
                    var searchedcameracount = 0;
                    for (var i = 0; i < cameras.length; i++) {
                        datacontext.clipsearch(clipviewmodel, cameras[i], function (callbackid) {
                            searchedcameracount++;
                            if (clipviewmodel.clipResults() == undefined || clipviewmodel.clipResults().length <= 0) {
                                if (!resultfound && cameras.length == searchedcameracount) {
                                    //show no results for the search only if for none of the cameras there is no search result
                                    $("#searchresultmsg").css("display", "block");
                                    $("#searchresultmsg").text(window.viewerconfig.common.messages.clipresult);
                                }
                            }
                            else {
                                //disable loading icon if it is visible
                                resultfound = true;
                                $("#searchresultmsg").css("display", "none");
                            }
                        }, function () {
                            searchedcameracount++;
                            //Handle error
                            if (!resultfound) {
                                $("#searchresultmsg").css("display", "block");
                                $("#searchresultmsg").text(window.viewerconfig.common.messages.clipresulterr);
                            }
                        });
                    }
                }
                else {
                    //show no results for the search if no cameras selected
                    $("#searchresultmsg").css("display", "block");
                    $("#searchresultmsg").text(window.viewerconfig.common.messages.clipresult);
                }
            });
        }
    }
    /*Universal List Clip Search */
    /*singlecamera List Clip Search */
    function showClipResult() {
        $(".clipSearchFilter").hide();
        $(".clipBodyHeader").show();
        $(".clipResults").show();
        $(".csearchresultbody").show();
        $("#loadingtxt").css("display", "block");
        $("#loadingtxt").text(Resources.Calendar_Loading);
    }
    function HideclipsearchFilter() {
        $("#loadingtxt").css("display", "none");
        $("#loadingtxt").text(window.viewerconfig.common.messages.clipresult);
    }

    function showError(element) {
        $(element).parent().parent().children('.showerror').css("display", "block");
    }

    function hideError(element) {
        $(element).parent().parent().children('.showerror').css("display", "none");
    }

    function Epochtimingconverter(datestring) {
        //var parts = datestring.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
        //return Date.UTC(+parts[3], parts[2] - 1, +parts[1], +parts[4], +parts[5]);

        //var parts = datestring.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2}) ([APap][mM])/);
        //if (parts[7] == "PM") {
        //    var op = +parts[4] + 12;
        //    parts[4] = op.toString();
        //}
        //var final = Date.UTC(+parts[3], parts[2] - 1, +parts[1], +parts[4], +parts[5], +parts[6]);
        //return final;

        var final = moment(datestring).valueOf();
        return final;
    }




    function getClipExportStream(exportmodel) {
        var exportUUID = common.createUUID();
        var clipdata = selectedClipresult.Clone();
        if (exportmodel.Local()) {
            clipdata.SeekedStartDate(Epochtimingconverter(startdate));
            clipdata.SeekedEndDate(Epochtimingconverter(Enddate));
        }
        exportmodel.Clipdetails = clipdata;
        exportmodel.isshowhide(true);
        hideExportModal(exportmodel);
        $.publish("clipdatarecieved", exportmodel);
    }

    function ToJavaScriptDate(value) {
        var formattedDate = new Date(value);
        var final = moment(formattedDate).format(common.constants.datetimeformat);
        return final;
    }
    function showClipExport(clipresultmodel) {
        var $clipmodal = $('#exportClipModal');
        ko.cleanNode(document.getElementById("exportClipModal"));
        showClipExport.exportDialog = $clipmodal;
        var context;
        if (!ISSingle) {
            var Clipsearch = $("#ulsearchresults")[0];
            context = ko.contextFor(Clipsearch);
        }
        else {
            var Clipsearch = $("#clpsrch")[0];
            context = ko.contextFor(Clipsearch);
        }
        selectedClipresult = clipresultmodel;
        var newexportmodal = new datacontext.ExportModal();
        newexportmodal.SavePath("");
        newexportmodal.isexport(true);
        newexportmodal.IsSave(false);
        newexportmodal.isprogress(false);
        newexportmodal.progressvalue("0");
        newexportmodal.Error("");
        newexportmodal.Iscancel(false);
        newexportmodal.ToErrormessage("");
        newexportmodal.FromErrormessage("");
        var sdate = ToJavaScriptDate(selectedClipresult.StartDate());
        ClipStartDate = (new Date(sdate)).addSeconds(-1 * selectedClipresult.Prevent());
        ClipEndDate = selectedClipresult.EndDate();
        newexportmodal.FromExportDate(ToJavaScriptDate(ClipStartDate));
        newexportmodal.ToExportDate(ToJavaScriptDate(ClipEndDate));

        if (selectedClipresult.Local())
            newexportmodal.Local(true);
        else
            newexportmodal.Local(false);
        ko.applyBindings(newexportmodal, document.getElementById("exportClipModal"));
        $clipmodal.modal(modalOptions)
        initializeExporttime();
        if (selectedClipresult.Local())
            newexportmodal.Local(true);
        else
            newexportmodal.Local(false);
    }
    function hideExportModal(exportmodel) {
        try {
            if (showClipExport.exportDialog) {
                showClipExport.exportDialog.modal('hide');
            }
        } catch (e) {
            console.log(e);
        }
    }

    //function updatesalvotree(salvoentity) {
    //    var SalvoData = ([]);
    //    SalvoData.push(common.salvodata);
    //    SalvoData.push(salvoentity);
    //    $.publish(window.viewerconfig.common.events.Salvotreeitemupdate, SalvoData);
    //}
    function TwoDigits(val) {
        if (val < 10) {
            return "0" + val;
        }

        return val;
    }
    //public string EntityInstanceIdField { get; set; }
    //public string EntityTypeField { get; set; }
    //public int PanelNumberField { get; set; }
    //public string EntityInstanceNameField { get; set;}
    function CallbackSaveNewSalvo(newentity, serverdata) {
        try {
            salvotreeviewPlugin.getInstance().AddTreeNodes(serverdata);
            currentSelecteditem = salvotreeviewPlugin.getInstance().SelectTreeNode(newentity.Id());
            if (currentSelecteditem) {
                UpdateCurrentSelectedItem(currentSelecteditem, newentity);
                var salvoviewmodel = ko.contextFor(document.getElementById('viewersalvowrapper'));
                salvoviewmodel.$data.updatenewsalvoview(currentSelecteditem.nodedata);
            }
        } catch (e) {
            throw e;
        }
    }

    function CallbackUpdateSalvo(updatedEntity) {
        try {
            if (currentSelecteditem) {
                UpdateCurrentSelectedItem(currentSelecteditem, updatedEntity);  //[SalvoList Update Bug Fix] - Praneesh 31 Jan 2015
                var updatedsConfig = {
                    children: [],
                    nodedata: currentSelecteditem
                };
                currentSelecteditem.updaterootcalback(updatedsConfig);
            }
        } catch (e) {
            throw e;
        }
    }
    /*
        [SalvoList Update Bug Fix] - Praneesh 31 Jan 2015
    */
    function UpdateCurrentSelectedItem(currentSelecteditem, updatedEntity) {
        //Clean up the existing currentselecteditem array
        var currentSelectedNodeSalvoEntityInfo = currentSelecteditem.nodedata.SalvoViewEntityInfoField;
        while (currentSelectedNodeSalvoEntityInfo.length > 0) {
            currentSelectedNodeSalvoEntityInfo.pop();
        }

        currentSelecteditem.nodedata.Id = updatedEntity.Id();
        currentSelecteditem.nodedata.Name = updatedEntity.Name();
        currentSelecteditem.nodedata.SalvoLayOutField = common.ConvertGridSalvoLayout(updatedEntity.SalvoLayOutField());

        var updatedEntityInfoField = updatedEntity.SalvoViewEntityInfoField();
        var updatedEntityFieldsLength = updatedEntityInfoField.length;
        for (var i = 0; i < updatedEntityFieldsLength; i++) {
            var entityFieldObject = new Object();
            entityFieldObject.EntityInstanceIdField = updatedEntityInfoField[i].EntityInstanceIdField();
            entityFieldObject.EntityInstanceNameField = updatedEntityInfoField[i].EntityInstanceNameField();
            entityFieldObject.EntityTypeField = updatedEntityInfoField[i].EntityTypeField();
            entityFieldObject.PanelNumberField = updatedEntityInfoField[i].PanelNumberField();
            currentSelecteditem.nodedata.SalvoViewEntityInfoField.push(entityFieldObject);
        }
    }

    $.subscribe("DeleteSalvo", function (data, currentcontext) {
        deletecontext = currentcontext;
        var serviceModel = currentcontext.$root.servicemodel();
        if (serviceModel.deletenodeurl() && serviceModel.deletenodeurl() != "") {
            var url = serviceModel.deletenodeurl() + "?entitytype=" + currentcontext.$data.type() + "&id=" + currentcontext.$data.id();
        }
        datacontext.DeleteSalvo(url).done(function (jsondata) {
            var nodes = jsondata;
            try {
                console.log("Salvo deletion success");
                if (jsondata.success) {
                    alertify.success(Resources.Viewer_SalvoDeletedSuccessfully);
                    var svm = ko.contextFor(document.getElementById('viewersalvowrapper'));
                    svm.$data.Salvoname("");
                    currentSelecteditem.deletecallback(deletecontext);
                }
                else
                    alertify.error(Resources.Viewer_SalvoDeletionFailed);
            } catch (e) {
                console.log("Salvo Deletion failed");
            }

        });

    });

    $.subscribe("updatesalvo", function (data, currentcontext) {
        common.updatecontext = currentcontext;
    });


    //$.subscribe("Salvotreeitemselected", function (data, salvodata) {
    //    common.salvodata = salvodata;
    //});

    // this is to subscribe the door alarm
    $.subscribe('systemeventreceived', function (data, alaramdata) {
        console.log('testing....123');
        if ((alaramdata[0].EventCode == 5000)) {
            var DoorId = alaramdata[0].AdditionalInfo[0].value[0].ID;
            var DoorName = alaramdata[0].AdditionalInfo[0].value[0].Name;

            var result = _.contains(common.cameraArr, DoorId);
            if (!result) {
                return;
            }

            var element = $(".doorAssociationDetails[data-doorid=" + DoorId + "]")[0];
            var context = ko.contextFor(element);
            if (!(context && context.$data)) {
                return;
            }
            datacontext.getDoorEvent(DoorId, "DOOR", 0, 3).done(function (jsondata) {
                var pnlmodel = context.$data;
                var dooreventResult = jsondata;
                if (dooreventResult.Success) {
                    pnlmodel.doorsessionmodel.Initializedoorevent(dooreventResult.data, pnlmodel)
                    //currentpnl.iscustomimage(false);
                    pnlmodel.isrequesting(false);
                    //currentpnl.isdoor(true);
                    pnlmodel.issuccess(true);
                    console.log("Live event for this Door  " + DoorName + "  successfull");
                }
            });
        }
    });

    function showPath() {
        $("#exportClipModal .clickexportPath .field, #exportClipModal .clickexportPath .exportFolder, #exportClipModal .clickexportPath #browseClipPath").css("display", "block");
    }
    function hidePath() {
        $("#exportClipModal .clickexportPath .field, #exportClipModal .clickexportPath .exportFolder, #exportClipModal .clickexportPath #browseClipPath").css("display", "none");
    }
    $(function () {
        $('#clipExportfrmtimepicker, #clipExporttotimepicker').datetimepicker({
            language: 'en',
            pickDate: true,
            pick12HourFormat: false
        });
    });





    function initialize() {
        wireupuievents();
        initializesalvo();
        ko.applyBindings(new ViewerFooterViewModel(), document.getElementById('viewerfooter'));
        ko.applyBindings(new window.viewerconfig.datacontext.ViewerUniversialViewModel(), document.getElementById('Ulistitem'));
        //ko.applyBindings(new window.viewerconfig.datacontext.UniversialHeaderViewModel(), document.getElementById('universalListHeading1'));

    }
    initialize();
    return vieweruicontext;
})(jQuery, ko, window.viewerconfig.common, window.viewerconfig.datacontext, jwplayer, window.viewerconfig.clipsearch, window.viewerconfig.salvolayout, window.viewerconfig.salvomanagement);

