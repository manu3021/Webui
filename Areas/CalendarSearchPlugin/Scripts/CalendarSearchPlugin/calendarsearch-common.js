window.calendarsearch = {
    constants: {
        Calendar: 'Calendar',
        Camera: 'Camera'
    },
    events: {
        footer_menuitem_clicked: 'footermenuitemclicked',
        play_clip_requested: 'playcliprequested',
        close_clip_requested: 'closecliprequested',
        application_page_changed: 'applicationpagechanged',
        close_Treeview_Popover: 'hidetreeviewpopover',
        clip_export_show: 'clipexportshow',
        clip_export_close: 'clipexportclose',
        clip_data_recieved: 'clipdatarecieved',
        event_action_performed: 'eventaction'
    },
    messages: {
        event_action_success: Resources.Calendar_Action_Performed_Successfully,
        event_action_failed: Resources.Calendar_Action_Performed_Failed
    },
    clipReportTypeEnum: {
        DAY: 0,
        HOUR: 1
    },
    alarmReportTypeEnum: {
        DAY: 0,
        HOUR: 1
    },
    calendarEventType: {
        Event: 1,
        Clip: 2
    },
    dateTimeFormat: {
        LongDateTime: Resources.datetimeformat,
        Start: 'YYYY-MM-DD 00:00:00Z',
        End: 'YYYY-MM-DD 23:59:59Z',
        ShortDateStart: 'YYYY-MM-DD 00:00:00'
    },
    accountEntityTypes: {
        Site: 'SITE',
        Customer: 'CUSTOMER',
        General: 'GENERAL',
        Root: 'ROOT',
        Dealer: 'DEALER',
        Group: 'GROUP'
    },
    deviceEntityTypes: {
        Camera: 'CAMERA',
        Door: 'DOOR'
    },
    clipStatusEnum: {
        None: 0,
        Requesting: 1,
        LoadFailed: 2,
        LoadSuccessful: 3
    }
};