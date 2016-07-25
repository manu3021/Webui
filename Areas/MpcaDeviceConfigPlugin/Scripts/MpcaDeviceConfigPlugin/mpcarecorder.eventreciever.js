/// <reference path="mpcarecorder.uicontext.js" />
/// <reference path="mpcarecorder.common.js" />
window.mpcarecorderconfig.eventreciever = (function ($, common, uicontext) {
    $.subscribe(common.events.treeviewnodeselectedevent, ontreeviewitemselected)
    function ontreeviewitemselected(event, data) {
        uicontext.onmpcadeviceselectionchanged(data);
    }
})(jQuery, window.mpcarecorderconfig.common, window.mpcarecorderconfig.uicontext);