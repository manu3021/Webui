/// <reference path="mpcastorage.uicontext.js" />
/// <reference path="mpcastorage.common.js" />
window.mpcastorageconfig.eventreciever = (function ($, common, uicontext) {
    $.subscribe(common.events.treeviewnodeselectedevent, ontreeviewitemselected)
    function ontreeviewitemselected(event, data) {
        uicontext.onmpcastorageselectionchanged(data);
    }
})(jQuery, window.mpcastorageconfig.common, window.mpcastorageconfig.uicontext);