/// <reference path="mpc.treeview.js" />
/// <reference path="mpc.widget.core.js" />
var treeviewPlugin = (function ($) {
    var treeviewLoader = {
        getInstance: function () {
            if (!instance) {
                // logger.useDefaults();
                instance = createInstance();
            }
            return instance;
        }
    };

    var instance;
    var treeviewpluginobject = null;
    var logger = window.Logger;
    var treePluginConfig = function () {
        this.treeviewName = "";
    }
    treePluginConfig.prototype.initialize = function ($uiElement) {
        var $uiTreeviewEle = $uiElement;
        var serviceModel = new ServiceModel();
        serviceModel.serviceurl($("#acttreeview").attr("data-url"));
        serviceModel.recorderstatusurl($("#getRecorderStatusurl").attr("data-url"));
        serviceModel.camerastatusurl($("#getAllCamerawithStatusurl").attr("data-url"));
        serviceModel.panelstatusurl($("#getpanelstatusurl").attr("data-url"));
        serviceModel.schema.idfield = "Id";
        serviceModel.schema.statusqueryidfield = "StatusQueryId";
        serviceModel.schema.dataTextFeild = "Name";
        serviceModel.schema.dataSpriteIcon = "EntityType";
        serviceModel.schema.uniqueId = "Id";
        serviceModel.schema.children = "Children";
        serviceModel.schema.haschildren = "HasChild";
        serviceModel.events.itemselected = "treeviewitemselected";
        serviceModel.events.itemsloaded = "onaccountsloaded";
        serviceModel.events.itemupdated = "onaccountupdated";
      
        var noneditabletypes = [EntityType.CREDENTIALHOLDERS, EntityType.SCHEDULES];
        var refreshstatustypes = [EntityType.RECORDER, EntityType.PANEL];
        if ($uiTreeviewEle != undefined) {
            treeviewpluginobject = $uiTreeviewEle.treeview({ "servicemodel": serviceModel, showspecialnodes: true, noneditabletypes: noneditabletypes, showrefreshstatustypes: refreshstatustypes, mode: DATASOURCEMODES.LAZYLOADING, selectrootnode: true });
        }
        $.subscribe("confignewaccountadded", function (event, newnodedata) {
            treeviewpluginobject.AddTreeNode(newnodedata);
        });
        $.subscribe("UpdateSelectedTreeNode", function (event, updateNodedata) {
            treeviewpluginobject.UpdateTreeNode(updateNodedata);
        });
        $.subscribe("editableconfigtree", function (event, newvalue) {
            treeviewpluginobject.EnableCheckbox(newvalue);
        });
        $.subscribe("SEARCHITEMCLICK", function (event, data) {
            console.dir(data);
            treeviewpluginobject.SearchItems(ko.toJS(data));
        });
        $.subscribe("SEARCHSUBITEMCLICK", function (event, data) {
            console.dir(data);
            treeviewpluginobject.SearchItems(ko.toJS(data));
        });

    }
    function createInstance() {
        try {
            //logger.info("Creating treeview config instance");
            var tvConfig = new treePluginConfig();
            return tvConfig;
        } catch (e) {
            //logger.log(e.message);
        }
    }
    document.treeviewPlugin = treeviewLoader;
    return treeviewLoader;
})($);
$(document).ready(function () {
    document.treeviewPlugin.getInstance().initialize($("#acttreeview"));
});