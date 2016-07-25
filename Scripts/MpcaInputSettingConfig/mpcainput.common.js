window.mpcainput = window.mpcainput || {};
window.mpcainput.common = (function ($) {
    var constants = {
        entitytype: "MPCAinput",
        parententitytype: "recorder",
        parentdevicetype: "hrrh8",
        feature: { InputLevel: "InputLevel" },
        recorderstatus: { NOTREGISTERED: "NotRegistered", ONLINE: "Online", OFFLINE: "Offline", DEACTIVE: "Deactive" }
    }
    var labels = {
        savebuttontext: Resources.SaveSettings
    };
    var events = {
        treeviewnodeselectedevent: "treeviewitemselected",
    };
    var messages = {
        input_save_success: Resources.Successfully_saved,
        input_save_error: Resources.Save_failed,
        inputlabel: Resources.mpcainp_msg_trg,
        input_pls_ent_inpnam: Resources.mpcainp_msg_pls_ent_inpnam,
        input_inpnam_cnt_grt: Resources.mpcainp_msg_inpnam_cnt_grt,
        devoffline_cnfgdwnOnOnl: Resources.Panel_status_offline
    }
    return {
        constants: constants,
        labels: labels,
        events: events,
        messages: messages
    };
})(jQuery);