function libhash() {
    var keys = [];
    var values = [];
    this.keys = function () {
        return keys;
    };
    this.values = function () {
        return values;
    };
    this.save = function (key, value) {
        var existingIndex = ko.utils.arrayIndexOf(keys, key);
        if (existingIndex >= 0) values[existingIndex] = value;
        else {
            keys.push(key);
            values.push(value);
        }
    };
    this.get = function (key) {
        var existingIndex = ko.utils.arrayIndexOf(keys, key);
        return (existingIndex >= 0) ? values[existingIndex] : undefined;
    };
    this.contains = function (key) {
        var existingIndex = ko.utils.arrayIndexOf(keys, key);
        return (existingIndex >= 0);
    }
    this.containskey = function (key) {
        return _.contains(keys, key);//ko.utils.arrayIndexOf(keys, key);
        //  return (existingIndex >= 0);
    }
    this.remove = function (key) {
        var existingIndex = ko.utils.arrayIndexOf(keys, key);
        if ((existingIndex >= 0)) {
            keys.splice(existingIndex, 1);
            values.splice(existingIndex, 1);
        }
    }
}
var guid = (function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
                   .toString(16)
                   .substring(1);
    }
    return function () {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
               s4() + '-' + s4() + s4() + s4();
    };
})();

var schemaObject = function () {
    this.dataTextFeild = "";
    this.dataSpriteIcon = "";
    this.idfield = "";
    this.haschildren = "";
    this.uniqueId = "";
    this.indexfield = "";
    this.children = "";
    this.filterfield = "";
    this.statusqueryidfield = "";
}
var eventobject = function () {
    this.itemselectedevent = null;
}
var node = function () {
    this.icon = "";
    this.name = "";
}
var ServiceModel = function () {
    //datasource used for direct data binding with treeview. For onetime loading and NOT for lazyloading
    this.datasource = ko.observableArray([]);
    this.serviceurl = ko.observable("");
    this.recorderstatusurl = ko.observable("");
    this.camerastatusurl = ko.observable("");
    this.panelstatusurl = ko.observable("");
    this.deletenodeurl = ko.observable("");
    this.schema = ko.observable(new schemaObject());
    this.options = null;
    this.events = {
        ontreecheckboxchanged: "",
        itemselected: "",
        itemsloaded: "",
        itemupdated: "",
        onitemselfdeleted: ""
    };
    this.filters = [];
};
var cmbSchemaObject = function () {
    this.dataTextFeild = "";
    this.dataSpriteIcon = "";
    this.idfield = "";
}
var cmbServiceModel = function () {
    this.datasource = ko.observableArray([]);
    this.serviceUrl = ko.observable("");
    this.schema = ko.observable(new cmbSchemaObject());
};
function treeviewUtils(treeViewId) {
    var that = this;
    var treeviewId = treeViewId;
    this.bindingcontext = null;
    this.getbindingcontext = function () {
        return ko.contextFor($(treeviewId)[0]);
    }
    function init() {
        that.bindingcontext = that.getbindingcontext();
    }
    init();
};
// case sensitive enum please use only lower case letters
var EntityType = { CAMERA: "camera", RECORDER: "recorder", GENERAL: "general", CUSTOMER: "customer", PANEL: "panel", DOOR: "door", READER: "reader",SALVO:"salvo", INPUT: "input", OUTPUT: "output", PANEL_INPUT_NODE: "panel_input_node", PANEL_OUTPUT_NODE: "panel_output_node", INPUT_NODE: "input_node", OUTPUT_NODE: "output_node", SCHEDULES: "schedules", CREDENTIALHOLDERS: "credentialholders", SITE: "site",DEALER:"dealer",SALVO:"salvo" };
var DATASOURCEMODES = { LAZYLOADING: "100", FULLDATASOURCE: "101" };
var TREE_CHECK_STATES = {
    CHECKED: 1,
    UNCHECKED: 0,
    INTERMEDIATE: -1
};