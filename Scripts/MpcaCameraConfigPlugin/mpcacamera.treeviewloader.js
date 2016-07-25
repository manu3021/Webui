/// <reference path="mpc.widget.core.js" />
/// <reference path="mpc.treeview.js" />
var mpcacameratreeviewPlugin = (function () {
    var instance;
    var treeviewpluginobject = null;
    var treePluginConfig = function () {
        this.treeviewName = "";
    }
    treePluginConfig.prototype.initialize = function ($uiElement, filternodes) {
        var $uiTreeviewEle = $uiElement;
        var serviceModel = new ServiceModel();
        serviceModel.serviceurl(getcameratreeviewurl());
        //serviceModel.camerastatusurl($("#getAllCamerawithStatusurl").attr("data-url"));
        serviceModel.filters = filternodes;
        serviceModel.schema.filterfield = "Id";
        serviceModel.schema.idfield = "Id";
        serviceModel.schema.statusqueryidfield = "StatusQueryId";
        serviceModel.schema.dataTextFeild = "Name";
        serviceModel.schema.dataSpriteIcon = "EntityType";
        serviceModel.schema.uniqueId = "Id";
        serviceModel.schema.children = "Children";
        serviceModel.schema.haschildren = "HasChild";
        //serviceModel.events.ontreecheckboxchanged = "viewertreecheckboxchanged";
        serviceModel.events.itemselected = "doorcamassoctreeviewitemselected";
        serviceModel.events.itemsloaded = "ondoorcamassocaccountsloaded";
        serviceModel.events.itemupdated = "ondoorcamassocaccountupdated";
        //var noneditabletypes = [EntityType.CREDENTIALHOLDERS, EntityType.SCHEDULES];
        //var refreshstatustypes = [EntityType.SITE];
        if ($uiTreeviewEle != undefined) {
            treeviewpluginobject = $uiTreeviewEle.treeview({ "servicemodel": serviceModel, showspecialnodes: false, mode: DATASOURCEMODES.LAZYLOADING });
        }

        $.subscribe("UpdateSelectedTreeNode", function (event, updateNodedata) {
            treeviewpluginobject.UpdateTreeNode(updateNodedata);
        });
        $.subscribe("filterontreenodedropped", function (event, node) {
            treeviewpluginobject.FilterTreeNode(node);
        });
        $.subscribe("removefilterfortreenode", function (event, node) {
            treeviewpluginobject.RemoveFilterForTreeNode(node);
        });
    }
    function getcameratreeviewurl() {
        return $("#mpcacameraconfigurl").attr("data-url") + "/GetAccounts";
    }
    function createInstance() {
        try {
            var tvConfig = new treePluginConfig();
            return tvConfig;
        } catch (e) {
        }
    }
    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();