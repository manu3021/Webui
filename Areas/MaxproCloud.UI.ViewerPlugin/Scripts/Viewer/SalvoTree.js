/// <reference path="~/Scripts/mpc.treeview.js" />
/// <reference path="~/Scripts/mpc.widget.core.js" />
/// <reference path="viewer.common.js" />

var salvotreeviewPlugin = (function ($, common) {
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
    var salvotreeviewpluginobject = null;
    var logger = window.Logger;
    var salvotreePluginConfig = function () {
        this.treeviewName = "";
        this.isinitialised = false;
    }
    salvotreePluginConfig.prototype.initialize = function ($uiElement) {
        if (this.isinitialised)
            return;
        var $uiTreeviewEle = $uiElement;
        var serviceModel = new ServiceModel();
        serviceModel.serviceurl($("#getsalvoTreeviewItemurl").attr("data-url"));
        serviceModel.deletenodeurl($("#getdeletesalvourl").attr("data-url"));
        serviceModel.schema.idfield = "Id";
        serviceModel.schema.restrictdragg = "true";
        serviceModel.schema.statusqueryidfield = "StatusQueryId";
        serviceModel.schema.dataTextFeild = "Name";
        serviceModel.schema.dataSpriteIcon = "EntityType";
        serviceModel.schema.uniqueId = "Id";
        serviceModel.schema.children = "Children";
        serviceModel.schema.haschildren = "HasChild";
        serviceModel.events.itemselected = common.events.treeviewitemselectedevent;
        serviceModel.events.onitemselfdeleted = "DeleteSalvo";
        serviceModel.events.itemsloaded = "onsalvoloaded";
        serviceModel.events.itemupdated = "onsalvoupdated";
        var refreshstatustypes = [EntityType.SITE];
        if ($uiTreeviewEle != undefined) {
            salvotreeviewpluginobject = $uiTreeviewEle.treeview({ "servicemodel": serviceModel, showspecialnodes: false, showrefreshstatustypes: refreshstatustypes, mode: DATASOURCEMODES.LAZYLOADING });
            this.isinitialised = true;
        }

        //$.subscribe(window.viewerconfig.common.events.Salvotreeitemadd, function (event, newnodedata) {
        //    salvotreeviewpluginobject.SalvoLoadDataSource(newnodedata);
        //});
    }
    salvotreePluginConfig.prototype.AddTreeNodes = function (newnodedata) {
        if (salvotreeviewpluginobject != null) {
            salvotreeviewpluginobject.SalvoLoadDataSource(newnodedata);
        }
    }
    salvotreePluginConfig.prototype.EnableCheckbox = function (newvalue) {
        if (salvotreeviewpluginobject != null) {
            salvotreeviewpluginobject.EnableCheckbox(newvalue);
        }
    }
    salvotreePluginConfig.prototype.GetCheckedItems = function () {
        if (salvotreeviewpluginobject != null) {
            return salvotreeviewpluginobject.GetCheckedItems();
        }
    }
    salvotreePluginConfig.prototype.SelectTreeNode = function (id) {
        if (salvotreeviewpluginobject != null) {
            return salvotreeviewpluginobject.SelectTreeNode(id);
        }
        return null;
    }
    salvotreePluginConfig.prototype.UnSelectTreeNode = function () {
        if (salvotreeviewpluginobject != null) {
            salvotreeviewpluginobject.UnSelectTreeNode();
        }
    }
    function createInstance() {
        try {
            //logger.info("Creating treeview config instance");
            var tvConfig = new salvotreePluginConfig();
            return tvConfig;
        } catch (e) {
            //logger.log(e.message);
        }
    }
    document.salvotreeviewPlugin = treeviewLoader;
    return treeviewLoader;
})($, window.viewerconfig.common);

//$(document).ready(function () {
//    salvotreeviewPlugin.getInstance().initialize($("#salvotree"));
//});
