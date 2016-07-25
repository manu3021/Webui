window.globalvalidationcontext = (function ($) {
    var form_Validators = {};

    $.fn.resetForm = function () {
        var self = this;
        if (self && self.length > 0 && self[0] && self[0].elements) {
            $.each(self[0].elements, function (index, element) {
                var $element = $(element);
                $element.data("title", "") // Clear the title - there is no error associated anymore
                    .removeClass("error invalidError")
                    .tooltip("destroy");
            });
        }
    }

    function setvalidationfor(formid, isNew, validation) {
        var formeleSelector = "#" + formid;
        var dataValidationKey = $(formeleSelector).attr("data-validationkey");
        if (dataValidationKey == undefined || dataValidationKey == null) {
            console.error("data validation key is not present");
            return;
        }
        if (dataValidationKey in validation.configvalidation) {
            var formvalidation = validation.configvalidation[dataValidationKey];
            //setdefaultvalidation(formeleSelector, formvalidation);
            form_Validators[formid] = $(formeleSelector).validate({
                onfocusout: function (element, event) {
                    $(element).valid();
                },
                //onclick: function (element, event) {
                //    $(element).valid();
                //},
                rules: formvalidation.rules, messages: formvalidation.messages,
                showErrors: function (errorMap, errorList) {
                    $(this.currentForm).find(".tooltip").remove();

                    //cleanup all errors if it is disabled
                    $.each(this.currentForm, function (index, element) {
                        if (element.disabled) {
                            var $element = $(element);
                            $element.data("title", "") // Clear the title - there is no error associated anymore
                                .removeClass("error invalidError")
                                .tooltip("destroy");
                        }
                    });
                    // Clean up any tooltips for valid elements
                    $.each(this.validElements(), function (index, element) {
                        var $element = $(element);
                        $element.data("title", "") // Clear the title - there is no error associated anymore
                            .removeClass("error invalidError")
                            .tooltip("destroy");
                    });
                    // Create new tooltips for invalid elements
                    $.each(errorList, function (index, error) {
                        var errorTitle = Resources.Error_title;// 'Error! ';
                        var helpTitle = Resources.Help_title;// 'Help! ';
                        var $element = $(error.element);
                        //var helpMessage = $element.data("help");
                        var helpMessage = 'This is General Help message ..........';
                        $element.tooltip("destroy") // Destroy any pre-existing tooltip so we can repopulate with new tooltip content
                            .data("title", error.message)
                            .addClass("error invalidError")
                            .tooltip({
                                title: function () { return '<div class="errormsg"><span class="errtitle">' + errorTitle + '</span><span class="err-message">' + error.message + '</span></div>'},
                                    //<div class="errHelp"><span class="errHelpTitle">' + helpTitle + '</span><span class="errHelpmsg">' + helpMessage + '</span></div>' },
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
            //if (isNew == null || isNew == undefined)
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
})(jQuery);

