window.dashboardconfig = {
    constants: {
        trendXDays: { NINETY: 90, SIXTY: 60, THIRTY: 30, NOW: 1 },
        allowedTypes: ['SITE'],
        statusOrder: { 'ONLINE': 1, 'OFFLINE': 0 ,'Site':2},
        statusOrderText: { 'ONLINE': Resources.EventCode_5035, 'OFFLINE': Resources.EventCode_5036, 'Site': Resources.Site },
        statusColor: { 'ONLINE': '#3BAD49', 'OFFLINE': '#939393' }
    },
    events: {
        dashboard_footer_menu_clicked: 'footermenuitemclick',
        dashboard_socket_open: 'onopen',
        dashboard_socket_close: 'onclose',
        dashboard_system_event_received: 'systemeventreceived',
        dashboard_push_alarm_count: 'pushalarmcount',
        dashboard_start_config: 'dasboardstartconfig',
        dashboard_close_config: 'dashboardcloseconfig',
        dashboard_delete_confirm: 'ondashboarddeleteconfirm',
        dashboard_delete_confirmed: 'ondashboarddeleteconfirmed',
        dashboard_deleted: 'ondashboarddeleted',
        dashboard_saved: 'dashboard_saved',
        dashboard_refresh: 'dashboardrefresh',
        add_entity_error: 'addentityerror',
        dashboard_load_next: 'loadnextdashboard',
        dashboard_load_bypage: 'loadbypagedashboard',
        dashboard_load_previous: 'loadpreviousdashboard',
        dashboard_treeview_expanded: 'dashboardtreeviewexpanded',
        dashboard_show_preview: 'dashboardshowpreview',
        dashboard_close_preview: 'dashboardclosepreview'
    },
    messages: {
        dashboard_do_you_want_to_cancel: Resources.do_you_want_to_cancel,
        dashboard_save_success: Resources.Dashboard_Save_Success,
        dashboard_save_failed: Resources.Dashboard_Save_Fail,
        dashboard_delete_confirm: Resources.Dasboard_Delete_Confirm,
        dashboard_deleted_success: Resources.Dashboard_Delete_Success,
        dashboard_deleted_failed: Resources.Dashboard_Delete_Fail,
        error_on_server: Resources.Server_Error
    }
};