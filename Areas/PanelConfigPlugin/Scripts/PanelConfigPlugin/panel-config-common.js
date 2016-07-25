window.panelconfig = {
    events: {
        treeview_item_selected: 'treeviewitemselected',
        gateway_saved: 'panelsaved',
        panel_output_saved: 'paneloutputsaved',
        panel_output_saved_offline: 'paneloutputsavedoffline',
        panel_output_remove: 'paneloutputremove',
        panel_output_removed: 'paneloutputremoved',
        show_panel_output_remove_confirm: 'showoutputremoveconfirm',
        panel_input_saved: 'panelinputsaved',
        panel_input_saved_offline: 'panelinputsavedoffline',
        panel_input_remove: 'panelinputremove',
        panel_input_removed: 'panelinputremoved',
        show_panel_input_remove_confirm: 'showinputremoveconfirm',
        panel_reader_saved: 'panelreadersaved',
        panel_reader_saved_offline: 'panelreadersavedoffline'
    },
    messages: {
        gateway_save_success: Resources.Panel_Save_Success,
        panel_output_save_success: Resources.Output_Save_Success,
        panel_output_save_failed: Resources.Output_Save_failed,
        panel_output_remove_success: Resources.Output_Remove_Success,
        panel_output_remove_confirm: Resources.Output_Remove_Confirm,
        panel_input_save_success: Resources.Input_Save_Success,
        panel_input_save_failed: Resources.Input_Save_failed,
        panel_input_remove_success: Resources.Input_Remove_Success,
        panel_input_remove_confirm: Resources.Input_Remove_Confirm,
        panel_reader_save_success: Resources.Reader_Save_Success,
        panel_reader_save_failed: Resources.Reader_Save_failed,
        panel_status_offline: Resources.Panel_status_offline,
        devoffline_cnfgdwnOnOnl: Resources.Panel_status_offline
    },
    constants: {
        gatewayEntity: 'gateway',
        outputEntity: 'outputpoint',
        inputEntity: 'inputpoint',
        deviceEntity: 'devicepoint',
        READER: 'reader',
        online: 'online'
    },
    interlockaction: {
        output:
            [
                { Name: Resources.Interlock_NoAction, Value: 'NOACTION' },
                { Name: Resources.Interlock_Energize, Value: 'ENERGIZE' },
                { Name: Resources.Interlock_DeEnergize, Value: 'DEENERGIZE' },
                { Name: Resources.Interlock_Pulse, Value: 'PULSE' },
                { Name: Resources.Interlock_PulseOff, Value: 'PULSEOFF' },
                { Name: Resources.Interlock_Follow, Value: 'FOLLOW' },
                { Name: Resources.Interlock_InvertFollow, Value: 'INVERTFOLLOW' }
            ],
        input:
            [
                { Name: Resources.Interlock_NoAction, Value: 'NOACTION' },
                { Name: Resources.Interlock_Shunt, Value: 'SHUNT' },
                { Name: Resources.Interlock_UnShunt, Value: 'UNSHUNT' },
                { Name: Resources.Interlock_TimedShunt, Value: 'TIMEDSHUNT' },
                { Name: Resources.Interlock_Follow, Value: 'FOLLOW' },
                { Name: Resources.Interlock_InvertFollow, Value: 'INVERTFOLLOW' }
            ]
    }
};