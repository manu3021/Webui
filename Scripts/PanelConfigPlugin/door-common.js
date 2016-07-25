window.doorconfig = window.doorconfig || {};

window.doorconfig.common = (function ($) {
    var constants = {
        entitytype: "door",
        devicetype: "ns123panel",
        droppableentitytype: "camera",
        online: "online"
    }
    var labels = {
        editbuttontext: Resources.Edit,
        savebuttontext: Resources.SaveSettings
    };
    var events = {
        treeviewnodeselectedevent: "treeviewitemselected",
        filterontreenodedropped: "filterontreenodedropped",
        removefilterfortreenode: "removefilterfortreenode",
        updateselectedtreenode: "UpdateSelectedTreeNode"
    };
    var messages = {
        door_save_success: Resources.Successfully_saved,
        door_save_error: Resources.Save_failed,
        panel_status_offline: Resources.Panel_status_offline,
        door_name_already_exists: Resources.Door_Name_Already_exists,
        devoffline_cnfgdwnOnOnl: Resources.Panel_status_offline,
        InOut_DevicePoints_Cannotbe_Same: Resources.InOut_DevicePoints_Cannotbe_Same,
        In: Resources.In,
        Out: Resources.Out,
        Soft: Resources.Soft,
        Hard: Resources.Hard,
        NotUsed: Resources.NotUsed
    };
    return {
        constants: constants,
        labels: labels,
        events: events,
        messages: messages
    };

})(jQuery);