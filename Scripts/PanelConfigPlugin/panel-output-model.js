window.panelconfig.PanelOutputModel = uibase.BaseModel.inherits({
    initialize: function (data) {
        var self = this;
        uibase.BaseModel.prototype.initialize.apply(this, data);
        this.Id = ko.observable();
        this.Name = ko.observable();
        this.ParentId = ko.observable();
        this.AccountId = ko.observable();
        this.PulseTime = ko.observable();
        this.ActiveTimeZone = ko.observable();
        this.ActiveTimeZoneBehavior = ko.observable();
        this.IsLatchingPulseTime = ko.observable();
        this.BlockInterLockTimeZone = ko.observable();
        this.ModelDeviceType = ko.observable(1001);
        this.PulseTime = ko.observable();
        this.Address = ko.observable();
        this.InterlockEnabled = ko.observable();
        this.ActionPulseTime = ko.observable();
        this.hasChanges = ko.observable(true);
        this.IsError = ko.observable(false);
        this.ErrorMessage = ko.observable();
        //this.CanHideTimeZone = ko.computed(function () {
        //    if (self.ModelDeviceType() == 1001 || self.ModelDeviceType() == 1002 || self.ModelDeviceType() == 1004) {
        //        return false;
        //    }
        //    return true;
        //});
        this.CanHideTimeZone = ko.observable(false);
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
    },
    dataSource: function (data) {
        data = data || {};
        data.PulseTime = data.PulseTime || {};
        var self = this;
        this.Id(data.Id);
        this.Name(data.Name);
        this.ParentId(data.ParentId);
        this.AccountId(data.AccountId);
        this.ModelDeviceType(data.ModelDeviceType);
        this.IsLatchingPulseTime(data.IsLatchingPulseTime);
        this.ActiveTimeZone(data.ActiveTimeZone);
        this.ActiveTimeZoneBehavior(data.ActiveTimeZoneBehavior);
        this.BlockInterLockTimeZone(data.BlockInterLockTimeZone);
        this.PulseTime((data.PulseTime.Hour || '0') + ':' + (data.PulseTime.Min || '00') + ':' + (data.PulseTime.Sec.toFixed(1) || '00.0'));
        this.hasChanges(false);
        this.IsError(false);
        this.ErrorMessage("");
        this.setExtender();
        if (!data.ActionPulseTime) {
            this.ActionPulseTime('0:00:00');
        }
        this.Address(data.Address);
        this.InterlockEnabled(data.InterlockEnabled);
        this.CanHideTimeZone(data.IsInterlockPoint);
        if (data.Interlock) {
            this.Interlock.Id(data.Interlock.Id);
            this.Interlock.TriggerEntityId(data.Interlock.TriggerEntityId);
            this.Interlock.Name(data.Interlock.Name);
            this.Interlock.ReactingEntityType(data.Interlock.ReactingEntityType);
            this.Interlock.ReactingEntityId(data.Interlock.ReactingEntityId);
            this.Interlock.AlarmAction(data.Interlock.AlarmAction.toUpperCase());
            this.Interlock.NormalAction(data.Interlock.NormalAction.toUpperCase());
        }

        this.InitModel();
    },
    setExtender: function () {
        this.Name.extend({ watch: this });
        this.ActiveTimeZone.extend({ watch: this });
        this.PulseTime.extend({ watch: this });
        this.IsLatchingPulseTime.extend({ watch: this });
        this.BlockInterLockTimeZone.extend({ watch: this });
        //this.InterlockEnabled.extend({ watch: this });
        this.Interlock.ReactingEntityId.extend({ watch: this });
        this.Interlock.AlarmAction.extend({ watch: this });
        this.Interlock.NormalAction.extend({ watch: this });
        this.Interlock.ReactingEntityType.extend({ watch: this });
    },
    InitModel: function () {
        function checkEnergizeMode() {
            if ($("#output_ActiveTimeZone").val() != "") {
                $('[name="output_EnergizeMode"]').prop('disabled', false);
                $("#rdoActiveTimeZone").css('background-color', 'Transparent').css('cursor', 'pointer');
                $('[name="output_EnergizeMode"]').next('span').css('cursor', 'pointer');
            }
            else {
                $('[name="output_EnergizeMode"]').prop('disabled', true);
                $("#rdoActiveTimeZone").css('background-color', '#EEEEEE').css('cursor', 'not-allowed');
                $('[name="output_EnergizeMode"]').next('span').css('cursor', 'not-allowed');
            }
        }
        checkEnergizeMode();
        $("#output_ActiveTimeZone").on('change', function () {
            checkEnergizeMode();
        });
    },
    toJson: function () {
        var json = ko.toJS(this);
        var pulseTimeParts = this.PulseTime().split(':');
        json.PulseTime = { Hour: pulseTimeParts[0], Min: pulseTimeParts[1], Sec: pulseTimeParts[2] };
        return json;
    }
});