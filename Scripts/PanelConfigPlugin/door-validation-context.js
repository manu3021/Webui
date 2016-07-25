/// <reference path="door-common.js" />
/// <reference path="door-datacontext.js" />
/// <reference path="door-uicontext.js" />
/// <reference path="../jquery.validate.js" />
window.doorconfig.validations = (function ($, validator) {
    var validationMessages = {

        door_shunttime_required: Resources.Door_ShuntTime_Interval_Required,
        door_shunttime_min: Resources.door_shunttime_min_Interval_Required,
        door_shunttime_max: Resources.door_shunttime_min_Interval_Required,

        door_pulsetime_required: Resources.door_pulsetime_interval_required,
        door_pulsetime_min: Resources.door_pulsetime_min_interval_required,
        door_pulsetime_max: Resources.door_pulsetime_max_interval_required,

        door_name_required: Resources.door_name_required
    };
    var configvalidation = {
        door: {
            rules: {

                door_shunttime_a: {
                    hourRange: [0, 1],
                    minuteRange: [0, 59],
                    secondRange: [0, 59.9],
                    mSecRange: [0, 9],
                    maxSec: [0, 6359.9]
                },
                door_pulsetime_a: {
                    hourRange: [0, 1],
                    minuteRange: [0, 59],
                    secondRange: [0, 59.9],
                    mSecRange: [0, 9],
                    maxSec: [0, 6359.9]
                },
                door_shunttime_b: {
                    required: true,
                    min: 0,
                    max: 6359
                },
                door_pulsetime_b: {
                    required: true,
                    min: 0,
                    max: 6359
                },
                door_Name: {
                    required: true,
                    netaxsrestriction: true
                }
            },
            messages: {
                door_shunttime_a: {
                    timeRequired: Resources.Input_ShuntTime_Required,
                    hourRange: Resources.Input_ShuntTime_Hour_Range,
                    minuteRange: Resources.Input_ShuntTime_Min_Range,
                    minutehrRange: Resources.Input_ShuntTime_MinHr_Range,
                    secondRange: Resources.Input_ShuntTime_Sec_Range,
                    mSecRange: Resources.Input_ShuntTime_mSec_Range,
                    maxSec: Resources.Input_ShuntTime_MinHr_Range
                },
                door_pulsetime_a: {
                    timeRequired: Resources.Input_PulseTime_Required,
                    hourRange: Resources.Input_PulseTime_Hour_Range,
                    minuteRange: Resources.Input_PulseTime_Min_Range,
                    minutehrRange: Resources.Input_PulseTime_MinHr_Range,
                    secondRange: Resources.Input_PulseTime_Sec_Range,
                    mSecRange: Resources.Input_PulseTime_mSec_Range,
                    maxSec: Resources.Input_PulseTime_MinHr_Range
                },
                door_shunttime_b: {
                    required: validationMessages.door_shunttime_required,
                    min: validationMessages.door_shunttime_min,
                    max: validationMessages.door_shunttime_max
                },
                door_pulsetime_b: {
                    required: validationMessages.door_pulsetime_required,
                    min: validationMessages.door_pulsetime_min,
                    max: validationMessages.door_pulsetime_max
                },
                door_name: {
                    required: validationMessages.door_name_required,
                    netaxsrestriction: Resources.NetAxsRestriction
                }
            }
        }
    };

    return { configvalidation: configvalidation };
})(jQuery, jQuery.validator);


window.doorconfig.validationcontext = (function ($, datacontext, validation) {
    var form_Validators = {};
    function setdefaultvalidation(formSelector, formvalidation) {
        $(formSelector + " :input").each(function (index, ele) {
            var elementId = $(ele).attr("id");
            if (elementId in formvalidation.rules) {
                var elementRule = formvalidation.rules[elementId];
                if (elementRule.required) {
                    $(ele).attr("required", true);
                }
            }
        });
    }
    function setvalidationfor(formid, isNew) {
        window.globalvalidationcontext.setvalidationfor(formid, isNew, validation);
    }
    function validateForm(formId) {
        return window.globalvalidationcontext.validateForm(formId);
    }
    return {
        validateForm: validateForm,
        setvalidationfor: setvalidationfor
    };
})(jQuery, window.doorconfig.datacontext, window.doorconfig.validations);