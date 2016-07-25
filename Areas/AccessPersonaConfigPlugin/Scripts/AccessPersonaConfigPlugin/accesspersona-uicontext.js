(function () {

    var antiForgeryToken = $('#antiForgeryToken').val();
    var accessPersonaMgmturl = $('#accessPersonaMgmturl').val();
    var configTabs = null;

    var AccessPersonaConfigView = uibase.BaseView.inherits({
        initializeView: function (options) {
            this.subscribe(window.accesspersona.events.accesspersona_giveaccess_clicked, this.onShowViewEventReceived, true);
            this.subscribe(window.accesspersona.events.hide_access_persona_view, this.onFinish, true);
        },
        onShowViewEventReceived: function (eventName, node) {
            var parentNodeData = null;
            if (node.parentNode) {
                parentNodeData = {
                    EntityInfo: node.parentNode.nodeobject,
                    EntityType: node.parentNode.nodeobject.EntityType
                }
            }
            if (node.nodeobject.EntityType.toLowerCase() == window.accesspersona.constants.credentialHoldersEntity.toLowerCase()) {
                this.show(new window.accesspersona.AccessPersonaViewModel({
                    viewName: this.viewName,
                    baseUrl: this.baseUrl,
                    antiForgeryToken: this.antiForgeryToken,
                    accountId: node.nodeobject.accountId,
                    validationContext: new uibase.BaseValidationContext(this.viewName, window.accesspersona.AccessPersonaValidations),
                    treeview: new window.accesspersona.TreeViewModel({
                        baseUrl: this.baseUrl,
                        antiForgeryToken: this.antiForgeryToken,
                        expandableNodeTypes: ['SITE', 'GROUP', 'CUSTOMER', 'DEALER'],
                        rootNodeData: parentNodeData,
                        depth: 1
                    })
                }));
            }
        },
        beforeShow: function () {
            this.prevEl = $(".settingsform_active[data-accounttype]");
            $("[data-accounttype]").removeClass("settingsform_active").addClass("settingsform");
            $("[data-accounttype='" + window.accesspersona.constants.accessPersonaEntity.toUpperCase() + "']").addClass("settingsform_active");
            configTabs = $('#configtab a').map(function () {
                if ($(this).attr("data-tabindex") >= 0)
                    return { id: $(this).attr('href'), index: $(this).attr('data-tabindex') };
            });
            $('#configtab a').each(function () {
                if ($(this).attr('href') == '#settings') {
                    $(this).tab('show');
                }
                else {
                    $(this).hide();
                    $(this).attr("data-tabindex", -1);
                }
            });
        },
        subscribeEvents: function () {
            this.subscribe(window.accesspersona.events.accesspersona_credential_holder_selected, this.onCredentialHolderSelected);
            this.subscribe(window.accesspersona.events.access_persona_saved, this.onAccessPersonaSaved);
            this.subscribe(window.accesspersona.events.accesspersona_confirm_delete, this.confirmAccessPersonaDelete);
            this.subscribe(window.accesspersona.events.accesspersona_deleted, this.onAccessPersonaDeleted);
            this.subscribe(window.accesspersona.events.hide_delete_accesspersona_cofirm, this.onAccessPersonaDeleteConfirm);
            this.subscribe(window.accesspersona.events.accesspersona_confirm_dissociate, this.confirmAccessPersonaDissociate);
            this.subscribe(window.accesspersona.events.accesspersona_dissociate_status, this.onAccessPersonaDissociation);
        },
        onCredentialHolderSelected: function (event, data) {
            if (this.viewModel && data) {
                this.viewModel.trigger(window.accesspersona.events.credential_holder_selection_changed, data);
            }
        },
        onAccessPersonaSaved: function (eventName, result) {
            if (result.data) {
                alertify.success(window.accesspersona.messages.access_persona_save_success);
            }
            else {
                alertify.error(window.accesspersona.messages.access_persona_save_fail);
            }
        },
        confirmAccessPersonaDelete: function (eventName, data) {
            if (data.deleteMode) {
                this.publish(window.accesspersona.events.show_delete_accesspersona_cofirm, data);
            }
            else {
                var self = this;
                alertify.confirm(window.accesspersona.messages.accesspersona_confirm_delete, function (val) {
                    if (val && self.viewModel) {
                        self.viewModel.trigger(window.accesspersona.events.accesspersona_delete_confirmed, data);
                    }
                });
            }
        },
        onAccessPersonaDeleteConfirm: function (eventName, result) {
            if (this.viewModel && (result.deleteMode == 1 || result.deleteMode == 2)) {
                this.viewModel.trigger(window.accesspersona.events.accesspersona_delete_confirmed, result);
            }
        },
        onAccessPersonaDeleted: function (eventName, result) {
            if (result) {
                alertify.success(window.accesspersona.messages.accesspersona_delete_success);
            }
            else {
                alertify.error(window.accesspersona.messages.accesspersona_delete_fail);
            }
        },
        confirmAccessPersonaDissociate: function (eventName, data) {
            var self = this;
            alertify.confirm(window.accesspersona.messages.accesspersona_confirm_dissociate, function (val) {
                if (val && self.viewModel) {
                    self.viewModel.trigger(window.accesspersona.events.accesspersona_dissociate_confirmed, data);
                }
            });
        },
        onAccessPersonaDissociation: function (eventName, data) {
            if (data.success) {
                alertify.success(window.accesspersona.messages.accesspersona_dissociate_success);
            }
            else {
                alertify.error(window.accesspersona.messages.accesspersona_dissociate_failed);
            }
        },
        onFinish: function () {
            this.close();
            if (this.prevEl && this.prevEl.length > 0) {
                $("[data-accounttype]").removeClass("settingsform_active").addClass("settingsform");
                this.prevEl.addClass("settingsform_active");
                delete this.prevEl;
            }
            _.each(configTabs, function (item) {
                $('#configtab a').each(function () {
                    if ($(this).attr('href') == item.id) {
                        $(this).show();
                        $(this).attr("data-tabindex", item.index);
                    }
                });
            });
        }
    });

    var CredentialHolderListView = uibase.BaseView.inherits({
        initializeView: function (options) {
            this.subscribe(window.accesspersona.events.accesspersona_giveaccess_clicked, this.onShowViewEventReceived, true);
            this.subscribe(window.accesspersona.events.hide_access_persona_view, this.onFinish, true);
        },
        onShowViewEventReceived: function (eventName, node) {
            if (node.nodeobject.EntityType.toLowerCase() == window.accesspersona.constants.credentialHoldersEntity.toLowerCase()) {
                this.show(new window.accesspersona.CredentialHolderListViewModel({
                    viewName: this.viewName,
                    baseUrl: this.baseUrl,
                    antiForgeryToken: this.antiForgeryToken,
                    accountId: node.nodeobject.accountId
                }));
            }
        },
        beforeShow: function () {
            this.prevEl = $(".leftpaneform_active[data-leftpane]");
            $("[data-leftpane]").removeClass("leftpaneform_active").addClass("leftpaneform");
            $("[data-leftpane='" + window.accesspersona.constants.accessPersonaEntity.toUpperCase() + "']").addClass("leftpaneform_active");
        },
        subscribeEvents: function () {
            this.subscribe(window.accesspersona.events.accesspersona_flow_mode_changed, this.onFlowModeChanged);
        },
        onFlowModeChanged: function (eventName, data) {
            if (this.viewModel) {
                this.viewModel.trigger(window.accesspersona.events.credential_holders_flow_change, data);
            }
        },
        onFinish: function () {
            this.close();
            if (this.prevEl && this.prevEl.length > 0) {
                $("[data-leftpane]").removeClass("leftpaneform_active").addClass("leftpaneform");
                this.prevEl.addClass("leftpaneform_active");
                delete this.prevEl;
            }
        }
    });

    var AccessPersonaNavigationView = uibase.BaseView.inherits({
        initializeView: function (options) {
            this.subscribe(window.accesspersona.events.accesspersona_giveaccess_clicked, this.onShowViewEventReceived, true);
            this.subscribe(window.accesspersona.events.hide_access_persona_view, this.onFinish, true);
        },
        onShowViewEventReceived: function (eventName, node) {
            if (node.nodeobject.EntityType.toLowerCase() == window.accesspersona.constants.credentialHoldersEntity.toLowerCase()) {
                this.show(new window.accesspersona.AccessPersonaNavPaneViewModel({
                    viewName: this.viewName,
                    baseUrl: this.baseUrl,
                    antiForgeryToken: this.antiForgeryToken,
                    accountId: node.nodeobject.accountId
                }));
            }
        },
        beforeShow: function () {
            this.prevEl = $(".navpaneform_active[data-navpane]");
            $("[data-navpane]").removeClass("navpaneform_active").addClass("navpaneform");
            $("[data-navpane='" + window.accesspersona.constants.accessPersonaEntity.toUpperCase() + "']").addClass("navpaneform_active");
        },
        subscribeEvents: function () {

        },
        onFinish: function () {
            this.close();
            if (this.prevEl && this.prevEl.length > 0) {
                $("[data-navpane]").removeClass("navpaneform_active").addClass("navpaneform");
                this.prevEl.addClass("navpaneform_active");
                delete this.prevEl;
            }
        }
    });

    var DeleteAccessPersonaConfirmView = uibase.BaseView.inherits({
        initializeView: function (options) {
            this.subscribe(window.accesspersona.events.show_delete_accesspersona_cofirm, this.onShowViewEventReceived, true);
        },
        onShowViewEventReceived: function (eventName, data) {
            this.show(new window.accesspersona.DeleteAccessPersonaConfirmViewModel({
                accessPersonaId: data.accessPersonaId,
                credentialHolderIds: data.credentialHolderIds,
                accountId: data.accountId,
                accessPersonas: data.accessPersonas
            }), true);
        },
        subscribeEvents: function () {
            this.subscribe(window.accesspersona.events.hide_delete_accesspersona_cofirm, this.onCloseViewEventReceived);
        },
        onCloseViewEventReceived: function () {
            this.close();
        }
    });

    window.accesspersona.views = {
        accessPersonaConfigView: new AccessPersonaConfigView({
            baseUrl: accessPersonaMgmturl,
            antiForgeryToken: antiForgeryToken,
            viewName: 'manage_access_persona_form'
        }),
        credentialHolderListView: new CredentialHolderListView({
            baseUrl: accessPersonaMgmturl,
            antiForgeryToken: antiForgeryToken,
            viewName: 'accesspersona_credential_holders'
        }),
        accessPersonaNavigationView: new AccessPersonaNavigationView({
            baseUrl: accessPersonaMgmturl,
            antiForgeryToken: antiForgeryToken,
            viewName: 'accesspersona_nav_pane'
        }),
        deleteCredentialHolderConfirmView: new DeleteAccessPersonaConfirmView({
            baseUrl: accessPersonaMgmturl,
            antiForgeryToken: antiForgeryToken,
            viewName: 'deleteAccessPersonaConfirmContent',
            modalId: 'deleteAccessPersonaConfirm'
        })
    };

})();