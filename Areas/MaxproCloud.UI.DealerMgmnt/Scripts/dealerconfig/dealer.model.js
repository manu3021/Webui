/// <reference path="user.common.js" />
/// <reference path="user.datacontext.js" />
/// <reference path="user.uicontext.js" />

// Knockout file upload binding handler


; (function ($, ko, common, datacontext, uicontext, validationcontext) {

    var detaildataviewmodel = function (data,state) {
        var self = this;
        data = data || {};
        data.ContactInfo = data.ContactInfo || {};
        data.LocationInfo = data.LocationInfo || {};
        self.Isnew = ko.observable(false);
        self.Id = data.Id;
        self.state = state;
        self.objectData = data;
        self.EntityType = data.EntityType;
        self.Name = ko.observable(data.Name);
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
        self.ContactInfo = {
            AddressLine1: ko.observable(data.ContactInfo.AddressLine1),
            City: ko.observable(data.ContactInfo.City),
            Region: ko.observable(data.ContactInfo.Region),
            Country: ko.observable(data.ContactInfo.Country),
            ZipCode: ko.observable(data.ContactInfo.ZipCode),
            Phone: ko.observable(data.ContactInfo.Phone),
            EmailAddress: ko.observable(data.ContactInfo.EmailAddress)
        };
        self.LocationInfo = {
            Lattitude: ko.observable(data.LocationInfo.Lattitude),
            Longitude: ko.observable(data.LocationInfo.Longitude)
        };
        self.ErrorMessage = ko.observable("");
        self.IsError = ko.observable(false);
        self.clearerrormessages = function () {
            self.IsError(false);
            self.ErrorMessage("");
        }
        self.savedata = function () {
            try {
                self.clearerrormessages();
                if (window.configuration.validationcontext.validateForm('userdetailform')) {
                    self.FAPNumber = ko.observable(self.IsSILVER() + "," + self.IsGOLD() + "," + self.IsPLATINUM());
                    datacontext.saveupdated(self).done(function (result) {
                        if (result.Success) {
                            window.userconfig.uicontext.updateuserlist(self, false);
                            alertify.success(Resources.Dealer_DataSave);
                            $.publish(common.events.userupdated, result.data);
                        }
                        else {
                            alertify.error(result.errorMessage);
                            self.IsError(true);
                            self.ErrorMessage(result.errorMessage);
                        }
                    }).fail(function (result) {
                        alertify.error(Resources.Dealer_SaveFail);
                        self.IsError(true);
                        self.ErrorMessage(common.messages.error_onserver);
                    });
                }
            } catch (e) {
                console.error(e);
            }
        }
        self.editUserdata = function (data, e) {
            try {
                window.userconfig.userconfigviewmodel.changeviewmode(true);
            } catch (e) {
                console.error("USERDETAILMODEL::ERROR::editUserdata", e);
            }
        }
        self.updatedata = function (userdata) {
            try {
                self.objectData = $.parseJSON(userdata.toJson());
                self.Isnew(false);
                self.Name(userdata.Name());
            } catch (e) {
            }
        }
        self.deleteSelectedUser = function () {
            uicontext.deleteSelectedUser();
        }

        self.approve = function () {
            uicontext.approveSelected();
        }

        self.toJson = function () {
            try {
                return ko.toJSON(self);
            } catch (e) {

            }
        }
        self.IsSelected = ko.observable(false);


    }
    var listViewModel = function (data,state) {
        data = data || {};
        var self = this;
        var previousSelectedPendingItem;
        self.state = state;
        self.IsError = ko.observable(false);
        self.SearchQuery = ko.observable("");
        self.userlistdatasource = ko.observableArray($.map(data.ResultData, function (uItem) { return new detaildataviewmodel(uItem); }) || []);

        self.currentselecteditem = null;
        self.ErrorMessage = ko.observable();
        self.clearerrormessages = function () {
            self.IsError(false);
            self.ErrorMessage("");
        }
        self.totalusers = ko.computed(function () {
            if (self.userlistdatasource()) {
                return self.userlistdatasource().length + " " + Resources.Pending;
            }
        });
        self.totalActive = ko.computed(function () {
            if (self.userlistdatasource()) {
                return self.userlistdatasource().length + " Approved dealers";
            }
        });
        self.bshowdetailsview = ko.computed(function () {
            if (self.userlistdatasource()) {
                return self.userlistdatasource().length > 0;
            }
        });
        self.clearselectoinforall = function () {
            for (var item = 0; item < self.userlistdatasource().length; item++) {
                self.userlistdatasource()[item].IsSelected(false);
            }
        }
        self.selectfirstuser = function () {
            if (self.userlistdatasource().length > 0) {
                self.userlistdatasource()[0].IsSelected(true);
                self.userselected(self.userlistdatasource()[0]);
                $('#userpanel').show();
            }
            else {
                $('#userpanel').hide();                
                //resetuserdetailform();
            }
        }
        self.userselected = function (data, event) {
            if (previousSelectedPendingItem == null || previousSelectedPendingItem == undefined) {
                previousSelectedPendingItem = data;
            }
            else {
                previousSelectedPendingItem.IsSelected(false);
                previousSelectedPendingItem = data;
            }
            data.IsSelected(true);
            console.log(data);
            if (self.state)
                uicontext.onuserselected(data);
            else
                uicontext.onapprovedSeleceted(data);
        }
        self.updatenodeitem = function (userdata) {
            previousSelectedPendingItem.updatedata(userdata);
        }
        self.selectpreviousItem = function (selectedItem) {
            // TO DO;
        }
        self.removeuserfromlist = function (userdata) {
            self.userlistdatasource.remove(userdata);
        }
        self.adduserfromlist = function (userdata) {
            self.userlistdatasource.unshift(userdata);
            self.userlistdatasource()[0].IsSelected(false);
            self.userlistdatasource.sort(function (left, right) {              
                return left.objectData.Name == right.objectData.Name ? 0 : (left.objectData.Name < right.objectData.Name ? -1 : 1)
            });          
        }

    }



    var EluaViewmodel = function (data) {
        data = data || {};
        var self = this;
        var nowDate = new Date();
        var today = new Date(nowDate.getFullYear(), nowDate.getMonth(), (nowDate.getDate() + 1));

        $('#eulaStartDate').datetimepicker({ pickTime: false, startDate: today });
        self.eulatext = ko.observable(data.Text);
        self.SubType = ko.observable(data.SubType);
        self.applicationtype = ko.observable(data.ProductName);
        self.applicationtypelist = ko.observableArray(['MPC', 'WP']);
        self.roletype = ko.observable(data.RoleType);
        self.roletypelist = ko.observableArray(['System Administrator', 'Dealer', 'Operator', 'Technical Support']);
        self.selectedStartDate = ko.observable();
        self.StartDate = ko.observable(data.StartDate);
        self.day = "";
        self.month = "";
        self.year = "";


        if (data.StartDate != undefined) {
            self.StartDate(data.StartDate)
            //var i = data.StartDate.replace('/Date(', '').replace(')/', '');
            //var j = parseInt(i);
            //var OriginTime = new Date(j).toLocaleDateString();
            //self.StartDate(OriginTime);

            //OriginTime.setDate(j);
            //OriginTime = new Date(OriginTime.getTime() + OriginTime.getTimezoneOffset() * 60000);
            //  var dateString = OriginTime.format("dd mmm yyyy HH:MM:ss");
            //    var substring = data.StartDate.replace('/Date(', '').replace(')/', '');
            //    var newdate = new Date(substring).toLocaleString();
            //    self.StartDate = ko.observable(newdate.toString("dd/mm/yy"));
        }
        if (data.StartDate != undefined) {


            //    var newdate = new Date(data.StartDate.replace('/Date(', '').replace(')/', '')).toLocaleString();
            //    self.StartDate = ko.observable(newdate.toString("dd/mm/yy"));
        }
        self.selectedStartdate = ko.observable(data.startDate);
        self.version = ko.observable(data.version);

        self.saveeula = function () {
            try {
                // self.StartDate = ($('#eulaStartDate input').val());                
                var datestring = $('#eulaStartDate input').val().split('/');
                self.day = datestring[1];
                self.month = datestring[0];
                self.year = datestring[2];
                //self.substringdate = ($('#eulaStartDate input').val().split('/'));
                if ($('.eulaTxtArea').val() != "") {
                    if ($('#eulastartdate').val() != "") {
                        $('.hideerrorSummary').css('display', 'none');
                        self.SubType = "";
                        if (self.roleType == "System Administrator") {
                            self.roleType = "Admin";
                        }
                        if (self.roleType == "Dealer") {
                            self.roleType = "Admin";
                            self.SubType = "Dealer";
                        }
                        if (self.roleType == "Operator") {
                            self.roleType = "Operator";
                        }
                        if (self.roleType == "Technical Support") {
                            self.roleType = "TechSupport";
                        }

                        datacontext.createEula(self).done(function (result) {
                            if (result.Success) {
                                alertify.success(Resources.Dealer_EulaSave);
                                $('.eulaTxtArea').val('');
                                $('#roleoptions :nth-child(1)').prop('selected', true);
                                $('#eulastartdate').val('');
                                self.Text = undefined;
                            }
                        }
                        ).fail(function (result) {
                            alertify.error(Resources.Dealer_SaveFail);

                        });
                    }
                    else {
                        $('.hideerrorSummary').css('display', 'block');
                    }

                }

                else {
                    $('.hideerrorSummary').css('display', 'block');
                }

            } catch (e) {

            }
        }

        self.toJson = function () {
            try {
                self.roletypelist = null;
                self.applicationtypelist = null;
                return ko.toJSON(self);
            } catch (e) {

            }
        }
    }
    var EulaListViewModel = function (data) {
        data = data || {};
        var self = this;
        var model = new EluaViewmodel(data.ResultData[0]);
        self.eulalistdatasource = ko.observableArray($.map(data.ResultData, function (uItem) { return new EluaViewmodel(uItem); }) || []);
    }


    var billingviewmodel = function (data) {
        var self = this;
        data = data || {};
        self.downloadBillingSummary = function () {
            uicontext.downloadBillingSummary();
        }

    }

    datacontext.listViewModel = listViewModel;
    datacontext.detaildataviewmodel = detaildataviewmodel;

    datacontext.EluaViewmodel = EluaViewmodel;
    datacontext.EulaListViewModel = EulaListViewModel;

    $(document.body).on('click', '.eula-list-tab', function () {
        var data = "MPC";
        datacontext.EulaList(data).done(function (result) {
            if (result.Success) {
                datacontext.applyEulalistbindings(result);
            }
        }
               ).fail(function (result) {
                   alertify.error(Resources.Dealer_SaveFail);
                   self.ErrorMessage(common.messages.error_onserver);
               });
    });



    datacontext.billingviewmodel = billingviewmodel;

    //download Billing summary excel sheet end
    function init() {

        window.userconfig.uicontext.start();
    }
    init();
})(jQuery, ko, window.userconfig.common, window.userconfig.datacontext, window.userconfig.uicontext, window.userconfig.validationcontext);




