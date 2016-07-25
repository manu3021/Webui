window.accesspersona = {
    constants: {
        credentialHoldersEntity: 'credentialholders',
        accessPersonaEntity: 'accesspersona'
    },
    events: {
        accesspersona_giveaccess_clicked: 'giveaccessselected',
        credential_holder_list_refresh: 'accesspersonacredentialholderlistrefresh',
        schedule_list_refresh: 'accesspersonaschedulelistrefresh',
        accesspersona_list_refresh: 'accesspersonalistrefresh',
        hide_access_persona_view: 'hideaccesspersonaview',
        accesspersona_credential_holder_selected: 'accesspersonacredentialholderselected',
        update_access_persona_for_credential_holder: 'updateaccesspersonaforcredentialholder',
        show_access_persona_save_view: 'showaccesspersonasaveview',
        show_access_persona_config_view: 'showaccesspersonaconfigview',
        credential_holder_selection_count: 'credentialholderselectioncount',
        show_hide_access_persona_activation_expiration: 'showhideaccesspersonaactivationexpiration',
        system_access_persona_selected: 'systemaccesspersonaselected',
        handle_system_access_persona_selection: 'handlesystemaccesspersonaselection',
        access_persona_saved: 'accesspersonasaved',
        credential_holder_selection_changed: 'credentialholderselectionchanged',
        hide_delete_accesspersona_cofirm: 'accesspersonaconfirm',
        accesspersona_deleted: 'accesspersonadeleted',
        accesspersona_delete_confirmed: 'accesspersonaconfirmdelete',
        accesspersona_confirm_delete: 'accesspersonaconfirmdelete',
        accesspersona_flow_mode_changed: 'accesspersonaflowmodechanged',
        credential_holders_flow_change: 'credentialholdersflowchange',
        accesspersona_confirm_dissociate: 'accesspersonaconfirmdissociate',
        accesspersona_dissociate_confirmed: 'accesspersonadissociateconfirmed',
        accesspersona_dissociate_status: 'accesspersonadissociatestatus',
        show_delete_accesspersona_cofirm: 'showdeleteaccesspersonacofirm'
    },
    messages: {
        error_on_server: Resources.Server_Error,
        access_persona_save_success: Resources.Access_Persona_Save_Success,
        access_persona_save_fail: Resources.Access_Persona_Save_Failed,
        accesspersona_confirm_delete: Resources.Access_Persona_Delete_Confirm,
        accesspersona_delete_success: Resources.Access_Persona_Delete_Success,
        accesspersona_confirm_dissociate: Resources.Access_Persona_Dissociate_Confirm,
        accesspersona_dissociate_success: Resources.Access_Persona_Dissociate_Success,
        accesspersona_dissociate_failed: Resources.Access_Persona_Dissociate_Failed,
        accesspersona_door_schedule_various: Resources.Access_Persona_Door_Schedule_Various
    }
};