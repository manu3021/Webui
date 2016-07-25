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
        ADI_Requried: Resources.ADI_Requried,
        ADI_Minlength: Resources.ADI_Minlength,
        ADI_Maxlength: Resources.ADI_Maxlength,
        ADI_Invalid: Resources.ADI_Invalid
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
              user_EmailAddress: {
                  required: { depends: validteIfentered },
                  email: true
              },
              user_WorkPhone: {
                  required: { depends: validteIfentered },
                  phoneIndia: true
              },
              user_Phone: {
                  required: true,
                  phoneIndia: true
              },
              bpcsnumber: {
                  required: true,
                  minlength: 6,
                  maxlength: 8,
                  pattern: "^[a-zA-Z0-9]+$"
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
              bpcsnumber: {
                  required: ValidationMessages.ADI_Requried,
                  minlength: ValidationMessages.ADI_Minlength,
                  maxlength: ValidationMessages.ADI_Maxlength,
                  pattern: ValidationMessages.ADI_Invalid
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

