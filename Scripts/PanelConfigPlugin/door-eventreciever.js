/// <reference path="door-common.js" />
/// <reference path="door-uicontext.js" />
window.doorconfig.eventreciever = (function ($, common, uicontext) {
    $.subscribe(common.events.treeviewnodeselectedevent, ontreeviewitemselected)
    function ontreeviewitemselected(event, data) {
        uicontext.ondoorselectionchanged(data);
    };

})(jQuery, window.doorconfig.common, window.doorconfig.uicontext);