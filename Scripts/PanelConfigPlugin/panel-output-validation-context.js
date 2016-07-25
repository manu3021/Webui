window.panelconfig.PanelOutputValidations = {
    rules: {
        output_Name: {
            required: true,
            maxlength: 30,
            netaxsrestriction: true
        },
        output_PulseTime: {
            hourRange: [0, 1],
            minuteRange: [0, 59],
            secondRange: [0, 59.9],
            mSecRange: [0, 9],
            maxSec: [0, 6359.9]
        }
    },
    messages: {
        output_Name: {
            required: Resources.Output_Name_Required,
            maxlength: Resources.Output_Name_Max,
            netaxsrestriction: Resources.NetAxsRestriction
        },
        output_PulseTime: {
            timeRequired: Resources.Input_PulseTime_Required,
            hourRange: Resources.Input_PulseTime_Hour_Range,
            minuteRange: Resources.Input_PulseTime_Min_Range,
            minutehrRange: Resources.Input_PulseTime_MinHr_Range,
            secondRange: Resources.Input_PulseTime_Sec_Range,
            mSecRange: Resources.Input_PulseTime_mSec_Range,
            maxSec: Resources.Input_PulseTime_MinHr_Range
        }
    }
};