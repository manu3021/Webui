window.mpcaoutput = window.mpcaoutput || {};
window.mpcaoutput.common = (function ($) {
    var constants = {
        entitytype: "MPCAoutput",
        parententitytype: "recorder",
        parentdevicetype: "hrrh8",
        feature: { CameraId: "CameraId", TriggerId: "TriggerId", OutputLevel: "OutputLevel" },
        recorderstatus: { NOTREGISTERED: "NotRegistered", ONLINE: "Online", OFFLINE: "Offline", DEACTIVE: "Deactive" },
        outputlevel: {NC: "HIGH", NO: "LOW"}
    }
    var labels = {
        savebuttontext: Resources.SaveSettings
    };
    var events = {
        treeviewnodeselectedevent: "treeviewitemselected",
    };
    var messages = {
        output_save_success: Resources.Successfully_saved,
        output_save_error: Resources.Save_failed,
        outputlabel: Resources.mpcaoupt_msg_oupt,
        output_act_fail: Resources.mpcaoupt_msg_act_fail,
        output_activated: Resources.mpcaoupt_msg_act_succs,
        output_pls_ent_nam: Resources.mpcaoupt_msg_pls_ent_opnam,
        output_opnam_cnt_grt: Resources.mpcaoupt_msg_opnam_cnt_grt,
        devoffline_cnfgdwnOnOnl: Resources.Panel_status_offline
    }
    return {
        constants: constants,
        labels: labels,
        events: events,
        messages: messages
    };
})(jQuery);