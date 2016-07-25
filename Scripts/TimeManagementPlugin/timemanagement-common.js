window.timemanagement = {
    constants: {
        scheduleEntity: 'schedules',
        holidayEntity: 'holiday',
        pluginRegion: 'time'
    },
    events: {
        treeview_item_selected: 'treeviewitemselected',

        holiday_show_config: 'holidayshowconfig',
        holiday_saved: 'holidaysaved',
        holiday_cancelled: 'holidaycancelled',
        holiday_list_refresh: 'holidaylistrefresh',
        holiday_confirm_delete: 'holidayconfirmdelete',
        holiday_delete_confirmed: 'holidaydeleteconfirmed',
        holiday_deleted: 'holidaydeleted',
        
        schedule_show_config: 'scheduleshowconfig',
        schedule_saved: 'schedulesaved',
        schedule_cancelled: 'schedulecancelled',
        schedule_list_refresh: 'schedulelistrefresh',
        schedule_confirm_delete: 'scheduleconfirmdelete',
        schedule_delete_confirmed: 'scheduleconfirmdelete',
        schedule_deleted: 'scheduledeleted'
    },
    messages: {
        holiday_save_success: Resources.Holiday_Create_Success,
        holiday_save_fail: Resources.Holiday_Save_Failed,
        holiday_delete_select: Resources.Holiday_Delete_Select,
        holiday_delete_confirm: Resources.Holiday_Delete_Confirm,
        holiday_delete_success: Resources.Holiday_Delete_Success,
        holiday_delete_fail: Resources.Holiday_Delete_Failed,
        
        schedule_save_success: Resources.Schedule_Save_Success,
        schedule_save_fail: Resources.Timezone_Save_Failed,
        schedule_delete_select: Resources.Schedule_Delete_Select,
        schedule_delete_confirm: Resources.Schedule_Delete_Confirm,
        schedule_delete_all_associate_confirm: Resources.Schedule_Delete_All_Associate_Confirm_Msg1 + '<br/>' + Resources.Schedule_Delete_All_Associate_Confirm_Msg2,

        schedule_delete_partial_associate_confirm: Resources.Schedule_Delete_Partial_Associate_Confirm_Msg1 + '<br/>' + Resources.Schedule_Delete_Partial_Associate_Confirm_Msg2,
        schedule_delete_success: Resources.Schedule_Delete_Success,
        schedule_delete_fail: Resources.Schedule_Delete_Failed,

        error_on_server: Resources.Server_Error,
    }
};