window.mpcacamerasetting = window.mpcacamerasetting || {}
//window.mpcacamerasetting.configure = window.mpcacamerasetting.configure || {}
//window.mpcacamerasetting.eventrecording = window.mpcacamerasetting.eventrecording || {}
//window.mpcacamerasetting.continousrecording = window.mpcacamerasetting.continousrecording || {}
//window.mpcacamerasetting.motionrecording = window.mpcacamerasetting.motionrecording || {}



window.mpcacamerasetting.common = (function ($) {
    var constants = {
        entitytype: "camera",
        droppableentitytype: "door",
        analogsmartvmdmaxcount: 4,
        recorderstatus: { NOTREGISTERED: "NotRegistered", ONLINE: "Online", OFFLINE: "Offline", DEACTIVE: "Deactive" },
        defaultMask: "************",
        videostatus: {
            SUCCESS: "success", ERR_NO_FREE_SESSION: "err_no_free_session", ERR_SESSION_ALREADY_EXISTS: "err_session_already_exists",
            ERR_WRONG_SESSIONID: "err_wrong_sessionid", ERR_UNEXPECTED: "err_unexpected", ERR_CLIP_NOT_FOUND: "err_clip_not_found", ERR_AUTH_FAILURE: "err_auth_failure"
        },
        cameratypes: { IPCamera: 'IPCamera', AnalogCamera: 'AnalogCamera' },
        configtabs: { Settings: "#configure", EventRecording: "#event", ContinuousRecording: "#continue", MotionRecording: "#motion" },
        scheduletypes:
            {
                Default:
                    {
                        text: Resources.Schedule, value: 'Schedule'
                    },
                Continuous:
                    {
                        text: Resources.mpcaCam_CntRec_CntRecSch, value: 'Continuous'
                    },
                MotionBased:
                    {
                        text: Resources.mpcaCam_MtnRec_MtRecSch, value: 'EventBased'
                    }
            },
        scheduledaytypes: { SingleDay: 'singleday', MulitpleDays: 'multiday' },
        days: [{ index: 0, value: 1, text: Resources.day_sunday }, { index: 1, value: 2, text: Resources.day_monday }, { index: 2, value: 4, text: Resources.day_tuesday },
                { index: 3, value: 8, text: Resources.day_wednsday }, { index: 4, value: 16, text: Resources.day_thursday }, { index: 5, value: 32, text: Resources.day_friday },
                 { index: 6, value: 64, text: Resources.day_saturday }],
        ResolutionList: {
            CIF: "CIF",
            R320_180: "320x180",
            R320_240: "320x240",
            R352_240: "352x240",
            R352_288: "352x288",
            R640_360: "640x360",
            R640_480: "640x480",
            R800_450: "800x450",
            R1280_720: "1280x720",
            R1920_1080: "1920x1080"
        },
        QualityList: {
            GOOD: "GOOD",
            BETTER: "BETTER",
            BEST: "BEST"
        },
        DefaultMinimumPreevent: 5
    };
    var events = {
        treeviewitemselectedevent: "treeviewitemselected",
        filterontreenodedropped: "filterontreenodedropped",
        removefilterfortreenode: "removefilterfortreenode",
        mpcascheduleupdate: "mpcascheduleupdate",
        oncameratypechanged: "oncameratypechanged",
        ontabchangeevent: "ontabchangeevent"
    };
    var messages = {
        save_success: Resources.Successfully_saved,
        save_error: Resources.Save_failed,
        enable_no_Ipcam_error: Resources.mpcaCam_msg_enable_no_Ipcam_error,
        Error_Live: Resources.mpcaCam_msg_Error_Live,
        Requesting_Live: Resources.mpcaCam_msg_Requesting_Live,
        no_trg_motn_cnf: Resources.mpcaCam_msg_no_trg_motn_cnf,
        no_post_evnt_trg_cnf: Resources.mpcaCam_msg_no_post_evnt_trg_cnf,
        no_post_evnt_motn_cnf: Resources.mpcaCam_msg_no_post_evnt_motn_cnf,
        dev_cap_lmt_rchd: Resources.mpcaCam_msg_dev_cap_lmt_rchd,
        sch_frmlsttotime: Resources.mpcaCam_msg_sch_frmlsttotime,
        devoffline_cnfgdwnOnOnl: Resources.Panel_status_offline,
        svmd_lmt_rchd: Resources.mpcaCam_svmd_lmt_rchd.format(constants.analogsmartvmdmaxcount),
        saving: Resources.msg_saving,
        plsinstflashplayer: Resources.plsinstflashplayer,
        instflsplgn: Resources.instflsplgn,
        clicktodownloadflashplayer: Resources.clkdwnadbflsplr
    }
    var filters = {
        resolutionFilters1080p: { Resolution: constants.ResolutionList.R1920_1080, MaxFPSLimit: '7', QualityValue: constants.QualityList.BEST },
        resolutionFiltersNonCIF: {
            Resolutions: [constants.ResolutionList.R640_360,
            constants.ResolutionList.R640_480,
            constants.ResolutionList.R800_450,
            constants.ResolutionList.R1280_720,
            constants.ResolutionList.R1920_1080],
            MaxPreEvent: 5
        }
    };

    function getPlayerLoadingImage() {
        return $("#Livepreviewload").attr('data-playerimage')
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

    return {
        constants: constants,
        events: events,
        messages: messages,
        filters: filters,
        createUUID: createUUID,
        getPlayerLoadingImage: getPlayerLoadingImage
    };
})(jQuery);