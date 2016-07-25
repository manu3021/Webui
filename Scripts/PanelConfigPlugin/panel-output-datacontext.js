(function () {
    var PanelOutputModel = window.panelconfig.PanelOutputModel;

    window.panelconfig.PanelOutputViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll(this, 'loadOutput', 'saveOutput', 'addOutput', 'energizeOutput', 'deenergizeOutput', 'pulseOutput', 'timedpulseOutput');
            this.outputId = options.outputId;
            this.panelId = options.panelId;
            this.accountId = options.accountId;
            this.validationContext.reset();
            this.initializeBinding();
        },
        initializeBinding: function () {
            var self = this;
            this.outputs = [];
            this.inputs = [];
            this.interlockPoints = ko.observableArray([]);
            this.interlockaction = ko.observableArray([]);
            this.schedules = ko.observableArray([]);
            this.model = new PanelOutputModel();
            this.loadOutput(function (result) {
                self.panelId = result.ParentId;
                self.accountId = result.AccountId;
                self.getAllSchedules(function () {
                    self.getAllInputs(function () {
                        self.getAllOutputs(function () {
                            self.setInterlockPoints(result.Interlock ? result.Interlock.ReactingEntityType : null, self.outputId);
                            self.model.dataSource(result);
                        });
                    });
                });
            });
            this.on(window.panelconfig.events.panel_output_remove, this.removeOutput);
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
                    self.outputs = result || [];
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
        loadOutput: function (cb) {
            if (this.outputId) {
                var self = this;
                this.postDataRequest('/GetPanelOutput', { id: this.outputId }, function (err, result) {
                    if (!err && result && cb) {
                        cb(result);
                    }
                });
            }
        },
        saveOutput: function () {
            var self = this;
            if (this.validationContext.validate()) {
                blockUI();
                var postData = { output: self.model.toJson(), controllerId: this.panelId, accountId: this.accountId };
                this.postDataRequest('/SavePanelOutput', postData, function (err, result) {
                    if (!err && result) {
                        //result = self.resolveKeyValue(result);
                        if (result.Success) {
                            self.model.Id(result.data.Id);
                            self.model.Interlock.Id(result.data.Interlock.Id);
                            self.model.Interlock.Name(result.data.Interlock.Name);
                            if (result.data.Status.toLowerCase() != window.panelconfig.constants.online.toLowerCase())
                                self.publish(window.panelconfig.events.panel_output_saved_offline, self.model.Name())
                            else
                            self.publish(window.panelconfig.events.panel_output_saved, self.model.Name());
                        }
                        else {
							alertify.error(window.panelconfig.messages.panel_output_save_failed + ': ' + result.errorMessage);
                        }
                        unblockUI();
                    }
                });
            }
        },
        energizeOutput: function () {
            var self = this;
            if (this.validationContext.validate()) {
                var postData = { output: self.model.toJson(), controllerId: this.panelId, accountId: this.accountId };
                this.postDataRequest('/EnergizePanelOutput', postData, function (err, result) {
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
        deenergizeOutput: function () {
            var self = this;
            if (this.validationContext.validate()) {
                var postData = { output: self.model.toJson(), controllerId: this.panelId, accountId: this.accountId };
                this.postDataRequest('/DeenergizePanelOutput', postData, function (err, result) {
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
        pulseOutput: function () {
            var self = this;
            if (this.validationContext.validate()) {
                var postData = { output: self.model.toJson(), controllerId: this.panelId, accountId: this.accountId };
                this.postDataRequest('/PulsePanelOutput', postData, function (err, result) {
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

        timedpulseOutput: function () {
            var self = this;
            if (this.validationContext.validate()) {
                var postData = { output: self.model.toJson(), pulseTime: this.model.ActionPulseTime(), controllerId: this.panelId, accountId: this.accountId };
                this.postDataRequest('/TimedPulsePanelOutput', postData, function (err, result) {
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
        confirmAndRemoveOutput: function (output) {
            this.publish(window.panelconfig.events.show_panel_output_remove_confirm, output);
        },
        removeOutput: function (output) {
            var self = this;
            if (this.model && this.model.Id()) {
                this.postDataRequest('/DeletePanelOutput', { id: this.model.Id() }, function (err, result) {
                    if (!err && result) {
                        self.publish(window.panelconfig.events.panel_output_removed, result);
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
            var outputId = this.outputId;
            var interlockMode = reactingEntityType != null ? reactingEntityType : this.model.Interlock.ReactingEntityType();
            if (interlockMode == 0) {
                this.interlockPoints(this.inputs);
                this.interlockaction(window.panelconfig.interlockaction.input);
            }
            else if (interlockMode == 1) {
                this.interlockPoints(this.outputs);
                this.interlockPoints.remove(function(item) {
                    return item.Id == outputId;
                });
                this.interlockaction(window.panelconfig.interlockaction.output);
            }
            return true;
        }
    });
})();