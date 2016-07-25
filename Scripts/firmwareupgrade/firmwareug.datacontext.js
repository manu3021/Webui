/// <reference path="firmwareug.common.js" />
window.firmwareug.datacontext = (function ($, ko, common, global) {
    var currentAccountSelected = null;
    function getdevicemodelSource() {
        return ajaxRequest("POST", common.getactionpath("getdevicemodels"));
    }
    function getversionsource(deviceModelId) {
        return ajaxRequest("POST", common.getactionpath("getsupportedfws"), { 'devModelId': deviceModelId });
    }
    function getdeviceSourceforSite() {
        return ajaxRequest("POST", common.getactionpath("getsupporteddevicesforsite"), { 'siteId': currentAccountSelected.Id });
    }
    function notifyaccountSelected(selectedaccount) {
        currentAccountSelected = selectedaccount;
    }
    function upgradeFirmware(fugDetails) {
        return ajaxRequest("POST", common.getactionpath("upgradefirmware"), { toJson: function () { return ko.toJSON(fugDetails) } });
    }

    function getfwupgradeStaus(devIds) {
        return ajaxRequest("POST", common.getactionpath("getdownloadstatusofdevices"), { deviceIds: devIds });
    }
    return {
        getfwupgradeStaus:getfwupgradeStaus,
        upgradeFirmware: upgradeFirmware,
        notifyaccountSelected: notifyaccountSelected,
        currentAccountSelected: currentAccountSelected,
        getdevicemodelSource: getdevicemodelSource,
        getversionsource: getversionsource,
        getdeviceSourceforSite: getdeviceSourceforSite
    };
})($, ko, window.firmwareug.common, window);