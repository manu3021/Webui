/// <reference path="mpcacamera.common.js" />
/// <reference path="mpcacamera.datacontext.js" />
/// <reference path="mpcacamera.uicontext.js" />
/// <reference path="../jquery.validate.js" />

window.mpcacamerasetting.validations = (function ($, validator) {
    var errorCssClass = "validationError";
    var ValidationMessages = {
        default_Max: Resources.default_Max,
        mpcacameraname_required: Resources.mpcacameraname_required,
        mpcacameraname_minlength: Resources.mpcacameraname_minlength,
        mpcacameraname_maxlength: Resources.max_char_error.format("20"),
        mpcacamerartsp_required: Resources.mpcacamerartsp_required,
        mpcacamerausername_required: Resources.mpcacamerausername_required,
        mpcacamerausername_minlength: Resources.mpcacamerausername_minlength,
        mpcacamerapassword_required: Resources.mpcarec_password_required,
        mpcacamerapassword_minlength: Resources.mpcarec_password_minlength
    };
    var configvalidation = {
        Camera: {
            rules: {
                mpcacameraname: {
                    required: true,
                    minlength: 2,
                    maxlength: 20
                },
                mpcacamerartsp: {
                    required: true,
                    rtspurl: true
                },
                mpcacamerausername: {
                    required: true,
                    minlength: 2
                },
                mpcacamerapassword: {
                    required: true,
                    minlength: 2
                }
            },
            messages: {
                mpcacameraname: {
                    required: ValidationMessages.mpcacameraname_required,
                    minlength: ValidationMessages.mpcacameraname_minlength,
                    maxlength: ValidationMessages.mpcacameraname_maxlength
                },
                mpcacamerartsp: {
                    required: ValidationMessages.mpcacamerartsp_required,
                    rtspurl: ValidationMessages.mpcacamerartsp_required
                },
                mpcacamerausername: {
                    required: ValidationMessages.mpcacamerausername_required,
                    minlength: ValidationMessages.mpcacamerausername_minlength
                },
                mpcacamerapassword: {
                    required: ValidationMessages.mpcacamerapassword_required,
                    minlength: ValidationMessages.mpcacamerapassword_minlength
                }
            }
        }
    };

    return {
        configvalidation: configvalidation,
        errorCssClass: errorCssClass
    };
})(jQuery, jQuery.validator);

window.mpcacamerasetting.validationcontext = (function ($, datacontext, validation) {
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
})(jQuery, window.mpcacamerasetting.datacontext, window.mpcacamerasetting.validations);