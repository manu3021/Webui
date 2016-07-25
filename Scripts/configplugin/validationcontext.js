/// <reference path="common.js" />
/// <reference path="datacontext.js" />
/// <reference path="uicontext.js" />
/// <reference path="../jquery.validate.js" />

window.configuration = window.configuration || {};
window.configuration.validations = (function ($, validator) {
    var errorCssClass = "validationError";
    var ValidationMessages = {
        default_Max: Resources.More_Than_Thirty_Characters_Not_Allowed,
        site_Name_Required: Resources.site_Name_Required,
        site_Name_Min: Resources.customer_Name_Min,
        customer_Name_Required: Resources.customer_Name_Required,
        customer_Name_Min: Resources.customer_Name_Min,
        customer_Address_Required: Resources.customer_Address_Required,
        customer_Address_Min: Resources.customer_Address_Min,
        customer_Address_Max: Resources.More_Than_Sixty_Characters_Not_Allowed,
        customer_Region_Required: Resources.customer_Region_Required,
        customer_Region_Min: Resources.customer_Region_Min,
        customer_City_Required: Resources.customer_City_Required,
        customer_City_Min: Resources.customer_City_Min,
        customer_Country_Required: Resources.customer_Country_Required,
        customer_Country_Min: Resources.customer_Country_Min,
        customer_Phone_Required: Resources.customer_Phone_Required,
        customer_Phone_Phoneus: Resources.customer_Phone_Required,
        customer_Zipcode_Required: Resources.customer_Zipcode_Required,
        customer_Zipcode_Zipus: Resources.customer_Zipcode_Zipus,
        customer_Email_Required: Resources.customer_Email_Required,
        customer_Email_Email: Resources.customer_Email_Email,
        group_Name_required: Resources.group_Name_required,
        group_Name_min: Resources.group_Name_min,
        Unique_Key_Required: Resources.Unique_Key_Required,
        DeviceType_Required: Resources.DeviceType_Required,
        Unique_Key_Required_min: Resources.Unique_Key_Required_min,
        Only_Alpha: Resources.Only_Alpha,
        ADI_Requried: Resources.ADI_Requried,
        ADI_Minlength: Resources.ADI_Minlength,
        ADI_Maxlength: Resources.ADI_Maxlength,
        ADI_Invalid: Resources.ADI_Invalid
    };

    jQuery.validator.addMethod(
      "selectNone",
      function (value, element) {
          if (element.value == "Select Device..") {
              return false;
          }
          else return true;
      },
      "Please select a devicetype."
    );

    jQuery.validator.addMethod('allowOnlyAlpha', function (value, element, pattern) {
        if (value) {
            return pattern.test(value);
        }
        return true;
    });

    var configvalidation = {
        customer: {
            rules: {
                customer_Name: {
                    required: true,
                    minlength: 2,
                    maxlength: 30
                },
                customer_Address: {
                    required: true,
                    minlength: 2,
                    maxlength: 60
                },
                customer_Region: {
                    required: true,
                    minlength: 2,
                    maxlength: 30
                },
                customer_City: {
                    required: true,
                    minlength: 2,
                    maxlength: 30,
                    //allowOnlyAlpha: /^[a-zA-Z0-9-. ]*$/
                },
                customer_Phone: {
                    required: true,
                    phone: true

                },
                customer_Email: {
                    required: true,
                    genericemail: true
                },
                customer_Country: {
                    required: true,
                    minlength: 2,
                    maxlength: 30,
                    //allowOnlyAlpha: /^[a-zA-Z ]*$/
                },
                customer_ZipCode: {
                    required: true,
                    pattern: "^[a-zA-Z0-9 ]{3,10}$"
                },
                bpcsnumber: {
                    required: true,
                    minlength: 6,
                    maxlength: 8,
                    pattern: "^[a-zA-Z0-9]+$"
                }
            },
            messages: {
                customer_Name: {
                    required: ValidationMessages.customer_Name_Required,
                    minlength: ValidationMessages.customer_Name_Min,
                    maxlength: ValidationMessages.default_Max
                },
                customer_Address: {
                    required: ValidationMessages.customer_Address_Required,
                    minlength: ValidationMessages.customer_Address_Min,
                    maxlength: ValidationMessages.default_Max
                },
                customer_Region: {
                    required: ValidationMessages.customer_Region_Required,
                    minlength: ValidationMessages.customer_Region_Min,
                    maxlength: ValidationMessages.customer_Address_Max
                },
                customer_City: {
                    required: ValidationMessages.customer_City_Required,
                    minlength: ValidationMessages.customer_City_Min,
                    maxlength: ValidationMessages.default_Max,
                    allowOnlyAlpha: ValidationMessages.Only_Alpha
                },
                customer_Email: {
                    required: ValidationMessages.customer_Email_Required,
                    email: ValidationMessages.customer_Email_Email
                },
                customer_Country: {
                    required: ValidationMessages.customer_Country_Required,
                    minlength: ValidationMessages.customer_Country_Min,
                    maxlength: ValidationMessages.default_Max,
                    allowOnlyAlpha: ValidationMessages.Only_Alpha
                },
                customer_ZipCode: {
                    required: ValidationMessages.customer_Zipcode_Required,
                    pattern: ValidationMessages.customer_Zipcode_Zipus
                },
                customer_Phone: {
                    required: ValidationMessages.customer_Phone_Required,
                    phoneIndia: ValidationMessages.customer_Phone_Phoneus
                },
                bpcsnumber: {
                    required: ValidationMessages.ADI_Requried,
                    minlength: ValidationMessages.ADI_Minlength,
                    maxlength: ValidationMessages.ADI_Maxlength,
                    pattern: ValidationMessages.ADI_Invalid
                }
            }
        },
        site: {
            rules: {
                site_Name: {
                    required: true,
                    minlength: 2,
                    maxlength: 30
                },
                site_Address: {
                    required: true,// { depends: validteIfentered },
                    minlength: 2,
                    maxlength: 60
                },
                site_Region: {
                    required: true,
                    minlength: 2,
                    maxlength: 30
                },
                site_City: {
                    required: true,
                    minlength: 2,
                    maxlength: 30,
                    allowOnlyAlpha: /^[a-zA-Z0-9-. ]+$/
                },
                site_Phone: {
                    required: true,
                    phoneIndia: true

                },
                site_Email: {
                    required: true,
                    genericemail: true
                },
                site_Country: {
                    required: true,
                    minlength: 2,
                    maxlength: 30,
                    allowOnlyAlpha: /^[a-zA-Z ]+$/
                },
                site_ZipCode: {
                    required: true,
                    pattern: "^[a-zA-Z0-9 ]{3,10}$"
                }
            },
            messages: {
                site_Name: {
                    required: ValidationMessages.site_Name_Required,
                    minlength: ValidationMessages.site_Name_Min,
                    maxlength: ValidationMessages.default_Max
                },
                site_Address: {
                    required: ValidationMessages.customer_Address_Required,
                    minlength: ValidationMessages.customer_Address_Min,
                    maxlength: ValidationMessages.customer_Address_Max
                },
                site_Region: {
                    required: ValidationMessages.customer_Region_Required,
                    minlength: ValidationMessages.customer_Region_Min,
                    maxlength: ValidationMessages.default_Max
                },
                site_City: {
                    required: ValidationMessages.customer_City_Required,
                    minlength: ValidationMessages.customer_City_Min,
                    maxlength: ValidationMessages.default_Max,
                    allowOnlyAlpha: ValidationMessages.Only_Alpha
                },
                site_Email: {
                    required: ValidationMessages.customer_Email_Required,
                    email: ValidationMessages.customer_Email_Email
                },
                site_Country: {
                    required: ValidationMessages.customer_Country_Required,
                    minlength: ValidationMessages.customer_Country_Min,
                    maxlength: ValidationMessages.default_Max,
                    allowOnlyAlpha: ValidationMessages.Only_Alpha
                },
                site_ZipCode: {
                    required: ValidationMessages.customer_Zipcode_Required,
                    pattern: ValidationMessages.customer_Zipcode_Zipus,
                },
                site_Phone: {
                    required: ValidationMessages.customer_Phone_Required,
                    phoneIndia: ValidationMessages.customer_Phone_Phoneus
                }
            }
        },
        group: {
            rules: {
                group_Name: {
                    required: true,
                    minlength: 2,
                    maxlength: 30
                }
            },
            messages: {
                group_Name: {
                    required: ValidationMessages.group_Name_required,
                    minlength: ValidationMessages.group_Name_min,
                    maxlength: ValidationMessages.default_Max
                }
            }
        },

        device: {
            rules: {
                unique_key: {
                    required: true,
                    minlength: 12,
                    maxlength: 20
                },
                device_type: {
                    selectNone: true

                },
                messages: {
                    unique_key: {
                        required: ValidationMessages.Unique_Key_Required,
                        minlength: ValidationMessages.Unique_Key_Required_min
                    },
                    device_type: {
                        required: ValidationMessages.DeviceType_Required
                    }
                }
            }
        }
    };
    function validateforZipcode(element) {
        if ($(element).val().length > 0) {
            return isNaN(parseInt($(element).val()));
        }
    }
    function validteIfentered(element) {
        return $(element).val().length > 0;
    }
    return {
        configvalidation: configvalidation,
        errorCssClass: errorCssClass
    };
})(jQuery, jQuery.validator);
window.configuration.validationcontext = (function ($, datacontext, validation) {

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
})(jQuery, window.configuration.datacontext, window.configuration.validations);
