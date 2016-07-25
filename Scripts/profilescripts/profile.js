
window.profileconfig = window.profileconfig || {};
window.profileconfig.validations = (function ($, validator) {
    var errorCssClass = "validationError";
    var ValidationMessages = {
        default_Max: Resources.default_Max,
        org_Name_Required: Resources.Dealer_required,
        org_Name_Min: Resources.customer_Name_Min,
        Address_Required: Resources.customer_Address_Required,
        Address_Min: Resources.customer_Address_Min,
        Phone_Required: Resources.customer_Phone_Required,
        Phone_Phoneus: Resources.customer_Phone_Required,
        Phone_PhoneIN: Resources.customer_Phone_Required,
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
        ADI_Minlength: Resources.ADI_Minlength,
        ADI_Maxlength: Resources.ADI_Maxlength,
        ADI_Invalid: Resources.ADI_Invalid,
        ADI_Requried: Resources.ADI_Requried
    };
    var configvalidation = {
        savedealerProfile: {
            rules: {
                dealername: {
                    required: true,
                    minlength: 2,
                    maxlength: 30
                },
                line1: {
                    required: true,
                    minlength: 2,
                    maxlength: 50
                },
                line2: {
                    required: false,
                    minlength: 2,
                    maxlength: 50
                },
                inputEmail: {
                    required: true,
                    email: true
                },
                phone: {
                    required: true,
                    phoneIndia: true
                },
                state: {
                    required: true,
                    minlength: 2,
                    maxlength: 30
                },
                country: {
                    required: true,
                    minlength: 2,
                    maxlength: 30
                },
                city: {
                    required: true,
                    minlength: 2,
                    maxlength: 30
                },
                bpcsnumber: {
                    required: true,
                    minlength: 6,
                    maxlength: 8,
                    pattern: "^[a-zA-Z0-9]+$"
                },
                Zipcode: {
                    required: true,
                    pattern: "^[a-zA-Z0-9 ]{3,10}$"
                }

            },
            messages: {
                dealername: {
                    required: ValidationMessages.org_Name_Required,
                    minlength: ValidationMessages.org_Name_Min,
                    maxlength: ValidationMessages.default_Max
                },
                line1: {
                    required: ValidationMessages.Address_Required,
                    minlength: ValidationMessages.Address_Min,
                    maxlength: ValidationMessages.default_Max
                },
                line2: {
                    required: ValidationMessages.Address_Required,
                    minlength: ValidationMessages.Address_Min,
                    maxlength: ValidationMessages.default_Max
                },
                inputEmail: {
                    required: ValidationMessages.Email_Required,
                    email: ValidationMessages.Email
                },
                phone: {
                    required: ValidationMessages.Phone_Required,
                    phoneIndia: ValidationMessages.Phone_PhoneIN
                },
                state: {
                    required: ValidationMessages.Region_Required,
                    minlength: ValidationMessages.Region_Min,
                    maxlength: ValidationMessages.default_Max
                },
                country: {
                    required: ValidationMessages.Country_Required,
                    minlength: ValidationMessages.Country_Min,
                    maxlength: ValidationMessages.default_Max
                },
                city: {
                    required: ValidationMessages.City_Required,
                    minlength: ValidationMessages.City_Min,
                    maxlength: ValidationMessages.default_Max
                },
                inputFAP: {


                },
                inputADI: {

                },
                Zipcode: {
                    required: ValidationMessages.ZipCode_Required,
                    pattern: ValidationMessages.ZipCode_Required
                },
                bpcsnumber: {
                    required: ValidationMessages.ADI_Requried,
                    minlength: ValidationMessages.ADI_Minlength,
                    maxlength: ValidationMessages.ADI_Maxlength,
                    pattern: ValidationMessages.ADI_Invalid
                }
            }
        },

        changepassword: {
            rules: {

                oldpassword: {
                    required: true

                },
                newpassword: {
                    required: true,
                    minlength: 8,
                    maxlength: 30,
                    passwordstrength: true
                }

            },
            messages: {

                oldpassword: {
                    required: ValidationMessages.Password_Required,
                    minlength: ValidationMessages.Password_Min,
                    passwordstrength: ValidationMessages.user_PasswordStrength
                },
                newpassword: {
                    required: ValidationMessages.Password_Required,
                    minlength: ValidationMessages.Password_Min,
                    passwordstrength: ValidationMessages.user_PasswordStrength
                }

            }
        },
        saveprofile: {
            rules: {
                fname: {
                    required: true,
                    minlength: 2,
                    maxlength: 30
                },
                lname: {
                    required: true,
                    minlength: 2,
                    maxlength: 30
                },
                email: {
                    required: true,
                    email: true
                },
                phone: {
                    required: true,
                    phoneIndia: true
                },
                line1: {
                    required: true,
                    minlength: 2,
                    maxlength: 50
                },
                state: {
                    required: true,
                    minlength: 2,
                    maxlength: 30
                },
                country: {
                    required: true,
                    minlength: 2,
                    maxlength: 30
                },
                city: {
                    required: true,
                    minlength: 2,
                    maxlength: 30
                }
            },
            messages: {
                fname: {
                    required: ValidationMessages.FirstName_Required,
                    minlength: ValidationMessages.FirstName_Min,
                    maxlength: ValidationMessages.default_Max
                },
                lname: {
                    required: ValidationMessages.LastName_Required,
                    minlength: ValidationMessages.LastName_Min,
                    maxlength: ValidationMessages.default_Max
                },
                email: {
                    required: ValidationMessages.Email_Required,
                    email: ValidationMessages.Email
                },
                phone: {
                    required: ValidationMessages.Phone_Required,
                    phoneIndia: ValidationMessages.Phone_PhoneIN
                },
                line1: {
                    required: ValidationMessages.Address_Required,
                    minlength: ValidationMessages.Address_Min,
                    maxlength: ValidationMessages.default_Max
                },
                state: {
                    required: ValidationMessages.Region_Required,
                    minlength: ValidationMessages.Region_Min,
                    maxlength: ValidationMessages.default_Max
                },
                country: {
                    required: ValidationMessages.Country_Required,
                    minlength: ValidationMessages.Country_Min,
                    maxlength: ValidationMessages.default_Max
                },
                city: {
                    required: ValidationMessages.City_Required,
                    minlength: ValidationMessages.City_Min,
                    maxlength: ValidationMessages.default_Max
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
window.profileconfig.validationcontext = (function ($, validation) {
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
})(jQuery, window.profileconfig.validations);
var data = null;
window.profileconfig.datacontext = (function ($, ko, document, datacontext, validationcontext) {
    function getuserphoto(photoId, photoObserable, errorObserable) {
        photoObserable(profilephotourl(photoId));
    }
    function getuserdata(Id) {
        try {
            data = ({ userid: Id });
            return ajaxRequest("POST", getuserdataurl(), data).done(function (jsonResult) {
                if (jsonResult != undefined && jsonResult != null) {
                    if (jsonResult.Success) {
                        //   profileUImodel(jsonResult.ResultData);
                        var profileviewmodel = new profileUImodel(jsonResult.ResultData);
                        ko.applyBindings(profileviewmodel, document.getElementById("myprofile"));
                        profileviewmodel.Init();
                        googleAutocomplete('saveprofile', 'city', profileviewmodel.onAutoComplete);
                    }
                    else {
                        var profileviewmodel = new profileUImodel();
                        profileviewmodel.error(jsonResult.Message);
                        ko.applyBindings(profileviewmodel, document.getElementById("myprofile"));
                    }
                }
            });

        } catch (e) {

        }
    }
    function getdealerdata(DealerId) {
        try {
            data = ({ dealerid: DealerId });

            return ajaxRequest("POST", getdealerdataurl(), data).done(function (jsonResult) {
                if (jsonResult != undefined && jsonResult != null) {
                    if (jsonResult.Success) {
                        //   profileUImodel(jsonResult.ResultData);
                        var dealerviewmodel = new dealerUImodel(jsonResult.ResultData);
                        ko.applyBindings(dealerviewmodel, document.getElementById("dealer"));
                        dealerviewmodel.Init();
                        googleAutocomplete('savedealerProfile', 'city', dealerviewmodel.onAutoComplete);
                    }
                    else {
                        var dealerviewmodel = new dealerUImodel();
                        dealerviewmodel.error(jsonResult.Message);
                        ko.applyBindings(dealerviewmodel, document.getElementById("dealer"));
                    }
                }
            });

        } catch (e) {

        }
    }

    function bindchangepassword() {
        var passwordchangeviewmodel = new passwordchangemodel();
        ko.applyBindings(passwordchangeviewmodel, document.getElementById("changepwd"));
    }

    function deletePhoto(profilemodel) {
        if (!profilemodel.PhotoId) return;
        data = ({ Id: profilemodel.PhotoId })
        alertify.confirm(Resources.Do_you_want_delete + " " + Resources.Credential_Photo, function (e) {
            if (e) {
                blockUI();
                try {
                    return ajaxRequest("POST", photodeleteurl(), data).done(function (jsonData) {
                        unblockUI();
                        if (jsonData.Success) {
                            alertify.success(Resources.Successfully_deleted);
                            //To remove photo from the tag        
                            profilemodel.PhotoId = null;
                            profilemodel.profilePhoto("");
                        }
                        else {
                            alertify.error(Resources.Delete_failed + ": " + jsonData.errorMessage);
                        }
                    }).fail(function () {
                        unblockUI();
                    });

                } catch (e) {

                }
            }
        });

    }
    function deletelogo(dealerUImodel) {
        if (!dealerUImodel.Logo()) return;
        $("#logotext").hide();
        data = ({ Id: dealerUImodel.Logo() })
        alertify.confirm(Resources.Do_you_want_delete + " Photo", function (e) {
            if (e) {
                try {
                    blockUI();
                    return ajaxRequest("POST", photodeleteurl(), data).done(function (jsonData) {
                        if (jsonData.Success) {
                            unblockUI();
                            alertify.success(Resources.Successfully_deleted);
                            //To remove photo from the tag        
                            dealerUImodel.Logo(null);
                            dealerUImodel.dealerPhoto("");
                            $("#logotext").show();
                        }
                        else {
                            unblockUI();
                            alertify.error(Resources.Delete_failed + ": " + jsonData.errorMessage);
                            $("#logotext").hide();
                        }
                    }).fail(function () { });

                } catch (e) {

                }
            }
        });

    }
    function deleteUserPhoto(data) {
        try {
            if (data != undefined && data != null) {
                data = ({ Id: selectedUser.PhotoId })
                return ajaxRequest("POST", photodeleteurl(), data);
            }
        } catch (e) {
            console.error("User details delete  Error:" + e.message);

        }
    }
    function getuserdataurl() {
        var url = $('.profile').attr("data-userconfigurl");
        url = url + "/GetUserDetail";///?userid=" + profileId;
        return url;
    }
    function profilephotourl(photoId) {
        var url = $('.profile').attr("data-url");
        url = url + "/GetPhoto?uid=" + photoId;
        return url;
    }
    function dealerphotourl(photoId) {
        var url = $('.profile').attr("data-url");
        url = url + "/GetPhoto/?uid=" + photoId;
        return url;
    }
    function photodeleteurl() {
        var url = $('.profile').attr("data-url");
        url = url + "/DeletePhoto";//?Id=" + id;
        return url;
    }
    function saveprofileurl() { }
    function changepassurl(changedata) {
        data = ({ data: changedata });
        var url = $('.profile').attr("data-url");
        url = url + "/ChangePassword";///?data=" + data;
        return url;
        return ajaxRequest("POST", url, data);
    }
    function getdealerdataurl() {
        var url = $('.profile').attr("data-url");
        url = url + "/GetDealerDetail";//?dealerid=" + dealerprofileId;
        return url;
    }
    function signouturl() {
        return $("#signout").attr("data-url");
    }
    var passwordchangemodel = function (dat) {
        var self = this;
        dat = dat || {};
        //var $form = $("#changepassword");
        self.oldpassword = ko.observable(dat.OldPassword);// $form.find("input[name='oldpassword']").val();
        self.newpassword = ko.observable(dat.NewPassword);// $form.find("input[name='newpassword']").val();
        self.signout = function () {
            return new ajaxRequest("post", signouturl()).done(function (jsonData) {
                if (jsonData) {
                    alertify.alert(Resources.Profile_PasswrdChangedSuccessfullyLoginWithNew,
                        function () {
                            alertify.success(Resources.Profile_RedirectionToLoginPage);
                            window.location.href = window.location.href;
                        });
                }
            })
        };
        self.changepassword = function (item, event) {
            var $form = $("#changepassword");
            event.preventDefault();
            if (validationcontext.validateForm('changepassword')) {
                if (item.oldpassword() == item.newpassword()) {
                    var errors = [];
                    errors.push(Resources.Profile_NewPasswrdOldPasswrdCannotBeSame);
                    alertify.error(Resources.Profile_NewPasswrdOldPasswrdCannotBeSame);
                    displayErrors($form, errors);
                    return;
                }
                event.preventDefault();
                var $form = $("#changepassword");
                ajaxRequest("POST", $form.attr("action"), item).done(function (json) {
                    json = json || {};
                    if (json.error) {
                        var errors = [];
                        errors.push(json.error);
                        displayErrors($form, errors);
                        alertify.error(json.error);
                    }
                    if (json.success) {
                        self.oldpassword("");
                        self.newpassword("");
                        hideErrors($form);
                        alertify.success(Resources.Profile_PasswordChangedSuccessfully);
                        self.signout();
                    }

                }).error(function () {
                    displayErrors($form, [Resources.General_error]);
                    alertify.error(Resources.password_change_Failed);
                })
            }
        }
        self.skippassword = function (data, event) {
            window.location = location.href;
        }
        $(document).on("shown", 'a[data-toggle="tab"]', function (e) {

            if (e.target.hash == "#changepwd") {
                var isNewPasswordRequired = $("#isFirstTime").attr('data-isnewpasswordrequired') == "True" ? true : false;
                if (isNewPasswordRequired) {
                    alertify.alert(Resources.Profile_password_mandatory);
                }
                $('#newpassword').attr('type', 'password');

            }
        });
        self.toJson = function () { return ko.toJSON(this) };
        self.Init = function () { }

    }
    var profileUImodel = function (data) {

        var self = this;
        data = data || {};
        self.hasChanges = ko.observable(false);
        self.FirstName = ko.observable(data.FirstName);
        self.UserName = ko.observable(data.UserName);
        self.LastName = ko.observable(data.LastName);
        self.Language = ko.observable(data.Language);
        self.ContactInfo = self.ContactInfo || {};
        data.ContactInfo = data.ContactInfo || {};   
        ResetObjectWithEmptyValues(data.ContactInfo);
        self.ContactInfo.Phone = ko.observable(data.ContactInfo.Phone);
        // self.Logo = ko.observable(data.Logo);
        self.BrandingMessage = ko.observable(data.BrandingMessage);
        //self.ContactInfo.WorkPhone = ko.observable(data.WorkPhone);
        //self.ContactInfo.EmailAddress = ko.observable(data.UserName);
        //self.ContactInfo.AlternateEmail = ko.observable(data.AlternateEmail);
        self.ContactInfo.AddressLine1 = ko.observable(data.ContactInfo.AddressLine1);
        self.ContactInfo.AddressLine2 = ko.observable(data.ContactInfo.AddressLine2);
        self.ContactInfo.City = ko.observable(data.ContactInfo.City);
        self.ContactInfo.Region = ko.observable(data.ContactInfo.Region);
        self.ContactInfo.Country = ko.observable(data.ContactInfo.Country);
        self.ContactInfo.ZipCode = ko.observable(data.ContactInfo.ZipCode);
        self.RoleInfo = self.RoleInfo || {};
        data.RoleInfo = data.RoleInfo || {};
        self.RoleInfo.RoleId = ko.observable(data.RoleInfo.RoleId);
        self.RoleInfo.RoleName = ko.observable(data.RoleInfo.RoleName);
        self.Id = data.Id;
        self.PhotoId = data.PhotoId;
        self.PhotoRef = ko.observable();
        self.profilePhoto = ko.observable("");
        self.PhotoType = data.PhotoType;
        self.image = ko.observable(data.PhotoRef);
        self.imageType = ko.observable();
        self.imageFile = ko.observable();
        self.imagePath = ko.observable();
        self.IsImageDirty = false;
        self.IsDefault = false;
        self.imageObjectURL = ko.observable();
        self.IsImageloaded = ko.observable(true);
        self.profilePhoto.subscribe(function (newval) {
            if (newval) {
                self.IsImageloaded(false);
            }
        });
        self.imageSrc = ko.computed(function () {
            if (self.imageType() && self.image()) {
                {
                    self.PhotoType = self.imageFile().type;
                    self.PhotoRef(self.image());
                    self.profilePhoto(self.imageType() + "," + self.image());
                    self.IsImageDirty = true;
                    self.IsDefault = true;
                }
            }
        });
        self.setExtender = function () {
            this.FirstName.extend({ watch: this });
            this.LastName.extend({ watch: this });
            this.UserName.extend({ watch: this });
            this.Language.extend({ watch: this });
            this.ContactInfo.Phone.extend({ watch: this });
            this.ContactInfo.AddressLine1.extend({ watch: this });
            this.ContactInfo.City.extend({ watch: this });
            this.ContactInfo.Region.extend({ watch: this });
            this.ContactInfo.Country.extend({ watch: this });
            this.profilePhoto.extend({ watch: this });
        }       

        self.savepreference = function (data, event) {
            alertify.success(Resources.Profile_SavePreference);
        }
        self.uploadImage = function (cb) {
            var needtouploadphoto = self.IsImageDirty;
            if (needtouploadphoto) {
                var fd = new FormData();
                fd.append('photofile', document.getElementById("profilephoto").files[0]);
                fd.append("BlobId", self.PhotoId);
                fd.append("TypeName", "Photo");
                ajaxfilePost($('#profilephoto').data("uploadurl"), fd).done(function (result) {
                    var newId = "";
                    if (result.Success) {
                        self.PhotoId = result.data.Result[1].Value;
                        self.IsImageDirty = false;
                    }
                    if (cb)
                        cb(self.PhotoId)
                });
            }
            else {
                if (cb)
                    cb(self.PhotoId)
            }
        }
        self.saveuser = function (data, event) {
            console.log("Save Profile");
            var $form = $("#saveprofile");
            event.preventDefault();
            if (validationcontext.validateForm('saveprofile')) {
                blockUI();
                self.uploadImage(function (newid) {
                    if (newid === "")
                        console.log("error in image upload");
                    self.PhotoId = newid;
                    ajaxRequest("POST", $form.attr("action"), data).done(function (json) {
                        json = json || {};
                        if (json.error) {
                            var errors = [];
                            errors.push(json.error);
                            displayErrors($form, errors);
                        }
                        if (json.success) {
                            alertify.success(Resources.Profile_UserSavedSuccessfully);
                            var agreementflag = $("#isFirstTime").attr('data-firsttime') == "True" ? true : false;
                            var isCreator = $("#isCreatorTime").attr('data-iscreator') == "True" ? true : false;
                            var isNewPasswordRequired = $("#isFirstTime").attr('data-isnewpasswordrequired') == "True" ? true : false;
                            if (isNewPasswordRequired) {
                                alertify.alert(Resources.Profile_password_mandatory);
                                //}
                                //if (agreementflag == true && !isCreator) {
                                $("#changepwd").addClass("active");
                                $("#myprofile").removeClass("active");
                                $("#passactive").addClass("active");
                                $("#profileactive").removeClass("active");
                            }
                            self.hasChanges(false);
                        }
                        unblockUI();
                    }).error(function () {
                        displayErrors($form, [Resources.General_error]);
                        alertify.error(Resources.Profile_FailedSaveUser);
                        unblockUI();
                    });
                });

            }
        }

        self.skipprofile = function (data, event) {
            window.location = location.href;
        }
        self.nextprofile = function () {
            $("#changepwd").addClass("active");
            $("#myprofile").removeClass("active");
            $("#passactive").addClass("active");
            $("#profileactive").removeClass("active");
        }
        self.deletephoto = function () {

            if (self.PhotoId == "") {
                self.profilePhoto("");
                self.imageFile("");

                return;
            }
            if (self.PhotoId) {
                deletePhoto(self);

            }

        }
        self.onAutoComplete = function (data, el) {
            el.val(data.City);
            self.ContactInfo.City(data.City);
            self.ContactInfo.Region(data.Region);
            self.ContactInfo.Country(data.Country);
        }
        self.toJson = function () {
            var copy = ko.toJS(this);
            delete copy.profilePhoto;
            delete copy.PhotoRef;
            delete copy.image;
            return ko.toJSON(copy)
        };
        self.Init = function () {
            self.PhotoId = self.PhotoId || $('#UserFields').attr('data-PhotoId');
            if (self.PhotoId && self.profilePhoto() == "") {
                self.IsImageloaded(true);
                getuserphoto(self.PhotoId, self.profilePhoto, self.ErrorMessage);
            }
            else {
                self.IsImageloaded(false);
            }
            self.setExtender();
        }
    }
    var dealerUImodel = function (data) {
        var self = this;
        data = data || {};
        self.PhotoRef = ko.observable();
        self.Id = data.Id;
        self.objectData = data;
        self.AccountId = data.AccountId;
        self.PhotoId = data.PhotoId;
        self.EntityType = data.EntityType;
        self.Name = ko.observable(data.Name);
        self.Branding = ko.observable(data.Branding);
        self.HoneywellAdiNumber = ko.observable(data.HoneywellAdiNumber);

        self.FAPNumber = ko.observable(data.FAPNumber);
        if (self.FAPNumber() != null) {
            var str = self.FAPNumber(),
                strsplit = str.split(",");

            data.IsSILVER = (strsplit[0] == "true" ? true : false);
            data.IsGOLD = (strsplit[1] == "true" ? true : false);
            data.IsPLATINUM = (strsplit[2] == "true" ? true : false);
        }
        self.IsSILVER = ko.observable(data.IsSILVER);
        self.IsGOLD = ko.observable(data.IsGOLD);
        self.IsPLATINUM = ko.observable(data.IsPLATINUM);
        self.Logo = ko.observable(data.Logo);
        self.IsImageloaded = ko.observable(true);
        self.ContactInfo = {
            Phone: ko.observable(data.ContactInfo.Phone),
            WorkPhone: ko.observable(data.ContactInfo.WorkPhone),
            EmailAddress: ko.observable(data.ContactInfo.EmailAddress),
            AlternateEmail: ko.observable(data.ContactInfo.AlternateEmail),
            AddressLine1: ko.observable(data.ContactInfo.AddressLine1),
            AddressLine2: ko.observable(data.ContactInfo.AddressLine2),
            City: ko.observable(data.ContactInfo.City),
            Region: ko.observable(data.ContactInfo.Region),
            Country: ko.observable(data.ContactInfo.Country),
            ZipCode: ko.observable(data.ContactInfo.ZipCode)
        };
        self.Id = data.Id;
        self.PhotoId = data.PhotoId;
        self.PhotoRef = ko.observable();
        self.dealerPhoto = ko.observable("");

        self.PhotoType = data.PhotoType;
        self.image = ko.observable(data.PhotoRef);
        self.imageType = ko.observable();
        self.imageFile = ko.observable();
        self.imagePath = ko.observable();
        self.IsImageDirty = false;
        self.IsDefault = false;
        self.imageObjectURL = ko.observable();
        self.dealerPhoto.subscribe(function (newval) {
            if (newval) {
                self.IsImageloaded(false);

            }
        });
        self.imageSrc = ko.computed(function () {
            if (self.imageType() && self.image()) {
                {
                    self.PhotoType = self.imageFile().type;
                    self.FloorPlanInfo.FloorImageRef(self.image());
                    self.dealerPhoto(self.imageType() + "," + self.image());
                    self.FloorPlanInfo.IsImageDirty = true;
                    self.FloorPlanInfo.FloorImageType = self.imageFile().type;
                    self.IsImageDirty = true;
                    self.IsDefault = true;
                    if (self.image().length > 0) {
                        $("#logotext").hide();
                    }

                }
            }
        });
        self.FloorPlanInfo = {
            Id: ko.observable(data.PhotoId),
            AccountId: ko.observable(data.Id),
            FloorImageId: ko.observable(data.Logo),
            FloorImageName: ko.observable(data.Name),
            FloorImageType: ko.observable(self.PhotoType),
            FloorImageDescription: ko.observable(""),
            FloorImageRef: ko.observable(self.image()),
            IsImageDirty: ko.observable(self.IsImageDirty),
            IsDefault: ko.observable(self.IsDefault),
            Items: ko.observableArray([])
        };
        self.uploadImage = function (cb) {
            var needtouploadphoto = self.IsImageDirty;
            if (needtouploadphoto) {
                var fd = new FormData();
                fd.append('photofile', document.getElementById("logofile").files[0]);
                fd.append("BlobId", self.FloorPlanInfo.FloorImageId());
                fd.append("TypeName", "Logo");
                ajaxfilePost($('#logofile').data("uploadurl"), fd).done(function (result) {
                    var newId = "";
                    if (result.Success) {
                        newId = result.data.Result[1].Value;
                        self.Logo(newId);
                        self.IsImageDirty = false;
                    }
                    if (cb)
                        cb(self.Logo())
                });
            }
            else {
                if (cb)
                    cb(self.Logo())
            }

        }
        self.savedealer = function (data, event) {
            blockUI();
            console.log("save dealer data");
            data.FAPNumber = ko.observable(self.IsSILVER() + "," + self.IsGOLD() + "," + self.IsPLATINUM());
            var $form = $("#savedealerProfile");
            event.preventDefault();
            if (validationcontext.validateForm('savedealerProfile')) {
                self.uploadImage(function (newid) {
                    if (newid === "")
                        console.log("error in image upload");
                    ajaxRequest("POST", $form.attr("action"), data).done(function (json) {
                        unblockUI();
                        json = json || {};
                        if (json.error) {
                            var errors = [];                            
                            errors.push(json.error);
                            displayErrors($form, errors);
                            alertify.error(json.error);
                        }
                        if (json.success) {
                            self.Logo(json.data.Logo);
                            alertify.success(Resources.Profile_DealerSavedSuccessfully);
                            var agreementflag = $("#isFirstTime").attr('data-firsttime') == "True" ? true : false;
                            if (agreementflag == true) {
                                $("#myprofile").addClass("active");
                                $("#dealer").removeClass("active");
                                $("#dealeractive").removeClass("active");
                                $("#profileactive").addClass("active");
                            }
                        }
                    }).error(function () {
                        unblockUI();
                        displayErrors($form, [Resources.General_error]);
                        alertify.error(Resources.Profile_FailedToSaveDealer);
                    })
                });
            }
        }

        self.skipdealer = function (data, event) {
            window.location = location.href;
        }

        self.nextdealer = function (data, event) {
            $("#myprofile").addClass("active");
            $("#dealer").removeClass("active");
            $("#dealeractive").removeClass("active");
            $("#profileactive").addClass("active");
        }
        self.toJson = function () {
            var copy = ko.toJS(this);
            delete copy.FloorPlanInfo.FloorImageRef;
            delete copy.floorPhoto;
            delete copy.dealerPhoto;
            delete copy.image;
            return ko.toJSON(copy);
        };
        self.deletelogo = function () {

            if (self.Logo() == null || self.Logo() == "") {
                self.dealerPhoto("");
                self.imageFile("");
                $("#logotext").show();
                return;
            }
            if (self.Logo()) {
                deletelogo(self);
                //  $("#logotext").show();
            }

        }
        self.onAutoComplete = function (data, el) {
            el.val(data.City);
            self.ContactInfo.City(data.City);
            self.ContactInfo.Region(data.Region);
            self.ContactInfo.Country(data.Country);
        }
        self.Init = function () {
            //self.PhotoId = $('#DealerFields').attr('data-PhotoId');
            //if (self.PhotoId && self.dealerPhoto() == "") {
            if (self.Logo() && self.dealerPhoto() == "") {
                self.IsImageloaded(true);
                getuserphoto(self.Logo(), self.dealerPhoto, self.ErrorMessage);
                $("#logotext").hide();
            }
            else {
                self.IsImageloaded(true);
                $("#logotext").show();
            }
        }

    }
    var displayErrors = function (form, errors) {
        var errorSummary = $(".error-msg");
        errorSummary.html("");
        if (errors.length <= 0)
            errorSummary.hide();
        else
            errorSummary.html($.map(errors, function (error) { return error; })).show();

    };
    var hideErrors = function (form) {
        var errorSummary = $(".error-msg");
        errorSummary.html("");
        errorSummary.hide();
    };

    function Initialize() {
        try {

            var PhotoId = $('#UserFields').attr('data-PhotoId');
            var Id = $('#UserFields').attr('data-UserId');
            var DealerId = $('#DealerFields').attr('data-UserId');
            var agreementflag = $("#isFirstTime").attr('data-firsttime') == "True" ? true : false;
            var isCreatorflag = $("#isCreatorTime").attr('data-Iscreator') == "True" ? true : false;
            var isNewPasswordRequired = $("#isFirstTime").attr('data-isnewpasswordrequired') == "True" ? true : false;
            console.log("AgreementFlaf" + $("#isFirstTime").attr('data-firsttime'));
            console.log("IsCreatorFlag" + $("#isCreatorTime").attr('data-Iscreator'));
            if (isCreatorflag && agreementflag) {
                $("#proHeaderstart").show();
                $("#btndealersaveexit").show();
                $("#btndealerskip").show();
                $("#btnprofilesave").show();
                $("#btnprofileskip").show();
            }
            else if (isCreatorflag) {
                $("#btndealersave").show();
                $("#btnprofilesave").show();
                $("#btnpass").show();
            }
            else {
                if (isNewPasswordRequired) {
                    $("#proHeaderstart").show();
                    $("#btnprofilesavenext").show();
                }
                $('#savedealerProfile').css("pointer-events", "none");
                $("#btndealerNext").show();
                $("#btnprofilesave").show();
                $("#btnpass").show();
            }

            // var LogoId = $('#DealerFields').attr('data-PhotoId');
            if (Id) {
                getuserdata(Id);
            }
            if (DealerId) {
                getdealerdata(DealerId);
            }
            bindchangepassword();
            validationcontext.setvalidationfor('changepassword');
            validationcontext.setvalidationfor('saveprofile');
            validationcontext.setvalidationfor('savedealerProfile');
            isInitialized = true;
        }
        catch (e) {
            console.error("profile script exception " + e.message);
            isInitialized = false;
        }
    };
    Initialize();
})
(jQuery, ko, document, window.profileconfig.datacontext, window.profileconfig.validationcontext);

function ResetObjectWithEmptyValues(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (obj[key] == null || obj[key] == undefined) {
                obj[key] = '';
            }
        }
    }
}
