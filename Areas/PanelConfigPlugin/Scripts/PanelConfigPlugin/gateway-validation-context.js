/// <reference path="gateway-common.js" />
/// <reference path="gateway-datacontext.js" />
/// <reference path="gateway-uicontext.js" />
/// <reference path="../jquery.validate.js" />
window.gatewayconfig.validations = (function ($, validator) {
    var validationMessages = {
        default_Max: Resources.default_Max,
        panel_Name_Required: Resources.panel_Name_Required,
        panel_Description_Required: Resources.Panel_Description_Required,
        panel_IPAddress_Required: Resources.Panel_IPAddress_Required,
        panel_IPAddress_Regex: Resources.panel_IPAddress_Regex,
        panel_Port_Required: Resources.Panel_Port_Required,
        panel_Port_Min: Resources.Panel_Port_Min,
        panel_Port_Max: Resources.Panel_Port_Max,
        panel_Address_Required: Resources.Panel_Address_Required,
        panel_Address_Min: Resources.Panel_Address_Min,
        panel_Address_Max: Resources.Panel_Address_Max,
        panel_IOPollInterval_Required: Resources.Panel_IOPollInveral_Required,
        panel_IOPollInterval_Min: Resources.Panel_IOPollInterval_Min,
        panel_IOPollInterval_Max: Resources.Panel_IOPollInterval_Max,
        panel_LoopVerifyInterval_Required: Resources.Panel_LoopVerifyInterval_Required,
        panel_LoopVerifyInterval_Min: Resources.Panel_LoopVerifyInterval_Min,
        panel_LoopVerifyInterval_Max: Resources.Panel_LoopVerifyInterval_Max,
        panel_CmdRetryCount_Required: Resources.Panel_CmdRetryCount_Required,
        panel_CmdRetryCount_Min: Resources.Panel_CmdRetryCount_Min,
        panel_CmdRetryCount_Max: Resources.Panel_CmdRetryCount_Max,
        panel_CmdTimeout_Required: Resources.Panel_CmdTimeout_Required,
        panel_CmdTimeout_Min: Resources.Panel_CmdTimeout_Min,
        panel_CmdTimeout_Max: Resources.Panel_CmdTimeout_Max
    };
    var configvalidation = {
        panel: {
            rules: {
                panel_Name: {
                    required: true,
                    maxlength: 20,
                    netaxsrestriction: true
                },
                panel_Description: {
                    required: true,
                    maxlength: 60,
                    netaxsrestriction: true
                },
                panel_IPAddress: {
                    required: '#panel_IPAddress:visible',
                    regex: '^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3,5}$'
                },
                panel_Port: {
                    required: '#panel_Port:visible',
                    min: 5001,
                    max: 65535
                },
                panel_Address: {
                    required: true,
                    min: 1,
                    max: 32
                },
                panel_IOPollInterval: {
                    required: true,
                    min: 10,
                    max: 600
                },
                panel_LoopVerifyInterval: {
                    required: true,
                    min: 10,
                    max: 255
                },
                panel_CmdRetryCount: {
                    required: true,
                    min: 0,
                    max: 5
                },
                panel_CmdTimeout: {
                    required: true,
                    min: 0,
                    max: 30
                },
                gateway_notreg_uniqueid: {
                    required: true,
                    minlength: 12,
                    maxlength: 20,
                    regexUniquekey:"^[A-Z0-9]+$"
                }
            },
            messages: {
                panel_Name: {
                    required: Resources.Panel_Name_Required,
                    maxlength: Resources.default_Max,
                    netaxsrestriction: Resources.NetAxsRestriction
                },
                panel_Description: {
                    required: Resources.Panel_Description_Required,
                    maxlength: Resources.default_Max,
                    netaxsrestriction: Resources.NetAxsRestriction
                },
                panel_IPAddress: {
                    required: Resources.Panel_IPAddress_Required,
                    regex: Resources.Panel_IPAddress_Invalid
                },
                panel_Port: {
                    required: Resources.Panel_Port_Required,
                    min: Resources.Panel_Port_Min,
                    max: Resources.Panel_Port_Max
                },
                panel_Address: {
                    required: Resources.Panel_Address_Required,
                    min: Resources.Panel_Address_Min,
                    max: Resources.Panel_Address_Max
                },
                panel_IOPollInterval: {
                    required: Resources.Panel_IOPollInveral_Required,
                    min: Resources.Panel_IOPollInterval_Min,
                    max: Resources.Panel_IOPollInterval_Max
                },
                panel_LoopVerifyInterval: {
                    required: Resources.Panel_LoopVerifyInterval_Required,
                    min: Resources.Panel_LoopVerifyInterval_Min,
                    max: Resources.Panel_LoopVerifyInterval_Max
                },
                panel_CmdRetryCount: {
                    required: Resources.Panel_CmdRetryCount_Required,
                    min: Resources.Panel_CmdRetryCount_Min,
                    max: Resources.Panel_CmdRetryCount_Max
                },
                panel_CmdTimeout: {
                    required: Resources.Panel_CmdTimeout_Required,
                    min: Resources.Panel_CmdTimeout_Min,
                    max: Resources.Panel_CmdTimeout_Max
                },
                gateway_notreg_uniqueid: {
                    required: Resources.Unique_Key_Required,
                    minlength: Resources.Unique_Key_Required_min,
                    maxllength: Resources.MAX_SIZE_LIMIT_EXCEEDED,
                    regex:Resources.Panel_Uniquekey_Invalid
                }
            }
        }
    };

    return { configvalidation: configvalidation };
})(jQuery, jQuery.validator);


window.gatewayconfig.validationcontext = (function ($, datacontext, validation) {
    var form_Validators = {};

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
})(jQuery, window.gatewayconfig.datacontext, window.gatewayconfig.validations);

$.validator.addMethod('regexUniquekey', function (value, element, pattern) {
    if (value) {
        pattern = new RegExp(pattern);
        return pattern.test(value);
    }
    return true;
}, Resources.Panel_UniqueKey_Invalid);