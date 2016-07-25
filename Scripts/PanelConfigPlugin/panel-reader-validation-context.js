window.panelconfig.PanelReaderValidations = {
    rules: {
        reader_Name: {
            required: true,
            maxlength: 30,
            netaxsrestriction: true
        }
    },
    messages: {
        reader_Name: {
            required: Resources.Reader_Name_Required,
            maxlength: Resources.default_Max,
            netaxsrestriction: Resources.NetAxsRestriction
        }
    }
};