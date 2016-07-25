/// <reference path="mpc.combobox.js" />
var comboboxPluginLoader = (function () {
    var cmbInstance;
    var logger = window.Logger;
    var cmbPlugin = null;
    var comboboxPluginHelper = function () {
    }
    comboboxPluginHelper.prototype.initialize = function ($uiElement) {
        var $uiCmbEle = $uiElement;
        var servicemodel = new cmbServiceModel();
        servicemodel.serviceUrl($('#cmbOptionPanel').attr('data-url'));
        servicemodel.schema.dataTextFeild = "Name";
        servicemodel.schema.dataSpriteIcon = "Type";
        servicemodel.schema.idfield = "Id";
        if ($uiCmbEle != undefined)
            cmbPlugin = $("#cmbcreateoptions").comboboxext({ "servicemodel": servicemodel, "defaulttext": "Create What?", "defaultfilter": "PARTITION_GROUP" });

        $.subscribe("treeviewitemselected", function (evnt, data) {
            cmbPlugin.update(data.nodedata);
        }, this);

        $.subscribe("tabselectedevent", function (evnt, data) {
            cmbPlugin.reset();
        }, this);

        $.subscribe("configcancel", function (evnt, data) {
            cmbPlugin.reset();
        }, this);
    }
    var createinstance = function () {
        try {
            logger.info("Creating combobox instance");
            var cmbConfig = new comboboxPluginHelper();
            return cmbConfig;
        } catch (e) {
            logger.log(e.message);
        }
    }
    return {
        getInstance: function () {
            if (!cmbInstance) {
                logger.useDefaults();
                cmbInstance = createinstance();
            }
            return cmbInstance;
        }
    }
})();

$(document).ready(function () {
    comboboxPluginLoader.getInstance().initialize($("#cmbcreateoptions"));
})