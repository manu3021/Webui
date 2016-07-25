window.mapconfig.mapcontext = (function ($, datacontext, common) {
    window.mapconfig.infowindow = null;
    var events = {
        onaccountsloaded: "onaccountsloaded",
        onaccountselected: "treeviewitemselected",
        accountupdatesuccess: "accountupdatesuccess",
        deleteAccountSuccess: "deleteAccountSuccess",
        showNextNavigation: "showNextNavigation",
        siteMarkerItemClicked: "siteMarkerItemClicked"
    },

  currentAccount = null,
  sitemarkerArray = [],
  customerMarkerArray = [],
   dealerMarkerArray = [],
   clusterMarkerArray = [],
   siteClusterArray = [],
   fullmapSitemarkerArray = [],
   fullmapCustomerMarkerArray = [],
   fullmapDealerMarkerArray = [],
  geocoder = null;
    isMapmode = false;
    isPanelClicked = false;
    iscreateandEdit = false;
    data = null;
    var floorplanitem = function () {
        var self = this;
        self.IsSelected = ko.observable(false);
        self.IsRemoved = ko.observable(false);
        self.Id = ko.observable("");
        self.isdropped = false;
        self.AngleField = ko.observable(0);
        self.BottomRightCoordinatesField = ko.observable("");
        self.Name = ko.observable("");
        self.EntityType = ko.observable("");
        self.HeightField = ko.observable(0);
        self.ItemIdField = ko.observable("");
        self.x = ko.observable("");
        self.y = ko.observable("");
        self.isNew = false;
        self.isVisible = ko.observable(false);
        self.TopLeftCoordinatesField = ko.computed(function () {
            return Math.round(self.x()) + ',' + Math.round(self.y());
        });
        self.WidthField = ko.observable("");
        self.iconvalue = null;
        self.status = ko.observable("");

        self.icon = ko.computed({
            read: function () {
                var retval = "";
                if (self.EntityType().toUpperCase() == "DOOR") {

                    if (self.status() != null && self.status() != "") {
                        if (self.status()[0].toLowerCase() == "alarm" && self.status()[1].toLowerCase() == "locked" && self.status()[2].toLowerCase() == "unblocked") {
                            retval = "icon_door_status_alarm";
                        }
                        else if (self.status()[0].toLowerCase() == "alarm" && self.status()[1].toLowerCase() == "unlocked" && self.status()[2].toLowerCase() == "access blocked") {
                            retval = "icon_door_status_alarm";
                        }
                        else if (self.status()[0].toLowerCase() == "alarm" && self.status()[1].toLowerCase() == "unlocked" && self.status()[2].toLowerCase() == "unblocked") {
                            retval = "icon_door_status_alarm";
                        }
                        else if (self.status()[0].toLowerCase() == "alarm" && self.status()[1].toLowerCase() == "locked" && self.status()[2].toLowerCase() == "access blocked") {
                            retval = "icon_door_status_alarm";
                        }
                        else if (self.status()[0].toLowerCase() == "ajar" && self.status()[1].toLowerCase() == "locked" && self.status()[2].toLowerCase() == "unblocked") {
                            retval = "icon_door_status_alarm";
                        }
                        else if (self.status()[0].toLowerCase() == "ajar" && self.status()[1].toLowerCase() == "unlocked" && self.status()[2].toLowerCase() == "access blocked") {
                            retval = "icon_door_status_alarm";
                        }
                        else if (self.status()[0].toLowerCase() == "ajar" && self.status()[1].toLowerCase() == "unlocked" && self.status()[2].toLowerCase() == "unblocked") {
                            retval = "icon_door_status_alarm";
                        }
                        else if (self.status()[0].toLowerCase() == "ajar" && self.status()[1].toLowerCase() == "locked" && self.status()[2].toLowerCase() == "access blocked") {
                            retval = "icon_door_status_alarm";
                        }
                        else if (self.status()[0].toLowerCase() == "normal" && self.status()[1].toLowerCase() == "locked" && self.status()[2].toLowerCase() == "unblocked") {
                            retval = "icon_door_status_normal";
                        }
                        else if (self.status()[0].toLowerCase() == "normal" && self.status()[1].toLowerCase() == "unlocked" && self.status()[2].toLowerCase() == "access blocked") {
                            retval = "icon_door_status_normal";
                        }
                        else if (self.status()[0].toLowerCase() == "normal" && self.status()[1].toLowerCase() == "locked" && self.status()[2].toLowerCase() == "access blocked") {
                            retval = "icon_door_status_normal";
                        }
                        else if (self.status()[0].toLowerCase() == "normal" && self.status()[1].toLowerCase() == "unlocked" && self.status()[2].toLowerCase() == "unblocked") {
                            retval = "icon_door_status_normal";
                        }
                    }
                    else {
                        retval = "icon_door_normal";
                    }
                }
                else if (self.EntityType().toUpperCase() == "CAMERA") {
                    if (self.status() != null && self.status() != "") {

                        switch (self.status()[0].toLowerCase()) {
                            case "videook":
                                retval = "icon_camera_videook";
                                break;
                            case "videonotok":
                                retval = "icon_camera_videonotok";
                                break;
                            case "online":
                                retval = "icon_camera_videook";
                                break;
                            case "offline":
                                retval = "icon_camera_disable";
                                break;
                            case "videookmismatch":
                                retval = "icon_camera_videookmismatch";
                                break;
                            case "videonotokmismatch":
                                retval = "icon_camera_videonotokmismatch";
                                break;
                            case "recordedon":
                                retval = "icon_camera_recordedon";
                                break;
                            default:
                                retval = "icon_camera_normal";
                                break;
                        }
                    }
                    else {
                        retval = "icon_camera_normal";
                    }

                }
                return retval;
            },
            write: function (iconValue) {
                var retval = "";
                if (self.EntityType().toUpperCase() == "DOOR") {
                    retval = "icon_door_normal";
                }
                else if (self.EntityType().toUpperCase() == "CAMERA") {
                    retval = "icon_camera_normal";
                }
                return retval;
            }
        });

        self.top = ko.computed(function () {
            if (self.y()) {
                if (iscreateandEdit) {
                    return self.y() + "px";
                }
                else {
                    return (Number(self.y()) + 50).toString() + "px";

                }
            }
        });

        self.left = ko.computed(function () {
            if (self.x()) {
                return self.x() + "px";
            }
        });
        self.initialize = function (data) {
            self.Id(data.Id);
            self.AngleField(data.AngleField);
            self.BottomRightCoordinatesField(data.BottomRightCoordinatesField);
            self.Name(data.Name);
            self.status(data.StatusArray);
            self.EntityType(data.EntityType);
            self.HeightField(data.HeightField);
            self.ItemIdField(data.ItemIdField);
            self.WidthField(data.WidthField);
            var vals = data.TopLeftCoordinatesField.split(',');
            self.x(vals[0]);
            self.y(vals[1]);
            self.source = "";
            self.isNew = data.IsNew;
            self.isdropped = true;

            return self;
        }
        self.setposition = function (offx, offy) {
            if (offx)
                self.x(offx);
            else
                self.x(0);
            if (offy)
                self.y(offy);
            else
                self.y(0);
        }
        self.itemdragged = ko.computed({
            read: function () {
                return ""
            },
            write: function (value) {
                var newloc = $(value.helper[0]).position();
                self.setposition(newloc.left, newloc.top);
            },
            owner: this

        });
        self.visibleComputed = ko.computed(function () {
            if (self.IsRemoved())
                return false;
            return true;
        });
        self.eventSummaryList = ko.observableArray([]);
        self.fulladdress = ko.observable('');
        self.contactnumber = ko.observable('');
        self.lockdevice = function (data, evt) {
            window.mapconfig.datacontext.performaction(self.Id(), "devicegrouptemplate", "lock", function (response) {
                if (response.Success)
                    alertify.success(Resources.MapPlugin_ActionSuccess);
                else
                    alertify.error(Resources.MapPlugin_ActionFailed);
            }, function (response) {
                alertify.error(Resources.MapPlugin_ActionFailed);
            });
        }

        self.unlockdevice = function (data, evt) {
            window.mapconfig.datacontext.performaction(self.Id(), "devicegrouptemplate", "unlock", function (response) {
                if (response.Success)
                    alertify.success(Resources.MapPlugin_ActionSuccess);
                else
                    alertify.error(Resources.MapPlugin_ActionFailed);
            }, function (response) {
                alertify.error(Resources.MapPlugin_ActionFailed);
            });
        }
        self.energizeDevice = function (data, evt) {
            window.mapconfig.datacontext.performaction(self.Id(), "devicegrouptemplate", "energize", function (response) {
                if (response.Success)
                    alertify.success(Resources.MapPlugin_ActionSuccess);
                else
                    alertify.error(Resources.MapPlugin_ActionFailed);
            }, function (response) {
                alertify.error(Resources.MapPlugin_ActionFailed);
            });
        }
        self.deenergizeDevice = function (data, evt) {
            window.mapconfig.datacontext.performaction(self.Id(), "devicegrouptemplate", "deenergize", function (response) {
                if (response.Success)
                    alertify.success(Resources.MapPlugin_ActionSuccess);
                else
                    alertify.error(Resources.MapPlugin_ActionFailed);
            }, function (response) {
                alertify.error(Resources.MapPlugin_ActionFailed);
            });
        }
        self.Initpopoverdata = function (Id, faddress, contact) {
            self.Id(Id);
            self.fulladdress(faddress);
            self.contactnumber(contact);
        }
    }

    var floorplanModel = function () {
        data = {};
        data.Items = {};
        var self = this;
        self.objdata = [];;
        self.Id = "",
        self.Name = "",
        self.Description = "",
        self.AccountId = "",
        self.IsDefault = false,
        self.IsError = ko.observable(false);
        self.Items = ko.observableArray([]);
        self.currentselecteditem = null;
        self.ErrorMessage = ko.observable();
        //self.Isnew = ko.observable(false);
        self.IsMapModified = ko.observable(false);
        self.AccountData = null;
        self.reset = function () {
            self.objdata = [];
            self.Id = "";
            self.Name = "";
            self.Description = "";
            self.AccountId = "";
            self.IsDefault = false;
            self.IsError(false);
            self.Items([]);
            self.currentselecteditem = null;
            self.ErrorMessage("");
            //self.Isnew(false);
            self.IsMapModified(false);
            self.AccountData = null;
        }
        self.Initilialize = function (data) {
            data = data || {};
            data.Items = data.Items || {};
            self.AccountData = data.AccountData;
            self.Id = data.Id;
            self.Name = data.Name;
            self.Description = data.Description;
            self.AccountId = data.AccountId;
            self.Items($.map(data.Items, function (uItem) { self.objdata.push(uItem.Id); return new floorplanitem().initialize(uItem); }) || []);
            self.IsDefault = data.IsDefault;
        }
        self.itemselected = function (data, event) {
            event.stopPropagation();
            $('.floormapitem').removeClass('floormapitemSelected');
            $('.floormapiconcaption').removeClass('floormapitemSelected');
            $(event.currentTarget).addClass('floormapitemSelected');
            $(event.currentTarget).find('.floormapiconcaption').addClass('floormapitemSelected');
            if (self.currentselecteditem == null || self.currentselecteditem == undefined) {
                self.currentselecteditem = data;
            }
            else {

                self.currentselecteditem.IsSelected(false);
                self.currentselecteditem = data;
            }
            self.currentselecteditem.IsSelected(true);
            window.mapconfig.datacontext.onflooritemselected(self.currentselecteditem, event);
            console.log(data);
        }
        self.getfloorItem = function (name, icon, type, event) {
            var item = new floorplanitem();
            item.EntityType(type);
            item.Name(name);
            item.setposition(event.offsetX, event.offsetY);
            item.icon(icon);
            item.isNew = true;
            self.isdropped = true;
            return item;
        }
        $("#floorcontainercanvas").droppable({
            drop: function (event, value) {
                var dragBCotext = ko.contextFor(value.draggable[0]);
                var nodeData = dragBCotext.$data;
                if (nodeData.isdropped == undefined || nodeData.isdropped == null) {
                    if (self.isSupportedType(nodeData.type())) {
                        if (!self.isSameSite(nodeData)) {
                            alertify.alert(Resources.MapPlugin_DropDoorCameraSamesite);
                            return;
                        }
                        var dItem = self.isDuplicate(nodeData.id());
                        if (dItem) {
                            if (dItem.IsRemoved()) {
                                dItem.IsRemoved(false);
                                self.IsMapModified(true);
                            }
                            else {
                                alertify.alert(dItem.Name() + Resources.MapPlugin_AlreadyExists);
                            }
                        }
                        else {
                            if (nodeData.type().toUpperCase() == 'DOOR' || (nodeData.type().toUpperCase() == 'CAMERA' && nodeData.nodeobject && nodeData.nodeobject.IsActive == true)) {
                                var iItem = self.getfloorItem(nodeData.name(), nodeData.icon(), nodeData.type().toLowerCase(), event);
                                iItem.Id(nodeData.id());
                                self.additemtolist(iItem);
                                $(".floormapitem").show();
                                self.IsMapModified(true);
                            }
                            else {
                                alertify.alert(Resources.MapPlugin_EmptyCameraDropped);
                            }
                        }
                    }
                    else {
                        alertify.alert(Resources.MapPlugin_DropDoorCameraOnly);
                    }

                }
                else
                    self.IsMapModified(true);
            }
        });

        self.updateItem = function (selecteddata) {
            self.getfloorItem(selecteddata.name(), selecteddata.icon());
        }
        self.isExist = function (id) {
            var match = ko.utils.arrayFirst(self.Items, function (item) {
                return id === item.id;
            });
            if (match) {
                return true;
            }
            else {
                return false;
            }
        }
        self.isSupportedType = function (type) {
            try {
                var supportedItemTypes1 = ["DOOR", "CAMERA"]
                var match = ko.utils.arrayFirst(supportedItemTypes1, function (stype) {
                    return type.toUpperCase() == stype.toUpperCase();
                });
                if (match) {
                    return true;
                }
                else {
                    return false;
                }
            } catch (e) {
                throw e;
            }
        }
        self.getSiteId = function (node) {
            if (node == undefined) return "";
            if (node.nodeobject && node.nodeobject.EntityType && node.nodeobject.EntityType.toLowerCase() == 'site')
                return node.nodeobject.Id;
            return self.getSiteId(node.parentNode);
        }
        self.isSameSite = function (node) {
            try {
                var droppeditemSiteId = self.getSiteId(node);
                if (self.AccountId != undefined && droppeditemSiteId != undefined && self.AccountId != '' && droppeditemSiteId != '' && $.trim(self.AccountId) != $.trim(droppeditemSiteId)) {
                    return false;
                }
                else {
                    return true;
                }
            } catch (e) {
                return false;
            }
        }
        self.isDuplicate = function (name) {
            try {
                console.log("Duplicate Item dragged");
                var draggedName = name;
                var dragItem = _.find(self.Items(), function (s) {
                    return s.Id() == draggedName;
                });
                return dragItem;
            } catch (e) {
                console.error(e);
            }
        }
        self.selectpreviousItem = function (selectedItem) {
            // TO DO;
        }
        self.additemtolist = function (item) {
            self.Items.push(item);
        }
        self.removeitemfromlist = function (item) {
            self.Items.remove(item);
        }
        self.toJson = function () {
            return ko.toJSON(self);
        }
        self.showMap = function (event, data) {
            window.mapconfig.datacontext.hidepopover();
            if (window.mapmode == 'config') {


                window.mapconfig.mapcontext.SetmapMode(common.mapmode.UNIVERSALMAPMODE, false, true);
                mapresize()

            } else {
                window.mapconfig.mapcontext.SetmapMode(common.mapmode.UNIVERSALMAPMODE, true, false);
                $("#mapheadr").css({ "display": "block", "margin-top": "0px" });
                mapresize(window.mapconfig.fullmap);
            }
        }
        self.refreshfloormap = function (event, data) {
            console.log("Refresh button click ");
            if (window.mapmode != 'config') {
                window.mapconfig.infowindow.isOpen = false;
                window.mapconfig.datacontext.hidepopover();
                var $node = null;
                if (window.mapmode == 'config') {
                    $node = $('#floormap_canvas');
                    $("#floormap_canvas").find('.floormapitem').remove();
                }
                else {
                    $node = $('#floormap_canvas1');
                    $("#floormap_canvas1").find('.floormapitem').remove();
                }
                var context = ko.contextFor($node[0]);
                if (context) {
                    window.mapconfig.mapcontext.showSite(context.$data.siteData, function () {
                        unblockUI();
                        window.mapconfig.mapcontext.SetmapMode(window.mapconfig.common.mapmode.FLOORPLANMODE, true, false);
                    });
                }

            }

        }


        self.dosavesettings = function (event, data) {
            blockUI();
            datacontext.savefloorplan(self, function (successresult) {

                self.objdata = [];

                for (var i = self.Items().length - 1; i >= 0 ; i--) {
                    if (self.Items()[i].IsRemoved() == true) {
                        self.Items.remove(self.Items()[i]);
                    }
                    else {
                        self.Items()[i].isNew = false;
                        self.objdata.push(self.Items()[i].Id());
                    }
                }

                self.IsMapModified(false);
                alertify.success(Resources.map_Success);
                $('.floormapitem').removeClass('floormapitemSelected');
                $('.floormapiconcaption').removeClass('floormapitemSelected');
                unblockUI();
            }, function (errorresult) {

                self.ErrorMessage(Resources.MapPlugin_ErroronServer);
                alertify.error(Resources.MapPlugin_ErroronServer);
                unblockUI();
            });
        }
        self.removeItem = function (data, e) {
            try {
                console.log("remove clicked");
                var fpItemId = $(e.currentTarget).data("id");
                var fpItem = _.find(self.Items(), function (s) {
                    return s.Id() == fpItemId;
                });
                var isOlditem = _.find(self.objdata, function (s) {
                    return s == fpItemId;
                });
                if (fpItem) {
                    if (isOlditem) {
                        fpItem.IsRemoved(true);
                        self.IsMapModified(true);
                    }
                    else {
                        self.Items.remove(fpItem);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
    }
    function setCompatibleZoom(map, level) {
        var markers = map.markers;
        var bounds = new google.maps.LatLngBounds();
        var isboundsextended = false;

        for (i = 0; i < markers.length; i++) {
            if (markers[i].getPosition && markers[i].getMap() != null) {
                bounds.extend(markers[i].getPosition());
                isboundsextended = true;
            }
        }
        if (isboundsextended) {
            map.fitBounds(bounds);
        }
        try {
            window.mpcconfig.realign(null, map);
        } catch (e) {

        }
        if (level)
            map.setZoom(level);
    }
    function GetMarker(curobj, map) {
        if (!map) return;
        map.markers = map.markers || [];
        if (map.markers) {
            var existing = $.map(map.markers, function (val, key) {
                if (val.marker != null && val.Id === curobj.Id) {
                    return val;
                }
            });
            if (existing.length == 1) {
                var retmarker = existing[0];
                retmarker.marker.setMap(map);
                return retmarker;
            }
        }
        var newMarker = new markerObj();
        var markertype = 'richmarker';
        var type = curobj.EntityType ? curobj.EntityType.toLowerCase() : curobj.nodetype ? curobj.nodetype.toLowerCase() : curobj.nodedata ? curobj.nodedata.EntityType.toLowerCase() : '';
        var icon = null;
        switch (type) {
            case 'site': icon = new google.maps.MarkerImage(imagePath, new google.maps.Size(20, 20), new google.maps.Point(40, 130)); break;
            case 'customer': icon = new google.maps.MarkerImage(imagePath, new google.maps.Size(20, 20), new google.maps.Point(70, 550));; break;
            case 'dealer': icon = new google.maps.MarkerImage(imagePath, new google.maps.Size(20, 20), new google.maps.Point(10, 10));; break;
            default: icon = new google.maps.MarkerImage(imagePath, new google.maps.Size(20, 20), new google.maps.Point(10, 10));; break;

        }
        icon.shadow = '';
        newMarker.initialize(curobj.Id, curobj.ParentId,
            curobj.LocationInfo.Lattitude,
            curobj.LocationInfo.Longitude,
            curobj.EntityType,
            curobj.Name, icon, markertype, map, curobj);

        newMarker.setmap(map);
        map.markers.push(newMarker);
        return newMarker;

    }
    function addAllMarkers(selectedAccount, map) {
        try {
            var currentAccount = selectedAccount;
            var dealersonly = currentAccount.Children;

            if (dealersonly.length > 0) {
                for (var i = 0; i < dealersonly.length; i++) {
                    var curobj = null;

                    curobj = dealersonly[i];
                    if (curobj.EntityType.toLowerCase() == "dealer") {
                        var newMarker = GetMarker(curobj, map);


                        var currentMarkerObject = currentAccount.Children[i];
                        currentMarkerObject.nodedata = '';
                        currentMarkerObject.LocationInfo = currentAccount.Children[i].LocationInfo;
                        currentMarkerObject.nodedata = curobj;
                        currentMarkerObject.nodedata.Name = currentAccount.Children[i].Name;
                        newMarker.addEventListner("click", function (e) {
                            showNextNavigation(e.marker, 5, map);
                            $.publish("markerData", e.marker);
                        });
                    }
                    dealerMarkerArray.push(newMarker);
                    if (curobj.EntityType.toLowerCase() == "customer") {
                        var newMarker = GetMarker(curobj, map);


                        var currentMarkerObject = currentAccount.Children[i];
                        currentMarkerObject.nodedata = '';
                        currentMarkerObject.LocationInfo = currentAccount.Children[i].LocationInfo;
                        currentMarkerObject.nodedata = curobj;
                        currentMarkerObject.nodedata.Name = currentAccount.Children[i].Name;
                        newMarker.addEventListner("click", function (e) {
                            showNextNavigation(e.marker, 11, map);
                            $.publish("markerData", e.marker);
                        });
                    }

                    customerMarkerArray.push(newMarker);
                    map.setCenter(new google.maps.LatLng(curobj.LocationInfo.Lattitude, curobj.LocationInfo.Longitude));

                }
            }
            makeCluster(customerMarkerArray, map);
            makeCluster(dealerMarkerArray, map);
        }
        catch (e) {

        }

    };
    function markerObj() {
        var self = this;
        this.id = "",
        this.Id = "",
        this.parentId = "",
        this.marker = null,
        this.Name = "",
        this.name = "",
        this.EntityType = "",
        this.mapObject = "",
        this.addEventListner = function (eventName, callback) {
            if (this.marker) {
                google.maps.event.addListener(this.marker, eventName, function (e) {
                    if (callback)
                        callback({ richmarker: this, marker: self });
                });
            }
        }
    };

    markerObj.prototype.initialize = function (id, parentid, lat, lng, type, name, icon, markertype, mapObject, accdata) {

        if (true) {
            this.id = id;
            this.Id = id;
            this.parentId = parentid;
            this.type = type,
            this.EntityType = type,
            this.Name = name;
            this.name = name;
            //this.mapObject = mapObject;
            this.alermstatusflag = null;
            this.alermstatusStyle = '';
            var Latlng = new google.maps.LatLng(lat, lng);
            if (markertype != undefined || markertype != 0) {
                if (markertype != 'richmarker') {
                    this.marker = new google.maps.Marker({
                        map: mapObject,
                        position: Latlng,
                        icon: icon,
                        title: name,
                        visible: true
                    });
                } else {
                    icon_class = '';
                    if (type.toLowerCase() == "dealer") {
                        markericon_class = 'icon_dealer_map';
                    } else if (type.toLowerCase() == "customer") {
                        markericon_class = 'icon_customer_map';
                    } else if (type.toLowerCase() == "site") {
                        markericon_class = 'icon_site_map';
                    } else if (type.toLowerCase() == "group") {
                        markericon_class = 'icon_group_map';
                    }

                    //if (alermstatusflag==undefined) {
                    //    alermstatusStyle = '';
                    //} else {
                    //    alermstatusStyle = "<span class='alarmstatusindicator'></span>";
                    //}

                    this.marker = new RichMarker({
                        //map: mapObject,
                        position: Latlng,
                        title: name,
                        icon: icon,
                        visible: true,
                        content: '<div class="my-marker" data-accid=' + this.Id + " data-accParentId=" + this.parentId + " data-acctype=" + this.EntityType + "><div class=icon_placeholder><b class=" + markericon_class + "></b></div><div class=infoText>" + name + "</div></div>"
                    });
                    //console.log(this.marker);
                }
                this.marker.accountdata = accdata;
            } else {
                console.log("error in marker initialization");
            }

        }

    }
    markerObj.prototype.getmarker = function () {
        return this.marker;
    }
    markerObj.prototype.setmap = function (map) {
        if (this.marker)
            this.marker.setMap(map);

    }
    function clearallmarkers(markerArray) {
        if (markerArray != undefined && markerArray[0] != undefined) {

            for (var i = 0; i < markerArray.length; i++) {
                if (markerArray[i] != undefined && markerArray[i].id != "")
                    markerArray[i].setmap(null);
            }
        }
        return [];
    }

    function clearcluster(markerArray) {
        if (markerArray != undefined) {
            if (markerArray != undefined && markerArray.length > 0) {
                for (var i = 0; i < markerArray.length; i++) {
                    if (markerArray[i] != undefined)
                        markerArray[i].setMap(null)
                }
                markerArray = [];


            }
        }
        return markerArray;

    }
    function showSite(nodedata, cb) {
        var $node = null;
        console.log('inside show site')


        window.mapmode = window.mapmode || 'config';
        if (window.mapmode == 'config') {
            $node = $('#floormap_canvas');
            var newMarker = GetMarker(nodedata, window.mapconfig.map);
            window.mapconfig.mapcontext.setCompatibleZoom(window.mapconfig.map, 14);
            google.maps.event.addListener(newMarker.marker, 'click', function () {
                iscreateandEdit = true;
                window.mapconfig.mapcontext.SetmapMode(window.mapconfig.common.mapmode.FLOORPLANMODE, false, true);
            });
            window.mapconfig.map.setCenter(new google.maps.LatLng(nodedata.LocationInfo.Lattitude, nodedata.LocationInfo.Longitude));
            sitemarkerArray.push(newMarker);
        }
        else {
            var newMarker = GetMarker(nodedata, window.mapconfig.fullmap);
            $node = $('#floormap_canvas1');
            google.maps.event.addListener(newMarker.marker, 'click', function () {
                // addbreadcrumFromMarker(newMarker.marker);
                window.mapconfig.mapcontext.SetmapMode(window.mapconfig.common.mapmode.FLOORPLANMODE, false, true);
            });
            window.mapconfig.mapcontext.setCompatibleZoom(window.mapconfig.fullmap, 14);

        }

        window.blockUI()
        var AccountId = $('#floorcontainercanvas').attr("AccountId");
        var context = ko.contextFor($node[0]);
        // if (window.mapmode != 'config' || (window.mapmode == 'config' && (context === undefined || (context && context.$data.AccountId != nodedata.Id))))
        // {
        // if (AccountId === undefined || (AccountId != undefined && AccountId != nodedata.Id))//
        //{


        window.mapconfig.datacontext.activeModel = {};
        var floormodel = null;
        if (context && context.$data) {
            floormodel = context.$data;
            floormodel.reset();
            window.mapconfig.datacontext.activeModel = floormodel;
            window.mapconfig.datacontext.activeModel.siteData = nodedata;
        }
        else {
            window.mapconfig.datacontext.activeModel = new floorplanModel();
            window.mapconfig.datacontext.activeModel.siteData = nodedata;
            ko.applyBindings(window.mapconfig.datacontext.activeModel, $node[0]);

        }
        $($node).find('.floormapitem').remove();
        $node.find('.floorPlanimagecontainer').css("background-image", "").removeAttr("AccountId");
        $node.find('.floormapEmptyMsg').css("visibility", "hidden");
        $node.find('.floorPlanimagecontainer').css("background-image", 'url(' + window.location.href + '/Content/images/loading.gif)').css("background-repeat", "no-repeat").css("background-size", "120px 120px").css("background-position", "center");;

        window.mapconfig.datacontext.getfloorplanimage(nodedata.Id, function (jsonResult) {

            if (jsonResult.Success) {
                $node.find('.floorPlanimagecontainer').css("background-image", "url(" + jsonResult.data + ")").css("background-repeat", "no-repeat").attr("AccountId", nodedata.Id).css("background-size", "").css("background-position", "");
                if (jsonResult.data.length > 10)
                    $node.find('.floormapEmptyMsg').css("visibility", "hidden");
                else
                    $node.find('.floormapEmptyMsg').css("visibility", "visible");
                window.mapconfig.datacontext.getfloorplandata(nodedata.Id).done(function (jsonResult) {
                    if (jsonResult.Success) {
                        if (window.mapconfig.datacontext.activeModel) {
                            window.mapconfig.datacontext.activeModel.Initilialize(jsonResult.ResultData);
                            window.mapconfig.datacontext.activeModel.siteData = nodedata;
                        }
                        //else {
                        //    window.mapconfig.datacontext.activeModel = new floorplanModel(jsonResult.ResultData);
                        //    window.mapconfig.datacontext.activeModel.Initilialize(jsonResult.ResultData);
                        //    window.mapconfig.datacontext.activeModel.siteData = nodedata;
                        //    ko.applyBindings(window.mapconfig.datacontext.activeModel, $node[0]);
                        //}
                        if (isMapmode) {
                            $('.floormapitem').hide();
                        }
                        else {
                            $('.floormapitem').show();
                        }
                        datacontext.getcontactdetails(nodedata.Id).done(function (jsondata) {
                            var result = jsondata;
                            window.mapconfig.datacontext.activeModel = window.mapconfig.datacontext.activeModel || {};
                            window.mapconfig.datacontext.activeModel.siteData = result.data;
                            if (cb) {
                                cb();
                                return;
                            }
                        }).fail(function () {
                            if (cb) {
                                cb();
                                return;
                            }
                        });
                    }

                }).fail(function () {
                    console.error("Error on loading Category info");
                    if (cb) {
                        cb();
                        return;
                    }
                });

            }
            else {
                $node.find('.floorPlanimagecontainer').css("background-image", "").removeAttr("AccountId").css("background-position", "").css("background-size", "");
                $node.find('.floormapEmptyMsg').css("visibility", "visible");
                if (cb) {
                    cb();
                    return;
                }
            }
        });
        // }
        if (cb) {
            cb();
            return;
        }
    }

    //self.isSiteSubType = function (type) {
    //    try {
    //        var sitesubtypes = ["PANEL_INPUT_NODE", "PANEL_OUTPUT_NODE", "OUTPUTPOINT", "INPUTPOINT", "DOOR", "READER", "RECORDER", "PANEL", "CAMERA", "MPCAinput", "MPCAoutput", "DeviceStorage"]
    //        var match = ko.utils.arrayFirst(sitesubtypes, function (stype) {
    //            return type.toUpperCase() == stype.toUpperCase();
    //        });
    //        if (match) {
    //            return true;
    //        }
    //        else {
    //            return false;
    //        }
    //    } catch (e) {
    //        throw e;
    //    }
    //}
    self.getSite = function (node) {
        if (node == undefined) return node;
        if (node.type().toLowerCase() == 'site')
            return node.nodeobject;
        return self.getSite(node.parentNode);
    }
    function showmarker() {
        if (currentAccount) {
            onaccountselected(currentAccount);
        }
    }
    function onaccountselected(selectedAccount) {
        try {
            iscreateandEdit = true;
            console.log('current selected map object in create and edit', window.mapconfig.map);
            currentAccount = selectedAccount;

            //Clear All marker Array
            clearallmarkers(dealerMarkerArray);

            clearallmarkers(customerMarkerArray);
            clearallmarkers(sitemarkerArray);

            self.additemtolist = "";
            if (selectedAccount.nodedata.EntityType.toLowerCase() == "site") {
                window.mapconfig.mapcontext.showSite(selectedAccount.nodedata, function () {
                    unblockUI();
                });
            }

            else if (selectedAccount.nodedata.EntityType.toLowerCase() == "dealer") {

                if (window.mapmode == 'config') {
                    $('#floormap_canvas').hide().attr("data-isinfloormap", false);
                }
                else {
                    $('#floormap_canvas1').hide();
                }
                $("#floormap_canvas").find('.floorPlanimagecontainer').css({ 'display': 'none' });
                $('#map-canvas').show();
                $('.floormapitem').hide();
                isMapmode = true;
                onmapzoomchanged(3);
            }
            else if (selectedAccount.nodedata.EntityType.toLowerCase() == "customer") {

                if (window.mapmode == 'config') {
                    $('#floormap_canvas').hide().attr("data-isinfloormap", false);
                }
                else {
                    $('#floormap_canvas1').hide();
                }
                $("#floormap_canvas").find('.floorPlanimagecontainer').css({ 'display': 'none' });
                $('#map-canvas').show();
                $('.floormapitem').hide();
                isMapmode = true;
                onmapzoomchanged(5);
            }
            else if (selectedAccount.nodedata.EntityType.toLowerCase() == "group") {

                // query the site markes and loop the array
                data = ({ id: currentAccount.nodedata.Id, nodeType: currentAccount.nodedata.EntityType });
                var url = $('#getaccountsurl').val();//+ "?id=" + currentAccount.nodedata.Id + "&nodeType=" + currentAccount.nodedata.EntityType;
                datacontext.getaccounts(url, data).done(function (jsondata) {
                    var data = jsondata;
                    if (data) {
                        var sitesonly = $.grep(data, function (item) {
                            if (item.EntityType.toLowerCase() == "site")
                                return item;
                        });
                        console.log("IN Group site array length:" + sitesonly.length);
                        if (sitesonly.length <= 0) {
                            console.log(sitesonly);
                            if (window.mapmode != 'config') {
                                alertify.success(Resources.MapPlugin_NoSitesfound);
                            }
                        } else {

                            dealerMarkerArray = clearallmarkers(dealerMarkerArray);
                            sitemarkerArray = clearallmarkers(sitemarkerArray);
                            customerMarkerArray = clearallmarkers(customerMarkerArray);
                            for (var i = 0; i < sitesonly.length; i++) {
                                var newMarker = GetMarker(sitesonly[i], window.mapconfig.map);


                                newMarker.addEventListner('click', function (e) {
                                    window.mapconfig.mapcontext.showSite(e.marker.marker.accountdata, function () {
                                        unblockUI();
                                        window.mapconfig.mapcontext.SetmapMode(window.mapconfig.common.mapmode.FLOORPLANMODE, false, true);
                                    })

                                });
                                sitemarkerArray.push(newMarker);

                            }
                            window.mapconfig.mapcontext.setCompatibleZoom(window.mapconfig.map, 5)
                        }
                    }

                }).fail(function () { });


            }
            else if (selectedAccount.nodedata.EntityType.toLowerCase() == "General") {
                //Belongs 
                onmapzoomchanged(2);
            }
            else if (selectedAccount.nodedata.EntityType.toLowerCase() == "credentialholders" || selectedAccount.nodedata.EntityType.toLowerCase() == "schedules") {
                    ;
            }
            else {
                isPanelClicked = true;
                var sitenode = self.getSite(selectedAccount.treemodel);
                if (sitenode != undefined)
                    window.mapconfig.mapcontext.showSite(sitenode, function () {
                        unblockUI();
                        window.mapconfig.mapcontext.SetmapMode(1001, false, true);
                    });

            }
            //else if (selectedAccount.nodedata.EntityType.toLowerCase() == "recorder" || selectedAccount.nodedata.EntityType.toLowerCase() == "panel" || selectedAccount.nodedata.EntityType.toLowerCase() == "door" || selectedAccount.nodedata.EntityType.toLowerCase() == "camera" ||
            //         selectedAccount.nodedata.EntityType.toLowerCase() == "mpcainput" || selectedAccount.nodedata.EntityType.toLowerCase() == "mpcaoutput" || selectedAccount.nodedata.EntityType.toLowerCase() == "devicestorage" ||
            //         selectedAccount.nodedata.EntityType.toLowerCase() == "panel_input_node" || selectedAccount.nodedata.EntityType.toLowerCase() == "panel_output_node" || selectedAccount.nodedata.EntityType.toLowerCase() == "inputpoint" ||
            //         selectedAccount.nodedata.EntityType.toLowerCase() == "outputpoint" || selectedAccount.nodedata.EntityType.toLowerCase() == "input_node" || selectedAccount.nodedata.EntityType.toLowerCase() == "output_node" || selectedAccount.nodedata.EntityType.toLowerCase() == "reader") {
            //    isPanelClicked = true;

            //}

        } catch (e) {
        }
    }
    function onchildrenLoaded(accountsData) {
        var childrenAccounts = accountsData;
        if (childrenAccounts == undefined || childrenAccounts == null) {
            console.log("Map module:  children accounts are empty");
            return;
        }

        for (var aIndex = 0; aIndex < accountsData.nodedata.length; aIndex++) {
            var cAccount = accountsData.nodedata[aIndex];
            if (cAccount != undefined || cAccount != null) {
                if (cAccount.EntityType == "General" || cAccount.EntityType == "Customer" || cAccount.EntityType == "Dealer" || cAccount.EntityType == "Site") {
                    {
                        //TODO check the usage
                        FindGeolocationOnLatlog(cAccount.LocationInfo.Lattitude, cAccount.LocationInfo.Longitude, cAccount.Name, cAccount.EntityType, cAccount.Id);

                    }
                }
            }

        }
    }
    function accountupdatesuccess(accountkodata) {
        if (!window.mapconfig.mapcontext.isInitialized) return;
        var data = ko.toJSON(accountkodata.data.Name).split('"')[1];
        window.mapconfig.datacontext.activeModel = window.mapconfig.datacontext.activeModel || {};
        window.mapconfig.datacontext.activeModel.Id = accountkodata.data.FloorPlanInfo.Id;
        if (accountkodata.data.EntityType.toLowerCase() == "customer") {
            for (var i = 0 ; i < customerMarkerArray.length ; i++) {
                if (customerMarkerArray[i].id == accountkodata.Id) {
                    customerMarkerArray[i].marker.setTitle(data);
                }

            }
        }
        else if (accountkodata.data.EntityType.toLowerCase() == "site") {
            for (var i = 0 ; i < sitemarkerArray.length ; i++) {
                if (sitemarkerArray[i].id == accountkodata.Id) {
                    sitemarkerArray[i].marker.setTitle(data);

                }
            }
        }
        else if (accountkodata.data.EntityType.toLowerCase() == "dealer") {
            for (var i = 0 ; i < dealerMarkerArray.length ; i++) {
                if (dealerMarkerArray[i].id == accountkodata.Id) {
                    dealerMarkerArray[i].marker.setTitle(data);

                }
            }
        }
        console.log("On Addition sitemarkers " + sitemarkerArray.length);
        console.log("Ona ddition count of customermarkers " + customerMarkerArray.length);
        console.log("On addition count of Dealermarkers " + dealerMarkerArray.length);
    }
    function deleteAccountSuccess(deleteaccountdata) {
        if (!window.mapconfig.mapcontext.isInitialized) return;
        console.log("Before delete sitemarkers " + sitemarkerArray.length);
        console.log("Before Deletecount of customermarkers " + customerMarkerArray.length);
        try {
            for (var i = 0; i < sitemarkerArray.length; i++) {
                sitemarkerArray[i].marker.setVisible(false);
            }
            for (var i = 0; i < customerMarkerArray.length; i++) {
                customerMarkerArray[i].marker.setVisible(false);
            }
            for (var i = 0; i < dealerMarkerArray.length; i++) {
                dealerMarkerArray[i].marker.setVisible(false);
            }
            window.mapconfig.mapcontext.setCompatibleZoom(window.mapconfig.map, 4)
            window.mapconfig.map.panTo(new google.maps.LatLng("49.80759837", "-103.131365"));


        } catch (e) {
            console.error("Map Module: Error on clearing the marker on accountDeletesuccess.  Error:" + e.message, e);

        }
    }




    //TODO check for usage
    function FindGeolocationOnLatlog(latitude, longitude, siteName, accountType, accountId, callback) {
        if (!window.mapconfig.mapcontext.isInitialized) return;

    }

    function getmarkeronMap(url, data, zoomlevel, parentId, mapobject) {
        datacontext.getaccounts(url, data).done(function (jsondata) {
            var data = jsondata;
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].EntityType.toLowerCase() == "site") {
                        var newMarker = GetMarker(data[i], mapobject);

                        var contentString = '<div id="content">' +
                'Type:' + currentAccount.nodedata.EntityType +
                '<br><b>Name:' + currentAccount.nodedata.Name +
                '</b><br>Floor Map:' + '<span id="mapitem-' + currentAccount.nodedata.Id + '" class="floormap">Click to view Floor Map</span>' +
                '</div>';

                        google.maps.event.addListener(newMarker.marker, 'mouseover', function () {
                        });

                        google.maps.event.addListener(newMarker.marker, 'click', function () {
                            window.mapconfig.mapcontext.SetmapMode(window.mapconfig.common.mapmode.FLOORPLANMODE, false, true);
                            $("#mapheadr").css({ "display": "none", "margin-top": "-62px" });

                        });
                        sitemarkerArray.push(newMarker);
                        console.log(" sitemarkers on addition of ajax " + sitemarkerArray.length);

                    }
                }
                window.mapconfig.mapcontext.setCompatibleZoom(mapobject, 5)
                makeCluster(sitemarkerArray, window.mapconfig.map);
            }
        }).fail(function () { });
    }


    function addbreadcrumFromMarker(item) {
        var bvmcontext = ko.contextFor(document.getElementById("mapheadr"));
        bvmcontext.$root.AddBreadCrumbItem({ Id: item.Id, EntityType: item.EntityType, ParentId: item.parentId, Name: item.Name });

        var curNode = new window.mapconfig.bAccountModel({ Id: item.Id, EntityType: item.EntityType, ParentId: item.parentId, Name: item.Name });
        curNode.Parent(bvmcontext.$root.CurrentNode());
        bvmcontext.$root.CurrentNode(curNode);

    }
    function showmaphidefloorplan() {
        $("#floormap_canvas1").find('.floorPlanimagecontainer').css({ 'display': 'none' });
        $("#map-canvas1").css({ 'display': 'block' });
    }

    function siteMarkerItemClicked(e, event) {
        iscreateandEdit = false;

        window.mapconfig.datacontext.hidepopover();
        var $node = null;
        if (window.mapmode == 'config') {
            $node = $('#floormap_canvas');
            $("#floormap_canvas").find('.floormapitem').remove();
        }
        else {
            $node = $('#floormap_canvas1');
            $("#floormap_canvas1").find('.floormapitem').remove();
        }

        if (e.marker.accountdata.EntityType.toLowerCase() === 'customer' || e.marker.accountdata.EntityType.toLowerCase() === 'group') {
            addbreadcrumFromMarker(e.marker.accountdata);
            showNextNavigation(e.marker.accountdata, 11, e.currentMapObject);
        }
        else if (e.marker.accountdata.EntityType.toLowerCase() === 'dealer') {
            addbreadcrumFromMarker(e.marker.accountdata);
            showNextNavigation(e.marker.accountdata, 5, e.currentMapObject);
        }
        else {
            window.mapconfig.mapcontext.SetmapMode(window.mapconfig.common.mapmode.FLOORPLANMODE, true, false);
            window.mapconfig.mapcontext.showSite(e.marker.accountdata, function () {
                unblockUI();
                $(document).find("#btnfloormaprefresh").css("display", "block");
                window.mapconfig.mapcontext.SetmapMode(window.mapconfig.common.mapmode.FLOORPLANMODE, true, false);
            })
        }

    }

    function displayClusterInfo(cluster, infowindow, currentMapObject, evt) {
        $('#mapheadr').find('div.dropdown').removeClass('open');
        if (!window.mapconfig.infowindow.isOpen)
            window.mapconfig.infowindow.isOpen = true;
        else {
            window.mapconfig.infowindow.isOpen = false;
            window.mapconfig.infowindow.close(currentMapObject);
            return;
        }
        window.mapconfig.infowindow.setContent('');
        var expandmodel = new window.mapconfig.mapcontext.clusterexpanmodel();
        var text = "<ul id='clusterexpandmenu' class='sitenames' data-bind='foreach:items'>";
        text += "<li data-bind='click:$data.siteClicked' data-accid='text:$data.Id' data-accParentId='text:$data.parentId' data-acctype='text:$data.EntityType' data-accname='text:$data.marker.title'><b data-bind='css:$data.icon'></b><span data-bind='text:$data.marker.title'></span><span class='clusterDivider'></span></li>";
        text += "</ul>";

        var markers = evt.getMarkers();

        for (var i = 0; i < markers.length; i++) {
            expandmodel.items.push(new window.mapconfig.mapcontext.sitemarkerModel(markers[i], window.mapconfig.infowindow, currentMapObject));
        }

        window.mapconfig.infowindow.setContent(text);
        window.mapconfig.infowindow.setPosition(evt.getCenter());
        window.mapconfig.infowindow.open(currentMapObject);
        ko.applyBindings(expandmodel, $('#clusterexpandmenu')[0]);

    }
    function hideCluster() {
        window.mapconfig.currentClustermarkers = window.mapconfig.currentClustermarkers || [];
        var markers = window.mapconfig.currentClustermarkers;// window.mapconfig.clusterArray.getMarkers();
        for (var it in markers) {
            markers[it].setMap(null);
        }
        window.mapconfig.currentClustermarkers = [];
        if (window.mapconfig.clusterArray != undefined)
            window.mapconfig.clusterArray.clearMarkers();
    }
    function makeCluster(siteClusterArray, currentMapObject) {
        //  if (currentMapObject.Name === 'CreateView') return;
        hideCluster();
        var zoomlevel = currentMapObject.getZoom();

        for (var i = 0; i < siteClusterArray.length; i++) {
            if (siteClusterArray[i].marker)
                window.mapconfig.currentClustermarkers.push(siteClusterArray[i].marker);
            else
                window.mapconfig.currentClustermarkers.push(siteClusterArray[i]);
        }

        window.mapconfig.clusterArray = new MarkerClusterer(currentMapObject, window.mapconfig.currentClustermarkers, {
            gridSize: 200, maxZoom: zoomlevel,// maxZoom: 15,
            zoomOnClick: false,
            styles: [{
                url: window.location.href + '/Content/images/sprite_40.png',
                width: 30,
                height: 38,
                lineHeight: '40px',
                anchorText: [-5, 0],
                anchorIcon: [45, 46],
                textColor: '#fff',
                textSize: 12,
                background: '#707070',
                backgroundPosition: '-60px -10px'

            }]
        });

        if (window.mapconfig.infowindow) {
            window.mapconfig.infowindow.isOpen = false;
            window.mapconfig.infowindow.close(currentMapObject);
        }

        window.mapconfig.infowindow = new google.maps.InfoWindow({

        });

        google.maps.event.addListener(window.mapconfig.clusterArray, 'clusterclick', function (event) {

            //var latLng = new google.maps.LatLng(center.lat() + Math.random() - 0.5, center.lng() + Math.random() - 0.5);
            displayClusterInfo(window.mapconfig.clusterArray, window.mapconfig.infowindow, currentMapObject, event);
            //$("ul.sitenames").parent().parent().parent('.gm-style-iw').css("background-color", "red");
            window.event.stopPropagation();
            window.event.stopImmediatePropagation();
            return;

        });


        google.maps.event.addListener(currentMapObject, 'zoom_changed', function () {
            window.mapconfig.infowindow.isOpen = false;
            window.mapconfig.infowindow.close(currentMapObject);
            $('#mapheadr').find('div.dropdown').removeClass('open');
        });

        google.maps.event.addListener(window.mapconfig.infowindow, 'domready', function () {
            $(".gm-style-iw").next("div").hide();
            var l = $('#clusterexpandmenu').parent().parent().parent().siblings().addClass("infowindowstyle");
            $("#clusterexpandmenu").parent().parent().parent().siblings().find("div:nth-child(2)").addClass('infowindow-popovershadow');
            $("#clusterexpandmenu").parent().parent().parent().siblings().find("div:nth-child(3)").addClass('infowindow-arrows');
            $("#clusterexpandmenu").parent().parent().parent().siblings().find("div:nth-child(4)").addClass('infowindow-body');
            $("#clusterexpandmenu").parent().parent().parent().siblings().find(".gm-style-iw").css('width', '300px');
            $(".infowindow-arrows").find("div:nth-child(2)").removeClass('infowindow-popovershadow');

        });
    }
    function showNextNavigation(selectedAccount, zoomlevel, map) {
        mapresize();
        iscreateandEdit = false;
        console.log('current map iscreateandEdit', iscreateandEdit);
        console.log('current map object', map);
        console.log('Enter showNextNavigation', map);
        var currentAccount = selectedAccount;
        var currentMapObject = map;
        //dealerMarkerArray = clearallmarkers(dealerMarkerArray);
        //sitemarkerArray = clearallmarkers(sitemarkerArray);
        //customerMarkerArray = clearallmarkers(customerMarkerArray);
        fullmapDealerMarkerArray = clearallmarkers(fullmapDealerMarkerArray);
        fullmapSitemarkerArray = clearallmarkers(fullmapSitemarkerArray);
        fullmapCustomerMarkerArray = clearallmarkers(fullmapCustomerMarkerArray);
        siteClusterArray = clearcluster(siteClusterArray);
        if (window.mapconfig.clusterArray != undefined) {
            hideCluster();
        }
        try {
            var parentId;
            if (currentAccount == undefined && currentAccount == null) {
                console.error("Map Module : Onmapzoomchanged No Node Selected : error: " + e.message);
            }
            else {
                parentId = currentAccount.parentId;

                /* Show Customer Markers : Zoom level 2 */
                if (zoomlevel == 2) {
                    data = ({ id: currentAccount.Id, nodeType: currentAccount.EntityType });
                    var url = $('#getaccountsurl').val();// + "?id=" + currentAccount.Id + "&nodeType=" + currentAccount.EntityType;
                    blockUI();
                    datacontext.getaccounts(url, data).done(function (jsondata) {
                        unblockUI();
                        var data = jsondata;
                        showmaphidefloorplan();
                        if (data) {
                            var customersonly = $.grep(data, function (item) {
                                if (item.EntityType.toLowerCase() == "dealer")
                                    return item;
                            });
                            if (customersonly.length <= 0) {
                                var newMarker = GetMarker(currentAccount, currentMapObject);
                                newMarker.addEventListner("click", function (e) {
                                    addbreadcrumFromMarker(e.marker);
                                    showNextNavigation(e.marker, 5, currentMapObject);
                                });
                                currentMapObject.setCenter(new google.maps.LatLng(currentAccount.LocationInfo.Lattitude, currentAccount.LocationInfo.Longitude));
                                fullmapDealerMarkerArray.push(newMarker);
                                return;

                            }
                            else {
                                for (var i = 0; i < data.length; i++) {
                                    var curobj = null;
                                    curobj = data[i];
                                    if (curobj.EntityType.toLowerCase() == "dealer") {

                                        var newMarker = GetMarker(curobj, currentMapObject);


                                        newMarker.addEventListner("click", function (e) {
                                            addbreadcrumFromMarker(e.marker);
                                            showNextNavigation(e.marker, 5, currentMapObject);
                                        });
                                        currentMapObject.setCenter(new google.maps.LatLng(curobj.LocationInfo.Lattitude, curobj.LocationInfo.Longitude));
                                        fullmapDealerMarkerArray.push(newMarker);
                                    }

                                }
                                makeCluster(fullmapDealerMarkerArray, currentMapObject);
                            }

                        }
                    }).fail(function () {
                        unblockUI();
                    });
                }
                else if (zoomlevel == 5) {
                    blockUI();
                    $("#baccountdropdown").removeClass("open");
                    data = ({ id: currentAccount.Id, nodeType: currentAccount.EntityType });
                    var url = $('#getaccountsurl').val();// + "?id=" + currentAccount.Id + "&nodeType=" + currentAccount.EntityType;
                    datacontext.getaccounts(url, data).done(function (jsondata) {
                        unblockUI();
                        var data = jsondata;
                        showmaphidefloorplan();
                        if (data) {
                            var customersonly = $.grep(data, function (item) {
                                if (item.EntityType.toLowerCase() == "customer")
                                    return item;
                            });
                            console.log("customer array length:" + customersonly.length);
                            if (customersonly.length <= 0) {


                                if (currentAccount.LocationInfo != undefined || currentAccount.LocationInfo != null) {
                                    var newMarker = GetMarker(currentAccount, currentMapObject);
                                    newMarker.addEventListner("click", function (e) {
                                        addbreadcrumFromMarker(e.marker);
                                        showNextNavigation(e.marker, 11, currentMapObject);
                                    });

                                    window.mapconfig.mapcontext.setCompatibleZoom(currentMapObject, 2);
                                    fullmapCustomerMarkerArray.push(newMarker);
                                    return;
                                }
                            }
                            else {
                                for (var i = 0; i < data.length; i++) {
                                    var curobj = null;
                                    curobj = data[i];
                                    if (curobj.EntityType.toLowerCase() == "customer") {

                                        var newMarker = GetMarker(curobj, currentMapObject);

                                        newMarker.addEventListner("click", function (e) {
                                            addbreadcrumFromMarker(e.marker);
                                            showNextNavigation(e.marker, 11, currentMapObject);
                                        });

                                        window.mapconfig.mapcontext.setCompatibleZoom(currentMapObject, 2);
                                        fullmapCustomerMarkerArray.push(newMarker);
                                    }
                                }
                                makeCluster(fullmapCustomerMarkerArray, currentMapObject);
                            }
                        }


                    }).fail(function () {
                        unblockUI();
                    });
                }

                else if (zoomlevel == 11 || zoomlevel == 6) {

                    $("#baccountdropdown").removeClass("open");
                    siteClusterArray = [];
                    data = ({ id: currentAccount.Id, retTypes: "SITE" });
                    var url = $('#getchildaccountsurl').val();// + "?id=" + currentAccount.Id + "&retTypes=SITE";//
                    blockUI();
                    datacontext.getaccounts(url, data).done(function (jsondata) {
                        unblockUI();
                        var data = jsondata;
                        showmaphidefloorplan();
                        if (data) {
                            var sitesonly = $.grep(data, function (item) {
                                if (item.EntityType.toLowerCase() == "site")
                                    return item;
                            });
                            var grouponly = $.grep(data, function (item) {
                                if (item.EntityType.toLowerCase() == "group")
                                    return item;
                            });

                            if (window.mapconfig.infowindow) {
                                window.mapconfig.infowindow.isOpen = false;
                                window.mapconfig.infowindow.close(currentMapObject);
                            }

                            console.log("IN site level zoom array length:Site length" + sitesonly.length + "Group length" + grouponly.length);
                            if (sitesonly.length <= 0 && currentAccount.EntityType.toLowerCase() == 'site') {
                                var newMarker = GetMarker(currentAccount, currentMapObject);
                                newMarker.addEventListner("click", function (e) {
                                    iscreateandEdit = false;
                                    //    addbreadcrumFromMarker(newMarker.marker);
                                    window.mapconfig.datacontext.hidepopover();
                                    var $node = null;
                                    if (window.mapmode == 'config') {
                                        $node = $('#floormap_canvas');
                                        $("#floormap_canvas").find('.floormapitem').remove();
                                    }
                                    else {
                                        $node = $('#floormap_canvas1');
                                        $("#floormap_canvas1").find('.floormapitem').remove();
                                    }

                                    window.mapconfig.mapcontext.showSite(currentAccount, function () {
                                        unblockUI();
                                        $(document).find("#btnfloormaprefresh").css("display", "block");
                                        window.mapconfig.mapcontext.SetmapMode(window.mapconfig.common.mapmode.FLOORPLANMODE, true, false);
                                    });

                                });
                                window.mapconfig.mapcontext.setCompatibleZoom(currentMapObject, 7);
                                currentMapObject.setCenter(new google.maps.LatLng(currentAccount.LocationInfo.Lattitude, currentAccount.LocationInfo.Longitude));
                                siteClusterArray.push(newMarker.marker);

                            }
                            else if (sitesonly.length <= 0) {
                                if (window.mapmode != 'config') {
                                    alertify.success(Resources.MapPlugin_NoSitesfound);
                                }

                            }
                            if (sitesonly.length > 0) {
                                for (var i = 0; i < data.length; i++) {
                                    if (data[i].EntityType.toLowerCase() == "site") {
                                        var newMarker = GetMarker(data[i], currentMapObject);


                                        newMarker.addEventListner("click", function (e) {
                                            iscreateandEdit = false;
                                            //  addbreadcrumFromMarker(e.marker);
                                            window.mapconfig.datacontext.hidepopover();
                                            var $node = null;
                                            if (window.mapmode == 'config') {
                                                $node = $('#floormap_canvas');
                                                $("#floormap_canvas").find('.floormapitem').remove();
                                            }
                                            else {
                                                $node = $('#floormap_canvas1');
                                                $("#floormap_canvas1").find('.floormapitem').remove();
                                            }

                                            window.mapconfig.mapcontext.showSite(e.marker.marker.accountdata, function () {
                                                unblockUI();
                                                $(document).find("#btnfloormaprefresh").css("display", "block");
                                                window.mapconfig.mapcontext.SetmapMode(window.mapconfig.common.mapmode.FLOORPLANMODE, true, false);
                                            });


                                        });

                                        siteClusterArray.push(newMarker.marker);
                                    }

                                }
                                window.mapconfig.mapcontext.setCompatibleZoom(currentMapObject, 14)
                                makeCluster(siteClusterArray, currentMapObject);


                            } else if (grouponly.length > 0) {
                                for (var i = 0; i < data.length; i++) {
                                    if (currentAccount.EntityType.toLowerCase() == 'group') {
                                        blockUI();
                                        data = ({ id: currentAccount.Id, nodeType: currentAccount.EntityType });
                                        var url = $('#getaccountsurl').val();// + "?id=" + currentAccount.Id + "&nodeType=" + currentAccount.EntityType;
                                        datacontext.getaccounts(url, data).done(function (jsondata) {
                                            unblockUI();
                                            var data = jsondata;
                                            if (data) {
                                                var sitesonly = $.grep(data, function (item) {
                                                    if (item.EntityType.toLowerCase() == "site")
                                                        return item;
                                                });
                                                if (sitesonly.length <= 0) {
                                                    console.log(sitesonly);
                                                    if (window.mapmode != 'config') {
                                                        alertify.success(Resources.MapPlugin_NoSitesfound);
                                                    }

                                                } else {
                                                    for (var i = 0; i < sitesonly.length; i++) {
                                                        var newMarker = GetMarker(sitesonly[i], currentMapObject);

                                                        google.maps.event.addListener(newMarker.marker, 'click', function () {
                                                            addbreadcrumFromMarker(newMarker.marker);
                                                            window.mapconfig.mapcontext.SetmapMode(window.mapconfig.common.mapmode.FLOORPLANMODE, true, false);
                                                        });
                                                        siteClusterArray.push(newMarker.marker);
                                                    }
                                                    window.mapconfig.mapcontext.setCompatibleZoom(currentMapObject, 7);
                                                }
                                            }

                                        }).fail(function () {
                                            unblockUI();
                                        });
                                    } else {
                                        console.log("Markers of not group type");
                                    }
                                }

                            }
                        }
                        makeCluster(siteClusterArray, currentMapObject);


                        console.log("At zoom 5 count of sitemarkers on addition " + siteClusterArray.length);
                        console.log("At zoom 5 count of customermarkers on addition " + fullmapCustomerMarkerArray.length);

                    }).fail(function () { });
                }
                else if (zoomlevel == 7) {

                    fullmapSitemarkerArray = clearallmarkers(fullmapCustomerMarkerArray);
                    marksitesonmapfor(fullmapCustomerMarkerArray, zoomlevel, parentId, currentMapObject);
                }
            }
        } catch (e) {
        }
    }

    function marksitesonmapfor(customers, zoomlevel, parentId, mapobject) {
        for (var j = 0; j < customers.length; j++) {
            if (currentAccount.nodedata.id == customers[j].id) {
                data = ({ id: currentAccount.nodedata.id, nodeType: currentAccount.nodedata.EntityType });
                var url = $("#baccounturl").attr("value");
                getmarkeronMap(url, data, zoomlevel, parentId, mapobject);
            }
            else {
                data = ({ id: customers[j].id, nodeType: customers[j].type });
                var url = $("#baccounturl").attr("value");
                getmarkeronMap(url, data, zoomlevel, parentId, mapobject);
            }
        }
    }
    function onmapzoomchanged(zoomlevel) {
        try {
            var parentId;
            if (currentAccount == undefined && currentAccount == null) {
                console.error("Map Module : Onmapzoomchanged No Node Selected : error: " + e.message);
            }
            else {
                parentId = currentAccount.nodedata.ParentId;

                /* Dealer Markers : Zoom level 3 */
                if (zoomlevel == 3) {
                    dealerMarkerArray = clearallmarkers(dealerMarkerArray);
                    sitemarkerArray = clearallmarkers(sitemarkerArray);
                    customerMarkerArray = clearallmarkers(customerMarkerArray);

                    console.log("At zoom 3 count of sitemarkers when clicked " + sitemarkerArray.length);
                    console.log("At zoom 3 count of customermarkers " + customerMarkerArray.length);
                    console.log("At zoom 3 count of dealerMarker " + dealerMarkerArray.length);
                    data = ({ id: currentAccount.nodedata.Id, nodeType: currentAccount.nodedata.EntityType });
                    var url = $('#getaccountsurl').val();//+ "?id=" + currentAccount.nodedata.Id + "&nodeType=" + currentAccount.nodedata.EntityType;
                    datacontext.getaccounts(url, data).done(function (jsondata) {
                        //jsondata is list of custtomer
                        //getmarkerdata
                        var data = jsondata;

                        if (data) {
                            var dealersonly = $.grep(data, function (item) {
                                if (item.EntityType.toLowerCase() == "dealer")
                                    return item;
                            });
                            if (dealersonly.length <= 0) {


                                if (currentAccount.nodedata.LocationInfo != undefined || currentAccount.nodedata.LocationInfo != null) {
                                    var newMarker = GetMarker(currentAccount.nodedata, window.mapconfig.map);

                                    dealerMarkerArray.push(newMarker);
                                    window.mapconfig.mapcontext.setCompatibleZoom(window.mapconfig.map, 2);

                                    return;
                                }

                            }
                            else {
                                for (var i = 0; i < data.length; i++) {
                                    if (data[i].EntityType.toLowerCase() == "dealer") {
                                        var newMarker = GetMarker(data[i], window.mapconfig.map);

                                        dealerMarkerArray.push(newMarker);

                                    }
                                    if (dealersonly.length > 0) {

                                        if (currentAccount.nodedata.LocationInfo != undefined || currentAccount.nodedata.LocationInfo != null) {
                                            var newMarker = GetMarker(currentAccount.nodedata, window.mapconfig.map);

                                            dealerMarkerArray.push(newMarker);
                                        }
                                    }
                                    window.mapconfig.mapcontext.setCompatibleZoom(window.mapconfig.map)
                                }
                            }


                        }
                        console.log("At zoom 3 count of sitemarkers on addition " + sitemarkerArray.length);
                        console.log("At zoom 3 count of customermarkers on addition " + customerMarkerArray.length);
                        console.log("At zoom 3 count of dealermarker on addition " + dealerMarkerArray.length);

                    }).fail(function () { });
                }
                if (zoomlevel == 5) {
                    console.log("At zoom 5 count of sitemarkers when clicked " + sitemarkerArray.length);
                    console.log("At zoom 5 count of customermarkers " + customerMarkerArray.length);
                    data = ({ id: currentAccount.nodedata.Id, nodeType: currentAccount.nodedata.EntityType });
                    var url = $('#getaccountsurl').val();// + "?id=" + currentAccount.nodedata.Id + "&nodeType=" + currentAccount.nodedata.EntityType;
                    datacontext.getaccounts(url, data).done(function (jsondata) {
                        var data = jsondata;

                        if (data) {
                            var customresonly = $.grep(data, function (item) {
                                if (item.EntityType.toLowerCase() == "customer")
                                    return item;
                            });
                            if (customresonly.length <= 0) {


                                if (currentAccount.nodedata.LocationInfo != undefined || currentAccount.nodedata.LocationInfo != null) {
                                    var newMarker = GetMarker(currentAccount.nodedata, window.mapconfig.map);
                                    customerMarkerArray.push(newMarker);
                                    window.mapconfig.mapcontext.setCompatibleZoom(window.mapconfig.map, 5)
                                    return;
                                }

                            }
                            else {
                                for (var i = 0; i < data.length; i++) {
                                    if (data[i].EntityType.toLowerCase() == "customer") {
                                        var newMarker = GetMarker(data[i], window.mapconfig.map);
                                        customerMarkerArray.push(newMarker);
                                    }
                                    if (customresonly.length > 0) {

                                        if (currentAccount.nodedata.LocationInfo != undefined || currentAccount.nodedata.LocationInfo != null) {
                                            var newMarker = GetMarker(currentAccount.nodedata, window.mapconfig.map);
                                            customerMarkerArray.push(newMarker);
                                            window.mapconfig.mapcontext.setCompatibleZoom(window.mapconfig.map, 5)
                                        }
                                    }
                                }

                            }


                        }
                        console.log("At zoom 5 count of sitemarkers on addition " + sitemarkerArray.length);
                        console.log("At zoom 5 count of customermarkers on addition " + customerMarkerArray.length);

                    }).fail(function () { });
                }
                if (zoomlevel == 7) {
                    sitemarkerArray = clearallmarkers(customerMarkerArray);
                    console.log("At zoom 7 count of sitemarkers " + sitemarkerArray.length);
                    console.log("At zoom 7 count of customermarkers " + customerMarkerArray.length);

                    marksitesonmapfor(customerMarkerArray, zoomlevel, parentId, window.mapconfig.map);
                }
            }
        } catch (e) {
        }
    }

    function SetmapMode(mapMode, isfullview, isMap) {
        console.log("is full view", isfullview);

        if (isfullview == true) {
            console.log("is full view destroy", isfullview);
            window.mapconfig.datacontext.hidepopover();
        }

        //isfullview == undefined means createandedit map else full view map mode
        if (isMap == true) {
            if (mapMode == common.mapmode.UNIVERSALMAPMODE) {
                $("#map-canvas").css({ 'display': 'block' });
                $("#map-canvas1").css({ 'display': 'block' });
                $('.floormapitem').hide();
                $('#floormap_canvas').hide().attr("data-isinfloormap", false);
                $('.floorPlanimagecontainer').hide();
                isMapmode = true;


            }
            if (mapMode == common.mapmode.FLOORPLANMODE) {
                $("#map-canvas").css({ 'display': 'none' });
                $("#map-canvas1").css({ 'display': 'none' });
                $('.floormapitem').show();
                $('#floormap_canvas').show().attr("data-isinfloormap", true);
                $('.floorPlanimagecontainer').show();
                isMapmode = false;
            }

        } else {
            if (mapMode == common.mapmode.UNIVERSALMAPMODE) {
                $("#map-canvas1").css({ 'display': 'block' });
                $("#map-canvas").css({ 'display': 'block' });
                $('.floormapitem').hide();
                $('#floormap_canvas1').hide();
                $('.floorPlanimagecontainer').hide();
                isMapmode = true;


            }
            if (mapMode == common.mapmode.FLOORPLANMODE) {
                $("#map-canvas1").css({ 'display': 'none' });
                $("#map-canvas").css({ 'display': 'none' });
                $('.floormapitem').show();
                $('#floormap_canvas1').show();
                $('.floorPlanimagecontainer').show();
                isMapmode = false;
            }

        }

    }

    function mapresize(mapin) {
        try {
            var map = mapin || window.mapconfig.map;
            if (map != null) {
                map.setZoom(map.getZoom() - 1);
                map.setZoom(map.getZoom() + 1);
            }
        } catch (e) {
            console.log(e.message)
        }

    }


    return {
        SetmapMode: SetmapMode,
        events: events,
        onaccountselected: onaccountselected,
        onchildrenLoaded: onchildrenLoaded,
        accountupdatesuccess: accountupdatesuccess,
        deleteAccountSuccess: deleteAccountSuccess,
        onmapzoomchanged: onmapzoomchanged,
        showNextNavigation: showNextNavigation,
        addAllMarkers: addAllMarkers,
        mapresize: mapresize,
        siteMarkerItemClicked: siteMarkerItemClicked,
        showSite: showSite,
        setCompatibleZoom: setCompatibleZoom,
        showmarker: showmarker
    };
})($, window.mapconfig.datacontext, window.mapconfig.common);
window.mapconfig.eventreciever = (function ($, mapcontext) {
    try {
        $.subscribe(mapcontext.events.onaccountsloaded, onaccountsloaded);
        $.subscribe(mapcontext.events.onaccountselected, onaccountselected);
        $.subscribe(mapcontext.events.accountupdatesuccess, accountupdatesuccess);
        $.subscribe(mapcontext.events.deleteAccountSuccess, deleteAccountSuccess);

    } catch (e) {
        console.error("Map Module: on Subscribing events Error::" + e.message);
    }
    function fullmapresize() {
        window.mapconfig.mapcontext.mapresize(window.mapconfig.map)

    }
    function onaccountsloaded(event, accountsData) {
        try {
            console.info("Map recieved onaccountsloaded event");
            mapcontext.onchildrenLoaded(accountsData);
            fullmapresize();
        } catch (e) {
            console.error("Map Module: Error on children loading. Error: " + e.message, e);
        }
    }

    function onaccountselected(event, accountData) {
        try {
            console.info("Map recieved onaccountselected event");
            mapcontext.onaccountselected(accountData);
            if (isPanelClicked == true) {
                isPanelClicked = false;
            }
            else {
                $('#floormap_canvas').css("display", "none").attr("data-isinfloormap", false);
                $('#map-canvas').show();
                fullmapresize();
            }
        } catch (e) {
            console.error("Map Module: Error on onaccountselected.  Error:" + e.message, e);
        }
    }
    function accountupdatesuccess(event, accountData) {
        try {
            console.info("Map recieved accountupdatesuccess event");
            mapcontext.accountupdatesuccess(accountData);
            fullmapresize();
        } catch (e) {
            console.error("Map Module: Error on accountupdatesuccess.  Error:" + e.message, e);
        }
    }

    function deleteAccountSuccess(event, accountData) {
        try {
            console.info("Map recieved accountDeleteSuccess event");
            mapcontext.deleteAccountSuccess(accountData);
            fullmapresize();
        }
        catch (e) {
            console.error("Map Module: Error on accountDeletesuccess.  Error:" + e.message, e);
        }
    }




})($, window.mapconfig.mapcontext);


