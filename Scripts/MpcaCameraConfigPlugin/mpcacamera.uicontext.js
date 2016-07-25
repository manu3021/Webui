/// <reference path="mpcacamera.common.js" />
/// <reference path="mpcacamera.datacontext.js" />
/// <reference path="mpcacamera.model.js" />
/// <reference path="mpcacamera.validationcontext.js" />
/// <reference path="mpcacamera.treeviewloader.js" />

window.mpcacamerasetting.uicontext = (function ($, datacontext, common, validationcontext) {
    var currentcamera;
    var $scheduleSettingDialog, $doorAscDialog, modalOptions = { show: true, keyboard: false, backdrop: "static" };
    function oncameraselectionchanged(data) {
        currentcamera = data;
        datacontext.oncameraselected(currentcamera, data.parentnodedata);
        setactivesettingform();
    }
    function showassociatedialog() {
        $doorAscDialog = $('#mpcacameraassociate');
        ko.cleanNode(document.getElementById("mpcacameraassociate"));

        var cameracontext = ko.contextFor(document.getElementById("mpcaCamerasetting"));
        var cameramodel = cameracontext.$data;
        datacontext.getassociateddevices(cameramodel, false, function (result) {
            mpcacameratreeviewPlugin.getInstance().initialize($("#mpcacameratreeview"), result);
        });
        ko.applyBindings(cameramodel, document.getElementById("mpcacameraassociate"));

        $('.modelRightSection').droppable({
            accept: function (elem) {
                var treenodemodel = ko.contextFor(elem[0]).$data;
                if (treenodemodel.nodeobject == undefined ||
                    treenodemodel.nodeobject.EntityType.toLowerCase() != common.constants.droppableentitytype.toLowerCase())
                    return false;
                var drg = treenodemodel.draggable();
                if (drg == "false")
                    return false;
                return true;
            },
            tolerance: 'pointer',
            hoverClass: 'state-hover',
            drop: function (event, ui) {
                var contextDragger = $(ui)[0].draggable.context;
                var treenodemodel = ko.contextFor(contextDragger).$data;
                var targetcontext = ko.contextFor(event.currentTarget.activeElement);
                var targetcamermodel = targetcontext.$data;
                var deviceentity = new datacontext.deviceEntity({ Id: treenodemodel.id(), Name: treenodemodel.name() });
                targetcamermodel.adddeviceitem(deviceentity);
            },
            over: function (event, ui) {
                $('#log').text('over');
            },
            out: function (event, ui) {
                $('#log').text('out');
            }
        });
        $doorAscDialog.modal(modalOptions);
    }

    function closecurrentDialog() {
        if ($doorAscDialog) {
            $doorAscDialog.modal("hide");
        }
    }

    function showscheduledialog(scheduleId, scheduletype) {
        $scheduleSettingDialog = $('#schedulePopup');
        ko.cleanNode(document.getElementById("schedulePopup"));
        var schedulemodel = new datacontext.ScheduleSettings(scheduletype);
        datacontext.getschedulesettings(scheduleId).done(function (jsondata) {
            if (jsondata.Success) {
                schedulemodel.Initialise(jsondata.data);
                InitialiseScheduleTimePicker(schedulemodel);
            }
	    showloading(false);
        }).error(function () {
           showloading(false);
        });
        ko.applyBindings(schedulemodel, document.getElementById("schedulePopup"));
        $scheduleSettingDialog.modal(modalOptions);
    }

    function closescheduledialog() {
        if ($scheduleSettingDialog) {
            $scheduleSettingDialog.modal("hide");
        }
    }

    function selectsubtab(tabhref) {
        $('#mpcTabs a[href="' + tabhref + '"]').tab('show');
    }

    function InitSelectize() {
        $('#ipcamera').selectize();
        $('#cameraType').selectize();
        $('#cameraDiscovered').selectize();
        $('#cameraModel').selectize();
        $('#cameraFPS').selectize();
        $('#cameraResolution').selectize();
        $('#cameraQuality').selectize();
        $('#videoFormat, #videoFormat1').selectize();
    }

    function validateform(tabid) {
        switch (tabid) {
            case common.constants.configtabs.EventRecording: {
                return validationcontext.validateForm("mpcacameraevntrecsetting");
                break;
            }
            case common.constants.configtabs.ContinuousRecording: {
                return validationcontext.validateForm("mpcacameracontinusrecsetting");
                break;
            }
            case common.constants.configtabs.MotionRecording: {
                return validationcontext.validateForm("mpcacameramotionrecsetting");
                break;
            }
            default: {
                return validationcontext.validateForm("mpcaCamerasetting");
                break;
            }
        }
    }
    function setactivesettingform() {
        if (currentcamera != undefined) {
            if (currentcamera.nodedata.EntityType.toLowerCase() == common.constants.entitytype.toLowerCase()) {
                hideallforms();
                $("[data-accounttype='MPCADEVICECONFIGWRAPPER']").addClass("settingsform_active");
                $("[data-accounttype='MPCACAMERACONFIG']").addClass("settingsform_active");
                showloading(true);
                $("#mpcTabs").children("li").each(function () {
                    $(this).removeClass("active");
                });
                $($("#mpcTabs")[0].firstElementChild).addClass("active");
                $("#mpcTabsContent").children("div").each(function () {
                    $(this).removeClass("active");
                });
                $($("#mpcTabsContent")[0].firstElementChild).addClass("active");
                binddatatoactiveform();
            }
        }
    }
    function hideallforms() {
        $("[data-accounttype]").removeClass("settingsform_active");
        $("[data-accounttype]").addClass("settingsform");
    }
    function binddatatoactiveform() {
        var context = ko.contextFor($("#mpcacameraparent")[0]);
        datacontext.getcameraconfigdetail().done(function (jsondata) {
            if (jsondata.Success) {
                OncamerachangecloseLiveview();
                var cameramodel;
                if (context != undefined && context.$data != undefined) {
                    cameramodel = context.$data;
                    cameramodel.Initialise(jsondata.data);
                }
                else {
                    cameramodel = new datacontext.CameraBasemodel();
                    cameramodel.Initialise(jsondata.data);
                    ko.applyBindings(cameramodel, document.getElementById("mpcacameraparent"));
                }
                cameramodel.InitialiseActiveTab("#mpcTabs");
                validationcontext.setvalidationfor("mpcaCamerasetting");
                validationcontext.setvalidationfor("mpcacameraevntrecsetting");
                validationcontext.setvalidationfor("mpcacameracontinusrecsetting");
                validationcontext.setvalidationfor("mpcacameramotionrecsetting");
               
            }
            else {
                //Handle error
            }
	    showloading(false);
        });
    }
    function OncamerachangecloseLiveview() {
        var allplayers = $('.playHolder').each(function (index, item) {
            //getting the Cameraview model on click of close
            var cameraviewmodel = ko.contextFor(item);//document.getElementById('PlayerId'));
            try {

                //checking if sessionmodel is there for this camera if there and then close
                if (cameraviewmodel!=undefined && (cameraviewmodel.$parent.PanelModel() != null) && (cameraviewmodel.$parent.PanelModel() != undefined)) {
                    var currentpanelmodel = null;
                    if (item.id == 'vmdPlayerId') {
                        cameraviewmodel.$data.init();
                        currentpanelmodel = cameraviewmodel.$data.VMDPanelModel();
                        cameraviewmodel.$data.ismotionrecordinginitialised = false;
                    }
                    else
                        currentpanelmodel = cameraviewmodel.$parent.PanelModel();
                    var sessionmodel = currentpanelmodel.sessionmodel;
                    //  checking if sessionmodel and camera Id is there for this camera if there and then close
                    if ((sessionmodel != null) && (sessionmodel != undefined) && (sessionmodel.cameraid() != "")) {
                        //close the session for the Live view
                        currentpanelmodel.closepanel();
                    }
                }
            }
            catch (e) {
                console.log("error on closing Live view  OncamerachangecloseLiveview method" + e.message);
            }
        });
    }
    function InitialiseScheduleTimePicker(schedulemodel) {
        var startdate = schedulemodel.StartTime();
        var enddate = schedulemodel.EndTime();
        $('#singlefrmdatetimepicker').datetimepicker('destroy');
        var singlefrmdatetimepicker = $('#singlefrmdatetimepicker').datetimepicker({
            language: 'en',
            pickDate: false,
            pick12HourFormat: false
        }).on('changeDate', function (e) {
            var ndate = $(singlefrmdatetimepicker).data("datetimepicker").getLocalDate();
            var timechange = new Date(schedulemodel.StartTime());
            timechange.setHours(ndate.getHours());
            timechange.setMinutes(ndate.getMinutes());
            timechange.setSeconds(ndate.getSeconds());
            schedulemodel.StartTime(timechange);
        });
        $(singlefrmdatetimepicker).data("datetimepicker").setLocalDate(startdate);

        $('#singletodatetimepicker').datetimepicker('destroy');
        var singletodatetimepicker = $('#singletodatetimepicker').datetimepicker({
            language: 'en',
            pickDate: false,
            pick12HourFormat: false
        }).on('changeDate', function (e) {
            var ndate = $(singletodatetimepicker).data("datetimepicker").getLocalDate();
            var timechange = new Date(schedulemodel.EndTime());
            timechange.setHours(ndate.getHours());
            timechange.setMinutes(ndate.getMinutes());
            timechange.setSeconds(ndate.getSeconds());
            schedulemodel.EndTime(timechange);
        });
        $(singletodatetimepicker).data("datetimepicker").setLocalDate(enddate);

        $('#multifrmdatetimepicker').datetimepicker('destroy');
        var multifrmdatetimepicker = $('#multifrmdatetimepicker').datetimepicker({
            language: 'en',
            pickDate: false,
            pick12HourFormat: false
        }).on('changeDate', function (e) {
            var ndate = $(multifrmdatetimepicker).data("datetimepicker").getLocalDate();
            var timechange = new Date(schedulemodel.StartTime());
            timechange.setHours(ndate.getHours());
            timechange.setMinutes(ndate.getMinutes());
            timechange.setSeconds(ndate.getSeconds());
            schedulemodel.StartTime(timechange);
        });
        $(multifrmdatetimepicker).data("datetimepicker").setLocalDate(startdate);

        $('#multitodatetimepicker').datetimepicker('destroy');
        var multitodatetimepicker = $('#multitodatetimepicker').datetimepicker({
            language: 'en',
            pickDate: false,
            pick12HourFormat: false
        }).on('changeDate', function (e) {
            var ndate = $(multitodatetimepicker).data("datetimepicker").getLocalDate();
            var timechange = new Date(schedulemodel.EndTime());
            timechange.setHours(ndate.getHours());
            timechange.setMinutes(ndate.getMinutes());
            timechange.setSeconds(ndate.getSeconds());
            schedulemodel.EndTime(timechange);
        });
        $(multitodatetimepicker).data("datetimepicker").setLocalDate(enddate);

        if (schedulemodel.IsSingleDay()) {
            $(multifrmdatetimepicker).data("datetimepicker").disable();
            $(multitodatetimepicker).data("datetimepicker").disable();
        }
        else {
            $(singlefrmdatetimepicker).data("datetimepicker").disable();
            $(singletodatetimepicker).data("datetimepicker").disable();
        }
    }

    var isalreadyloading = false;
    function showloading(isshow) {
        if (isshow && !isalreadyloading) {
            $("#mpcacameraparent").showLoading();
            isalreadyloading = true;
        }
        else if (!isshow && isalreadyloading) {
            $("#mpcacameraparent").hideLoading();
            isalreadyloading = false;
        }
    }

    var isalreadysaving = false;
    function showsaving(isshow) {
        if (isshow && isalreadyloading) {
            $("#mpcacameraparent").hideLoading();
            isalreadyloading = false;
        }

        if (isshow && !isalreadysaving) {
            $("#mpcacameraparent").showLoading({ 'text': common.messages.saving + '...' });
            isalreadysaving = true;
        }
        else if (!isshow && isalreadysaving) {
            $("#mpcacameraparent").hideLoading();
            isalreadysaving = false;
        }
    }


    function RetryVideoStream() {
        try {
            if (datacontext.CurrentPanelmodel == undefined)
                return;
            GetLivepreview(datacontext.CurrentPanelmodel, datacontext.CurrentPanelmodel.sessionmodel.cameraid(), datacontext.CurrentPanelmodel.sessionmodel.cameraname(), true);

        } catch (e) {
            throw e;
        }

    }

    // close session 
    function CloseLivesession(cameraid, sessionid) {
        datacontext.sendStopCamerarequest(cameraid, sessionid);
    }

    /*  Live stream camera Section starts    Calling datacontext live stream method 
        Assign to Setupplayer and Play JW player   adding panel to viewmodel panel array */
    function GetLivepreview(Currentpanelmodel, cameraId, CameraName, retry,playerSectionId) {
        var LiveUUID = common.createUUID();
        var mCurrentPanel = Currentpanelmodel;
        //        if (!retry) {
        //            mCurrentPanel = ko.contextFor(PanelContext).$data;
        //            mCurrentPanel.erromessage(common.messages.Requestmsg);
        ////            common.cameraArr.push(cameraId);
        //        }
        $('.stitched').css('border', 'none');
        mCurrentPanel.erromessage(common.messages.Requesting_Live);
        mCurrentPanel.isshow(true);
        mCurrentPanel.iscustomimage(true);
        mCurrentPanel.isrequesting = true;
        mCurrentPanel.issuccess(false);
        mCurrentPanel.sessionmodel.cameraid(cameraId);

        //Check if flash is installed
        if (!swfobject.hasFlashPlayerVersion("1")) {
            alertify.alert(common.messages.plsinstflashplayer + '<br/><a href="https://get.adobe.com/flashplayer/" target="_blank">' + common.messages.clicktodownloadflashplayer + '</a>');
            mCurrentPanel.isrequesting = false;
            mCurrentPanel.isError(true);
            mCurrentPanel.erromessage(common.messages.instflsplgn);
            mCurrentPanel.iscustomimage(false);
            console.log("flash player not installed for Live stream");
            return;
        }

        datacontext.getLivestream(cameraId, LiveUUID).done(function (jsondata) {
            mCurrentPanel.isrequesting = false;
            var stream = jsondata;
            if (stream.VideoResultstring.toLowerCase() == common.constants.videostatus.SUCCESS) {
                mCurrentPanel.iscustomimage(false);
                //mCurrentPanel.isError(true);
                //mCurrentPanel.erromessage(common.messages.Error_Live);
                mCurrentPanel.sessionmodel.InitializeLiveviewsession(cameraId, stream.SessionId, CameraName, stream.Url, mCurrentPanel, playerSectionId);
                mCurrentPanel.issuccess(true);
                mCurrentPanel.isclosevisible(true);
            }
            else {
                console.log("Error" + stream.VideoResultstring);
                mCurrentPanel.isError(true);
                mCurrentPanel.erromessage(common.messages.Error_Live);
                mCurrentPanel.iscustomimage(false);
            }
        }).error(function (e, jsondata) {
            mCurrentPanel.isrequesting = false;
        });
    }

    function Init() {
    }

    Init();

    return {
        oncameraselectionchanged: oncameraselectionchanged,
        validateform: validateform,
        showassociatedialog: showassociatedialog,
        closecurrentDialog: closecurrentDialog,
        selectsubtab: selectsubtab,
        showscheduledialog: showscheduledialog,
        closescheduledialog: closescheduledialog,
        InitialiseScheduleTimePicker: InitialiseScheduleTimePicker,
        showloading: showloading,
        GetLivepreview: GetLivepreview,
        CloseLivesession: CloseLivesession,
        RetryVideoStream: RetryVideoStream,
        showsaving: showsaving,
        OncamerachangecloseLiveview: OncamerachangecloseLiveview
    };
})(jQuery, window.mpcacamerasetting.datacontext, window.mpcacamerasetting.common, window.mpcacamerasetting.validationcontext);





