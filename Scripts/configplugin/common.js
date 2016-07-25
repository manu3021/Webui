window.configuration = window.configuration || {};

window.configuration.common = (function () {
    Resources = Resources || {};
    var constants = {
        accounttypes: { GENERAL: "general", CUSTOMER: "customer", SITE: "site", GROUP: "group", TIME: "time", DEVICE: "device", CAMERA: "camera", PANEL: "panel", CREDENTIAL: "credential", RECORDER: "recorder", SCHEDULE: "schedules", CREDENTIALHOLDER: "credentialholders", LOGICALTYPE: "logcaltype",DEALER:"dealer" }
    };
    var events = {
        treeItemSelectedEvent: "treeviewitemselected",
        accountUpdateFailed: "accountupdatefailed",
        accountupdatesuccess: "accountupdatesuccess",
        configMenuclicked: "configmenuclicked",
        confignewaccountadded: "confignewaccountadded",
        languageselected: "onlanguageselected",
        deviceaddedsuccess: "deviceaddedsuccess",
        deviceaddedfailed: "deviceaddedfailed",
        deleteAccountSuccess: "deleteAccountSuccess",
        deleteDeviceSuccess: "deleteDeviceSuccess",
        packageaddedsuccess: "packageaddedsuccess",
        retentionaddedsuccess: "retentionaddedsuccess"
    };
    var messages = {
        Errors: {
            CreateDeviceOnWrongAccount: Resources.Wrong_account_selected
        },
        UpdateSuccess: Resources.UpdateSuccess,
        UpdateFailed: Resources.UpdateFailed,
        CreateSuccessfull: Resources.CreateSuccessfull,
        CreateFailed: Resources.CreateFailed,
        CreateCustomerWithoutAccount: Resources.PlzSelectCustomer,
        CreateDeviceOnWrongAccount: Resources.Please_select_site,
        CannontCreateSiteonSite: Resources.Cannot_create_site_under_site,
        CannontCreateCustomeronSite: Resources.Cannot_create_Customer_under_site,
        CannotDeleteDefaultSite: Resources.CannotDeleteDefault,
        CannotCreateSiteUnder: Resources.CannotCreateSiteUnder,
        CannotCreateGroupUnder: Resources.CannotCreateGroupUnder,
        CannotCreateCustomerUnder: Resources.CannotCreateCustomerUnder,
        Successfully_deleted: Resources.Successfully_deleted,
        Delete_failed: Resources.Delete_failed,
        Downgrade: Resources.Downgrade,
        Activate: Resources.Activate,
        Activated: Resources.Activated,
        Approved: Resources.Approved,
        Select: Resources.Select,
        Selected: Resources.Selected,
        Upgrade: Resources.lbl_UpGrade,
        InActive: Resources.Status_InActive,
        Upgrade_Pending: Resources.Upgrade_Pending,
        Activate_Pending: Resources.Activate_Pending,
        RetentionDays_Updated: Resources.RetentionDays_Updated,
        Successfully_Associated: Resources.Successfully_Associated,
        Successfully_Activated: Resources.Successfully_Activated
    };
    return {
        constants: constants,
        events: events,
        messages: messages
    };
})();
(function ($) {
    //var onClass = "on";
    //var showClass = "show";
    //$("input[type=text],input[type=email],input[type=password],input[type=tel]").bind("checkval", function () {
    //    var label = $(this).prev("label");
    //    if (this.value !== "") {
    //        label.animate({ opacity: '1', 'margin-top': '4px' }, 300);
    //        label.addClass(showClass);
    //    } else {
    //        label.animate({ opacity: '0', 'margin-top': '24px' }, 300);
    //        label.removeClass(showClass);
    //    }
    //}).on("keyup", function () {
    //    $(this).trigger("checkval");
    //}).on("focus", function () {
    //    $(this).prev("label").addClass(onClass);
    //}).on("blur", function () {
    //    $(this).prev("label").removeClass(onClass);
    //}).trigger("checkval");
    var searchSubItemclick = "SEARCHSUBITEMCLICK", searchItemclick = "SEARCHITEMCLICK";


    $("#txtTreeviewSearch").Searchable({
        SuccessCallback: function (data) { },
        FailedCallback: function (ex) { },
        OnResultClick: function (data, event) {
            $.publish(searchItemclick, data);
        },
        OnNavigatetClick: function (data, event) {
            var searchId = $(event.target).attr("data-navId");
            var elementType = $(event.target).attr("data-EntityType");
            var hint = data.location;
            $.publish(searchSubItemclick, { Id: searchId, location: hint, EntityType: elementType });
        },
        templateName: 'searchresultTmpl'
    });
})($);