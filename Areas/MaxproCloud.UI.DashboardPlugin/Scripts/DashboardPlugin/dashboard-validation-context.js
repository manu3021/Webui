window.dashboardconfig.DashboardValidations = {
    rules: {
        dashboard_Name: {
            required: true,
            minlength: 6,
            maxlength: 60
        },
        dashboard_Description: {
            required: true,
            maxlength: 120
        }
    },
    messages: {
        dashboard_Name: {
            required: Resources.cannot_empty,
            minlength: Resources.cannot_less_than_6_chars,
            maxlength: Resources.default_Max
        },
        dashboard_Description: {
            required: Resources.cannot_empty,
            maxlength: Resources.default_Max
        }
    }
};