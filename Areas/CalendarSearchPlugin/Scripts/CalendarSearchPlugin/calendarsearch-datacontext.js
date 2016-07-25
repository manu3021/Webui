(function () {

    var DigestModel = window.calendarsearch.DigestModel;
    var ClipModel = window.calendarsearch.ClipModel;
    var ClipExportModel = window.calendarsearch.ClipExportmodel;
    var AlarmModel = window.calendarsearch.AlarmModel;
    var EventSummaryModel = window.calendarsearch.EventSummaryModel;
    var FilterModel = window.calendarsearch.FilterModel;
    var TreeNodeModel = window.calendarsearch.TreeNodeModel;
    var dateTimeFormat = window.calendarsearch.dateTimeFormat;
    var clipReportTypeEnum = window.calendarsearch.clipReportTypeEnum;
    var alarmReportTypeEnum = window.calendarsearch.clipReportTypeEnum;
    var clipStatusEnum = window.calendarsearch.clipStatusEnum;

    window.calendarsearch.CalendarSearchViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll(this, 'itemSelected', 'alarmSelected', 'playClip', 'performAction');
            this.initializeBinding(options);
        },
        initializeBinding: function (options) {
            this.treeview = options.treeview;
            this.events = ko.observableArray();
            this.clipModel = new ClipModel();
            this.alarmModel = new AlarmModel();
            this.eventSummaryModel = new EventSummaryModel();
            this.eventClipdetails = ko.observableArray([]);
            this.selectedDate = ko.observable();
            this.isMonthView = ko.observable();
            this.selectedEntities = ko.observableArray([]);
            this.isPopupOpen = ko.observable(false);
            this.IsLoading = ko.observable(false);
            this.selectedRange = ko.observable();
            this.viewMode = ko.observable(0);
            this.selectedTimeRange = {};
            this.canLoad = true;
            this.eventPagingInfo = {startIndex : 0, maxRecordCount : 10};
            this.clipPagingInfo = { startIndex: 0, maxRecordCount: 10 };
            this.clipStatus = ko.observable(clipStatusEnum.None);
            this.startDateTimeObj = ko.observable(new Date()),
            this.playingDateTime = ko.observable("");
            this.playingSec = 0;
            this.DoorActions = ['lock', 'unlock', 'timedpulse','energize', 'deenergize'];
            this.message = ko.computed(function () {
                if (this.IsLoading())
                    return Resources.Calendar_Loading;
                else if (this.selectedEntities().length == 0)
                    return Resources.Calendar_Select_Devices;
                else if (this.eventClipdetails().length == 0)
                    return Resources.Calendar_No_Results_Found;
                else
                    return '';
            }, this);
            this.selectedDeviceNames = ko.computed(function () {
                var deviceCount = this.selectedEntities().length;
                if (deviceCount > 0) {
                    return deviceCount > 1 ? this.selectedEntities()[0].Name + ' + ' + (deviceCount - 1) : this.selectedEntities()[0].Name;
                }
                return Resources.Select_Camera;
            }, this);
        },
        filterSelected: function(data){
            this.viewMode(data);
            if (data == 1) {
                this.stopClip();
            }
            else if(data == 2){
                this.eventSummaryModel.dataSource(null, null);
            }
        },
        onCalendarRender: function (view) {
            this.loadCalendarEvents();
        },
        onEventSelect: function (data) {
            if (data && data.start && this.isMonthView()) {
                this.selectedRange({ start: data.start, end: data.start });
            }
        },
        onPopoverCancelClick: function (data, event) {
            this.isPopupOpen(false);
        },
        onPopoverConfirmClick: function () {
            this.selectedEntities(this.treeview.toJson(function (node) {
                return node.IsSelected();
            },true));
            this.isPopupOpen(false);
            this.loadCalendarEvents();
        },
        loadCalendarEvents: function () {
            var self = this;
            this.eventSummaryModel.dataSource(null, null);
            this.stopClip(function () {
                self.eventClipdetails([]);
                self.events([]);
                var events = [];
                self.getClipCount(events, function () {
                    self.getEventCount(events, function () {
                        self.events(events);
                        if (!self.isMonthView()) {
                            self.setDefaultTimeSelection();
                        }
                    });
                });
            });
        },
        getClipCount: function (events, cb) {
            var self = this;
            if (this.selectedEntities().length > 0) {
                var query = {
                    calendarSearchEntity: this.getCalendarSearchEntity(),
                    startDateTime: this.isMonthView() ? this.getSpecificDate(1) : this.getFormattedDate(dateTimeFormat.Start),
                    endDateTime: this.isMonthView() ? this.getLastDate() : this.getFormattedDate(dateTimeFormat.End),
                    mode: this.isMonthView() ? clipReportTypeEnum.DAY : clipReportTypeEnum.HOUR
                };
                this.postDataRequest('/GetClipCount', query, function (err, result) {
                    if (!err && result) {
                        if (result.Success && result.data) {
                            self.getDisplayEvents(result.data, events);
                        }
                    }
                    if (cb) { cb(); }
                });
            }
            else if (cb) { cb(); }
        },
        getEventCount: function (events, cb) {
            var self = this;
            if (this.selectedEntities().length > 0) {
                var query = {
                    calendarSearchEntity: this.getCalendarSearchEntity(),
                    startDateTime: this.isMonthView() ? this.getSpecificDate(1) : this.getFormattedDate(dateTimeFormat.Start),
                    endDateTime: this.isMonthView() ? this.getLastDate() : this.getFormattedDate(dateTimeFormat.End),
                    mode: this.isMonthView() ? clipReportTypeEnum.DAY : clipReportTypeEnum.HOUR
                };
                this.postDataRequest('/GetEventCount', query, function (err, result) {
                    if (!err && result) {
                        if (result.Success && result.data) {
                            self.getDisplayEvents(result.data, events);
                        }
                    }
                    if (cb) { cb(); }
                });
            }
            else if (cb) { cb(); }
        },
        onTimeChange: function (startDate, endDate) {        
            var self = this;
            this.resetPagingInfo();
            this.eventSummaryModel.dataSource(null, null);           
            this.selectedDateTimeRange = { startDateTime: startDate, endDateTime: endDate };
            this.stopClip(function () {
                self.eventClipdetails([]);
                self.getClipDetails(function () {
                    self.getEventDetails();
                });
            });
        },
        resetPagingInfo: function () {
            this.eventPagingInfo.startIndex = this.clipPagingInfo.startIndex = 0;
        },
        setDefaultTimeSelection: function () {          
            if (this.events().length > 0) {
                var event = this.events()[0];                
                if (event.start) {
                    var startMinute = event.start.getMinutes();
                    var start = startMinute > 30 ?
                                moment(event.start.format('yyyy-mm-dd HH:30:00')) :
                                moment(event.start.format('yyyy-mm-dd HH:00:00'));
                    var end = startMinute > 30 ?
                                moment(event.start.format('yyyy-mm-dd HH:59:59')) :
                                moment(event.start.format('yyyy-mm-dd HH:30:00'));
                    this.selectedRange({ start: start, end: end });
                }
            }
            else {
                this.selectedRange({});
            }
        },
        getClipFilterModel: function (startDate, endDate) {            
            var filterModel = new FilterModel();           
            //filterModel.FromUTCDatetime(startDate.format(dateTimeFormat.LongDateTime).toUTCDateString());
            //filterModel.ToUTCDatetime(endDate.format(dateTimeFormat.LongDateTime).toUTCDateString());
            filterModel.FromUTCDatetime(moment(startDate).utc().format(dateTimeFormat.LongDateTime));
            filterModel.ToUTCDatetime(moment(endDate).utc().format(dateTimeFormat.LongDateTime));
            filterModel.IsMotionEvent(true);
            filterModel.IsSchedule(true);
            filterModel.IsTriggerEvent(true);
            filterModel.IsOnsite(false);
            filterModel.IsCloud(true);
            filterModel.IsUserdriven(true);
            filterModel.IsRuledriven(true);
            return filterModel;
        },
        getClipDetails: function (cb) {           
            var self = this;
            if (this.selectedEntities().length > 0) {                
                var filterModel = this.getClipFilterModel(this.selectedDateTimeRange.startDateTime, this.selectedDateTimeRange.endDateTime);
                var filterJson = !!filterModel ? filterModel.toJson() : null;
                var entitiesJson = this.getCalendarSearchEntity();
                var postData = { filter: filterJson, calendarSearchEntity: entitiesJson };
                this.postDataRequest('/GetClipDetails', postData, function (err, result) {
                    if (!err && result) {
                        if (result.Success && result.data) {
                            _.each(result.data, function (item) {
                                item.IsCloud = filterJson.IsCloud;
                                self.eventClipdetails.push(new ClipModel(item));
                            });
                        }
                    }
                    if (cb) { cb(); }
                });
            }
        },
        getEventDetails: function (cb) {
            var self = this;
            if (this.selectedEntities().length > 0) {
                var entitiesJson = this.getCalendarSearchEntity();
                var postData = {
                    calendarSearchEntity: entitiesJson,
                    startDateTime: moment(this.selectedDateTimeRange.startDateTime).format('YYYY-MM-DD HH:mm:ssZ'),
                    endDateTime: moment(this.selectedDateTimeRange.endDateTime).format('YYYY-MM-DD HH:mm:ssZ'),
                    startIndex: this.eventPagingInfo.startIndex,
                    maxRecordCount: this.eventPagingInfo.maxRecordCount
                };
                if (this.canLoad) {
                    this.canLoad = false;
                    this.postDataRequest('/GetEventDetails', postData, function (err, result) {
                        if (!err && result) {
                            if (result.Success && result.data) {
                                _.each(result.data, function (item) {
                                    self.eventClipdetails.push(new AlarmModel(item));
                                });
                                self.eventPagingInfo.startIndex += result.data.length;
                            }
                        }
                        self.canLoad = true;
                        if (cb) { cb(events); }
                    });
                }
            }
        },
        loadNextItems: function(){
            this.getEventDetails();
        },
        itemSelected: function (record) {
            if (record) {
                var self = this;
                this.eventSummaryModel.dataSource(null);
                this.stopClip(function () {
                    if (record.Type == 'clip') {
                        self.clipModel.dataSource(record.toJs(), self.createGuid());
                        self.playClip();
                    }
                    else {
                        self.GetEventSummary(record);
                    }
                });
            }
        },
        GetEventSummary: function (record, cb) {
            var self = this;
            if (record.Id()) {
                this.postDataRequest('/GetAssociationInfoForEvent', {eventId : record.Id()}, function (err, result) {
                    if (!err && result) {
                        if (result.Success && result.data) {
                            self.getActionsForEvent(record.SourceEntityType(), record.SourceEntityId(), record.EventCode(), function (actions) {
                                self.eventSummaryModel.dataSource(result.data, record.toJson(), actions);
                            });
                        }
                    }
                });
            }
        },
        getActionsForEvent: function(entityType, entityId, eventCode, cb){
            var postData = { entityType: entityType, entityId: entityId, eventCode: eventCode };
            this.postDataRequest('/GetActionByEvent', postData, function (err, result) {
                if (!err && result) {
                    if (cb) { cb(result.data); }
                }
            });
        },
        performAction: function (action) {
            var self = this;
            var entityType = this.eventSummaryModel.EventInfo.SourceEntityType();
            var entityId = this.eventSummaryModel.EventInfo.SourceEntityId();
            if(this.eventSummaryModel.EventInfo.AssociatedDoors().length > 0 &&
                this.DoorActions.indexOf(action.Name().toLowerCase()) != -1){
                entityType = 'DOOR';
                entityId = this.eventSummaryModel.EventInfo.AssociatedDoors()[0].Id;
            }
            this.postDataRequest('/PerformAction', {entityType: entityType, entityId: entityId, actionName: action.Name()}, function (err, result) {
                if (!err && result) {
                    self.publish(window.calendarsearch.events.event_action_performed, { Success: result.Success })
                }
            });
        },
        getClipURL: function (sessionId, clipId, cameraId, cb) {
            var self = this;
            var tzoffset = (new Date().getTimezoneOffset()) * -1;
            var data = {
                sessionId: sessionId,
                clipId: clipId,
                cameraId: cameraId,
                timeZoneOffset: tzoffset
            };
            this.postDataRequest('/GetClipURL', data, function (err, result) {
                var resultData = null;
                if (!err && result) {
                    if (result.Success && result.data) {
                        resultData = result.data;
                    }
                }
                if (cb) { cb(resultData); }
            });
        },
        playClip: function () {            
            var self = this;
            if (this.clipModel.ClipId() && this.clipModel.CameraId()) {
                //Check if flash is installed
                if (!swfobject.hasFlashPlayerVersion("1")) {
                    alertify.alert(Resources.plsinstflashplayer + '<br/><a href="https://get.adobe.com/flashplayer/" target="_blank">' + Resources.clkdwnadbflsplr + '</a>');
                    return;
                }
                this.clipStatus(clipStatusEnum.Requesting)
                this.getClipURL(this.clipModel.SessionId, this.clipModel.ClipId(), this.clipModel.CameraId(), function (url) {
                    self.clipStatus(url ? clipStatusEnum.LoadSuccessful : clipStatusEnum.LoadFailed);
                    self.publish(window.calendarsearch.events.play_clip_requested, { url: url });
                });
            }
        },        
        stopClip: function (cb) {
            var self = this;
            if (this.clipModel && this.clipModel.CameraId() && this.clipModel.SessionId) {
                var jsonData = {
                    cameraId: this.clipModel.CameraId(),
                    sessionId: this.clipModel.SessionId
                };
                this.postDataRequest('/PlaybackStopRequest', jsonData, function (err, result) {
                    self.clipModel.dataSource(null, null);
                    self.publish(window.calendarsearch.events.close_clip_requested, {});
                    if (cb && typeof (cb) === 'function') { cb(); }
                });
            }
            else {
                if (cb && typeof (cb) === 'function') { cb(); }
            }
        },
        showClipExport: function (record) {
            this.publish(window.calendarsearch.events.clip_export_show, { clipModel: this.clipModel });
        },
        getLastDate: function (date) {
            var date = date || this.selectedDate();
            var lastDate = new Date(new Date(date).setDate(1)).addMonths(1).addDays(-1);
            return moment(lastDate).format(dateTimeFormat.End);
        },
        getSpecificDate: function (dayNumber, excludeTZ, date) {
            var date = date || this.selectedDate();
            var specificDate = new Date(new Date(date).setDate(parseInt(dayNumber)))
            if (excludeTZ) {
                return moment(specificDate).format(dateTimeFormat.ShortDateStart);
            }
            else {
                return moment(specificDate).format(dateTimeFormat.Start);
            }
        },
        getFormattedDate: function(format, date) {
            var date = date || this.selectedDate();
            return moment(date).format(format);
        },
        getUtcDate: function(date) {
            return moment(date).utc().format(dateTimeFormat.LongDateTime);
        },
        getDisplayEvents: function (list, events) {
            if (this.isMonthView()) {
                _.each(list, function (data) {
                    events.push(new DigestModel({
                        Data: data.Count,
                        Type: data.ItemType.toLowerCase() == 'clip' ? window.calendarsearch.calendarEventType.Clip : window.calendarsearch.calendarEventType.Event,
                        StartDate: this.getSpecificDate(data.Date, true)
                    }));
                }, this);
            }
            else {
                _.each(list, function (data) {
                    _.each(data.Data, function (ct) {
                        events.push(new DigestModel({
                            Data: data.Count,
                            Type: data.ItemType.toLowerCase() == 'clip' ? window.calendarsearch.calendarEventType.Clip : window.calendarsearch.calendarEventType.Event,
                            StartDate: moment.utc(ct).toDate().toString('yyyy-MM-dd HH:mm:ss')
                        }));
                    });
                });
            }
            return events;
        },
        getCalendarSearchEntity: function () {
            var accountTypes = $.map(window.calendarsearch.accountEntityTypes, function (item) { return item });
            var accountEntities = null;
            if (accountTypes) {
                accountEntities = ko.utils.arrayFilter(this.selectedEntities(), function (item) {
                    return item.EntityType && accountTypes.indexOf(item.EntityType.toUpperCase()) != -1;
                });
            }
            var cameraEntities = ko.utils.arrayFilter(this.selectedEntities(), function (item) {
                return item.EntityType.toUpperCase() === window.calendarsearch.deviceEntityTypes.Camera;
            });
            var deviceEntities = ko.utils.arrayFilter(this.selectedEntities(), function (item) {
                return item.EntityType.toUpperCase() === window.calendarsearch.deviceEntityTypes.Door;
            });
            return {
                AccountEntities: accountEntities ? ko.toJS(accountEntities) : null,
                CameraEntities: cameraEntities ? ko.toJS(cameraEntities) : null,
                DeviceEntities: deviceEntities ? ko.toJS(deviceEntities) : null
            };
        }
    });

    window.calendarsearch.ClipExportViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll(this);
            this.initializeBinding(options);
        },
        initializeBinding: function (options) {
            this.model = new ClipExportModel(options);
        },
        exportClip: function () {
            if (this.validationContext.validate()) {
                this.publish(window.calendarsearch.events.clip_data_recieved, this.model)
                this.publish(window.calendarsearch.events.clip_export_close);
            }
        },
        cancelClipExport: function () {
            this.validationContext.reset();
            this.publish(window.calendarsearch.events.clip_export_close);
        }
    });

    window.calendarsearch.TreeViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll(this, 'toggleExpand', 'handleSelection');
            this.options = options;
            this.initializeBinding(options);
        },
        initializeBinding: function (options) {
            this.rootNode = new TreeNodeModel({ EntityType: 'ROOT' });
            this.setRootNodeData(options);
        },
        setRootNodeData: function (options) {
            var self = this;
            if (options.rootNodeData) {
                this.rootNode.bindChildNodes([options.rootNodeData]);
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
                    this.postDataRequest('/GetTreeviewItem', {
                        id: record.Entity.Id(),
                        nodeType: record.Entity.EntityType() ? record.Entity.EntityType().toUpperCase() : null
                    }, function (err, val) {
                        record.bindChildNodes(val.data, isUpdate);
                        if (val.data && val.data.length > 0) {
                            record.IsExpanded(true);
                        }
                        if (completed) { completed(); }
                    });
                }
                else {
                    record.IsExpanded(true);
                    if (completed) { completed(); }
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
        toJson: function (trueTest, selectOnlyParent, node, dataList) {
            dataList = dataList || [];
            if (node) {
                if (!trueTest || trueTest(node)) {
                    if (!(selectOnlyParent &&
                        node.ParentNode &&
                        node.ParentNode != this.rootNode &&
                        node.ParentNode.IsSelected())) {
                        dataList.push(node.toJson());
                    }
                }
            }
            else {
                node = this.rootNode;
            }
            for (var i in node.Children()) {
                this.toJson(trueTest, selectOnlyParent, node.Children()[i], dataList);
            }
            return dataList;
        }    
    });

})();