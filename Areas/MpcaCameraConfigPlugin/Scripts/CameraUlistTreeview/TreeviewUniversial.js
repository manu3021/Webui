/// <reference path="viewer.eventreciever.js" />


function libhash() {
    var keys = [];
    var values = [];
    this.keys = function () {
        return keys;
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
    this.remove = function (key) {
        var existingIndex = ko.utils.arrayIndexOf(keys, key);
        if ((existingIndex >= 0)) {
            keys.splice(existingIndex, 1);
            values.splice(existingIndex, 1);
        }
    }
}
var schemaObject = function () {
    this.dataTextFeild = "";
    this.dataSpriteIcon = "";
    this.idfield = "";
    this.haschildren = "";
    this.uniqueId = "";
    this.indexfield = "";
    this.children = "";
}
var eventobject = function () {
    this.itemselectedevent = null;
}
var ServiceModel = function () {
    //datasource used for direct data binding with treeview. For onetime loading and NOT for lazyloading
    this.datasource = ko.observableArray([]);
    this.serviceurl = ko.observable("");
    this.schema = ko.observable(new schemaObject());
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
var utreeviewPlugin = (function ($, eventreciever) {
    var newNodeCountvar = 0;
    var events = {
        onaccountsloaded: "onaccountsloaded",
        onaccountselected: "treeviewitemselected",
        onaccountremoved: "onaccountremoved",
        onaccountupdate: "onaccountupdated"
    };
    function getLoadingtemplate() {
        return "<span style=\"color:black;\" id=\"loadingtext\">Loading...</span>";
    }
    function getErrorTemplate() {
        var errorTemplate = "";
        errorTemplate += "<div style=\"display: table;\">";
        errorTemplate += "    <span style=\"display: table-cell;color:balck;\">Error loading<\/span>";
        errorTemplate += "    <button title=\"Retry\" data-bind=\"click: OnReload\">Retry<\/button>";
        errorTemplate += "<\/div>";
        return errorTemplate;
    }
    function getTreeViewTemplate() {
        try {
            var mpcTreeviewWidget = "";
            mpcTreeviewWidget += "<ul class=\"tree layoutrow scroll-y scroll-x\"  id=\"mpc-treeview\" data-bind=\"onload: onload, template: { name: 'treeTmpl', foreach: $data.dataSource }\">";
            mpcTreeviewWidget += "        <\/ul>";
            mpcTreeviewWidget += "<script id=\"treeTmpl\" type=\"text\/html\">";
            mpcTreeviewWidget += "<li class=\"treenormal\">";
            mpcTreeviewWidget += "        <div class=\"expand\">";
            mpcTreeviewWidget += "            <i class=\"tree-open-icon\" data-bind=\"attr: { 'class': icon}\"></i>";
            mpcTreeviewWidget += "            <span class=\"tree-label\" data-bind=\" text: name\"></span>";
            mpcTreeviewWidget += "            <span id=\"loadingicon\"><\/span>";
            mpcTreeviewWidget += "        </div>";
            mpcTreeviewWidget += "        <div class=\"expandul\" data-bind=\"if: isexpanded\">";
            mpcTreeviewWidget += "            <ul class=\"tree\" data-bind=\"template: { name: 'treeTmpl', foreach: $data.children,drag: {value: $data.children} }\">";
            mpcTreeviewWidget += "        <\/ul>";
            mpcTreeviewWidget += "        </div>";
            mpcTreeviewWidget += "    </li>";
            mpcTreeviewWidget += "        <\/script>";
            mpcTreeviewWidget += "<span style=\"color:black;\" id=\"loadingtext\">Loading...</span>"

            return mpcTreeviewWidget;
        } catch (e) {
            console.log(e.message);
            return "Error loading templte";
        }
    }
    function getObjects(obj, key, val) {
        try {
            var objects = [];
            for (var i in obj) {
                if (!obj.hasOwnProperty(i)) continue;
                if (typeof obj[i] == 'object') {
                    objects = objects.concat(getObjects(obj[i], key, val));
                } else if (i == key && obj[key] == val) {
                    objects.push(obj);
                }
            }
            return objects;
        } catch (e) {
            console.log(e);
        }
    }
    function haschild(id) {
        var obj = getObjects(test, "parentid", id);
        if (obj != null)
            return true;
        return false;
    }
  
    function getTreenode(id, index, nodeType, isservice, servicemodel, servicecallback) {
        try {

            var serviceUrl = servicemodel.serviceurl();
            var treeArray = [];
            if (isservice) {
                if (serviceUrl == null || serviceUrl == undefined)
                    return treeArray;

                if (id == null) {
                    data = ({id:null});
                    //serviceUrl = serviceUrl + "?id=" + null;
                }
                else {
                    data = ({ id: id, nodeType: nodeType });
                   // serviceUrl = serviceUrl + "?id=" + id + "&nodeType=" + nodeType;
                }

                ajaxRequest("POST", serviceUrl,data).done(function (jsondata) {
                    var nodes = jsondata;
                    if (nodes != null || nodes != undefined) {
                        if (nodes.length > 0) {
                            for (var i = 0; i < nodes.length; i++) {
                                var nodeObject = nodes[i];
                                var treenode = new TreeNodeModel();
                                if (servicemodel.schema.dataTextFeild in nodeObject)
                                    treenode.name(nodeObject[servicemodel.schema.dataTextFeild]);
                                if (servicemodel.schema.dataSpriteIcon in nodeObject)
                                    treenode.type(nodeObject[servicemodel.schema.dataSpriteIcon]);
                                if (servicemodel.schema.idfield in nodeObject)
                                    treenode.id(nodeObject[servicemodel.schema.idfield]);
                                if (servicemodel.schema.children in nodeObject) {
                                    var childelem = nodeObject[servicemodel.schema.children];
                                    if (childelem.length > 0)
                                        treenode.importchildrens(servicemodel, childelem, index);
                                }
                                if (servicemodel.schema.uniqueId in nodeObject)
                                    treenode.modelid(nodeObject[servicemodel.schema.uniqueId]);
                                if (index != undefined)
                                    treenode.index(index + 1);
                                else
                                    treenode.index(1);
                                treenode.haschild(true);
                                treenode.nodeobject = nodeObject;
                                treeArray.push(treenode);
                            }
                        }
                    }
                    servicecallback(treeArray);
                }).error(function (e, jsondata) {
                    servicecallback({ "Error": "Error Loading accounts...." });
                });
            }
            else {
                /* for test purpose only
                //if (id == null || id == undefined) {
                //    var defaultElement = getObjects(testdata, "id", "1");
                //    var type = defaultElement[0].type;
                //    if (type == null)
                //        type = "";
                //    treeArray.push(new TreeNodeModel().Initialize(defaultElement[0].header, defaultElement[0].id, true, defaultElement[0].index, type));
                //}
                //else {
                //    var childrenItems = getObjects(testdata, "parentid", id);
                //    for (var i = 0; i < childrenItems.length; i++) {
                //        var type = childrenItems[i].type;
                //        if (type == null)
                //            type = "";
                //        treeArray.push(new TreeNodeModel().Initialize(childrenItems[i].header, childrenItems[i].id, haschild(childrenItems[i].id), childrenItems[i].index, type));
                //    }
                //} */
            }
            return treeArray;
        } catch (e) {
            console.log(e.message);
        }
    }
    var SelectedNode = function (uiElement, dataObject) {
        this.uielement = uiElement;
        this.dataobject = dataObject;
    }
    var TreeNodeModel = function () {
        var self = this;
        self.isdirty = ko.observable(false);
        self.modelid = ko.observable("");
        self.id = ko.observable("");
        self.name = ko.observable("");
        self.isexpanded = ko.observable();
        self.width = ko.observable();
        self.childwidth = ko.observable();
        self.children = ko.observableArray([]);
        self.haschild = ko.observable(false);
        self.parentId = ko.observable("");
        self.index = ko.observable("");
        self.type = ko.observable("");
        self.icon = ko.computed(function () {
            if (self.type() != "")
                return "tree-open-icon";//self.type() + "-icon";
            else
                return "no-icon";
        });
        self.nodeobject = null;
        self.update = function (updatedNodeObj) {
        }
        self.Initialize = function (name, id, modelid, haschild, index, type, parentid) {
            self.id(id);
            self.parentId(parentid);
            self.name(name);
            self.children([]);
            self.modelid(modelid);
            self.haschild(haschild);
            self.index(index);
            self.type(type || "");
        }
    };
    TreeNodeModel.prototype.importchildrens = function (servicemodel, childrenData, index) {
        var treechildrens = $.map(childrenData, function (item) {
            if (childrenData != null || childrenData != undefined) {
                if (childrenData.length > 0) {
                    for (var i = 0; i < childrenData.length; i++) {
                        var nodeObject = childrenData[i];
                        var treenode = new TreeNodeModel();
                        if (servicemodel.schema.dataTextFeild in nodeObject)
                            treenode.name(nodeObject[servicemodel.schema.dataTextFeild]);
                        if (servicemodel.schema.dataSpriteIcon in nodeObject)
                            treenode.type(nodeObject[servicemodel.schema.dataSpriteIcon]);
                        if (servicemodel.schema.idfield in nodeObject)
                            treenode.id(nodeObject[servicemodel.schema.idfield]);
                        if (servicemodel.schema.children in nodeObject) {
                            var childelem = nodeObject[servicemodel.schema.children];
                            if (childelem.length > 0)
                                treenode.importchildrens(servicemodel, childelem);
                        }
                        if (servicemodel.schema.uniqueId in nodeObject)
                            treenode.modelid(nodeObject[servicemodel.schema.uniqueId]);
                        if (index != undefined)
                            treenode.index(index + 1);
                        else
                            treenode.index(1);
                        treenode.haschild(true);
                        treenode.nodeobject = nodeObject;
                    }
                }
            }
        });
        this.children(treechildrens);
    }
    var treeviewModel = function () {
        var spritewidth = 20;
        var hashtable = new libhash();
        var eventlistners = new libhash();
        var parentUielement = null;
        var treeviewuicallback = null;
        var itemselectedCallback = null;
        var parentUielementWidth = null;
        var self = this;

        self.addeventlistners = function (key, val) {
            eventlistners.save(key, val);
        }
        self.servicemodel = ko.observable(new ServiceModel());
        self.serviceUrl = ko.computed(function () {
            return self.servicemodel().serviceurl();
        });
      

        self.dataSource = ko.observableArray([]);
        self.initializecontrol = function (parentelement, loadcomplete) {
            parentUielement = parentelement;
            parentUielementWidth = $(parentUielement).width();
            treeviewuicallback = loadcomplete;
            getTreenode(null, 0, null, true, self.servicemodel(), this.servicecallback);
        }
        self.addchildren = function (rootnode, newchildren) {
            rootnode.children().length = 0;
            for (var i = 0; i < newchildren.length ; i++) {
                rootnode.children.push(newchildren[i]);
            }
        }
        self.addChild = function (node, parentArray) {
            parentArray.push(node);
        }
        self.previousenode = ko.observable(new SelectedNode(null, null));
        self.selectednode = ko.observable(new SelectedNode(null, null));
        self.expandNode = function (nodeToExpand, callback) {
            try {
                var context = ko.contextFor(nodeToExpand);
                var nodedata = context.$data;
                var currentIndex = nodedata.index();
                var immediateParent = $(nodeToExpand).parent("li");
                nodedata.isexpanded("1");
                if (nodedata.haschild()) {
                    var isDataAssigned = $(immediateParent).attr("data-assigned");
                    if (!isDataAssigned) {
                        var parentId = nodedata.id();
                        var index = nodedata.index();
                        var type = nodedata.type();
                        $(nodeToExpand).find("#loadingicon").addClass("m-loadingicon");
                        getTreenode(parentId, index, type, true, context.$root.servicemodel(), function (jsondata) {
                            context.$root.addchildren(nodedata, jsondata);
                            $(nodeToExpand).find("#loadingicon").removeClass("m-loadingicon");
                            if (jsondata.length > 0) {
                                $(immediateParent).attr("data-assigned", true);
                                var groupElement = immediateParent.children(".expandul").children("Ul");
                                $(groupElement).show("slow");
                                hashtable.save(nodedata.modelid(), nodedata);
                            }
                            if (callback != null)
                                callback(nodeToExpand);
                        });
                    }
                    else {
                        var groupElement = immediateParent.children(".expandul").children("Ul");
                        $(groupElement).show("slow");
                        hashtable.save(nodedata.modelid(), nodedata);
                    }
                }
                if (eventlistners.contains("ItemSelected")) {
                    var itemSelectedCallback = eventlistners.get("ItemSelected");
                    itemSelectedCallback(nodedata);
                }
            } catch (e) {
                console.log(e.message);
            }
        }
        self.collapseNode = function (nodeToCollapse) {
            var context = ko.contextFor(nodeToCollapse);
            var immediateParent = $(nodeToCollapse).parent("li");
            var isdataexpanded = context.$data.isexpanded();//$(immediateParent).attr("data-expanded");
            if (isdataexpanded == "1") {
                var groupElement = $(immediateParent).children(".expandul").children("Ul");
                $(groupElement).hide("slow");
                hashtable.remove(context.$data.modelid());
                //$(immediateParent).attr("data-expanded", "0");
                context.$data.isexpanded("0");

                if (eventlistners.contains("ItemSelected")) {
                    var itemSelectedCallback = eventlistners.get("ItemSelected");
                    if (itemSelectedCallback != undefined)
                        itemSelectedCallback(context.$data);
                }
            }
        }
        self.selectionchanged = function (selecteditem) {
            try {
                this.previousenode = this.selectednode;
                var uielement = selecteditem;
                if ($(selecteditem).attr("data-nodekind") == "special") {
                    //if (event != undefined || event != null)
                    //    //event.preventDefault();
                    self.selectednode = new SelectedNode(uielement, undefined);
                    console.log("treeviewitemselected published for " + "Special node");
                    return;
                }
                var context = ko.contextFor(selecteditem);
                var treenodemodel = context.$data;
                if (this.previousenode != undefined && this.previousenode.dataobject != undefined) {
                    var oldmodelid = this.previousenode.dataobject.modelid();
                    var newmodelid = treenodemodel.modelid();
                    if (oldmodelid == newmodelid)
                        return;
                }
                self.selectednode = new SelectedNode(uielement, treenodemodel);
                var data = GetAnonymousModel(treenodemodel);
                try {
                    console.log("treeviewitemselected published for " + data.nodedata.Name);
                } catch (e) {
                    console.error(e.message);
                }
            } catch (e) {
                console.error(e.message);
            }
        }
        function updateme(nodedata) {

            try {
                self.selectednode.dataobject.name(nodedata.Name);
                self.selectednode.dataobject.nodeobject = nodedata;

            } catch (e) {
                console.error(e.message);
            }
        }
        function GetAnonymousModel(treenodemodel) {
            return { nodetype: "NORMAL", nodedata: treenodemodel.nodeobject, callback: updateme };
        }
        self.isselecteditem = function (hovernode) {
            var context = ko.contextFor(hovernode);
            var curdataobject = context.$data;
            var seldataobject = this.selectednode.dataobject;
            return !(seldataobject != null && curdataobject != null && seldataobject.modelid() == curdataobject.modelid());
        }
        self.OnReload = function () {
            this.initializecontrol(parentUielement);
        }
        self.servicecallback = function (jsondata) {
            if (jsondata.Error != null) {
                var errorTemplate = getErrorTemplate();
                $(parentUielement).find("#loadingtext").html(errorTemplate);
            }
            else {
                $(parentUielement).find("#loadingtext").css({ "display": "none" });
                self.dataSource(jsondata);
                // ko.applyBindings(self, document.getElementById("mpc-treeview"));
            }

            if (treeviewuicallback != null)
                treeviewuicallback(jsondata);
        }
        self.IsNodeExpanded = function (nodeTocheck) {
            var context = ko.contextFor(nodeTocheck);
            var immediateParent = $(nodeTocheck).parent("li");
            var isdataexpanded = context.$data.isexpanded();//$(immediateParent).attr("data-expanded");
            if (isdataexpanded == null || isdataexpanded == undefined)
                isdataexpanded = "0";
            return isdataexpanded;
        }
        self.addtreenode = function (newtreenodeModel) {
            var parentElement = this.selectednode.uielement;
            var context = ko.contextFor(parentElement);
            var parentnodeData = context.$data;
            var currentIndex = parentnodeData.index();
            newtreenodeModel.index(currentIndex + 1);
            parentnodeData.children.push(newtreenodeModel);
            var parentId = parentnodeData.id();
            var index = parentnodeData.index();
            var type = parentnodeData.type();
            parentnodeData.haschild(true);

            var immediateParent = $(parentElement).parent("li");
            var groupElement = immediateParent.children(".expandul").children("Ul");
            var maxchildwidth = 0;
            var currparentwidth = $(parentElement).innerWidth();
            var currentUIElement = null;
            groupElement.children("li").each(function () {
                var childcontext = ko.contextFor($(this)[0]);
                var childdata = childcontext.$data;
                if (childdata.isdirty()) {
                    childdata.isdirty(false);
                    currentUIElement = $(this).children('.expand')[0];
                    return;
                }
            });
            if (self.IsNodeExpanded(parentElement) == "0") {
                self.expandNode(parentElement);
            }
            self.makeselection(currentUIElement);
            var $treeel = $("#mpc-treeview");
            var $treeParent = $treeel.parent("div").parent("div");
            self.isScrolledIntoView($treeParent[0], currentUIElement);
        }
        self.removeTreenode = function (nodeId, parentNodeElement) {
        }
        self.isScrolledIntoView = function (parent, elem) {
            if (elem == null || elem == undefined)
                return;

            var docViewTop = $(parent).scrollTop();
            var docViewBottom = docViewTop + $(parent).height();

            var elemTop = $(elem)[0].offsetParent.offsetTop;
            var elemBottom = elemTop + $(elem)[0].offsetParent.offsetHeight;

            var val = ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
            if (!val)
                $(parent).scrollTop(elemTop - 100);
            return val;
        }
        self.makeselection = function (uielement) {
            try {
                var context = ko.contextFor(uielement);
                context.$root.selectionchanged(uielement);

                var previousuielement = context.$root.previousenode.uielement;
                if (previousuielement != null) {
                    var treeOpenicon = $(previousuielement).children(".tree-open-icon")[0];
                    $(previousuielement).removeClass("Item-State-selected");
                    $(treeOpenicon).removeClass("tree-open-icon-active");
                }

                var selecteduielement = context.$root.selectednode.uielement;
                $(selecteduielement).addClass("Item-State-selected");
                $(selecteduielement).removeClass("Item-State-hover");
                var treeOpenicon = $(selecteduielement).children(".tree-open-icon")[0];
                $(treeOpenicon).addClass("tree-open-icon-active");

                if (context.$root.IsNodeExpanded(uielement) == "0") {
                    context.$root.expandNode(uielement);
                }
                else {
                    context.$root.collapseNode(uielement);
                }
            } catch (e) {
                console.error(e.message);
            }
        }
    };
    function GetChildrenArray(childUiElement, childrenArray) {
        $(childUiElement).children("li").each(function () {
            var nodedata = ko.contextFor($(this).find(".expand")[0]);
            childrenArray.save(nodedata.$data.modelid(), nodedata);
            if (nodedata.$data.haschild()) {
                var groupElement = $(this).children(".expandul").children("Ul");
                GetChildrenArray(groupElement, childrenArray);
            }
        });
    }
    function AddAlreadyExpandedChildren(hashtable, childUiElement) {
        var maxwidth = 0;
        $(childUiElement).children("li").each(function () {
            var context = ko.contextFor($(this).find(".expand")[0]);
            var nodedata = context.$data;
            var isdataexpanded = nodedata.isexpanded();//$(this).attr("data-expanded");
            var width = nodedata.width();
            if (width != null && width != undefined && width > maxwidth)
                maxwidth = width;
            if (isdataexpanded != undefined && isdataexpanded == "1") {
                hashtable.save(nodedata.modelid(), nodedata);
                if (nodedata.haschild()) {
                    var groupElement = $(this).children(".expandul").children("Ul");
                    var tempwidth = AddAlreadyExpandedChildren(hashtable, groupElement);
                    if (tempwidth > maxwidth)
                        maxwidth = tempwidth;
                }
            }
        });
        return maxwidth;
    }
    function IncreaseTreeWidth(modelid, newwidth, hashtable, parentUielement) {
        var temphashtable = new libhash();
        temphashtable.save(modelid, new TreeNodeModel());
        var maxwidth = GetMaxWidth(temphashtable, hashtable);
        if (newwidth > maxwidth) {
            var parentwidth = $(parentUielement).width();
            if (newwidth > parentwidth)
                $(parentUielement).width(newwidth);
        }
    }
    function GetMaxWidth(listToExclude, hashtable) {
        var maxwidth = 0;
        var keys = hashtable.keys();
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var IsNodeInExcludeList = false;
            if (listToExclude.contains(key)) {
                IsNodeInExcludeList = true;
            }
            if (IsNodeInExcludeList)
                continue;
            var nodedata = hashtable.get(key);
            if (nodedata.childwidth() > maxwidth)
                maxwidth = nodedata.childwidth();
        }
        return maxwidth;
    }
    function RemoveChild(listToExclude, hashtable) {
        var keys = listToExclude.keys();
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (hashtable.contains(key))
                hashtable.remove(key);
        }
    }
    function wireupeventsforTreeview() {
        $("#mpc-treeview").delegate(".tree-open-icon", "mouseover", function () {
            var context = ko.contextFor(this);
            var expand = $(this).parent()[0];
            if (context.$root.isselecteditem(expand)) {
                $(expand).removeClass("Item-State-selected");
                $(expand).addClass("Item-State-hover");
            }
        });
        $("#mpc-treeview").delegate(".tree-open-icon", "mouseleave", function () {
            var expand = $(this).parent()[0];
            var context = ko.contextFor(expand);
            if (context.$root.isselecteditem(expand)) {
                $(expand).removeClass("Item-State-hover");
            }
        });
        $("#mpc-treeview").delegate(".tree-open-icon", "mousedown", function (e) {
            try {
                var expand = $(this).parent()[0];
                var context = ko.contextFor(expand);
                context.$root.selectionchanged(expand);

                var previousuielement = context.$root.previousenode.uielement;
                if (previousuielement != null) {
                    var treeopenicon = $(previousuielement).children("i")[0];
                    $(treeopenicon).removeClass("tree-open-icon-active");
                    $(previousuielement).removeClass("Item-State-selected");
                }

                $(this).addClass("tree-open-icon-active");

            } catch (e) {
                console.error(e.message);
            }

        });
        $("#mpc-treeview").delegate(".tree-open-icon", "click", function () {
            var expand = $(this).parent()[0];
            var context = ko.contextFor(expand);
            context.$root.selectionchanged(expand);
            if (context.$root.IsNodeExpanded(expand) == "0") {
                context.$root.expandNode(expand);
            }
            else {
                context.$root.collapseNode(expand);
            }

         

           

            ///*************Camera Association Page ***************/
       

        
            $('.expand').draggable({
                    revert: "valid",
                    cursor: "crosshair",
                    cursorAt: { top: -5, left: -5 },
                    helper: 'clone',
                    revert: 'invalid',
                    appendTo: 'body',
                    start: function (e, ui) {
                        $(ui.helper).addClass("Camera-draggable-helper");
                      }
            });
            
            $('.associations').droppable({
                drop: function (event, ui) {
                    var dragContext = $(ui)[0].draggable.context;
                    var treeNode = ko.contextFor(dragContext).$data;
                 //   var CameraName = ko.contextFor(dragContext).$data.name();
                    $(this)
                  .find("div>div")
                  .html("Dropped"),
                   //getLivestream(cameraNode, droppableId);
                    $.publish("ontreeitemdropped", { sourceObj: treeNode, destinationEle: $(this) });
                    console.log("Treeitem " + treeNode.name()+ " is dropped published for" + treeNode.id());
                }
            });

      
            /*************Camera Association Page ***************/

         

            /*
            Drag drop usecases
            1. Drag element on same parent as previous - no action should be taken
            2. Drag parent ele to child ele - show ignore style and no action should be taken'
            3. 
            */
            //$('.tree').draggable({
            //    helper: 'clone',
            //    revert: 'invalid',
            //    appendTo: 'body',
            //    start: function (e, ui) {
            //        $(ui.helper).addClass("ui-draggable-helper");
            //    }
            //});

            //$('.tree').droppable({
            //    accept: 'div',
            //    tolerance: 'pointer',
            //    hoverClass: 'state-hover',
            //    drop: function (event, ui) {
            //        var contextDragger = ko.contextFor(ui.helper[0]);
            //        var dragId = contextDragger.$root.selectednode.dataobject.modelid();
            //        var context = ko.contextFor(this);
            //        var id = context.$data.modelid();
            //        alert(dragId + ' inside ' + id);
            //    },
            //    over: function (event, ui) {
            //        $('#log').text('over');
            //    },
            //    out: function (event, ui) {
            //        $('#log').text('out');
            //    }
                
            //});
           
        });
        $("#mpc-treeview").delegate(".expand", "click", function () {
            var context = ko.contextFor(this);
            context.$root.selectionchanged(this);
            var previousuielement = context.$root.previousenode.uielement;
            if (previousuielement != null) {
                var treeopenicon = $(previousuielement).children("i")[0];
                $(treeopenicon).removeClass("tree-open-icon-active");
                $(previousuielement).removeClass("Item-State-selected");
            }

            var selecteduielement = context.$root.selectednode.uielement;
            var treeopenicon = $(selecteduielement).children("i")[0];
            $(treeopenicon).addClass("tree-open-icon-active");
            $(selecteduielement).addClass("Item-State-selected");
            $(selecteduielement).removeClass("Item-State-hover");

            //if (context.$root.IsNodeExpanded(expand) == "0") {
            //    context.$root.expandNode(expand);
            //}
            //else {
            //    context.$root.collapseNode(expand);
            //}
            /*
            Drag drop usecases
            1. Drag element on same parent as previous - no action should be taken
            2. Drag parent ele to child ele - show ignore style and no action should be taken'
            3. 
            */
            

            //$('.expand').draggable({
            //    helper: 'clone',
            //    revert: 'invalid',
            //    appendTo: 'body',
            //    start: function (e, ui) {
            //        $(ui.helper).addClass("ui-draggable-helper");
            //    }
            //});

            //$('.expand').droppable({
            //    accept: 'div',
            //    tolerance: 'pointer',
            //    hoverClass: 'state-hover',
            //    drop: function (event, ui) {
            //        var contextDragger = ko.contextFor(ui.helper[0]);
            //        var dragId = contextDragger.$root.selectednode.dataobject.modelid();
            //        var context = ko.contextFor(this);
            //        var id = context.$data.modelid();
            //        alert(dragId + ' inside ' + id);
            //    },
            //    over: function (event, ui) {
            //        $('#log').text('over');
            //    },
            //    out: function (event, ui) {
            //        $('#log').text('out');
            //    }
            //});

        });
        $("#mpc-treeview").delegate(".tree-label", "mouseover", function () {
            var context = ko.contextFor(this);
            var expand = $(this).parent()[0];
            if (context.$root.isselecteditem(expand)) {
                var treeOpenicon = $(expand).children(".tree-open-icon")[0];
                $(expand).removeClass("Item-State-selected");
                $(expand).addClass("Item-State-hover");
                $(treeOpenicon).addClass("tree-open-icon-active");
            }
        });

        $("#mpc-treeview").delegate(".tree-label", "mouseleave", function () {
            var expand = $(this).parent()[0];
            var context = ko.contextFor(expand);
            if (context.$root.isselecteditem(expand)) {
                var treeOpenicon = $(expand).children(".tree-open-icon")[0];
                $(expand).removeClass("Item-State-hover");
                $(treeOpenicon).removeClass("tree-open-icon-active");
            }
        });
    }
    ; (function ($, window, document, uicontext) {
        var pluginName = 'utreeview',
           defaults = {
               servicemodel: null,
               itemselected: null
           };
        function Plugin(element, options) {
            this.element = element;
            this.options = $.extend({}, defaults, options);
            this._defaults = defaults;
            this._name = pluginName;
            this.init();
        }
        Plugin.prototype.init = function () {
            if (this.options == null) {
                console.log("Service model for treeview is null");
                return;
            }
            try {

                var servicemodelobj = this.options.servicemodel;
                var uiElement = this.element;
                var mpcTreeviewWidget = getTreeViewTemplate();
                $(uiElement).html(mpcTreeviewWidget);
                wireupeventsforTreeview();
                ko.applyBindings(new treeviewModel(), $(uiElement)[0]);
                var context = ko.contextFor($(uiElement)[0]);
                context.$root.servicemodel(servicemodelobj);
                if (this.options.itemselected != undefined)
                    context.$root.addeventlistners("ItemSelected", this.options.itemselected);
                context.$root.initializecontrol(this.element, function (data) {
                });
            }
            catch (e) {
                console.log(e.message);
            }
        };
        $.fn[pluginName] = function (options) {
            if (!$.data(this, 'plugin_' + pluginName)) {
                var treepluginobj = new Plugin(this, options);
                $.data(this, 'plugin_' + pluginName, treepluginobj);
                return treepluginobj;

                //return this.each(function () {
                //    if (!$.data(this, 'plugin_' + pluginName)) {
                //        $.data(this, 'plugin_' + pluginName,
                //        new Plugin(this, options));
                //    }
                //});
                
            }
        }
    })($, window, document, jwplayer,window.viewerconfig.eventreciever);

})($, window.viewerconfig.uicontext);
$(document).ready(function () {
    var $uiElement = $("#uTreeview");
    var serviceModel = new ServiceModel();
    serviceModel.serviceurl($("#getUlistTreeviewUrl").attr("data-url"));
    serviceModel.schema.idfield = "Id";
    serviceModel.schema.dataTextFeild = "Name";
    serviceModel.schema.dataSpriteIcon = "EntityType";
    serviceModel.schema.uniqueId = "Id";
    serviceModel.schema.children = "Children";
    if ($uiElement != undefined) {
        treeviewpluginobject = $uiElement.utreeview({ "servicemodel": serviceModel });
    }
});