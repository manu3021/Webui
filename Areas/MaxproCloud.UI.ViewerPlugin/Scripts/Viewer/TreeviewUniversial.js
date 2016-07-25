/// <reference path="~/Scripts/mpc.treeview.js" />
/// <reference path="~/Scripts/mpc.widget.core.js" />
/// <reference path="viewer.common.js" />

var universaltreeviewPlugin = (function ($) {
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
        serviceModel.serviceurl($("#getTreeviewItemurl").attr("data-url"));
        serviceModel.camerastatusurl($("#getAllCamerawithStatusurl").attr("data-url"));

        serviceModel.schema.idfield = "Id";
        serviceModel.schema.statusqueryidfield = "StatusQueryId";
        serviceModel.schema.dataTextFeild = "Name";
        serviceModel.schema.dataSpriteIcon = "EntityType";
        serviceModel.schema.uniqueId = "Id";
        serviceModel.schema.children = "Children";
        serviceModel.schema.haschildren = "HasChild";
        serviceModel.events.ontreecheckboxchanged = "viewertreecheckboxchanged";
        //serviceModel.events.itemselected = "treeviewitemselected";
        //serviceModel.events.itemsloaded = "onaccountsloaded";
        //serviceModel.events.itemupdated = "onaccountupdated";
        //var noneditabletypes = [EntityType.CREDENTIALHOLDERS, EntityType.SCHEDULES];
        var refreshstatustypes = [EntityType.SITE] || [EntityType.SALVO];
        if ($uiTreeviewEle != undefined) {
            treeviewpluginobject = $uiTreeviewEle.treeview({ "servicemodel": serviceModel, showspecialnodes: false, showrefreshstatustypes: refreshstatustypes, mode: DATASOURCEMODES.LAZYLOADING });
        }

        //$.subscribe("confignewaccountadded", function (event, newnodedata) {
        //    if (newnodedata && "EntityType" in newnodedata) {
        //        var hasentity = _.contains(window.viewerconfig.common.constants.treeentities, newnodedata.EntityType.toUpperCase());
        //        if (hasentity) {
        //            treeviewpluginobject.AddTreeNode(newnodedata);
        //        }
        //    }            
        //});

        $.subscribe("UpdateSelectedTreeNode", function (event, updateNodedata) {
            treeviewpluginobject.UpdateTreeNode(updateNodedata);
        });

        $.subscribe(window.viewerconfig.common.events.universalclipsearch, function (event, newvalue) {
            treeviewpluginobject.EnableCheckbox(newvalue);
        });
    }
    treePluginConfig.prototype.EnableCheckbox = function (newvalue) {
        treeviewpluginobject.EnableCheckbox(newvalue);
    }
    treePluginConfig.prototype.GetCheckedItems = function () {
        if (treeviewpluginobject != null)
            return treeviewpluginobject.GetCheckedItems();
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
    universaltreeviewPlugin.getInstance().initialize($("#uTreeview"));
});
