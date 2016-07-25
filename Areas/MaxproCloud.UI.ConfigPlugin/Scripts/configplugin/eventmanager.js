/// <reference path="common.js" />
/// <reference path="datacontext.js" />
/// <reference path="uicontext.js" />
window.configuration.eventreceiver = (function (ko, uicontext, common) {
    try {
        $.subscribe(common.events.treeItemSelectedEvent, treeviewitemselected);
        $.subscribe(common.events.configMenuclicked, onconfigmenuselected);
    } catch (e) {
        console.error(e.message, e);
    }
    function onconfigmenuselected(event, data) {
        uicontext.configoptionsselected(data);
    }
    function treeviewitemselected(event, data) {
        if (data.nodedata.EntityType &&
           (data.nodedata.EntityType.toUpperCase() == common.constants.accounttypes.CUSTOMER.toUpperCase() ||
           data.nodedata.EntityType.toUpperCase() == common.constants.accounttypes.GROUP.toUpperCase() ||
             data.nodedata.EntityType.toUpperCase() == common.constants.accounttypes.DEALER.toUpperCase() ||
           data.nodedata.EntityType.toUpperCase() == common.constants.accounttypes.GENERAL.toUpperCase() ||
           data.nodedata.EntityType.toUpperCase() == common.constants.accounttypes.SITE.toUpperCase())) {
            uicontext.accountselectionchanged(data);
            uicontext.setOtherAccountForDelete(false);
            uicontext.activateTabforAccount(data.nodedata.EntityType);
        }
        else if (data.nodedata.EntityType.toUpperCase() == common.constants.accounttypes.CREDENTIALHOLDER.toUpperCase() ||
           data.nodedata.EntityType.toUpperCase() == common.constants.accounttypes.SCHEDULE.toUpperCase()) {
            uicontext.setOtherAccountForDelete(true);
            uicontext.activateTabforAccount(common.constants.accounttypes.LOGICALTYPE);
        }
        else if (data.nodedata.EntityType.toUpperCase() == common.constants.accounttypes.RECORDER.toUpperCase() ||
           data.nodedata.EntityType.toUpperCase() == common.constants.accounttypes.PANEL.toUpperCase()) {
            uicontext.accountselectionchanged(data);
            uicontext.setOtherAccountForDelete(false);
            uicontext.activateTabforAccount(data.nodedata.EntityType);
        }
        else {
            uicontext.setOtherAccountForDelete(true);
            uicontext.activateTabforAccount(common.constants.accounttypes.DEVICE);


        }


    }


})(ko, window.configuration.uicontext, window.configuration.common);