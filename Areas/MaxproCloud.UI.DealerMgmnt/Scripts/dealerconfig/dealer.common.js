window.userconfig = window.userconfig || {};

window.userconfig.common = (function ($, ko) {
    var events = {
        treeItemSelectedEvent: "treeviewitemselected",
        onuserselectedevent: "onuserselectedevent",
        newuseradded: "newuseradded",
        userupdated: "userupdated",
        deleteusersuccess: "deleteusersuccess",
        deleteAccountSuccess: "deleteAccountSuccess"
    },
        messages = {
            usercreate_success: Resources.Operator_created_successfully,
            userupdate_success: Resources.Operator_updated_successfully,
            usersave_failed: Resources.Failed_save_operator,
            error_onserver: Resources.General_error,
            error_phototype: Resources.PhotoType_error,
            error_photosize: Resources.PhotoSize_error,
            usernotallowedhere: Resources.MESSAGE_CANNOT_CREATE_USER
        };
    var commonData = {
        supportedRoles: []
    };
    var baseUrl = $(".userconfigcontainer").attr("data-url");
    geturlforaction = function (actionPath) {
        return baseUrl + "/" + actionPath;
    }
    return {
        geturlforaction: geturlforaction,
        events: events,
        messages: messages,
        commonData: commonData
    }
})(jQuery, ko);