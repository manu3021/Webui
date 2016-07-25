(function () {

    var antiForgeryToken = $("#antiForgeryToken").val();
    var panelConfigUrl = $('#panelConfigUrl').val();
    var panelInputConfigRootId = 'netaxs_input_config_form';
    var currentAccount = null;

    $.validator.addMethod('hourRange', function (value, element, timeRange) {
        var timeValue = parseFloat(value && (value.split(':')[0] * 1));
        return this.optional(element) || (!isNaN(timeValue) && (timeValue >= timeRange[0] && timeValue <= timeRange[1]));
    }, 'Invalid hour range');

    $.validator.addMethod('minuteRange', function (value, element, timeRange) {
        var timeValue = parseFloat(value && (value.split(':')[1] * 1));
        return this.optional(element) || (!isNaN(timeValue) && (timeValue >= timeRange[0] && timeValue <= timeRange[1]));
    }, 'Invalid minute range');

    $.validator.addMethod('minutehrRange', function (value, element, timeRange) {
        var timeValue = parseFloat(value && (value.split(':')[1] * 1));
        var timeHrValue = parseFloat(value && (value.split(':')[0] * 1));
        if (timeHrValue == 0)
            return true;
        return (this.optional(element) || (!isNaN(timeValue) && (timeValue >= timeRange[0] && timeValue <= timeRange[1])));
    }, 'Invalid minute range');

    $.validator.addMethod('secondRange', function (value, element, timeRange) {
        var timeValue = parseFloat(value && (value.split(':')[2] * 1));
        return this.optional(element) || (!isNaN(timeValue) && (timeValue >= timeRange[0] && timeValue <= timeRange[1]));
    }, 'Invalid second range');

    $.validator.addMethod('mSecRange', function (value, element, timeRange) {
        if (value == undefined || value == "") {
            return false;
        }
        var mSec = (value.split(':')[2].split('.')[1]);
        if (mSec != null && mSec.length == 1) {

            var timeValue = parseFloat(value && mSec);
            return this.optional(element) || (!isNaN(timeValue) && (timeValue >= timeRange[0] && timeValue <= timeRange[1]));
        }
        else
            return false;
    }, 'Invalid milliSec');

    $.validator.addMethod('maxSec', function (value, element, timeRange) {
        if (value == undefined || value == "") {
            return false;
        }
        var arrTime = value.split(':');
        var timeValue = parseFloat(value && arrTime[0] * 3600 + arrTime[1] * 60 + arrTime[2] * 1);
        return this.optional(element) || (!isNaN(timeValue) && (timeValue >= timeRange[0] && timeValue <= timeRange[1]));
    }, 'Exceeded maximum limit');

    $.validator.addMethod('decimalRange', function (value, element, timeRange) {
        if (value == undefined || value == "") {
            return false;
        }
        var timeValue = parseFloat(value && (value.split('.')[1] * 1));
        return this.optional(element) || (!isNaN(timeValue) && (timeValue >= timeRange[0] && timeValue <= timeRange[1]));
    }, 'Invalid debounce time');

    $.validator.addMethod('timeRequired', function (value, element, timeRequired) {
        var timeValue = (value && parseFloat(value.replace(/[:0]/g, '')) > 0) ? value : '';
        return $.validator.methods.required.call(this, timeValue, element, timeRequired);
    }, 'Time value is required');

    $.subscribe(window.panelconfig.events.panel_input_saved, function (eventName, result) {
        alertify.success(window.panelconfig.messages.panel_input_save_success);
        currentAccount.nodedata.Name = result;
        currentAccount.updatecallback(currentAccount.nodedata);
    });
    $.subscribe(window.panelconfig.events.panel_input_saved_offline, function (eventName, result) {
        
        alertify.success(window.panelconfig.messages.devoffline_cnfgdwnOnOnl);
        currentAccount.nodedata.Name = result;
        currentAccount.updatecallback(currentAccount.nodedata);
    });

    $.subscribe(window.panelconfig.events.panel_input_removed, function (eventName, result) {
        alertify.success(window.panelconfig.messages.panel_input_remove_success);
    });

    $.subscribe(window.panelconfig.events.show_panel_input_remove_confirm, function (eventName, result) {
        alertify.confirm(window.panelconfig.messages.panel_input_remove_confirm, function (val) {
            if (val) {
                var context = ko.contextFor(document.getElementById(panelInputConfigRootId));
                if (context && context.$data && context.$data.trigger) {
                    context.$data.trigger(window.panelconfig.events.panel_input_remove, result);
                }
            }
        });
    });

    $.subscribe(window.panelconfig.events.treeview_item_selected, function (event, node) {
        if (node.nodedata.EntityType.toLowerCase() == window.panelconfig.constants.inputEntity.toLowerCase()) {
            showView(window.panelconfig.constants.inputEntity.toUpperCase());
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
        ko.cleanNode(document.getElementById(panelInputConfigRootId));
        ko.applyBindings(new window.panelconfig.PanelInputViewModel({
            baseUrl: panelConfigUrl,
            antiForgeryToken: antiForgeryToken,
            validationContext: new uibase.BaseValidationContext(panelInputConfigRootId, window.panelconfig.PanelInputValidations),
            inputId: node.nodedata.Id
        }), document.getElementById(panelInputConfigRootId));
    }

})();