window.panelconfig.PanelInputModel = uibase.BaseModel.inherits({
    initialize: function (data) {
        uibase.BaseModel.prototype.initialize.apply(this, data);
        this.Id = ko.observable();
        this.Name = ko.observable();
        this.ParentId = ko.observable();
        this.AccountId = ko.observable();
        this.ShuntTimeZone = ko.observable();
        this.InterlockDisableTimeZone = ko.observable();
        this.SilenceTimeZone = ko.observable();
        this.ShuntTime = ko.observable();
        this.DebounceNormalTime = ko.observable();
        this.IsNormallyOpen = ko.observable();
        this.IsSupervised = ko.observable();
        this.ResistorValue = ko.observable();
        this.AutoRelock = ko.observable();
        this.RelockOutput = ko.observable();
        this.InterlockEnabled = ko.observable();
        this.Address = ko.observable();
        this.hasChanges = ko.observable(true);
        this.IsError = ko.observable(false);
        this.ErrorMessage = ko.observable();
        this.Interlock = {
            Id: ko.observable(),
            TriggerEntityId: this.Id,
            Name: ko.observable(),
            ReactingEntityType: ko.observable(0),
            ReactingEntityId: ko.observable(),
            AlarmAction: ko.observable(),
            NormalAction: ko.observable()
        };
        this.IsSelected = ko.observable();
        if (data) {
            this.dataSource(data);
        }
        $('#input_DebounceTime').spinner();        
    },    
    dataSource: function (data) {
        data = data || {};
        data.ShuntTime = data.ShuntTime || {};
        this.Id(data.Id);
        this.Name(data.Name);
        this.ParentId(data.ParentId);
        this.AccountId(data.AccountId);
        this.ShuntTimeZone(data.ShuntTimeZone ? data.ShuntTimeZone.toLowerCase() : data.ShuntTimeZone);
        this.InterlockDisableTimeZone(data.InterlockDisableTimeZone ? data.InterlockDisableTimeZone.toLowerCase() : data.InterlockDisableTimeZone);
        this.SilenceTimeZone(data.SilenceTimeZone ? data.SilenceTimeZone.toLowerCase() : data.SilenceTimeZone);
        this.ShuntTime((data.ShuntTime.Hour || '0') + ':' + (data.ShuntTime.Min || '00') + ':' + (data.ShuntTime.Sec.toFixed(1) || '00.0'));
        this.DebounceNormalTime(parseFloat(data.DebounceNormalTime / 1000).toFixed(1));
        this.IsNormallyOpen(data.IsNormallyOpen);
        this.IsSupervised(data.IsSupervised);
        this.ResistorValue(data.ResistorValue);
        this.AutoRelock(data.AutoRelock);
        this.RelockOutput(data.RelockOutput);
        this.InterlockEnabled(data.InterlockEnabled);
        this.Address(data.Address);
        this.hasChanges(false);
        this.IsError(false);
        this.ErrorMessage("");
        this.setExtender();
        if (data.Interlock) {
            this.Interlock.Id(data.Interlock.Id);
            this.Interlock.Name(data.Interlock.Name);
            this.Interlock.TriggerEntityId(data.Interlock.TriggerEntityId);
            this.Interlock.ReactingEntityType(data.Interlock.ReactingEntityType);
            this.Interlock.ReactingEntityId(data.Interlock.ReactingEntityId);
            this.Interlock.AlarmAction(data.Interlock.AlarmAction);
            this.Interlock.NormalAction(data.Interlock.NormalAction);
        }
    },
    setExtender: function () {
        this.Name.extend({ watch: this });
        this.ShuntTimeZone.extend({ watch: this });
        this.InterlockDisableTimeZone.extend({ watch: this });
        this.SilenceTimeZone.extend({ watch: this });
        this.ShuntTime.extend({ watch: this });
        this.DebounceNormalTime.extend({ watch: this });
        this.IsNormallyOpen.extend({ watch: this });
        this.IsSupervised.extend({ watch: this });
        this.ResistorValue.extend({ watch: this });
        this.AutoRelock.extend({ watch: this });
        this.RelockOutput.extend({ watch: this });
        this.InterlockEnabled.extend({ watch: this });
        this.Interlock.Name.extend({ watch: this });
        this.Interlock.ReactingEntityId.extend({ watch: this });
        this.Interlock.ReactingEntityType.extend({ watch: this });
        this.Interlock.AlarmAction.extend({ watch: this });
        this.Interlock.NormalAction.extend({ watch: this });
    },
    toJson: function () {
        var json = ko.toJS(this);
        var shuntTimeParts = this.ShuntTime().split(':');
        json.ShuntTime = { Hour: parseFloat(shuntTimeParts[0]), Min: parseFloat(shuntTimeParts[1]), Sec: parseFloat(shuntTimeParts[2]) };
        json.DebounceNormalTime = Math.floor(json.DebounceNormalTime * 10) / 10;
        json.DebounceNormalTime = parseFloat(json.DebounceNormalTime).toFixed(1) * 1000;
        return json;
    },
});