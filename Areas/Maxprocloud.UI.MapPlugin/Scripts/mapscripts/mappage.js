window.mapconfig.fullmapview = (function ($) {
    var fullmapviewContext = {
        initialize: initialize,
        map: map
    };
    var map;


    //window.mapconfig.mapcontext.isInitialized = false;
    function getAccountData(acNode, accountObserable, errorObserable) {
        try {
            data = ({ id: acNode ? acNode.Id : "", nodeType: acNode ? acNode.EntityType : "" });
            return ajaxRequest("POST", getAccountByurl(), data).done(function (jsonData) {
                if (accountObserable) {
                    accountObserable(jsonData);
                }
            }).fail(function () {
                if (errorObserable) {
                    errorObserable("Unable to get account details");
                }
            });
        }
        catch (e) {
        }
    }

    function getAccountByurl(accountId, nodetype) {
        var url = $('#baccounturl').attr("value");
        //url = url + "/?id=" + accountId + "&&nodeType=" + nodetype;
        return url;
    }
    var cAccountModel = function (data) {
        var self = this;
        data = data || {};
        self.Id = data.Id;
        self.EntityType = data.EntityType;
        self.ParentId = data.ParentId;
        self.Name = ko.observable(data.Name);
        self.LocationInfo = ko.observable(data.LocationInfo);
        self.statusclass = ko.observable("");
        self.icon = ko.computed(function () {
            if (self.EntityType != null) {
                if (self.statusclass() != "")
                    return "icon_" + self.EntityType.toLowerCase() + "_" + self.statusclass();
                return "icon_" + self.EntityType.toLowerCase();
            }
            else
                return " tree-open-icon";
        });
        self.OnSelect = function (data, event) {
            try {
                console.log("On Drop down element select", data);
                var bvmcontext = ko.contextFor(event.currentTarget);
                var curNode = new bAccountModel($.parseJSON(self.toJson()));
                curNode.Parent(bvmcontext.$root.CurrentNode());
               


                $('#mapheadr').find('div.dropdown').removeClass('open');
                //window.mapconfig.mapcontext.onaccountselected(self.sysaccount);
                var currentMarkerObject = curNode;
                currentMarkerObject.nodedata = '';
                currentMarkerObject.LocationInfo = self.LocationInfo();
                currentMarkerObject.nodedata = curNode;
                currentMarkerObject.nodedata.Name = self.Name();
                if (data.EntityType.toLowerCase() == "site") {
                   
                    window.mapconfig.mapcontext.showSite(currentMarkerObject, function () {
                        unblockUI();
                        $(document).find("#btnfloormaprefresh").css("display", "block");
                        window.mapconfig.mapcontext.SetmapMode(window.mapconfig.common.mapmode.FLOORPLANMODE, true, false);
                    });
                }
                else {
                    bvmcontext.$root.AddBreadCrumbItem($.parseJSON(self.toJson()));
                    bvmcontext.$root.CurrentNode(curNode);
                    var zoomLevel;

                    //window.mapconfig.mapcontext.onaccountselected(currentMarkerObject);
                    if (currentMarkerObject.EntityType.toLowerCase() == "dealer") {
                        zoomLevel = 5;
                    } else if (currentMarkerObject.EntityType.toLowerCase() == "customer" || currentMarkerObject.EntityType.toLowerCase() == "group") {
                        zoomLevel = 11;
                    }
                    else if (currentMarkerObject.EntityType.toLowerCase() == "general") {
                        zoomLevel = 2;
                    }
                    window.mapconfig.mapcontext.showNextNavigation(currentMarkerObject, zoomLevel, window.mapconfig.fullmap);
                }
            } catch (e) {
                console.error(e);
            }
        }
        self.toJson = function () {
            return ko.toJSON(self);
        }
    }, bAccountModel = function (data) {

        var self = this;
        data = data || {};
        self.Id = data.Id;
        self.EntityType = data.EntityType;
        self.Parent = ko.observable(null);
        self.ParentId = data.ParentId;
        self.Name = ko.observable(data.Name);
        self.Children = ko.observableArray([]);
        self.RefreshChildrens = function (accid, acctype, accParentId) {
            if (accid == undefined) {
                var accid = $(event.currentTarget).find(".my-marker").data("accid");
                var acctype = $(event.currentTarget).find(".my-marker").data("acctype");
                var accParentId = $(event.currentTarget).find(".my-marker").data("accparentid");
            }
            getAccountData({ Id: accid, EntityType: acctype }, function (jsResult) {
                self.Children([]);

                self.Children($.map(jsResult, function (item) {
                    return new cAccountModel(item);
                }));
            }, function () {
                console.error("error on getting accounts");
            });
        }
        self.onheaderclick = function (data, event) {


            var bvmcontext = ko.contextFor(event.currentTarget);
            bvmcontext.$root.RemoveBreadCrumbItem(data.Id);

            bvmcontext.$root.CurrentNode(data.Parent());
            bvmcontext.$root.CurrentNode().RefreshChildrens(data.Parent().Id, data.Parent().EntityType, data.Parent().ParentId);
            if (data.Parent().EntityType.toLowerCase() == "general") {
                window.mapconfig.mapcontext.showNextNavigation(data.Parent(), 2, window.mapconfig.fullmap);
            } else if (data.Parent().EntityType.toLowerCase() == "dealer") {
                window.mapconfig.mapcontext.showNextNavigation(data.Parent(), 5, window.mapconfig.fullmap);
            }
            else if (data.Parent().EntityType.toLowerCase() == "customer" || data.Parent().EntityType.toLowerCase() == "group") {
                window.mapconfig.mapcontext.showNextNavigation(data.Parent(), 11, window.mapconfig.fullmap);
            }
                //else if (data.Parent().EntityType.toLowerCase() == "group") {
                //    window.mapconfig.mapcontext.showNextNavigation(data.Parent(), 6, window.mapconfig.fullmap);
                //}
            else if (data.Parent().EntityType.toLowerCase() == "site") {
                //  window.mapconfig.mapcontext.showNextNavigation(data.Parent(), 11, window.mapconfig.fullmap);
                window.mapconfig.mapcontext.showSite(data.Parent(), function () {
                    unblockUI();
                    $(document).find("#btnfloormaprefresh").css("display", "block");
                    window.mapconfig.mapcontext.SetmapMode(window.mapconfig.common.mapmode.FLOORPLANMODE, true, false);
                });
            }
            //var $menu_width = 'left:' + parseInt($('ul.nav.navbar-nav.pull-left.nav-list').width() - $('ul.nav.navbar-nav.pull-left.nav-list li:last-child').width() + 10) + 'px !important';
            var $menu_width = 'left:' + parseInt($('ul.nav.navbar-nav.pull-left.nav-list').width()-5) + 'px !important';
            if (data.Parent().EntityType.toLowerCase() == "general") {
                $('#bchildrenlist').attr('style', $menu_width);
            } else {
                console.log($menu_width);
                $('#bchildrenlist').attr('style', $menu_width);
            }



        }
    }
    window.mapconfig.bAccountModel = bAccountModel;
    var clusterexpanmodel = function () {
        self = this;
        self.items = ko.observableArray([]);
    }
    window.mapconfig.mapcontext.clusterexpanmodel = clusterexpanmodel;
    var sitemarkerModel = function (data, infowindow, mapobject) {
        var self = this;
        self.infowindow = infowindow;
        self.currentMapObject = mapobject;
        self.marker = data;
        self.Id = $(data.content).data('accid');
        self.EntityType = $(data.content).data('acctype');
        self.icon = ko.computed(function () {
            return "icon_" + self.EntityType.toLowerCase();
        });
        self.parentId = $(data.content).data('accparentid');
        self.title = $(data.content).attr('title');
        self.Name = $(data.content).attr('title');
        self.name = $(data.content).attr('title');
        self.siteClicked = function (data, event) {
            console.info('closing info window')
            self.infowindow.close(self.currentMapObject);
            if (self.currentMapObject.Name === 'FullMapView')
            window.mapconfig.mapcontext.siteMarkerItemClicked(data, event);
        }
    }
    window.mapconfig.mapcontext.sitemarkerModel = sitemarkerModel;
    //TODO refator, refactor put it into some object
    var markerObj;


    $.subscribe("markerData", function (data, bvmcontext) {
        markerObj = bvmcontext;
    });

    var breadcrumbViewModel = function () {
        var self = this;
        //TODO refator
        var filterTypeModel = function (data) {
            var self = this;
            data = data || {};
            self.menuitem = ko.observable(data.Name);
            self.Type = data.Type;
            self.OnSelectType = function (event, data) {
            }

        }
        //TODO refator
        var staticfilterTypes = [
                { Name: 'Cameras', Type: "CAMERA" },
                { Name: 'Doors', Type: "DOOR" },
                { Name: 'People', Type: "PEOPLE" },
                { Name: 'Landmarks', Type: "LANDMARK" }
        ];
        //TODO refator
        var filterDeviceModel = function (data) {
            var self = this;
            data = data || {};
            self.menuitem = ko.observable(data.Name);
            self.Type = data.Type;
            self.onSelectlistitem = function (event, data) {
                $("#devicelist").addClass("open");
            }

        }

        //TODO refator
        var staticDevicefilterTypes = [
                { Name: 'Device1', Type: "Device1" },
                { Name: 'Device2', Type: "Device2" },
                { Name: 'Device3', Type: "Device3" },
                { Name: 'Device4', Type: "Device4" }
        ];

        self.CurrentNode = ko.observable();
        self.bAccounts = ko.observableArray([]);
        self.bDisplayItmes = ko.computed(function () {
            for (var listofbreadcrum = 0; listofbreadcrum <= self.bAccounts().length; listofbreadcrum++) {
                firstelement = self.bAccounts()[0];
                if (self.bAccounts().length > 3) {
                    return [new bAccountModel({ Name: "...", EntityType: "LASTNODE" }), self.bAccounts()[self.bAccounts().length - 3], self.bAccounts()[self.bAccounts().length - 2], self.bAccounts()[self.bAccounts().length - 1]];
                } else {
                    return self.bAccounts();
                }
            }

        });
        self.statusclass = ko.observable("");
        self.icon = ko.computed(function () {
            if (self.EntityType != null) {
                if (self.statusclass() != "")
                    return "icon_" + self.EntityType.toLowerCase() + "_" + self.statusclass();
                return "icon_" + self.EntityType.toLowerCase();
            }
            else
                return " tree-open-icon";
        });


        self.selected= null;
        self.onclick = function (data, event) {
            var dorpid=$(event.currentTarget).data('dropdownid');
            if (self.selected == dorpid && $("#" + dorpid).hasClass("open")) {
                $("#" + dorpid).removeClass("open");
                self.selected = '';
                return;
            }
            self.selected = dorpid;
            $('#mapheadr').find('div.dropdown').removeClass('open');
            console.log("On Bread crumb click", data);
            if (window.mapconfig.infowindow && window.mapconfig.infowindow.isOpen) {
                window.mapconfig.infowindow.isOpen = false;
                window.mapconfig.infowindow.close(window.mapconfig.fullmap);
            }
            window.mapconfig.mapcontext.SetmapMode("1000", true, false);
            $(document).find($(".popover")).remove();
            var selecteditemId;
            var selecteditemEntityType;

            if (markerObj != 'undefined') {

                selecteditemId = self.CurrentNode().Id;
                selecteditemEntityType = self.CurrentNode().EntityType;
            } else {
                selecteditemId = markerObj.Id;
                selecteditemEntityType = markerObj.EntityType;
            }

            if (selecteditemEntityType.toLowerCase() == 'site') {

            }
            else {
                blockUI();
                getAccountData({ Id: selecteditemId, EntityType: selecteditemEntityType }, function (jsResult) {
                    unblockUI();
                    self.CurrentNode().Children($.map(jsResult, function (item) {

                        return new cAccountModel(item);
                    }));
                }, function () {
                    unblockUI();
                    console.error("error on getting accounts");
                });
            }
          
            $("#" + dorpid).addClass("open");
            var $menu_width = 'left:' + parseInt($('ul.nav.navbar-nav.pull-left.nav-list').width()-5) + 'px !important';
            //console.log($menu_width);
            //$('#bchildrenlist').attr('style', $menu_width);
            if (selecteditemEntityType.toLowerCase() == "general") {
                $('#bchildrenlist').attr('style', $menu_width);
            } else {
                console.log($menu_width);
                $('#bchildrenlist').attr('style', $menu_width);
            }
        }


        self.bDevices = ko.observableArray([]);
        self.FilterTypes = ko.observableArray([]);

        self.FilterDevices = ko.observableArray([]);

        self.AddBreadCrumbItem = function (data) {
            try {
                if (!_.find(self.bAccounts(), function (item) {
                    return item.Id == data.Id;
                })) {
                    self.bAccounts.push(new bAccountModel(data));
                }

            } catch (e) {
                console.error(e);
            }
        }
        self.RemoveBreadCrumbItem = function (id) {
            try {
                var rf = _.find(self.bAccounts(), function (item) {
                    return item.Id == id;
                });
                if (rf) {
                    self.bAccounts.remove(rf);
                }
            } catch (e) {
                console.error(e);
            }
        }
        self.initialize = function () {

            self.FilterTypes($.map(staticfilterTypes, function (item) {
                return new filterTypeModel(item);
            }));

            self.bDevices($.map(staticDevicefilterTypes, function (item) {
                return new filterDeviceModel(item);
            }));


        }

        self.loadDefaultselectedItem = function (map) {
            getAccountData(undefined, function (jsResult) {
                self.CurrentNode(new bAccountModel(jsResult[0]).Parent(new bAccountModel()));
                if (jsResult[0].Children.length > 0) {
                    var currentMarkerObject = jsResult[0];
                    currentMarkerObject.nodedata = '';
                    currentMarkerObject.nodedata = jsResult[0];
                    //window.mapconfig.mapcontext.addAllMarkers(currentMarkerObject, map);

                }
                self.bAccounts.push(self.CurrentNode());
            }, function () {
                console.error("error on getting accounts");
            });
        }
    }
    function loadScript() {
        var scriptRichmarker = document.createElement('script');
        scriptRichmarker.type = 'text/javascript';
        scriptRichmarker.src = window.location.href + '/Scripts/mapscripts/richmarker.js';
        document.body.appendChild(scriptRichmarker);

        var markerclusterer = document.createElement('script');
        markerclusterer.type = 'text/javascript';
        markerclusterer.src = window.location.href + '/Scripts/mapscripts/markerclusterer.js';
        document.body.appendChild(markerclusterer);
    }
    function startlocalops(data) {
        window.mapconfig.fullmap = data;

        console.log("window.mapconfig.fullmap", window.mapconfig.fullmap);
        loadScript();
        var brvm = new breadcrumbViewModel();
        brvm.initialize();
        brvm.loadDefaultselectedItem(window.mapconfig.fullmap);
        ko.applyBindings(brvm, document.getElementById("mapheadr"));
        getAccountData(undefined, function (jsResult) {

            if (jsResult[0].Children.length > 0) {
                var currentMarkerObject = jsResult[0];
                if (currentMarkerObject.EntityType.toLowerCase() == "dealer") {
                    window.mapconfig.mapcontext.showNextNavigation(currentMarkerObject, 5, window.mapconfig.fullmap);
                }
                else if (currentMarkerObject.EntityType.toLowerCase() == "customer" || currentMarkerObject.EntityType.toLowerCase() == "group") {
                    window.mapconfig.mapcontext.showNextNavigation(currentMarkerObject, 11, window.mapconfig.fullmap);
                }
                else if (currentMarkerObject.EntityType.toLowerCase() == "site") {
                    window.mapconfig.mapcontext.showNextNavigation(currentMarkerObject, 11, window.mapconfig.fullmap);
                }
                else {
                    window.mapconfig.mapcontext.showNextNavigation(currentMarkerObject, 2, window.mapconfig.fullmap);
                }
            }
        });
    }
    function initialize() {

        $("#map-canvas1").css({ 'width': '100%', 'height': '100%' });
        window.mapconfig.fullmapview = window.mapconfig.fullmapview || {};
        window.mapconfig.fullmap = null;
        window.googleMaps().init(function (data) {
            data.Name = "FullMapView";
            startlocalops(data);

        }, document.getElementById('map-canvas1'));

    }
    initialize();
    return fullmapviewContext;

})($);

