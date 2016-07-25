/// <reference path="mpcarecorder.common.js" />
/// <reference path="mpcarecorder.datacontext.js" />
/// <reference path="mpcarecorder.uicontext.js" />
/// <reference path="../jquery.validate.js" />
window.mpcarecorderconfig.validations = (function ($, validator) {
    var errorCssClass = "validationError";
    var ValidationMessages = {
        default_Max: Resources.default_Max,
        mpcarec_ipaddress_required: Resources.mpcarec_ipaddress_required,
        mpcarec_ipaddress_ipv4: Resources.mpcarec_ipaddress_ipv4,
        mpcarec_httpport_required: Resources.mpcarec_httpport_required,
        mpcarec_httpport_number: Resources.mpcarec_httpport_number,
        mpcarec_subnet_mask_required: Resources.mpcarec_subnet_mask_required,
        mpcarec_subnet_mask_ipv4: Resources.mpcarec_subnet_mask_ipv4,
        mpcarec_gateway_required: Resources.mpcarec_gateway_required,
        mpcarec_gateway_ipv4: Resources.mpcarec_gateway_ipv4,
        mpcarec_dnsip_required: Resources.mpcarec_dnsip_required,
        mpcarec_dnsip_ipv4: Resources.mpcarec_dnsip_ipv4,
        mpcarec_name_required: Resources.mpcarec_name_required,
        mpcarec_name_minlength: Resources.mpcarec_name_minlength,
        //mpcarec_password_required: Resources.mpcarec_password_required,
        //mpcarec_password_minlength: Resources.mpcarec_password_minlength,
        //mpcarec_mac_required: Resources.mpcarec_mac_required,
        //mpcarec_mac_minlength: Resources.mpcarec_mac_minlength,
        mpcarec_serverurl_required: Resources.mpcarec_serverurl_required,
        mpcarec_serverurl_url2: Resources.mpcarec_serverurl_url2,
        mpcarec_uniqueid_required: Resources.mpcarec_uniqueid_required,
        mpcarec_uniqueid_regex: Resources.mpcarec_uniqueid_characters,
        mpcarec_uniqueid_minlength: Resources.mpcarec_uniqueid_minlength,
        mpcarec_uniqueid_maxlength: Resources.mpcarec_uniqueid_maxlength
    };
    var configvalidation = {
        recorder: {
            rules: {
                mpcarec_ipaddress: {
                    required: validateIfObtainIPChecked,
                    ipv4: validateIfObtainIPChecked
                },
                mpcarec_httpport: {
                    required: true,
                    number: true
                },
                mpcarec_subnet_mask: {
                    required: validateIfObtainIPChecked,
                    ipv4: validateIfObtainIPChecked
                },
                mpcarec_gateway: {
                    required: validateIfObtainIPChecked,
                    ipv4: validateIfObtainIPChecked
                },
                mpcarec_dnsip: {
                    required: validateIfObtainIPChecked,
                    ipv4: validateIfObtainIPChecked
                },
                mpcarec_name: {
                    required: true,
                    minlength: 2,
                    maxlength: 20
                },
                //mpcarec_password: {
                //    required: true,
                //    minlength: 6,
                //    maxlength: 50
                //},
                //mpcarec_mac: {
                //    required: true,
                //    minlength: 12,
                //    maxlength: 12
                //},
                mpcarec_serverurl: {
                    required: validateIfMaxConnectChecked,
                    url2: validateIfMaxConnectChecked
                },
                mpcarec_uniqueid: {
                    required: true,
                    uniqueid: true,
                    minlength: 12,
                    maxlength: 30
                },
                mpcarec_notreg_uniqueid: {
                    required: true,
                    uniqueid: true,
                    minlength: 12,
                    maxlength: 30
                }
            },
            messages: {
                mpcarec_ipaddress: {
                    required: ValidationMessages.mpcarec_ipaddress_required,
                    ipv4: ValidationMessages.mpcarec_ipaddress_ipv4
                },
                mpcarec_httpport: {
                    required: ValidationMessages.mpcarec_httpport_required,
                    number: ValidationMessages.mpcarec_httpport_number
                },
                mpcarec_subnet_mask: {
                    required: ValidationMessages.mpcarec_subnet_mask_required,
                    ipv4: ValidationMessages.mpcarec_subnet_mask_ipv4
                },
                mpcarec_gateway: {
                    required: ValidationMessages.mpcarec_gateway_required,
                    ipv4: ValidationMessages.mpcarec_gateway_ipv4
                },
                mpcarec_dnsip: {
                    required: ValidationMessages.mpcarec_dnsip_required,
                    ipv4: ValidationMessages.mpcarec_dnsip_ipv4
                },
                mpcarec_name: {
                    required: ValidationMessages.mpcarec_name_required,
                    minlength: ValidationMessages.mpcarec_name_minlength,
                    maxlength: ValidationMessages.default_Max
                },
                //mpcarec_password: {
                //    required: ValidationMessages.mpcarec_password_required,
                //    minlength: ValidationMessages.mpcarec_password_minlength,
                //    maxlength: ValidationMessages.default_Max
                //},
                //mpcarec_mac: {
                //    required: ValidationMessages.mpcarec_mac_required,
                //    minlength: ValidationMessages.mpcarec_mac_minlength,
                //    maxlength: ValidationMessages.default_Max
                //},
                mpcarec_serverurl: {
                    required: ValidationMessages.mpcarec_serverurl_required,
                    url2: ValidationMessages.mpcarec_serverurl_url2
                },
                mpcarec_uniqueid: {
                    required: ValidationMessages.mpcarec_uniqueid_required,
                    uniqueid: ValidationMessages.mpcarec_uniqueid_regex,
                    minlength: ValidationMessages.mpcarec_uniqueid_minlength,
                    maxlength: ValidationMessages.mpcarec_uniqueid_maxlength
                },
                mpcarec_notreg_uniqueid: {
                    required: ValidationMessages.mpcarec_uniqueid_required,
                    uniqueid: ValidationMessages.mpcarec_uniqueid_regex,
                    minlength: ValidationMessages.mpcarec_uniqueid_minlength,
                    maxlength: ValidationMessages.mpcarec_uniqueid_maxlength
                }
            }
        }
    };

    function validateIfObtainIPChecked(element) {
        var isObtainIpChecked = $("#mpcarec_obtainautoip").checked;
        if (isObtainIpChecked != undefined)
            return !isObtainIpChecked;
        else
            return true;
    }
    function validateIfMaxConnectChecked(element) {
        var isMaxConnectChecked = $("#mpcarec_enablempcsettings").checked;
        if (isMaxConnectChecked != undefined)
            return isMaxConnectChecked;
        else
            return true;
    }
    return {
        configvalidation: configvalidation,
        errorCssClass: errorCssClass
    };
})(jQuery, jQuery.validator);

window.mpcarecorderconfig.validationcontext = (function ($, datacontext, validation) {
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
})(jQuery, window.mpcarecorderconfig.datacontext, window.mpcarecorderconfig.validations);
