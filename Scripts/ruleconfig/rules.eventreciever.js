/// <reference path="rules.common.js" />
/// <reference path="rules.uicontext.js" />
window.ruleconfiguration.eventreciever = (function ($, ko, uicontext) {
    $.subscribe("rulesaccountonchecked", onaccountchecked)
    function onaccountchecked(data) {
        uicontext.onaccountchecked(data);
    }
})($, ko, window.ruleconfiguration.uicontext);