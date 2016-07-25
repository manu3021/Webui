



window.reportmgmt.validations = (function ($, validator) {
    
    var ValidationMessages = {
        default_Max: Resources.default_Max,
        Report_Name_Required: Resources.Report_Name_Required,
        Report_Name_Min: Resources.Report_Name_Min,
      },

  configvalidation = {
      report_form: {
          rules: {
              Report_Name: {
                  required: true,
                  minlength: 6,
                  maxlength: 60
              }
              

          },
          messages: {
              Report_Name: {
                  required: ValidationMessages.Report_Name_Required,
                  minlength: ValidationMessages.Report_Name_Min,
                  maxlength: ValidationMessages.default_Max
              }

          }
      }

  };
    function validteIfentered(element) {
        return $(element).val().length > 0;
    }
    return {
        configvalidation: configvalidation
    };
})(jQuery, jQuery.validator);

window.reportmgmt.validationcontext = (function ($, datacontext, validation) {
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
})(jQuery, window.reportmgmt.datacontext, window.reportmgmt.validations);