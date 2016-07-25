
/// <reference path="viewer.uicontext.js" />
/// <reference path="viewer.common.js" />
window.viewerconfig.eventreciever = (function ($, ko, common, uicontext) {
    try {
        $.subscribe(common.events.treeviewitemselectedevent, treeviewitemselected);
    } catch (e) {
        console.error(e.message, e);
    }


    function treeviewitemselected(event, data) {
        if (data.nodedata.EntityType && data.nodedata.EntityType.toUpperCase() == common.Enumeration.EntityType.SALVO.toUpperCase()) {
            uicontext.Treeitemselectionchanged(data);
        }
    }

})(jQuery, ko, window.viewerconfig.common, window.viewerconfig.uicontext);