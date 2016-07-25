(function () {
    var CredentialModel = window.credential.CredentialModel;
    var CredentialHolderModel = window.credential.CredentialHolderModel;

    window.credential.CredentialViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.credentialId = options.credentialId;
            this.credentialHolderId = options.credentialHolderId;
            this.accountId = options.accountId;
            this.validationContext.reset();
            this.initializeBinding();
        },
        initializeBinding: function () {
            var self = this;
            this.model = new CredentialModel();
            this.statuses = ko.observableArray([]);
            this.credentialTypes = ko.observableArray([]);
            this.ErrorMessage = ko.observable("");
            this.IsError = ko.observable(false);
            this.getAllCredentialStatus(function () {
                self.getAllCredentialTypes(function () {
                    self.getCredential();
                });
            });
        },
        getCredential: function () {
            if (this.credentialId) {
                var self = this;
                this.postDataRequest('/GetCredential', { credentialId: this.credentialId }, function (err, result) {
                    if (!err && result) {
                        self.model.dataSource(result);
                    }
                });
            }
        },
        getAllCredentialStatus: function (cb) {
            this.setListValue('/GetAllCredentialStatus', { id: this.credentialId ? this.credentialId : '' }, this.statuses, cb);
        },
        getAllCredentialTypes: function (cb) {
            this.setListValue('/GetAllCredentialTypes', null, this.credentialTypes, cb);
        },
        setListValue: function (api, data, observable, cb) {
            var self = this;
            this.postDataRequest(api, data, function (err, result) {
                if (!err && result) {
                    observable.removeAll();
                    observable(result);
                    if (cb) { cb(); }
                }
            });
        },
        saveCredential: function () {
            var self = this;
            if (this.validationContext.validate()) {
                var postData = { credential: self.model.toJson(), accountId: self.accountId };
                this.postDataRequest('/SaveCredential', postData, function (err, result) {
                    if (!err && result) {
                        if (result.success) {
                            self.model.Id(result.data.Id);
                            self.associateCredential(function (err, res) {
                                self.publish(window.credential.events.credential_saved, {
                                    fromView: self.fromView,
                                    data: result,
                                    associated: res.IsSuccess,
                                    credentialHolderId: self.credentialHolderId
                                });
                            });
                        } else {
                            self.IsError(true);
                            self.ErrorMessage(result.errorMessage);
                        }
                    }
                });
            }
        },
        associateCredential: function (cb) {
            if (this.credentialHolderId) {
                var self = this;
                var postData = { credentialHolderId: this.credentialHolderId, credentialIds: [this.model.Id()], accountId: this.accountId };
                this.postDataRequest('/AssociateCredentialsToCredentialHolder', postData, function (err, result) {
                    if (!err && result) {
                        result = self.resolveKeyValue(result);
                        if (!result.IsSuccess) {
                            self.IsError(true);
                            self.ErrorMessage(result.errorMessage);
                        }
                    }
                    if (cb) { cb(err, result || {}); }
                });
            }
            else if (cb) {
                cb(null, { IsSuccess: true });
            }
        },
        canceCredential: function () {
            this.validationContext.reset();
            this.publish(window.credential.events.cancel_manage_credential);
        },
        updateCreateMode: function () {
            var self = this;
            self.model.CreateMode($('#credential_CreateMode option:selected').val());
        },
        updateControls: function () {
            var self = this;//guid comparison needs to be removed
            if (self.model.CredentialType() == 'D75096F1-7055-4669-8E16-844E17946448'.toLowerCase()) {
                self.model.IsLimitedUseCount(false);
                self.model.MaxUseCount("");
                self.model.Pin("");
                self.model.IsVIP(true);
            }
            else
                self.model.IsVIP(false);
        }
    });

    window.credential.CredentialHolderViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll(this, 'addCard', 'editCard', 'dissociateCard', 'deleteCard', 'showOptions', 'closeOptions',
                'manageDissociate', 'manageDelete', 'saveCredentialHolder', 'getAllUnassignedCredentials', 'cancelCredentialHolder', 'selectedCredential');
            this.credentialHolderId = options.credentialHolderId;
            this.accountId = options.accountId;
            this.selectedCredentials = ko.observable(0);
            this.credentialStatuses = [];
            this.initializeBinding(options);
        },
        initializeBinding: function (options) {
            this.model = new CredentialHolderModel();
            this.UnassignedCredentials = ko.observableArray([]);
            this.ErrorMessage = ko.observable("");
            this.IsError = ko.observable(false);
            this.fileView = options.fileView;
            if (!options.isDefaultBind) {
                this.hasNewCredential = false;
                this.getCredentialHolder();
                this.getAllUnassignedCredentials();
                this.on(window.credential.events.credential_holder_associate, this.manageAssociate);
                this.on(window.credential.events.credential_delete_confirmed, this.onDeleteConfirm);
                this.on(window.credential.events.credential_dissociate_confirmed, this.onDissociateConfirm);
            }
        },
        getCredentialHolder: function () {
            if (this.credentialHolderId) {
                var self = this;
                this.postDataRequest('/GetCredentialHolder', { credentialHolderId: this.credentialHolderId }, function (err, result) {
                    if (!err && result) {
                        self.model.dataSource(result);
                        if (self.model.Credentials) {
                            ko.utils.arrayForEach(self.model.Credentials(), function (credential) {
                                credential.credentialCredentialHolderRelation = window.credential.credentialCredentialHolderRelationEnum.Associated;
                                credential.IsSelected(true);
                            });
                        }
                    }
                });
            }
        },
        saveCredentialHolder: function () {
            var self = this;
            if (this.validationContext.validate()) {
                this.fileView.fileUpload(self.model.AssociatedBlobs()[0], function () {
                    var postData = { credentialHolder: self.model.toJson(), accountId: self.accountId };
                    self.postDataRequest('/SaveCredentialHolder', postData, function (err, result) {
                        if (!err && result) {
                            if (result.success) {
                                saveStatus = true;
                                self.model.Id(result.data.Id);
                                self.associateCredentials(self.model.Credentials(), function (err, resultAssociate) {
                                    if (resultAssociate.IsSuccess) {
                                        self.dissociateCredentials(self.model.Credentials(), function (err, resultDissociate) {
                                            if (resultDissociate.IsSuccess) {
                                                self.deleteCredentials(self.model.Credentials(), function (err, resultDelete) {
                                                    if (resultDelete.IsSuccess) {
                                                        self.publish(window.credential.events.credential_holder_saved, {
                                                            fromView: self.fromView,
                                                            data: !!(resultDelete.IsSuccess)
                                                        });;
                                                    }
                                                    else {
                                                        self.publish(window.credential.events.credential_holder_saved, {
                                                            fromView: self.fromView,
                                                            data: !!(resultDelete.IsSuccess)
                                                        });;
                                                    }
                                                });
                                            }
                                            else {
                                                self.publish(window.credential.events.credential_holder_saved, {
                                                    fromView: self.fromView,
                                                    data: !!(resultDissociate.IsSuccess)
                                                });;
                                            }
                                        });
                                    }
                                    else {
                                        self.publish(window.credential.events.credential_holder_saved, {
                                            fromView: self.fromView,
                                            data: !!(resultAssociate.IsSuccess)
                                        });;
                                    }
                                });
                            }
                            else {
                                self.IsError(true);
                                self.ErrorMessage(result.errorMessage);
                            }
                        }
                    });
                });
            }
        },
        getAllUnassignedCredentials: function () {
            if (this.accountId) {
                var self = this;
                this.postDataRequest('/GetAllCredentialStatus', { id: '111-111' }, function (err, result) { //TODO:Passing some string to get all statuses including Lost/stolen
                    if (!err && result) {
                        self.credentialStatuses = result.map(function (credentialStatus) {
                            return { credentialStatusId: credentialStatus.ID, credentialStatusName: credentialStatus.Name };
                        });
                        self.postDataRequest('/GetUnassignedCredentials', { accountId: self.accountId }, function (err, result) {
                            if (!err && result) {
                                self.UnassignedCredentials.removeAll();
                                self.UnassignedCredentials.push.apply(self.UnassignedCredentials, result.map(function (data) {
                                    if ('CredentialStatusId' in data) {
                                        self.credentialStatuses = self.credentialStatuses || [];
                                        var status = ko.utils.arrayFirst(self.credentialStatuses, function (cs) {
                                            return cs.credentialStatusId == data.CredentialStatusId;
                                        });
                                        data.CredentialStatusName = status ? status.credentialStatusName : '';
                                    }
                                    return new CredentialModel(data);
                                }));
                            }
                        });

                    }
                });
            }
        },
        openUnassignedCredentials: function () {
        },
        closeUnassignedCredentials: function () {
            var self = this;
            this.publish(window.credential.events.cancel_manage_unassigned_credentials);
            var credentials = ko.utils.arrayFilter(self.UnassignedCredentials(), function (item) {
                return item.IsSelected() == true;
            });
            ko.utils.arrayForEach(credentials, function (credential) {
                if (credential.credentialCredentialHolderRelation &&
                    credential.credentialCredentialHolderRelation == window.credential.credentialCredentialHolderRelationEnum.TobeDissociated) {
                    credential.credentialCredentialHolderRelation = window.credential.credentialCredentialHolderRelationEnum.Associated;
                }
                else {
                    credential.credentialCredentialHolderRelation = window.credential.credentialCredentialHolderRelationEnum.TobeAssociated;
                }
                credential.IsSelected(true);
                if (self.model.Credentials.indexOf(credential) == -1) {
                    self.model.Credentials.push(credential);
                }
            });
            self.UnassignedCredentials.remove(function (item) {
                return item.IsSelected() == true;
            });
            this.selectedCredentials(0);
        },
        cancelCredentialHolder: function () {
            this.validationContext.reset();
            this.publish(window.credential.events.cancel_manage_credential_holder, {
                fromView: this.fromView,
                hasNewCredential: this.hasNewCredential
            });
        },
        associateCredentials: function (credentials, cb) {
            var self = this;
            var associateCredentials = credentials.filter(function (credential) {
                return !!(credential.credentialCredentialHolderRelation &&
                          credential.credentialCredentialHolderRelation == window.credential.credentialCredentialHolderRelationEnum.TobeAssociated
                    );
            });
            var credentialIds = associateCredentials.map(function (credential) {
                return credential.Id();
            });
            if (credentialIds.length > 0) {
                var postData = { credentialHolderId: this.model.Id(), credentialIds: credentialIds, accountId: this.accountId };
                this.postDataRequest('/AssociateCredentialsToCredentialHolder', postData, function (err, result) {
                    if (!err && result) {
                        result = self.resolveKeyValue(result);
                        if (!result.IsSuccess) {
                            self.IsError(true);
                            self.ErrorMessage(result.errorMessage);
                        }
                    }
                    if (cb) { cb(err, result || {}); }
                });
            }
            else if (cb) {
                cb(null, { IsSuccess: true });
            }
        },
        manageAssociate: function (data, isAssociate) {
            if (data) {
                var oldCredential = ko.utils.arrayFirst(this.model.Credentials(), function (item) {
                    return !!(item.Id() && data.Id && item.Id().toLowerCase() == data.Id.toLowerCase());
                });
                var isAlreadyAssociated = false;
                if (oldCredential) {
                    this.model.Credentials.remove(oldCredential);
                    isAlreadyAssociated = (oldCredential.credentialCredentialHolderRelation == window.credential.credentialCredentialHolderRelationEnum.Associated);
                }
                if (isAssociate) {
                    var credential = new CredentialModel(data);
                    credential.credentialCredentialHolderRelation = isAlreadyAssociated ? window.credential.credentialCredentialHolderRelationEnum.Associated : window.credential.credentialCredentialHolderRelationEnum.TobeAssociated;
                    credential.IsSelected(true);
                    this.model.Credentials.push(credential);
                    this.model.isEdited(true);
                    this.hasNewCredential = true;
                }
            }
        },
        addCard: function () {
            this.publish(window.credential.events.show_manage_credential, {
                fromView: this.viewName,
                accountId: this.accountId
            });
        },
        editCard: function (credential) {
            this.publish(window.credential.events.show_manage_credential, { Id: credential.Id(), accountId: this.accountId });
        },
        manageDissociate: function (data, event) {
            if (data && data.Id) {

                var self = this;
                var match = ko.utils.arrayFirst(this.model.Credentials(), function (item) {
                    return item.Id().toLowerCase() == data.Id().toLowerCase();
                });
                if (match) {
                    if (match.credentialCredentialHolderRelation &&
                        match.credentialCredentialHolderRelation == window.credential.credentialCredentialHolderRelationEnum.Associated) {
                        match.credentialCredentialHolderRelation = window.credential.credentialCredentialHolderRelationEnum.TobeDissociated;
                    }
                    else {
                        match.credentialCredentialHolderRelation = window.credential.credentialCredentialHolderRelationEnum.None;
                    }
                    match.IsSelected(false);
                    if (this.UnassignedCredentials.indexOf(match) == -1) {
                        if ('CredentialStatusId' in match) {
                            var status = ko.utils.arrayFirst(self.credentialStatuses, function (cs) {
                                return cs.credentialStatusId == match.CredentialStatusId;
                            });
                            match.CredentialStatusName = status ? status.credentialStatusName : '';
                        }
                        this.UnassignedCredentials.push(match);
                        this.model.isEdited(true);
                    }
                }
            }
        },
        dissociateCredentials: function (credentials, cb) {
            var self = this;
            var dissociateCredentials = credentials.filter(function (credential) {
                return !!(credential.credentialCredentialHolderRelation &&
                          credential.credentialCredentialHolderRelation == window.credential.credentialCredentialHolderRelationEnum.TobeDissociated
                    );
            });
            var credentialIds = dissociateCredentials.map(function (credential) {
                return credential.Id();
            });
            if (credentialIds.length > 0) {
                var postData = { credentialHolderId: this.model.Id(), credentialIds: credentialIds, accountId: this.accountId };
                this.postDataRequest('/DissociateCredentialsFromCredentialHolder', postData, function (err, result) {
                    if (!err && result) {
                        result = self.resolveKeyValue(result);
                        if (!result.IsSuccess) {
                            self.IsError(true);
                            self.ErrorMessage(result.errorMessage);
                        }
                    }
                    if (cb) { cb(err, result || {}); }
                });
            }
            else if (cb) {
                cb(null, { IsSuccess: true });
            }
        },
        manageDelete: function (data, event) {
            if (data && data.Id) {
                var match = ko.utils.arrayFirst(this.model.Credentials(), function (item) {
                    return item.Id().toLowerCase() == data.Id().toLowerCase();
                });
                if (match) {
                    if (match.credentialCredentialHolderRelation &&
                        (match.credentialCredentialHolderRelation == window.credential.credentialCredentialHolderRelationEnum.Associated ||
                         match.credentialCredentialHolderRelation == window.credential.credentialCredentialHolderRelationEnum.TobeAssociated)) {
                        match.credentialCredentialHolderRelation = window.credential.credentialCredentialHolderRelationEnum.TobeDeleted;
                    }
                    else {
                        match.credentialCredentialHolderRelation = window.credential.credentialCredentialHolderRelationEnum.None;
                    }
                    match.IsSelected(false);
                    this.model.isEdited(true);
                }
            }
        },
        deleteCredentials: function (credentials, cb) {
            var self = this;
            var deleteCredentials = credentials.filter(function (credential) {
                return !!(credential.credentialCredentialHolderRelation &&
                          credential.credentialCredentialHolderRelation == window.credential.credentialCredentialHolderRelationEnum.TobeDeleted
                    );
            });
            var total = deleteCredentials.length;
            if (total > 0) {
                var callCount = 0;
                var delCount = 0;
                for (var c in deleteCredentials) {
                    this.postDataRequest('/DeleteCredential', { credentialId: deleteCredentials[c].Id() }, function (err, result) {
                        ++callCount;
                        if (!err && result && result.success) {
                            self.model.Credentials.remove(ko.utils.arrayFirst(self.model.Credentials(), function (credential) {
                                return credential.Id() == result.data;
                            }));
                            ++delCount;
                        }
                        if (callCount == total) {
                            if (callCount == delCount) {
                                if (cb) { cb(null, { IsSuccess: true }); }
                            }
                            else if (cb) {
                                cb(null, { IsSuccess: false });
                            }
                        }
                    });
                }
            }
            else {
                if (cb) {
                    cb(null, { IsSuccess: true });
                }
            }
        },
        onDissociateConfirm: function (data) {
            var self = this;
            var postData = { credentialHolderId: this.credentialHolderId, credentialIds: [data.Id], accountId: this.accountId };
            this.postDataRequest('/DissociateCredentialsFromCredentialHolder', postData, function (err, result) {
                if (!err && result) {
                    result = self.resolveKeyValue(result);
                    if (result.IsSuccess) {
                        self.model.Credentials.remove(ko.utils.arrayFirst(self.model.Credentials(), function (credential) {
                            return credential.Id == data.Id;
                        }));
                    }
                }
                self.publish(window.credential.events.credential_dissociated, !!(result && result.IsSuccess));
            });
        },
        onDeleteConfirm: function (data) {
            var self = this;
            this.postDataRequest('/DeleteCredential', { credentialId: data.Id }, function (err, result) {
                if (!err && result && result.success) {
                    self.model.Credentials.remove(ko.utils.arrayFirst(self.model.Credentials(), function (credential) {
                        return credential.Id() == result.data;
                    }));
                    self.publish(window.credential.events.credential_deleted, { total: 1, delCount: 1 });
                } else {
                    self.publish(window.credential.events.credential_deleted, { total: 1, delCount: 0 });
                }

            });
        },
        showOptions: function (data, event) {
            this.publish(window.credential.events.show_manage_credential_options, event.target);
        },
        closeOptions: function (data, event) {
            this.publish(window.credential.events.hide_manage_credential_options, event.target);
        },
        selectedCredential: function (data, event) {
            if ($(event.target).is(':checked')) {
                this.selectedCredentials(this.selectedCredentials() + 1);
            }
            else {
                this.selectedCredentials(this.selectedCredentials() - 1);
            }
            if (this.selectedCredentials() >= 1) {
                this.model.isEdited(true);
            }
            else
                this.model.isEdited(false);
            return true;
        },
        canLoadPhoto: function (file, extension) {
            if (file) {
                if (['PNG', 'JPEG', 'JPG', 'GIF', 'BMP'].indexOf(extension.toUpperCase()) == -1) {
                    this.publish(window.credential.events.credential_file_upload_failed, 1);
                    return false;
                }
                else if (file.size > 5242880) {
                    this.publish(window.credential.events.credential_file_upload_failed, 2);
                    return false;
                }
                return true;
            }
            return false;
        },
        getPhoto: function () {

            if (this.model.AssociatedBlobs().length > 0) {
                var selectedBlob = this.model.AssociatedBlobs()[0];
                if (selectedBlob.ImageData && selectedBlob.Type) {
                    return 'data:' + selectedBlob.Type.toLowerCase() + ';base64,' + selectedBlob.ImageData;
                }
                else if (selectedBlob.Id) {
                    return this.baseUrl + '/GetCredentialHolderPhoto?blobId=' + selectedBlob.Id +"&bThumb=false" + '&_=' + Math.random();
                }
            }
            return '';
        },
        photoLoaded: function (image, imageType, content) {

            if (this.model.AssociatedBlobs().length == 0) {
                this.model.AssociatedBlobs.push({});
            }
            var selectedBlob = this.model.AssociatedBlobs()[0];
            selectedBlob.File = image;
            selectedBlob.ImageData = content;
            this.model.isPhotoLoaded(true);
            selectedBlob.Type = imageType.toUpperCase();
            this.model.AssociatedBlobs.valueHasMutated();
        },
        filterUnassignedCredentials: function (data, event) {
            var tmpVAL = $('#unassignedSearchText').val().toLowerCase();
            $('.unassigned-credentials-item').each(function () {
                var tmpHTML = $(this).html().toLowerCase();
                if (tmpHTML.indexOf(tmpVAL) >= 0) {
                    $(this).fadeIn(250);
                } else if (tmpVAL.length < 1) {
                    $(this).fadeIn(250);
                } else {
                    $(this).fadeOut(250);
                }
            });
        }
    });

    window.credential.FileViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll(this, 'fileUpload');
        },
        fileUpload: function (blob, cb) {
            if (blob && blob.File) {
                var self = this;
                var formData = new FormData();
                formData.append('photofile', blob.File);
                formData.append('BlobId', blob.Id);
                formData.append('TypeName', 'Photo');
                this.postFileRequest('/FileUpload', formData, function (err, result) {
                    if (!err && result && result.Success) {
                        var response = self.resolveKeyValue(result.data.Result);
                        blob.Id = response.Id;
                        cb();
                    }
                    else {
                        self.publish(window.credential.events.credential_file_upload_failed, 0);
                    }
                });
            }
            else {
                cb();
            }
        }
    });

    window.credential.CredentialHolderListViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll(this, 'createCredentialHolder', 'editCredentialHolder', 'addCredential', 'addCredentialForHolder',
                'deleteCredentialHolder', 'onDeleteConfirm', 'selectAllChanged', 'showUnassignedCredentials', 'editCredentials');
            this.accountId = options.accountId;
            this.initializeBinding(options);
        },
        initializeBinding: function (options) {
            this.startIndex = ko.observable(null);
            this.maxRecordCount = ko.observable(null);
            this.credentialHolders = ko.observableArray([]);
            this.unassignedCredentialsCount = ko.observable(0);
            this.selectAll = ko.observable(false);
            if (!options.isDefaultBind) {
                this.refreshList();
                this.on(window.credential.events.credential_holder_list_refresh, this.refreshList);
                this.on(window.credential.events.credential_holder_delete_confirmed, this.onDeleteConfirm);
                this.on(window.credential.events.credential_count_refresh, this.getUnassignedCredentialsCount);
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
        getUnassignedCredentialsCount: function (cb) {
            var self = this;
            if (this.accountId) {
                this.postDataRequest('/GetUnassignedCredentialsCount', { accountId: this.accountId }, function (err, result) {
                    if (!err) {
                        self.unassignedCredentialsCount(result);
                    }
                    if (cb) { cb() }
                });
            }
        },
        refreshList: function () {
            var self = this;
            this.getUnassignedCredentialsCount(function () {
                self.getAllCredentialHolders();
            });
        },
        createCredentialHolder: function () {
            this.publish(window.credential.events.show_manage_credential_holder, {
                fromView: this.viewName,
                accountId: this.accountId
            });
        },
        editCredentialHolder: function (record) {
            this.publish(window.credential.events.show_manage_credential_holder, {
                fromView: this.viewName,
                credentialHolderId: record.Id(),
                accountId: this.accountId
            });
        },
        deleteCredentialHolder: function (record) {
            var hasCredentials = record.Credentials().length > 0;
            this.publish(window.credential.events.credential_holder_confirm_delete, {
                deleteMode: hasCredentials ? 1 : 0,
                credentialHolderId: record.Id()
            });
        },
        onDeleteConfirm: function (data) {
            var self = this;
            var credentialHolder = ko.utils.arrayFirst(self.credentialHolders(), function (credentialHolder) {
                return credentialHolder.Id() == data.credentialHolderId;
            });
            this.deleteCredential(data.deleteMode, credentialHolder.Credentials, function (res) {
                
                if (res) {
                    self.postDataRequest('/DeleteCredentialHolder', { credentialHolderId: credentialHolder.Id() }, function (err, result) {
                        if (!err && result) {
                            if (result.IsSuccess) {
                                self.credentialHolders.remove(ko.utils.arrayFirst(self.credentialHolders(), function (ch) {
                                    return ch.Id() == credentialHolder.Id();
                                }));
                                self.getUnassignedCredentialsCount();
                            }
                            self.publish(window.credential.events.credential_holder_deleted, result);
                        }
                    });
                }
                else {
                    self.publish(window.credential.events.credential_holder_deleted, res);
                }
            });
        },
        deleteCredential: function (deleteMode, credentials, cb) {
            if (deleteMode == 1) {
                var self = this;
                var total = credentials().length;
                var callCount = 0;
                var delCount = 0;
                for (var c in credentials()) {
                    this.postDataRequest('/DeleteCredential', { credentialId: credentials()[c].Id() }, function (err, result) {
                        ++callCount;
                        if (!err && result && result.success) {
                            credentials.remove(ko.utils.arrayFirst(credentials, function (credential) {
                                return credential.Id() == result.data;
                            }));
                            ++delCount;
                        }
                        if (callCount == total && cb) {
                            cb(total == delCount);
                        }
                    });
                }
            }
            else {
                cb(true);
            }
        },
        addCredential: function () {
            this.publish(window.credential.events.show_manage_credential, {
                fromView: this.viewName,
                accountId: this.accountId
            });
        },
        editCredentials: function (record) {
            this.publish(window.credential.events.show_assigned_credentials, {
                fromView: this.viewName,
                accountId: this.accountId,
                credentialHolderId: record.Id(),
                credentials: record.Credentials(),
                firstName: record.Name1(),
                lastName: record.Name3()
            });
        },
        addCredentialForHolder: function (record) {
            this.publish(window.credential.events.show_manage_credential, {
                fromView: this.viewName,
                accountId: this.accountId,
                credentialHolderId: record.Id()
            });
        },
        getPhoto: function (record) {
            if (record.AssociatedBlobs().length > 0 && record.AssociatedBlobs()[0].Id) {
                return this.baseUrl + '/GetCredentialHolderPhoto?blobId=' + record.AssociatedBlobs()[0].Id +"&bThumb=true"+ '&_=' + Math.random();
            }
            return '';
        },
        selectAllChanged: function () {
            var isSelect = this.selectAll();
            ko.utils.arrayForEach(this.credentialHolders(), function (credentialHolder) {
                credentialHolder.IsSelected(isSelect);
            });
            return true;
        },
        showUnassignedCredentials: function () {
            this.publish(window.credential.events.show_unassigned_credentials, {
                fromView: this.viewName,
                accountId: this.accountId
            });
        },
        getCredentialsText: function (credentialHolder) {
            return credentialHolder.Credentials()[0].CredentialNumber().toString() +
                (credentialHolder.Credentials().length > 1 ? (' + ' +
                (credentialHolder.Credentials().length - 1).toString()) : '');
        }
    });

    window.credential.UnAssignedCredentialListViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll(this, 'addCredential', 'editCredential', 'deleteCredential', 'closeCredentialsModal', 'selectAllChanged');
            this.accountId = options.accountId;
            this.initializeBinding(options);
        },
        initializeBinding: function (options) {
            this.credentials = ko.observableArray();
            this.selectAll = ko.observable(false);
            if (!options.isDefaultBind) {
                this.isDirty = false;
                this.getUnassignedCredentials();
                this.on(window.credential.events.credential_delete_confirmed, this.onDeleteConfirm);
                this.on(window.credential.events.credential_list_refresh, this.refreshList);
            }
        },
        getUnassignedCredentials: function () {
            var self = this;
            this.postDataRequest('/GetUnassignedCredentials', { accountId: this.accountId }, function (err, result) {
                if (!err && result) {
                    self.credentials.removeAll();
                    self.credentials.push.apply(self.credentials, result.map(function (data) {
                        return new CredentialModel(data);
                    }));
                }
            });
        },
        refreshList: function () {
            this.isDirty = true;
            this.getUnassignedCredentials();
        },
        addCredential: function () {
            this.publish(window.credential.events.show_manage_credential, {
                fromView: this.viewName,
                accountId: this.accountId
            });
        },
        editCredential: function (credential) {
            this.publish(window.credential.events.show_manage_credential, {
                fromView: this.viewName,
                Id: credential.Id(),
                accountId: this.accountId
            });
        },
        deleteCredential: function (record) {
            var toBeDeleted = this.credentials().filter(function (credential) {
                return credential.IsSelected() == true;
            });
            this.publish(window.credential.events.credential_confirm_delete, toBeDeleted);
        },
        onDeleteConfirm: function (credentials) {
            var self = this;
            var total = credentials.length;
            var callCount = 0;
            var delCount = 0;
            for (var c in credentials) {
                this.postDataRequest('/DeleteCredential', { credentialId: credentials[c].Id() }, function (err, result) {
                    ++callCount;
                    if (!err && result && result.success) {
                        self.credentials.remove(ko.utils.arrayFirst(self.credentials(), function (credential) {
                            return credential.Id() == result.data;
                        }));
                        ++delCount;
                    }
                    if (callCount == total) {
                        self.isDirty = true;
                        self.publish(window.credential.events.credential_deleted, { total: total, delCount: delCount });
                        if (self.credentials().length == 0) {
                            self.closeCredentialsModal();
                        }
                    }
                });
            }
        },
        closeCredentialsModal: function () {
            this.publish(window.credential.events.hide_unassigned_credentials, {
                fromView: this.fromView,
                data: { isDirty: this.isDirty }
            });
        },
        selectAllChanged: function () {
            var isSelect = this.selectAll();
            ko.utils.arrayForEach(this.credentials(), function (credential) {
                credential.IsSelected(isSelect);
            });
            return true;
        }
    });

    window.credential.AssignedCredentialListViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll(this, 'editCredential', 'deleteCredential', 'dissociateCredential', 'closeCredentialsModal', 'selectAllChanged');
            this.accountId = options.accountId;
            this.credentialHolderId = options.credentialHolderId;
            this.firstName = options.firstName || '';
            this.lastName = options.lastName || '';
            this.initializeBinding(options);
        },
        initializeBinding: function (options) {
            var credentials = options.credentials || [];
            this.credentials = ko.observableArray();
            this.credentials.push.apply(this.credentials, credentials);
            this.selectAll = ko.observable(false);
            if (!options.isDefaultBind) {
                this.isDirty = false;
                this.on(window.credential.events.credential_delete_confirmed, this.onDeleteConfirm);
                this.on(window.credential.events.credential_dissociate_confirmed, this.onDissociateConfirm);
                this.on(window.credential.events.credential_list_refresh, this.refreshList);
            }
        },
        refreshList: function (data) {
            this.isDirty = true;
            var credential = ko.utils.arrayFirst(this.credentials(), function (credential) {
                return credential.Id() == data.Id;
            });
            if (credential) {
                credential.dataSource(data);
            }
            else {
                this.credentials.push(new CredentialModel(data));
            }
        },
        editCredential: function (credential) {
            this.publish(window.credential.events.show_manage_credential, {
                fromView: this.viewName,
                Id: credential.Id(),
                accountId: this.accountId
            });
        },
        dissociateCredential: function (credential) {
            var toBeDissociated = this.credentials().filter(function (credential) {
                return credential.IsSelected() == true;
            });
            this.publish(window.credential.events.credential_confirm_dissociate, toBeDissociated);
        },
        onDissociateConfirm: function (credentials) {
            var self = this;
            var credentialIds = ko.utils.arrayMap(credentials, function (credential) {
                return credential.Id();
            });
            var postData = { credentialHolderId: this.credentialHolderId, credentialIds: credentialIds, accountId: this.accountId };
            this.postDataRequest('/DissociateCredentialsFromCredentialHolder', postData, function (err, result) {
                if (!err && result) {
                    result = self.resolveKeyValue(result);
                    if (result.IsSuccess) {
                        self.isDirty = true;
                        for (var c in credentialIds) {
                            self.credentials.remove(ko.utils.arrayFirst(self.credentials(), function (credential) {
                                return credential.Id() == credentialIds[c];
                            }));
                        }
                    }
                }
                self.publish(window.credential.events.credential_dissociated, !!(result && result.IsSuccess));
                if (self.credentials().length == 0) {
                    self.closeCredentialsModal();
                }
            });
        },
        deleteCredential: function (record) {
            var toBeDeleted = this.credentials().filter(function (credential) {
                return credential.IsSelected() == true;
            });
            this.publish(window.credential.events.credential_confirm_delete, toBeDeleted);
        },
        onDeleteConfirm: function (credentials) {
            var self = this;
            var total = credentials.length;
            var callCount = 0;
            var delCount = 0;
            for (var c in credentials) {
                this.postDataRequest('/DeleteCredential', { credentialId: credentials[c].Id() }, function (err, result) {
                    ++callCount;
                    if (!err && result && result.success) {
                        self.credentials.remove(ko.utils.arrayFirst(self.credentials(), function (credential) {
                            return credential.Id() == result.data;
                        }));
                        ++delCount;
                    }
                    if (callCount == total) {
                        self.isDirty = true;
                        self.publish(window.credential.events.credential_deleted, { total: total, delCount: delCount });
                        if (self.credentials().length == 0) {
                            self.closeCredentialsModal();
                        }
                    }
                });
            }
        },
        closeCredentialsModal: function () {
            this.publish(window.credential.events.hide_assigned_credentials, {
                fromView: this.fromView,
                data: { isDirty: this.isDirty }
            });
        },
        selectAllChanged: function () {
            var isSelect = this.selectAll();
            ko.utils.arrayForEach(this.credentials(), function (credential) {
                credential.IsSelected(isSelect);
            });
            return true;
        }
    });

    window.credential.DeleteCredentialConfirmViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.credentialHolderId = options.credentialHolderId;
        },
        deleteCredentialHolder: function () {
            this.publish(window.credential.events.hide_delete_credential_holder_cofirm, {
                credentialHolderId: this.credentialHolderId,
                deleteMode: 2
            });
        },
        deleteAll: function () {
            this.publish(window.credential.events.hide_delete_credential_holder_cofirm, {
                credentialHolderId: this.credentialHolderId,
                deleteMode: 1
            });
        },
        cancelConfirmation: function () {
            this.publish(window.credential.events.hide_delete_credential_holder_cofirm, {
                credentialHolderId: this.credentialHolderId,
                deleteMode: 0
            });
        }
    });
})();