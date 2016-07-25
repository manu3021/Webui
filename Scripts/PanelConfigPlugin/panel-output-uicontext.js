(function () {

    var antiForgeryToken = $("#antiForgeryToken").val();
    var panelConfigUrl = $('#panelConfigUrl').val();
    var panelOutputConfigRootId = 'netaxs_ouput_config_form';
    var currentAccount = null;

    $('#netaxs_ouput_config_form .bootstrap-timepicker input').timepicker({
        template: false,
        showInputs: false,
        showSeconds: true,
        showMeridian: false,
        defaultTime: false
    });

    $.validator.addMethod('hourRange', function (value, element, timeRange) {
        var timeValue = parseFloat(value && value.split(':')[0]);
        return this.optional(element) || (!isNaN(timeValue) && (timeValue >= timeRange[0] && timeValue <= timeRange[1]));
    }, 'Invalid hour range');

    $.validator.addMethod('minuteRange', function (value, element, timeRange) {
        var timeValue = parseFloat(value && value.split(':')[1]);
        return this.optional(element) || (!isNaN(timeValue) && (timeValue >= timeRange[0] && timeValue <= timeRange[1]));
    }, 'Invalid minute range');

    $.validator.addMethod('minutehrRange', function (value, element, timeRange) {
        var timeValue = parseFloat(value && value.split(':')[1]);
        var timeHrValue = parseFloat(value && value.split(':')[0]);
        if (timeHrValue == 0)
            return true;
        return (this.optional(element) || (!isNaN(timeValue) && (timeValue >= timeRange[0] && timeValue <= timeRange[1])));
    }, 'Invalid minute range');

    $.validator.addMethod('secondRange', function (value, element, timeRange) {
        var timeValue = parseFloat(value && value.split(':')[2]);
        return this.optional(element) || (!isNaN(timeValue) && (timeValue >= timeRange[0] && timeValue <= timeRange[1]));
    }, 'Invalid second range');

    $.validator.addMethod('milliSecondRange', function (value, element, timeRange) {
        if (val.split(':')[2].split('.').length > 0) {
            var timeValue = parseFloat(val && val.split(':')[2].split('.')[1])
            return (!isNaN(timeValue) && (timeValue >= timeRange[0] && timeValue <= timeRange[1]));
        }
        return true;
    }, 'Invalid millisecond range');

    $.validator.addMethod('timeRequired', function (value, element, timeRequired) {
        var timeValue = (value && parseFloat(value.replace(/[:0]/g, '')) > 0) ? value : '';
        return $.validator.methods.required.call(this, timeValue, element, timeRequired);
    }, 'Time value is required');

    $.subscribe(window.panelconfig.events.panel_output_saved, function (eventName, result) {
        alertify.success(window.panelconfig.messages.panel_output_save_success);
        currentAccount.nodedata.Name = result;
        currentAccount.updatecallback(currentAccount.nodedata);
    });
    $.subscribe(window.panelconfig.events.panel_output_saved_offline, function (eventName, result) {
        alertify.success(window.panelconfig.messages.devoffline_cnfgdwnOnOnl);
        currentAccount.nodedata.Name = result;
        currentAccount.updatecallback(currentAccount.nodedata);
    });
    $.subscribe(window.panelconfig.events.panel_output_removed, function (eventName, result) {
        alertify.success(window.panelconfig.messages.panel_output_remove_success);
    });

    $.subscribe(window.panelconfig.events.show_panel_output_remove_confirm, function (eventName, result) {
        alertify.confirm(window.panelconfig.messages.panel_output_remove_confirm, function (val) {
            if (val) {
                var context = ko.contextFor(document.getElementById(panelOutputConfigRootId));
                if (context && context.$data && context.$data.trigger) {
                    context.$data.trigger(window.panelconfig.events.panel_output_remove, result);
                }
            }
        });
    });

    $.subscribe(window.panelconfig.events.treeview_item_selected, function (event, node) {
        if (node.nodedata.EntityType.toLowerCase() == window.panelconfig.constants.outputEntity.toLowerCase()) {
            showView(window.panelconfig.constants.outputEntity.toUpperCase());
            bindView(node);
        }
    });

    function showView(entityType) {
        $("[data-accounttype]").removeClass("settingsform_active");
        $("[data-accounttype]").addClass("settingsform");
        $("[data-accounttype='" + entityType + "']").addClass("settingsform_active");
    }

    function bindView(node) {
        currentAccount = node;
        ko.cleanNode(document.getElementById(panelOutputConfigRootId));
        ko.applyBindings(new window.panelconfig.PanelOutputViewModel({
            baseUrl: panelConfigUrl,
            antiForgeryToken: antiForgeryToken,
            validationContext: new uibase.BaseValidationContext(panelOutputConfigRootId, window.panelconfig.PanelOutputValidations),
            outputId: node.nodedata.Id
        }), document.getElementById(panelOutputConfigRootId));
    }

})();