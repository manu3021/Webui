/// <reference path="firmwareug.common.js" />
/// <reference path="firmwareug.datacontext.js" />
window.firmwareug.uicontext = (function ($, ko, common, datacontext) {
    var fugViewmodel = null;
    function getandbindfwPage() {
        try {
            if (fugViewmodel == null || fugViewmodel == undefined) {
                fugViewmodel = new datacontext.fUgPageModel();
                fugViewmodel.initialize();
                ko.applyBindings(fugViewmodel, document.getElementById("fugviewcontent"));
            }
            else {
                fugViewmodel.initialize();
                ko.applyBindings(fugViewmodel, document.getElementById("fugviewcontent"));
            }
        } catch (e) {
            console.error("error on binding fug viewmodel");
        }
    }
    function getandbindfwVersion() {
    }
    function showloading(canShow) {
        if (canShow) {
            $("#fugviewcontent").showLoading();
        }
        else {
            $("#fugviewcontent").hideLoading();
        }
    }
    var uicontextinitialize = function () {
        getandbindfwPage();
    }
    return {
        showloading:showloading,
        fugViewmodel: fugViewmodel,
        initialize: uicontextinitialize,
        getandbindfwPage: getandbindfwPage,
        getandbindfwVersion: getandbindfwVersion
    };
})($, ko, window.firmwareug.common, window.firmwareug.datacontext);