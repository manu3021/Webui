/// <reference path="calendarsearch-model.js" />
window.calendarsearch.DigestModel = uibase.BaseModel.inherits({
    initialize: function (data) {
        this.Data = ko.observable();
        this.Type = ko.observable();
        this.allDay = false;
        if (data) {
            this.dataSource(data);
        }
    },
    dataSource: function (data) {
        data = data || {};
        this.start = data.StartDate;
        this.end = data.EndDate;
        this.Data(data.Data);
        this.Type(data.Type);
    },
    toJson: function () {
        var json = ko.mapping.toJS(this);
        return json;
    }
});

window.calendarsearch.ClipModel = uibase.BaseModel.inherits({
    initialize: function (data) {
        this.Type = 'clip';
        this.SessionId = null;
        this.ClipId = ko.observable();
        this.Duration = ko.observable();
        this.EndDate = ko.observable();
        this.StartDate = ko.observable();
        this.Prevent = ko.observable();
        this.SeekedEndDate = ko.observable();
        this.SeekedStartDate = ko.observable();
        this.EventName = ko.observable();
        this.SegmentStartIndex = ko.observable();
        this.Local = ko.observable();
        this.ChannelId = ko.observable();
        this.SegmentEndIndex = ko.observable();
        this.URI = ko.observable();
        this.CameraName = ko.observable();
        this.ChannelId = ko.observable();
        this.CameraId = ko.observable();
        this.EventId = ko.observable();
        this.IsSelected = ko.observable(false);
        this.FcHeaderTitle = ko.observable();
        this.FcHeaderTitle = ko.observable();
        this.IsCloud = ko.observable();
        this.ClipIdText = ko.computed(function () {
            return Resources.Calendar_Clip_Id + ' : ' + this.ClipId();
        }, this);
        this.DateText = ko.computed(function () {
            return Resources.Calendar_Date + ' : ' + this.fixDate(this.StartDate());
        }, this);
        this.EventNameText = ko.computed(function () {
            return Resources.Calendar_Trigger + ' : ' + this.EventName();
        }, this);
        this.DurationText = ko.computed(function () {
            return Resources.Calendar_Duration + ' : ' + this.Duration();
        }, this);
        this.IsCloudText = ko.computed(function () {
            return this.IsCloud() ? Resources.Calendar_Offsite : Resources.Calendar_Onsite;
        }, this);
        this.ClipIdAndCameraNameText = ko.computed(function () {
            return this.CameraName() + '_' + this.ClipId();
        }, this);

        //Needed for clip export - Since these are hardcoded in header.js 
        this.DurationDisplay = ko.computed(function () {
            return "Duration: " + this.Duration();
        },this);
        this.StartTimeDisplay = ko.computed(function () {
            if (this.StartDate() != "")
                return "Date Time: " + this.fixDate(this.StartDate());
        }, this);
        this.cloudStatusDisplay = ko.computed(function () {
            if (this.Local() == true)
                return "Onsite";
            else
                return "Offsite";
        }, this);
        this.EventNameDisplay = ko.computed(function () {
            return "Event Name: " + this.EventName();
        }, this);
        this.ClipNameDisplay = ko.computed(function () {
            return "ClipId: " + this.ClipId();
        }, this);
        //End

        if (data) {
            this.dataSource(data);
        }
    },
    dataSource: function (data, sessionId) {
        data = data || {};
        this.ClipId(data.ClipId);
        this.Duration(data.Duration);
        this.EndDate(data.EndDate || null);
        this.StartDate(data.StartDate || null);
        this.Prevent(data.Prevent || 0);
        this.SeekedEndDate(data.SeekedEndDate);
        this.SeekedStartDate(data.SeekedStartDate);
        this.EventName(data.EventName);
        this.SegmentStartIndex(data.SegmentStartIndex);
        this.Local(data.Local);
        this.ChannelId(data.ChannelId);
        this.SegmentEndIndex(data.SegmentEndIndex);
        this.URI(data.URI);
        this.CameraName(data.CameraName);
        this.CameraId(data.CameraId);
        this.ChannelId(data.ChannelId);
        this.EventId(data.EventId);
        this.IsCloud(data.IsCloud);
        this.SessionId = sessionId;
    },
    fixDate: function (epoch) {
        if (epoch && epoch instanceof Date) {
            return epoch;
        }
        return epoch ? moment(new Date(epoch)).format(Resources.datetimeformat) : null;
    },
    toJson: function () {
        this.StartDate(this.SeekedStartDate());
        this.EndDate(this.SeekedEndDate());

        var json = ko.toJSON(this);
        delete json.ClipIdText;
        delete json.DurationText;
        delete json.DateText;
        delete json.EventNameText;
        return json;
    },
    toJs: function () {
        var js = ko.mapping.toJS(this);
        return js;
    }
});

window.calendarsearch.ClipExportmodel = uibase.BaseModel.inherits({
    initialize: function (data) {
        data = data || {};
        this.Clipdetails = data.clipModel;
        this.Local = ko.observable(false);
        this.FromExportDate = ko.observable();
        this.ToExportDate = ko.observable();
        this.IsSave = ko.observable(false);
        this.SavePath = ko.observable().extend({ trimText: true });
        this.Error = ko.observable();
        this.Iscancel = ko.observable(false);
        this.OnPC = ko.observable(true);
        this.isexport = ko.observable(true);
        this.isprogress = ko.observable(true);
        this.progressvalue = ko.observable("20");
        this.sessionid = ko.observable();
        this.isshowhide = ko.observable(true);
        this.exporturl = ko.observable();
        this.isretry = ko.observable(false);
    },
    toJson: function () {
        var json = ko.toJSON(this);
        return json;
    }
});

window.calendarsearch.AlarmModel = uibase.BaseModel.inherits({
    initialize: function (data) {
        this.Type = 'event';
        this.Id = ko.observable();
        this.AccountName = ko.observable();
        this.AlarmDate = ko.observable();
        this.AlarmTime = ko.observable();
        this.EventType = ko.observable();
        this.CredentialNumber = ko.observable();
        this.OriginTime = ko.observable();
        this.Location = ko.observable();
        this.EventCode = ko.observable();
        this.SourceEntityName = ko.observable();
        this.SourceEntityId = ko.observable();
        this.SourceEntityType = ko.observable();
        this.MasterSourceEntityName = ko.observable();
        this.MasterSourceEntityType = ko.observable();
        this.EventCodeType = ko.observable();
        this.Status = ko.observable();
        this.SeverityName = ko.observable();
        this.DoorName = ko.observable();
        this.AssociatedDoors = ko.observableArray([]);
        this.AssociatedCameras = ko.observableArray([]);
        this.AssociatedClips = ko.observableArray([]);
        this.PossibleActions = ko.observableArray([]);
        this.SeverityColor = ko.computed(function () {
            return this.SeverityName() ? 'severity_' + this.SeverityName().toLowerCase() : '';
        },this);
        this.AlarmDateTimeText = ko.computed(function () {
            return Resources.Calendar_Date + ' : ' + moment.utc(this.OriginTime()).format(Resources.datetimeformat);
        }, this);
        this.EventTypeText = ko.computed(function () {
            return this.EventCodeType() + (this.CredentialNumber() ? '(' + this.CredentialNumber() + ')' : '');
        }, this);
        if (data) {
            this.dataSource(data);
        }
    },
    dataSource: function (data, possibleActions) {
        data = data || {};
        this.Id(data.Id);
        this.AccountName(data.AccountName);
        this.AlarmDate(data.AlarmDate);
        this.AlarmTime(data.AlarmTime);
        this.EventType(data.EventType);
        this.CredentialNumber(data.CredentialNumber);
        this.OriginTime(data.OriginTime);
        this.Location(data.Location);
        this.EventCode(data.EventCode);
        this.SourceEntityName(data.SourceEntityName);
        this.SourceEntityId(data.SourceEntityId);
        this.SourceEntityType(data.SourceEntityType);
        this.MasterSourceEntityName(data.MasterSourceEntityName);
        this.MasterSourceEntityType(data.MasterSourceEntityType);
        this.EventCodeType(Resources["EventCode_" + data.EventCode]);
        this.Status = ko.observable(data.Status);
        this.SeverityName(data.SeverityName);
        this.DoorName(data.DoorName);
        this.AssociatedDoors(data.AssociatedDoors || []);
        this.AssociatedCameras(data.AssociatedCameras || []);
        this.AssociatedClips(data.AssociatedClips || []);
        if (data.AdditionalInfo) {
            var doors = this.getAssociatedDevices(data.AdditionalInfo, 'DOOR');
            doors = _.uniq(doors || [], false, function (door) {
                return door.Id || door.ID;
            });
            this.AssociatedDoors(_.map(doors, function (door) {
                return new window.calendarsearch.DeviceModel(door);
            }));
            if (doors && doors.length > 0) {
                this.DoorName(doors[0].Name);
            }
            var cameras = this.getAssociatedDevices(data.AdditionalInfo, 'CAMERA');
            cameras = _.uniq(cameras || [], false, function (camera) {
                return camera.Id || camera.ID;
            });
            this.AssociatedCameras(_.map(cameras || [], function (camera) {
                return new window.calendarsearch.DeviceModel(camera)
            }));
        }
        if (data.Features) {
            this.AssociatedClips(this.getAssociatedClips(data.Features, this.AssociatedCameras()) || []);
        }
        this.PossibleActions(_.map(possibleActions || [], function (action) {
            return new window.calendarsearch.EventAction(action);
        }));
    },
    fixDate: function (epoch) {
        return moment(new Date(epoch)).format(Resources.datetimeformat);
    },
    getAssociatedDevices: function (data, type) {
        if (type && typeof type == 'string') {
            return _.chain(data || [])
                    .filter(function (item) {
                        return (item.key || item.Key || '').toUpperCase() == type.toUpperCase();
                    }).map(function (item) {
                        return (item.Value || item.value)
                    }).first().value();
        }
    },
    getAssociatedClips: function (data, associatedCameras) {
        var cameras =   _.chain(data || [])
                        .filter(function (item) {
                            return item.Name.toUpperCase() == 'CAMERAID';
                        }).map(function (item) {
                            return (item.Value || item.value)
                        }).value();
        return _.chain(cameras || [])
                .map(function (item) {
                    var cameraText = item.split(',');
                    if (cameraText.length > 1) {
                        var associatedCamera = _.find(associatedCameras || [], function (item) {
                            return item.Id().toUpperCase() == cameraText[0].toUpperCase();
                        });
                        return (!!associatedCamera && associatedCamera.Name()) ?
                            new window.calendarsearch.EventClipInfo({
                                CameraName: associatedCamera.Name(),
                                CameraId: cameraText[0],
                                ClipId: cameraText[1]
                            }) : null;
                    }
                }).filter(function (item) {
                    return !!item;
                }).value();
    },
    toJson: function () {
        var json = ko.mapping.toJS(this);
        return json;
    }
});
window.calendarsearch.FilterModel = uibase.BaseModel.inherits({
    initialize: function (data) {
        this.FromUTCDatetime = ko.observable();
        this.ToUTCDatetime = ko.observable();
        this.IsMotionEvent = ko.observable();
        this.IsSchedule = ko.observable();
        this.IsTriggerEvent = ko.observable();
        this.IsOnsite = ko.observable();
        this.IsCloud = ko.observable();
        this.IsUserdriven = ko.observable();
        this.IsRuledriven = ko.observable();
        this.IsError = ko.observable();
        this.IsFilterError = ko.observable();
        this.Errormessage = ko.observable();
        if (data) {
            this.dataSource(data);
        }
    },
    dataSource: function (data) {
        data = data || {};
    },
    toJson: function () {
        var json = ko.mapping.toJS(this);
        return json;
    }
});

window.calendarsearch.EventSummaryModel = uibase.BaseModel.inherits({
    initialize: function (data) {
        this.AccountInfo = {
            Id: ko.observable(),
            ParentId: ko.observable(),
            Name: ko.observable(),
            Description: ko.observable(),
            City: ko.observable(),
            Country: ko.observable(),
            AddressLine1: ko.observable(),
            AddressLine2: ko.observable(),
            Region: ko.observable(),
            ZipCode: ko.observable(),
            MobileNumber: ko.observable(),
            EmailAddress: ko.observable(),
            Phone: ko.observable(),
            AlternateEmail: ko.observable()
        };
        this.EventInfo = new window.calendarsearch.AlarmModel();
        if (data) {
            this.dataSource(data);
        }
    },
    dataSource: function (data, eventInfo, possibleActions) {
        data = data || {};
        data.AccountInfo = data.AccountInfo || {};
        data.AccountInfo.ContactInfo = data.AccountInfo.ContactInfo || {};
        data.AssociationInfo = data.AssociationInfo || [];
        this.AccountInfo.Id(data.AccountInfo.Id);
        this.AccountInfo.ParentId(data.AccountInfo.ParentId);
        this.AccountInfo.Name(data.AccountInfo.Name);
        this.AccountInfo.Description(data.AccountInfo.Description);
        this.AccountInfo.City(data.AccountInfo.ContactInfo.City);
        this.AccountInfo.Country(data.AccountInfo.ContactInfo.Country);
        this.AccountInfo.AddressLine1(data.AccountInfo.ContactInfo.AddressLine1);
        this.AccountInfo.AddressLine2(data.AccountInfo.ContactInfo.AddressLine2);
        this.AccountInfo.Region(data.AccountInfo.ContactInfo.Region);
        this.AccountInfo.ZipCode(data.AccountInfo.ContactInfo.ZipCode);
        this.AccountInfo.MobileNumber(data.AccountInfo.ContactInfo.MobileNumber);
        this.AccountInfo.EmailAddress(data.AccountInfo.ContactInfo.EmailAddress);
        this.AccountInfo.Phone(data.AccountInfo.ContactInfo.Phone);
        this.AccountInfo.AlternateEmail(data.AccountInfo.ContactInfo.AlternateEmail);
        this.EventInfo.dataSource(eventInfo, possibleActions);
    },
    toJson: function () {
        var json = ko.mapping.toJS(this);
        return json;
    }
});

window.calendarsearch.DeviceModel = uibase.BaseModel.inherits({
    initialize: function (data) {
        this.Id = ko.observable();
        this.Name = ko.observable();
        if (data) {
            this.dataSource(data);
        }
    },
    dataSource: function (data) {
        data = data || {};
        this.Id(data.Id || data.ID);
        this.Name(data.Name);
    },
    toJson: function () {
        var json = ko.mapping.toJS(this);
        return json;
    }
});

window.calendarsearch.EventAction = uibase.BaseModel.inherits({
    initialize: function (data, doorInfo) {
        this.Name = ko.observable(data);
        this.DisplayName = ko.observable(Resources[data] || data);
    },
    toJson: function () {
        var json = ko.mapping.toJS(this);
        return json;
    }
});

window.calendarsearch.EventClipInfo = uibase.BaseModel.inherits({
    initialize: function (data) {
        this.CameraName = ko.observable(data.CameraName);
        this.CameraId = ko.observable(data.CameraId);
        this.ClipId = ko.observable(data.ClipId);
        this.ClipText = ko.computed(function () {
            return (this.CameraName() || '') + '_' + (this.ClipId() || '');
        }, this);
    },
    toJson: function () {
        var json = ko.mapping.toJS(this);
        return json;
    }
});

window.calendarsearch.TreeNodeModel = uibase.BaseModel.inherits({
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
                    return new window.calendarsearch.TreeNodeModel(n, self);
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