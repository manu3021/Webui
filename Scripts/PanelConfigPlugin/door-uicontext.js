/// <reference path="door-common.js" />
/// <reference path="doorcamera.treeviewloader.js" />
/// <reference path="door-model.js" />
/// <reference path="door-datacontext.js" />
/// <reference path="door-validationcontext.js" />

window.doorconfig.uicontext = (function ($, ko, datacontext, validationcontext, common) {
    var configuicontext = {
        ondoorselectionchanged: ondoorselectionchanged,
        validateForm: validateForm,
        showassociatedialog: showassociatedialog,
        closecurrentDialog: closecurrentDialog,
        getloadinOptions: getloadinOptions,
        binddatatoactiveform: binddatatoactiveform,
        calcTime: calcTime
    }

    var $currentDialog, modalOptions = { show: true, keyboard: false, backdrop: "static" };
    var currentDevice = null;

    function closecurrentDialog() {
        if ($currentDialog) {
            $currentDialog.modal("hide");
        }
    }

    function showassociatedialog() {
        $currentDialog = $('#doorcameraassociate');
        ko.cleanNode(document.getElementById("doorcameraassociate"));

        var doorcontext = ko.contextFor(document.getElementById("doorForm"));
        var doormodel = doorcontext.$data;

        datacontext.getassociateddevices(doormodel, function (result) {
            doorcameratreeviewPlugin.getInstance().initialize($("#doorcameratreeview"), result);
        });

        ko.applyBindings(doormodel, document.getElementById("doorcameraassociate"));

        $('.modelRightSection').droppable({
            accept: function (elem) {
                var treenodemodel = ko.contextFor(elem[0]).$data;
                if (treenodemodel.nodeobject == undefined ||
                    treenodemodel.nodeobject.EntityType.toLowerCase() != common.constants.droppableentitytype.toLowerCase())
                    return false;
                var drg = treenodemodel.draggable();
                if (drg == "false")
                    return false;
                return true;
            },
            tolerance: 'pointer',
            hoverClass: 'state-hover',
            drop: function (event, ui) {
                var contextDragger = $(ui)[0].draggable.context;
                var treenodemodel = ko.contextFor(contextDragger).$data;
                var targetcontext = ko.contextFor(event.currentTarget.activeElement);
                var targetdoormodel = targetcontext.$data;
                var deviceentity = new datacontext.deviceEntity({ Id: treenodemodel.id(), Name: treenodemodel.name() });
                targetdoormodel.adddeviceitem(deviceentity);
            },
            over: function (event, ui) {
                $('#log').text('over');
            },
            out: function (event, ui) {
                $('#log').text('out');
            }
        });

        $currentDialog.modal(modalOptions);
    }

    function ondoorselectionchanged(data) {
        currentDevice = data;
        datacontext.ondoorselected(data);
        setactivesettingform();
    }

    function validateForm() {
        return validationcontext.validateForm("doorForm");
    }

    function setactivesettingform() {
        if (currentDevice != null && currentDevice.nodedata != null) {
            if (currentDevice.nodedata.EntityType.toLowerCase() == common.constants.entitytype && currentDevice.nodedata.DeviceType.Name.toLowerCase() == common.constants.devicetype) {
                hideallforms();
                //$("[data-accounttype='DOOR']").addClass("settingsform_active").showLoading();
                blockUI();

                binddatatoactiveform();
            }
        }
    }
    
    function hideallforms() {
        $("[data-accounttype]").removeClass("settingsform_active");
        $("[data-accounttype='DOOR']").addClass("settingsform_active");
    }

    function binddatatoactiveform() {
        datacontext.getdoordetail(function (jsondata) {
            ko.cleanNode(document.getElementById("doorForm"));
            var newdoorentity = new datacontext.doorentity(jsondata);
            ko.applyBindings(newdoorentity, document.getElementById("doorForm"));
            validationcontext.setvalidationfor("doorForm");
            //$("[data-accounttype='DOOR']").hideLoading();
        });
        unblockUI();
    }

    function getloadinOptions(message) {
        return {
            css: {
                border: 'none',
                padding: '12px',
                backgroundColor: 'rgba(8, 137, 196, 0.60)',
                '-webkit-border-radius': '4px',
                '-moz-border-radius': '4px',
                opacity: .8,
                color: '#fff'
            },
            overlayCSS: {
                backgroundColor: "rgba(250, 250, 250, 0.66)"
            },
            message: message
        }
    }

    function calcTime(time) {
        var totalSeconds = time / 1000;
        var hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        var minutes = Math.floor(totalSeconds / 60);
        var seconds = totalSeconds % 60;
        var finalTime = hours + ':' + minutes + ':' + (Math.round((seconds) * 10) / 10).toFixed(1);
        return finalTime;
    }

    var getloadingOptions = function (message) {
        return {
            css: {
                border: 'none',
                padding: '12px',
                backgroundColor: 'rgba(8, 137, 196, 0.60)',
                '-webkit-border-radius': '4px',
                '-moz-border-radius': '4px',
                opacity: .8,
                color: '#fff'
            },
            overlayCSS: {
                backgroundColor: "rgba(250, 250, 250, 0.66)"
            },
            message: message
        }
    }
    return configuicontext;
})(jQuery, ko, window.doorconfig.datacontext, window.doorconfig.validationcontext, window.doorconfig.common);