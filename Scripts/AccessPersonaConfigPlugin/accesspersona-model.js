window.accesspersona.CredentialHolderModel = uibase.BaseModel.inherits({
    initialize: function (data) {
        this.Id = ko.observable();
        this.Name1 = ko.observable();
        this.Name2 = ko.observable();
        this.Name3 = ko.observable();
        this.DisplayName = ko.observable();
        this.CreateDateTime = ko.observable();
        this.ActivationDateTime = ko.observable();
        this.ExpiryDateTime = ko.observable();
        this.AssociatedBlobs = ko.observableArray([]);
        this.AccessPersonaId = ko.observable(null);
        this.IsSelected = ko.observable(false)
        if (data) {
            this.dataSource(data);
        }
    },
    dataSource: function (data) {
        data = data || {};
        this.Id(data.Id);
        this.Name1(data.Name1);
        this.Name2(data.Name2);
        this.Name3(data.Name3);
        this.DisplayName(data.DisplayName);
        this.CreateDateTime(this.fixDateTime(data.CreateDateTime));
        this.ActivationDateTime(this.fixDateTime(data.ActivationDateTime));
        this.ExpiryDateTime(this.fixDateTime(data.ExpiryDateTime));
        this.AssociatedBlobs(data.AssociatedBlobs || []);
        this.IsSelected(data.IsSelected);
    },
    toJson: function () {
        var json = ko.mapping.toJS(this);
        return json;
    },
    fixDateTime: function (value) {
        return typeof (value) === 'string' ? (value.indexOf('/Date') >= 0 ? new Date(value.match(/\d+/)[0] * 1) : new Date(value)) : value;
    }
});

window.accesspersona.ScheduleModel = uibase.BaseModel.inherits({
    initialize: function (data) {
        this.Id = ko.observable();
        this.Name = ko.observable();
        this.IsSelected = ko.observable(false)
        if (data) {
            this.dataSource(data);
        }
    },
    dataSource: function (data) {
        data = data || {};
        this.Id(data.Id);
        this.Name(data.Name);
        this.IsSelected(data.IsSelected);
    },
    toJson: function () {
        var json = ko.mapping.toJS(this);
        return json;
    }
});

window.accesspersona.AccessPersonaModel = uibase.BaseModel.inherits({
    initialize: function (data) {
        this.Id = ko.observable();
        this.Name = ko.observable();
        this.AccessPersonaEntities = ko.observableArray([]);
        this.IsSelected = ko.observable(false);
        this.IsCustom = ko.observable(false);
        this.IsSystemEntity = ko.observable(false);
        this.BaseAccessPersonaId = ko.observable();
        if (data) {
            this.dataSource(data);
        }
    },
    dataSource: function (data) {
        data = data || {};
        data.AccessPersonaEntities = data.AccessPersonaEntities || [];
        this.Id(data.Id);
        this.Name(data.Name);
        this.IsSelected(data.IsSelected);
        this.IsCustom(data.IsCustom);
        this.IsSystemEntity(data.IsSystemEntity);
        this.BaseAccessPersonaId(data.BaseAccessPersonaId);
        this.AccessPersonaEntities(data.AccessPersonaEntities.map(function (data) {
            new AccessPersonaEntityScheduleModel(data);
        }));
    },
    toJson: function () {
        var json = ko.mapping.toJS(this);
        return json;
    }
});

var AccessPersonaEntityScheduleModel = uibase.BaseModel.inherits({
    initialize: function (data) {
        data = data || {};
        data.EntityInfo = data.EntityInfo || {};
        data.ScheduleInfo = data.ScheduleInfo || {};
        this.Id = ko.observable(data.Id);
        this.Name = ko.observable(data.Name);
        this.Description = ko.observable(data.Description);
        this.EntityType = ko.observable(data.EntityType);
        this.IsVarious = ko.observable(data.IsVarious);
        this.EntityInfo = {
            Id: ko.observable(),
            Name: ko.observable(),
            ParentId: ko.observable()
        }
        this.ScheduleInfo = {
            Id: ko.observable(data.IsVarious ? null : data.ScheduleInfo.Id),
            Name: ko.observable(data.IsVarious ? window.accesspersona.messages.accesspersona_door_schedule_various : data.ScheduleInfo.Name)
        }
        if (data) {
            this.dataSource(data);
        }
    },
    dataSource: function(data) {
        data = data || {};
        data.EntityInfo = data.EntityInfo || {};
        data.ScheduleInfo = data.ScheduleInfo || {};
        this.Id(data.Id);
        this.Name(data.Name);
        this.Description(data.Description);
        this.EntityType(data.EntityType);
        this.IsVarious(data.IsVarious);
        this.EntityInfo.Id(data.EntityInfo.Id);
        this.EntityInfo.Name(data.EntityInfo.Name);
        this.EntityInfo.ParentId(data.EntityInfo.ParentId);
        this.ScheduleInfo.Id(data.IsVarious ? null : data.ScheduleInfo.Id);
        this.ScheduleInfo.Name(data.IsVarious ? window.accesspersona.messages.accesspersona_door_schedule_various : data.ScheduleInfo.Name);
    },
    toJson: function () {
        var json = ko.mapping.toJS(this);
        if (!json.ScheduleInfo.Id) {
            delete json.ScheduleInfo;
        }
        return json;
    }
});

window.accesspersona.TreeNodeModel = uibase.BaseModel.inherits({
    initialize: function (data, parentNode) {
        this.initializeBinding(data, parentNode);
    },
    initializeBinding: function (data, parentNode) {
        var self = this;
        data = data || {};
        this.Entity = new AccessPersonaEntityScheduleModel(data);
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
        this.bindChildNodes(data.Children);
    },
    dataSource: function(data) {
        this.Entity.dataSource(data);
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
                    return new window.accesspersona.TreeNodeModel(n, self);
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
        return this.Entity.toJson();
    }
});
