window.panelconfig.PanelInputValidations = {
    rules: {
        input_Name: {
            required: true,
            maxlength: 30,
            netaxsrestriction: true
        },
        input_DebounceTime: {
            required: true,
            range: [0, 6553.5]
        },
        input_ShuntTime: {
            hourRange: [0, 1],
            minuteRange: [0, 59],
            secondRange: [0, 59.9],
            mSecRange: [0, 9],
            maxSec: [0, 6359.9]
        }
    },
    messages: {
        input_Name: {
            required: Resources.Input_Name_Required,
            maxlength: Resources.default_Max,
            netaxsrestriction: Resources.NetAxsRestriction
        },
        input_DebounceTime: {
            min: Resources.Debounce_Time__Min,
            max: Resources.Debounce_Time_Max,
            decimalRange: Resources.Only_Single_Decimal_Point
        },
        input_ShuntTime: {
            timeRequired: Resources.Input_ShuntTime_Required,
            hourRange: Resources.Input_ShuntTime_Hour_Range,
            minuteRange: Resources.Input_ShuntTime_Min_Range,
            minutehrRange: Resources.Input_ShuntTime_MinHr_Range,
            secondRange: Resources.Input_ShuntTime_Sec_Range,
            mSecRange: Resources.Input_ShuntTime_mSec_Range,
            maxSec: Resources.Input_ShuntTime_MinHr_Range
        }
    }
};