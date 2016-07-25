window.mpcastorageconfig = window.mpcastorageconfig || {};
window.mpcastorageconfig.common = (function ($) {
    var constants = {
        entitytype: "devicestorage",
        parententitytype: "recorder",
        parentdevicetype: "hrrh8",
        storagetype: { INTERNAL: 0, EXTERNAL: 1, NETWORK: 2, USB: 3 },
        storagemode: { None: -1, RecordingMode: 0, ExportMode: 1 },
        storagestate: { NotConnected: 0, Ready: 1, Formatting: 2, NotMounted: 3, DeviceInactive: 100 },
        recorderstatus: { NOTREGISTERED: "NotRegistered", ONLINE: "Online", OFFLINE: "Offline", DEACTIVE: "Deactive" }
    }
    var labels = {
        editbuttontext: Resources.Edit,
        savebuttontext: Resources.SaveSettings
    };
    var events = {
        treeviewnodeselectedevent: "treeviewitemselected",
    };
    var messages = {
        storage_save_success: Resources.Successfully_saved,
        storage_save_error: Resources.Save_failed,
        ers_int_strg_rbt_dev: Resources.mpcastrg_ers_int_strg_rbt_dev,
        int_strg_ers_success: Resources.mpcastrg_int_strg_ers_success,
        int_strg_ers_error: Resources.mpcastrg_int_strg_ers_error,
        ers_nw_strg_rbt_dev: Resources.mpcastrg_ers_nw_strg_rbt_dev,
        nw_strg_ers_success: Resources.mpcastrg_nw_strg_ers_success,
        nw_strg_ers_error: Resources.mpcastrg_nw_strg_ers_error,
        ers_usb_strg_rbt_dev: Resources.mpcastrg_ers_usb_strg_rbt_dev,
        usb_strg_ers_success: Resources.mpcastrg_usb_strg_ers_success,
        usb_strg_ers_error: Resources.mpcastrg_usb_strg_ers_error,
        usb_strg_ejct_cnfm: Resources.mpcastrg_usb_strg_ejct_cnfm,
        usb_strg_ejct_success: Resources.mpcastrg_usb_strg_ejct_success,
        usb_strg_ejct_error: Resources.mpcastrg_usb_strg_ejct_error,
        usb_strg_md_ntslc: Resources.mpcastrg_usb_strg_md_ntslc,
        nw_strg_save_rbt_dev: Resources.mpcastrg_nw_strg_save_rbt_dev,
        usb_strg_expmd: Resources.mpcastrg_usb_strg_expmd,
        ex_strg_nt_cnt: Resources.mpcastrg_ex_strg_nt_cnt,
        ex_strg_frmt: Resources.mpcastrg_ex_strg_frmt,
        ex_strg_nt_mnt: Resources.mpcastrg_ex_strg_nt_mnt,
        dev_offline: Resources.mpcastrg_dev_offline,
        devoffline_cnfgdwnOnOnl: Resources.Panel_status_offline
    };

    return {
        constants: constants,
        labels: labels,
        events: events,
        messages: messages
    };
})(jQuery);