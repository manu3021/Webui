window.mpcarecorderconfig = window.mpcarecorderconfig || {};
window.mpcarecorderconfig.common = (function ($) {
    var constants = {
        entitytype: "recorder",
        devicetype: "hrrh8",
        videoformats: { NTSC: "NTSC", PAL: "PAL" },
        devicestatus: { NOTREGISTERED: "NotRegistered", ONLINE: "Online", OFFLINE: "Offline", DEACTIVE: "Deactive" }
    }
    var labels = {
        editbuttontext: Resources.Edit,
        savebuttontext: Resources.SaveSettings
    };
    var events = {
        treeviewnodeselectedevent: "treeviewitemselected",
        systemeventreceived: "systemeventreceived"
    };
    var messages = {
        recorder_save_success: Resources.Successfully_saved,
        recorder_save_error: Resources.Save_failed,
        recorder_reboot_init: Resources.mpcarec_reboot_init,
        recorder_reboot_error: Resources.mpcarec_reboot_error,
        recorder_reboot_cnf: Resources.mpcarec_reboot_cnf,
        recorder_vdfrmt_chng_cnf: Resources.mpcarec_vdfrmt_chng_cnf,
        recorder_rst_def_pwd_cnf: Resources.Reset_password_confirm,
        recorder_updt_pwd_cnf: Resources.Update_password_confirm,
        recorder_pwdrst_success: Resources.Reset_password,
        recorder_pwdrst_error: Resources.OpearationFailed,
        recorder_updtpwd_success: Resources.Update_password,
        recorder_updtpwd_error: Resources.OpearationFailed,
        recorder_devoffline_cnfgdwnOnOnl: Resources.Panel_status_offline,
        recorder_default_error: Resources.mpcarec_def_err,
        recorder_devoffline_possible_errors: Resources.MpcaPossibleErrors
}
    return {
        constants: constants,
        labels: labels,
        events: events,
        messages: messages
    };
})(jQuery);