
//var comboboxPluginLoader = (function () {

function getComboboxTemplate() {
    var strVar = "";
    strVar += "  <ul id=\"comboboxul\" class=\"m-comboboxul\">";
    strVar += "            <li>";
    strVar += "                <div class=\"m-comboboxdisplay\">";
    strVar += "                    <div class=\"m-inner\">";
    strVar += "                        <div class=\"m-displaytextspan\" id=\"displaytext\" data-bind=\"text: name\"><\/div>";
    strVar += "                        <div class=\"m-displayiconspan\"><\/div>";
    strVar += "                    <\/div>";
    strVar += "                <\/div>";
    strVar += "                <ul id=\"dropdown\" data-bind=\"template: { name: 'combolisttemplate', foreach: $data.datasource }\">";
    strVar += "                <\/ul>";
    strVar += "            <\/li>";
    strVar += "        <\/ul>";
    strVar += "        <script id=\"combolisttemplate\" type=\"text\/html\">";
    strVar += "            <li>";
    strVar += "                <div class=\"m-comboboxlistitem\">";
    strVar += "                    <div class=\"m-inneritem\">";
    strVar += "                        <div class=\"m-listitemtextspan\" id=\"itemtext\" data-bind=\"text: name\"><\/div>";
    strVar += "                        <div id=\"itemicon\" data-bind=\"attr: { 'class': icon }\"><\/div>";
    strVar += "                    <\/div>";
    strVar += "                <\/div>";
    strVar += "            <\/li>";
    strVar += "        <\/script>";

    return strVar;
};

var combolistitemmodel = function (name, id, type) {
    var self = this;
    this.name = ko.observable(name);
    this.id = ko.observable(id);
    this.type = ko.observable(type);
    this.icon = ko.computed(function () {
        if (self.type() != "")
            return self.type() + "-itemicon";
        else
            return "no-icon";
    });
};

var comboboxviewmodel = function () {
    var eventlistners = new libhash();
    var self = this;
    self.datasource = ko.observableArray([]);
    self.name = ko.observable();
    self.defaultname = ko.observable();
    self.selectedtreenode = {};
    self.servicemodel = ko.observable(new cmbServiceModel());
    self.serviceurl = ko.computed(function () {
        return self.servicemodel().serviceUrl();
    });
    self.isexpanded = ko.observable(false);
    self.initializemodel = function (defaultfilter) {
        getdatasource(defaultfilter, self.servicemodel(), self.servicecallback);
    }
    this.addeventlistners = function (key, val) {
        eventlistners.save(key, val);
    }
    self.expand = function (nodetoexpand) {
        if (self.selectedtreenode == undefined || self.selectedtreenode == null)
            return;
        var cmbparent = $(nodetoexpand).parent("li");
        var dropDownelement = $(cmbparent).find("#dropdown");
        if (!self.isexpanded()) {
            dropDownelement.slideDown("fast");
            self.isexpanded(true);
        }
        else {
            self.collapse(nodetoexpand);
        }
    }
    self.collapse = function (nodetocollapse) {
        var cmbparent = $(nodetocollapse).parent("li");
        var dropDownelement = $(cmbparent).find("#dropdown");
        if (self.isexpanded()) {
            dropDownelement.slideUp("fast");
            self.isexpanded(false);
        }
    }
    self.applylistitem = function (newnode) {
        var context = ko.contextFor(newnode);
        var newname = context.$data.name();
        self.name(newname);
        ko.applyBindings(self, document.getElementById("displaytext"));

        var expndr = $("#comboboxul").find(".m-comboboxdisplay");
        self.collapse(expndr);

        //var itemSelectedCallback = eventlistners.get("ItemSelected");
        //itemSelectedCallback(context.$data.type());

        var type = context.$data.type();
        var data = GetAnonymousModel(this.selectedtreenode, type);
        $.publish("createcomboboxselected", data);
    }
    function GetAnonymousModel(nodedata, childtype) {
        return { newchildtype: childtype, nodedata: nodedata };
    }
    self.reset = function (node) {
        self.name(self.defaultname());
        if (self.isexpanded()) {
            self.collapse(node);
        }
    }
    self.servicecallback = function (jsondata) {

        self.servicemodel = ko.observable(self.servicemodel());
        self.datasource = ko.observableArray(jsondata);
        self.name = ko.observable(self.defaultname());
        ko.applyBindings(self, document.getElementById("comboboxul"));
    }
    self.updatecombolist = function (filter) {
        getdatasource(filter, self.servicemodel(), self.servicecallback);
    }
};

function getdatasource(filter, servicemodel, servicecallback) {
    try {
        var datasourcearray = [];
        var serviceurl = servicemodel.serviceUrl();
        var finalurl = serviceurl + "?selectedType=" + filter;
        $.get(finalurl, "", function (jsondata,status, settings) {
            if ((settings.responseText.indexOf('loginform') > 0))
                window.location.href = window.location.href;
            var nodes = jsondata;
            if (nodes != null || nodes != undefined) {
                for (var i = 0; i < nodes.length; i++) {
                    var cmbitemmodel = new combolistitemmodel();
                    var nodeObject = nodes[i];
                    if (servicemodel.schema.dataTextFeild in nodeObject)
                        cmbitemmodel.name(nodeObject[servicemodel.schema.dataTextFeild]);
                    if (servicemodel.schema.dataSpriteIcon in nodeObject)
                        cmbitemmodel.type(nodeObject[servicemodel.schema.dataSpriteIcon]);
                    if (servicemodel.schema.idfield in nodeObject)
                        cmbitemmodel.id(nodeObject[servicemodel.schema.idfield]);

                    datasourcearray.push(cmbitemmodel);
                }
            }
            servicecallback(datasourcearray);
        });

        return datasourcearray;
    }
    catch (e) {
        console.error(e.message);
    }
}

function wireupeventsforCombo() {
    $("#comboboxul").delegate(".m-comboboxdisplay", "click", function () {
        var context = ko.contextFor(this);
        context.$root.expand(this);
    });
    $("#comboboxul").delegate(".m-comboboxlistitem", "click", function () {
        var context = ko.contextFor(this);
        context.$root.applylistitem(this);
    });
    $(document).mouseup(function (e) {
        var container = $("#comboboxul");
        if (!container.is(e.target) // if the target of the click isn't the container...
            && container.has(e.target).length === 0) // ... nor a descendant of the container
        {
            var child = container.find("#dropdown");
            var context = ko.contextFor(child[0]);
            var tocollapse = container.find(".m-comboboxdisplay");
            context.$root.collapse(tocollapse);
        }
    });
};

; (function () {

    var pluginName = 'comboboxext',
      defaults = {
          servicemodel: null,
          defaultfilter: "PARTITION_GROUP",
          defaulttext: "create what",
          ItemSelected: null
      };

    function CmbPlugin(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }
    CmbPlugin.prototype.init = function () {
        if (this.options == null) {
            console.log("Service model for treeview is null");
            return;
        }
        try {
            var uiElement = this.element;
            var mpcCmbWidget = getComboboxTemplate();
            $(uiElement).html(mpcCmbWidget);
            wireupeventsforCombo();
            var bindingelement = $(".m-comboboxul")[0];
            ko.applyBindings(new comboboxviewmodel(), bindingelement);


            var context = ko.contextFor(bindingelement);
            context.$root.servicemodel(this.options.servicemodel);
            context.$root.defaultname(this.options.defaulttext);
            context.$root.initializemodel(this.options.defaultfilter);
            if ("ItemSelected" in this.options) {
                if (this.options.ItemSelected != undefined)
                    context.$root.addeventlistners("ItemSelected", this.options.ItemSelected);
            }
            var dropDownelement = $(uiElement).find("#dropdown");
            dropDownelement.hide();
        }
        catch (e) {
            console.log(e.message);
        }
    };
    CmbPlugin.prototype.update = function (data) {
        var context = ko.contextFor($(".m-comboboxul")[0]);
        context.$root.selectedtreenode = data;
        var type = data.Type;
        var smodel = context.$root.servicemodel();
        var callbk = context.$root.servicecallback;
        getdatasource(type, smodel, callbk);
    }
    CmbPlugin.prototype.reset = function () {
        var tocollapse = $(".m-comboboxul").find(".m-comboboxdisplay");
        var context = ko.contextFor($(".m-comboboxul")[0]);
        context.$root.reset(tocollapse);
    }
    $.fn[pluginName] = function (options) {
        if (!$.data(this, 'plugin_' + pluginName)) {
            var cmbPlugin = new CmbPlugin(this, options);
            $.data(this, 'plugin_' + pluginName, cmbPlugin);
            return cmbPlugin;
        };
    }
}());