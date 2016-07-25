/// <reference path="user.common.js" />
/// <reference path="user.uicontext.js" />
/// <reference path="../Resources.js" />
/// <reference path="userconfig.datacontext.js" />
window.userconfig.validations = (function ($, validator) {
    //  console.log("USER Validation " + " ++++++++++ " + user_Password[0].readOnly);

    var ValidationMessages = {
        default_Max: Resources.default_Max,
        user_UserName_Required: Resources.user_Name_Required,
        user_UserName_Min: Resources.user_Name_Min,
        user_FirstName_Required: Resources.user_FirstName_Required,
        user_FirstName_Min: Resources.user_FirstName_Min,
        user_LastName_Required: Resources.user_LastName_Required,
        user_LastName_Min: Resources.user_LastName_Min,
        user_Password_Required: Resources.user_Password_Required,
        user_Password_Min: Resources.user_Password_Min,
        user_Region_Required: Resources.user_Region_Required,
        user_Region_Min: Resources.user_Region_Min,
        user_City_Required: Resources.user_City_Required,
        user_City_Min: Resources.user_City_Min,
        user_Country_Required: Resources.user_Country_Required,
        user_Country_Min: Resources.user_Country_Min,
        user_Phone_Required: Resources.user_Phone_Required,
        user_Phone_Phoneus: Resources.user_Phone_Phoneus,
        user_Zipcode_Required: Resources.user_Zipcode_Required,
        user_Zipcode_Zipus: Resources.user_Zipcode_Zipus,
        user_Email_Required: Resources.user_Email_Required,
        user_Email_Email: Resources.user_Email_Email,
        user_PasswordStrength: Resources.user_PasswordStrength,
        user_Address_Min: Resources.user_Address_Min,
        user_Address_Required:Resources.user_Address_Required
    },

  configvalidation = {
      user_form: {
          rules: {
              user_UserName: {
                  required: function () { return $('#user_UserName').is('[readonly]') },
                  minlength: 2,
                  maxlength: 128,
                  email: true
              },
              user_FirstName: {
                  required: true,
                  minlength: 3,
                  maxlength: 30
              },
              user_LastName: {
                  required: true,
                  minlength: 3,
                  maxlength: 30
              },
              user_Password: {
                  required: true,
                  minlength: 8,
                  maxlength: 30,
                  passwordstrength: function () { return $('#user_Password').is('[readonly]') }

              },
              new_Password: {
                  required: true,
                  minlength: 8,
                  maxlength: 30,
                  passwordstrength: function () { return $('#new_Password').is('[readonly]') }

              },
              user_EmailAddress: {
                  required: { depends: validteIfentered },
                  email: true
              },user_Phone: {
                  required: true,
                  phone: true
              },
              user_WorkPhone: {
                  required: { depends: validteIfentered },
                  phone: true
              },
              user_Address: {
                  required:true,
                  minlength: 2,
                  maxlength:60
              },
              user_City: {
                  required: true,
                  minlength: 2,
                  maxlength: 30
              },
              user_State: {
                  required: true,
                  minlength: 2,
                  maxlength: 30
              },
              user_Country: {
                  required: true,
                  minlength: 2,
                  maxlength: 30
              }

          },
          messages: {
              user_UserName: {
                  required: ValidationMessages.user_Email_Required,
                  minlength: ValidationMessages.user_UserName_Min,
                  email: ValidationMessages.user_Email_Email,
                  maxlength: ValidationMessages.default_Max
              },
              user_FirstName: {
                  required: ValidationMessages.user_FirstName_Required,
                  minlength: ValidationMessages.user_FirstName_Min,
                  maxlength: ValidationMessages.default_Max
              },
              user_LastName: {
                  required: ValidationMessages.user_LastName_Required,
                  minlength: ValidationMessages.user_LastName_Min,
                  maxlength: ValidationMessages.default_Max
              },
              user_Password: {
                  required: ValidationMessages.user_Password_Required,
                  minlength: ValidationMessages.user_Password_Min,
                  passwordstrength: ValidationMessages.user_PasswordStrength
              },
              new_Password: {
                  required: ValidationMessages.user_Password_Required,
                  minlength: ValidationMessages.user_Password_Min,
                  passwordstrength: ValidationMessages.user_PasswordStrength
              },
              user_EmailAddress: {
                  reqifentered: ValidationMessages.user_Email_Required,
                  email: ValidationMessages.user_Email_Email
              },
              user_Phone: {
                  required: ValidationMessages.user_Phone_Required,
                  minlength: ValidationMessages.user_Phone_Phoneus

              },
              user_WorkPhone: {
                  reqifentered: ValidationMessages.user_Phone_Required,
                  zipcodeUS: ValidationMessages.user_Phone_Phoneus
              },
              user_Address: {
                  required: ValidationMessages.user_Address_Required,
                  minlength: ValidationMessages.user_Address_Min,
                  maxlength: ValidationMessages.default_Max
              },
              user_City: {
                  required: ValidationMessages.user_City_Required,
                  minlength: ValidationMessages.user_City_Min,
                  maxlength: ValidationMessages.default_Max
              },
              user_State: {
                  required: ValidationMessages.user_Region_Required,
                  minlength: ValidationMessages.user_Region_Min,
                  maxlength: ValidationMessages.default_Max
              },
              user_Country: {
                  required: ValidationMessages.user_Country_Required,
                  minlength: ValidationMessages.user_Country_Min,
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

window.userconfig.validationcontext = (function ($, datacontext, validation) {
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
            //TO  DO validation for dropdowns
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
})(jQuery, window.userconfig.datacontext, window.userconfig.validations);

