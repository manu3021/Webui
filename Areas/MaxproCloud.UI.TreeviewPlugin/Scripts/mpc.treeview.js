/// <reference path="mpc.widget.core.js" />

var treeviewPlugin = (function ($) {
    var newNodeCountvar = 0;
    var CameraStatus = { DISABLE: "disable", VIDEOOK: "videook", VIDEONOTOK: "videonotok", RECORDEDON: "recordedon", VIDEOOK_MISMATCH: "videookmismatch", VIDEONOTOK_MISMATCH: "videonotokmismatch" }
    var Devicestatus = { NOTREGISTERED: "notregistered", REGISTERED: "registered", ONLINE: "online", OFFLINE: "offline" }

    var localevents = { onNodesLoaded: "EVENTID_1000", onNodeSelected: "EVENTID_1001", onNodeChecked: "EVENTID_1002", onNodeAddedd: "EVENTID_1003", onNodeRemoved: "EVENTID_1004", onNodeUpdate: "EVENTID_1005", onNodeUnChecked: "EVENID_1006" };
    var tUtils = null;
    var filteredNodes = new libhash();
    var filterstyle = "strikken";
    //var treeviewname = null;
    //var treeviewid = null;
    var initialwidth;
    var treeviewcontainer;
    var RecorderArr = [];
    var searchNodeFound = false;
    var data = null;
    function getLoadingtemplate() {
        return "<span style=\"color:black;\" id=\"loadingtext\">Loading...</span>";
    }
    function getErrorTemplate() {
        var errorTemplate = "";
        errorTemplate += "<div style=\"display: table;\">";
        errorTemplate += "    <span style=\"display: table-cell;color:balck;\">Error loading<\/span>";
        errorTemplate += "    <button title=\"Retry\" data-bind=\"click: $data.OnReload\">Retry<\/button>";
        errorTemplate += "<\/div>";
        return errorTemplate;
    }
    function getRefreshTemplate() {
        var refreshTemplate = "";
        refreshTemplate += "<i data-refreshstatus=\"refreshId\" data-bind=\"visible:$data.IsRefreshVisible\" title=\"Click to refresh device status.\" class=\"tree-icon-refresh\"/>";
        return refreshTemplate;
    }

    //function getRefreshTemplateForPanel() {
    //    var refreshTemplate = "";
    //    refreshTemplate += "<i id=\"refreshPanelId\" title=\"Click to refresh panel status.\" class=\"tree-icon-refresh\"/>";
    //    return refreshTemplate;
    //}


    function UpdateCheckedStyle(element, viewModel, bindingContext) {        
        if (element) {
            $(element).removeClass("Item-State-hover");
            if (bindingContext.$root.IsEditMode() && (viewModel.IsChecked() || viewModel.IsIntermediate()) && !viewModel.isselected()) {
                $(element).removeClass("Item-State-selected");
                $(element).addClass("Item-State-checked");                
            }
            else {
                $(element).removeClass("Item-State-checked");
                if (viewModel.isselected()) {
                    $(element).addClass("Item-State-selected");                    
                }
                else {
                    $(element).removeClass("Item-State-selected");
                }                
            }
        }
    }
    ko.bindingHandlers.clicked = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            // This will be called when the binding is first applied to an element
            // Set up any initial state, event handlers, etc. here
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            UpdateCheckedStyle(element, viewModel, bindingContext);
        }
    };
    ko.bindingHandlers.intermedstate = {
        init: function (ele, valac, ab, vm, bc) {
            // This will be called when the binding is first applied to an element
            // Set up any initial state, event handlers, etc. here
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            UpdateCheckedStyle(element, viewModel, bindingContext);
        }
    };
    var ParallelAjaxExecuter = function (onComplete) {
        this.requests = [];
        this.results = [];
        this.onComplete = onComplete;
    }
    ParallelAjaxExecuter.prototype.addRequest = function (request) {
        this.requests.push({
            "request": request
        })
    }
    ParallelAjaxExecuter.prototype.dispatchAll = function (treeviewname) {
        var self = this;
        $.each(self.requests, function (i, item) {
            item.request.done(function (jsondata) {
                var nodes = jsondata;
                if (nodes != null || nodes != undefined) {
                    if (nodes.length > 0) {
                        for (var i = 0; i < nodes.length; i++) {
                            var nodeObject = nodes[i];
                            var targetdiv = $("#" + treeviewname + nodeObject.Id);
                            if (targetdiv[0] != undefined) {
                                var context = ko.contextFor(targetdiv[0]);
                                var treenode = context.$data;
                                $(targetdiv[0]).children("span[id = 'loadingicon']").remove();
                                try {
                                    if (treenode.nodeobject)
                                        treenode.nodeobject.Status = nodeObject.Status;
                                    treenode.statusclass(nodeObject.Status.toLowerCase());
                                    if (nodeObject.Name) {
                                        treenode.name(nodeObject.Name);
                                        if (treenode.nodeobject && treenode.nodeobject.Name) {
                                            treenode.nodeobject.Name = nodeObject.Name;
                                        }
                                    }
                                    if (nodeObject.DeviceType) {
                                        if (treenode.nodeobject && treenode.nodeobject.DeviceType) {
                                            treenode.nodeobject.DeviceType = nodeObject.DeviceType;
                                        }
                                    }
                                }
                                catch (e) {
                                    console.error("Error occured in Viewer entity type status selection", e);
                                }
                            }
                        }
                    }
                }
                self.checkAndComplete();
            });
        });
    }
    ParallelAjaxExecuter.prototype.allRequestsCompleted = function () {
        var i = 0;
        while (request = this.requests[i++]) {
            if (request.completed == undefined || request.completed == false) {
                return false;
            }
        }
        return true;
    },
    ParallelAjaxExecuter.prototype.checkAndComplete = function () {
        if (this.allRequestsCompleted()) {
            this.onComplete(this.results);
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

    function getCameraStatus(treeviewname, serviceModel, id, isrecorderstatus) {        
        try {          
            var isRefresh = false;
            if (event.target != undefined && event.target.tagName != undefined && event.target.tagName.toLowerCase() == 'i')
                isRefresh = true;
            //In some treeplugin loaders like rules no status is required so checking for empty url -VV
            if (serviceModel.camerastatusurl() == "") {
                return;
            }

            var pe = new ParallelAjaxExecuter(function (results) {

            });
            for (var i = 0; i < RecorderArr.length; i++) {
                data = ({ id: RecorderArr[i], isrefresh: isRefresh });
                if (isrecorderstatus && serviceModel.recorderstatusurl() != "") {
                    
                    var recurl = serviceModel.recorderstatusurl();// + "?id=" + RecorderArr[i];
                    pe.addRequest(ajaxRequest("POST", recurl,data));
                }
                var url = serviceModel.camerastatusurl();// + "?id=" + RecorderArr[i];
                pe.addRequest(ajaxRequest("POST", url,data));
            }
            pe.dispatchAll(treeviewname);
        }

        catch (e) {
            console.error("Error occured in Viewer entity type status selection", e);
        }
    }
    function getPanelStatus(treeviewname, serviceModel, id) {
        try {
            //In some treeplugin loaders like rules no status is required so checking for empty url -VV
            if (serviceModel.panelstatusurl() == "") {
                return;
            }

            var url = serviceModel.panelstatusurl();// + "?id=" + id;
            data = ({id:id});

            ajaxRequest("POST", url,data).done(function (jsondata) {
                var nodes = jsondata;
                var targetdiv = $("#" + treeviewname + nodes.Id);
                var context = ko.contextFor(targetdiv[0]);
                var treenode = context.$data;
                var iconelem = $(targetdiv[0]).children("i[name = 'nodeicon']");
                $(targetdiv[0]).children("span[id = 'loadingicon']").remove();
                try {
                    if (treenode.nodeobject)
                        treenode.nodeobject.Status = nodes.Status;
                    treenode.statusclass(nodes.Status.toLowerCase());
                }
                catch (e) {
                    console.error("Error occured in Viewer entity type status selection", e);
                }
                //var nodes = jsondata;
                //var targetdiv = $('#' + nodes.Id);
                //var iele = $(targetdiv).children("i[name = 'nodeicon']");
                //if (nodes != null || nodes != undefined) {
                //    switch (nodes.Status.toLowerCase()) {
                //        case Devicestatus.OFFLINE.toLowerCase():
                //            $(iele).attr('class', "icon-device-incomplete");
                //            $(iele).attr('title', "In-Active Panel.");
                //            break;
                //        case Devicestatus.ONLINE.toLowerCase():
                //            $(iele).attr('class', "tree-Device-icon");
                //            $(iele).attr('title', "Active Panel");
                //            break;
                //        default:
                //            break;
                //    }
                //}
            });
        }
        catch (e) {
            console.error("Error occured while retrieving panel status", e);
        }
    }
    function updatetreenodehovericon(node) {
        var nData = node.nodeobject;
        if (nData.Status == undefined || nData.Status == "")
            node.statusclass("Hover");
    }
    function updatetreenodeicon(node) {
        var nData = node.nodeobject;
        if (nData.Status)
            node.statusclass(nData.Status.toLowerCase());
        else
            node.statusclass("");
    }
    function addDefaultChildren(treeviewname, rootnode) {
        switch (rootnode.nodeobject.EntityType.toLowerCase()) {
            case EntityType.CUSTOMER.toLowerCase():
                addCrendentialNode(treeviewname, rootnode);
                addScheduleNode(treeviewname, rootnode);
                break;
            default: break;
        }
    }
    function addCrendentialNode(treeviewname, rootnode) {

        // Create node object
        var nodeobject = new Object();
        nodeobject.accountId = rootnode.nodeobject.Id;
        nodeobject.EntityType = EntityType.CREDENTIALHOLDERS;

        // create tree node
        var nodeCredential = new TreeNodeModel(treeviewname);
        nodeCredential.name(Resources.lbl_People + "    ");
        nodeCredential.parentNode = rootnode;
        nodeCredential.type(EntityType.CREDENTIALHOLDERS);
        nodeCredential.linkTitle("<em><a href=''>" + Resources.lbl_Give_access + "</a></em>");
        nodeCredential.divId(treeviewname + "divId");
        nodeCredential.modelid(new guid());
        nodeCredential.nodeobject = nodeobject;
        nodeCredential.haschild(false);

        // update icon
        updatetreenodeicon(nodeCredential);
        rootnode.children.push(nodeCredential);
    }
    function addScheduleNode(treeviewname, rootnode) {

        // Create node object
        var nodeobject = new Object();
        nodeobject.accountId = rootnode.nodeobject.Id;
        nodeobject.EntityType = EntityType.SCHEDULES;

        // create tree node
        var nodeSchedule = new TreeNodeModel(treeviewname);
        nodeSchedule.name(Resources.Schedule + "," + Resources.lbl_holidays);
        nodeSchedule.parentNode = rootnode;
        nodeSchedule.type(EntityType.SCHEDULES);
        nodeSchedule.divId(treeviewname + "divId");
        nodeSchedule.modelid(new guid());
        nodeSchedule.haschild(false);
        nodeSchedule.nodeobject = nodeobject;

        // update icon
        updatetreenodeicon(nodeSchedule);
        rootnode.children.push(nodeSchedule);
    }


    function convertToSalvotreenodeModel(treeviewname, jsonnodes, servicemodel, index, treeArr, update) {
        try {
            var treeArray = [];
            treeArray = treeArr;
            if (jsonnodes != null || jsonnodes != undefined) {
                if (jsonnodes.length > 0) {
                    for (var i = 0; i < jsonnodes.length; i++) {
                        var nodeObject = jsonnodes[i];
                        var haschild = true;
                        var treenode = new TreeNodeModel(treeviewname);

                        //  NEED to Replace with resource file
                        treenode.draggable("true");
                        treenode.divId(treeviewname + nodeObject.Id);
                        treenode.nodeobject = nodeObject;
                        if (servicemodel.schema.filterfield in nodeObject) {
                            var filterid = nodeObject[servicemodel.schema.filterfield];
                            if (filteredNodes.contains(treeviewname + filterid.toLowerCase())) {
                                treenode.filter(true);
                            }
                            else {
                                treenode.filter(false);
                            }
                        }
                        if (servicemodel.schema.dataTextFeild in nodeObject)
                            treenode.name(nodeObject[servicemodel.schema.dataTextFeild]);
                        if (servicemodel.schema.dataSpriteIcon in nodeObject)
                            treenode.type(nodeObject[servicemodel.schema.dataSpriteIcon]);
                        if (servicemodel.schema.idfield in nodeObject)
                            treenode.id(nodeObject[servicemodel.schema.idfield]);
                        if (servicemodel.schema.children in nodeObject) {
                            var childelems = nodeObject[servicemodel.schema.children];
                            if (childelems.length > 0) {
                                treenode.importchildrens(servicemodel, childelems, index);
                            }

                        }
                        if (servicemodel.schema.uniqueId in nodeObject)
                            treenode.modelid(nodeObject[servicemodel.schema.uniqueId]);
                        if (servicemodel.schema.statusqueryidfield in nodeObject)
                            treenode.statusqueryId(nodeObject[servicemodel.schema.statusqueryidfield]);
                        if (index != undefined)
                            treenode.index(index + 1);
                        else
                            treenode.index(1);
                        if (servicemodel.schema.haschildren in nodeObject)
                            haschild = nodeObject[servicemodel.schema.haschildren];
                        if (haschild)
                            treenode.Title("Click here to Expand");
                        treenode.haschild(haschild);
                        //update node icon
                        updatetreenodeicon(treenode);
                        treeArray.push(treenode);
                    }
                }
            }
            return treeArray;
        }
        catch (e) {
            throw e;
        }
    }

    function getrootchildTreenode(treeviewname, id, index, nodeType, servicemodel, updatingnode) {
        try {
            var _updatingnode = updatingnode;
            var serviceUrl = servicemodel.serviceurl();// + "?id=" + id + "&nodeType=" + nodeType + "&parentId=" + null;
            var treechildarray = [];
            data = ({id:id,nodeType:nodeType,parentId:null});
            ajaxRequest("POST", serviceUrl,data).done(function (jsondata) {
                var nodes = jsondata;
                if (nodes != null || nodes != undefined) {
                    if (nodes.length > 0) {
                        treechildarray = convertTotreenodeModel(treeviewname, nodes, servicemodel, index);
                        if (_updatingnode.haschild()) {
                            for (var i = 0; i < treechildarray.length; i++) {
                                _updatingnode.children.push(treechildarray[i]);
                            }
                        }
                        return _updatingnode;
                    }
                }
            });
            return treechildarray;
        }
        catch (e) {
            console.lor("Error in tree array filling:" + e.message);
        }

    }

    function convertTotreenodeModel(treeviewname, jsonnodes, servicemodel, index) {
        try {
            var treeArray = [];
            if (jsonnodes != null || jsonnodes != undefined) {
                if (jsonnodes.length > 0) {
                    for (var i = 0; i < jsonnodes.length; i++) {
                        var nodeObject = jsonnodes[i];
                        var haschild = true;
                        var treenode = new TreeNodeModel(treeviewname);

                        //  NEED to Replace with resource file
                        treenode.draggable("true");
                        treenode.divId(treeviewname + nodeObject.Id);
                        treenode.nodeobject = nodeObject;

                        if (servicemodel.schema.filterfield in nodeObject) {
                            var filterid = nodeObject[servicemodel.schema.filterfield];
                            if (filteredNodes.contains(treeviewname + filterid.toLowerCase())) {
                                treenode.filter(true);
                            }
                            else {
                                treenode.filter(false);
                            }
                        }
                        if (servicemodel.schema.dataTextFeild in nodeObject)
                            treenode.name(nodeObject[servicemodel.schema.dataTextFeild]);
                        if (servicemodel.schema.dataSpriteIcon in nodeObject)
                            treenode.type(nodeObject[servicemodel.schema.dataSpriteIcon]);
                        if (servicemodel.schema.idfield in nodeObject)
                            treenode.id(nodeObject[servicemodel.schema.idfield]);
                        if (servicemodel.schema.children in nodeObject) {
                            var childelems = nodeObject[servicemodel.schema.children];
                            if (childelems.length > 0) {
                                treenode.importchildrens(servicemodel, childelems, index);
                            }
                        }
                        if (servicemodel.schema.uniqueId in nodeObject)
                            treenode.modelid(nodeObject[servicemodel.schema.uniqueId]);
                        if (servicemodel.schema.statusqueryidfield in nodeObject)
                            treenode.statusqueryId(nodeObject[servicemodel.schema.statusqueryidfield]);
                        //Physical ID of the Readers
                        treenode.physicalId = nodeObject.UniqueId;

                        if (index != undefined)
                            treenode.index(index + 1);
                        else
                            treenode.index(1);
                        if (servicemodel.schema.haschildren in nodeObject)
                            haschild = nodeObject[servicemodel.schema.haschildren];
                        if (haschild)
                            treenode.Title("Click here to Expand");
                        treenode.haschild(haschild);
                        //update node icon
                        updatetreenodeicon(treenode);
                        treeArray.push(treenode);
                    }
                }
            }
            return treeArray;
        }
        catch (e) {
            throw e;
        }
    }
    function getTreenode(treeviewname, id, parentid, index, nodeType, isservice, servicemodel, isselectrootnode, servicecallback) {
        try {
            var serviceUrl = servicemodel.serviceurl();
            data = ({});
            if (isservice) {
                if (serviceUrl == null || serviceUrl == undefined)
                    return treeArray;

                if (id == null) {
                    data.id=null;
                }
                else {
                    data.id = id;
                    data.nodeType = nodeType;
                    data.parentId= parentid;
                }
                var treeArray = [];

                ajaxRequest("POST", serviceUrl,data).done(function (jsondata) {
                    var nodes = jsondata;
                    if (nodes != null || nodes != undefined) {
                        if (nodes.length > 0) {
                            treeArray = convertTotreenodeModel(treeviewname, nodes, servicemodel, index);
                            if (servicemodel.events != undefined && servicemodel.events.itemsloaded != "")
                                $.publish(servicemodel.events.itemsloaded, { parentid: id, nodedata: nodes, nodemodel: treeArray });
                        }
                    }
                    servicecallback(treeArray, isselectrootnode);
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
    var TreeNodeModel = function (treeviewname) {
        var self = this;
        self.treeviewname = treeviewname;
        self.isdirty = ko.observable(false);
        self.parentNode = null;
        self.modelid = ko.observable("");
        self.id = ko.observable("");
        self.physicalId = "";
        self.name = ko.observable("");
        self.isexpanded = ko.observable(false);
        self.width = ko.observable();
        self.childwidth = ko.observable();
        self.children = ko.observableArray([]);
        self.haschild = ko.observable(false);
        self.parentId = ko.observable("");
        self.statusqueryId = ko.observable("");
        self.index = ko.observable("");
        self.type = ko.observable("");
        self.Title = ko.observable("");
        self.draggable = ko.observable("");
        self.divId = ko.observable("");
        self.isselected = ko.observable(false);
        self.statusclass = ko.observable("");
        self.filter = ko.observable(false);
        self.IsDataAssigned = ko.observable(false);
        self.linkTitle = ko.observable();
        self.filterkey = ko.computed(function () {
            return self.treeviewname + self.id();
        });
        self.giveAccess = function (data, event) {
            $.publish("giveaccessselected", data);
        };
        self.filter.subscribe(function (newval) {
            if (newval)
                self.draggable("false");
            else
                self.draggable("true");
        });
        self.icon = ko.computed(function () {
            if (self.type() != null) {
                if (self.statusclass() != "")
                    return "icon_" + self.type().toLowerCase() + "_" + self.statusclass();
                return "icon_" + self.type().toLowerCase();
            }
            else
                return " tree-open-icon";
        });
        self.showcheckbox = ko.observable(false);
        self.IsRefreshVisible = ko.observable(false);
        self.IsDeletenodeicon = ko.observable(false);
        self.IsChecked = ko.observable(false);
        self.IsChecked.subscribe(function (newval) {
            var treeViewEle = $("#" + self.treeviewname)[0];
            var context = ko.contextFor(treeViewEle);
            context.$root.UpdateCheckedItems(self);
        });
        self.SetCheckState = function (data, event) {            
            console.log("check clicked");
            var treeContext = ko.contextFor($("#" + self.treeviewname)[0]);
            //if (self.parentNode != null) {
            // // Selection mode is added to control checkbox selection on treeview BY Mahesh            
            if ("selectionmode" in treeContext.$data.options) {
                if (treeContext.$data.options.selectionmode == "excepsingle") {    
                    makecheckselection(self, self.IsChecked());
                    if (self.parentNode != null && self.parentNode.type().toLowerCase() == 'group')
                        setexcepparentcheckstate(self.parentNode, self.IsChecked());
                    else if (self.parentNode != null && (self.parentNode.type().toLowerCase() == 'dealer' || self.parentNode.type().toLowerCase() == 'customer'))
                        setparentcheckstate(self.parentNode, self.IsChecked());                        
                }
                else if (treeContext.$data.options.selectionmode != "single") {
                        setparentcheckstate(self.parentNode, self.IsChecked());
                    }                    
                }
                else {
                    makecheckselection(self, self.IsChecked());
                    setparentcheckstate(self.parentNode, self.IsChecked());
                }
            //}
            return true;
        };
        self.IsIntermediate = ko.observable(false);
        self.type.subscribe(function () {
            var context = ko.contextFor($("#" + self.treeviewname)[0]);
            var type = self.type();
            if (type != '') {
                if (type.toLowerCase() == EntityType.RECORDER || type.toLowerCase() == EntityType.PANEL) {
                    self.IsRefreshVisible(true);
                }
                else {
                    self.IsRefreshVisible(false);
                }
                if (type.toLowerCase() == EntityType.SALVO) {
                    self.IsDeletenodeicon(true);
                }
                else {
                    self.IsDeletenodeicon(false);
                }
                var noneditables = context.$root.options.noneditabletypes;
                if (noneditables) {
                    for (var i = 0; i < noneditables.length; i++) {
                        if (noneditables[i] == type) {
                            return self.showcheckbox(false);
                        }
                    }
                }
            }
            return self.showcheckbox(true);
        });
        function setexcepparentcheckstate(parentnode, checkvalue) {
            if (self.parentNode != null && self.parentNode.nodeobject.EntityType.toLowerCase() == "group") {
                if (parentnode && parentnode.children()) {
                    var findanynodeChecked = _.filter(parentnode.children(), function (tnode) {
                        return !(tnode.showcheckbox() && !tnode.IsChecked());
                    });                    
                    if (findanynodeChecked != undefined && findanynodeChecked.length == parentnode.children().length) {
                        parentnode.nodeobject.IsShared = true;
                        parentnode.IsChecked(true);
                        parentnode.IsIntermediate(true);
                    }
                    else if (findanynodeChecked != undefined && findanynodeChecked.length > 0) {
                        parentnode.nodeobject.IsShared = null;
                        parentnode.IsChecked(null);                        
                        parentnode.IsIntermediate(true);
                    }
                    else {
                        parentnode.nodeobject.IsShared = false;
                        parentnode.IsChecked(false);
                        parentnode.IsIntermediate(false);
                    }
                   
                }                
            }
        }
        function setparentcheckstate(parentnode, checkvalue) {
            if (parentnode && parentnode.children()) {
                var findanynodeChecked = _.filter(parentnode.children(), function (tnode) {
                    return !(tnode.showcheckbox() && !tnode.IsChecked());
                });
                if (findanynodeChecked != undefined && findanynodeChecked.length == parentnode.children().length) {
                    parentnode.IsChecked(true);
                    parentnode.IsIntermediate(false);
                }
                else {
                    var findanynodeIntermediate = _.find(parentnode.children(), function (tnode) {
                        return tnode.showcheckbox() && (tnode.IsChecked() || tnode.IsIntermediate());
                    });
                    if (findanynodeIntermediate != undefined) {
                        parentnode.IsChecked(false);
                        parentnode.IsIntermediate(true);
                    }
                    else {
                        parentnode.IsIntermediate(false);
                        parentnode.IsChecked(false);
                    }
                }
            }
            if (parentnode && parentnode.parentNode != null)
                setparentcheckstate(parentnode.parentNode, checkvalue);
        }
        function makecheckselection(node, checkvalue) {
            node.IsIntermediate(false);
            // First make all children checked
            if (node.children().length > 0) {
                for (var c = 0; c < node.children().length; c++) {
                    if (node.children()[c].showcheckbox()) {
                        node.children()[c].IsChecked(checkvalue);
                        makecheckselection(node.children()[c], checkvalue);
                    }
                }
            }
        }
        self.filterstyle = ko.computed(function () {
            if (self.filter())
                return "tree-label " + filterstyle;
            else
                return "tree-label";
        });
        self.nodeobject = null;
        self.Removenode = function (nodeData) {
            self.remove(nodeData);
        }
        self.RemoveChild = function (nodeData) {
            self.children.remove(nodeData);
        }
        self.update = function (updatedNodeObj) {
        }
        self.Initialize = function (name, id, modelid, haschild, index, type, parentid) {
            self.id(id);
            self.parentId(parentid);
            self.name(name);
            self.children([]);
            self.modelid(modelid);
            if (type.toLowerCase() == EntityType.PANEL.toLocaleLowerCase()) {
                self.haschild(true);
            }
            else {
                self.haschild(haschild);
            }
            self.index(index);
            self.type(type || "");
            self.divId(self.treeviewname + id.toLowerCase());
        }
        function Init() {
            var context = ko.contextFor($(treeviewcontainer)[0]);
            context.$root.IsEditMode.subscribe(function (newval) {
                self.IsChecked(false);
            });
        }
        Init();
    };

    TreeNodeModel.prototype.importchildrens = function (servicemodel, childrenData, index) {
        this.IsDataAssigned(true);
        this.isexpanded(true);
        var treechildrens = convertTotreenodeModel(this.treeviewname, childrenData, servicemodel);
        // view model add children
        tUtils.bindingcontext.$root.addchildren(this, treechildrens);
    }
    /* Main view model*/
    var treeviewModel = function (options, treeviewname) {
        var spritewidth = 20;
        var hashtable = new libhash();
        var eventlistners = new libhash();
        var parentUielement = null;
        var treeviewuicallback = null;
        var itemselectedCallback = null;
        var parentUielementWidth = null;
        var self = this;
        var completeDataSource = null;
        self.options = options;
        self.treeviewname = treeviewname;
        self.addeventlistners = function (key, val) {
            eventlistners.save(key, val);
        }
        self.servicemodel = ko.observable(new ServiceModel());
        self.serviceUrl = ko.computed(function () {
            return self.servicemodel().serviceurl();
        });
        self.dataSource = ko.observableArray([]);
        self.init = function (parentElement) {
            parentUielement = parentElement;
            parentUielementWidth = $(parentUielement).width();
        }
        self.initializecontrol = function (parentelement, loadcomplete) {
            treeviewuicallback = loadcomplete;
            var isselectrootnode = false;
            if ("selectrootnode" in self.options) {
                isselectrootnode = self.options.selectrootnode;
            }
            if ("rootnode" in self.options) {
                getTreenode(self.treeviewname, options.rootnode.Id, options.rootnode.ParentId, 0, options.rootnode.EntityType, true, self.servicemodel(), isselectrootnode, this.servicecallback);
            }
            else {
                getTreenode(self.treeviewname, null, null, 0, null, true, self.servicemodel(), isselectrootnode, this.servicecallback);
            }

        }
        self.loaddatasource = function (fulldatasource, callback) {
            treeviewuicallback = callback;
            if (fulldatasource) {
                completeDataSource = fulldatasource;
                self.servicecallback(fulldatasource);
            }
        }
        self.addchildren = function (rootnode, newchildren) {
            rootnode.children().length = 0;
            RecorderArr = [];
            for (var i = 0; i < newchildren.length ; i++) {
                newchildren[i].parentNode = rootnode;
                // If mode is specified
                if ("selectionmode" in self.options) {
                    // If its single selection
                    if (self.options.selectionmode == "single") {
                        if ("selectednodes" in self.options) {
                            var defaultSelectedNodes = self.options.selectednodes;
                            if (_.contains(defaultSelectedNodes, newchildren[i].id())) {
                                newchildren[i].IsChecked(true);
                            }
                        }
                    }
                    else {
                        // If its multiple selection
                        if (self.IsEditMode() && newchildren[i].showcheckbox())
                            newchildren[i].IsChecked(rootnode.IsChecked());

                        if ("selectednodes" in self.options) {
                            var defaultSelectedNodes = self.options.selectednodes;
                            if (_.contains(defaultSelectedNodes, newchildren[i].id())) {
                                newchildren[i].IsChecked(true);
                            }
                        }
                    }
                }
                else {

                    ////  if root node is checked make child node checked
                    if (self.IsEditMode() && newchildren[i].showcheckbox())
                        newchildren[i].IsChecked(rootnode.IsChecked());
                }
                rootnode.children.push(newchildren[i]);
                //for status
                if (newchildren[i].type().toLowerCase() == EntityType.CAMERA.toLowerCase()) {
                    var result = jQuery.inArray(newchildren[i].statusqueryId(), RecorderArr)
                    if (result == -1) {
                        RecorderArr.push(newchildren[i].statusqueryId());
                    }
                }
            }

            //// If selection mode is single and if the id is matching with node make the node checking

            if (self.options.showspecialnodes)
                addDefaultChildren(self.treeviewname, rootnode);

            if (RecorderArr != undefined && RecorderArr.length > 0) {
                var isgetrecorderstatus = false;
                if (rootnode.type().toLowerCase() == EntityType.RECORDER.toLowerCase()) {
                    isgetrecorderstatus = true;
                }
                getCameraStatus(self.treeviewname, self.options.servicemodel, RecorderArr, isgetrecorderstatus);
            }
        }
        self.previousenode = ko.observable(new SelectedNode(null, null));
        self.selectednode = ko.observable(new SelectedNode(null, null));
        self.expandNode = function (nodeToExpand, callback, newtreeModel, bForceRefresh) {
            try {
                var firsttreeli = $(treeviewcontainer).find("li")[0];
                if (!initialwidth) {
                    initialwidth = firsttreeli.offsetWidth;
                }
                var context = ko.contextFor(nodeToExpand);

                // Seleted node data- Parent node
                var nodedata = context.$data;
                var currentIndex = nodedata.index();
                var immediateParent = $(nodeToExpand).parent("li");
                if (nodedata.haschild()) {
                    var isDataAssigned = $(immediateParent).attr("data-assigned");
                    if ((!isDataAssigned || isDataAssigned.toLowerCase() == "false") || bForceRefresh) {
                        var parentId = nodedata.id();
                        var parentparentid;
                        if (nodedata.nodeobject != undefined && (nodedata.nodeobject.ParentId != null || nodedata.nodeobject.ParentId != undefined)) {
                            if (nodedata.nodeobject.ParentId != "")
                                parentparentid = nodedata.nodeobject.ParentId;
                        }
                        var deviceid = nodedata.id();
                        var index = nodedata.index();
                        var type = nodedata.type();

                        $(nodeToExpand).find("#loadingicon").addClass("m-loadingicon");
                        var serviceModel = context.$root.servicemodel();
                        getTreenode(self.treeviewname, parentId, parentparentid, index, type, true, serviceModel, false, function (jsondata) {
                            context.$root.addchildren(nodedata, jsondata);
                            $(nodeToExpand).find("#loadingicon").removeClass("m-loadingicon");
                            if (nodedata.children().length > 0) {
                                nodedata.isexpanded(true); //This is moved here because if there are no children populated then there is no meaning in setting node expanded.
                                var groupElement = immediateParent.children(".expandul").children("Ul");
                                var refreshli = $(immediateParent).children(".expand");
                                $(immediateParent).attr("data-assigned", true);
                                if (self.options.showrefreshstatustypes && self.options.showrefreshstatustypes.length > 0) {
                                    if (_.contains(self.options.showrefreshstatustypes, type.toLowerCase())) {
                                        //setting false only for which refresh status appears because 
                                        //previously also only for whichever node refresh status was there, only for those nodes it was set false -VV
                                        $(immediateParent).attr("data-assigned", false);
                                        if ($(groupElement).children("li").length > 0) {
                                            $(nodeToExpand).children("i[data-refreshstatus='refreshId']").css({ "display": "initial" });
                                        }
                                    }
                                }
                                if (type.toLowerCase() == EntityType.PANEL.toLowerCase()) {
                                    if ($(groupElement).children("li").length > 0) {
                                        getPanelStatus(self.treeviewname, serviceModel, deviceid);
                                    }
                                }

                                var groupElement = immediateParent.children(".expandul").children("Ul");
                                $(groupElement).show("slow");

                                //This for newly added node
                                //This for newly added node
                                if (newtreeModel) {
                                    self.selectionchanged($("#" + self.treeviewname + newtreeModel.id())[0]);
                                }

                                var childmaxwidth = 0;
                                $(groupElement).find('.expand').each(function () {
                                    var chContext = ko.contextFor(this);
                                    var cNodeData = chContext.$data;
                                    var wd = $(this).outerWidth(true);
                                    var actualchildwidth = 0;
                                    $(this).children().each(function () {
                                        actualchildwidth += $(this).outerWidth(true);
                                    });
                                    if (actualchildwidth > 0)
                                        wd = actualchildwidth;
                                    wd = wd + (25 * index) + 4;
                                    cNodeData.width(wd);
                                    if (childmaxwidth < wd)
                                        childmaxwidth = wd;
                                });
                                nodedata.childwidth(childmaxwidth);
                                if ($(firsttreeli).width() < childmaxwidth)
                                    $(firsttreeli).width(childmaxwidth);

                                hashtable.save(nodedata.modelid(), nodedata);
                            }
                            if (callback != null)
                                callback(nodeToExpand);
                            raiseNodesLoaded(jsondata);
                        });
                    }
                    else {
                        var groupElement = immediateParent.children(".expandul").children("Ul");
                        $(groupElement).show("slow");
                        hashtable.save(nodedata.modelid(), nodedata);

                        //This for newly added node
                        if (newtreeModel) {
                            self.selectionchanged($("#" + self.treeviewname + newtreeModel.id())[0]);
                        }

                        var newwidth = AddAlreadyExpandedChildren(self.treeviewname, hashtable, groupElement);
                        var parentwidth = $(firsttreeli).width();
                        if (newwidth > parentwidth) {
                            $(firsttreeli).width(newwidth);
                        }
                        if (callback != null)
                            callback(nodeToExpand);
                        nodedata.isexpanded(true);
                        raiseNodesLoaded(nodedata.children());
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
            if (isdataexpanded) {
                var groupElement = $(immediateParent).children(".expandul").children("Ul");
                var childrenHashtable = new libhash();
                GetChildrenArray(groupElement, childrenHashtable);
                childrenHashtable.save(context.$data.modelid(), context);
                RemoveChild(childrenHashtable, hashtable);
                var maxwidthaftercollpase = GetMaxWidth(childrenHashtable, hashtable);
                var firsttreeli = $(treeviewcontainer).find("li")[0];
                if (maxwidthaftercollpase >= initialwidth) {
                    if ($(firsttreeli).width() > maxwidthaftercollpase)
                        $(firsttreeli).width(maxwidthaftercollpase);
                }
                else if ($(firsttreeli).width() > initialwidth) {
                    $(firsttreeli).width(initialwidth);
                }
                RemoveChild(childrenHashtable, hashtable);
                $(groupElement).hide("slow");
               // $(nodeToCollapse).children("i[data-refreshstatus='refreshId']").hide();
                hashtable.remove(context.$data.modelid());
                //$(immediateParent).attr("data-expanded", "0");
                context.$data.isexpanded(false);

                if (eventlistners.contains("ItemSelected")) {
                    var itemSelectedCallback = eventlistners.get("ItemSelected");
                    if (itemSelectedCallback != undefined)
                        itemSelectedCallback(context.$data);
                }
            }
        }
        self.selectionchanged = function (selecteditem) {
            try {
                var context = ko.contextFor(selecteditem);
                var currenttreenodemodel = context.$data;
                currenttreenodemodel.isselected(true);

                this.previousenode = this.selectednode;
                var uielement = selecteditem;
                var data = GetAnonymousModel(currenttreenodemodel);
                if (this.previousenode != undefined && this.previousenode.dataobject != undefined) {
                    var oldmodelid = this.previousenode.dataobject.modelid();
                    var newmodelid = currenttreenodemodel.modelid();
                    if (oldmodelid == newmodelid)
                        return;
                }

                if (this.previousenode.dataobject != null) {
                    this.previousenode.dataobject.isselected(false);
                }

                if (this.previousenode && this.previousenode.dataobject) {
                    updatetreenodeicon(this.previousenode.dataobject);
                }

                self.selectednode = new SelectedNode(uielement, currenttreenodemodel);
                try {
                    console.log("treeviewitemselected published for " + data.nodedata.Name);
                    if (self.servicemodel().events != undefined && self.servicemodel().events.itemselected != "") {
                        $.publish(self.servicemodel().events.itemselected, data);
                    }

                    if (eventlistners.containskey(localevents.onNodeSelected)) {
                        eventlistners.get(localevents.onNodeSelected)({ data: currenttreenodemodel });
                    }
                } catch (e) {
                    console.error(e.message);
                }

                return data;
            } catch (e) {
                console.error(e.message);
            }
        }
        self.IsEditMode = ko.observable(false);
        self.checkednodes = new libhash();
        self.previousSelectednodeIds = [];
        self.UpdateCheckedItems = function (treenodemodel) {
            var publishObj = GetAnonymousModel(treenodemodel);
            if (treenodemodel.IsChecked()) {
                //self.checkednodes.save(treenodemodel.id(), { nodetype: treenodemodel.type(), nodedata: treenodemodel.nodeobject});
                self.checkednodes.save(treenodemodel.id(), publishObj);

                if (eventlistners.containskey(localevents.onNodeChecked)) {
                    eventlistners.get(localevents.onNodeChecked)(publishObj);
                }
            }
            else {
                if (self.checkednodes.contains(treenodemodel.id())) {
                    self.checkednodes.remove(treenodemodel.id());
                }

                if (eventlistners.containskey(localevents.onNodeUnChecked)) {
                    eventlistners.get(localevents.onNodeUnChecked)(publishObj);
                }
            }

            if (self.previousSelectednodeIds.length > 0) {
                var prevIdxNode = self.previousSelectednodeIds.indexOf(treenodemodel.id());
                if (prevIdxNode > -1) {
                    self.previousSelectednodeIds.splice(prevIdxNode, 1);
                }
            }

            var parentnodeobject = null;
            if (treenodemodel.parentNode) {
                parentnodeobject = treenodemodel.parentNode.nodeobject;
            }

            $.publish(self.servicemodel().events.ontreecheckboxchanged, { ischecked: treenodemodel.IsChecked(), nodetype: treenodemodel.type(), nodedata: treenodemodel.nodeobject, parentnodedata: parentnodeobject });
        };
        self.unselectnode = function () {
            try {
                var prevnode = self.selectednode;
                if (prevnode && prevnode.dataobject != null) {
                    prevnode.dataobject.isselected(false);
                    updatetreenodeicon(prevnode.dataobject);
                }
                self.previousenode = self.selectednode = new SelectedNode(null, null);
            } catch (e) {
                console.error(e.message);
            }
        }

        function updaterootnode(selectednode) {
            try {

                var tNodeContext = ko.contextFor(document.getElementById(self.treeviewname + selectednode.nodedata.nodedata.Id));
                var updatingNode = tNodeContext.$data;
                // clear the existing childrens
                updatingNode.children([]);
                var nodeType = selectednode.nodedata.nodedata.EntityType;
                updatingNode = getrootchildTreenode(self.treeviewname, selectednode.nodedata.nodedata.Id, 0, nodeType, tNodeContext.$root.servicemodel(), updatingNode);
            } catch (e) {
                console.error(e.message);
            }
        }



        function updateme(nodedata, refresh) {
            try {
                var tNodeContext = ko.contextFor(document.getElementById(self.treeviewname + nodedata.Id));
                var updatingNode = tNodeContext.$data;

                if (nodedata.Id == undefined)
                    nodedata.Id = updatingNode.nodeobject.Id;
                if (nodedata.UniqueId == undefined)
                    nodedata.UniqueId = updatingNode.nodeobject.UniqueId;
                if (nodedata.ParentId == undefined)
                    nodedata.ParentId = updatingNode.nodeobject.ParentId;
                if (nodedata.Name == undefined)
                    nodedata.Name = updatingNode.nodeobject.Name;
                if (nodedata.Description == undefined)
                    nodedata.Description = updatingNode.nodeobject.Description;
                if (nodedata.TypeId == undefined)
                    nodedata.TypeId = updatingNode.nodeobject.TypeId;
                if (nodedata.EntityType == undefined)
                    nodedata.EntityType = updatingNode.nodeobject.EntityType;
                if (nodedata.IsActive == undefined)
                    nodedata.IsActive = updatingNode.nodeobject.IsActive;
                if (nodedata.DeviceType == null || nodedata.DeviceType.ModelId == undefined || nodedata.DeviceType.Name == undefined)
                    nodedata.DeviceType = updatingNode.nodeobject.DeviceType;
                if (nodedata.Status == undefined || nodedata.Status == "") //Added empty string check as .net model's string properties are assigned with String.Empty by default -VV
                    nodedata.Status = updatingNode.nodeobject.Status;
                if (nodedata.StatusQueryId == undefined || nodedata.StatusQueryId == "")
                    nodedata.StatusQueryId = updatingNode.nodeobject.StatusQueryId;
                if (nodedata.HasChild != undefined && nodedata.HasChild != updatingNode.haschild()) {
                    updatingNode.haschild(nodedata.HasChild);
                }

                updatingNode.name(nodedata.Name);
                updatingNode.nodeobject = nodedata;
                updatetreenodeicon(updatingNode);

                if (self.servicemodel().events != undefined && self.servicemodel().events.itemupdated != "")
                    $.publish(self.servicemodel().events.itemupdated, nodedata);

                if (eventlistners.contains(localevents.onNodeUpdate))
                    eventlistners.get(localevents.onNodeUpdate)({ data: updatingNode });

                if (refresh) {
                    var expand = document.getElementById(updatingNode.parentNode.divId());
                    var context = ko.contextFor(expand);
                    context.$root.collapseNode(expand);
                    context.$root.expandNode(expand, null, null, true);
                }


            } catch (e) {
                console.error(e.message);
            }
        }
        function deleteme(selectedNode) {
            var parentNodeRef = null;
            if (selectedNode.treemodel != null) {
                parentNodeRef = selectedNode.treemodel.parentNode;
                parentNodeRef.RemoveChild(selectedNode.treemodel);
                self.selectednode.dataobject.nodeobject = parentNodeRef;
            }
            else {
                self.RemoveSalvonodeitem(selectedNode);
                //Removenode(selectedNode);
            }

            if (eventlistners.contains(localevents.onNodeRemoved))
                eventlistners.get(localevents.onNodeRemoved)({ data: selectedNode.treemodel });
        }
        function GetAnonymousModel(treenodemodel) {
            var parentnodeobject = null;
            if (treenodemodel.parentNode) {
                parentnodeobject = treenodemodel.parentNode.nodeobject;
            }
            return { nodetype: treenodemodel.type().toUpperCase(), treemodel: treenodemodel, nodedata: treenodemodel.nodeobject, parentnodedata: parentnodeobject, updatecallback: updateme, deletecallback: deleteme, updaterootcalback: updaterootnode };
        }
        function raiseNodesLoaded(nodesLoaded) {
            if (eventlistners.containskey(localevents.onNodesLoaded)) {
                eventlistners.get(localevents.onNodesLoaded)(nodesLoaded);
            }
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
        self.servicecallback = function (jsondata, isselectrootnode) {
            if (jsondata.Error != null) {
                var errorTemplate = getErrorTemplate();
                $(parentUielement).find("#loadingtext").html(errorTemplate);
            }
            else {
                $(parentUielement).find("#loadingtext").css({ "display": "none" });
                self.dataSource(jsondata);
                // ko.applyBindings(self, document.getElementById("mpc-treeview"));

                if (isselectrootnode && jsondata && jsondata.length > 0) {
                    self.selectionchanged($("#" + self.treeviewname + jsondata[0].id())[0]);
                }
            }

            if (treeviewuicallback != null)
                treeviewuicallback(jsondata);

            raiseNodesLoaded(jsondata);
        }
        self.IsNodeExpanded = function (nodeTocheck) {
            var context = ko.contextFor(nodeTocheck);
            var immediateParent = $(nodeTocheck).parent("li");
            var isdataexpanded = context.$data.isexpanded();//$(immediateParent).attr("data-expanded");
            if (isdataexpanded == null || isdataexpanded == undefined)
                isdataexpanded = false;
            return isdataexpanded;
        }
        self.addtreenode = function (newtreenodeModel) {
            var parentElement = this.selectednode.uielement;
            var context = ko.contextFor(parentElement);
            var parentnodeData = context.$data;
            var currentIndex = parentnodeData.index();
            newtreenodeModel.index(currentIndex + 1);
            newtreenodeModel.parentNode = parentnodeData;
            parentnodeData.children.push(newtreenodeModel);
            var parentId = parentnodeData.id();
            var index = parentnodeData.index();
            var type = parentnodeData.type();
            parentnodeData.haschild(true);
            if (newtreenodeModel.nodeobject && newtreenodeModel.nodeobject.EntityType &&
                newtreenodeModel.nodeobject.EntityType.toLowerCase() == EntityType.CUSTOMER.toLowerCase() || newtreenodeModel.nodeobject.EntityType.toLowerCase() == EntityType.DEALER.toLowerCase()) {
                newtreenodeModel.haschild(true);
            }
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
                self.expandNode(parentElement, null, newtreenodeModel);
            }
            else {
                self.makeselection(currentUIElement);
            }
            var $treeel = $("#" + self.treeviewname);
            var $treeParent = $treeel.parent("div").parent("div");
            self.isScrolledIntoView($treeParent[0], currentUIElement);

            if (eventlistners.containskey(localevents.OnNodeAdded)) {
                eventlistners.get(localevents.onNodeAddedd)({ data: newtreenodeModel });
            }
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
        self.scrollToSelectedItem = function (container, element) {
            if (element == null || element == undefined)
                return;            
            container.animate({
                scrollTop: $(element).offset().top - container.offset().top + container.scrollTop()
            }, 1000);
           
        }
        self.nodeclicked = function (data, event) {
            self.selectionchanged(event.currentTarget);
        }
        self.makeselection = function (uielement) {
            try {
                var context = ko.contextFor(uielement);
                context.$root.selectionchanged(uielement);
            } catch (e) {
                console.error(e.message);
            }
        }
        self.RemoveSalvonodeitem = function (newtreenodemodel) {
            var divId = "#" + newtreenodemodel.$data.divId();
            var treeli = $(divId).parent("LI");
            var Ulele = $(treeli).parent("Ul");
            var UlId = $(Ulele).attr("id");
            var context = ko.contextFor(document.getElementById(UlId));
            var treemodelarr = context.$root.dataSource();
            treemodelarr.splice($.inArray(newtreenodemodel.$data, treemodelarr), $.inArray(newtreenodemodel.$data, treemodelarr) >= 0 ? 1 : 0);
            $(divId).parent("LI").remove();
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
    function AddAlreadyExpandedChildren(treeviewname, hashtable, childUiElement) {
        var maxwidth = 0;
        $(childUiElement).children("li").each(function () {
            var context = ko.contextFor($(this).find(".expand")[0]);
            var nodedata = context.$data;

            //this is to make sure, if some filters are removed like door association is removed in camera,
            //when the tree is already expanded and in collapsed state, where we need to remove the filter(strikken style) -VV
            if (!filteredNodes.contains(treeviewname + nodedata.id().toLowerCase()))
                nodedata.filter(false);

            var isdataexpanded = nodedata.isexpanded();//$(this).attr("data-expanded");
            var width = nodedata.width();
            if (width != null && width != undefined && width > maxwidth)
                maxwidth = width;
            if (isdataexpanded != undefined && isdataexpanded) {
                hashtable.save(nodedata.modelid(), nodedata);
                if (nodedata.haschild()) {
                    var groupElement = $(this).children(".expandul").children("Ul");
                    var tempwidth = AddAlreadyExpandedChildren(treeviewname, hashtable, groupElement);
                    if (tempwidth > maxwidth)
                        maxwidth = tempwidth;
                }
            }
        });
        return maxwidth;
    }
    //function IncreaseTreeWidth(treeviewname, modelid, newwidth, hashtable, parentUielement) {
    //    var temphashtable = new libhash();
    //    temphashtable.save(modelid, new TreeNodeModel(treeviewname));
    //    var maxwidth = GetMaxWidth(temphashtable, hashtable);
    //    if (newwidth > maxwidth) {
    //        var parentwidth = $(parentUielement).width();
    //        if (newwidth > parentwidth)
    //            $(parentUielement).width(newwidth);
    //    }
    //}
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
    function wireupeventsforTreeview(treeviewname) {
        $("#" + treeviewname).delegate("i[data-refreshstatus = 'refreshId']", "click", function () {
            var context = ko.contextFor($(this).parent(".expand")[0]);
            var serviceModel = context.$root.servicemodel();
            var deviceid = context.$data.id();
            if (context.$root.options.showrefreshstatustypes && context.$root.options.showrefreshstatustypes.length > 0) {
                if (_.contains(context.$root.options.showrefreshstatustypes, context.$data.type().toLowerCase())) {
                    if (context.$data.type().toLowerCase() == EntityType.RECORDER.toLowerCase()) {
                        RecorderArr = [];
                        if (context.$data.children() && context.$data.children().length > 0) {
                            for (var i = 0; i < context.$data.children().length; i++) {
                                var camera = context.$data.children()[i];
                                if (camera.type().toLowerCase() == EntityType.CAMERA.toLowerCase()) {
                                    var result = jQuery.inArray(camera.statusqueryId(), RecorderArr)
                                    if (result == -1) {
                                        RecorderArr.push(camera.statusqueryId());
                                    }
                                }
                            }
                        }
                        getCameraStatus(treeviewname, serviceModel, RecorderArr, true);
                    }
                    else if (context.$data.type().toLowerCase() == EntityType.SITE.toLowerCase()) {
                        RecorderArr = [];
                        if (context.$data.children() && context.$data.children().length > 0) {
                            for (var i = 0; i < context.$data.children().length; i++) {
                                var camera = context.$data.children()[i];
                                if (camera.type().toLowerCase() == EntityType.CAMERA.toLowerCase()) {
                                    var result = jQuery.inArray(camera.statusqueryId(), RecorderArr)
                                    if (result == -1) {
                                        RecorderArr.push(camera.statusqueryId());
                                    }
                                }
                            }
                        }
                        getCameraStatus(treeviewname, serviceModel, RecorderArr, false);
                    }
                    else if (context.$data.type().toLowerCase() == EntityType.PANEL.toLowerCase())
                        getPanelStatus(treeviewname, serviceModel, deviceid);
                }
            }
        });
        $("#" + treeviewname).delegate("i[data-delete= 'deleteId']", "click", function () {
            var context = ko.contextFor($(this).parent(".expand")[0]);
            var serviceModel = context.$root.servicemodel();
            if (serviceModel.deletenodeurl() && serviceModel.deletenodeurl() != "") {
                var url = serviceModel.deletenodeurl() + "?entitytype=" + context.$data.type() + "&id=" + context.$data.id();
                $.publish(serviceModel.events.onitemselfdeleted, context);
            }
        });
        $("#" + treeviewname).delegate("i[name='nodeicon'],.tree-label,.expand", "click", function (event) {
            if (event.target !== this)
                return true;
            var expand = $(this).parent()[0];
            var context = ko.contextFor(expand);
            if (context.$root.IsNodeExpanded(expand) == "0") {
                context.$root.expandNode(expand);
            }
            else {
                context.$root.collapseNode(expand);
            }
            //// Stop bubbling event to parent (expand div)
            if (context.$root.IsEditMode())
                event.stopPropagation();
        });
        $("#" + treeviewname).delegate(".expand", "mouseover", function () {
            var context = ko.contextFor(this);
            var expand = this;
            if (context.$root.isselecteditem(expand)) {
                $(expand).addClass("Item-State-hover");
                updatetreenodehovericon(context.$data);
            }
            makeelementdraggable(expand);
        });

        function makeelementdraggable(element) {
            $(element).draggable({
                cursor: "pointer",
                cursorAt: { top: -5, left: -5 },
                helper: function (event) {
                    var ctx = ko.contextFor(event.currentTarget);

                    return $("<div>" + "<p class='" + ctx.$data.statusclass() + "'></p><p>" + ctx.$data.name() + "</p></div>").css({ background: '#f5f5f5', padding: '8px' });
                },
                appendTo: 'body',
                revert: function (validdrop) {
                    var context = ko.contextFor(this.context);
                    var trvNodeModel = context.$data;
                    var drg = trvNodeModel.draggable();
                    if (drg == "false") {
                        return true;
                    }
                },
                scroll: false,
                start: function (e, ui) {
                    $(ui.helper).css('z-index', '9999999999999');
                }
            });
            $(element).draggable({ containment: "window" });
        }
        $("#" + treeviewname).delegate(".expand", "mouseleave", function () {
            var expand = this;
            var context = ko.contextFor(expand);
            if (context.$root.isselecteditem(expand)) {
                $(expand).removeClass("Item-State-hover");
                //update node icon
                updatetreenodeicon(context.$data);
            }
        });
        $("#" + treeviewname).delegate(".expand", "click", function () {
            var context = ko.contextFor(this);
            context.$root.selectionchanged(this);

            //$(".expand").draggable({
            //    cursor: "pointer",
            //    cursorAt: { top: -5, left: -5 },
            //    helper: function (event) {
            //        var ctx = ko.contextFor(event.currentTarget);

            //        return $("<div>" + ctx.$data.name() + "</div>").css({ background: 'red', border: '1px solid green' });
            //        //var _div = document.createElement('div');
            //        //var _text = document.createTextNode('i am here');
            //        //_div.appendChild(_text);
            //        //_div.style.height = '30px';
            //        //_div.style.width = '88px';
            //        //_div.style.backgroundColor = 'yellow';
            //        //return _div;
            //    },
            //    appendTo: 'body',
            //    revert: function (validdrop) {
            //        var context = ko.contextFor(this.context);
            //        var trvNodeModel = context.$data;
            //        var drg = trvNodeModel.draggable();
            //        if (drg == "false") {
            //            return true;
            //        }
            //    },
            //    start: function (e, ui) {
            //        $(ui.helper).css('z-index', '9999999999999');
            //    }
            //});
        });
    }
    ; (function ($, window, document, undefined) {
        var pluginName = 'treeview',
           defaults = {
               servicemodel: null,
               onNodeselected: null,
               onNodechecked: null,
               onNoderemoved: null,
               onNodeadded: null,
               onNodesLoaded: null
           };

        function initialisefilter(treeviewname, filters) {
            filteredNodes = new libhash();
            if (filters != undefined) {
                for (var i = 0; i < filters.length; i++) {
                    var filter = filters[i];
                    if (!filteredNodes.contains(treeviewname + filter.Id().toLowerCase()))
                        filteredNodes.save(treeviewname + filter.Id().toLowerCase(), filter);
                }
            }
        }
        function Plugin(element, options) {
            this.element = element;
            this.options = $.extend({}, defaults, options);
            this._defaults = defaults;
            this._name = pluginName;
            this.OnNodesLoaded = null;
            this.OnSelectionChanged = null;
            this.OnNodeChecked = null;
            this.OnNodeUnChecked = null;
            this.OnNodeAdded = null;
            this.OnNodeRemoved = null;
            this.treeviewname = guid();
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
                treeviewcontainer = uiElement;
                initialisefilter(this.treeviewname, servicemodelobj.filters);
                var mpcTreeviewWidget = window.getTreeViewTemplate(this.treeviewname);
                $(uiElement).html(mpcTreeviewWidget);

                wireupeventsforTreeview(this.treeviewname);
                var tViewmodel = new treeviewModel(this.options, this.treeviewname);
                ko.applyBindings(tViewmodel, $(uiElement)[0]);
                tUtils = new treeviewUtils("#" + this.treeviewname);
                //var context = ko.contextFor($(uiElement)[0]);
                tViewmodel.servicemodel(servicemodelobj);
                associateEventhandlers(tViewmodel, this.options);
                tViewmodel.init(this.element);
                if (this.options.mode && this.options.mode == DATASOURCEMODES.LAZYLOADING)
                    tViewmodel.initializecontrol(this.element, function (data) {
                    });

            }
            catch (e) {
                console.log(e.message);
            }
        };
        function associateEventhandlers(mainViewmodel, options) {
            if (options.OnSelectionChanged != undefined)
                mainViewmodel.addeventlistners(localevents.onNodeSelected, options.OnSelectionChanged);
            if (options.OnNodesLoaded != undefined)
                mainViewmodel.addeventlistners(localevents.onNodesLoaded, options.OnNodesLoaded);
            if (options.OnNodeChecked != undefined)
                mainViewmodel.addeventlistners(localevents.onNodeChecked, options.OnNodeChecked);
            if (options.OnNodeUnChecked != undefined)
                mainViewmodel.addeventlistners(localevents.onNodeUnChecked, options.OnNodeUnChecked);
            if (options.OnNodeAdded != undefined)
                mainViewmodel.addeventlistners(localevents.onNodeAddedd, options.OnNodeAdded);
            if (options.OnNodeRemoved != undefined)
                mainViewmodel.addeventlistners(localevents.onNodeRemoved, options.OnNodeRemoved);
        }
        Plugin.prototype.AddTreeNode = function (newnodedata) {
            try {
                var treeViewEle = $("#" + this.treeviewname)[0];
                var context = ko.contextFor(treeViewEle);
                var trvModel = context.$data;
                var newTreenodemodel = new TreeNodeModel(this.treeviewname);
                if ("EntityType" in newnodedata && "Name" in newnodedata && "Id" in newnodedata && "ParentId" in newnodedata && "UniqueId" in newnodedata) {
                    newTreenodemodel.Initialize(newnodedata.Name, newnodedata.Id, newnodedata.UniqueId, false, "", newnodedata.EntityType, newnodedata.ParentId);
                    newTreenodemodel.nodeobject = newnodedata;
                    //update node icon
                    updatetreenodeicon(newTreenodemodel);
                    newTreenodemodel.isdirty(true);
                    trvModel.addtreenode(newTreenodemodel);
                }
                else {
                }
            } catch (e) {
                console.error(e.message);
            }
        }
        Plugin.prototype.UpdateTreeNode = function (updateNodedata) {
            try {
                var treeViewEle = $("#" + this.treeviewname)[0];
                var context = ko.contextFor(treeViewEle);
                var trvModel = context.$data;
                trvModel.selectednode.dataobject.update(updateNodedata);
            }
            catch (e) {
            }
        };
        Plugin.prototype.FilterTreeNode = function (node) {
            try {
                //data-filterkey
                var uitreenode = $("div[data-filterkey='" + this.treeviewname + node.Id() + "']")[0];
                if (uitreenode) {
                    var context = ko.contextFor(uitreenode);
                    var trvNodeModel = context.$data;
                    trvNodeModel.filter(true);
                }
                if (!filteredNodes.contains(this.treeviewname + node.Id().toLowerCase()))
                    filteredNodes.save(this.treeviewname + node.Id().toLowerCase(), node);
            }
            catch (e) {
            }
        };
        Plugin.prototype.RemoveFilterForTreeNode = function (node) {
            try {
                var uitreenode = $("div[data-filterkey='" + this.treeviewname + node.Id() + "']")[0];
                if (uitreenode) {
                    var context = ko.contextFor(uitreenode);
                    var trvNodeModel = context.$data;
                    trvNodeModel.filter(false);
                }
                if (filteredNodes.contains(this.treeviewname + node.Id().toLowerCase()))
                    filteredNodes.remove(this.treeviewname + node.Id().toLowerCase());
            }
            catch (e) {
            }
        };
        Plugin.prototype.EnableCheckbox = function (canEnable) {
            var treeViewEle = $("#" + this.treeviewname)[0];
            var context = ko.contextFor(treeViewEle);
            context.$root.IsEditMode(canEnable);
        }
        Plugin.prototype.GetCheckedItems = function () {
            var treeViewEle = $("#" + this.treeviewname)[0];
            var context = ko.contextFor(treeViewEle);
            return context.$root.checkednodes.values();
        }

        Plugin.prototype.SalvoLoadDataSource = function (Salvoentity, callback) {
            var fullDatasource = ([]);
            fullDatasource.push(Salvoentity);
            var treemodelcontext = ko.contextFor(document.getElementById(this.treeviewname));
            var index = treemodelcontext.$data.dataSource().length;
            var rootnodes = convertToSalvotreenodeModel(this.treeviewname, fullDatasource, this.options.servicemodel, index, treemodelcontext.$data.dataSource(), false);
            tUtils.bindingcontext.$root.loaddatasource(rootnodes, callback);
        }
        Plugin.prototype.LoadDataSource = function (fullDatasource, callback) {
            var rootnodes = convertTotreenodeModel(this.treeviewname, fullDatasource, this.options.servicemodel);
            tUtils.bindingcontext.$root.loaddatasource(rootnodes, callback);
        }
        Plugin.prototype.CheckthisNodes = function (nodeIds,callback) {
            for (var n = 0; n < nodeIds.length; n++) {
                var checkboxelement = document.getElementById(this.treeviewname + nodeIds[n]);
                var bContext = ko.contextFor(checkboxelement);
                if (bContext) {
                    bContext.$data.IsChecked(true);
                    bContext.$data.SetCheckState();
                    //UpdateCheckedStyle(checkboxelement, bContext.$data, bContext);
                }
            }
            if (callback)
                callback();
        }
        Plugin.prototype.cachePreviousNodeIds = function (nodeIds) {
            var treeViewEle = $("#" + this.treeviewname)[0];
            var context = ko.contextFor(treeViewEle);
            for (var i = 0; i < nodeIds.length; i++)
                context.$root.previousSelectednodeIds.push(nodeIds[i]);
        }
        Plugin.prototype.GetPreviousNodeIds = function () {
            var treeViewEle = $("#" + this.treeviewname)[0];
            var context = ko.contextFor(treeViewEle);
            return context.$root.previousSelectednodeIds;
        }
        Plugin.prototype.UncheckThisNodes = function (nodeIds, callback) {
            for (var n = 0; n < nodeIds.length; n++) {
                //var nRef = $('div[data-uid=' + nodeIds[n] + ']')[0];
                var bContext = ko.contextFor(document.getElementById(this.treeviewname + nodeIds[n]));
                if (bContext) {
                    bContext.$data.IsChecked(false);
                    bContext.$data.SetCheckState();
                    //UpdateCheckedStyle(checkboxelement, bContext.$data, bContext);
                }
            }
            if (callback)
                callback();
        }
        Plugin.prototype.SearchItems = function (searchNode) {
            console.log('search:Start:base');
            var idToSearch = searchNode.Id, hint = searchNode.location;
            var rootNode;
            var treeViewEle = $("#" + this.treeviewname)[0];
            var base = ko.contextFor(treeViewEle);
            rootNode = base.$root.dataSource()[0];
            if (!isSelected(this.treeviewname, base.$data.dataSource(), rootNode.id(), idToSearch)) {
                var locOfSearchId = hint.indexOf(idToSearch);
                if (locOfSearchId > 0)
                    hint = hint.substring(0, locOfSearchId - 1);
                searcinChildren(this.treeviewname, idToSearch, hint, false, searchNode.EntityType);
            }
        }
        Plugin.prototype.SelectTreeNode = function (selectid) {
            try {
                var treeViewEle = $("#" + this.treeviewname)[0];
                var context = ko.contextFor(treeViewEle);
                var trvModel = context.$data;
                return trvModel.selectionchanged($("#" + this.treeviewname + selectid)[0]);
            } catch (e) {
                console.error(e.message);
                return null;
            }
        }
        Plugin.prototype.UnSelectTreeNode = function () {
            try {
                var treeViewEle = $("#" + this.treeviewname)[0];
                var context = ko.contextFor(treeViewEle);
                var trvModel = context.$data;
                trvModel.unselectnode();
            } catch (e) {
                console.error(e.message);
            }
        }

        function searcinChildren(treeviewname, idToSearch, hint, bForceRefresh, searchEntityType) {
            console.log('search:searcinChildren:start');
            console.log('search:idToSearch:' + idToSearch + "hint:" + hint);
            var idToexpand = hint.indexOf("#") > 0 ? hint.substring(0, hint.indexOf("#")) : hint;
            console.log('search:idToexpand:' + idToexpand);
            var nodeEle = $("#" + treeviewname + idToexpand)[0];
            var baseContext = ko.contextFor(nodeEle);
            var childItmes = baseContext.$data.children();
            if (!isSelected(treeviewname, baseContext.$data.children(), idToexpand, idToSearch, true)) {
                var isExpanded = baseContext.$root.IsNodeExpanded(nodeEle);
                console.log('search:isExpanded?:' + isExpanded);
                if (isExpanded) {
                    console.log('search:calling expandNode?:' + idToexpand);
                    baseContext.$root.expandNode(nodeEle,
                   function (retEle) {
                       console.log('search:expanded Node?:' + retEle.id);
                       var nodeEle = $("#" + retEle.id)[0];
                       var baseContext = ko.contextFor(nodeEle);
                       if (!isSelected(treeviewname, baseContext.$data.children(), idToexpand, idToSearch, true)) {
                           searcinChildren(treeviewname, idToSearch, hint.replace(idToexpand + "#", ""), true, searchEntityType);
                       }
                   }, null, true);
                }
                else {
                    console.log('search:calling expandNode?:' + idToexpand);
                    baseContext.$root.expandNode(nodeEle,
                   function (retEle) {
                       console.log('search:expanded Node?:' + retEle.id);
                       var nodeEle = $("#" + retEle.id)[0];
                       var baseContext = ko.contextFor(nodeEle);
                       if (!isSelected(treeviewname, baseContext.$data.children(), idToexpand, idToSearch, true)) {
                           if (hint.toLowerCase() != idToexpand.toLowerCase())
                               searcinChildren(treeviewname, idToSearch, hint.replace(idToexpand + "#", ""), true, searchEntityType);
                           else
                               searchlogicalentities(baseContext, treeviewname, idToSearch, hint, searchEntityType);
                       }
                   }, null, false);

                }
            }
            else {
                //Not expanded and expand
                console.log('search:calling expandNode?:' + idToexpand);
                baseContext.$root.expandNode(nodeEle,
                    function (retEle) {
                        console.log('search:expanded Node?:' + retEle.id);
                        var nodeEle = $("#" + retEle.id)[0];
                        var baseContext = ko.contextFor(nodeEle);
                        if (!isSelected(treeviewname, baseContext.$data.children(), idToexpand, idToSearch, true)) {
                            searcinChildren(treeviewname, idToSearch, hint.replace(idToexpand + "#", ""), true, searchEntityType);
                        }
                    }, null, bForceRefresh);
            }
        }
        function isSelected(treeviewname, items, idToexpand, idToSearch, isautoscroll) {
            var nodeEle = $("#" + treeviewname + idToexpand)[0];
            var baseContext = ko.contextFor(nodeEle);
            if (items.length > 0) {
                var found = _.find(items, function (cItem) {
                    return cItem.id() == idToSearch;
                });
                //for readers,we need Physical Id to search
                if (!found) {
                    found = _.find(items, function (cItem) {
                        return cItem.physicalId == idToSearch;
                    });
                }
                if (found) {
                    var selectEle = $("#" + treeviewname + found.id())[0];
                    baseContext.$root.makeselection(selectEle);
                    if (isautoscroll) {
                        var container = $('#acttreeview ul.layoutrow');
                        var rootelement = $("#" + treeviewname)[0];
                        var rootContext = ko.contextFor(rootelement);
                        rootContext.$root.scrollToSelectedItem(container, selectEle);
                    }
                    console.log('search:Found:' + idToSearch + " in children of:" + idToexpand);
                    return true;
                }
            }
            console.log('search:Not Found:' + idToSearch + " in children of:" + idToexpand);
            return false;
        }


        function searchlogicalentities(baseContext, treeviewname, idToSearch, hint, searchEntityType) {
            //if (baseContext.$data.type() == "PANEL") {
            var idToexpand, nodeEle, hintChild, childContext, baseItems;
            var id = "";
            baseItems = baseContext.$data.children();
            idToexpand = hint.indexOf("#") > 0 ? hint.substring(0, hint.indexOf("#")) : hint;
            if (!isSelected(treeviewname, baseItems, idToexpand, idToSearch, true)) {
                /*for (var i = 0; i < baseItems.length; i++) {
                    hint = baseContext.$data.children()[i].id();
                    expandAndSearch(baseContext, treeviewname, idToSearch, hint);
                }*/
                for (var i = 0; i < baseItems.length; i++) {
                    id = id + baseContext.$data.children()[i].id() + "#";
                }
                hint = id.substr(0, (id.length - 1));
                searchNodeFound = false;
                expandAndSearch(baseContext, treeviewname, idToSearch, hint);
            }
        }

        function expandAndSearch(baseContext, treeviewname, idToSearch, hint) {
            var id = "";
            var idToexpand = hint.indexOf("#") > 0 ? hint.substring(0, hint.indexOf("#")) : hint;
            var nodeEle = $("#" + treeviewname + idToexpand)[0];
            var baseContext = ko.contextFor(nodeEle);
            var childItems, childContext, childnodeEle, childIdToexpand, childId = "", childHint = "";
            if (baseContext.$data.type().toLowerCase() != 'inputpoint' && baseContext.$data.type().toLowerCase() != 'outputpoint' && searchNodeFound == false) {
                baseContext.$root.expandNode(nodeEle,
                    function (retEle) {
                        console.log('search:expanded Node?:' + retEle.id);
                        idToexpand = hint.indexOf("#") > 0 ? hint.substring(0, hint.indexOf("#")) : hint;
                        nodeEle = $("#" + retEle.id)[0];
                        baseContext = ko.contextFor(nodeEle);
                        if (!isSelected(treeviewname, baseContext.$data.children(), idToexpand, idToSearch, true)) {
                            if (hint.toLowerCase() != idToexpand.toLowerCase()) {
                                childItems = baseContext.$data.children();
                                if (childItems.length > 0) {
                                    for (var i = 0; i < childItems.length; i++) {
                                        childId = childId + baseContext.$data.children()[i].id() + "#";
                                        childHint = childId.substr(0, (childId.length - 1));
                                        childIdToexpand = childHint.indexOf("#") > 0 ? childHint.substring(0, childHint.indexOf("#")) : childHint;
                                        childnodeEle = $("#" + treeviewname + childIdToexpand)[0];
                                        childContext = ko.contextFor(childnodeEle);
                                        if (!searchNodeFound)
                                            expandAndSearch(childContext, treeviewname, idToSearch, childHint);
                                    }

                                }
                                if (!searchNodeFound)
                                    expandAndSearch(baseContext, treeviewname, idToSearch, hint.replace(idToexpand + "#", ""));
                            }
                            /*childItems = baseContext.$data.children();
                            for (var i = 0; i < childItems.length; i++) {
                                childHint = baseContext.$data.children()[i].id();
                                childIdToexpand = childHint.indexOf("#") > 0 ? childHint.substring(0, childHint.indexOf("#")) : childHint;
                                childnodeEle = $("#" + treeviewname + childIdToexpand)[0];
                                childContext = ko.contextFor(childnodeEle);
                                expandAndSearch(childContext, treeviewname, idToSearch, childHint);
                            }*/
                        }
                        else
                            searchNodeFound = true;
                    }, null, false);
            }
        }


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
    })($, window, document);

})($);