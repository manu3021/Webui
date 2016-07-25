(function () {

    var DashboardEventModel = window.dashboardconfig.DashboardEventModel;
    var DashboardEventCategoryModel = window.dashboardconfig.DashboardEventCategoryModel;
    var DashboardConfigModel = window.dashboardconfig.DashboardConfigModel;
    var DashboardModel = window.dashboardconfig.DashboardModel;
    var AlarmModel = window.dashboardconfig.AlarmModel;
    var FooterMenuModel = window.dashboardconfig.FooterMenuModel;
    var TreeNodeModel = window.dashboardconfig.TreeNodeModel;
    var DashboardPreviewModel = window.dashboardconfig.DashboardPreviewModel;

    window.dashboardconfig.AlarmViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll(this, 'initMonitor', 'onSocketOpen', 'onSocketMessage', 'onSocketClose','Token','socket');
            this.host = options.host;
            this.interval = options.interval;
            this.Token = {};
            this.socket = null;
            this.initMonitor();
        },
        initMonitor: function () {
            if (this.socket == null || (this.socket.isRetrying == false && this.socket.isOpen == false)) {
                var self = this;
                this.postDataRequest('/GetToken', null, function (err, result) {
                    self.Token = result;
                    self.socket = new autobahn.Connection({
                        url: self.host,
                        realm: "alarmRealm",
                        authmethods: ["ticket"],
                        max_retries: -1,
                        initial_retry_delay: self.interval,
                        max_retry_delay: self.interval,
                        authid: result.AuthenticationId,
                        onchallenge: function () { return result.Token; }
                    });
                    self.socket.onopen = self.onSocketOpen;
                    self.socket.onclose = self.onSocketClose;
                    self.socket.open();
                    if (result != undefined && result != null) {
                        self.publish(window.dashboardconfig.events.dashboard_socket_open, true);
                    }
                });
            }
        },       
        onSocketOpen: function (session,details) {
            debugger;            
            var self = this;            
            this.Token.Topics.forEach(function (item, index) {
                session.subscribe(item, self.onSocketMessage, { match: 'prefix' });
            });
            self.publish(window.dashboardconfig.events.dashboard_socket_open, true);            
        },
        onSocketMessage: function (msg) {
            //debugger;
            var model = new AlarmModel(msg);
            if (model.value && model.value != null) {
                if (model.value.EventCode != 5037)
                    this.publish(window.dashboardconfig.events.dashboard_system_event_received, [model.value]);

                //Added >= 5000 check, because we are going to get config upload event also here which is required for refreshing the create&edit settings -VV
                if (model.value.EventCode >= 5000 && model.value.EventType.toLowerCase() == "alarm") {
                    this.publish(window.dashboardconfig.events.dashboard_push_alarm_count, 1);
                }
            }
        },
        onSocketClose: function () {
            this.publish(window.dashboardconfig.events.dashboard_socket_close, true);
            //setTimeout(this.initMonitor, this.interval * 1000);
        }
    });

    window.dashboardconfig.DashboardConfigViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll(this, 'onEventSelection', 'onEventGroupSelection', 'removeEntity', 'onTreeviewExpand', 'onEventCategorySelection');
            this.dashboardId = options.dashboardId;
            this.initializeBinding(options);
        },
        initializeBinding: function (options) {
            var self = this;
            this.treeview = options.treeview;
            this.Intervals = 8;
            this.model = new DashboardConfigModel();
            this.dashboardEvents = ko.observableArray([]);
            this.isPopupOpen = ko.observable(false);
            this.popovername = Resources.lbl_Universal_List;
            this.ErrorMessage = ko.observable("");
            this.IsError = ko.observable(false);
            this.treeview.on(window.dashboardconfig.events.dashboard_treeview_expanded, this.onTreeviewExpand);
            this.getAllDashboardEvents(function () {
                self.getDashboard(function () {
                    self.treeview.setRootNodeData();
                    self.initializeDashboard();
                });
            });
        },
        onTreeviewExpand: function (node) {
            var self = this;
            _.each(node.Children(), function (item) {
                _.each(self.model.Entities(), function (e) {
                    if (item.Entity.Id() == e.Id && item.Entity.EntityType() == e.EntityType) {
                        item.IsSelected(true);
                    }
                });
            });
        },
        getAllDashboardEvents: function (cb) {
            var self = this;
            this.postDataRequest('/GetAllEventCategories', null, function (err, result) {
                if (!err && result) {
                    self.dashboardEvents(_.map(result.data || [], function (category) {
                        return new DashboardEventCategoryModel(category);
                    }));
                }
                if (cb) { cb(); }
            });
        },
        getDashboard: function (cb) {
            var self = this;
            if (this.dashboardId) {
                this.postDataRequest('/GetDashboardConfiguration', { dashboardId: this.dashboardId }, function (err, result) {
                    if (!err && result) {
                        self.model.dataSource(result.data);
                        if (cb) { cb(); }
                    }
                });
            }
            else {
                if (cb) { cb(); }
            }
        },
        initializeDashboard: function () {
            var self = this;
            _.each(this.model.Events(), function (e) {
                var eventModel = self.findEventByCode(e);
                if (eventModel != null) {
                    eventModel.IsSelected(true);
                    self.changeParentSelection(eventModel.parent, true);
                }
            });
        },
        saveDashboard: function () {
            var self = this;
            this.isPopupOpen(false);
            if (this.validationContext.validate() && this.validateEntities()) {
                var postData = { dashboard: this.model.toJson() };
                this.postDataRequest('/SaveDashboardConfiguration', postData, function (err, result) {
                    if (!err && result && !result.errorMessage) {
                        self.publish(window.dashboardconfig.events.dashboard_saved, result);
                    }
                    else {
                        self.IsError(true);
                        self.ErrorMessage((result && result.errorMessage) || window.dashboardconfig.messages.error_on_server);
                    }
                });
            }
        },
        cancelDashboard: function () {
            this.isPopupOpen(false);
            this.publish(window.dashboardconfig.events.dashboard_close_config);
        },
        validateEntities: function (mode) {
            var errorMsg = null;
            if (this.model.Entities().length == 0) {
                if (mode == 1) {
                    errorMsg = Resources.select_one_customer_site_preview;
                }
                else {
                    errorMsg = Resources.select_one_customer_site;
                }
            }
            else if (this.model.Events().length == 0) {
                if (mode == 1) {
                    errorMsg = Resources.select_one_event_preview;
                }
                else {
                    errorMsg = Resources.select_one_event;
                }
            }
            else if (this.model.IsPeriodSelected() && this.model.LastXDays() == 0) {
                errorMsg = Resources.Trend_Select_Range;
            }
            else if ((!!this.model.FromDateTime() && !this.model.ToDateTime()) ||
                    (!!this.model.ToDateTime() && !this.model.FromDateTime())) {
                errorMsg = Resources.Dashboard_Select_Date;
            }
            else if (!!this.model.FromDateTime() && !!this.model.ToDateTime()) {
                if (moment(this.model.FromDateTime()).isAfter(this.model.ToDateTime())) {
                    errorMsg = Resources.Dashboard_FromDate_LessThan_ToDate;
                }
                else if((moment.utc(this.model.ToDateTime()) - moment.utc(this.model.FromDateTime()) < this.Intervals * 60000))
                {
                    errorMsg = Resources.Dashboard_FromDate_ToDate_Min_Range;
                }
            }
            if (errorMsg) {
                this.ErrorMessage(errorMsg);
                this.IsError(true);
                return false;
            }
            else {
                this.ErrorMessage('');
                this.IsError(false);
                return true;
            }
        },
        onEventCategorySelection: function (eventCategory) {
            this.changeChildSelection(eventCategory, eventCategory.IsSelected());
            this.changeParentSelection(eventCategory.parent, eventCategory.IsSelected());
            return true;
        },
        onEventSelection: function (eventModel) {
            this.addOrRemoveEventCodes(eventModel);
            this.changeParentSelection(eventModel.parent, eventModel.IsSelected());
            return true;
        },
        addOrRemoveEventCodes: function (eventModel) {
            if (eventModel.IsSelected()) {
                if (this.model.Events.indexOf(eventModel.EventCode()) == -1) {
                    this.model.Events.push(eventModel.EventCode());
                }
            }
            else {
                this.model.Events.remove(eventModel.EventCode());
            }
        },
        changeParentSelection: function (ev, isSelected) {
            if (ev) {
                if (isSelected) {
                    var list = ev.Categories().length > 0 ? ev.Categories() : ev.Events();
                    var unSelectedEv = _.find(list, function (ev) { return ev.IsVisible() && !ev.IsSelected(); });
                    if (!unSelectedEv) {
                        ev.IsSelected(isSelected);
                        this.changeParentSelection(ev.parent, isSelected);
                    }
                }
                else {
                    ev.IsSelected(isSelected);
                    this.changeParentSelection(ev.parent, isSelected);
                }
            }
        },
        changeChildSelection: function (evc, isSelected) {
            _.each(evc.Categories(), function (ctgry) {
                ctgry.IsSelected(evc.IsSelected());
                this.changeChildSelection(ctgry, isSelected);
            }, this);
            _.each(evc.Events(), function (ev) {
                ev.IsSelected(evc.IsSelected());
                this.addOrRemoveEventCodes(ev);
            }, this);
        },
        onCategoryExpand: function (category) {
            category.IsExpanded(!category.IsExpanded());
            return true;
        },
        onPopoverCancelClick: function (data, event) {
            //this.treeview.selectNode(this.treeview.rootNode, false, true);
            this.isPopupOpen(false);
        },
        onPopoverConfirmClick: function () {
            var err = this.setSelectedEntities();
            if (!err) {

                this.isPopupOpen(false);
            }
            else {
                this.publish(window.dashboardconfig.events.add_entity_error, err);
            }
        },
        setSelectedEntities: function () {
            var self = this;
            var entities = [];
            _.each(this.model.Entities(), function (e) { entities.push(e); }, this);
            this.treeview.forEachNode(function (node) {
                var nData = _.find(entities, function (e) {
                    return e.Id == node.Entity.Id() && e.EntityType == node.Entity.EntityType();
                });
                if (node.IsSelected() && !nData) {
                    entities.push(node.toJson());
                }
                else if (!node.IsSelected() && nData) {
                    entities.splice(entities.indexOf(nData), 1);
                }
            });

            var siteNodes = _.filter(entities, function (item) {
                return item.EntityType.toUpperCase() == "SITE";
            });
            if (siteNodes.length == 0) {
                return 'Please select site';
            }
            this.model.Entities(siteNodes);
            return null;
        },
        removeEntity: function (entity) {
            this.model.Entities.remove(entity);
            var nodes = this.treeview.getNodes(function (node) {
                return node.Entity.Id() == entity.Id && node.Entity.EntityType() == entity.EntityType;
            });
            if (nodes.length > 0) {
                nodes[0].IsSelected(false);
            }
        },
        findEventByCode: function (eventCode) {
            return this.findEventByCodeInCategory(eventCode)[0];
        },
        findEventByCodeInCategory: function (eventCode, category, result) {
            result = result || [];
            if (category) {
                _.each(category.Events(), function (e) {
                    if (e.EventCode() == eventCode) {
                        result.push(e);
                    }
                });
                if (result.length == 0) {
                    _.each(category.Categories(), function (c) {
                        this.findEventByCodeInCategory(eventCode, c, result)
                    }, this);
                }
            }
            else {
                _.each(this.dashboardEvents(), function (c) {
                    this.findEventByCodeInCategory(eventCode, c, result)
                }, this);
            }
            return result;
        },
        previewDashboard: function () {
            if (this.validateEntities(1)) {
                this.publish(window.dashboardconfig.events.dashboard_show_preview, { dashboard: this.model.toJson() });
            }
        }
    });

    window.dashboardconfig.DashboardViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll('this', 'loadNextDashboard', 'loadByPageDashboard', 'renderCompleted')
            this.initializeBinding(options);
        },
        initializeBinding: function (options) {
            this.footer = options.footer;
            this.dashboardList = ko.observableArray([]);
            this.maxRecordCount = 2;
            this.minRecordCount = 1;
            this.pages = ko.observableArray([]);
            this.currentPage = ko.observable(0);            
            this.dashboards = ko.computed(function () {
                return _.sortBy(this.dashboardList(), function (dashboard) {
                    return dashboard.ItemMode();
                });
            }, this);            
            this.on(window.dashboardconfig.events.dashboard_delete_confirmed, this.onDeleteConfirm);
            this.on(window.dashboardconfig.events.dashboard_refresh, this.refreshDashboard)
            this.loadAllDashboards();
        },
        loadAllDashboards: function () {
            var self = this;
            this.dashboardList([]);
            this.pages([]);
            this.currentPage(0);
            this.dashboardList([this.getDashboardGraphicalViewModel(null, 1)]);            
            this.postDataRequest('/GetDashboardList', null, function (err, result) {
                if (!err && result) {
                    var jsonValues = result.data || [];
                    var sortedValues = _.sortBy(jsonValues, function (item) {
                        return item.IsDefault ? 0 : 1;
                    });
                    _.each(sortedValues, function (item, idx) {                        
                        item.IsLoaded = 0;
                        item.displayIndex = 1;
                        self.pages.push({ index: idx, name: item.Name });
                    });
                    //self.pages.push({ index: sortedValues.length, name: 'Create New' });
                    self.dashboardItems = sortedValues; 
                    self.loadDashboard(sortedValues.length);
                }
            });
        },
        loadDashboard: function (maxCount) {
            var self = this;
            var list = _.chain(this.dashboardItems)
                        .filter(function (item) { return item.IsLoaded == 0; })
                        .first(maxCount)
                        .value();
            if (list && list.length > 0) {
                _.each(list, function (item, idx) {                    
                    if (idx <= 1) {                        
                        item.IsLoaded = 1;
                        self.dashboardList.splice(self.dashboardList().length - 1, 0, self.getDashboardGraphicalViewModel(item));
                    }
                    else {                       
                        self.dashboardList.splice(self.dashboardList().length - 1, 0, self.getDashboardGraphicalViewModel(null));
                    }
                });
            }
        },
        //loadDashboard: function (maxCount) {
        //    var self = this;
        //    var list = _.chain(this.dashboardItems)
        //                .filter(function (item) { return item.IsLoaded == 0; })
        //                .first(maxCount)
        //                .value();            
        //    if (list && list.length > 0) {
        //        _.each(list, function (item) {                    
        //            item.IsLoaded = 1;
        //            self.dashboardList.splice(self.dashboardList().length - 1, 0, self.getDashboardGraphicalViewModel(item));
        //        });                
        //    }
        //},        
        loadDashboardWithIndex: function (maxCount, index, prevIndex) {            
            var self = this;
            var notLoadedIndex = 1;
            var nextIndex = index + 1,
                arrIndexes = [index, nextIndex];
            var list = this.dashboardItems.filter(function (itm, idx) {
                if (arrIndexes.indexOf(idx) != -1 && itm.IsLoaded == false) {
                    notLoadedIndex = idx;
                    return this;
                }
            });
            if (list && list.length > 0) {                
                _.each(list, function (itm, idx) {
                    if (idx == 0 && list.length == 2) {
                        itm.displayIndex = 0;
                    }
                    else if (list.length == 1) {
                        if (Math.max.apply(null, arrIndexes) == notLoadedIndex) {
                            itm.displayIndex = 1;
                        }
                        else {
                            itm.displayIndex = 0;
                        }                        
                    }
                    itm.IsLoaded = 1;
                    self.dashboardList.splice(self.dashboardList().length - 1, 0, self.getDashboardGraphicalViewModel(itm));
                });
            }            
        },
        loadNextDashboard: function (data, event) {           
            var self = this;
            var nextIndex = self.currentPage() + 1;
            if (nextIndex >= self.pages().length) nextIndex = 0;
            this.loadDashboard(this.minRecordCount);
            setTimeout(function () {
                self.trigger(window.dashboardconfig.events.dashboard_load_next, { 'nextIndex': nextIndex });
            }, 1);
        },       
        loadByPageDashboard: function (data, event) {
            var self = this;
            var prevIndex = self.currentPage() ? self.currentPage() : 0,
                currIndex = data.index;
            self.currentPage(data.index);
            if (prevIndex != currIndex && currIndex != 0)
                this.loadDashboardWithIndex(2, currIndex, prevIndex);
            setTimeout(function () {
                self.trigger(window.dashboardconfig.events.dashboard_load_bypage, { 'currIndex': currIndex, 'prevIndex': prevIndex });
            }, 1);
        },
        loadPreviousDashboard: function (data, event) {
            var nextIndex = this.currentPage() - 1;
            if (nextIndex < 0) nextIndex = this.pages().length - 1;
            this.trigger(window.dashboardconfig.events.dashboard_load_previous, { 'nextIndex': nextIndex });
        },
        renderCompleted: function (e) {            
            this.trigger(window.dashboardconfig.events.dashboard_load_next, {});
            this.trigger(window.dashboardconfig.events.dashboard_load_bypage, {});
        },
        refreshDashboard: function () {
            this.loadAllDashboards();
        },
        getDashboardGraphicalViewModel: function (data, itemMode) {
            return new window.dashboardconfig.DashboardGraphicalViewModel({
                data: data,
                baseUrl: this.baseUrl,
                antiForgeryToken: this.antiForgeryToken,
                itemMode: itemMode
            });
        },
        deleteDashboard: function (data, event) {
            this.publish(window.dashboardconfig.events.dashboard_delete_confirm, { dashboardId: data.model.Id() });
        },
        onDeleteConfirm: function (dashboardId) {
            var self = this;
            this.postDataRequest('/DeleteDashboard', { dashboardId: dashboardId }, function (err, result) {
                if (!err && result) {
                    if (result.Success) {
                        self.publish(window.dashboardconfig.events.dashboard_deleted, result);
                    }
                    else {
                        self.IsError(true);
                        self.ErrorMessage(result.errorMessage);
                    }
                }
            });
        }
    });

    window.dashboardconfig.DashboardGraphicalViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll(this, 'drillUpTo');
            this.initializeBinding(options);
        },
        initializeBinding: function (options) {
            this.Intervals = 8;
            this.ItemMode = ko.observable(options.itemMode || 0);
            this.drillHistory = ko.observableArray();
            this.IsDataAvailable = ko.observable(true);
            this.IsLoaded = ko.observable(false);
            this.IsChartLoaded = ko.observable(false);            
            this.message = ko.computed(function () {
                if (this.IsLoading())
                    return Resources.Calendar_Loading;
                else if (!this.IsDataAvailable())
                    return Resources.Dashboard_No_Data_Available;
                else
                    return null;
            }, this);
            if (!this.ItemMode()) {
                this.model = new DashboardModel(options.data);
                this.getDashboardInfo();
            }
        },
        updateLastUpdatedDateTime: function () {
            this.model.LastUpdatedTime(moment(new Date()).format('LLL'));
        },
        createDashboard: function () {
            this.publish(window.dashboardconfig.events.dashboard_start_config);
        },
        editDashboard: function () {
            this.publish(window.dashboardconfig.events.dashboard_start_config, { dashboardId: this.model.Id() });
        },
        getDashboardInfo: function (cb) {
            var self = this;
            var data = this.getDrilldownData();
            if (data.DashboardId != undefined) {
                this.postDataRequest('/GetDashboardInfo', { dashboardDrill: data }, function (err, result) {
                    if (!err && result && result.Success) {
                        self.IsDataAvailable(result.data && result.data.Entities && result.data.Entities.length > 0);
                        self.model.setChart(result.data, self.drillHistory().length > 0, self.statusFilter);
                        self.updateLastUpdatedDateTime();
                        if (cb) { cb(true); }
                    }
                    else if (cb) {
                        cb(false);
                    }
                });
            }
        },
        refreshDashboard: function () {
            this.getDashboardInfo();
        },
        onLegendClick: function (legendIndex) {
            switch (this.model.Chart().DashboardType) {
                case 0:
                    var entity = this.model.Chart().Entities[legendIndex];
                    this.onDrillDown(entity);
                    break;
            }
        },
        onPointClick: function (legendIndex, pointIndex) {
            switch (this.model.Chart().DashboardType) {
                case 0:
                    var slot = this.model.Chart().SlotNames[pointIndex];
                    var prevSlot = this.model.Chart().SlotNames[pointIndex - 1] || null;
                    this.onDrillDown(null, slot, prevSlot);
                    break;
                case 1:
                    if (this.model.Chart().isDrillDown) {
                        var entity = this.model.Chart().Entities[pointIndex];
                        this.onDrillDown(entity);
                    }
                    else {
                        this.statusFilter = this.model.Chart().SlotNames[pointIndex];
                        this.onDrillDown();
                    }
                    break;
            }
        },
        onDrillDown: function (entity, endDate, startDate) {
            if (this.addDrillHistory(entity, endDate, startDate)) {
                this.getDashboardInfo(function (isSuccess) {
                    if (!isSuccess) {
                        self.drillHistory.pop();
                    }
                });
            }
        },
        onDrillUp: function () {
            this.drillHistory.pop();
            this.getDashboardInfo();
        },
        drillUpTo: function (record) {
            var recordIndex = this.drillHistory().indexOf(record);
            this.drillHistory.splice(recordIndex + 1);
            this.getDashboardInfo();
        },
        getDrilldownData: function () {
            var lastEntity = this.getLastEntity();
            return {
                DashboardId: this.model.Id(),
                Grouped: true,
                Intervals: this.Intervals,
                EntityId: lastEntity.EntityId,
                EntityType: lastEntity.EntityType,
                DrillDownStartDate: lastEntity.DrillDownStartDate,
                DrillDownEndDate: lastEntity.DrillDownEndDate
            };
        },
        getLastEntity: function () {
            var drilldownItem = this.drillHistory().length > 0 ? this.drillHistory()[this.drillHistory().length - 1] : null;
            return {
                EntityId: (drilldownItem && drilldownItem.EntityId) || null,
                EntityType: (drilldownItem && drilldownItem.EntityType) || null,
                DrillDownStartDate: (drilldownItem && drilldownItem.DrillDownStartDate) || null,
                DrillDownEndDate: (drilldownItem && drilldownItem.DrillDownEndDate) || null,
                Name: (drilldownItem && drilldownItem.Name) || null
            };
        },
        addDrillHistory: function (entity, endDate, startDate) {
            var lastEntity = this.getLastEntity();
            startDate = startDate || lastEntity.DrillDownStartDate;
            if ((entity && ((this.model.IsDefault() && entity.EntityType.toUpperCase() == 'DEVICE')
                    || (!this.model.IsDefault() && entity.EntityType.toUpperCase() == 'EVENT')))
                || (endDate && startDate && (moment.utc(endDate) - moment.utc(startDate) <= this.Intervals * 60000))) {
                return false;
            }
            this.drillHistory.push({
                EntityId: endDate ? lastEntity.EntityId : entity && entity.EntityId,
                EntityType: endDate ? lastEntity.EntityType : entity && entity.EntityType,
                DrillDownStartDate: endDate ? startDate : lastEntity.DrillDownStartDate,
                DrillDownEndDate: endDate ? endDate : lastEntity.DrillDownEndDate,
                Name: endDate ? lastEntity.Name : entity && entity.EntityName,
                IsEntityDrill: !!entity
            });
            return true;
        }
    });

    window.dashboardconfig.DashboardPreviewViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll(this);
            this.initializeBinding(options);
        },
        initializeBinding: function (options) {
            this.IsLoaded = ko.observable(false);
            this.IsDataAvailable = ko.observable(true);
            this.message = ko.computed(function () {
                if (this.IsLoading())
                    return Resources.Calendar_Loading;
                else if (!this.IsDataAvailable())
                    return Resources.Dashboard_No_Data_Available;
                else
                    return null;
            }, this);
            this.model = new DashboardModel();
            this.getDashboardPreview(options.data);
        },
        getDashboardPreview: function (data) {
            var self = this;
            this.postDataRequest('/GetDashboardPreview', data, function (err, result) {
                if (!err && result && result.Success) {
                    self.IsDataAvailable(result.data && result.data.Entities && result.data.Entities.length > 0);
                    self.model.setChart(result.data, false);
                }
                else {
                    self.publish(window.dashboardconfig.events.dashboard_close_preview, { IsError: true });
                }
            });
        },
        onLegendClick: function () {
            return false;
        },
        closePreview: function () {
            this.publish(window.dashboardconfig.events.dashboard_close_preview, { IsError: false });
        }
    });

    window.dashboardconfig.FooterViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll(this, 'onMenuSelected');
            this.initializeBinding();
        },
        initializeBinding: function (options) {
            this.menulist = ko.observableArray([]);
            this.getMenuItems();
        },
        getMenuItems: function () {
            var self = this;
            this.postDataRequest('/GetFooterMenuItems', null, function (err, result) {
                self.menulist.push.apply(self.menulist, result.map(function (data) {
                    return new FooterMenuModel(data);
                }));
            });
        },
        onMenuSelected: function (menuItem) {
            this.publish(window.dashboardconfig.events.dashboard_footer_menu_clicked, menuItem);
        }
    });

    window.dashboardconfig.TreeViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll(this, 'toggleExpand', 'handleSelection');
            this.options = options;
            this.initializeBinding(options);
        },
        initializeBinding: function () {
            this.rootNode = new TreeNodeModel({ EntityType: 'ROOT' });
        },
        setRootNodeData: function () {
            var self = this;
            var options = this.options;
            if (options.rootNodeData) {
                this.rootNode.bindChildNodes([options.rootNodeData]);
                this.trigger(window.dashboardconfig.events.dashboard_treeview_expanded, this.rootNode);
                if (options.depth == 1) {
                    this.expandChildren(this.rootNode);
                }
            }
            else {
                this.expandNode(this.rootNode, false, false, function () {
                    if (options.depth == 1) {
                        self.expandChildren(self.rootNode);
                    }
                });
            }
        },
        toggleExpand: function (record) {
            var isExpanded = record.IsExpanded();
            if (isExpanded) {
                record.IsExpanded(false);
            }
            else {
                this.expandNode(record, isExpanded);
            }
        },
        expandNode: function (record, isExpanded, isUpdate, completed) {
            var self = this;
            if (!isExpanded && this.isExpandable(record)) {
                if (record.Children().length == 0 || isUpdate) {
                    this.postDataRequest('/GetDashboardAccounts', {
                        id: record.Entity.Id(),
                        nodeType: record.Entity.EntityType() ? record.Entity.EntityType().toUpperCase() : null
                    }, function (err, val) {
                        record.bindChildNodes(val, isUpdate);
                        if (val && val.length > 0) {
                            record.IsExpanded(true);
                        }
                        self.trigger(window.dashboardconfig.events.dashboard_treeview_expanded, record);
                        if (completed) { completed(record.Children()); }
                    });
                }
                else {
                    record.IsExpanded(true);
                    if (completed) { completed(record.Children()); }
                }
            }
        },
        expandChildren: function (record) {
            if (record.Children()) {
                for (var i in record.Children()) {
                    this.expandNode(record.Children()[i], false);
                }
            }
        },
        expandAllChildren: function (record) {
            var self = this;
            this.expandNode(record, false, false, function (nodes) {
                for (var i in nodes || []) {
                    self.expandAllChildren(nodes[i]);
                }
            });
        },
        isExpandable: function (node) {
            var nodeType = node.Entity.EntityType();
            if (nodeType) {
                return !this.options.expandableNodeTypes || this.options.expandableNodeTypes.indexOf(nodeType.toUpperCase()) != -1;
            }
            return false;
        },
        handleHover: function (record) {
            if (!record.IsSelected()) {
                record.IsHover(true);
            }
            record.StatusClass('Hover');
        },
        handleHoverOut: function (record) {
            record.IsHover(false);
            record.StatusClass('');
        },
        handleSelection: function (record) {
            this.selectNode(record, !record.IsSelected());
        },
        selectNode: function (node, isSelected) {
            if (node) {
                node.IsHover(false);
                node.selectNode(isSelected);
                this.expandAllChildren(node);
            }
        },
        refresh: function (node) {
            node = node || this.rootNode;
            for (var i in node.Children()) {
                if (node.Children()[i].IsExpanded() || node.Children()[i].Children().length > 0) {
                    this.expandNode(node.Children()[i], false, true);
                    this.refresh(node.Children()[i]);
                }
            }
        },
        getNodes: function (trueTest, node, dataList) {
            dataList = dataList || [];
            if (node) {
                if (!trueTest || trueTest(node)) {
                    dataList.push(node);
                }
            }
            else {
                node = this.rootNode;
            }
            for (var i in node.Children()) {
                this.getNodes(trueTest, node.Children()[i], dataList);
            }
            return dataList;
        },
        forEachNode: function (callback, node) {
            if (node) {
                callback(node);
            }
            else {
                node = this.rootNode;
            }
            for (var i in node.Children()) {
                this.forEachNode(callback, node.Children()[i]);
            }
        },
        toJson: function (trueTest, node, dataList) {
            dataList = dataList || [];
            if (node) {
                if (!trueTest || trueTest(node)) {
                    dataList.push(node.toJson());
                }
            }
            else {
                node = this.rootNode;
            }
            for (var i in node.Children()) {
                this.toJson(trueTest, node.Children()[i], dataList);
            }
            return dataList;
        }
    });
})();