/// <reference path="mpcainput.uicontext.js" />
/// <reference path="mpcainput.common.js" />
/// <reference path="mpcainput.datacontext.js" />

window.mpcainput.eventreciever = (function ($, common, uicontext) {
    $.subscribe(common.events.treeviewnodeselectedevent, ontreeviewitemselected)
    function ontreeviewitemselected(event, data) {
        window.mpcainput.uicontext = window.mpcainput.uicontext || {};
        window.mpcainput.uicontext.onmpcainputselectionchanged(data);
    }
})(jQuery, window.mpcainput.common, window.mpcainput.uicontext);