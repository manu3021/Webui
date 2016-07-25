/// <reference path="model.js" />
/// <reference path="common.js" />
/// <reference path="validationcontext.js" />
/*
    Configuration UI context - all ui based logic will be handled here
    */
window.configuration.uicontext = (function ($, datacontext, common, validationContext) {
    var currentAccount = null, currentDialog = null,
    modalOptions = { show: true, keyboard: false, backdrop: "static" }, current_Tabindex = 0;//,deleteOtherAcc = false;
    //devicetypes = { DEVICE: "device" },
    deletetypes = { DELETECUSTOMER: "deletecustomer" }
    configforms = {
        customerForm: "customer_form", siteForm: "site_form", groupForm: "group_form",
        customerModalForm: "customermodal_form", siteModalForm: "sitemodal_form", groupModalForm: "groupmodal_form", deviceModalForm: "DeviceModal_form",
        deleteForm: "deletecustomer_form"
    },
    configModalDialougs = {
        customermodal: "#customerModal",
        sitemodal: "#siteModal",
        groupmodal: "#groupModal",
        devicemodal: "#deviceModal",
        deletecustomermodal: "#deletecustomermodal",
        stdfeatures: "#standardfeatures",
        upgradePackageDialog: "#upgradePackageDialog",
        downgradePackageDialog: "#downgradePackageDialog"
    },
    configuicontext = {
        accountselectionchanged: accountselectionchanged,
        configoptionsselected: configoptionsselected,
        closecurrentdialog: closecurrentdialog,
        configforms: configforms,
        validateform: validateform,
        validatedeviceform: validatedeviceform,
        scheduleholidayselected: scheduleholidayselected,
        deleteSelectedaccount: deleteSelectedaccount,
        setOtherAccountForDelete: setOtherAccountForDelete,
        current_Tabindex: current_Tabindex,
        getpackagedetail: getpackagedetail,
        activateTabforAccount: activateTabforAccount,
        showStdFeaturesDialog: showStdFeaturesDialog,
        showPackageUpgradeDialog: showPackageUpgradeDialog
    };

    function setsettingstabactive() { }
    function accountselectionchanged(accountSelected) {
        datacontext.onaccountselected(accountSelected);
        currentAccount = accountSelected;
        var type = currentAccount.nodedata.EntityType.toLowerCase();
        if (type == common.constants.accounttypes.GENERAL || type == common.constants.accounttypes.CUSTOMER || type == common.constants.accounttypes.DEALER ||
            type == common.constants.accounttypes.SITE || type == common.constants.accounttypes.GROUP) {
            datacontext.getconfioptions(currentAccount.nodedata.EntityType, function (data) {
                setactiveaccountform();
            }, window.configuration.configviewmodel.error);
        }
        else {
            setactiveaccountform();
        }
        try {
            $("#config_Account_Delete").show();
        } catch (e) {
        }
    };
    function deleteSelectedaccount() {
        var delMessage = "";
        var isaccount = true;

        if (currentAccount == undefined || currentAccount == null) {
            alertify.alert(Resources.Please_select_a_node_to_delete);
            return;
        }
        if (currentAccount.nodedata.IsDemo == '1') {
            alertify.alert(Resources.Demo_Entity_Deletion_Error);
            return;
        }
        //if (deleteOtherAcc == true) {
        //    alertify.alert(Resources.CannotDeleteDefault);
        //    return;
        //}
        if (currentAccount.nodedata.EntityType.toLowerCase() == common.constants.accounttypes.CUSTOMER || currentAccount.nodedata.EntityType.toLowerCase() == common.constants.accounttypes.DEALER) {
            delMessage = Resources.Customer + " '" + currentAccount.nodedata.Name + "' " + Resources.Customer_Delete_Message;
        }
        if (currentAccount.nodedata.EntityType.toLowerCase() == common.constants.accounttypes.SITE) {
            delMessage = Resources.Site + " '" + currentAccount.nodedata.Name + "' " + Resources.Customer_Delete_Message;
        }
        if (currentAccount.nodedata.EntityType.toLowerCase() == common.constants.accounttypes.GROUP) {
            delMessage = Resources.Group + " '" + currentAccount.nodedata.Name + "' " + Resources.Customer_Delete_Message;
        }
        if (currentAccount.nodedata.EntityType.toLowerCase() == common.constants.accounttypes.PANEL ||
            currentAccount.nodedata.EntityType.toLowerCase() == common.constants.accounttypes.RECORDER) {
            delMessage = currentAccount.nodedata.Name;
            isaccount = false;
        }

        alertify.confirm(Resources.Do_you_want_delete + " " + delMessage, function (e) {
            if (e) {
                console.log("deleteSelectedAccount:Ui Context")
                if (isaccount) {
                    datacontext.deleteaccount(currentAccount.nodedata.Id).done(function (jsonResult) {
                        if (jsonResult.success) {
                            alertify.success(common.messages.Successfully_deleted);
                            //Remove account node from tree
                            currentAccount.deletecallback(currentAccount);

                            $.publish(common.events.deleteAccountSuccess, jsonResult.data);
                            //Logic for select any other account or no account
                            var context = ko.contextFor(document.getElementById("createbar"));
                            if (context) {
                                context.$data.configOptions.removeAll();
                            }
                            currentAccount = null;
                            hideallforms();
                        }
                        else {
                            alertify.error(common.messages.Delete_failed);
                        }
                    }).fail(function () { });
                }
                else {
                    datacontext.deletedevice(currentAccount.nodedata.EntityType, currentAccount.nodedata.Id).done(function (jsonResult) {
                        if (jsonResult.success) {
                            alertify.success(common.messages.Successfully_deleted);
                            //Remove account node from tree
                            currentAccount.deletecallback(currentAccount);
                            $.publish(common.events.deleteDeviceSuccess, jsonResult.data);
                            //Logic for select any other account or no account
                            currentAccount = null;
                            hideallforms();
                        }
                        else {
                            alertify.error(common.messages.Delete_failed);
                        }
                    }).fail(function () { });
                }
            }
        });
    }
    function configoptionsselected(data) {
        try {
            currentDialog = null;
            if (currentAccount == undefined || currentAccount == null) {
                alertify.alert(common.messages.CreateCustomerWithoutAccount);
                return;
            }

            // swith for config create / delete options
            switch (data.Id) {
                case "1001":

                    deleteSelectedaccount();

                    break;
                case "1002":
                    break;
                case "1003":
                    break;
                case "2001":
                    //CREATE Customer

                    // Customer can be added only under Dealer
                    if (currentAccount.nodedata.EntityType.toLowerCase() == common.constants.accounttypes.DEALER) {

                        currentDialog = $(configModalDialougs.customermodal);
                        // get empty entity
                        var newentity = datacontext.getemptyaccount(common.constants.accounttypes.CUSTOMER, currentAccount);
                        ko.cleanNode(currentDialog[0]);
                        ko.applyBindings(newentity, currentDialog[0]);
                        newentity.initMap();
                        validationContext.setvalidationfor(configuicontext.configforms.customerModalForm);
                        currentDialog.modal(modalOptions);
                        googleAutocomplete('customermodal_form', 'customer_City', newentity.onAutoComplete);
                    }
                    else {
                        alertify.alert(common.messages.CannotCreateCustomerUnder);
                        return;
                    }
                    break;
                case "2002":
                    //CREATE Site
                    if (currentAccount.nodedata.IsDemo == '1') {
                        alertify.alert(Resources.Demo_Site_Creation_Error);
                        return;
                    }
                    // SITE can be added only under Customer and Group
                    if (currentAccount.nodedata.EntityType.toLowerCase() == common.constants.accounttypes.CUSTOMER ||
                      currentAccount.nodedata.EntityType.toLowerCase() == common.constants.accounttypes.GROUP) {

                        currentDialog = $(configModalDialougs.sitemodal);
                        var newentity = datacontext.getemptyaccount(common.constants.accounttypes.SITE, currentAccount);
                        ko.cleanNode(currentDialog[0]);

                        ko.applyBindings(newentity, currentDialog[0]);
                        newentity.initMap();
                        validationContext.setvalidationfor(configuicontext.configforms.siteModalForm);
                        currentDialog.modal(modalOptions);
                        googleAutocomplete('sitemodal_form', 'site_City', newentity.onAutoComplete);
                    }
                    else {
                        // Cannot create Site under selected node - 
                        alertify.alert(common.messages.CannotCreateSiteUnder);
                        return;
                    }
                    break;
                case "2003":
                    //CREATE Group
                    if (currentAccount.nodedata.IsDemo == '1') {
                        alertify.alert(Resources.Demo_Group_Creation_Error);
                        return;
                    }
                    // GROUP can be added only under Customer
                    if (currentAccount.nodedata.EntityType.toLowerCase() == common.constants.accounttypes.CUSTOMER || currentAccount.nodedata.EntityType.toLowerCase() == common.constants.accounttypes.GROUP) {
                        currentDialog = $(configModalDialougs.groupmodal);
                        var newentity = datacontext.getemptyaccount(common.constants.accounttypes.GROUP, currentAccount);
                        ko.cleanNode(currentDialog[0]);
                        ko.applyBindings(newentity, currentDialog[0]);
                        validationContext.setvalidationfor(configuicontext.configforms.groupModalForm);
                        currentDialog.modal(modalOptions);
                    }
                    else {
                        alertify.alert(common.messages.CannotCreateGroupUnder);
                        return;
                    }
                    break;
                case "2004":
                    //CREATE Device
                    currentDialog = $(configModalDialougs.devicemodal);
                    if (currentAccount.nodedata.EntityType.toLowerCase() != common.constants.accounttypes.SITE) {
                        alertify.alert(common.messages.CreateDeviceOnWrongAccount);
                        currentDialog = null;
                        console.log(common.messages.Errors.CreateDeviceOnWrongAccount + " --> " + currentAccount.nodedata.EntityType);
                        return;
                    }
                    else {
                        var newDeviceModel = datacontext.getemptydevice("Device", currentAccount.nodedata.Id);
                        datacontext.getdevicemodeltypes(newDeviceModel.devicetypes);
                        ko.cleanNode(currentDialog[0]);
                        ko.applyBindings(newDeviceModel, currentDialog[0]);
                        validationContext.setvalidationfor(configuicontext.configforms.deviceModalForm);
                        currentDialog.modal(modalOptions);

                    }
                    break;
                default:
            }
        } catch (e) {
            console.error("Error occured in config option selection", e);
        }
    }
    function closecurrentdialog() {
        if (currentDialog != null) {
            currentDialog.modal("hide");
        }
    }
    function setactiveaccountform() {
        try {

            if (currentAccount != null || currentAccount != undefined) {
                if (currentAccount.nodedata.EntityType.toLowerCase() == common.constants.accounttypes.DEALER) {
                    hideallforms();
                  
                    $("[data-accounttype='CUSTOMER']").addClass("settingsform_active").showLoading();
                    $("[data-accounttype='CUSTOMER']").find("[id='packageDetail']").hide();
                    validationContext.setvalidationfor(configuicontext.configforms.customerForm);
                    binddatatoactiveform("DEALER", function () {                     
                        $("[data-accounttype='CUSTOMER']").hideLoading();
                    });
                    if ($("[data-accounttype='DEALER']")[0]!=undefined)
                    {
                        $("[data-accounttype='DEALER']").addClass("settingsform_active");
                    }
                    return;
                }
                if (currentAccount.nodedata.EntityType.toLowerCase() == common.constants.accounttypes.CUSTOMER) {
                    hideallforms();
                    $("[data-accounttype='CUSTOMER']").addClass("settingsform_active").showLoading();
                    $("[data-accounttype='CUSTOMER']").find("[id='packageDetail']").show();
                    $("[data-accounttype!='CUSTOMER']").removeClass("settingsform_active");
                    validationContext.setvalidationfor(configuicontext.configforms.customerForm);
                    binddatatoactiveform("CUSTOMER", function () {
                        $("[data-accounttype='CUSTOMER']").hideLoading();
                    });
                    return;
                }
                if (currentAccount.nodedata.EntityType.toLowerCase() == common.constants.accounttypes.SITE) {
                    hideallforms();
                    $("[data-accounttype='SITE']").addClass("settingsform_active").showLoading();
                    $("[data-accounttype!='SITE']").removeClass("settingsform_active");
                    validationContext.setvalidationfor(configuicontext.configforms.siteForm);
                    binddatatoactiveform("SITE", function () {
                        $("[data-accounttype='SITE']").hideLoading();
                    });
                    return;
                }
                if (currentAccount.nodedata.EntityType.toLowerCase() == common.constants.accounttypes.GROUP) {
                    hideallforms();
                    $("[data-accounttype='GROUP']").addClass("settingsform_active").showLoading();
                    $("[data-accounttype!='GROUP']").removeClass("settingsform_active");
                    validationContext.setvalidationfor(configuicontext.configforms.groupForm);
                    binddatatoactiveform("GROUP", function () {
                        $("[data-accounttype='GROUP']").hideLoading();
                    });
                    return;
                }
            }
        } catch (e) {
            console.error("Error on Set active account form", e);
        }
    }

    function hideallforms() {
        $("[data-accounttype]").removeClass("settingsform_active");
        $("[data-accounttype]").addClass("settingsform");
    }
    function scheduleholidayselected() {
        //Reset all form display to none
        $("[data-accounttype]").removeClass("settingsform_active");
        $("[data-accounttype]").addClass("settingsform");
        $("[data-accounttype='TIME']").addClass("settingsform_active");
        $("[data-accounttype!='TIME']").removeClass("settingsform_active");
    }
    function CleaneAndReset(id) {
        var node = $('#' + id);
        if (node.length > 0) {
            ko.cleanNode(node[0]);
            return true;
        }
        return false;
    }
    function binddatatoactiveform(type, successCallback) {
        datacontext.getaccountdetail().done(function (jsondata) {
            if (jsondata.Success) {
                // Map the detail object to accoutdetail model
                // ko.mapping.fromJS(jsondata, {}, datacontext.accountdetailentity);
                var acViewModel = new datacontext.accountdetailentity(jsondata.data);
                currentAccount.nodedata.IsDemo = jsondata.data.IsDemo
                // bind detail to settingsform
                if (type == "DEALER") {
                    //Set default validation
                    if (CleaneAndReset('editCustomer')) {
                        ko.applyBindings(acViewModel, document.getElementById("editCustomer"));
                        googleAutocomplete('editCustomer', 'customer_City', acViewModel.onAutoComplete);
                    }

                    if (document.getElementById("packageSelect"))
                        getPackageSummary("CustomerPackageSummary");

                }
                if (type == "CUSTOMER") {
                    //Set default validation
                    if (CleaneAndReset('editCustomer')) {
                        ko.applyBindings(acViewModel, document.getElementById("editCustomer"));
                        googleAutocomplete('editCustomer', 'customer_City', acViewModel.onAutoComplete);
                    }
                    if (document.getElementById("packageSelect")) {

                        getpackagedetail();
                    }
                }
                if (type == "SITE") {
                    if (CleaneAndReset('editSite')) {
                        ko.applyBindings(acViewModel, document.getElementById("editSite"));
                        acViewModel.initMap();
                        googleAutocomplete('editSite', 'site_City', acViewModel.onAutoComplete);
                        //if (document.getElementById("packageSelect")) {
                        //    getpackagedetail();
                        //}
                    }
                }
                if (type == "GROUP") {
                    if (CleaneAndReset('editGroup'))
                        ko.applyBindings(acViewModel, document.getElementById("editGroup"));
                    if (type == "GROUP") {
                        if (document.getElementById("packageSelect"))
                            getPackageSummary("GroupPackageSummary");
                    }
                }
                if (successCallback != undefined && successCallback != null)
                    successCallback();
            }

        });


    }
    function activateTabforAccount(accountType) {
        try {
            var i = 0;

            switch (accountType.toLowerCase()) {
                case common.constants.accounttypes.GENERAL:
                    $('#configtab a[href="#operators"]').show().attr("data-tabindex", i++);
                    $('#configtab a[href="#maps"]').show().attr("data-tabindex", i++);
                    $('#configtab a[href="#packageSelect"]').hide().attr("data-tabindex", -1);
                    $('#configtab a[href="#settings"]').hide().attr("data-tabindex", -1);
                    $('#configtab a[href="#firmwareUpgrade"]').hide().attr("data-tabindex", -1);
                    window.mapconfig.mapcontext.SetmapMode(1000, false, true);
                    break;
                case common.constants.accounttypes.CUSTOMER:
                    $('#configtab a[href="#settings"]').show().attr("data-tabindex", i++);
                    $('#configtab a[href="#operators"]').show().attr("data-tabindex", i++);
                    $('#configtab a[href="#packageSelect"]').show().attr("data-tabindex", i++);
                    $('#configtab a[href="#maps"]').show().attr("data-tabindex", i++);
                    $('#configtab a[href="#firmwareUpgrade"]').hide().attr("data-tabindex", -1);
                    window.mapconfig.mapcontext.SetmapMode(1000, false, true);
                    break;
                case common.constants.accounttypes.DEALER:
                    $('#configtab a[href="#settings"]').show().attr("data-tabindex", i++);
                    $('#configtab a[href="#operators"]').show().attr("data-tabindex", i++);
                    $('#configtab a[href="#maps"]').show().attr("data-tabindex", i++);
                    $('#configtab a[href="#packageSelect"]').show().attr("data-tabindex", -1);
                    $('#configtab a[href="#firmwareUpgrade"]').hide().attr("data-tabindex", -1);
                    window.mapconfig.mapcontext.SetmapMode(1000, false, true);
                    break;
                case common.constants.accounttypes.SITE:
                    $('#configtab a[href="#settings"]').show().attr("data-tabindex", i++);
                    $('#configtab a[href="#packageSelect"]').hide().attr("data-tabindex", i++);
                    $('#configtab a[href="#firmwareUpgrade"]').show().attr("data-tabindex", i++);
                    $('#configtab a[href="#maps"]').show().attr("data-tabindex", i++);
                    $('#configtab a[href="#operators"]').hide().attr("data-tabindex", -1);
                    window.mapconfig.mapcontext.SetmapMode(1000, false, true);

                    break;
                case common.constants.accounttypes.GROUP:
                    $('#configtab a[href="#settings"]').show().attr("data-tabindex", i++);
                    $('#configtab a[href="#maps"]').show().attr("data-tabindex", i++);
                    $('#configtab a[href="#operators"]').hide().attr("data-tabindex", -1);
                    $('#configtab a[href="#packageSelect"]').hide().attr("data-tabindex", -1);
                    $('#configtab a[href="#firmwareUpgrade"]').hide().attr("data-tabindex", -1);
                    window.mapconfig.mapcontext.SetmapMode(1000, false, true);
                    break;

                case common.constants.accounttypes.LOGICALTYPE:

                    $('#configtab a[href="#maps"]').hide().attr("data-tabindex", -1);
                    $('#configtab a[href="#settings"]').show().attr("data-tabindex", i++);
                    $('#configtab a[href="#packageSelect"]').hide().attr("data-tabindex", -1);
                    $('#configtab a[href="#operators"]').hide().attr("data-tabindex", -1);
                    $('#configtab a[href="#firmwareUpgrade"]').hide().attr("data-tabindex", -1);
                    break;
                default:
                    //This default case i applied for all device types
                    //if ($('#configtab a[data-tabindex=' + current_Tabindex + ']').attr('href') === '#maps' && $('#floormap_canvas').attr("data-isinfloormap") === "true") {
                    //    window.mapconfig.mapcontext.SetmapMode(1001, false, true);
                    //    $('#configtab a[href="#settings"]').show().attr("data-tabindex", i++);
                    //    $('#configtab a[href="#maps"]').show().attr("data-tabindex", i++);
                    //}
                    //else {
                    $('#configtab a[href="#maps"]').show().attr("data-tabindex", i++);
                    $('#configtab a[href="#settings"]').show().attr("data-tabindex", i++);
                    //}
                    $('#configtab a[href="#packageSelect"]').hide().attr("data-tabindex", -1);
                    $('#configtab a[href="#firmwareUpgrade"]').hide().attr("data-tabindex", -1);
                    $('#configtab a[href="#operators"]').hide().attr("data-tabindex", -1);
                    break;
            }
            var max = -1;
            $('#configtab a[data-tabindex]').attr('data-tabindex', function (a, b) {
                max = Math.max(max, +b);
            });

            $('#configtab a[data-tabindex=' + max + ']').tab('show');
            $.publish(window.global.constants.events.ontabshown, $('#configtab a[data-tabindex=' + max + ']').attr("href"));
            current_Tabindex = max;
        } catch (e) {
            console.log("Error on activating tab for account")
        }
    }
    function validatedeviceform(devicetypes, isnew) {
        switch (devicetypes.toLowerCase()) {

            case "device":
                {
                    if (isnew) {
                        return validationContext.validateForm("DeviceModal_form");
                    }
                }
            default:
        }
    }
    function validateform(accounttype, isnew) {
        switch (accounttype.toLowerCase()) {
            case common.constants.accounttypes.CUSTOMER:
            case common.constants.accounttypes.DEALER:
                if (isnew) {
                    return validationContext.validateForm("customermodal_form");
                }
                else {
                    return validationContext.validateForm("customer_form");
                }
            case common.constants.accounttypes.SITE:
                if (isnew) {
                    return validationContext.validateForm("sitemodal_form");
                }
                else {
                    return validationContext.validateForm("site_form");
                }
            case common.constants.accounttypes.GROUP:
                if (isnew) {
                    return validationContext.validateForm("groupmodal_form");
                }
                else {
                    return validationContext.validateForm("group_form");
                }
            default:

        }
    }
    function setOtherAccountForDelete(otherAccount) {
        if (otherAccount) {
            $("#config_Account_Delete").hide();
        }
        else {
            $("#config_Account_Delete").show();
        }
        // deleteOtherAcc = otherAccount;
    }
    function initializeDefaults() {
        window.lazyLoader().LoadAll();
        // Delete accoutn dirty fix added by mahesh
        $("#config_Account_Delete").on("click", function () {
            configoptionsselected({ Id: "1001" });
        });
        $("#config_Account_Delete").hide();
        handleTabEvents();
        intializeDefaultTabs();
    }
    function intializeDefaultTabs() {
        $('#configtab a').hide();
        $('#configtab  a[href="#maps"]').show();
    }
    //function()
    function handleTabEvents() {
        try {

            $('a[data-toggle="tab"]').on('click', function (tabele) {
                var target = $(this).attr("href") // activated tab
                var tabIndex = $(this).attr("data-tabindex");
                current_Tabindex = tabIndex;
                console.log("Target=" + target + "  TabIndex=" + tabIndex);
            });
            $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                var target = $(e.target).attr("href") // activated tab
                $.publish(window.global.constants.events.ontabshown, target);
                if (target == "#maps") {
                    window.mapconfig.mapcontext.mapresize();
                }
            });
        } catch (e) {
            console.error(target);
        }
    }
    function getpackagedetail() {
        datacontext.getpackagedetail().done(function (jsondata) {
            if (jsondata.Success) {
                var model = new datacontext.packagedetailmodel();
                var baseModel = ko.contextFor(document.getElementById("packageDetail"));
                if (baseModel != null || baseModel != undefined) {
                    baseModel.$data.Initialize(currentAccount.nodedata.Id, jsondata.data);
                    if (jsondata.upgradeReqData != null)
                        baseModel.$data.UpgradeRequestInitialize(jsondata.upgradeReqData);
                    //ko.applyBindings(baseModel, document.getElementById("packageSelect"));
                }
                else {
                    model.Initialize(currentAccount.nodedata.Id, jsondata.data);
                    if (jsondata.upgradeReqData != null)
                        model.UpgradeRequestInitialize(jsondata.upgradeReqData);
                    ko.applyBindings(model, document.getElementById("packageDetail"));
                }
            }
        });

    }
    function getPackageSummary(node) {
        datacontext.getPackageSummary().done(function (jsonResult) {
            if (jsonResult.Success) {
                var model = new datacontext.packagesummarymodel();
                model.Initialize(currentAccount.nodedata.Id, jsonResult.data);
                ko.applyBindings(model, document.getElementById(node));
            }
            else {
                alertify.error(jsonResult.errorMessage);
            }
        })
    }
    function showStdFeaturesDialog(data) {
        currentDialog = $(configModalDialougs.stdfeatures);
        var stdFeaturesModel = ko.contextFor(document.getElementById("standardfeatures"));
        if (stdFeaturesModel == null || stdFeaturesModel == undefined)
            ko.applyBindings(data, document.getElementById("standardfeatures"));
        else
            stdFeaturesModel.$data.standardfeatures(data.standardfeatures());
        currentDialog.modal(modalOptions);
    }
    function showPackageUpgradeDialog(downgrade) {
        if (!downgrade) {
            currentDialog = $(configModalDialougs.upgradePackageDialog);
        }
        else {
            currentDialog = $(configModalDialougs.downgradePackageDialog);
        }
        currentDialog.modal(modalOptions);
    }
    $.subscribe(common.events.packageaddedsuccess, function (eventName, result) {
        alertify.success(result);
        getpackagedetail();
    });
    $.subscribe(common.events.retentionaddedsuccess, function (eventName, result) {
        alertify.success(result);
        getpackagedetail();
        unblockUI();
    });

    initializeDefaults();
    return configuicontext;
})($, window.configuration.datacontext, window.configuration.common, window.configuration.validationcontext);