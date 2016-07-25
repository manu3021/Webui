ko.extenders.removeLeadingZeros = function (target, precision) {
    var result = ko.computed({
        read: target,
        write: function (newValue) {
            if (newValue != null) {
                valueToWrite = newValue.toString().replace(/^0+/, '');
                target(valueToWrite);
                target.notifySubscribers(valueToWrite);
            }
        }
    }).extend({ notify: 'always' });
    result(target());
    return result;
};

ko.bindingHandlers.popUp = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var attribute = ko.utils.unwrapObservable(valueAccessor());
        var templateContent = attribute.content;
        var popOverTemplate = "<div class='popOverClass' id='" + attribute.id + "-popover'>" + $(templateContent).html() + "</div>";
        $(element).popover({
            placement: 'right',
            content: popOverTemplate,
            html: true,
            trigger: 'manual'
        });
        $(element).attr('id', "popover" + attribute.id + "_click");
        $(element).click(function () {
            $(".popOverClass").popover("hide");
            $(this).popover('toggle');
            var newContext = ko.contextFor(this);
            var thePopover = document.getElementById(attribute.id + "-popover");
            ko.applyBindingsToDescendants(newContext, thePopover);
        })
    }
}

window.credential.CredentialModel = uibase.BaseModel.inherits({
    initialize: function (data) {
        this.Id = ko.observable();
        this.CredentialNumber = ko.observable().extend({ removeLeadingZeros: true });
        this.CredentialStatusId = ko.observable();
        this.CredentialStatusName = ko.observable();
        this.CredentialSubStatusId = ko.observable();
        this.CredentialHolderId = ko.observable();
        this.StatusNotes = ko.observable();
        this.IssueDateTime = ko.observable();
        this.IssueLevel = ko.observable();
        this.ActivationDateTime = ko.observable();
        this.ExpiryDateTime = ko.observable();
        this.CredentialType = ko.observable();
        this.IsLimitedUseCount = ko.observable();
        this.MaxUseCount = ko.observable().extend({ removeLeadingZeros: true });
        this.TechnologyTypeIdentifiers = ko.observable();
        this.Pin = ko.observable();
        this.Password = ko.observable();
        this.DuressCode = ko.observable();
        this.MaxNumberOfDays = ko.observable();
        this.AbsenteeLimit = ko.observable();
        this.ThreatAuthority = ko.observable();
        this.ExtendedTimeUnlock = ko.observable();
        this.IsPrivacyEnabled = ko.observable();
        this.IsEscortRequired = ko.observable();
        this.IsTraceEnabled = ko.observable();
        this.IsMidnightForgiveEnabled = ko.observable();
        this.IsOfficeModeEnabled = ko.observable();
        this.IsOccupancyCountExempted = ko.observable();
        this.IsAntiPassBackExempted = ko.observable();
        this.AntiPassbackResetTime = ko.observable();
        this.LastUsedDevicePointId = ko.observable();
        this.LastAccessEventId = ko.observable();
        this.IsVIP = ko.observable();
        this.IsTemporary = ko.observable();
        this.CreateMode = ko.observable($('#credential_CreateMode option:selected').val());
        this.IsSelected = ko.observable(false);
        this.hasChanges = ko.observable(true);
        if (data) {
            this.dataSource(data);
        }
    },
    setExtender: function () {
        this.CredentialNumber.extend({ watch: this });
        this.CredentialStatusId.extend({ watch: this });
        this.Pin.extend({ watch: this });
        this.IssueLevel.extend({ watch: this });
        this.IsTemporary.extend({ watch: this });
        this.CredentialType.extend({ watch: this });
        this.IsLimitedUseCount.extend({ watch: this });
        this.MaxUseCount.extend({ watch: this });
        this.CreateMode.extend({ watch: this });
    },
    dataSource: function (data) {
        data = data || {};
        this.hasChanges(false);
        this.Id(data.Id);
        this.CredentialNumber(data.CredentialNumber);
        this.CredentialStatusId(data.CredentialStatusId);
        this.CredentialStatusName(data.CredentialStatusName);
        this.CredentialSubStatusId(data.CredentialSubStatusId);
        this.CredentialHolderId(data.CredentialHolderId);
        this.StatusNotes(data.StatusNotes);
        this.IssueDateTime(this.fixDateTime(data.IssueDateTime));
        this.IssueLevel(data.IssueLevel);
        this.ActivationDateTime(this.fixDateTime(data.ActivationDateTime));
        this.ExpiryDateTime(this.fixDateTime(data.ExpiryDateTime));
        this.CreateMode($('#credential_CreateMode option:selected').val());
        this.CredentialType(data.CredentialType);
        this.IsLimitedUseCount(data.IsLimitedUseCount);
        this.MaxUseCount(data.MaxUseCount);
        this.TechnologyTypeIdentifiers(data.TechnologyTypeIdentifiers);
        this.Pin(data.Pin);
        this.Password(data.Password);
        this.DuressCode(data.DuressCode);
        this.MaxNumberOfDays(data.MaxNumberOfDays);
        this.AbsenteeLimit(data.AbsenteeLimit);
        this.ThreatAuthority(data.ThreatAuthority);
        this.ExtendedTimeUnlock(data.ExtendedTimeUnlock);
        this.IsPrivacyEnabled(data.IsPrivacyEnabled);
        this.IsEscortRequired(data.IsEscortRequired);
        this.IsTraceEnabled(data.IsTraceEnabled);
        this.IsMidnightForgiveEnabled(data.IsMidnightForgiveEnabled);
        this.IsOfficeModeEnabled(data.IsOfficeModeEnabled);
        this.IsOccupancyCountExempted(data.IsOccupancyCountExempted);
        this.IsAntiPassBackExempted(data.IsAntiPassBackExempted);
        this.AntiPassbackResetTime(data.AntiPassbackResetTime);
        this.LastUsedDevicePointId(data.LastUsedDevicePointId);
        this.LastAccessEventId(data.LastAccessEventId);
        if (this.CredentialType() == 'D75096F1-7055-4669-8E16-844E17946448'.toLowerCase()) {
            this.IsLimitedUseCount(false);
            this.MaxUseCount("");
            this.Pin("");
            this.IsVIP(true);
        }
        else
            this.IsVIP(false);
        this.IsTemporary(data.IsTemporary);
        this.setExtender();
    },
    toJson: function () {
        var json = ko.mapping.toJS(this);
        if (!json.IsLimitedUseCount) {
            delete json.MaxUseCount;
        }
        delete json.IsSelected;
        delete json.CredentialStatusName;
        return json;
    },
    fixDateTime: function (value) {
        return typeof (value) === 'string' ? (value.indexOf('/Date') >= 0 ? new Date(value.match(/\d+/)[0] * 1) : new Date(value)) : value;
    }
});

window.credential.CredentialHolderModel = uibase.BaseModel.inherits({
    initialize: function (data) {
        this.Id = ko.observable();
        this.Name1 = ko.observable();
        this.Name2 = ko.observable();
        this.Name3 = ko.observable();
        this.hasChanges = ko.observable(true);
        this.DisplayName = ko.observable();
        this.CredentialHolderTypeId = ko.observable();
        this.CredentialHolderSubTypeId = ko.observable();
        this.CredentialHolderStatusId = ko.observable();
        this.CreateDateTime = ko.observable();
        this.ActivationDateTime = ko.observable();
        this.ExpiryDateTime = ko.observable();
        this.AssociatedBlobs = ko.observableArray([]);
        this.AccessLevelIdentifiers = ko.observableArray();
        this.Credentials = ko.observableArray([]);
        this.SelectedCredential = ko.observable();
        this.IsSelected = ko.observable(false);
        this.isEdited = ko.observable(false);
        this.isPhotoLoaded = ko.observable(false);
        if (data) {
            this.dataSource(data);
        }
    },
    setExtender: function () {
        this.Name1.extend({ watch: this });
        this.Name3.extend({ watch: this });
        this.DisplayName.extend({ watch: this });
        this.isEdited.extend({ watch: this });
        this.isPhotoLoaded.extend({ watch: this });
        this.Credentials.extend({ watch: this });
    },
    dataSource: function (data) {
        data = data || {};
        this.hasChanges(false);
        data.AssociatedBlobs = data.AssociatedBlobs || [];
        this.Id(data.Id);
        this.Name1(data.Name1);
        this.Name2(data.Name2);
        this.Name3(data.Name3);
        this.DisplayName(data.DisplayName);
        this.CredentialHolderTypeId(data.CredentialHolderTypeId);
        this.CredentialHolderSubTypeId(data.CredentialHolderSubTypeId);
        this.CredentialHolderStatusId(data.CredentialHolderStatusId);
        this.CreateDateTime(data.CreateDateTime);
        this.ActivationDateTime(this.fixDateTime(data.ActivationDateTime));
        this.ExpiryDateTime(this.fixDateTime(data.ExpiryDateTime));
        this.AccessLevelIdentifiers(data.AccessLevelIdentifiers);
        if (data.Credentials) {
            this.Credentials.push.apply(this.Credentials, data.Credentials.map(function (item) {
                return new window.credential.CredentialModel(item);
            }));
        }
        //this.Credentials(data.Credentials || []);
        this.AssociatedBlobs(data.AssociatedBlobs || []);
        this.IsSelected(data.IsSelected);
        this.setExtender();
    },
    toJson: function () {
        var json = ko.mapping.toJS(this);
        delete json.SelectedCredential;
        delete json.IsSelected;
        for (var b in json.AssociatedBlobs) {
            if (json.AssociatedBlobs[b].Id) {
                json.AssociatedBlobs[b] = { Id: json.AssociatedBlobs[b].Id };
            }
            else {
                json.AssociatedBlobs.splice(b, 1);
            }
        }
        return json;
    },
    fixDateTime: function (value) {
        return typeof (value) === 'string' ? (value.indexOf('/Date') >= 0 ? new Date(value.match(/\d+/)[0] * 1) : new Date(value)) : value;
    }
});