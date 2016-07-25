(function () {

    var dashboardurl = $("#dashboardconfigurl").val();
    var webSocketHost = $("#eventServiceWebSocketUrl").val();
    var socketPollInterval = $("#alarmMonitorPollInterval").val();
    var antiForgeryToken = $('#antiForgeryToken').val();

    var DashboardView = uibase.BaseView.inherits({
        initializeView: function (options) {
            this.subscribe(window.dashboardconfig.events.dashboard_start_config, this.onShowConfigSelected, true);
            this.subscribe(window.dashboardconfig.events.dashboard_close_config, this.onCloseConfig, true);
            this.subscribe(window.dashboardconfig.events.dashboard_delete_confirm, this.onDashboardDeleteClicked, true);
            this.subscribe(window.dashboardconfig.events.dashboard_deleted, this.onDashboardDeleted, true);
        },
        onViewInitialized: function (options) {
            this.show(new window.dashboardconfig.DashboardViewModel({
                baseUrl: this.baseUrl,
                viewName: this.viewName,
                antiForgeryToken: this.antiForgeryToken,
                footer: new window.dashboardconfig.FooterViewModel({
                    baseUrl: this.baseUrl,
                    viewName: this.viewName,
                    antiForgeryToken: this.antiForgeryToken
                })
            }));
        },
        subscribeEvents: function() {
            this.subscribe(window.dashboardconfig.events.dashboard_delete_clicked, this.onDashboardDeleteClicked);
            this.subscribe(window.dashboardconfig.events.dashboard_deleted, this.onDashboardDeleted);
        },
        onShowConfigSelected: function () {
            this.hide();
        },
        onCloseConfig: function (eventName, saved) {
            this.show();
            if (saved && this.viewModel) {
                this.viewModel.trigger(window.dashboardconfig.events.dashboard_refresh);
            }
        },
        onDashboardDeleteClicked: function (event, data) {
            var self = this;
            alertify.confirm(window.dashboardconfig.messages.dashboard_delete_confirm, function (val) {
                if (val && self.viewModel) {
                    self.viewModel.trigger(window.dashboardconfig.events.dashboard_delete_confirmed, data.dashboardId);
                }
            });
        },
        onDashboardDeleted: function (eventName, result) {
            if (result && result.Success && this.viewModel) {
                this.viewModel.trigger(window.dashboardconfig.events.dashboard_refresh);
            }
        }
    });

    var DashboardConfigView = uibase.BaseView.inherits({
        initializeView: function (options) {
            this.subscribe(window.dashboardconfig.events.dashboard_start_config, this.onShowConfigSelected, true);
        },
        onShowConfigSelected: function (eventName, data) {
            $("#dashboardCreateEdit").css("display", "block");
            this.show(new window.dashboardconfig.DashboardConfigViewModel({
                baseUrl: this.baseUrl,
                viewName: this.viewName,
                antiForgeryToken: this.antiForgeryToken,
                validationContext: new uibase.BaseValidationContext(this.viewName, window.dashboardconfig.DashboardValidations),
                treeview: new window.dashboardconfig.TreeViewModel({
                    baseUrl: this.baseUrl,
                    expandableNodeTypes: ['SITE', 'CUSTOMER', 'GENERAL', 'ROOT', 'DEALER','GROUP'],
                    depth: 1
                }),
                dashboardId: data && data.dashboardId
            }));
        },
        subscribeEvents: function () {
            this.subscribe(window.dashboardconfig.events.add_entity_error, this.onAddEntityError);
            this.subscribe(window.dashboardconfig.events.dashboard_close_config, this.onCloseConfig);
            this.subscribe(window.dashboardconfig.events.dashboard_saved, this.onDashboardSaved);
        },
        onAddEntityError: function(eventName, err) {
            if (err) {
                alertify.error(err);
            }
        },
        onDashboardSaved: function (eventName, result) {
            if (result && result.Success) {
                alertify.success(window.dashboardconfig.messages.dashboard_save_success);
                this.publish(window.dashboardconfig.events.dashboard_close_config, true);
            }
          
        },
        onCloseConfig: function () {
            this.close();
        }
    });

    var DashboardPreviewView = uibase.BaseView.inherits({
        initializeView: function (options) {
            this.subscribe(window.dashboardconfig.events.dashboard_show_preview, this.onShowPreview, true);
        },
        onShowPreview: function(event, data) {
            this.show(new window.dashboardconfig.DashboardPreviewViewModel({
                viewName: this.viewName,
                baseUrl: this.baseUrl,
                antiForgeryToken: this.antiForgeryToken,
                data: data
            }));
        },
        subscribeEvents: function () {
            this.subscribe(window.dashboardconfig.events.dashboard_close_preview, this.onClosePreview);
        },
        onClosePreview: function (event, data) {
            if (data && data.IsError) {
                alertify.error(Resources.error_on_server);
            }
            this.close();
        }
    });

    window.dashboardconfig.views = {
        dashboardView: new DashboardView({
            baseUrl: dashboardurl,
            antiForgeryToken: antiForgeryToken,
            viewName: 'maincontainer'
        }),
        dashboardConfigView: new DashboardConfigView({
            baseUrl: dashboardurl,
            antiForgeryToken: antiForgeryToken,
            viewName: 'dashboardEditLayout'
        }),
        dashboardPreviewView: new DashboardPreviewView({
            baseUrl: dashboardurl,
            antiForgeryToken: antiForgeryToken,
            viewName: 'previewDashboardForm',
            modalId: 'previewDashboard'
        })
    };

    window.dashboardconfig.services = {
        socketService: new window.dashboardconfig.AlarmViewModel({
            baseUrl: dashboardurl,
            antiForgeryToken: antiForgeryToken,
            host: webSocketHost,
            interval: socketPollInterval
        })
    };

})();