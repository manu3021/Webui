(function () {

    var antiForgeryToken = $('#antiForgeryToken').val();
    var timeMgmturl = $('#timeManagementUrl').val();

    var TimeManagementView = uibase.BaseView.inherits({
        initializeView: function (options) {
            this.subscribe(window.timemanagement.events.treeview_item_selected, this.onTreeNodeSelected, true);
        },
        onTreeNodeSelected: function (eventName, node) {
            if (node.nodedata.EntityType.toLowerCase() == window.timemanagement.constants.scheduleEntity.toLowerCase()) {
                this.show(new window.timemanagement.TimeManagementViewModel({
                    viewName: this.viewName,
                    baseUrl: this.baseUrl,
                    antiForgeryToken: this.antiForgeryToken,
                    accountId: node.nodedata.accountId,
                    schedule: new window.timemanagement.ScheduleListViewModel({
                        viewName: this.viewName,
                        baseUrl: this.baseUrl,
                        antiForgeryToken: this.antiForgeryToken,
                        accountId: node.nodedata.accountId
                    }),
                    holiday: new window.timemanagement.HolidayListViewModel({
                        viewName: this.viewName,
                        baseUrl: this.baseUrl,
                        antiForgeryToken: this.antiForgeryToken,
                        accountId: node.nodedata.accountId
                    })
                }));
            }
            else {
                this.close();
            }
        },
        beforeShow: function () {
            $("[data-accounttype]").addClass("settingsform");
            $("[data-accounttype]").removeClass('settingsform_active');
            $("[data-accounttype='" + window.timemanagement.constants.pluginRegion.toUpperCase() + "']").addClass("settingsform_active");
        },
        subscribeEvents: function () {
            this.subscribe(window.timemanagement.events.holiday_saved, this.onHolidaySave);
            this.subscribe(window.timemanagement.events.holiday_confirm_delete, this.onConfirmHolidayDelete);
            this.subscribe(window.timemanagement.events.holiday_deleted, this.onHolidayDelete);

            this.subscribe(window.timemanagement.events.schedule_saved, this.onScheduleSave);
            this.subscribe(window.timemanagement.events.schedule_confirm_delete, this.onConfirmScheduleDelete);
            this.subscribe(window.timemanagement.events.schedule_deleted, this.onScheduleDelete);
        },
        onConfirmHolidayDelete: function (eventName, data) {
            var self = this;
            if (data && data.length > 0) {
                alertify.confirm(window.timemanagement.messages.holiday_delete_confirm, function (val) {
                    if (val && self.viewModel.holiday) {
                        self.viewModel.holiday.trigger(window.timemanagement.events.holiday_delete_confirmed, data);
                    }
                });
            }
            else {
                alertify.alert(window.timemanagement.messages.holiday_delete_select);
            }
        },
        onHolidayDelete: function (eventName, result) {
            if (result && result.total && result.total == result.delCount) {
                alertify.success(window.timemanagement.messages.holiday_delete_success);
            }
            else {
                alertify.error(window.timemanagement.messages.holiday_delete_fail);
            }
            if (this.viewModel.holiday) {
                this.viewModel.holiday.trigger(window.timemanagement.events.holiday_list_refresh);
            }
        },
        onHolidaySave: function (eventName, result) {
            if (this.viewModel.holiday && result.Success) {
                this.viewModel.holiday.trigger(window.timemanagement.events.holiday_list_refresh);
            }
        },
        onConfirmScheduleDelete: function (eventName, data) {
            var self = this;
            if (data.totalSchedules.length > 0) {
                if (data.associatedSchedules.length == data.totalSchedules.length) {
                    alertify.alert(window.timemanagement.messages.schedule_delete_all_associate_confirm);
                }
                else if (data.associatedSchedules.length != 0 && data.totalSchedules.length > data.associatedSchedules.length) {
                    alertify.alert(window.timemanagement.messages.schedule_delete_partial_associate_confirm);
                }
                else {
                    data.deleteMode = 0;
                    alertify.confirm(window.timemanagement.messages.schedule_delete_confirm, function (val) {
                        if (val && self.viewModel.schedule) {
                            self.viewModel.schedule.trigger(window.timemanagement.events.schedule_delete_confirmed, data);
                        }
                    });
                }
            }
            else {
                alertify.alert(window.timemanagement.messages.schedule_delete_select);
            }
        },
        onScheduleDelete: function (eventName, result) {
            if (result && result.total && result.total == result.delCount) {
                alertify.success(window.timemanagement.messages.schedule_delete_success);
            }
            else {
                alertify.error(window.timemanagement.messages.schedule_delete_fail);
            }
            if (this.viewModel.schedule) {
                this.viewModel.schedule.trigger(window.timemanagement.events.schedule_list_refresh);
            }
        },
        onScheduleSave: function (eventName, result) {
            if (this.viewModel.schedule && result.Success) {
                this.viewModel.schedule.trigger(window.timemanagement.events.schedule_list_refresh);
            }
        }
    });

    var ScheduleView = uibase.BaseView.inherits({
        initializeView: function (options) {
            this.subscribe(window.timemanagement.events.schedule_show_config, this.onShowEventReceived, true);
        },
        onShowEventReceived: function (eventName, data) {
            this.show(new window.timemanagement.ScheduleViewModel({
                viewName: this.viewName,
                baseUrl: this.baseUrl,
                antiForgeryToken: this.antiForgeryToken,
                validationContext: new uibase.BaseValidationContext(this.viewName, window.timemanagement.ScheduleValidations),
                accountId: data.accountId,
                scheduleId: data.scheduleId
            }), true);
        },
        subscribeEvents: function () {
            this.subscribe(window.timemanagement.events.schedule_saved, this.onScheduleSave);
            this.subscribe(window.timemanagement.events.schedule_cancelled, this.onScheduleCancel);
        },
        onScheduleSave: function (eventName, result) {
            if (this.viewModel && result.Success) {
                alertify.success(window.timemanagement.messages.schedule_save_success);
                this.close();
            }
        },
        onScheduleCancel: function (eventName, result) {
            this.close();
        }
    });

    var HolidayView = uibase.BaseView.inherits({
        initializeView: function (options) {
            this.subscribe(window.timemanagement.events.holiday_show_config, this.onShowEventReceived, true);
        },
        onShowEventReceived: function (eventName, data) {
            this.show(new window.timemanagement.HolidayViewModel({
                viewName: this.viewName,
                baseUrl: this.baseUrl,
                antiForgeryToken: this.antiForgeryToken,
                validationContext: new uibase.BaseValidationContext(this.viewName, window.timemanagement.HolidayValidations),
                accountId: data.accountId,
                holidayId: data.holidayId
            }), true);
        },
        subscribeEvents: function () {
            this.subscribe(window.timemanagement.events.holiday_saved, this.onHolidaySave);
            this.subscribe(window.timemanagement.events.holiday_cancelled, this.onHolidayCancel);
        },
        onHolidaySave: function (eventName, result) {
            if (this.viewModel && result.Success) {
                alertify.success(window.timemanagement.messages.holiday_save_success);
                this.close();
            }
        },
        onHolidayCancel: function (eventName, result) {
            this.close();
        }
    });

    window.timemanagement.views = {
        timeManagementView: new TimeManagementView({
            baseUrl: timeMgmturl,
            antiForgeryToken: antiForgeryToken,
            viewName: 'timeManagement'
        }),
        holidayView: new HolidayView({
            baseUrl: timeMgmturl,
            antiForgeryToken: antiForgeryToken,
            viewName: 'holidaymodal_form',
            modalId: 'holidaymodal'
        }),
        scheduleView: new ScheduleView({
            baseUrl: timeMgmturl,
            antiForgeryToken: antiForgeryToken,
            viewName: 'manageTimeScheduleForm',
            modalId: 'manageTimeSchedule'
        })
    };

})();

