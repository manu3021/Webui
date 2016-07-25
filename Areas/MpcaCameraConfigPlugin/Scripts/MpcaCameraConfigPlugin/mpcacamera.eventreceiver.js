/// <reference path="mpcacamera.common.js" />
/// <reference path="mpcacamera.datacontext.js" />

window.mpcacamerasetting.eventreceiver = (function (ko, common, uicontext) {
    $.subscribe(common.events.treeviewitemselectedevent, ontreeviewitemselected);
    $.subscribe(common.events.ontabchangeevent, ontabchangeevent);

    function ontreeviewitemselected(event, data) {
        uicontext.oncameraselectionchanged(data);
    }
    function ontabchangeevent() {
        uicontext.OncamerachangecloseLiveview();
    }
    return {};
})(ko, window.mpcacamerasetting.common, window.mpcacamerasetting.uicontext);