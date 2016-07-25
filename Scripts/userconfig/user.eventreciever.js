/// <reference path="user.uicontext.js" />
/// <reference path="user.common.js" />
window.userconfig.eventreciever = (function ($, common, uicontext) {
    try {
        $.subscribe(common.events.treeItemSelectedEvent, onaccountselected);
        $.subscribe(common.events.deleteAccountSuccess, onaccountdeleted);
    } catch (e) {
        console.error("user plugin: on Subscribing events Error::" + e.message);
    }
    function onaccountselected(event, accountData) {
        try {
            uicontext.onaccountSelected(accountData);
        } catch (e) {
            console.error("user plugin: Error on onaccountselected.  Error:" + e.message, e);
        }
    }
    function onaccountdeleted(event, accountData) {
        try {
            uicontext.onaccountSelected(null);
        } catch (e) {
            console.error("user plugin: Error on onaccountdeleted.  Error:" + e.message, e);
        }
    }
})(jQuery, window.userconfig.common, window.userconfig.uicontext);