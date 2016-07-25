window.timemanagement.HolidayModel = uibase.BaseModel.inherits({
    initialize: function (data) {
        this.Id = ko.observable();
        this.Name = ko.observable();
        this.HolidayMode = ko.observable(0);
        this.HolidayType = ko.observable(0);
        this.Date = ko.observable(new Date());
        this.IsEveryYear = ko.observable(false);
        this.IsSelected = ko.observable(false);
        this.DateText = ko.computed(function () {
            var everyYearText = this.IsEveryYear() ? (' - ' + Resources.Holiday_Every_Year) : '',
                day = moment(this.Date()).format('MMMM, DD, YYYY');
            return day + everyYearText;
        }, this);
        if (data) {
            this.dataSource(data);
        }
    },
    dataSource: function (data) {
        data = data || {};
        this.Id(data.Id);
        this.Name(data.Name);
        this.HolidayMode(data.HolidayMode);
        this.HolidayType(data.HolidayType);
        this.Date(this.fixDateTime(data.Date));
        this.IsEveryYear(data.IsEveryYear);
    },
    fixDateTime: function (value) {
        return typeof (value) === 'string' ? (value.indexOf('/Date') >= 0 ? new Date(value.match(/\d+/)[0] * 1) : new Date(value)) : value;
    },
    convertDateTime: function (date) {
        if (typeof (date) === 'string') {
            return date;
        }
        else {
            return moment(date).hours(0).minutes(0).seconds(0).format('YYYY-MM-DD HH:mm:ssZ');
        }
    },
    toJson: function () {
        this.Date(this.convertDateTime(this.Date()));
        var json = ko.mapping.toJS(this);
        return json;
    }
});

window.timemanagement.ScheduleModel = uibase.BaseModel.inherits({
    initialize: function (data) {
        this.Id = ko.observable();
        this.Name = ko.observable();
        this.Description = ko.observable();
        this.TimeSlots = ko.observableArray([]);
        this.IsSystemEntity = ko.observable();
        this.IsSelected = ko.observable(false);

        //TODO:move it to common
        this.TargetEntityType = ko.observable('DeviceController');

        if (data) {
            this.dataSource(data);
        }
    },
    dataSource: function (data) {
        data = data || {};
        this.Id(data.Id);
        this.Name(data.Name);
        this.Description(data.Description);
        this.TimeSlots(data.TimeSlots || []);
        this.IsSystemEntity(data.IsSystemEntity);
    },
    fixDateTimeForAllSlots: function (slots) {
        for (var s in slots) {
            slots[s].StartTime = this.fixDateTime(slots[s].StartTime);
            slots[s].EndTime = this.fixDateTime(slots[s].EndTime);
        }
    },
    fixDateTime: function (val) {
        return typeof val === 'string' ? new Date(val.match(/\d+/)[0] * 1) : val;
    },
    toJson: function () {
        var json = ko.mapping.toJS(this);
        this.fixDateTimeForAllSlots(json.TimeSlots);
        return json;
    }
});