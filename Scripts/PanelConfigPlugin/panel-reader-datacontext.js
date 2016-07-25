(function () {

    var PanelReaderModel = window.panelconfig.PanelReaderModel;

    window.panelconfig.PanelReaderViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll(this, 'getReader', 'saveReader');
            this.readerId = options.readerId;
            this.panelId = options.panelId;
            this.accountId = options.accountId;
            this.oldModelData = ko.observable();
            this.initializeBinding();
        },
        initializeBinding: function () {
            var self = this;
            this.schedules = ko.observableArray([]);
            this.outputs = ko.observableArray([]);
            this.model = new PanelReaderModel();            
            this.getReader(function (result) {
                self.panelId = result.ParentId;
                self.accountId = result.AccountId;
                self.getAllSchedules(function () {
                    self.getAllOutputs(function () {
                        self.model.dataSource(result);
                        self.oldModelData(ko.toJSON(self.model));
                    });
                });
            });
        },
        getAllSchedules: function (cb) {
            var self = this;
            this.postDataRequest('/GetAllSchedules', { accountId: this.accountId }, function (err, result) {
                if (!err && result) {
                    self.schedules.removeAll();
                    self.schedules.push.apply(self.schedules, result);
                    if (cb) { cb(); }
                }
            });
        },
        getAllOutputs: function (cb) {
            var self = this;
            this.postDataRequest('/GetAllOutputs', { id: this.panelId }, function (err, result) {
                if (!err && result) {
                    self.outputs.removeAll();
                    self.outputs.push.apply(self.outputs, result.filter(function (data) {
                        return [1, 3, 7, 9, 11, 13].indexOf(data.Address) != -1;
                    }));
                    if (cb) { cb(); }
                }
            });            
        },
        getReader: function (cb) {
            if (this.readerId) {
                var self = this;
                this.postDataRequest('/GetPanelReader', { id: this.readerId }, function (err, result) {
                    if (!err && result && cb) {
                        cb(result);
                    }
                });
            }
        },
        saveReader: function () {
            if (this.validationContext.validate()) {
                var self = this;
                if (this.oldModelData() == ko.toJSON(self.model.toJson()))
                    return;
                blockUI();
                var postData = { reader: this.model.toJson(), controllerId: this.panelId, accountId: this.accountId };
                this.postDataRequest('/SavePanelReader', postData, function (err, result) {
                    if (!err && result) {
                        //result = self.resolveKeyValue(result);
                        if (result.Success) {
                            self.model.Id(result.data.Id);
                            if (result.data.Status.toLowerCase() != window.panelconfig.constants.online.toLowerCase())
                                self.publish(window.panelconfig.events.panel_reader_saved_offline, self.model.Name())
                            else
                            self.publish(window.panelconfig.events.panel_reader_saved, self.model.Name());
                            self.oldModelData(ko.toJSON(self.model));
                        }
                        else {
                            
							alertify.error(window.panelconfig.messages.panel_reader_save_failed + ': ' + result.errorMessage);
                        }
                        unblockUI();
                    }
                });
            }
        }
    });

})();