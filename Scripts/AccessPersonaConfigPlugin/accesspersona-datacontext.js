(function () {

    var CredentialHolderModel = window.accesspersona.CredentialHolderModel;
    var ScheduleModel = window.accesspersona.ScheduleModel;
    var AccessPersonaModel = window.accesspersona.AccessPersonaModel;
    var TreeNodeModel = window.accesspersona.TreeNodeModel;

    window.accesspersona.CredentialHolderListViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll(this, 'holderSelected');
            this.accountId = options.accountId;
            this.initializeBinding(options);
        },
        initializeBinding: function (options) {
            this.startIndex = ko.observable(null);
            this.maxRecordCount = ko.observable(null);
            this.credentialHolders = ko.observableArray([]);
            this.showList = ko.observable(true);
            if (!options.isDefaultBind) {
                this.getAllCredentialHolders();
               // this.on(window.accesspersona.events.credential_holders_flow_change, this.handleFlowChange);
            }
        },
        getAllCredentialHolders: function () {
            var self = this;
            if (this.accountId) {
                this.postDataRequest('/GetAllCredentialHolders', {
                    accountId: this.accountId, startIndex: this.startIndex(), maxRecordCount: this.maxRecordCount()
                },
                    function (err, result) {
                        if (!err && result) {
                            self.credentialHolders.removeAll();
                            self.credentialHolders.push.apply(self.credentialHolders, result.map(function (data) {
                                return new CredentialHolderModel(data);
                            }));
                        }
                    });
            }
        },
        getPhoto: function (record) {
            if (record.AssociatedBlobs().length > 0 && record.AssociatedBlobs()[0].Id) {
                return this.baseUrl + '/GetCredentialHolderPhoto?blobId=' + record.AssociatedBlobs()[0].Id +"&bThumb=true";
            }
            return '';
        },
        holderSelected: function (record) {
         
            if (this.showList()) {
                var self = this;
                var data;
                record.IsSelected(!record.IsSelected());
                this.publish(window.accesspersona.events.accesspersona_credential_holder_selected, record);
            }
        },
        handleFlowChange: function (data) {
            this.showList(data == 0);
        }
    });

    window.accesspersona.AccessPersonaNavPaneViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {

        },
        finishAccessMap: function () {
            this.publish(window.accesspersona.events.hide_access_persona_view);
        }
    });

    window.accesspersona.TreeViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll(this, 'toggleExpand', 'handleSelection');
            this.options = options;
            this.initializeBinding(options);
        },
        initializeBinding: function (options) {
            this.rootNode = new TreeNodeModel();
            if (options.rootNodeData) {
                this.rootNode.bindChildNodes([options.rootNodeData]);
            }
            if (options.depth == 1) {
                this.expandChildren(this.rootNode);
            }
        },
        toggleExpand: function (record) {
            var isExpanded = record.IsExpanded();
            if (isExpanded) {
                record.IsExpanded(false);
            }
            else {
                this.expandNode(record, isExpanded);
            }
        },
        expandNode: function (record, isExpanded, isUpdate) {
            var self = this;
            if (!isExpanded && this.isExpandable(record)) {
                if (record.Children().length == 0 || isUpdate) {
                    this.postDataRequest('/GetChildEntities', {
                        id: record.Entity.EntityInfo.Id(),
                        nodeType: record.Entity.EntityType() ? record.Entity.EntityType().toUpperCase() : null,
                        parentId: record.Entity.EntityInfo.ParentId() || null,
                        accessPersonaId: this.accessPersonaId ? this.accessPersonaId : ''
                    }, function (err, val) {
                        record.bindChildNodes(val, isUpdate);
                        if (val && val.length > 0) {
                            record.IsExpanded(true);
                        }
                        self.setRootNodeVarious(record);
                    });
                }
                else {
                    record.IsExpanded(true);
                }
            }
        },
        expandChildren: function (record) {
            if (record.Children()) {
                for (var i in record.Children()) {
                    this.expandNode(record.Children()[i], false);
                }
            }
        },
        isExpandable: function (node) {
            var nodeType = node.Entity.EntityType();
            if (nodeType) {
                return !this.options.expandableNodeTypes || this.options.expandableNodeTypes.indexOf(nodeType.toUpperCase()) != -1;
            }
            return false;
        },
        handleHover: function (record) {
            if (!record.IsSelected()) {
                record.IsHover(true);
            }
            record.StatusClass('Hover');
        },
        handleHoverOut: function (record) {
            record.IsHover(false);
            record.StatusClass('');
        },
        handleSelection: function (record) {
            this.selectNode(record, !record.IsSelected());
        },
        selectNode: function (node, isSelected) {
            if (node) {
                node.IsHover(false);
                if (isSelected) {
                    this.parent.selectedSchedule(null);
                }
                node.selectNode(isSelected);
            }
        },
        setAccessPersona: function (accessPersonaId, noRefresh) {
            if (this.accessPersonaId != accessPersonaId) {
                this.accessPersonaId = accessPersonaId;
                if (!noRefresh) {
                    if (accessPersonaId) {
                        this.refresh();
                    }
                    else {
                        this.setScheduleInfo(null, true)
                    }
                }
                this.selectNode(this.rootNode, false);
            }
        },
        setScheduleInfo: function (data, isReset, node) {
            node = node || this.rootNode;
            if (node.Entity.EntityInfo.Id() && (isReset || node.IsSelected())) {
                node.Entity.ScheduleInfo.Id(data ? data.Id() : null);
                node.Entity.ScheduleInfo.Name(data ? data.Name() : null);
                node.Entity.IsVarious(false);
                node.IsDirty(!isReset);
                this.setVarious(data, node);
            }
            for (var i in node.Children()) {
                this.setScheduleInfo(data, isReset, node.Children()[i]);
            }
        },
        setVarious: function (data, node) {
            if (node.ParentNode && node.ParentNode.Children) {
                var match = ko.utils.arrayFirst(node.ParentNode.Children(), function (item) {
                    if ((data && data.Id() ? data.Id().toLowerCase() : null) != (item.Entity.ScheduleInfo && item.Entity.ScheduleInfo.Id() ? item.Entity.ScheduleInfo.Id().toLowerCase() : null)) {
                        return true;
                    }
                });
                if (match) {
                    var parentNode = node.ParentNode;
                    while (parentNode) {
                        parentNode.Entity.ScheduleInfo.Name(window.accesspersona.messages.accesspersona_door_schedule_various);
                        parentNode.Entity.IsVarious(true);
                        parentNode = parentNode.ParentNode;
                    }
                }
                else {
                    var parentNode = node.ParentNode;
                    parentNode.Entity.IsVarious(false);
                    while (parentNode) {
                        var various = false;
                        for (var i in parentNode.Children()) {
                            if (parentNode.Children()[i].Entity) {
                                if (parentNode.Children()[i].Entity.IsVarious()) {
                                    various = true;
                                }
                                else if (parentNode.Children()[0].Entity.ScheduleInfo && !parentNode.Children()[i].Entity.ScheduleInfo) {
                                    various = true;
                                }
                                else if (!parentNode.Children()[0].Entity.ScheduleInfo && parentNode.Children()[i].Entity.ScheduleInfo) {
                                    various = true;
                                }
                                else if (parentNode.Children()[0].Entity.ScheduleInfo.Id() != parentNode.Children()[i].Entity.ScheduleInfo.Id()) {
                                    various = true;
                                }
                            }
                        }
                        if (!various) {
                            if (!(parentNode === this.rootNode)) {
                                parentNode.Entity.IsVarious(false);
                                parentNode.Entity.ScheduleInfo.Id(data ? data.Id() : null);
                                parentNode.Entity.ScheduleInfo.Name(data ? data.Name() : null);
                            }
                        }
                        parentNode = parentNode.ParentNode;
                    }
                }
            }
        },
        setRootNodeVarious: function(node){
            if (!node.ParentNode.Entity.EntityInfo.Id() && node.Children().length > 0) {
                var firstChild = node.Children()[0];
                var distinct = ko.utils.arrayGetDistinctValues(node.Children().map(function (item) {
                    return item.Entity.ScheduleInfo.Id();
                }));
                if (distinct.length == 1) {
                    node.Entity.ScheduleInfo.Name(node.Children()[0].Entity.ScheduleInfo.Name());
                    node.Entity.ScheduleInfo.Id(node.Children()[0].Entity.ScheduleInfo.Id());
                    node.Entity.IsVarious(false);
                }
                else if (distinct.length > 1) {
                    node.Entity.ScheduleInfo.Name(window.accesspersona.messages.accesspersona_door_schedule_various);
                    node.Entity.IsVarious(true);
                }
            }
        },
        refresh: function (node) {
            node = node || this.rootNode;
            for (var i in node.Children()) {
                if (node.Children()[i].IsExpanded() || node.Children()[i].Children().length > 0) {
                    this.expandNode(node.Children()[i], false, true);
                    this.refresh(node.Children()[i]);
                }
            }
        },
        toJson: function (isDirtyOnly, node, dataList) {
            dataList = dataList || [];
            if (node) {
                if (!isDirtyOnly || (node.IsDirty() /*&& !node.Entity.IsVarious()*/ &&
                    (!node.ParentNode.IsDirty() ||
                    node.Entity.ScheduleInfo.Id() != node.ParentNode.Entity.ScheduleInfo.Id()))) {
                    dataList.push(node.toJson());
                }
            }
            else {
                node = this.rootNode;
            }
            for (var i in node.Children()) {
                this.toJson(isDirtyOnly, node.Children()[i], dataList);
            }
            return dataList;
        }
    });

    window.accesspersona.AccessPersonaViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll(this, 'showHideActivationExpiration', 'scheduleChanged', 'loadAccessPersona',
                'deleteAccessPersona', 'onDeleteConfirm', 'associateCredentialHolders', 'dissociateCredentialHolders',
                'deleteAccessPersonaFromSystem', 'save', 'onNext', 'onBack', 'dissociateAccessPersona');
            this.accountId = options.accountId;
            this.initializeBinding(options);
        },
        initializeBinding: function (options) {
            this.treeview = options.treeview;
            this.accessPersonaModel = new AccessPersonaModel();
            this.accessPersonas = ko.observableArray([]);
            this.selectedAccessPersonas = [];
            this.selectedAccessPersonaId = ko.observable();
            this.schedules = ko.observableArray([]);
            this.selectedSchedule = ko.observable('');
            this.selectedCredentialHolders = ko.observableArray([]);
            this.showDoorSchedules = ko.observable(true);
            this.showActivationExpiration = ko.observable(false);
            this.IsError = ko.observable(false);
            this.ErrorMessage = ko.observable("");
            this.ActivationDateTime = ko.observable();
            this.ExpiryDateTime = ko.observable();
            this.FlowMode = ko.observable(0);
            this.DateFormat = { isoDate: 'YYYY-MM-DD HH:mm:ssZ' };
            if (!options.isDefaultBind) {
                this.getAllAccessPersonas();
                this.refreshSchedulesList();
                if (this.treeview) {
                    this.treeview.parent = this;
                }
                this.on(window.accesspersona.events.credential_holder_selection_changed, this.handleCredentialHolderSelection); 
                this.on(window.accesspersona.events.accesspersona_delete_confirmed, this.onDeleteConfirm);
                this.on(window.accesspersona.events.accesspersona_dissociate_confirmed, this.onDissociateConfirm);
            }
        },
        getAllAccessPersonas: function (cb) {
            var self = this;
            if (this.accountId) {
                this.postDataRequest('/GetAllAccessPersonas', { accountId: this.accountId }, function (err, result) {
                    if (!err && result) {
                        self.accessPersonas.removeAll();
                        self.accessPersonas.push.apply(self.accessPersonas, result.map(function (data) {
                            return new AccessPersonaModel(data);
                        }));
                        if (cb) { cb(); }
                    }
                });
            }
        },
        handleCredentialHolderSelection: function (data) {
            var self = this;
            var accessPersonaId = data.AccessPersonaId();
            var credentialHolder = ko.utils.arrayFirst(this.selectedCredentialHolders(), function (item) {
                return item.Id() === data.Id();
            });
            if (credentialHolder) {
                credentialHolder.AccessPersonaId(null);
                this.selectedCredentialHolders.remove(credentialHolder);
            }
            if (data.IsSelected()) {
                this.selectedCredentialHolders.push(data);
                this.getAccessPersonasForCredentialHolder(data.Id(), function (err, result) {
                    if (!err) {
                        data.AccessPersonaId(result && result.length > 0 ? result[0].Id : null);
                        self.updateSelectedPersonas(result && result.length > 0 ? result[0].Id : null);
                    }
                });
            }
            else if (accessPersonaId) {
                var samePersonaHolder = ko.utils.arrayFirst(this.selectedCredentialHolders(), function (item) {
                    return item.AccessPersonaId() == accessPersonaId;
                });
                if (!samePersonaHolder) {
                    this.updateSelectedPersonas(accessPersonaId, true);
                }
            }
            this.setActivationExpiration();
        },
        setActivationExpiration: function (isReset) {
            if (this.selectedCredentialHolders().length > 0 && !isReset) {
                var activationDate = this.selectedCredentialHolders()[0].ActivationDateTime();
                var expiryDate = this.selectedCredentialHolders()[0].ExpiryDateTime();
                var match = ko.utils.arrayFirst(this.selectedCredentialHolders(), function (item) {
                    return activationDate != item.ActivationDateTime() || expiryDate != item.ExpiryDateTime();
                });
                this.ActivationDateTime(match ? null : activationDate);
                this.ExpiryDateTime(match ? null : expiryDate);
            }
            else {
                this.ActivationDateTime(null);
                this.ExpiryDateTime(null);
            }
        },
        getAccessPersonasForCredentialHolder: function (credentialHolderId, cb) {
            var self = this;
            var reqData = { credentialHolderId: credentialHolderId };
            this.postDataRequest('/GetAccessPersonasForCredentialHolder', reqData, function (err, result) {
                cb(err, result);
            });
        },
        updateSelectedPersonas: function (accessPersonaId, isRemove) {
            if (accessPersonaId) {
                var index = this.selectedAccessPersonas.indexOf(accessPersonaId);
                if (index > -1) {
                    this.selectedAccessPersonas.splice(index, 1);
                }
                if (!isRemove) {
                    this.selectedAccessPersonas.push(accessPersonaId);
                }
            }
            if (this.selectedAccessPersonas.length <= 1) {
                var selectedPersona = this.selectedAccessPersonas.length == 1 ? this.selectedAccessPersonas[0] : null;
                this.setAccessPersona(selectedPersona);
            }
        },
        loadAccessPersona: function (data, event) {            
            this.setAccessPersona(this.selectedAccessPersonaId());
        },
        setAccessPersona: function (accessPersonaId) {
            this.setFlowMode(1);
            this.selectedAccessPersonaId(accessPersonaId);
            var accessPersona = ko.utils.arrayFirst(this.accessPersonas(), function (data) {
                return data.Id() == accessPersonaId;
            });
            this.accessPersonaModel.dataSource(accessPersona && accessPersona.toJson());
            this.selectedSchedule(null);
            //if (this.selectedAccessPersonas.length == 1 && this.selectedAccessPersonas.indexOf(accessPersonaId) > -1) {
            //    this.setActivationExpiration(false);
            //}
            //else {
            //    this.setActivationExpiration(true);
            //}
            this.treeview.setAccessPersona(accessPersonaId, this.accessPersonaModel.IsSystemEntity());
        },
        getAllSchedules: function () {
            var self = this;
            if (this.accountId) {
                this.postDataRequest('/GetAllSchedules', { accountId: this.accountId }, function (err, result) {
                    if (!err && result) {
                        self.schedules.removeAll();
                        self.schedules.push.apply(self.schedules, result.map(function (data) {
                            return new ScheduleModel(data);
                        }));
                    }
                });
            }
        },
        refreshSchedulesList: function () {
            var self = this;
            self.getAllSchedules();
        },
        createNew: function () {           
                this.setFlowMode(1);
                this.setAccessPersona(null);
        },
        onNext: function () {           
            if (this.selectedCredentialHolders().length > 0 || !!this.selectedAccessPersonaId()) {
                this.setFlowMode(1);
                this.validationContext.reset();
            }
        },
        onBack: function () {
            this.setFlowMode(0);
        },
        setFlowMode: function (mode) {
            this.FlowMode(mode);
            this.publish(window.accesspersona.events.accesspersona_flow_mode_changed, mode);
        },
        scheduleChanged: function (data) {
            this.treeview.setScheduleInfo(data);
            return true;
        },
        save: function (data) {
            var self = this;
            if (this.validationContext.validate()) {
                if (!this.accessPersonaModel.IsSystemEntity()) {
                    this.accessPersonaModel.AccessPersonaEntities(this.treeview.toJson(true));
                }
                else {
                    this.accessPersonaModel.AccessPersonaEntities.removeAll();
                }
                var holderIds = this.selectedCredentialHolders().map(function (item) {
                    return item.Id();
                });
                var activation = this.selectedCredentialHolders().length > 0 ? (this.ActivationDateTime() ? this.ActivationDateTime() : null) : null;
                var expiration = this.selectedCredentialHolders().length > 0 ? (this.ExpiryDateTime() ? this.ExpiryDateTime() : null) : null;

                if (activation && !(typeof (activation) === 'string')) {
                    activation = moment(activation).format('YYYY-MM-DD HH:mm:ssZ')
                }
                if (expiration && !(typeof (expiration) === 'string')) {
                    expiration = moment(expiration).format('YYYY-MM-DD HH:mm:ssZ')
                }

                var postData = {
                    entity: this.accessPersonaModel.toJson(),
                    credentialHolderIds: holderIds,
                    activationDateTime: activation,
                    expiryDateTime: expiration,
                    accountId: this.accountId
                };
                this.postDataRequest('/SaveAccessPersona', postData, function (err, result) {
                    if (!err && result) {
                        if (result.Success) {
                            self.publish(window.accesspersona.events.access_persona_saved, {
                                data: !!(result.Success)
                            });
                            self.getAllAccessPersonas(function () {
                                self.setAccessPersona(result.data);
                            });
                            ko.utils.arrayForEach(self.selectedCredentialHolders(), function (credentialHolder) {
                                credentialHolder.AccessPersonaId(result.data);
                                credentialHolder.ActivationDateTime(activation);
                                credentialHolder.ExpiryDateTime(expiration);
                            });
                            if (holderIds && holderIds.length > 0) {
                                self.selectedAccessPersonas = [result.data];
                            }
                            self.setFlowMode(0);                      
                            self.IsError(false);
                            self.ErrorMessage("");
                        }
                        else {
                            self.IsError(true);
                            self.ErrorMessage(result.errorMessage);
                        }
                    }
                });
            }
        },
        deleteAccessPersona: function (event, data) {
            var self = this;
            this.postDataRequest('/GetCredentialHoldersForAccessPersona', {
                accessPersonaId: self.accessPersonaModel.Id()
            },
            function (err, result) {
                if (!err && result) {
                    var hasCredentialHolders = result.length > 0;
                    self.publish(window.accesspersona.events.accesspersona_confirm_delete, {
                        deleteMode: hasCredentialHolders ? 1 : 0,
                        accessPersonaId: self.accessPersonaModel.Id(),
                        credentialHolderIds: result,
                        accountId: self.accountId,
                        accessPersonas: ko.mapping.toJS(self.accessPersonas())
                    });
                }
            });
        },
        dissociateAccessPersona: function () {
            var self = this;
            if (this.selectedCredentialHolders().length > 0 && this.accessPersonaModel.Id()) {
                this.publish(window.accesspersona.events.accesspersona_confirm_dissociate, {
                    accessPersonaId: self.accessPersonaModel.Id(),
                    credentialHolderIds: self.selectedCredentialHolders().map(function (item) {
                        return item.Id();
                    })
                });
            }
        },
        onDissociateConfirm: function (data) {
            var self = this;
            if (data && data.accessPersonaId && data.credentialHolderIds) {
                this.dissociateCredentialHolders(data.accessPersonaId, data.credentialHolderIds, function (isSuccess) {
                    ko.utils.arrayForEach(self.selectedCredentialHolders(), function (credentialHolder) {
                        credentialHolder.AccessPersonaId(null);
                    });
                    var index = self.selectedAccessPersonas.indexOf(data.accessPersonaId);
                    if (index > -1) {
                        self.selectedAccessPersonas.splice(index, 1);
                    }
                    self.updateSelectedPersonas(null);
                    self.publish(window.accesspersona.events.accesspersona_dissociate_status, {
                        success: isSuccess    
                    });
                });
            }
        },
        onDeleteConfirm: function (data) {
            var self = this;
            var accessPersona = ko.utils.arrayFirst(self.accessPersonas(), function (accessPersona) {
                return accessPersona.Id() == data.accessPersonaId;
            });
            if (data.deleteMode == 0) {
                self.deleteAccessPersonaFromSystem(data.accessPersonaId);
            }
            else if (data.newAccessPersonaId() == undefined) {
                if (data.deleteMode == 2) {
                    this.dissociateCredentialHolders(data.accessPersonaId, data.credentialHolderIds, function (isSuccess) {
                        if (isSuccess) {
                            self.deleteAccessPersonaFromSystem(data.accessPersonaId);
                        }
                    });
                }
            }
            else {
                this.associateCredentialHolders(data.deleteMode, data.accessPersonaId, data.newAccessPersonaId, data.credentialHolderIds)
            }
        },
        dissociateCredentialHolders: function (accessPersonaId, credentialHolders, cb) {
            var self = this;
            var isSuccess = false;
            this.postDataRequest('/DissociateAccessPersonaFromCredentialHolders', { accessPersonaId: accessPersonaId, credentialHolderIds: credentialHolders, accountId: this.accountId }, function (err, result) {
                if (!err && result && result.Success) {
                    isSuccess = true;
                }
                if (cb) { cb(isSuccess) }
            });
        },
        associateCredentialHolders: function (deleteMode, accessPersonaId, newAccessPersonaId, credentialHolders, cb) {
            if (deleteMode == 2) {
                var self = this;
                var total = credentialHolders.length;
                var callCount = 0;
                var delCount = 0;
                this.postDataRequest('/ReAssociateAccessPersonaToCredentialHolders', { accessPersonaId: newAccessPersonaId(), credentialHolderIds: credentialHolders, accountId: this.accountId }, function (err, result) {
                    if (!err && result && result.Success) {
                        self.deleteAccessPersonaFromSystem(accessPersonaId);
                    }
                });
            }
            else {
                cb(true);
            }
        },
        deleteAccessPersonaFromSystem: function (accessPersonaId) {
            var self = this;
            self.postDataRequest('/DeleteAccessPersona', { accessPersonaId: accessPersonaId }, function (err, result) {
                if (!err && result) {
                    self.getAllAccessPersonas();
                    ko.utils.arrayForEach(self.selectedCredentialHolders(), function (credentialHolder) {
                        credentialHolder.IsSelected(false);
                        credentialHolder.AccessPersonaId(null);
                    });
                    self.selectedCredentialHolders.removeAll();
                    self.selectedAccessPersonas = [];
                }
                self.publish(window.accesspersona.events.accesspersona_deleted, !!(result && result.Success));
            });
        },
        formatDateTime: function (format, setDefaultMode, date) {
            if (!!!date || !moment(date).isValid())
                return null;

            var formattedDate = {};
            if (setDefaultMode == 0) {
                formattedDate = moment(date).hours(0).minutes(0).seconds(0);
            }
            else if (setDefaultMode == 1) {
                formattedDate = moment(date).hours(23).minutes(59).seconds(59);
            }
            if (formattedDate.isValid()) {
                if (format) {
                    return formattedDate.format(format);
                }
                else {
                    return new Date(formattedDate);
                }
            }
        }

    });

    window.accesspersona.DeleteAccessPersonaConfirmViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.accessPersonaId = options.accessPersonaId;
            this.credentialHolderIds = options.credentialHolderIds;
            this.accountId = options.accountId,
            this.initializeBinding(options);
            this.personas = options.accessPersonas;
            this.updateAccessPersonas();
        },
        initializeBinding: function (options) {
            this.newAccessPersonaId = ko.observable();
        },
        updateAccessPersonas: function () {
            var self = this;
            for (var i in self.personas) {
                if (self.personas[i].Id == this.accessPersonaId) {
                    self.personas.splice(i, 1);
                    break;
                }
            }
        },
        deleteAccessPersona: function () {
            this.publish(window.accesspersona.events.hide_delete_accesspersona_cofirm, {
                accessPersonaId: this.accessPersonaId,
                newAccessPersonaId: this.newAccessPersonaId,
                deleteMode: 2,
                credentialHolderIds: this.credentialHolderIds
            });
        },
        deleteAll: function () {
            this.publish(window.accesspersona.events.hide_delete_accesspersona_cofirm, {
                accessPersonaId: this.accessPersonaId,
                newAccessPersonaId: this.newAccessPersonaId,
                deleteMode: 1,
                credentialHolderIds: this.credentialHolderIds
            });
        },
        cancelConfirmation: function () {
            this.publish(window.accesspersona.events.hide_delete_accesspersona_cofirm, {
                accessPersonaId: this.accessPersonaId,
                newAccessPersonaId: this.newAccessPersonaId,
                deleteMode: 0,
                credentialHolderIds: this.credentialHolderIds
            });
        }
    });
})();