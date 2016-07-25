(function () {
    var HolidayModel = window.timemanagement.HolidayModel;
    var ScheduleModel = window.timemanagement.ScheduleModel;

    window.timemanagement.TimeManagementViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.initializeBinding(options);
        },
        initializeBinding: function (options) {
            this.schedule = options.schedule;
            this.holiday = options.holiday;
            this.currentTab = ko.observable(0);
            this.IsChildLoading = ko.computed(function () {
                return this.schedule.IsLoading() || this.holiday.IsLoading();
            }, this);
        },
        switchTab: function (tabMode) {
            this.currentTab(tabMode);
        }
    });

    window.timemanagement.HolidayViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll(this, 'saveHoliday', 'cancelHoliday');
            this.accountId = options.accountId;
            this.holidayId = options.holidayId; (function () {

                var HolidayModel = window.timemanagement.HolidayModel;
                var ScheduleModel = window.timemanagement.ScheduleModel;

                window.timemanagement.TimeManagementViewModel = uibase.BaseViewModel.inherits({
                    initializeViewModel: function (options) {
                        this.initializeBinding(options);
                    },
                    initializeBinding: function (options) {
                        this.schedule = options.schedule;
                        this.holiday = options.holiday;
                        this.currentTab = ko.observable(0);
                        this.IsChildLoading = ko.computed(function () {
                            return this.schedule.IsLoading() || this.holiday.IsLoading();
                        }, this);
                    },
                    switchTab: function (tabMode) {
                        this.currentTab(tabMode);
                    }
                });

                window.timemanagement.HolidayViewModel = uibase.BaseViewModel.inherits({
                    initializeViewModel: function (options) {
                        this.bindAll(this, 'saveHoliday', 'cancelHoliday');
                        this.accountId = options.accountId;
                        this.holidayId = options.holidayId;
                        this.initializeBinding(options);
                    },
                    initializeBinding: function (options) {
                        this.model = new HolidayModel();
                        this.ErrorMessage = ko.observable("");
                        this.IsError = ko.observable(false);
                        this.getHoliday();
                    },
                    getHoliday: function (cb) {
                        var self = this;
                        if (this.holidayId) {
                            this.postDataRequest('/GetHoliday', { holidayId: this.holidayId }, function (err, result) {
                                if (!err && result) {
                                    if (result.Success && result.data) {
                                        self.model.dataSource(result.data);
                                    }
                                }
                                if (cb) { cb(); }
                            });
                        }
                    },
                    saveHoliday: function () {
                        var self = this;
                        if (this.validationContext.validate()) {
                            var postData = {
                                holiday: this.model.toJson(),
                                accountId: this.accountId
                            };
                            this.postDataRequest('/SaveHoliday', postData, function (err, result) {
                                if (!err && result) {
                                    if (result.Success && result.data) {
                                        self.publish(window.timemanagement.events.holiday_saved, { Success: result.Success })
                                    }
                                    else {
                                        //Check
                                        self.IsError(true);
                                        self.ErrorMessage(result.errorMessage || window.timemanagement.messages.error_on_server);
                                    }
                                }
                            });
                        }
                    },
                    cancelHoliday: function () {
                        this.validationContext.reset();
                        this.publish(window.timemanagement.events.holiday_cancelled)
                    }
                });

                window.timemanagement.HolidayListViewModel = uibase.BaseViewModel.inherits({
                    initializeViewModel: function (options) {
                        this.bindAll(this, 'createHoliday', 'editHoliday', 'deleteHoliday', 'onDeleteConfirm', 'onSelectHoliday');
                        this.accountId = options.accountId;
                        this.initializeBinding(options);
                    },
                    initializeBinding: function (options) {
                        this.startIndex = ko.observable(null);
                        this.maxRecordCount = ko.observable(null);
                        this.ErrorMessage = ko.observable("");
                        this.IsError = ko.observable(false);
                        this.holidays = ko.observableArray([]);
                        this.deleteVisible = ko.observable(false);
                        this.selectAll = ko.observable(false);
                        this.getAllHolidays();
                        this.on(window.timemanagement.events.holiday_list_refresh, this.getAllHolidays);
                        this.on(window.timemanagement.events.holiday_delete_confirmed, this.onDeleteConfirm);
                    },
                    getAllHolidays: function (cb) {
                        var self = this,
                            postData = {
                                accountId: this.accountId,
                                startIndex: this.startIndex(),
                                maxRecordCount: this.maxRecordCount()
                            }
                        this.postDataRequest('/GetAllHolidays', postData, function (err, result) {
                            if (!err && result) {
                                if (result.Success && result.data) {
                                    self.holidays(result.data.map(function (item) {
                                        return new HolidayModel(item);
                                    }));
                                }
                            }
                            if (cb) { cb(); }
                        });
                    },
                    createHoliday: function () {
                        this.publish(window.timemanagement.events.holiday_show_config, { accountId: this.accountId });
                    },
                    editHoliday: function (holiday) {
                        this.publish(window.timemanagement.events.holiday_show_config, { holidayId: holiday.Id(), accountId: this.accountId });
                    },
                    deleteHoliday: function () {
                        var toBeDeleted = _.filter(this.holidays(), function (item) {
                            return item.IsSelected() == true;
                        });
                        this.publish(window.timemanagement.events.holiday_confirm_delete, toBeDeleted);
                    },
                    onDeleteConfirm: function (holidays) {
                        var self = this;
                        var total = holidays.length;
                        var callCount = 0;
                        var delCount = 0;
                        for (var h in holidays) {
                            this.postDataRequest('/DeleteHoliday', { holidayId: holidays[h].Id() }, function (err, result) {
                                ++callCount;
                                if (!err && result && result.Success) {
                                    self.holidays.remove(_.first(self.holidays(), function (item) {
                                        return item.Id() == result.data;
                                    }));
                                    ++delCount;
                                }
                                if (callCount == total) {
                                    self.publish(window.timemanagement.events.holiday_deleted, { total: total, delCount: delCount });
                                    self.deleteVisible(false);
                                }
                            });
                        }
                    },
                    onSelectHoliday: function (holiday) {
                        var isSelected = holiday.IsSelected();
                        if (isSelected) {
                            isSelected = !(_.some(this.holidays(), function (item) {
                                return !item.IsSelected();
                            }));
                        }
                        this.deleteVisible((_.some(this.holidays(), function (item) {
                            return item.IsSelected();
                        })));
                        this.selectAll(isSelected);
                        return true;
                    },
                    onSelectAllHoliday: function () {
                        _.each(this.holidays(), function (item) {
                            item.IsSelected(this.selectAll());
                        }, this);
                        this.deleteVisible((_.some(this.holidays(), function (item) {
                            return item.IsSelected();
                        })));
                        return true;
                    }
                });

                window.timemanagement.ScheduleViewModel = uibase.BaseViewModel.inherits({
                    initializeViewModel: function (options) {
                        this.bindAll(this, 'saveSchedule', 'cancelSchedule');
                        this.accountId = options.accountId;
                        this.scheduleId = options.scheduleId;
                        this.initializeBinding(options);
                    },
                    initializeBinding: function (options) {
                        this.model = new ScheduleModel();
                        this.Days = ko.observableArray(this.getAllDays());
                        this.SnapTime = ko.observable(5);
                        this.ErrorMessage = ko.observable("");
                        this.IsError = ko.observable(false);
                        this.getSchedule();
                    },
                    getSchedule: function (cb) {
                        var self = this;
                        if (this.scheduleId) {
                            this.postDataRequest('/GetTimeSchedule', { scheduleId: this.scheduleId }, function (err, result) {
                                if (!err && result) {
                                    if (result.Success && result.data) {
                                        self.model.dataSource(result.data);
                                    }
                                }
                                if (cb) { cb(); }
                            });
                        }
                    },
                    getAllDays: function () {
                        return [
                        { Text: Resources.day_monday, Value: 2 },
                        { Text: Resources.day_tuesday, Value: 4 },
                        { Text: Resources.day_wednesday, Value: 8 },
                        { Text: Resources.day_thursday, Value: 16 },
                        { Text: Resources.day_friday, Value: 32 },
                        { Text: Resources.day_saturday, Value: 64 },
                        { Text: Resources.day_sunday, Value: 1 },
                        { Text: Resources.H1, Value: 0, Type: 'Type1' },
                        { Text: Resources.H2, Value: 0, Type: 'Type2' },
                        { Text: Resources.H3, Value: 0, Type: 'Type3' }];
                    },
                    saveSchedule: function () {
                        var self = this;
                        if (this.validationContext.validate() && this.validateEntities()) {
                            var postData = {
                                schedule: this.model.toJson(),
                                accountId: this.accountId
                            };
                            this.postDataRequest('/SaveTimeSchedule', postData, function (err, result) {
                                if (!err && result) {
                                    if (result.Success && result.data) {
                                        self.publish(window.timemanagement.events.schedule_saved, { Success: result.Success })
                                    }
                                    else {
                                        //Check
                                        self.IsError(true);
                                        self.ErrorMessage(result.errorMessage || window.timemanagement.messages.error_on_server);
                                    }
                                }
                            });
                        }
                    },
                    validateEntities: function () {
                        var errorMsg = null;
                        if (this.model.TimeSlots().length == 0) {
                            errorMsg = Resources.Schedule_TimeSlot_Required;
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
                    cancelSchedule: function () {
                        this.validationContext.reset();
                        this.publish(window.timemanagement.events.schedule_cancelled)
                    }
                });

                window.timemanagement.ScheduleListViewModel = uibase.BaseViewModel.inherits({
                    initializeViewModel: function (options) {
                        this.bindAll(this, 'createSchedule', 'editSchedule', 'deleteSchedule', 'onSelectSchedule');
                        this.accountId = options.accountId;
                        this.initializeBinding(options);
                    },
                    initializeBinding: function (options) {
                        this.startIndex = ko.observable(null);
                        this.maxRecordCount = ko.observable(null);
                        this.ErrorMessage = ko.observable("");
                        this.IsError = ko.observable(false);
                        this.schedules = ko.observableArray([]);
                        this.scheduleList = ko.computed(function () {
                            return _.sortBy(this.schedules(), function (schedule) {
                                return schedule.IsSystemEntity() ? 0 : 1;
                            });
                        }, this);
                        this.deleteVisible = ko.observable(false);
                        this.selectAll = ko.observable(false);
                        this.getAllSchedules();
                        this.on(window.timemanagement.events.schedule_list_refresh, this.getAllSchedules);
                        this.on(window.timemanagement.events.schedule_delete_confirmed, this.onDeleteConfirm);
                    },
                    getAllSchedules: function (cb) {
                        var self = this,
                            postData = {
                                accountId: this.accountId,
                                startIndex: this.startIndex(),
                                maxRecordCount: this.maxRecordCount()
                            }
                        this.postDataRequest('/GetAllTimeSchedules', postData, function (err, result) {
                            if (!err && result) {
                                if (result.Success && result.data) {
                                    self.schedules(result.data.map(function (item) {
                                        return new ScheduleModel(item);
                                    }));
                                }
                            }
                            if (cb) { cb(); }
                        });
                    },
                    createSchedule: function () {
                        this.publish(window.timemanagement.events.schedule_show_config, { accountId: this.accountId });
                    },
                    editSchedule: function (schedule) {
                        this.publish(window.timemanagement.events.schedule_show_config, { scheduleId: schedule.Id(), accountId: this.accountId });
                    },
                    deleteSchedule: function () {
                        var self = this;
                        var totalSchedules = _.filter(this.schedules(), function (item) {
                            return item.IsSelected() == true && !item.IsSystemEntity();
                        });
                        this.getAssociatedSchedules(totalSchedules, function (associatedSchedules) {
                            self.publish(window.timemanagement.events.schedule_confirm_delete, { totalSchedules: totalSchedules, associatedSchedules: associatedSchedules });
                        });
                    },
                    onDeleteConfirm: function (data) {
                        var self = this;
                        var toBeDeleted = [];
                        if (data.deleteMode == 0) {
                            toBeDeleted = data.totalSchedules;
                        }
                        else if (data.deleteMode == 1) {
                            toBeDeleted = _.filter(data.totalSchedules, function (ts) {
                                return !(_.some(data.associatedSchedules, function (as) {
                                    return as.Id().toLowerCase() == ts.Id().toLowerCase();
                                }));
                            });
                        }
                        if (toBeDeleted) {
                            var total = toBeDeleted.length;
                            var callCount = 0;
                            var delCount = 0;
                            for (var t in toBeDeleted) {
                                this.postDataRequest('/DeleteTimeSchedule', { scheduleId: toBeDeleted[t].Id() }, function (err, result) {
                                    ++callCount;
                                    if (!err && result && result.Success) {
                                        self.schedules.remove(_.first(self.schedules(), function (item) {
                                            return item.Id() == result.data;
                                        }));
                                        ++delCount;
                                    }
                                    if (callCount == total) {
                                        self.publish(window.timemanagement.events.schedule_deleted, { total: total, delCount: delCount });
                                        self.deleteVisible(false);
                                    }
                                });
                            }
                        }
                    },
                    getAssociatedSchedules: function (schedules, cb) {
                        if (schedules && schedules.length > 0) {
                            var associatedEntities = [];
                            var scheduleIds = _.map(schedules, function (item) {
                                return item.Id();
                            });
                            var postData = { scheduleIds: scheduleIds }
                            this.postDataRequest('/GetAssociatedEntity', postData, function (err, result) {
                                if (!err && result) {
                                    if (result.Success && result.data) {
                                        associatedEntities = result.data;
                                    }
                                }
                                if (cb && typeof (cb) === 'function') { cb(associatedEntities); }
                            });
                        }
                        else {
                            if (cb && typeof (cb) === 'function') { cb(associatedEntities); }
                        }
                    },
                    onSelectAllSchedule: function () {
                        _.each(this.schedules(), function (item) {
                            if (!item.IsSystemEntity()) {
                                item.IsSelected(this.selectAll());
                            }
                        }, this);
                        this.deleteVisible((_.some(this.schedules(), function (item) {
                            return item.IsSelected() && !item.IsSystemEntity();
                        })));
                        return true;
                    },
                    onSelectSchedule: function (schedule) {
                        var isSelected = schedule.IsSelected();
                        if (isSelected) {
                            isSelected = !(_.some(this.schedules(), function (item) {
                                return !item.IsSelected() && !item.IsSystemEntity();
                            }));
                        }
                        this.deleteVisible((_.some(this.schedules(), function (item) {
                            return item.IsSelected() && !item.IsSystemEntity();
                        })));
                        this.selectAll(isSelected);
                        return true;
                    }
                });

            })()
            this.initializeBinding(options);
        },
        initializeBinding: function (options) {
            this.model = new HolidayModel();
            this.ErrorMessage = ko.observable("");
            this.IsError = ko.observable(false);
            this.getHoliday();
        },
        getHoliday: function (cb) {
            var self = this;
            if (this.holidayId) {
                this.postDataRequest('/GetHoliday', { holidayId: this.holidayId }, function (err, result) {
                    if (!err && result) {
                        if (result.Success && result.data) {
                            self.model.dataSource(result.data);
                        }
                    }
                    if (cb) { cb(); }
                });
            }
        },
        saveHoliday: function () {
            var self = this;
            if (this.validationContext.validate()) {
                var postData = {
                    holiday: this.model.toJson(),
                    accountId: this.accountId
                };
                this.postDataRequest('/SaveHoliday', postData, function (err, result) {
                    if (!err && result) {
                        if (result.Success && result.data) {
                            self.publish(window.timemanagement.events.holiday_saved, { Success: result.Success })
                        }
                        else {
                            //Check
                            self.IsError(true);
                            self.ErrorMessage(result.errorMessage || window.timemanagement.messages.error_on_server);
                        }
                    }
                });
            }
        },
        cancelHoliday: function () {
            this.validationContext.reset();
            this.publish(window.timemanagement.events.holiday_cancelled)
        }
    });

    window.timemanagement.HolidayListViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll(this, 'createHoliday', 'editHoliday', 'deleteHoliday', 'onDeleteConfirm', 'onSelectHoliday');
            this.accountId = options.accountId;
            this.initializeBinding(options);
        },
        initializeBinding: function (options) {
            this.startIndex = ko.observable(null);
            this.maxRecordCount = ko.observable(null);
            this.ErrorMessage = ko.observable("");
            this.IsError = ko.observable(false);
            this.holidays = ko.observableArray([]);
            this.selectAll = ko.observable(false);
            this.deleteVisible = ko.observable(false);
            this.getAllHolidays();
            this.on(window.timemanagement.events.holiday_list_refresh, this.getAllHolidays);
            this.on(window.timemanagement.events.holiday_delete_confirmed, this.onDeleteConfirm);
        },
        getAllHolidays: function (cb) {
            var self = this,
                postData = {
                    accountId: this.accountId,
                    startIndex: this.startIndex(),
                    maxRecordCount: this.maxRecordCount()
                }
            this.postDataRequest('/GetAllHolidays', postData, function (err, result) {
                if (!err && result) {
                    if (result.Success && result.data) {
                        self.holidays(result.data.map(function (item) {
                            return new HolidayModel(item);
                        }));
                    }
                }
                if (cb) { cb(); }
            });
        },
        createHoliday: function () {
            this.publish(window.timemanagement.events.holiday_show_config, { accountId: this.accountId });
        },
        editHoliday: function (holiday) {
            this.publish(window.timemanagement.events.holiday_show_config, { holidayId: holiday.Id(), accountId: this.accountId });
        },
        deleteHoliday: function () {
            var toBeDeleted = _.filter(this.holidays(), function (item) {
                return item.IsSelected() == true;
            });
            this.publish(window.timemanagement.events.holiday_confirm_delete, toBeDeleted);
        },
        onDeleteConfirm: function (holidays) {
            var self = this;
            var total = holidays.length;
            var callCount = 0;
            var delCount = 0;
            for (var h in holidays) {
                this.postDataRequest('/DeleteHoliday', { holidayId: holidays[h].Id() }, function (err, result) {
                    ++callCount;
                    if (!err && result && result.Success) {
                        self.holidays.remove(_.first(self.holidays(), function (item) {
                            return item.Id() == result.data;
                        }));
                        ++delCount;
                    }
                    if (callCount == total) {
                        self.publish(window.timemanagement.events.holiday_deleted, { total: total, delCount: delCount });
                        self.deleteVisible(false);
                    }
                });
            }
        },
        onSelectHoliday: function (holiday) {
            var isSelected = holiday.IsSelected();
            if (isSelected) {
                isSelected = !(_.some(this.holidays(), function (item) {
                    return !item.IsSelected();
                }));
            }
            this.deleteVisible((_.some(this.holidays(), function (item) {
                return item.IsSelected();
            })));
            this.selectAll(isSelected);
            return true;
        },
        onSelectAllHoliday: function () {
            _.each(this.holidays(), function (item) {
                item.IsSelected(this.selectAll());
            }, this);
            this.deleteVisible((_.some(this.holidays(), function (item) {
                return item.IsSelected();
            })));
            return true;
        }
    });

    window.timemanagement.ScheduleViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll(this, 'saveSchedule', 'cancelSchedule');
            this.accountId = options.accountId;
            this.scheduleId = options.scheduleId;
            this.initializeBinding(options);
        },
        initializeBinding: function (options) {
            this.model = new ScheduleModel();
            this.Days = ko.observableArray(this.getAllDays());
            this.SnapTime = ko.observable(5);
            this.ErrorMessage = ko.observable("");
            this.IsError = ko.observable(false);
            this.getSchedule();
        },
        getSchedule: function (cb) {
            var self = this;
            if (this.scheduleId) {
                this.postDataRequest('/GetTimeSchedule', { scheduleId: this.scheduleId }, function (err, result) {
                    if (!err && result) {
                        if (result.Success && result.data) {
                            self.model.dataSource(result.data);
                        }
                    }
                    if (cb) { cb(); }
                });
            }
        },
        getAllDays: function () {
            return [
            { Text: 'Monday', Value: 2 },
            { Text: 'Tuesday', Value: 4 },
            { Text: 'Wednesday', Value: 8 },
            { Text: 'Thursday', Value: 16 },
            { Text: 'Friday', Value: 32 },
            { Text: 'Saturday', Value: 64 },
            { Text: 'Sunday', Value: 1 },
            { Text: 'H1', Value: 0, Type: 'Type1' },
            { Text: 'H2', Value: 0, Type: 'Type2' },
            { Text: 'H3', Value: 0, Type: 'Type3' }];
        },
        saveSchedule: function () {
            var self = this;
            if (this.validationContext.validate() && this.validateEntities()) {
                var postData = {
                    schedule: this.model.toJson(),
                    accountId: this.accountId
                };
                this.postDataRequest('/SaveTimeSchedule', postData, function (err, result) {
                    if (!err && result) {
                        if (result.Success && result.data) {
                            self.publish(window.timemanagement.events.schedule_saved, { Success: result.Success })
                        }
                        else {
                            //Check
                            self.IsError(true);
                            self.ErrorMessage(result.errorMessage || window.timemanagement.messages.error_on_server);
                        }
                    }
                });
            }
        },
        validateEntities: function () {
            var errorMsg = null;
            if (this.model.TimeSlots().length == 0) {
                errorMsg = Resources.Schedule_TimeSlot_Required;
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
        cancelSchedule: function () {
            this.validationContext.reset();
            this.publish(window.timemanagement.events.schedule_cancelled)
        }
    });

    window.timemanagement.ScheduleListViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll(this, 'createSchedule', 'editSchedule', 'deleteSchedule', 'onSelectSchedule');
            this.accountId = options.accountId;
            this.initializeBinding(options);
        },
        initializeBinding: function (options) {
            this.startIndex = ko.observable(null);
            this.maxRecordCount = ko.observable(null);
            this.ErrorMessage = ko.observable("");
            this.IsError = ko.observable(false);
            this.schedules = ko.observableArray([]);
            this.scheduleList = ko.computed(function () {
                return _.sortBy(this.schedules(), function (schedule) {
                    return schedule.IsSystemEntity() ? 0 : 1;
                });
            }, this);
            this.selectAll = ko.observable(false);
            this.deleteVisible = ko.observable(false);
            this.getAllSchedules();
            this.on(window.timemanagement.events.schedule_list_refresh, this.getAllSchedules);
            this.on(window.timemanagement.events.schedule_delete_confirmed, this.onDeleteConfirm);
        },
        getAllSchedules: function (cb) {
            var self = this,
                postData = {
                    accountId: this.accountId,
                    startIndex: this.startIndex(),
                    maxRecordCount: this.maxRecordCount()
                }
            this.postDataRequest('/GetAllTimeSchedules', postData, function (err, result) {
                if (!err && result) {
                    if (result.Success && result.data) {
                        self.schedules(result.data.map(function (item) {
                            return new ScheduleModel(item);
                        }));
                    }
                }
                if (cb) { cb(); }
            });
        },
        createSchedule: function () {
            this.publish(window.timemanagement.events.schedule_show_config, { accountId: this.accountId });
        },
        editSchedule: function (schedule) {
            this.publish(window.timemanagement.events.schedule_show_config, { scheduleId: schedule.Id(), accountId: this.accountId });
        },
        deleteSchedule: function () {
            var self = this;
            var totalSchedules = _.filter(this.schedules(), function (item) {
                return item.IsSelected() == true && !item.IsSystemEntity();
            });
            this.getAssociatedSchedules(totalSchedules, function (associatedSchedules) {
                self.publish(window.timemanagement.events.schedule_confirm_delete, { totalSchedules: totalSchedules, associatedSchedules: associatedSchedules });
            });
        },
        onDeleteConfirm: function (data) {
            var self = this;
            var toBeDeleted = [];
            if (data.deleteMode == 0) {
                toBeDeleted = data.totalSchedules;
            }
            else if (data.deleteMode == 1) {
                toBeDeleted = _.filter(data.totalSchedules, function (ts) {
                    return !(_.some(data.associatedSchedules, function (as) {
                        return as.Id().toLowerCase() == ts.Id().toLowerCase();
                    }));
                });
            }
            if (toBeDeleted) {
                var total = toBeDeleted.length;
                var callCount = 0;
                var delCount = 0;
                for (var t in toBeDeleted) {
                    this.postDataRequest('/DeleteTimeSchedule', { scheduleId: toBeDeleted[t].Id() }, function (err, result) {
                        ++callCount;
                        if (!err && result && result.Success) {
                            self.schedules.remove(_.first(self.schedules(), function (item) {
                                return item.Id() == result.data;
                            }));
                            ++delCount;
                        }
                        if (callCount == total) {
                            self.publish(window.timemanagement.events.schedule_deleted, { total: total, delCount: delCount });
                            self.deleteVisible(false);
                        }
                    });
                }
            }
        },
        getAssociatedSchedules: function (schedules, cb) {
            if (schedules && schedules.length > 0) {
                var associatedEntities = [];
                var scheduleIds = _.map(schedules, function (item) {
                    return item.Id();
                });
                var postData = { scheduleIds: scheduleIds }
                this.postDataRequest('/GetAssociatedEntity', postData, function (err, result) {
                    if (!err && result) {
                        if (result.Success && result.data) {
                            associatedEntities = result.data;
                        }
                    }
                    if (cb && typeof (cb) === 'function') { cb(associatedEntities); }
                });
            }
            else {
                if (cb && typeof (cb) === 'function') { cb(associatedEntities); }
            }
        },
        onSelectAllSchedule: function () {
            _.each(this.schedules(), function (item) {
                if (!item.IsSystemEntity()) {
                    item.IsSelected(this.selectAll());
                }
            }, this);
            this.deleteVisible((_.some(this.schedules(), function (item) {
                return item.IsSelected() && !item.IsSystemEntity();
            })));
            return true;
        },
        onSelectSchedule: function (schedule) {
            var isSelected = schedule.IsSelected();
            if (isSelected) {
                isSelected = !(_.some(this.schedules(), function (item) {
                    return !item.IsSelected() && !item.IsSystemEntity();
                }));
            }
            this.deleteVisible((_.some(this.schedules(), function (item) {
                return item.IsSelected() && !item.IsSystemEntity();
            })));
            this.selectAll(isSelected);
            return true;
        }
    });

})()