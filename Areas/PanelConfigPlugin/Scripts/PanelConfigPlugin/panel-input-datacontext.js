(function () {
    var PanelInputModel = window.panelconfig.PanelInputModel;

    window.panelconfig.PanelInputViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll(this, 'loadInput', 'IsNormallyOpenChanged', 'saveInput', 'addInput', 'shuntInput', 'unshuntInput');
            this.inputId = options.inputId;
            this.panelId = options.panelId;
            this.accountId = options.accountId;
            this.initializeBinding();
        },
        initializeBinding: function () {
            var self = this;
            this.inputs = [];
            this.outputs = [];
            this.autoRelockOutputs = ko.observableArray([]);
            this.interlockPoints = ko.observableArray([]);
            this.interlockaction = ko.observableArray([]);
            this.schedules = ko.observableArray([]);
            this.model = new PanelInputModel();
            this.loadInput(function (result) {
                self.panelId = result.ParentId;
                self.accountId = result.AccountId;
                self.getAllSchedules(function () {
                    self.getAllOutputs(function () {
                        self.getAllInputs(function () {
                            self.setInterlockPoints(result.Interlock ? result.Interlock.ReactingEntityType : null, self.inputId);
                            self.model.dataSource(result);
                        });
                    });
                });
            });
            this.on(window.panelconfig.events.panel_input_remove, this.removeInput);
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
        getAllInputs: function (cb) {
            var self = this;
            this.postDataRequest('/GetAllInputs', { id: this.panelId }, function (err, result) {
                if (!err && result) {
                    self.inputs = result || [];
                    if (cb) { cb(); }
                }
            });
        },
        getAllOutputs: function (cb) {
            var self = this;
            this.postDataRequest('/GetAllOutputs', { id: this.panelId }, function (err, result) {
                if (!err && result) {
                    self.outputs = result || [];
                    self.autoRelockOutputs.removeAll();
                    self.autoRelockOutputs.push.apply(self.autoRelockOutputs, result.filter(function (data) {
                        return [1, 3, 7, 9, 11, 13].indexOf(data.Address) != -1;
                    }));
                    if (cb) { cb(); }
                }
            });
        },
        loadInput: function (cb) {
            this.validationContext.reset();
            if (this.inputId) {
                var self = this;
                this.postDataRequest('/GetPanelInput', { id: this.inputId }, function (err, result) {
                    if (!err && result && cb) {
                        cb(result);
                    }
                });
            }
        },
        addInput: function () {
            this.setInterlockPoints();
            this.model.dataSource(null);
        },
        IsNormallyOpenChanged: function(){
            if (this.model.IsNormallyOpen() == 1) {
                this.model.IsNormallyOpen(0);
            }
            else {
                this.model.IsNormallyOpen(1);
            }
        },
        saveInput: function () {
            var self = this;
           
            if (this.validationContext.validate()) {
                if (this.model.IsNormallyOpen() == 1) {
                    this.model.IsNormallyOpen(true);
                }
                else {
                    this.model.IsNormallyOpen(false);
                }
                blockUI();
                var postData = { input: self.model.toJson(), controllerId: this.panelId, accountId: this.accountId };
                this.postDataRequest('/SavePanelInput', postData, function (err, result) {
                    if (!err && result) {
                        //result = self.resolveKeyValue(result);
                        if (result.Success) {
                            self.model.Id(result.data.Id);
                            self.model.Interlock.Id(result.data.Interlock.Id);
                            self.model.Interlock.Name(result.data.Interlock.Name);
                            if (result.data.Status.toLowerCase() != window.panelconfig.constants.online.toLowerCase())
                                self.publish(window.panelconfig.events.panel_input_saved_offline, self.model.Name())
                            else
                            self.publish(window.panelconfig.events.panel_input_saved, self.model.Name());
                        }
						else {
                            alertify.error(window.panelconfig.messages.panel_input_save_failed + ': ' + result.errorMessage);
                        }
                        unblockUI();
                    }
                });
            }
        },
        shuntInput: function () {
            var self = this;
            if (this.validationContext.validate()) {
                var postData = { input: self.model.toJson(), controllerId: this.panelId, accountId: this.accountId };
                this.postDataRequest('/ShuntPanelInput', postData, function (err, result) {
                    if (!err && result) {
                        result = self.resolveKeyValue(result);
                        if (result.IsSuccess) {
                      //      self.model.Id(result.Id);
                            self.publish(window.panelconfig.events.panel_input_saved, result);
                        }
                    }
                });
            }
        },
        unshuntInput: function () {
            var self = this;
            if (this.validationContext.validate()) {
                var postData = { input: self.model.toJson(), controllerId: this.panelId, accountId: this.accountId };
                this.postDataRequest('/UnShuntPanelInput', postData, function (err, result) {
                    if (!err && result) {
                        result = self.resolveKeyValue(result);
                        if (result.IsSuccess) {
                            //      self.model.Id(result.Id);
                            self.publish(window.panelconfig.events.panel_input_saved, result);
                        }
                    }
                });
            }
        },
        confirmAndRemoveInput: function (input) {
            this.publish(window.panelconfig.events.show_panel_input_remove_confirm, input);
        },
        removeInput: function (input) {
            var self = this;
            if (this.model && this.model.Id()) {
                this.postDataRequest('/DeletePanelInput', { id: this.model.Id() }, function (err, result) {
                    if (!err && result) {
                        self.publish(window.panelconfig.events.panel_input_removed, result);
                    }
                });
            }
        },
        isRemoveVisible: function () {
            return this.model && this.model.Id();
        },
        handleInterlockModeSwitch: function () {
            this.setInterlockPoints(this.model.Interlock.ReactingEntityType(), this.model.Id());
            return true;
        },
        setInterlockPoints: function (reactingEntityType, id) {
            var self = this;
            var inputId = this.inputId;
            var interlockMode = reactingEntityType != null ? reactingEntityType : this.model.Interlock.ReactingEntityType();
            if (interlockMode == 0) {
                this.interlockPoints(this.inputs);
                this.interlockPoints.remove(function (item) {
                    return item.Id == inputId;
                });
                this.interlockaction(window.panelconfig.interlockaction.input);
            }
            else if (interlockMode == 1) {
                this.interlockPoints(this.outputs);
                this.interlockaction(window.panelconfig.interlockaction.output);
            }
            return true;
        }
    });
})();