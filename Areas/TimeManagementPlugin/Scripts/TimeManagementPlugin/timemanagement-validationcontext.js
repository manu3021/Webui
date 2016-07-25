window.timemanagement.HolidayValidations = {
    rules: {
        holidayName: {
            required: true,
            netaxsrestriction: true
        },
        date: {
            required: true
        }
    },
    messages: {
        holidayName: {
            required: Resources.Holiday_Name_Required,
            netaxsrestriction: Resources.NetAxsRestriction
        },
        date: {
            required: Resources.Holiday_Date_Required
        }
    }
};

window.timemanagement.ScheduleValidations = {
    rules: {
        schedule_Name: {
            required: true,
            minlength: 3,
            maxlength: 30,
            netaxsrestriction: true
        },
        schedule_Description: {
            maxlength: 100,
            netaxsrestriction: true
            
        }
    },
    messages: {
        schedule_Name: {
            required: Resources.Schedule_Name_Required,
            minlength: Resources.Schedule_Name_Minlength,
            maxlength: Resources.default_Max,
            netaxsrestriction: Resources.NetAxsRestriction
            
        },
        schedule_Description: {
            maxlength: Resources.default_Max,
            netaxsrestriction: Resources.NetAxsRestriction
        }
    }
};