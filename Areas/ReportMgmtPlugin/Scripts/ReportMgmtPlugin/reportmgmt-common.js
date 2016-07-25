window.reportmgmt = window.reportmgmt || {};

window.reportmgmt.common = (function () {
    Resources = Resources || {};
    var events = {
        report_treeview_expanded: 'reporttreeviewexpanded',
        application_page_changed: 'applicationpagechanged'
    };

    var dataTypeEnum = {
        None            : 0,
        Int             : 1,
        DateTime        : 2,
        String          : 3,
        Bit             : 4,
        SystemEntity    : 5
    }

    var sortOrderEnum = {
        Asc: 0,
        Desc: 1,
        None:2
    }

    var messages = {
        report_save_success: Resources.Report_Save_Success,
        report_save_failed: Resources.Report_Save_Failed,
        error_on_server: Resources.Server_Error
    }

    var constants = {
        Reports: 'reports',
        allowedTypes: ['SITE']
    }

    var siteevents = {

        add_entity_error: 'addentityerror'
    }

    return {
        events: events,
        dataTypes: dataTypeEnum,
        sortOrder: sortOrderEnum,
        messages: messages,
        siteevents: siteevents,
        constants: constants
    };
})();