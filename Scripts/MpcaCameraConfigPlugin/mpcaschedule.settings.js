/// <reference path="mpcacamera.common.js" />
/// <reference path="mpcacamera.datacontext.js" />

window.mpcacamerasetting.schedulesettings = (function (ko, datacontext, common) {
    var scheduleSettings = function (scheduletype) {
        var self = this;
        var isinitialised = false;
        var data;
        self.Id = ko.observable();
        self.Name = ko.observable();
        self.StartTime = ko.observable();
        self.EndTime = ko.observable();
        self.IsError = ko.observable(false);
        self.ErrorMessage = ko.observable("");

        self.Type = ko.observable(scheduletype || common.constants.scheduletypes.Default);
        self.DayType = ko.observable(common.constants.scheduledaytypes.SingleDay);
        self.IsSingleDay = ko.observable(true);
        self.SelectedSingleDay = ko.observable();
        self.singledays = ko.observableArray([]);
        self.SelectedMultiFromDay = ko.observable();
        self.multifromdays = ko.observableArray([]);
        self.SelectedMultiToDay = ko.observable();
        self.multitodays = ko.observableArray([]);

        self.DayType.subscribe(function (newval) {
            if (newval == common.constants.scheduledaytypes.SingleDay) {
                self.IsSingleDay(true);
            }
            else {
                self.IsSingleDay(false);
            }
            if (isinitialised) {
                var startday = Date.today();
                self.StartTime(startday);
                var endday = Date.today();
                endday.setHours(23);
                endday.setMinutes(59);
                endday.setSeconds(59);
                self.EndTime(endday);
                window.mpcacamerasetting.uicontext.InitialiseScheduleTimePicker(self);
            }
        });
        self.SelectedMultiFromDay.subscribe(function (newval) {
            var days = common.constants.days;
            var finaldays = $.map(days, function (day) {
                if (day.index > newval.index)
                    return day;
            });
            if (newval.index == days.length - 1) {
                finaldays.push(days[0]);
            }
            self.multitodays(finaldays);
            self.SelectedMultiToDay(self.multitodays()[0]);
        });

        self.dosavesettings = function () {
            if (ValidateScheduleSettings()) {
                datacontext.saveschedulesettings(self).done(function (jsonresult) {
                    if (jsonresult.success) {
                        ShowError(false);
                        window.mpcacamerasetting.uicontext.closescheduledialog();
                        var msg = common.messages.save_success;
                        if (jsonresult.recorderstatus && jsonresult.recorderstatus.toLowerCase() != common.constants.recorderstatus.ONLINE.toLowerCase()) {
                            msg += "." + common.messages.devoffline_cnfgdwnOnOnl;
                        }
                        alertify.success(msg);
                        $.publish(common.events.mpcascheduleupdate, { Id: jsonresult.data.Id, Name: jsonresult.data.Name, Type: self.Type() });
                    }
                    else
                        ShowError(true, jsonresult.error);
                }).error(function () {
                    ShowError(true, common.messages.save_error);
                });
            }
        }
        self.docancelsettings = function () {
            window.mpcacamerasetting.uicontext.closescheduledialog();
        }
        self.doresetsettings = function () {
            if (data) {
                self.Initialise(data);
                window.mpcacamerasetting.uicontext.InitialiseScheduleTimePicker(self);
            }
        }
        self.toJson = function () {
            var daysvalue = -1;
            if (!self.IsSingleDay()) {
                var days = common.constants.days;
                for (var i = 0; i < days.length; i++) {
                    if (days[i].index == self.SelectedMultiFromDay().index) {
                        daysvalue = days[i].value;
                        if (days[i].index == days.length - 1) {
                            daysvalue += days[0].value;
                            break;
                        }
                    }
                    else if (daysvalue > 0 && days[i].index <= self.SelectedMultiToDay().index) {
                        daysvalue += days[i].value;
                    }
                }
            }
            else {
                daysvalue = self.SelectedSingleDay().value;
            }
            self.TimeSlots = [{ StartTime: MakeUTC(self.StartTime()), EndTime: MakeUTC(self.EndTime()), Days: daysvalue }];
            return ko.toJSON(self);
        }

        function MakeUTC(datetime) {
            var returntime = new Date(datetime).addMinutes(-1 * (new Date().getTimezoneOffset()));
            return returntime;
        }
        function ValidateScheduleSettings() {
            var stTime = self.StartTime();
            var edTime = self.EndTime();
            if (stTime.getHours() > edTime.getHours()
                || (stTime.getHours() == edTime.getHours() && stTime.getMinutes() > edTime.getMinutes())
                || (stTime.getHours() == edTime.getHours() && stTime.getMinutes() == edTime.getMinutes() && stTime.getSeconds() >= edTime.getSeconds())) {
                ShowError(true, common.messages.sch_frmlsttotime)
                return false;
            }
            return true;
        }
        function ShowError(iserror, errmsg) {
            self.IsError(iserror);
            if (errmsg)
                self.ErrorMessage(errmsg);
        }
        function ToJavaScriptTime(val) {
            var localdatetime = (typeof val === 'string' ? new Date(val.match(/\d+/)[0] * 1) : val);
            var utcdatetime = new Date(localdatetime);
            utcdatetime.setFullYear(localdatetime.getUTCFullYear());
            utcdatetime.setMonth(localdatetime.getUTCMonth());
            utcdatetime.setDate(localdatetime.getUTCDate());
            utcdatetime.setHours(localdatetime.getUTCHours());
            utcdatetime.setMinutes(localdatetime.getUTCMinutes());
            utcdatetime.setSeconds(localdatetime.getUTCSeconds());
            utcdatetime.setMilliseconds(localdatetime.getUTCMilliseconds());
            return utcdatetime;
        }

        self.Initialise = function (initdata) {
            isinitialised = false;
            data = initdata || {};
            self.Id(data.Id);
            self.Name(data.Name);

            var days = common.constants.days;
            self.singledays($.map(days, function (day) {
                return day;
            }));
            self.multifromdays($.map(days, function (day) {
                return day;
            }));
            self.multitodays($.map(days, function (day) {
                if (day.index > 0)
                    return day;
            }));

            //Check for multiple days
            var daysofweek = data.TimeSlots[0].Days;
            if (daysofweek == (days[0].value + days[days.length - 1].value)) {
                self.DayType(common.constants.scheduledaytypes.MulitpleDays);
                self.SelectedMultiFromDay(days[days.length - 1]);
                self.SelectedMultiToDay(days[0]);
            }
            else {
                var startday = -1;
                var endday = -1;
                for (var i = 0; i < days.length; i++) {
                    if ((days[i].value & daysofweek) == days[i].value) {
                        startday = startday < 0 ? i : startday;
                        endday = i;
                    }
                }
                if (startday != endday) {
                    self.DayType(common.constants.scheduledaytypes.MulitpleDays);
                    self.SelectedMultiFromDay(days[startday]);
                    self.SelectedMultiToDay(days[endday]);
                }
                else {
                    self.DayType(common.constants.scheduledaytypes.SingleDay);
                    self.SelectedSingleDay(days[startday]);
                }
            }

            self.StartTime(ToJavaScriptTime(data.TimeSlots[0].StartTime));
            self.EndTime(ToJavaScriptTime(data.TimeSlots[0].EndTime));
            isinitialised = true;
        }
    }
    datacontext.ScheduleSettings = scheduleSettings;
})(ko, window.mpcacamerasetting.datacontext, window.mpcacamerasetting.common);