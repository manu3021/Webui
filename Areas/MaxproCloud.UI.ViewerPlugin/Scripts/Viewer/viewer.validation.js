


window.viewerconfig.validations = (function ($, validator) {
    var errorCssClass = "validationError";
    var ValidationMessages = {
        default_Max: Resources.default_Max,
        salvo_Name_Required: Resources.Salvo_Required,
        salvo_Name_Min: Resources.Salvo_Min,
    };
    var salvovalidation = {
        salvoSaveContent1: {
            rules: {
                salvoname: {
                    required: true,
                    minlength: 2,
                    maxlength: 30,
                }
            },
            messages: {
                salvoname: {
                    required: ValidationMessages.salvo_Name_Required,
                    minlength: ValidationMessages.salvo_Name_Min,
                },
            }
        },

    };
    function validteIfentered(element) {
        return $(element).val().length > 0;
    }
    return {
        salvovalidation: salvovalidation,
        errorCssClass: errorCssClass
    };
})(jQuery, jQuery.validator);
window.viewerconfig.validationcontext = (function ($, validation) {
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
        if (dataValidationKey in validation.salvovalidation) {
            var formvalidation = validation.salvovalidation[dataValidationKey];
            //setdefaultvalidation(formeleSelector, formvalidation);
            form_Validators[formid] = $(formeleSelector).validate({
                onkeyup: function (element) { $(element).valid() },
                rules: formvalidation.rules, messages: formvalidation.messages,
                showErrors: function (errorMap, errorList) {
                    // Clean up any tooltips for valid elements
                    $.each(this.validElements(), function (index, element) {
                        var $element = $(element);
                        $element.data("title", "") // Clear the title - there is no error associated anymore
                            .removeClass("error invalidError")
                            .tooltip("destroy");
                    });
                    // Create new tooltips for invalid elements
                    $.each(errorList, function (index, error) {
                        var $element = $(error.element);
                        var errorTitle = 'Error! ';
                        var helpTitle = 'Help! ';
                        //var helpMessage = $element.data("help");
                        var helpMessage = 'This is General Help message ..........';
                        $element.tooltip("destroy") // Destroy any pre-existing tooltip so we can repopulate with new tooltip content
                            .data("title", error.message)
                            .addClass("error invalidError")
                            .tooltip({
                                title: function () { return '<div class="errormsg"><span class="errtitle">' + errorTitle + '</span><span class="err-message">' + error.message + '</span></div><div class="errHelp"><span class="errHelpTitle">' + helpTitle + '</span><span class="errHelpmsg">' + helpMessage + '</span></div>' },
                                placement: "bottom",
                                trigger: 'hover',
                                html: true,
                                show: false,
                                hide: false,
                                delay: 400
                            }).tooltip('hide'); // Create a new tooltip based on the error messsage we just set in the title
                    });
                }
            });
            if (isNew == null || isNew == undefined)
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
})(jQuery,window.viewerconfig.salvomanagement, window.viewerconfig.validations);