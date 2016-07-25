/// <reference path="alarm-common.js" />
/// <reference path="alarm-datacontext.js" />
/// <reference path="alarm-uicontext.js" />
/// <reference path="../jquery.validate.js" />
window.alarmconfig.validations = (function ($, validator) {
    var validationMessages = {

    };
    var configvalidation = {

    };
    return {
        configvalidation: configvalidation
    }
})($, $.validator);

window.alarmconfig.validationcontext = (function ($, datacontext, validation) {
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
        var formeleSelector = "#" + formid;
        var dataValidationKey = $(formeleSelector).attr("data-validationkey");
        if (dataValidationKey == undefined || dataValidationKey == null) {
            console.error("data validation key is not present");
            return;
        }

        if (dataValidationKey in validation.doorValidations) {
            var formvalidation = validation.doorValidations[dataValidationKey];
            setdefaultvalidation(formeleSelector, formvalidation);
            form_Validators[formid] = $(formeleSelector).validate({
                onkeyup: function (element) { return $(element).valid(); },
                onfocusout: function (element) { return $(element).valid(); },
                rules: formvalidation.rules, messages: formvalidation.messages
            });
            form_Validators[formid].resetForm();
        }
    }
    function validateForm(formId) {
        var isValid = false,
            $form = $("#" + formId);

        if ($form.valid())
            isValid = true;
        else {
            form_Validators[formId].focusInvalid();
            isValid = false;
        }
        return isValid;
    }
    return {
        validateForm: validateForm,
        setvalidationfor: setvalidationfor
    };
})(jQuery, window.alarmconfig.datacontext, window.alarmconfig.validations);