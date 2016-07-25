(function () {

    var antiForgeryToken = $("#antiForgeryToken").val();
    var panelConfigUrl = $('#panelConfigUrl').val();
    var panelReaderRootId = 'netaxs_reader_config_form';
    var currentAccount = null;

    $.subscribe(window.panelconfig.events.panel_reader_saved, function (eventName, result) {
        alertify.success(window.panelconfig.messages.panel_reader_save_success);
        currentAccount.nodedata.Name = result;
        currentAccount.updatecallback(currentAccount.nodedata);
    });

    $.subscribe(window.panelconfig.events.panel_reader_saved_offline, function (eventName, result) {
        alertify.success(window.panelconfig.messages.devoffline_cnfgdwnOnOnl);
        currentAccount.nodedata.Name = result;
        currentAccount.updatecallback(currentAccount.nodedata);
    });

    $.subscribe(window.panelconfig.events.treeview_item_selected, function (event, node) {
        if (node.nodedata.EntityType.toLowerCase() == window.panelconfig.constants.deviceEntity.toLowerCase()) {
            showView(window.panelconfig.constants.deviceEntity.toUpperCase());
            bindView(node);
        }
        else if (node.nodedata.EntityType.toLowerCase() == window.panelconfig.constants.READER.toLowerCase()) {
            showView(window.panelconfig.constants.deviceEntity.toUpperCase());
            bindViewForReader(node);
        }
    });

    function showView(entityType) {
        $("[data-accounttype]").removeClass("settingsform_active");
        $("[data-accounttype]").addClass("settingsform");
        $("[data-accounttype='" + entityType + "']").addClass("settingsform_active");
    }

    function bindViewForReader(node) {
        currentAccount = node;
        getreaderinfo().done(function (result) {
            ko.cleanNode(document.getElementById(panelReaderRootId));
            ko.applyBindings(new window.panelconfig.PanelReaderViewModel({
                baseUrl: panelConfigUrl,
                antiForgeryToken: antiForgeryToken,
                validationContext: new uibase.BaseValidationContext(panelReaderRootId, window.panelconfig.PanelReaderValidations),
                readerId: result
            }), document.getElementById(panelReaderRootId));
        });
    }

    function getreaderinfo() {
        data = ({ readernodeId: currentAccount.nodedata.Id });
        return ajaxRequest("POST", getreaderinfourl(),data);
    }

    function getreaderinfourl(readernodeId) {
        return panelConfigUrl + "/getreaderinfo";//?readernodeId=" + readernodeId;
    }

   

    function bindView(node) {
        currentAccount = node;
        ko.cleanNode(document.getElementById(panelReaderRootId));
        ko.applyBindings(new window.panelconfig.PanelReaderViewModel({
            baseUrl: panelConfigUrl,
            antiForgeryToken: antiForgeryToken,
            validationContext: new uibase.BaseValidationContext(panelReaderRootId, window.panelconfig.PanelReaderValidations),
            readerId: node.nodedata.Id
        }), document.getElementById(panelReaderRootId));
    }

})();