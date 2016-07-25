window.calendarsearch.ClipExportValidations = {
    rules: {
        clipExport_Name: {
            required: true,
            maxlength: 32
        },
    },
    messages: {
        clipExport_Name: {
            required: Resources.Calendar_ExportClip_Name_Required,
            maxlength: Resources.Calendar_ExportClip_Name_MaxExceed
        },
    }
};