/// <reference path="mpcaoutput.uicontext.js" />
/// <reference path="mpcaoutput.common.js" />
/// <reference path="mpcaoutput.datacontext.js" />

window.mpcaoutput.eventreciever = (function ($, common, uicontext) {
    $.subscribe(common.events.treeviewnodeselectedevent, ontreeviewitemselected)
    function ontreeviewitemselected(event, data) {
        window.mpcaoutput.uicontext = window.mpcaoutput.uicontext || {};
        window.mpcaoutput.uicontext.onmpcaoutputselectionchanged(data);
    }
})(jQuery, window.mpcaoutput.common, window.mpcaoutput.uicontext);