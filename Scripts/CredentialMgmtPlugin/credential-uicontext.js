(function () {

    var antiForgeryToken = $('#antiForgeryToken').val();
    var credentialMgmturl = $('#credentialmgmturl').val();
    var fileMgmtUrl = $('#fileMgmturl').val();

    var CredentialHolderListView = uibase.BaseView.inherits({
        initializeView: function (options) {
            this.subscribe(window.credential.events.treeview_item_selected, this.onTreeNodeSelected, true);
        },
        onTreeNodeSelected: function (event, node) {
            if (node.nodedata.EntityType.toLowerCase() == window.credential.constants.credentialHoldersEntity.toLowerCase()) {
                this.show(new window.credential.CredentialHolderListViewModel({
                    baseUrl: this.baseUrl,
                    antiForgeryToken: this.antiForgeryToken,
                    viewName: this.viewName,
                    accountId: node.nodedata.accountId
                }));
            }
            else {
                this.close();
            }
        },
        beforeShow: function () {
            $("[data-accounttype]").addClass("settingsform");
            $("[data-accounttype]").removeClass('settingsform_active');
            $("[data-accounttype='" + window.credential.constants.credentialHoldersEntity.toUpperCase() + "']").addClass("settingsform_active");
        },
        subscribeEvents: function () {
            this.subscribe(window.credential.events.credential_holder_saved, this.onCredentialHolderSaved);
            this.subscribe(window.credential.events.credential_holder_confirm_delete, this.confirmCredentialHolderDelete);
            this.subscribe(window.credential.events.credential_holder_deleted, this.onCredentialHolderDeleted);
            this.subscribe(window.credential.events.hide_unassigned_credentials, this.onUnassignedCredentialChanged);
            this.subscribe(window.credential.events.hide_assigned_credentials, this.onAssignedCredentialChanged);
            this.subscribe(window.credential.events.hide_delete_credential_holder_cofirm, this.onCredentialHolderDeleteConfirm);
            this.subscribe(window.credential.events.credential_saved, this.onCredentialSaved);
            this.subscribe(window.credential.events.cancel_manage_credential_holder, this.onCredentialHolderCancel);
        },
        onCredentialHolderSaved: function (eventName, result) {
            if (this.viewModel && result.data && result.fromView == this.viewName) {
                this.viewModel.trigger(window.credential.events.credential_holder_list_refresh);
            }
        },
        confirmCredentialHolderDelete: function (eventName, data) {
            if (data.deleteMode) {
                this.publish(window.credential.events.show_delete_credential_holder_cofirm, data);
            }
            else {
                var self = this;
                alertify.confirm(window.credential.messages.credential_holder_delete_confirm, function (val) {
                    if (val && self.viewModel) {
                        self.viewModel.trigger(window.credential.events.credential_holder_delete_confirmed, data);
                    }
                });
            }
        },
        onCredentialHolderDeleted: function (eventName, result) {
            if (!!(result && result.IsSuccess)) {
                alertify.success(window.credential.messages.credential_holder_delete_success);
            }
            else {
                if (result.errorMessage == undefined)
                    alertify.error(window.credential.messages.credential_holder_delete_fail);
                else
                    alertify.error(window.credential.messages.authorization_failed);
            }
        },
        onUnassignedCredentialChanged: function (eventName, result) {
            if (this.viewModel && result.data && result.data.isDirty) {
                this.viewModel.trigger(window.credential.events.credential_count_refresh);
            }
        },
        onAssignedCredentialChanged: function (eventName, result) {
            if (this.viewModel && result.data && result.data.isDirty && result.fromView == this.viewName) {
                this.viewModel.trigger(window.credential.events.credential_holder_list_refresh);
            }
        },
        onCredentialSaved: function (eventName, result) {
            if (this.viewModel && result.data && result.data.success && result.fromView == this.viewName) {
                if (result.credentialHolderId && result.associated) {
                    this.viewModel.trigger(window.credential.events.credential_holder_list_refresh);
                }
                else {
                    this.viewModel.trigger(window.credential.events.credential_count_refresh);
                }
            }
        },
        onCredentialHolderCancel: function (eventName, result) {
            if (this.viewModel && result.hasNewCredential && result.fromView == this.viewName) {
                this.viewModel.trigger(window.credential.events.credential_holder_list_refresh);
            }
        },
        onCredentialHolderDeleteConfirm: function (eventName, result) {
            if (this.viewModel && (result.deleteMode == 1 || result.deleteMode == 2)) {
                this.viewModel.trigger(window.credential.events.credential_holder_delete_confirmed, result);
            }
        }
    });

    var CredentialView = uibase.BaseView.inherits({
        initializeView: function (options) {
            this.subscribe(window.credential.events.show_manage_credential, this.onShowViewEventReceived, true);
        },
        onShowViewEventReceived: function (eventName, data) {
            var viewName = this.viewName;
            this.show(new window.credential.CredentialViewModel({
                viewName: viewName,
                baseUrl: this.baseUrl,
                antiForgeryToken: this.antiForgeryToken,
                validationContext: new uibase.BaseValidationContext(viewName, window.credential.CredentialValidations),
                credentialId: data.Id,
                credentialHolderId: data.credentialHolderId,
                accountId: data.accountId,
                fromView: data.fromView
            }), true);
        },
        subscribeEvents: function () {
            this.subscribe(window.credential.events.credential_saved, this.onCredentialSaved);
            this.subscribe(window.credential.events.cancel_manage_credential, this.onCloseViewEventReceived);
        },
        onCredentialSaved: function (eventName, result) {
            if (result.data && result.data.success) {
                alertify.success(window.credential.messages.credential_save_success);
                this.close();
            }
            else {
                alertify.error(window.credential.messages.credential_save_failed);
            }
        },
        onCloseViewEventReceived: function () {
            this.close();
        }
    });

    var CredentialHolderView = uibase.BaseView.inherits({
        initializeView: function (options) {
            this.subscribe(window.credential.events.show_manage_credential_holder, this.showViewEventReceived, true);
        },
        showViewEventReceived: function (eventName, data) {
            var viewName = this.viewName;
            this.show(new window.credential.CredentialHolderViewModel({
                viewName: viewName,
                baseUrl: this.baseUrl,
                antiForgeryToken: this.antiForgeryToken,
                validationContext: new uibase.BaseValidationContext(viewName, window.credential.CredentialHolderValidations),
                credentialHolderId: data.credentialHolderId,
                accountId: data.accountId,
                fromView: data.fromView,
                fileView: new window.credential.FileViewModel({
                    viewName: viewName,
                    baseUrl: fileMgmtUrl,
                    antiForgeryToken: this.antiForgeryToken
                })
            }), true);
        },
        subscribeEvents: function () {
            this.subscribe(window.credential.events.credential_holder_saved, this.onCredentialHolderSaved);
            this.subscribe(window.credential.events.credential_file_upload_failed, this.onFileUploadFailed);
            this.subscribe(window.credential.events.credential_saved, this.onCredentialSavedForAssociate);
            this.subscribe(window.credential.events.credential_deleted, this.onAssignedCredentialDeleted);
            this.subscribe(window.credential.events.credential_dissociated, this.onAssignedCredentialDissociated);
            this.subscribe(window.credential.events.show_manage_credential_options, this.showCredentialOptions);
            this.subscribe(window.credential.events.hide_manage_credential_options, this.hideCredentialOptions);
            this.subscribe(window.credential.events.hide_credential, this.hideCredential);
            this.subscribe(window.credential.events.cancel_manage_unassigned_credentials, this.hideManageUnassignedCredentials);
            this.subscribe(window.credential.events.cancel_manage_credential_holder, this.onCloseViewEventReceived);
        },
        onCredentialHolderSaved: function (eventName, result) {
            if (result.data) {
                alertify.success(window.credential.messages.credential_holder_save_success);
                this.close();
            }
            else {
                alertify.error(window.credential.messages.credential_holder_save_failed);
            }
        },
        onFileUploadFailed: function (eventName, result) {
            switch (result) {
                case 1:
                    alertify.error(window.credential.messages.file_extension_mismatch);
                    break;
                case 2:
                    alertify.error(window.credential.messages.file_size_exceeds);
                    break;
                default:
                    alertify.error(window.credential.messages.error_on_server);
                    break;
            }
        },
        onCredentialSavedForAssociate: function (eventName, result) {
            if (this.viewModel && result.data && result.data.success) {
                this.viewModel.trigger(window.credential.events.credential_holder_associate, result.data.data, true);
            }
        },
        onAssignedCredentialDeleted: function (eventName, result) {
            if (result && result.total && result.total == result.delCount) {
                alertify.success(window.credential.messages.credential_delete_success);
            }
            else {
                alertify.error(window.credential.messages.credential_delete_fail);
            }
        },
        onAssignedCredentialDissociated: function (eventName, result) {
            if (result) {
                alertify.success(window.credential.messages.credential_dissociate_success);
            }
            else {
                alertify.error(window.credential.messages.credential_dissociate_fail);
            }
        },
        confirmCredentialCredentialHolderDissociate: function (eventName, data) {
            if (data) {
                var self = this;
                alertify.confirm(window.credential.messages.credential_dissociate_confirm, function (val) {
                    if (val && self.viewModel) {
                        self.viewModel.trigger(window.credential.events.credential_dissociate_confirmed, data);
                    }
                });
            }
            else {
                alertify.error(window.credential.messages.credential_dissociate_norecord);
            }
        },
        confirmCredentialDelete: function (eventName, data) {
            if (data) {
                var self = this;
                alertify.confirm(window.credential.messages.credential_delete_confirm, function (val) {
                    if (val && self.viewModel) {
                        self.viewModel.trigger(window.credential.events.credential_delete_confirmed, data);
                    }
                });
            }
            else {
                alertify.error(window.credential.messages.credential_delete_norecord);
            }
        },
        showCredentialOptions: function (eventName, result) {
            if (result) {
                $(result).find("span").children("a").show();
            }
        },
        hideCredentialOptions: function (eventName, result) {
            if (result) {
                $(result).find("span").children("a").hide();
            }
        },
        hideCredential: function (eventName, result) {
            if (result) {
                $(result).parent().parent().hide(500);
            }
        },
        hideManageUnassignedCredentials: function () {
            if ($('.popover').is(':visible')) {
                $(".popOverClass").popover("hide");
                $("#popoverid_click").popover('toggle');
            }
        },
        onCloseViewEventReceived: function () {
            this.close();
        }
    });

    var UnAssignedCredentialListView = uibase.BaseView.inherits({
        initializeView: function (options) {
            this.subscribe(window.credential.events.show_unassigned_credentials, this.onShowEventReceived, true);
        },
        onShowEventReceived: function (eventName, data) {
            this.show(new window.credential.UnAssignedCredentialListViewModel({
                viewName: this.viewName,
                baseUrl: this.baseUrl,
                antiForgeryToken: this.antiForgeryToken,
                accountId: data.accountId,
                fromView: data.fromView
            }), true);
        },
        subscribeEvents: function () {
            this.subscribe(window.credential.events.credential_confirm_delete, this.confirmUnassignedCredentialDelete);
            this.subscribe(window.credential.events.credential_deleted, this.onUnassignedCredentialDeleted);
            this.subscribe(window.credential.events.credential_saved, this.onUnassignedCredentialSaved);
            this.subscribe(window.credential.events.hide_unassigned_credentials, this.onCloseViewEventReceived);
        },
        confirmUnassignedCredentialDelete: function (eventName, data) {
            if (data && data.length > 0) {
                var self = this;
                alertify.confirm(window.credential.messages.credential_delete_confirm, function (val) {
                    if (val && self.viewModel) {
                        self.viewModel.trigger(window.credential.events.credential_delete_confirmed, data);
                    }
                });
            }
            else {
                alertify.error(window.credential.messages.credential_delete_norecord);
            }
        },
        onUnassignedCredentialDeleted: function (eventName, result) {
            if (result && result.total && result.total == result.delCount) {
                alertify.success(window.credential.messages.credential_delete_success);
            }
            else {
                alertify.error(window.credential.messages.credential_delete_fail);
            }
        },
        onUnassignedCredentialSaved: function (eventName, result) {
            if (this.viewModel && result.data && result.data.success && result.fromView == this.viewName) {
                this.viewModel.trigger(window.credential.events.credential_list_refresh, result.data.data);
            }
        },
        onCloseViewEventReceived: function () {
            this.close();
        }
    });

    var AssignedCredentialListView = uibase.BaseView.inherits({
        initializeView: function () {
            this.subscribe(window.credential.events.show_assigned_credentials, this.onShowListEventReceived, true);
        },
        onShowListEventReceived: function (eventName, data) {
            this.show(new window.credential.AssignedCredentialListViewModel({
                viewName: this.viewName,
                baseUrl: this.baseUrl,
                antiForgeryToken: this.antiForgeryToken,
                accountId: data.accountId,
                credentialHolderId: data.credentialHolderId,
                credentials: data.credentials,
                firstName: data.firstName,
                lastName: data.lastName,
                fromView: data.fromView
            }), true);
        },
        subscribeEvents: function () {
            this.subscribe(window.credential.events.credential_confirm_delete, this.confirmAssignedCredentialDelete);
            this.subscribe(window.credential.events.credential_deleted, this.onAssignedCredentialDeleted);
            this.subscribe(window.credential.events.credential_saved, this.onAssignedCredentialSaved);
            this.subscribe(window.credential.events.credential_confirm_dissociate, this.confirmAssignedCredentialDissociate);
            this.subscribe(window.credential.events.credential_dissociated, this.onAssignedCredentialDissociated);
            this.subscribe(window.credential.events.hide_assigned_credentials, this.onCloseViewEventReceived);
        },
        confirmAssignedCredentialDelete: function (eventName, data) {
            if (data && data.length > 0) {
                var self = this;
                alertify.confirm(window.credential.messages.credential_delete_confirm, function (val) {
                    if (val && self.viewModel) {
                        self.viewModel.trigger(window.credential.events.credential_delete_confirmed, data);
                    }
                });
            }
            else {
                alertify.error(window.credential.messages.credential_delete_norecord);
            }
        },
        onAssignedCredentialDeleted: function (eventName, result) {
            if (result && result.total && result.total == result.delCount) {
                alertify.success(window.credential.messages.credential_delete_success);
            }
            else {
                alertify.error(window.credential.messages.credential_delete_fail);
            }
        },
        confirmAssignedCredentialDissociate: function (eventName, data) {
            if (data && data.length > 0) {
                var self = this;
                alertify.confirm(window.credential.messages.credential_dissociate_confirm, function (val) {
                    if (val && self.viewModel) {
                        self.viewModel.trigger(window.credential.events.credential_dissociate_confirmed, data);
                    }
                });
            }
            else {
                alertify.error(window.credential.messages.credential_dissociate_norecord);
            }
        },
        onAssignedCredentialDissociated: function (eventName, result) {
            if (result) {
                alertify.success(window.credential.messages.credential_dissociate_success);
            }
            else {
                alertify.error(window.credential.messages.credential_dissociate_fail);
            }
        },
        onAssignedCredentialSaved: function (eventName, result) {
            if (this.viewModel && result.data && result.data.success && result.fromView == this.viewName) {
                this.viewModel.trigger(window.credential.events.credential_list_refresh, result.data.data);
            }
        },
        onCloseViewEventReceived: function () {
            this.close();
        }
    });

    var DeleteCredentialHolderConfirmView = uibase.BaseView.inherits({
        initializeView: function (options) {
            this.subscribe(window.credential.events.show_delete_credential_holder_cofirm, this.onShowViewEventReceived, true);
        },
        onShowViewEventReceived: function (eventName, data) {
            this.show(new window.credential.DeleteCredentialConfirmViewModel({
                credentialHolderId: data.credentialHolderId
            }), true);
        },
        subscribeEvents: function () {
            this.subscribe(window.credential.events.hide_delete_credential_holder_cofirm, this.onCloseViewEventReceived);
        },
        onCloseViewEventReceived: function () {
            this.close();
        }
    });

    window.credential.views = {
        credentialHolderListView: new CredentialHolderListView({
            baseUrl: credentialMgmturl,
            antiForgeryToken: antiForgeryToken,
            viewName: 'credential_holder_list_form'
        }),
        credentialView: new CredentialView({
            baseUrl: credentialMgmturl,
            antiForgeryToken: antiForgeryToken,
            viewName: 'manage_credential_form',
            modalId: 'manageCredential'
        }),
        credentialHolderView: new CredentialHolderView({
            baseUrl: credentialMgmturl,
            antiForgeryToken: antiForgeryToken,
            viewName: 'manage_credential_holder_form',
            modalId: 'manageCredentialHolder'
        }),
        unAssignedCredentialListView: new UnAssignedCredentialListView({
            baseUrl: credentialMgmturl,
            antiForgeryToken: antiForgeryToken,
            viewName: 'unassigned_credential_list_form',
            modalId: 'unassignedCredentialList'
        }),
        assignedCredentialListView: new AssignedCredentialListView({
            baseUrl: credentialMgmturl,
            antiForgeryToken: antiForgeryToken,
            viewName: 'assigned_credential_list_form',
            modalId: 'assignedCredentialList'
        }),
        deleteCredentialHolderConfirmView: new DeleteCredentialHolderConfirmView({
            baseUrl: credentialMgmturl,
            antiForgeryToken: antiForgeryToken,
            viewName: 'deleteCredentialHolderConfirmContent',
            modalId: 'deleteCredentialHolderConfirm'
        })
    };

})();