/// <reference path="mpcastorage.common.js" />
/// <reference path="mpcastorage.datacontext.js" />
/// <reference path="mpcastorage.uicontext.js" />
/// <reference path="../jquery.validate.js" />
window.mpcastorageconfig.validations = (function ($, validator) {
    var errorCssClass = "validationError";
    var ValidationMessages = {
        default_Max: Resources.default_Max,
        mpcastrg_NasPath_required: Resources.mpcastrg_pls_ent_naspth,
        mpcastrg_Vendor_required: Resources.mpcastrg_pls_ent_vndr
    };
    var configvalidation = {
        storage: {
            rules: {
                mpcastrg_NasPath: {
                    required: true
                },
                mpcastrg_Vendor: {
                    required: true
                }
            },
            messages: {
                mpcastrg_NasPath: {
                    required: ValidationMessages.mpcastrg_NasPath_required
                },
                mpcastrg_Vendor: {
                    required: ValidationMessages.mpcastrg_Vendor_required
                }
            }
        }
    };

    function validateIfNASChecked(element) {
        var isNASChecked = $("#mpcastrg_chknasstng").checked;
        if (isNASChecked != undefined)
            return isNASChecked;
        else
            return false;
    }

    return {
        configvalidation: configvalidation,
        errorCssClass: errorCssClass
    };
})(jQuery, jQuery.validator);

window.mpcastorageconfig.validationcontext = (function ($, datacontext, validation) {
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
})(jQuery, window.mpcastorageconfig.datacontext, window.mpcastorageconfig.validations);
