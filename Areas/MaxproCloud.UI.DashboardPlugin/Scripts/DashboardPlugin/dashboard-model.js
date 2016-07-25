window.dashboardconfig.DashboardEventModel = uibase.BaseModel.inherits({
    initialize: function (data, parent) {
        this.Id = ko.observable();
        this.Name = ko.observable();
        this.Description = ko.observable();
        this.EventCode = ko.observable();
        this.EventGroupName = ko.observable();
        this.IsSelected = ko.observable(false);
        this.IsVisible = ko.observable(true);
        this.parent = parent;
        if (data) {
            this.dataSource(data);
        }
    },
    dataSource: function (data) {
        data = data || {};
        this.Id(data.Id);
        this.Name(data.Name);
        this.Description(data.Description);
        this.EventCode(data.EventCode);
        this.EventGroupName(data.EventGroupName);
    },
    toJson: function () {
        return ko.mapping.toJS(this);
    }
});

window.dashboardconfig.DashboardEventCategoryModel = uibase.BaseModel.inherits({
    initialize: function (data, parent) {
        data = data || {};
        this.Name = ko.observable(data.Name);
        this.IsExpanded = ko.observable(false);
        this.IsSelected = ko.observable(false);
        this.parent = parent;
        this.Events = ko.observableArray(_.map(data.Events || [], function (category) {
            return new window.dashboardconfig.DashboardEventModel(category, this);
        }, this));
        this.Categories = ko.observableArray(_.map(data.Categories || [], function (category) {
            return new window.dashboardconfig.DashboardEventCategoryModel(category, this);
        }, this));
        this.IsVisible = ko.computed(function () {
            var visibleChildCategories = _.filter(this.Categories(), function (c) {
                return c.IsVisible();
            });
            return visibleChildCategories.length > 0 || this.Events().length > 0;
        }, this);
    },
    toJson: function () {
        return ko.mapping.toJS(this.Events);
    }
});

window.dashboardconfig.DashboardAccountModel = uibase.BaseModel.inherits({
    initialize: function (data) {
        this.Id             = ko.observable();
        this.Name           = ko.observable();
        this.Description    = ko.observable();
        this.IsSelected     = ko.observable(false)
        if (data) {
            this.dataSource(data);
        }
    },
    dataSource: function (data) {
        data = data || {};
        this.Id(data.Id);
        this.Name(data.Name);
    },
    toJson: function () {
        return ko.mapping.toJS(this);
    }
});

window.dashboardconfig.DashboardConfigModel = uibase.BaseModel.inherits({
    initialize: function (data) {
        this.Id = ko.observable();
        this.Name = ko.observable();
        this.DashboardPeriod = ko.observable();
        this.FromDateTime = ko.observable();
        this.ToDateTime = ko.observable();
        this.LastXDays = ko.computed(function () {
            return !isNaN(parseInt(this.DashboardPeriod())) ? parseInt(this.DashboardPeriod()) : 0;
        }, this);
        this.IsPeriodSelected = ko.computed(function () {
            return !(this.FromDateTime() && this.ToDateTime());
        }, this);
        this.FromUTCDateTime = ko.computed(function () {
            if (this.FromDateTime()) {
                return moment(this.FromDateTime()).utc().format('YYYY-MM-DD HH:mm:ssZ');
            }
            return null;
        }, this);
        this.ToUTCDateTime = ko.computed(function () {
            if (this.ToDateTime()) {
                return moment(this.ToDateTime()).utc().format('YYYY-MM-DD HH:mm:ssZ');
            }
            return null;
        }, this);
        this.Entities = ko.observableArray([]);
        this.Events = ko.observableArray([]);
        if (data) {
            this.dataSource(data);
        }
    },
    dataSource: function (data) {
        data = data || {};
        this.Id(data.Id);
        this.Name(data.Name);
        this.DashboardPeriod(data.LastXDays);
        this.FromDateTime(this.convertToLocalTime(data.FromUTCDateTime));
        this.ToDateTime(this.convertToLocalTime(data.ToUTCDateTime));
        this.Entities(data.Entities || []);
        this.Events(data.Events || []);
    },
    convertToLocalTime: function (value) {
        var date = typeof (value) === 'string' ? (value.indexOf('/Date') >= 0 ? new Date(value.match(/\d+/)[0] * 1) : new Date(value)) : value;
        return date ? moment.utc(date).toDate() : null;
    },
    toJson: function () {
        var json = ko.mapping.toJS(this);
        delete json.DashboardPeriod;
        delete json.FromDateTime;
        delete json.ToDateTime;
        return json;
    }
});

window.dashboardconfig.DashboardModel = uibase.BaseModel.inherits({
    initialize: function (data) {
        var self = this;
        this.Id = ko.observable();
        this.Name = ko.observable();
        //this.Description = ko.observable();
        this.DashboardType = ko.observable();
        this.IsDefault = ko.observable();
        this.LastUpdatedTime = ko.observable();
        this.LastUpdatedTimeText = ko.computed(function () {
            return self.LastUpdatedTime() ? Resources.Dashboard_Last_Updated_On + ' ' + self.LastUpdatedTime() : '';
        });
        this.Chart = ko.observable();
        if(data) {
            this.dataSource(data);
        }
    },
    dataSource: function (data) {
        this.Id(data.Id);
        this.Name(data.Name);
        //this.Description(data.Description);
        this.IsDefault(data.IsDefault);
    },
    setChart: function (data, isDrillDown, statusFilter) {
        //data.Description = this.Description();
        this.DashboardType(data.DashboardType);
        this.Chart((new window.dashboardconfig.ChartModel(data, isDrillDown, statusFilter)).toJson());
    },
    toJson: function () {
        return ko.mapping.toJS(this);
    }
});

window.dashboardconfig.ChartModel = uibase.BaseModel.inherits({
    initialize: function (data, isDrillDown, statusFilter) {
        this.Entities = data.Entities || [];
        this.SlotNames = data.SlotNames || [];
        this.DashboardType = data.DashboardType;
        this.BackButtonEnabled = !!isDrillDown;
        this.isDrillDown = isDrillDown;
        this.statusFilter = statusFilter;
        this.setChartOptions();
    },
    setChartOptions: function () {
        this.title = {
            text: '' 
        };
        if (this.DashboardType == 0) {
            this.xAxis = {
                title: {
                    text: (this.Entities[0] && this.Entities[0].EntityType && this.Entities[0].EntityType in window.dashboardconfig.constants.statusOrder) ? window.dashboardconfig.constants.statusOrderText[this.Entities[0].EntityType] : ''
                },
                categories: _.map(this.SlotNames || [], function (sn) {
                    //return moment.utc(sn).toDate().format('dd mmm yyyy h:MM TT');
                    return moment(moment.utc(sn).toDate()).format('lll');
                }),
                tickLength: 0
            };
            this.yAxis = {
                allowDecimals: false,
                min: 0,
                title: {
                    text: Resources.Dashboard_AlarmEventCount
                }
            };
            this.legend = {
                align: 'right',
                layout: 'vertical',
                verticalAlign: 'top',
                y: 25
            };
            this.series = _.map(this.Entities, function (e) {
                return {
                    name: e.EntityName,
                    data: e.SlotValues || []
                };
            });
            this.plotOptions = {
                series: {}
            };
        }
        else if (this.DashboardType == 1) {
            this.chart = {
                type: 'bar' 
            };
            if (!this.isDrillDown) { 
                this.series = [{
                    name:' ',
                    data: _.map(this.SlotNames, function (item, index) {
                        return {
                            name: (item in window.dashboardconfig.constants.statusOrder) ? window.dashboardconfig.constants.statusOrderText[item] : Resources.EventCode_5035,
                            y: _.reduce(this.Entities, function (sum, entity) {
                                return sum + (entity.SlotValues.length >= index + 1 ? entity.SlotValues[index] : 0);
                            }, 0),
                            color: window.dashboardconfig.constants.statusColor[item]
                        };
                    }, this)
                }];
                this.xAxis = {
                    categories: _.map(this.SlotNames, function (sn) {
                        return sn.SlotNames;
                    }),
                    tickLength: 0
                };
                this.yAxis = {
                    title: {
                        text: ''
                    },
                    allowDecimals: false,
                    min: 0,
                    minorGridLineWidth: 0,
                    gridLineWidth: 0,
                    lineColor: 'transparent',
                    minorTickLength: 0,
                    tickLength: 0,
                    labels: {
                        enabled: true
                    },                  
                };             
                this.legend = {
                    enabled: false
                };
            }
            else {
                var slotName = _.find(this.SlotNames, function (slotName) {
                    return slotName == this.statusFilter;
                }, this);
                var index = _.indexOf(this.SlotNames, slotName);
                this.Entities = _.filter(this.Entities || [], function (entity) {
                    return (entity.SlotValues.length >= index + 1) && entity.SlotValues[index] > 0;
                });
                this.xAxis = {
                    title: {
                        text: (this.Entities[0] && this.Entities[0].EntityType && this.Entities[0].EntityType in window.dashboardconfig.constants.statusOrder) ? window.dashboardconfig.constants.statusOrderText[this.Entities[0].EntityType] : ''
                    },
                    categories: _.map(this.Entities, function (sn) {
                        return sn.EntityName;
                    })
                };
                this.yAxis = {
                    title: {
                        text: Resources.Dashboard_DeviceStatusCount
                    },
                    allowDecimals: false,
                    min: 0,
                    minorGridLineWidth: 0,
                    gridLineWidth: 0,
                    lineColor: 'transparent',
                    minorTickLength: 0,
                    tickLength: 0,
                    labels: {
                        enabled: true
                    },
                };
                var series = [{
                    name: (slotName in window.dashboardconfig.constants.statusOrder) ? window.dashboardconfig.constants.statusOrderText[slotName] : Resources.EventCode_5035,
                    data: _.map(this.Entities, function (entity) {
                        return entity.SlotValues.length >= index + 1 ? entity.SlotValues[index] : null;
                    }),
                    index: (slotName in window.dashboardconfig.constants.statusOrder) ? window.dashboardconfig.constants.statusOrder[slotName] : 0,
                    color: window.dashboardconfig.constants.statusColor[slotName]
                }];
                this.series = _.sortBy(series, function (item) {
                    return item.index;
                }).reverse();
                this.legend = {
                    reversed: true,
                    itemHoverStyle: {
                        cursor: 'default'
                    }
                };
                this.plotOptions = {
                    series: {
                        stacking: 'normal'
                    }
                };
            }
        }
    },
    toJson: function () {
        return this;
    }
});

window.dashboardconfig.AlarmModel = uibase.BaseModel.inherits({
    initialize: function (data) {
        data = JSON.parse(data);
        if (data.EventCode != 20002) {
            var originTime = new Date(data.OriginTime.DateTime.match(/\d+/)[0] * 1);
            if (data.SourceEntityType && data.SourceEntityType.toLowerCase() == "camera") {
                data.AdditionalInfo = [{ Key: "CAMERA", Value: [{ ID: data.SourceEntityId, Name: data.SourceEntityName }] }];
            }
            var accid = '';
            if (data.AccountIdentifiers && data.AccountIdentifiers.length>0)
             accid = data.AccountIdentifiers[0];
            this.value = {
                CredentialNumber: data.CredentialNumber,
                AccountType: null,
                OriginTime: originTime,
                AlarmDate: originTime.format("ddS mmm"),
                AlarmTime: originTime.format("HH:MM:ss"),
                AlarmTitle: null,
                AdditionalInfo: data.AdditionalInfo,
                Features: data.Features,
                Description: null,
                EntityType: null,
                EventCode: data.EventCode,
                EventCodeType: Resources["EventCode_" + data.EventCode],
                Status: data.Status || 'NEW',
                Id: data.ID,
                IsActive: false,
                IsSystemEntity: false,
                Location: data.Location,
                MasterSourceEntityType: data.MasterSourceEntityType,
                MasterSourceEntityName: data.MasterSourceEntityName,
                SourceEntityType: data.SourceEntityType,
                SourceEntityId: data.SourceEntityId,
                Name: null,
                ParentId: null,
                Priority: _.first(data.AccountLevelSettings).value.Priority,
                SeverityName: _.first(data.AccountLevelSettings).value.Severity,
                EventType: _.first(data.AccountLevelSettings).value.EventType,
                SourceEntityName: data.SourceEntityName,
                TypeId: 0,
                UniqueId: null,
                AccountId: accid
            };
        }
    }
});

window.dashboardconfig.FooterMenuModel = uibase.BaseModel.inherits({
    initialize: function (data) {
        var self = this;
        this.view = data.Name;
        this.title = ko.observable(data.MenuHeader);
        this.description = ko.observable(data.Description);
        this.index = ko.observable(data.PageIndex);
        this.icon = ko.computed(function () {
            return "icon_" + self.index();
        });
    },
    toJson: function () {
        return ko.mapping.toJS(this);
    }
});

window.dashboardconfig.TreeNodeModel = uibase.BaseModel.inherits({
    initialize: function (data, parentNode) {
        this.initializeBinding(data, parentNode);
    },
    initializeBinding: function (data, parentNode) {
        var self = this;
        data = data || {};
        this.Entity = {
            Id: ko.observable(),
            Name: ko.observable(),
            Description: ko.observable(),
            EntityType: ko.observable(),
            ParentId: ko.observable(),
            Address: ko.observable()
        }
        this.IsDirty = ko.observable(false);
        this.IsExpanded = ko.observable(false);
        this.Children = ko.observableArray([]);
        this.StatusClass = ko.observable('');
        this.IsSelected = ko.observable(!!data.IsSelected);
        this.IsHover = ko.observable(false);
        this.Icon = ko.computed(function () {
            if (self.Entity.EntityType()) {
                if (self.StatusClass())
                    return "icon_" + self.Entity.EntityType().toLowerCase() + "_" + self.StatusClass();
                return "icon_" + self.Entity.EntityType().toLowerCase();
            }
            else
                return " tree-open-icon";
        });
        this.ParentNode = parentNode;
        this.dataSource(data);
        this.bindChildNodes(data.Children);
    },
    dataSource: function (data) {
        data = data || {};
        this.Entity.Id(data.Id);
        this.Entity.Name(data.Name);
        this.Entity.Description(data.Description);
        this.Entity.EntityType(data.EntityType);
        this.Entity.ParentId(data.ParentId);
        this.Entity.Address(data.Address);
    },
    bindChildNodes: function (nodeDataList, isUpdate) {
        if (nodeDataList) {
            var self = this;
            if (isUpdate) {
                for (var i in this.Children()) {
                    if (nodeDataList[i]) {
                        this.Children()[i].dataSource(nodeDataList[i]);
                    }
                }
            }
            else {
                this.Children.removeAll();
                this.Children.push.apply(this.Children, nodeDataList.map(function (n) {
                    n.IsSelected = self.IsSelected();
                    return new window.dashboardconfig.TreeNodeModel(n, self);
                }));
            }
        }
    },
    selectNode: function (isSelected, isReverse, index) {
        index = index || 0;
        this.IsSelected(isSelected);
        if (!isReverse && this.Children()) {
            for (var i in this.Children()) {
                this.Children()[i].selectNode(isSelected, false, index + 1);
            }
        }
        if (index == 0 && this.ParentNode) {
            if (isSelected && !this.ParentNode.IsSelected()) {
                var self = this;
                var unSelectedNode = ko.utils.arrayFirst(this.ParentNode.Children(), function (node) {
                    return !node.IsSelected();
                });
                if (!unSelectedNode) {
                    self.ParentNode.selectNode(isSelected, true);
                }
            }
            else if (!isSelected && this.ParentNode.IsSelected()) {
                this.ParentNode.selectNode(isSelected, true);
            }
        }
    },
    toJson: function () {
        return ko.mapping.toJS(this.Entity);
    }
});