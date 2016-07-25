/// <reference path="gateway-common.js" />
/// <reference path="gateway-uicontext.js" />
window.gatewayconfig.eventreciever = (function ($, common, uicontext) {
    $.subscribe(common.events.treeviewnodeselectedevent, ontreeviewitemselected)
    function ontreeviewitemselected(event, data) {
        uicontext.onpanelselectionchanged(data);
    };
})(jQuery, window.gatewayconfig.common, window.gatewayconfig.uicontext);