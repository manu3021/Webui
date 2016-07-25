/// <reference path="viewer.uicontext.js" />
/// <reference path="viewer.clipsearch.js" />


window.viewerconfig.Universial = (function ($, ko, common, uicontext, datacontext) {
    var Unilistmodel = function (data) {
        var self = this;
        data = data || {};
        self.id = data.id;
        self.title = data.title;
        if (data.ishide != "hideRecord")
            self.shouldShowlist = true;
        else
            self.shouldShowlist = false;
        self.ulistitemclick = function (data, event) {
            var context = ko.contextFor(event.currentTarget);
            var ulistmodel = context.$data;
            var headermodel = new datacontext.UniversialHeaderViewModel();
            window.viewerconfig.uicontext.selectUniversalOption(ulistmodel.id);
           
        }
    }

    //Ulistitem viewmodel
    var UlistHeadermodel = function (data) {
        var self = this;
        data = data || {};
        self.Ulistitemheadername = ko.observable("salvos");
    }

    var UniversialHeaderViewModel = function () {
        var self = this;
        self.onUlistitemSelected = function (ulistitem) {
            if (ulistitem == undefined || ulistitem == null)
                return
            var Headermodel = new UlistHeadermodel();
         }
    };


    //Ulistitem viewmodel
    var ViewerUniversialViewModel = function () {
        var self = this;
        self.shouldShowUlistitem = ko.observable(true);
        self.Ulistitem = $.map(window.viewerconfig.common.getUlistitem(), function (item) {
            return new Unilistmodel(item);
        });
    }

    window.viewerconfig.datacontext.ViewerUniversialViewModel = ViewerUniversialViewModel;
    window.viewerconfig.datacontext.UniversialHeaderViewModel = UniversialHeaderViewModel;


})(jQuery, ko, window.viewerconfig.common, window.viewerconfig.uicontext, window.viewerconfig.datacontext);