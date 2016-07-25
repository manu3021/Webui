/// <reference path="Resources.js" />
/// <reference path="jquery.js" />
window.maxprocloudlogin = window.maxprocloudlogin || {};
window.maxprocloudlogin.validations = (function ($, validator) {
    var errorCssClass = "validationError";
    var ValidationMessages = {
        default_Max: Resources.default_Max,
        org_Name_Required: Resources.Organization_Name_Required,
        org_Name_Min: Resources.Organization_Name_Min,
        Address_Required: Resources.customer_Address_Required,
        Address_Min: Resources.customer_Address_Min,
        Phone_Required: Resources.customer_Phone_Required,
        Phone_Phoneus: Resources.customer_Phone_Required,
        Phone_PhoneIN: Resources.customer_Phone_Required,
        Phone_Min: Resources.customer_Address_Min,
        Email_Required: Resources.customer_Email_Required,
        Email: Resources.customer_Email_Email,
        FirstName_Required: Resources.user_FirstName_Required,
        FirstName_Min: Resources.user_FirstName_Min,
        LastName_Required: Resources.user_LastName_Required,
        LastName_Min: Resources.user_LastName_Min,
        Password_Required: Resources.user_Password_Required,
        Password_Min: Resources.user_Password_Min,
        user_PasswordStrength: Resources.user_PasswordStrength,
        Region_Required: Resources.Region_Required,
        Region_Min: Resources.Region_Min,
        Country_Required: Resources.Country_Required,
        Country_Min: Resources.Country_Min,
        City_Required: Resources.City_Required,
        City_Min: Resources.City_Min,
        ZipCode_Required: Resources.ZipCode_Required,
        ZipCode_Min: Resources.ZipCode_Min,
        customer_Zipcode_Zipus: Resources.customer_Zipcode_Zipus,
        ADI_Minlength: Resources.ADI_Minlength,
        ADI_Maxlength: Resources.ADI_Maxlength,
        ADI_Invalid: Resources.ADI_Invalid,
        ADI_Requried: Resources.ADI_Requried
    };
    var configvalidation = {
        register: {
            rules: {
                Organizationname: {
                    required: true,
                    minlength: 2,
                    maxlength: 30
                },
                inputCompanyaddr: {
                    required: true,
                    minlength: 2,
                    maxlength: 60
                },
                inputFirstname: {
                    required: true,
                    minlength: 2,
                    maxlength: 30
                },
                inputLastname: {
                    required: true,
                    minlength: 2,
                    maxlength: 30
                },
                inputPassword: {
                    required: true,
                    minlength: 8,
                    maxlength: 30,
                    passwordstrength: true
                },
                inputEmail: {
                    required: true,
                    genericemail: true
                },
                inputMobile: {
                    required: true,
                    phone: true
                },
                inputFAP: {
                    required: false
                },
                inputADI: {
                    required: true,
                    minlength: 6,
                    maxlength: 8,
                    pattern: "^[a-zA-Z0-9]+$"
                },
                inputRegion: {
                    required: true,
                    minlength: 2,
                    maxlength: 30
                },
                inputCountry: {
                    required: true,
                    minlength: 2,
                    maxlength: 30
                },
                inputCity: {
                    required: true,
                    minlength: 2,
                    maxlength: 30
                },
                inputZipCode: {
                    required: true,
                    pattern: "^[a-zA-Z0-9 ]{3,10}$"
                }
            },
            messages: {
                Organizationname: {
                    required: ValidationMessages.org_Name_Required,
                    minlength: ValidationMessages.org_Name_Min,
                    maxlength: ValidationMessages.default_Max
                },
                inputCompanyaddr: {
                    required: ValidationMessages.Address_Required,
                    minlength: ValidationMessages.Address_Min,
                    maxlength: ValidationMessages.default_Max
                },
                inputFirstname: {
                    required: ValidationMessages.FirstName_Required,
                    minlength: ValidationMessages.FirstName_Min,
                    maxlength: ValidationMessages.default_Max
                },
                inputLastname: {
                    required: ValidationMessages.LastName_Required,
                    minlength: ValidationMessages.LastName_Min,
                    maxlength: ValidationMessages.default_Max
                },
                inputPassword: {
                    required: ValidationMessages.Password_Required,
                    minlength: ValidationMessages.Password_Min,
                    passwordstrength: ValidationMessages.user_PasswordStrength
                },
                inputEmail: {
                    required: ValidationMessages.Email_Required,
                    email: ValidationMessages.Email
                },
                inputMobile: {
                    required: ValidationMessages.Phone_Required,
                    phone: ValidationMessages.Phone_PhoneIN,
                    minlength: ValidationMessages.Phone_Min
                },
                inputFAP: {


                },
                inputADI: {
                    required: ValidationMessages.ADI_Requried,
                    minlength: ValidationMessages.ADI_Minlength,
                    maxlength: ValidationMessages.ADI_Maxlength,
                    pattern: ValidationMessages.ADI_Invalid
                },
                inputRegion: {
                    required: ValidationMessages.Region_Required,
                    minlength: ValidationMessages.Region_Min,
                    maxlength: ValidationMessages.default_Max
                },
                inputCountry: {
                    required: ValidationMessages.Country_Required,
                    minlength: ValidationMessages.Country_Min,
                    maxlength: ValidationMessages.default_Max
                },
                inputCity: {
                    required: ValidationMessages.City_Required,
                    minlength: ValidationMessages.City_Min,
                    maxlength: ValidationMessages.default_Max
                },
                inputZipCode: {
                    required: ValidationMessages.ZipCode_Required,
                    pattern: ValidationMessages.customer_Zipcode_Zipus
                }
            }
        },

        passwordChange: {
            rules: {

                password: {
                    required: true,
                    minlength: 8,
                    maxlength: 30,
                    passwordstrength: true
                }

            },
            messages: {

                password: {
                    required: ValidationMessages.Password_Required,
                    minlength: ValidationMessages.Password_Min,
                    passwordstrength: ValidationMessages.user_PasswordStrength
                }

            }
        }
        ,
        resetLinkForm: {
            rules: {

                txtFName: {
                    required: true,
                    email: true
                }

            },
            messages: {

                txtFName: {
                    required: ValidationMessages.Email_Required,
                    email: ValidationMessages.Email
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
window.maxprocloudlogin.validationcontext = (function ($, validation) {
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
        window.globalvalidationcontext.setvalidationfor(formid, isNew, validation);
    }
    function validateForm(formId) {
        return window.globalvalidationcontext.validateForm(formId);
    }
    return {
        validateForm: validateForm,
        setvalidationfor: setvalidationfor
    };
})(jQuery, window.maxprocloudlogin.validations);
window.maxprocloudlogin.datacontext = (function ($) {

    var datacontext = {
        signinuser: signinuser,
        registeruser: registeruser,
        resetlinkuser: resetlinkuser,
        changepassword: changepassword,
        changelang: changelang

    };
    return datacontext;

    function signinuser(loginmodel) {
        //showLoading();              
        return ajaxRequest("POST", getloginurl(), loginmodel);
    }
    function resetlinkuser(datamodel) {
        return ajaxRequest("POST", getreseturl(), datamodel);
    }
    function changepassword(datamodel) {
        return ajaxRequest("POST", getrecoveryurl(), datamodel);
    }
    function registeruser(datamodel) {
        return ajaxRequest("POST", getregisterurl(), datamodel);
    }
    function changelang(language) {        
        data = ({ language: language });
        return ajaxRequest("POST", getlangchangeurl(), data, null);
    }

    function ajaxRequest(type, url, data, dataType) { // Ajax helper
        data = data || {};
        data.toJson = data.toJson || function () { return ko.toJSON(data); }
        var options = {
            dataType: dataType || "json",
            contentType: "application/json",
            cache: false,
            type: type,
            data: data ? data.toJson() : null
        };
        var antiForgeryToken = $(".antiForgeryTokenLogin").val();
        if (antiForgeryToken) {
            options.headers = {
                'RequestVerificationToken': antiForgeryToken
            }
        }
        return $.ajax(url, options);
    }
    function getloginurl() {
        var $form = $("#loginform");
        return $form.attr('action');
    }
    function getregisterurl() {
        var $form = $("#signupForm");
        return $form.attr('action');
    }
    function getlangchangeurl(lang) {
        var url = $("#language").attr('data-url');//+ "?language=" + lang;
        return url;
    }
    function getreseturl() {
        var $form = $("#resetLinkForm");
        return $form.attr('action');
    }
    function getrecoveryurl() {
        var $form = $("#recoveryForm");
        return $form.attr('action');
    }
})($);
(function ($, document, datacontext, validationcontext) {
    $(document).ready(function () {
        // Gets the validation UI element
        var getValidationSummaryErrors = function ($form) {
            var errorSummary = $form.find('.validation-summary-errors, .validation-summary-valid');
            return errorSummary;
        };

        // Display error on validation UI element
        var displayErrors = function (form, errors) {
            var errorSummary = $(".error-msg");
            errorSummary.html("");
            if (errors.length <= 0)
                errorSummary.hide();
            else
                errorSummary.html($.map(errors, function (error) { return error; })).show();
            $(".error").removeClass("error invalidError").tooltip("destroy");
            $('#inputPassword').attr('type', 'password');
            $('#password').attr('type', 'password');
        };

        //Validation for login details
        function ValidateLoginDetails(username, password, bVlidateCaptcha) {
            var result = true;
            var errors = [];

            if (username == undefined || username == "") {
                result = false;
                errors.push(Resources.user_Name_Required);
            }
            if (password == undefined || password == "") {
                result = false;
                errors.push(Resources.user_Password_Required);
            }
            if (bVlidateCaptcha) {
                if (window.captchaSupported != undefined && window.captchaSupported) {
                    if (checkCaptcha(window.loginCaptcha) == '') {
                        errors.push(Resources.Captcha_Blank);
                        result = false;
                    }
                }

            }
            displayErrors($("#loginform"), errors);
            return result;
        }

        // Sign in user to application
        function SigninUser(datamodel, callback) {
            var $form = $("#loginform");
            displayErrors(null, "");
            // We check if jQuery.validator exists on the form
            if (!$form.valid || $form.valid()) {
                datacontext.signinuser(datamodel).done(function (json) {
                    json = json || {};
                    // In case of success, we redirect to the provided URL or the same page.
                    if (json.error) {
                        var errors = [];
                        errors.push(json.error);
                        displayErrors($form, errors);
                    }
                    callback(json);
                }).error(function () {
                    displayErrors($form, [Resources.General_error]);
                    unblockUI();
                });
            }
        }
        // Sign in user to application
        function RegisterUser(datamodel, callback) {
            var $form = $("#signupForm");
            displayErrors(null, "");
            // We check if jQuery.validator exists on the form
            if (!$form.valid || $form.valid()) {
                datacontext.registeruser(datamodel).done(function (json) {
                    json = json || {};
                    // In case of success, we redirect to the provided URL or the same page.
                    if (json.error) {
                        var errors = [];
                        errors.push(json.error);
                        displayErrors($form, errors);
                    }
                    if (callback != undefined || callback != null)
                        callback(json);
                }).error(function () {
                    displayErrors($form, [Resources.General_error]);
                    unblockUI();
                });
            }
        }
        // request to send link to application
        function ResetLink(datamodel, callback) {
            var $form = $("#resetLinkForm");
            displayErrors(null, "");
            // We check if jQuery.validator exists on the form
            if (!$form.valid || $form.valid()) {
                datacontext.resetlinkuser(datamodel).done(function (json) {
                    json = json || {};
                    // In case of success, we redirect to the provided URL or the same page.
                    if (json.error) {
                        var errors = [];
                        errors.push(json.error);
                        displayErrors($form, errors);
                    }
                    if (callback != undefined || callback != null)
                        callback(json);
                }).error(function () {
                    displayErrors($form, [Resources.General_error]);
                    unblockUI();
                });
            }
        }
        // request to send link to application
        function Recovery(datamodel, callback) {
            var $form = $("#recoveryForm");
            displayErrors(null, "");
            // We check if jQuery.validator exists on the form
            if (!$form.valid || $form.valid()) {
                datacontext.changepassword(datamodel).done(function (json) {
                    json = json || {};
                    // In case of success, we redirect to the provided URL or the same page.
                    if (json.error) {
                        var errors = [];
                        errors.push(json.error);
                        displayErrors($form, errors);
                    }
                    if (callback != undefined || callback != null)
                        callback(json);
                }).error(function () {
                    displayErrors($form, [Resources.General_error]);
                });
            }
        }

        //request for zipcode 

        function hideAll() {
            displayErrors(null, "");
            $('#forgotpassword').hide();
            $('#register').hide();
            $('#login').hide();
        }
        window.showLogin = function () {
            location.href = window.rootUrl;
        }
        // Knocout login view model for login page
        var LoginViewModel = function () {
            var self = this;
            self.bVlidateCaptcha = ko.observable(false);;
            self.UserName = ko.observable("");
            self.Password = ko.observable("");
            self.RememberMe = ko.observable(false);
            self.signinbutton = ko.computed(function () {
                if (self.UserName() == "" || self.Password() == "")
                    return true;
                return false;
            });
            self.clear = function () {
                self.Username("User name");
                self.Password("p2k4l5l6l7l8l9l0");
            }

            self.DoLogin = function () {               
                var $form = $("#loginform");
                if (!$form.valid || $form.valid()) {

                    if (ValidateLoginDetails(self.UserName(), self.Password(), self.bVlidateCaptcha())) {
                        blockUI();
                        SigninUser(this, function (jsonResult) {
                            var prevCulture = $.cookie("_culture");
                            // hide loading animation once recieve the result
                            if (jsonResult.success) {
                                $.cookie("_culture", jsonResult.culture);                                
                                window.location = jsonResult.redirect || location.href;
                                if (prevCulture != jsonResult.culture)
                                    location.reload();
                            }
                            else {
                                if (window.captchaSupported != undefined && window.captchaSupported) {
                                    self.bVlidateCaptcha(true);
                                }
                                var errors = [];
                                errors.push(jsonResult.error);
                                displayErrors($form, errors);
                                unblockUI();
                            }
                        });

                    }
                    else {
                        unblockUI();
                    }
                }
            }

            self.showRegister = function () {
                hideAll()
                validationcontext.setvalidationfor('signupForm');
                $('#signupForm')[0].reset();
                $('#signin').show();
                $('#signin-complete').hide();
                $('#register').show();
                $('#signupForm').css("maxWidth", "625px");
                $('.mapassistregister').hide();
                $('#signupForm #inputCity').removeAttr('placeholder');
            }
            self.showReset = function () {
                hideAll();
                $('#resetLinkForm')[0].reset();
                $('#forgotpassword').show();
                $('#generatelink').show();
                $('#mailsent').hide();
            }
            self.toJson = function () { return ko.toJSON(this) };
        };

        var addressresult = function (data) {
            var self = this;
            data = data || {};
            self.Address = ko.observable(data.formatted_address);
            self.objdata = data;
        }
        var RegisterViewModel = function () {
            var self = this;
            self.OrganizationName = ko.observable("");
            self.UserName = ko.observable("");
            self.Password = ko.observable("");
            self.FirstName = ko.observable("");
            self.Lastname = ko.observable("");
            self.Address = ko.observable("");
            self.Phone = ko.observable("");
            self.ADI_Number = ko.observable("");
            self.FAB_Number = ko.observable("");
            self.Email = ko.observable("");
            self.Password = ko.observable("");
            self.Region = ko.observable("");
            self.Country = ko.observable("");
            self.City = ko.observable("");
            self.Zipcode = ko.observable("");
            self.LocationInfo = ko.observable("0,0");
            self.IsSILVER = ko.observable("");//SILVER
            self.IsGOLD = ko.observable("");
            self.IsPLATINUM = ko.observable("");
            self.Branding = ko.observable("");
            self.Logo = ko.observable("");
            self.resolvedResults = ko.observableArray([]);
            self.isMapInitialised = false;
            self.bNeedToResolve = false;
            //    {
            //    Lattitude: ko.observable(""),
            //    Longitude: ko.observable("")
            //};
            self.updatelocation = function (data) {
                self.LocationInfo(data);
                RegisterUser(self,
                      function (jsonResult) {
                          if (jsonResult.success) {
                              console.log("Registration success");
                              // alertify.success(Resources.Registration_Success_mail_sent);
                              $('#signin').hide();
                              $('#signin-complete').show();
                          }
                          else {
                              console.log("Registration Failed");
                              //  alertify.alert(Resources.Registration_Failed);
                          }
                      })
            }
            self.DoRegister = function () {

                self.FAB_Number = ko.observable(self.IsSILVER() + "," + self.IsGOLD() + "," + self.IsPLATINUM());
                var $form = $("#signupForm");
                if (validationcontext.validateForm('signupForm')) {
                    blockUI();
                    //  getlocation(self.Zipcode(), self.updatelocation);
                    //-----------------------
                    try {
                        if (self.bNeedToResolve) {
                            self.resolvegeolocation(true, function () {
                                self.finalSave();
                            }, function () {
                                //try with zipcode
                                self.resolvegeolocation(false, function () {
                                    self.finalSave()
                                }, function () {
                                    //failed with both mode, let us warn and proceed if needed
                                    alertify.confirm(Resources.Login_FacingDifficultyinSaving, function (e) {
                                        if (e) {
                                            self.finalSave()
                                        }
                                        else {
                                            unblockUI();
                                        }
                                    });
                                })

                            });
                        }
                        else {
                            self.finalSave();
                        }

                    } catch (e) {
                        alertify.confirm(Resources.Login_FacingDifficultyinSaving, function (e) {
                            if (e) {
                                self.finalSave()
                            } else {
                                unblockUI();
                            }
                        });
                    }
                    //------------------------
                }
            }

            self.showLogin = function () {
                hideAll();
                $('#login').show();
            }

            self.AddressForGeolocation = ko.computed(function () {
                return self.OrganizationName() + "+" + self.Address() + "+" + self.City() + "+" + self.Region() + "+" + self.Country();
            })
            self.resolvegeolocation = function (bAddressMode, OnSuccess, onFail) {
                var type = bAddressMode ? 'address' : 'zipcode';
                var param = bAddressMode ? self.AddressForGeolocation() : self.Zipcode();
                var token = $(".antiForgeryTokenLogin").val();
                getGoogleurl(type, param, token).done(function (result) {
                    var data = result.Url ? JSON.parse(result.Url) : "";
                    if (data && data.results != undefined && data.results[0] != undefined) {
                        var latlong = '';

                        if (typeof (data.results[0].geometry.location.lat) === 'function') {
                            latlong = data.results[0].geometry.location.lat() + "," + data.results[0].geometry.location.lng();
                        }
                        else {
                            latlong = data.results[0].geometry.location.lat + "," + data.results[0].geometry.location.lng;
                        }
                        self.LocationInfo(latlong);
                        if (OnSuccess)
                            OnSuccess(data)
                    }
                    else {
                        if (onFail)
                            onFail();
                    }
                }).fail(function () {
                    if (onFail)
                        onFail();
                });
            }
            self.finalSave = function () {
                //call register here 
                console.log(" city field value :" + $('#signupForm').find('#inputCity').val())
                console.log(" city model value:" + self.City());
                if (!self.City()) {
                    if ($('#signupForm').find('#inputCity').val()) {
                        self.City($('#signupForm').find('#inputCity').val());
                    }
                }
                RegisterUser(self,
                      function (jsonResult) {
                          if (jsonResult.success) {
                              console.log("Registration success");
                              // alertify.success(Resources.Registration_Success_mail_sent);
                              $('#signin').hide();
                              $('#signin-complete').show();
                              $('#signupForm').css("maxWidth", "624px");
                              unblockUI();
                          }
                          else {
                              console.log("Registration Failed");
                              //  alertify.alert(Resources.Registration_Failed);
                              unblockUI();
                          }
                      });
                self.resizemodel();
                self.hidemap();
            }
            self.dosavesettings = function (event, data) {
                if (window.configuration.uicontext.validateform(self.EntityType, true)) {
                    try {
                        if (self.bNeedToResolve) {
                            self.resolvegeolocation(true, function () {
                                self.finalSave();
                            }, function () {
                                //try with zipcode
                                self.resolvegeolocation(false, function () {
                                    self.finalSave()
                                }, function () {
                                    //failed with both mode, let us warn and proceed if needed
                                    alertify.confirm(Resources.Login_FacingDifficultyinSaving, function (e) {
                                        if (e) {
                                            self.finalSave()
                                        }
                                    });
                                })

                            });
                        }
                        else {
                            self.finalSave();
                        }
                    } catch (e) {
                        alertify.confirm(Resources.Login_FacingDifficultyinSaving, function (e) {
                            if (e) {
                                self.finalSave()
                            }
                        });
                    }

                }
            }
            self.toJson = function () {
                return ko.toJSON(self);
            }
            self.resizemodel = function () {
                $('#signupForm').css("maxWidth", "625px");
            }
            self.getMapId = function () {
                return document.getElementById('newregmap');
            }
            self.showmap = function () {
                $(self.getMapId()).show();
                $('.mapCloseIcon').show();
                $('.mapDoneIcon').show();
                $('.mapShowIcon').hide();
                $('.addresscontainer').height(260);
                $('.primary-button').hide();
                $('.secondary-button').hide();
                $('.signin-done').show();

            }
            self.hidemap = function (data, even) {
                $(self.getMapId()).hide();
                $('.mapCloseIcon').hide();
                $('.mapDoneIcon').hide();
                $('.mapShowIcon').show();
                $('.addresscontainer').height(205);
                $('.primary-button').show();
                $('.secondary-button').show();
                $('.signin-done').hide();
                $('.mapassistregister').width(0);
                if (data != null)
                    self.done();
            }
            self.getmapobj = function () {
                return window.mpcregcontext.map;
            }
            self.setmap = function (mapobj) {
                window.mpcregcontext = window.mpcregcontext || {};
                window.mpcregcontext.map = mapobj;
                google.maps.event.addListener(self.getmapobj(), 'click', function (event) {
                    self.removeallmarkers();
                    self.resolvedResults.removeAll();
                    self.placemarkerdragabale(event.latLng);
                });

            }
            self.done = function () {
                self.extractaddress();
                self.hidemap();
            }
            self.isParsing = false;
            self.onAutoComplete = function (data, el) {
                el.val(data.City);
                //self.City(data.City);
                //self.Region(data.Region);
                //self.Country(data.Country);
            }
            self.removeallmarkers = function () {
                window.mpcregcontext = window.mpcregcontext || {};
                if (window.mpcregcontext.markers == undefined)
                    window.mpcregcontext.markers = [];
                for (var i = 0; i < window.mpcregcontext.markers.length; i++) {
                    window.mpcregcontext.markers[i].setMap(null);
                }
            }
            self.geocodePosition = function (pos, callback) {
                self.geocoder.geocode({
                    latLng: pos
                }, function (responses) {
                    if (responses && responses.length > 0) {
                        if (callback) callback(responses)
                    }
                });
            }
            self.placemarkerdragabale = function (location) {

                var marker = new google.maps.Marker({
                    position: location,
                    draggable: true,
                    map: self.getmapobj()
                });
                window.mpcregcontext = window.mpcregcontext || {};
                if (window.mpcregcontext.markers == undefined)
                    window.mpcregcontext.markers = [];
                window.mpcregcontext.markers.push(marker);
                google.maps.event.addListener(marker, 'dragend', function () {
                    self.geocodePosition(marker.getPosition(), function (result) {
                        var data = {};
                        data.results = result;
                        self.addToResolvedList(data, false);
                        //self.resolvedaddressclick(result);
                    });
                });
                var current_bounds = self.getmapobj().getBounds();
                var marker_pos = marker.getPosition();
                if (current_bounds != undefined) {
                    if (!current_bounds.contains(marker_pos)) {

                        var new_bounds = current_bounds.extend(marker_pos);
                        self.getmapobj().fitBounds(new_bounds);
                    }
                }
            }
            self.placeMarker = function (location) {
                var marker = new google.maps.Marker({
                    position: location,
                    map: self.getmapobj()
                });
                window.mpcregcontext = window.mpcregcontext || {};
                if (window.mpcregcontext.markers == undefined)
                    window.mpcregcontext.markers = [];
                window.mpcregcontext.markers.push(marker);
                var current_bounds = self.getmapobj().getBounds();
                var marker_pos = marker.getPosition();

                if (current_bounds != undefined) {
                    if (!current_bounds.contains(marker_pos)) {

                        var new_bounds = current_bounds.extend(marker_pos);
                        self.getmapobj().fitBounds(new_bounds);
                    }
                }
            }
            self.cancelmapassist = function () {
                self.bNeedToResolve = true;
                self.hidemap();
            }
            self.selectedAddressObj = ko.observable();
            self.extractaddress = function () {
                if (self.selectedAddressObj() != null) {
                    var data = self.selectedAddressObj();
                    var addressline1 = '';
                    var state = '';
                    var city = '';
                    var Country = '';
                    var zipcode = '';


                    // iterate through address_component array
                    $.each(data.objdata.address_components, function (i, address_component) {


                        if (address_component.types[0] == "locality" || address_component.types[0] == 'sublocality') {
                            city = city + ' ' + address_component.long_name;
                        }
                        if (address_component.types[0] == "administrative_area_level_1" || address_component.types[0] == 'administrative_area_level_2') {
                            state = state + ' ' + address_component.long_name;
                        }

                        if (address_component.types[0] == "country") {
                            Country = address_component.long_name;
                        }

                        if (address_component.types[0] == "postal_code") {
                            zipcode = address_component.long_name;
                        }

                        if (address_component.types[0] == "street_number" || address_component.types[0] == "street_address" || address_component.types[0] == "route" || address_component.types[0] == 'intersection' || address_component.types[0] == 'political') {
                            addressline1 = addressline1 + ' ' + address_component.long_name;
                        }
                    });
                    var fullladdress = data.objdata.formatted_address;
                    fullladdress = fullladdress.substr(0, fullladdress.indexOf(city) - 1);
                    addressline1 = addressline1.length > 0 ? addressline1 : fullladdress;
                    self.isParsing = true;
                    self.Address(addressline1);
                    self.City(city);
                    self.Region(state);
                    self.Country(Country);
                    self.Zipcode(zipcode);
                    var latlong = '';
                    if (typeof (data.objdata.geometry.location.lat) === 'function') {
                        latlong = data.objdata.geometry.location.lat() + "," + data.objdata.geometry.location.lng();
                    }
                    else {
                        latlong = data.objdata.geometry.location.lat + "," + data.objdata.geometry.location.lng;
                    }
                    self.LocationInfo(latlong);
                    self.isParsing = false;
                    self.bNeedToResolve = false;

                }
            }
            self.resolvedaddressclick = function (clickdata, event) {
                self.selectedAddressObj(clickdata);

                $('.mapassistregister').width(900);
                $('.mapShowIcon').hide();
                $('.addresscontainer').height(260);
                self.removeallmarkers();
                if (self.isMapInitialised) {
                    self.getmapobj().setCenter(clickdata.objdata.geometry.location)
                    self.placemarkerdragabale(clickdata.objdata.geometry.location)
                }
                else {
                    window.googleMaps().init(function (data) {
                        self.setmap(data);
                        self.isMapInitialised = true;
                        self.getmapobj().setCenter(clickdata.objdata.geometry.location);
                        self.placemarkerdragabale(clickdata.objdata.geometry.location);
                        self.geocoder = new google.maps.Geocoder();

                    }, self.getMapId());
                    // self.getmapobj().setZoom(10);
                }

                self.showmap();

            }
            self.addToResolvedList = function (data, bAddmarker) {
                $.each(data.results, function (key, result) {
                    self.resolvedResults.push(new addressresult(result));
                    //if (bAddmarker)
                    //    self.placeMarker(result.geometry.location);
                })
            }


            self.resolveaddressbymap = function () {
                if (self.isParsing) return;
                self.resolvegeolocation(true, function (data) {
                    if (data.status == "OK") {
                        $('.mapShowIcon').show();
                        $('.addresscontainer').height(205);
                        self.resizemodel();
                        $('.addresscontainer').show();
                        $('.mapassistregister').show();
                        $('.mapassistregister').width(0);
                        self.resolvedResults.removeAll();
                        self.removeallmarkers();
                        // self.showmap();
                        // self.getmapobj().setZoom(10);
                        self.addToResolvedList(data, true);
                    }
                });
            }
        };
        var ResetViewModel = function () {
            var self = this;
            self.email = ko.observable("");
            self.isEmail = function () {
                if (self.email() == "") return false;
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(self.email());
            }
            self.disablesubmit = ko.computed(function () {
                if (!self.isEmail())
                    return true;
                return false;
            });
            self.DoReset = function () {

                var $form = $("#resetLinkForm");
                if (validationcontext.validateForm('resetLinkForm')) {
                    if (window.captchaSupported != undefined && window.captchaSupported && checkCaptcha(window.fgtpwdcaptcha) == '') {
                        $(".error-msg").text(Resources.Captcha_Blank);
                        $(".error-msg").show();
                        unblockUI();
                        return;
                    }
                    blockUI();
                    ResetLink(this,
                       function (jsonResult) {
                           $('#generatelink').hide();
                           $('#mailsent').show();
                           unblockUI();
                       });

                }
            }
            self.showLogin = function () {

                location.href = window.rootUrl;
            }
            self.toJson = function () { return ko.toJSON(this) };
        };
        var RecoveryViewModel = function () {
            var self = this;
            self.email = $("#emailid").val();
            self.password = ko.observable("");
            self.disablesubmit = ko.computed(function () {
                if (self.password() == "")
                    return true;
                return false;
            });
            self.DoRecovery = function () {
                if ($('#passwordchanged').is(':visible')) {
                    window.showLogin();
                }
                else {
                    var $form = $("#recoveryForm");
                    if (validationcontext.validateForm('recoveryForm')) {
                        if ($('#g-recaptcha-response').val() == '') {
                            $(".error-msg").text(Resources.Captcha_Blank);
                            $(".error-msg").show();
                            return;
                        }
                        blockUI();
                        Recovery(this,
                           function (jsonResult) {
                               if (jsonResult.success) {
                                   console.log("Recovery success");
                                   $('#changepassword').hide();
                                   $('#passwordchanged').show();
                                   unblockUI();
                               }
                               else {
                                   console.log("Recovery Failed");
                                   unblockUI();
                               }
                           })

                    }
                }
            }
            self.showLogin = function () {                
                window.showLogin();
            }
            self.toJson = function () { return ko.toJSON(this) };
        };

        var LanguageViewModel = function () {
            var self = this;

            self.LangChanged = function (lang) {
                lang = $('#language option:selected').val();
                console.log("language changed:" + lang);
                blockUI();
                datacontext.changelang(lang).done(function (json) {
                    if (json.success) {
                        $.cookie("_culture", lang);
                        location.reload();
                        unblockUI();
                    }
                    else {
                        $.cookie("_culture", lang);
                        location.reload();
                        unblockUI();
                    }

                });
            }
        };

        // Apply viewmodel to UI

        if ($("#recovery").length !== 0) {
            ko.applyBindings(new RecoveryViewModel(), document.getElementById("recoveryForm"));
            validationcontext.setvalidationfor('recoveryForm');
        }
        else {
            if ($("#login").length !== 0) {
                ko.applyBindings(new LoginViewModel(), document.getElementById("login"));
            }
            if ($("#signupForm").length !== 0) {
                var model = new RegisterViewModel();
                ko.applyBindings(model, document.getElementById("signupForm"));
                validationcontext.setvalidationfor('signupForm');
                googleAutocomplete('signupForm', 'inputCity', model);
            }
            if ($("#resetLinkForm").length !== 0) {
                ko.applyBindings(new ResetViewModel(), document.getElementById("resetLinkForm"));
                validationcontext.setvalidationfor('resetLinkForm');
            }
        }
        if ($("#languagebar").length !== 0) {
            ko.applyBindings(new LanguageViewModel(), document.getElementById("languagebar"));
        }
    });
})($, document, window.maxprocloudlogin.datacontext, window.maxprocloudlogin.validationcontext);



