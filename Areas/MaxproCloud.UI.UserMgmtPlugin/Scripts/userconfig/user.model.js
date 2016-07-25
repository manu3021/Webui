/// <reference path="user.common.js" />
/// <reference path="user.datacontext.js" />
/// <reference path="user.uicontext.js" />

// Knockout file upload binding handler


; (function ($, ko, common, datacontext, uicontext, validationcontext) {
    var yesPrivs = [], noPrivs = [];
    var acctStates = { Intial: 0, Added: 1, Saved: 2 };
    var excptListItem = function (data, icon) {
        var self = this;
        self.objData = data;
        self.state = acctStates.Added;
        self.icon = self.icon = ko.computed(function () {
            if (data.nodetype != null) {
                return "icon_" + data.nodetype.toLowerCase();
            }
            else
                return " tree-open-icon";
        });
        self.Name = ko.observable(data.nodedata.Name);
        self.getparentName = function (data) {
            return data.nodeobject.Name;
        }
        self.Desc = ko.computed(function () {
            var node = data;
            var parent = data.treemodel
            var val = "";
            while (parent) {
                var parName = self.getparentName(parent)
                if (val.length == 0)
                    val = parName
                else
                    val = parName + " > " + val;
                parent = parent.parentNode;
            }
            return val;
        }, this);
    }
    var excepModel = function (isNew) {
        var self = this;
        self.isNew = isNew;
        self.dialog = null;
        self.hisexceptionaccounts = ([]);
        self.exceptionaccounts = ko.observableArray([]);
        self.dispAcounts = ko.computed(function () {          
            var accnt = ko.contextFor($('#userlistcontainer')[0]).$data;
            var accnts = $.grep(self.exceptionaccounts(), function (item) {
                // if (item.state == acctStates.Added || item.state == acctStates.Saved)
                //TODO: Apply filter for site
                if (accnt != null && accnt.selectedAccount != null && (accnt.selectedAccount.nodetype.toLowerCase() == 'dealer' && item.objData.nodetype.toLowerCase() != 'dealer') ||
                        (accnt.selectedAccount.nodetype.toLowerCase() == 'customer' && item.objData.nodetype.toLowerCase() != 'customer'))
                return item;
            });
            return accnts;
        }, this);
        self.saveExceptions = function () {
            var userviewmodel = window.userconfig.operatorhandler.getInstance().getoperatorviewmodel();
            if (userviewmodel.UserDetailModel.Isnew()) {
                self.enableHaschanges();
                if (self.dialog)
                    self.dialog.modal('hide');
                return;
            }
            blockUI();
            self.initialized();
            
            
            var accounts = []
            $.grep(self.exceptionaccounts(), function (item) {
                var accnt = ko.contextFor($('#userlistcontainer')[0]).$data;
                if (item.objData.nodedata.EntityType.toLowerCase() == 'site' || (accnt.selectedAccount.nodetype.toLowerCase() == 'dealer' && item.objData.nodedata.EntityType.toLowerCase() == 'customer')) {
                    item.objData.nodedata.IsShared = true;
                    accounts.push(item.objData.nodedata);
                }
                else if(item.objData.nodedata.EntityType.toLowerCase() == 'group')
                    accounts.push(item.objData.nodedata);
            });
            //if (accounts.length > 0) {
            datacontext.saveassociatedaccounts(userviewmodel.UserDetailModel.Id, accounts).done(function (jsonResult) {
                if (jsonResult.Success) {
                    alertify.success(common.messages.userupdate_success);
                    if (self.dialog)
                        self.dialog.modal('hide');
                    unblockUI();
                }
                else {
                    alertify.error(common.messages.usersave_failed);
                    self.enableHaschanges();
                    unblockUI();
                }
            }).fail(function () { alertify.error(common.messages.usersave_failed); self.enableHaschanges(); unblockUI(); });
            //}
            //else
            //{
            //    if (self.dialog)
            //        self.dialog.modal('hide');
            //    unblockUI();
            //}
        }
        self.enableHaschanges = function () {
            var saveditems = $.grep(self.exceptionaccounts(), function (item) {
                if (item.state == acctStates.Saved)
                    return item;
            });
            if (saveditems && saveditems.length > 0) {
                var userviewmodel = window.userconfig.operatorhandler.getInstance().getoperatorviewmodel();
                userviewmodel.UserDetailModel.hasChanges(true);
            }
        }
        self.restoreExceptions = function () {
            var userviewmodel = window.userconfig.operatorhandler.getInstance().getoperatorviewmodel();
            var items = [];
            $.each(self.exceptionaccounts(), function (index, value) {
                if (value && value.state === acctStates.Added)
                    items.push(value.objData.nodedata.Id);
            });
            userviewmodel.treeviewInstance.UncheckThisNodes(items);
            treeviewInstance.CheckthisNodes(self.hisexceptionaccounts, function () {
                userviewmodel.ExceptionModal.initialized(true);
            });
            if (items && items.length > 0)
                userviewmodel.UserDetailModel.hasChanges(false);
        }
        self.cancelExceptions = function () {
            if (self.dialog)
                self.dialog.modal('hide');

        }
        self.addexception = function (accountid) {
        }
        self.removeexception = function (accoundid) {
        }
        self.initialize = function () {
            self.exceptionaccounts.removeAll();
        }
        self.initialized = function (isloading) {
            if (isloading) {
                $.each(self.exceptionaccounts(), function (index, value) {
                    self.exceptionaccounts()[index].state = acctStates.Intial;
                });
            }
            else {
                $.each(self.exceptionaccounts(), function (index, value) {
                    if (self.exceptionaccounts()[index].state == acctStates.Added)
                        self.exceptionaccounts()[index].state = acctStates.Saved;
                });
            }
        }
        self.getSavedaccounts = function () {
            var saveditems = $.grep(self.exceptionaccounts(), function (item) {
                if (item.state == acctStates.Saved)
                    return item;
            });
            return saveditems;
        }
        self.exceptcount = ko.computed(function () {
            var accnt = ko.contextFor($('#userlistcontainer')[0]).$data;
            if (self.dispAcounts()) {             
                var cnt = _.countBy(self.exceptionaccounts(), function (ec) {
                    return ec.objData.nodetype == "SITE" || (accnt.selectedAccount.nodetype.toLowerCase() == 'dealer' && ec.objData.nodetype == "CUSTOMER") ? 'x' : 'y';
                            });
                return (cnt.x == undefined ? 0 : cnt.x) + " " + Resources.Total_exceptions_here;
            }
        });
        self.onAccountcanged = function (saccount, ischecked) {
            if (ischecked || ischecked == null) {
                if (saccount.nodetype.toLowerCase() == "group") {                    
                    var parentExist = false;
                    var groupElemIndex = -1;
                    $.each(self.exceptionaccounts(), function (index, value) {
                        if (value && value.objData.nodedata.Id.toLowerCase() === saccount.nodedata.Id.toLowerCase()) {
                            saccount.nodedata.IsShared = false;
                            parentExist = true;                            
                            return false;
                        }
                    });
                    if (!parentExist) {
                        $.each(self.exceptionaccounts(), function (index, value) {
                            if (value && value.objData.nodedata.ParentId.toLowerCase() === saccount.nodedata.Id.toLowerCase()) {
                                parentExist = true;
                                groupElemIndex = index;
                                return false;
                            }
                        });
                        if (!parentExist)
                            self.exceptionaccounts.push(new excptListItem(saccount));
                        else
                            self.exceptionaccounts.splice(groupElemIndex, 0, new excptListItem(saccount));
                    }
                }
                else
                    self.exceptionaccounts.push(new excptListItem(saccount));               
            }           
            else {
                $.each(self.exceptionaccounts(), function (index, value) {
                    if (value && value.objData.nodedata.Id.toLowerCase() === saccount.nodedata.Id.toLowerCase())
                        self.exceptionaccounts.remove(value);
                }); 
            }
           
        }
        self.onAccountchecked = function (saccount) {
            self.onAccountcanged(saccount, true)
        }
        self.onAccountunchecked = function (saccount) {
            var isShared = saccount.nodedata.IsShared == true || saccount.nodedata.IsShared == false ? false : null; 
            self.onAccountcanged(saccount, isShared)
        }        
    }

    datacontext.m_permissions = [];
    var appRole = (function (data) {
        var self = this;
        self.RoleId = data.RoleId;
        self.RoleName = data.RoleName;
    });
    var prevEntity = function (data) {
        var self = this;
        self.Id = data.Id;
        self.IsSelected = ko.observable(data.IsSelected);
        self.permissionName = ko.observable(data.Name);
        self.Category = data.Category;
        self.CategoryId = data.CategoryId;
        self.permissionYes = ko.computed({
            read: function () {
                return self.IsSelected();
            }, write: function (value) {

                if (_.contains(noPrivs, self.Id)) {
                    noPrivs.pop(self.Id);
                }
                if (!_.contains(yesPrivs, self.Id))
                    yesPrivs.push(self.Id);
                self.IsSelected(value);

            }, owner: this
        });
        self.permissionNo = ko.computed({
            read: function () {
                return !(self.IsSelected());
            }
            , write: function (value) {
                if (value) {
                    if (_.contains(yesPrivs, self.Id)) {
                        yesPrivs.pop(self.Id);
                    }
                    if (!_.contains(noPrivs, self.Id))
                        noPrivs.push(self.Id);
                    self.IsSelected(false);
                }
                else {
                    self.IsSelected(true);
                }
            },
            owner: this
        });
        self.toJson = function () {
            return ko.toJSON(self);
        }
        self.IsSelected.subscribe(function (newvalue) {
        });
    };
    var catEnt = function (data) {
        var self = this;
        var previousItem;
        self.Originaldata = null;
        self.id = data.Id;
        self.categoryName = ko.observable(data.Name);
        self.Permissions = ko.observableArray([]);
        self.Initialize = function (jsonData) {
            self.Originaldata = jsonData;
            var sortedLst = _.sortBy(jsonData, function (p) {
                return p.Name.toLowerCase();
            });

            var fpr = $.map(sortedLst, function (pItem) {
                if (noPrivs.length > 0) {
                    var result = _.find(noPrivs, function (id) {
                        return pItem.Id == id;
                    });
                    if (result) {
                        privitem = new prevEntity({
                            Id: pItem.Id,
                            IsSelected: false,
                            Name: pItem.Name,
                            Category: null,
                            CategoryId: null
                        });
                        return privitem;
                    }
                }
                privitem = new prevEntity({
                    Id: pItem.Id,
                    IsSelected: pItem.IsSelected,
                    Name: pItem.Name,
                    Category: null,
                    CategoryId: null
                });
                return privitem;
            });
            self.Permissions([]);

            self.Permissions(fpr);
        };
        self.computedcategory = function () {
            return self.categoryName() + "(" + self.Permissions().length + ")";
        }
        self.getsavedpermissions = function (callback) {
            var originalyesPrivs = [],
                originalnoPrivs = [],
                diffrenceyesPrivs = [],
                diffrencenoPrivs = [];
            $.map(self.Originaldata, function (item) {
                if (item.IsSelected) {
                    originalyesPrivs.push(item.Id);
                }
                else {
                    originalnoPrivs.push(item.Id);
                }
            });
            if (yesPrivs.length > 0 && originalyesPrivs.length > 0) {
                diffrenceyesPrivs = _.difference(yesPrivs, originalyesPrivs);
            }
            else {
                diffrenceyesPrivs = yesPrivs;
            }
            if (noPrivs.length > 0 && originalnoPrivs.length > 0) {
                diffrencenoPrivs = _.difference(noPrivs, originalnoPrivs);
            }
            else {
                diffrencenoPrivs = noPrivs;
            }
            if (callback) {
                callback(diffrenceyesPrivs, diffrencenoPrivs);
            }
        }
    }
    var candoModel = function (data) {
        var self = this;
        var isSaved = false;
        self.originaldata = null;
        self.RoleInfo = data.RoleInfo;
        self.Categories = ko.observableArray([]);
        self.Permissions = ko.observableArray([]);
        self.getpermissions = ko.computed(function (event) {
            if (event)
                ko.cleanNode(event.target);
            return [{
                IsSelected: true,
                permissionName: "One",
                Category: null,
                CategoryId: null
            }, {
                IsSelected: true,
                permissionName: "Two",
                Category: null,
                CategoryId: null
            }];
        });
        self.clearCurrentpermissions = function () {
            self.Permissions([]);
            self.Categories([]);
        };

        self.Initialize = function (userId) {
            datacontext.getcategories(self.RoleInfo.RoleId, userId).done(function (jsonResult) {
                var sortedLst = _.sortBy(jsonResult.data, function (c) { return c.Name.toLowerCase(); });
                self.originaldata = sortedLst;
                self.Categories([]);
                var cresult = $.map(sortedLst, function (cItem) {
                    var c = new catEnt(cItem);
                    c.Initialize(cItem.Permissions);
                    return c;
                });

                self.Categories(cresult);

                makeaccordion();
            }).fail(function () { });

            $('#usercandoModal').on('hidden', function (event) {
                self.clearCurrentpermissions();
            });
        }
        function makeaccordion() {
            $(".cdtable").each(function () {
                $(this).find('tbody').toggle();
            });
            $(".ctablehead").click(function () {
                $(this).closest('table').find('tbody').toggle(function () {
                    $(this).animate("300");
                });
                $(this).closest('table').find('tfoot').toggle(function () {
                    $(this).animate("300");
                });
            });
        }
        self.savepermissions = function (data, event) {
            var yAr = [], nAr = [];
            var diffrenceyesPrivs = [], diffrencenoPrivs = [];
            for (var pi = 0; pi < self.Categories().length; pi++) {
                var pCat = self.Categories()[pi];
                pCat.getsavedpermissions(function (yResult, nResult) {
                    yAr.push.apply(yAr, yResult);
                    nAr.push.apply(nAr, nResult);
                });
            }
            diffrenceyesPrivs = _.uniq(yAr);
            diffrencenoPrivs = _.uniq(nAr);
            var basemodel = window.userconfig.operatorhandler.getInstance().getoperatorviewmodel();
            if (basemodel.UserDetailModel) {
                basemodel.UserDetailModel.savepermissions(diffrenceyesPrivs, diffrencenoPrivs);
            }
            console.log("save clicked");
        }
        self.cancelpermissions = function (data, event) {
            // alertify.confirm("All changes wil be lost on CANDO window are you sure", function (e) {
            noPrivs.length = 0;
            yesPrivs.length = 0;
            noPrivs = [];
            yesPrivs = [];
            console.log("save cancel clicked");
            //});
        }
    }

    datacontext.exceptionmodel = excepModel;
    datacontext.candomodel = candoModel;
    datacontext.catEnt = catEnt;
    datacontext.prevEntity = prevEntity;
    datacontext.Approle = appRole;
    var userdetaildataviewmodel = function (data, isList) {
        var self = this;
        self.hasChanges = ko.observable(false);
        var RolesList = [];
        var yesPrevs = [], noPrevs = [];
        data = data || {};
        isList = isList || false;
        self.isInList = isList;
        if (!self.isInList) {

            // $('#editUser .secondary-button.exceptionbutton').hide()
        }
        self.Isnew = ko.observable(false);
        self.PhotoRef = ko.observable();
        self.Id = data.Id;
        self.objectData = data;
        self.AccountId = data.AccountId;
        self.PhotoId = data.PhotoId;
        self.FirstName = ko.observable(data.FirstName);
        self.UserName = ko.observable(data.UserName);
        self.LastName = ko.observable(data.LastName);
        self.IsLocked = ko.observable(data.IsLocked);
        self.IsCreator = ko.observable(data.IsCreator);
        self.Name = ko.computed(function () {
            return self.FirstName() + "," + self.LastName();
        });
        self.RoleInfo = data.RoleInfo;
        ResetObjectWithEmptyValues(data.ContactInfo);
        self.ContactInfo = {
            Phone: ko.observable(data.ContactInfo.Phone),
            WorkPhone: ko.observable(data.ContactInfo.WorkPhone),
            EmailAddress: ko.observable(data.ContactInfo.EmailAddress),
            AlternateEmail: ko.observable(data.ContactInfo.AlternateEmail),
            AddressLine1: ko.observable(data.ContactInfo.AddressLine1),
            City: ko.observable(data.ContactInfo.City),
            Region: ko.observable(data.ContactInfo.Region),
            Country: ko.observable(data.ContactInfo.Country)
        };
        self.onAutoComplete = function (data, el) {
            el.val(data.City);
            self.ContactInfo.City(data.City);
            self.ContactInfo.Region(data.Region);
            self.ContactInfo.Country(data.Country);
        }
        self.CredentialInfo = {
            Password: ko.observable(data.CredentialInfo.Password),
            PinNumber: ko.observable(data.CredentialInfo.PinNumber),
            CardNumber: ko.observable(data.CredentialInfo.CardNumber)
        };
        // If there is password from the system change to dummy password
        if (data.CredentialInfo.Password) {
            self.CredentialInfo.Password("HackNotAllowed@123");
        }
        self.SelectedRole = ko.observable();
        self.SelectedRole.subscribe(function (newVal) {
            self.RoleInfo = newVal;
        });
        self.ApplicationRoles = ko.observableArray([]);
        self.PhotoType = data.PhotoType;
        self.image = ko.observable(data.PhotoRef);


        self.imageType = ko.observable();
        self.imageFile = ko.observable();
        self.imagePath = ko.observable();
        self.IsImageDirty = false;
        self.imageObjectURL = ko.observable();
        self.userPhoto = ko.observable("");
        self.IsImageloaded = ko.observable(true);
        self.userPhoto.subscribe(function (newval) {
            if (newval) {
                self.IsImageloaded(false);

            }
        });
        self.imageSrc = ko.computed(function () {
            if (self.imageType() && self.image()) {
                {
                    self.PhotoType = self.imageFile().type;
                    self.PhotoRef(self.image());
                    self.userPhoto(self.imageType() + "," + self.image());
                    self.IsImageDirty = true;
                }
            }
        });
        self.ErrorMessage = ko.observable("");
        self.IsError = ko.observable(false);
        self.clearerrormessages = function () {
            self.IsError(false);
            self.ErrorMessage("");
        }
        self.setExtender = function () {
            self.FirstName.extend({ watch: this });
            self.LastName.extend({ watch: this });
            self.ContactInfo.Phone.extend({ watch: this });
            self.ContactInfo.AlternateEmail.extend({ watch: this });
            self.ContactInfo.WorkPhone.extend({ watch: this });
            self.ContactInfo.AddressLine1.extend({ watch: this });
            self.ContactInfo.City.extend({ watch: this });
            self.ContactInfo.Region.extend({ watch: this });
            self.ContactInfo.Country.extend({ watch: this });
            self.SelectedRole.extend({ watch: this });
            self.userPhoto.extend({ watch: this });
        }
        self.uploadImage = function (cb) {
            var needtouploadphoto = self.IsImageDirty;
            if (needtouploadphoto) {
                var fileid = self.Isnew() ? 'photonewfile' : 'photofile'
                var fd = new FormData();
                fd.append('photofile', document.getElementById(fileid).files[0]);
                fd.append("BlobId", self.PhotoId);
                fd.append("TypeName", "Photo");
                var url = $('#' + fileid).data("uploadurl")
                ajaxfilePost(url, fd).done(function (result) {
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
        self.saveuserdata = function () {
            try {
                self.clearerrormessages();
                blockUI();
                self.uploadImage(function (newid) {
                    if (newid === "")
                        console.log("error in image upload");
                    if (self.Isnew()) {
                        if (userconfig.validationcontext.validateForm(uicontext.userconfigforms.usermodalform)) { 
                            var accnt = ko.contextFor($('#userlistcontainer')[0]).$data;
                            //self.ExceptionAccounts = self.getexceptionAccounts();   
                            self.ExceptionAccounts = $.grep(self.getexceptionAccounts(), function (item) {
                                if (accnt != null && accnt.selectedAccount != null && (accnt.selectedAccount.nodetype.toLowerCase() == 'dealer' && item.EntityType.toLowerCase() != 'dealer') ||
                                        (accnt.selectedAccount.nodetype.toLowerCase() == 'customer' && item.EntityType.toLowerCase() != 'customer'))
                                    return item;
                            });
                            self.PhotoId = newid;
                            datacontext.adduserwithpermissions(self).done(function (jsonResult) {
                                if (jsonResult.Success) {
                                    yesPrivs.length = 0;
                                    noPrivs.length = 0;
                                    self.Isnew(false);
                                    self.Id = jsonResult.data.Id;

                                    //Update left side list
                                    window.userconfig.uicontext.updateuserlist(self, true);
                                    $.publish(common.events.newuseradded, jsonResult.data);
                                    window.userconfig.uicontext.closecurrentdialog();
                                    alertify.success(common.messages.usercreate_success);
                                    unblockUI();
                                    self.hasChanges(false);
                                }
                                else {
                                    self.IsError(true);
                                    self.ErrorMessage(jsonResult.errorMessage);
                                    unblockUI();
                                }

                            }).fail(function () {
                                //alertify.error(common.messages.usersave_failed);
                                self.IsError(true);
                                self.ErrorMessage(jsonResult.errorMessage);
                                unblockUI();
                            });

                        }
                        else
                            unblockUI();
                    }
                    else {
                        if (userconfig.validationcontext.validateForm(uicontext.userconfigforms.userdetailform)) {
                            self.PhotoId = newid;
                            self.ExceptionAccounts = self.getexceptionAccounts();
                            datacontext.updateuserwithpermissions(self).done(function (result) {
                                if (result.Success) {
                                    yesPrivs.length = 0;
                                    noPrivs.length = 0;
                                    self.PhotoId = result.data.UserInfo.PhotoId;
                                    window.userconfig.uicontext.updateuserlist(self, false);
                                    alertify.success(common.messages.userupdate_success);
                                    unblockUI();
                                    $.publish(common.events.userupdated, result.data);
                                    self.hasChanges(false);
                                }
                                else {
                                    //alertify.error(result.errorMessage);
                                    self.IsError(true);
                                    self.ErrorMessage(result.errorMessage);
                                    unblockUI();
                                }
                            }).fail(function (result) {
                                alertify.error(common.messages.usersave_failed);
                                self.IsError(true);
                                self.ErrorMessage(common.messages.error_onserver);
                                unblockUI();
                            });

                        }
                        else
                            unblockUI();
                    }
                });
            } catch (e) {
                console.error(e);
            }
        }
        self.getexceptionAccounts = function () {
            var userviewmodel = window.userconfig.operatorhandler.getInstance().getoperatorviewmodel();
            if (userviewmodel.ExceptionModal) {
                var accs = $.map(userviewmodel.ExceptionModal.exceptionaccounts(), function (uItem) { return uItem.objData.nodedata });
                return accs;
            }
            else
                return [];
        }
        self.editUserdata = function (data, e) {
            try {
                window.userconfig.userconfigviewmodel.changeviewmode(true);
            } catch (e) {
                console.error("USERDETAILMODEL::ERROR::editUserdata", e);
            }
        }
        self.cancelEdit = function (data, e) {
            try {
                window.userconfig.uicontext.refreshselectedUserDetail();
                // window.userconfig.userconfigviewmodel.changeviewmode(false);
            } catch (e) {
                console.error("USERDETAILMODEL::ERROR::editUserdata", e);
            }
        }
        self.updatedata = function (userdata) {
            try {
                self.objectData = $.parseJSON(userdata.toJson(true));
                self.Isnew(false);
                self.FirstName(userdata.FirstName());
                self.LastName(userdata.LastName());
                self.UserName(userdata.UserName());
                self.PhotoId = userdata.PhotoId;
                self.userPhoto(userdata.userPhoto());
                self.IsLocked(userdata.IsLocked());
            } catch (e) {
            }
        }
        self.deleteSelectedUser = function () {
            uicontext.deleteSelectedUser();
        }
        self.unlockSelectedUser = function () {
            uicontext.unlockSelectedUser(self);
        }
        self.deletephoto = function () {

            if (self.PhotoId == null) {
                self.userPhoto("");
                self.imageFile("");
                return;
            }
            uicontext.deletePhoto(self);


        }
        self.toJson = function (bStripimages) {
            try {
                return getuserdto(bStripimages);

            } catch (e) {

            }
        }
        function getuserdto(bStripimages) {
            var userDto = {
                UserInfo: self,
                PermissionsY: yesPrevs,
                PermissionsN: noPrevs
            };

            var data = ko.toJS(userDto);
            if (bStripimages == undefined) {
                delete data.UserInfo.PhotoRef;
                delete data.UserInfo.userPhoto;
                delete data.UserInfo.image;
            }
            return ko.toJSON(data);
        }
        self.IsSelected = ko.observable(false);
        self.IsSelected.subscribe(function myfunction(newVal) {
            if (!newVal) return;
            $('.user-partial-button #btnDelete').show();
            if (self.IsCreator()) {
                $('#editUser .secondary-button.exceptionbutton').hide();
                $('.user-partial-button #btnDelete').hide();
            }
            else {
                var acct = ko.contextFor($('#userlistcontainer')[0]).$data;
                if (acct && acct.selectedAccount.nodetype.toLowerCase() == 'general')
                    $('#editUser .secondary-button.exceptionbutton').hide();
                else
                    $('#editUser .secondary-button.exceptionbutton').show();
            }

        });
        self.SelectedCategory = ko.observable();
        self.savepermissions = function (yesprivs, noprivs) {
            yesPrevs = yesprivs;
            noPrevs = noprivs;
        }
        self.showexceptions = function () {
            uicontext.showexceptionmodal(self.Isnew(), self.Id);
        }
        self.showcando = function (data, event) {
            uicontext.showCandoFor();
        };
        self.ApplicationRoles.subscribe(function (rolevalues) {
            var userRoleid = self.RoleInfo.RoleId;
            var userRole = $(rolevalues).filter(function (index) {
                if (this.RoleId == userRoleid) {
                    return this;
                }
            });
            if (userRole.length > 0)
                self.SelectedRole(userRole[0]);
        });
        self.assignPrivilege = function (noPermissions, yesPermissions) {
        }
        // @Ravi code for getting photo
        if (self.PhotoId && self.userPhoto() == "") {
            self.IsImageloaded(true);
            if (self.isInList)
                datacontext.getuserphoto(self.PhotoId, true, self.userPhoto, self.ErrorMessage);
            else
                datacontext.getuserphoto(self.PhotoId, false, self.userPhoto, self.ErrorMessage);
        }
        else {
            self.IsImageloaded(false);
        }
        //@Mahesh Code for getting roles
        if (self.RoleInfo) {
            if (datacontext.Approles && datacontext.Approles.length > 0)
                self.ApplicationRoles(datacontext.Approles);
            else {
                datacontext.getapplicationroles(function (roles) {
                    self.ApplicationRoles(roles);
                });

            }
        }

        function Init() {
            window.togglepasswordreset('#usermodalform');
            self.setExtender();
            //self.onShowPass();
        }

        Init();
    }
    var userlistViewModel = function (data, account) {
        data = data || {};
        var self = this;
        var previousSelectedItem;
        self.selectedAccount = account;
        self.IsError = ko.observable(false);
        self.SearchQuery = ko.observable("");
        self.userlistdatasource = ko.observableArray($.map(data.ResultData, function (uItem) { return new userdetaildataviewmodel(uItem, true); }) || []);
        //self.userlistdatasource = ko.computed(function () { })
        //{
        //    var userDataSource = $.map(data.ResultData, function (uItem) { return new userdetaildataviewmodel(uItem); }) || [];
        //    if (self.SearchQuery()) {
        //        var find = self.query().toLowerCase();
        //        return ko.utils.arrayFilter(userDataSource, function (user) {
        //            return user.Name().indexOf(find) >= 0;
        //        });
        //    }
        //    else
        //    {
        //    }
        //}
        //ko.observableArray($.map(data.ResultData, function (uItem) { return new userdetaildataviewmodel(uItem); }) || []);
        self.currentselecteditem = null;
        self.ErrorMessage = ko.observable();
        self.clearerrormessages = function () {
            self.IsError(false);
            self.ErrorMessage("");
        }
        self.totalusers = ko.computed(function () {
            if (self.userlistdatasource()) {
                return self.userlistdatasource().length + " " + Resources.Total_Operators;
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
            if (self.userlistdatasource().length == 0) {
                selectedUser = null;
                return;
            }
            self.userlistdatasource()[0].IsSelected(true);
            self.userselected(self.userlistdatasource()[0]);
            uicontext.onuserselected(self.userlistdatasource()[0]);
        }
        self.userselected = function (data, event) {
            
            if (previousSelectedItem == null || previousSelectedItem == undefined) {
                previousSelectedItem = data;
            }
            else {
                previousSelectedItem.IsSelected(false);
                previousSelectedItem = data;
            }
            data.IsSelected(true);
            console.log(data);
            uicontext.onuserselected(data);
        }
        self.updatenodeitem = function (userdata) {
            previousSelectedItem.updatedata(userdata);
        }
        self.selectpreviousItem = function (selectedItem) {
            // TO DO;
        }
        self.addusertolist = function (userdata) {
            self.userlistdatasource.push(userdata);
        }
        self.removeuserfromlist = function (userdata) {
            self.userlistdatasource.remove(userdata);
        }
    }
    var userbaseviewmodel = function () {
        var self = this;
        self.UserDetailModel = null;
        self.CandoModel = null;
        self.ExceptionModal = null;
        self.UserRoleModel = null;
        self.usersave = function () {
        }
        self.canceloperator = function () {
        }
        self.candosave = function () {
        }
        self.candocancel = function () {
        }
    };
    datacontext.operatorBaseviewmodel = userbaseviewmodel;
    datacontext.userlistViewModel = userlistViewModel;
    datacontext.userdetaildataviewmodel = userdetaildataviewmodel;
    datacontext.getnewuser = function (accountId) {
        return new userdetaildataviewmodel({
            Id: "", AccountId: accountId, ParentId: accountId, FirstName: "", LastName: "", UserName: "",
            ContactInfo: { Phone: "", WorkPhone: "", EmailAddress: "", AlternateEmail: "", AddressLine1: "", City: "", Region: "", Country: "" },
            CredentialInfo: { Password: "", PinNumber: "", CardNumber: "" },
            RoleInfo: {}, ApplicationRoles: ko.observableArray(datacontext.Approles), SelectedRole: ko.observable(datacontext.Approles[0])
        }).Isnew(true);
    }
})(jQuery, ko, window.userconfig.common, window.userconfig.datacontext, window.userconfig.uicontext, window.userconfig.validationcontext);

window.userconfig.userconfigviewmodel = (function ($, datacontext, uicontext) {
    var viewId = "editUser";
    // Users config options
    var userConfigmodel = function () {
        var self = this;
        self.onAutoComplete = function (data, el) {
            el.val(data.City);
            self.ContactInfo.City(data.City);
            self.ContactInfo.Region(data.Region);
            self.ContactInfo.Country(data.Country);
        }
        self.createNewUser = function () {
            console.log("Create new user clicked");
            uicontext.createnewUser();
        }
        self.deleteSelectedUser = function () {
            console.log("delete Selected User clicked");
            uicontext.deleteSelectedUser();
        }
    };
    datacontext.userConfigmodel = userConfigmodel;
    var changeViewmode = function (isEditing) {
        try {
            if (isEditing) {
                $("#" + viewId).show();
                $("#" + viewId + "View").hide();
            }
            else {
                $("#" + viewId).hide();
                $("#" + viewId + "View").show();
            }
        } catch (e) {
            console.error("ERROR ON CHANGEVIEWMODE", e);
        }
    }
    uicontext.initializeUserConfig();
    return {
        changeviewmode: changeViewmode
    }
})(jQuery, window.userconfig.datacontext, window.userconfig.uicontext);
window.userconfig.userexceptionviewmodel = (function ($, datacontext, uicontext) {
    // Users Exceptions
    var userExceptionmodel = function () {
        var self = this;
        self.assignUserExceptions = function () {
            console.log("Create new user clicked");
            uicontext.assignUserExceptions();
        }

    };
    datacontext.userExceptionmodel = userExceptionmodel;
    // uicontext.initializeUserException();
})(jQuery, window.userconfig.datacontext, window.userconfig.uicontext);

window.userconfig.operatorhandler = (function () {
    var instance;
    var opVm = null;
    var operatorHandlerObj = {
    }
    operatorHandlerObj.assignviewmodel = function (viewmodel) {
        console.info("##operatorhandler## Operator base viewmodel assigned");
        opVm = viewmodel;
    }
    operatorHandlerObj.destroyviewmode = function () {
        opVm = null;
    }
    operatorHandlerObj.getoperatorviewmodel = function () {
        return opVm;
    }
    function createInstance() {
        return operatorHandlerObj;
    }
    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

function ResetObjectWithEmptyValues(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (obj[key] == null || obj[key] == undefined) {
                obj[key] = '';
            }
        }
    }
}



