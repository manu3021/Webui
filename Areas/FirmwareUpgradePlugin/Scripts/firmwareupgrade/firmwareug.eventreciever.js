/// <reference path="firmwareug.common.js" />
/// <reference path="firmwareug.uicontext.js" />
window.firmwareug.eventreciever = (function ($, ko, common, uicontext, datacontext, gconstants) {
    $.subscribe(common.events.treeItemSelectedEvent, treeviewitemselected);
    $.subscribe(gconstants.events.ontabshown, ontabSelectionChanged);

    function ontabSelectionChanged(event, data) {
        try {
            if (data && data == common.constants.tabId) {
                uicontext.initialize();
            }
        } catch (e) {
            console.error(e);
        }
    }
    function treeviewitemselected(event, data) {
        try {
            if (data.nodedata.EntityType && data.nodedata.EntityType.toUpperCase() == common.constants.accounttypes.SITE.toUpperCase()) {
                datacontext.notifyaccountSelected(data.nodedata);
            }
        } catch (e) {
            console.error("error on account selection change in fugplugin");
        }
    }
})($, ko, window.firmwareug.common, window.firmwareug.uicontext, window.firmwareug.datacontext, window.global.constants);