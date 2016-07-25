/// <reference path="user.common.js" />
/// <reference path="user.datacontext.js" />
/// <reference path="user.validationcontext.js" />
/// <reference path="user.model.js" />
/// <reference path="../pubsub.js" />
window.userconfig.uicontext = (function ($, ko, common, datacontext, validationcontext) {
    var userconfigforms = {
        usercontainerform: "usercontainerform",
        userdetailform: "userdetailform",
        usermodalform: "usermodalform",
        candomodalform: "candomodalform"
    }, modalOptions = { show: true, keyboard: false, backdrop: "static" }, userpluginarea = 'userconfigcontainer',
    accounttypes = { GENERAL: "general", CUSTOMER: "customer", SITE: "site", GROUP: "group", TIME: "time", DEVICE: "device", DEALER: "dealer" };
    var currentAccountSelected = null;
    var selectedUser = null;
    var currentDialog = null, candoDialog = null, exceptionDialog = null;
    function hidepluginarea(needtohide) {

        if (needtohide) {
            $("." + userpluginarea).hide();
        }
        else { $("." + userpluginarea).show(); }

    }
    function onaccountSelected(accountData) {
        if (accountData == undefined || accountData == null) {
            hidepluginarea(true);
        }
        else {
            currentAccountSelected = accountData;
            // allowing user to be seen at group level
            //accountData.nodedata.EntityType.toLowerCase() != accounttypes.GROUP &&
            if (accountData.nodedata.EntityType.toLowerCase() == accounttypes.DEALER ||
                accountData.nodedata.EntityType.toLowerCase() == accounttypes.CUSTOMER ||
                accountData.nodedata.EntityType.toLowerCase() == accounttypes.GENERAL) {
                hidepluginarea(false);
                window.userconfig.datacontext.onaccountSelected(accountData);
                window.userconfig.datacontext.getapplicationroles();
                window.userconfig.datacontext.getallusers().done(function (jsonData) {
                    if (jsonData.Success) {
                        bindinuserlist(jsonData);
                    }
                    else {
                        bindinuserlist(null);
                    }
                    //Show error on common error block
                    if (accountData.nodedata.EntityType.toLowerCase() == accounttypes.GENERAL)
                        $('#editUser .secondary-button.exceptionbutton').hide();
                    //else {
                    //    $('#editUser .secondary-button.exceptionbutton').show();
                    //}
                }).fail(function () { });
            }
            else {
                hidepluginarea(true);
                return;
            }
        }
    }
    function bindinuserlist(userlist) {
        // clear previous binding 
        if (userlist == undefined || userlist == null || userlist == "") {
            console.log("threre are no users for selected account")
            userlist = userlist || {};
            userlist.ResultData = userlist.ResultData || [];
            ko.applyBindings(new datacontext.userlistViewModel(userlist, currentAccountSelected), document.getElementById("userlistcontainer"));
            hideuserdetails();
            return;
        }
        else {
            var model = new datacontext.userlistViewModel(userlist, currentAccountSelected);
            ko.applyBindings(model, document.getElementById("userlistcontainer"));
            model.selectfirstuser();
        }
    }
    function onuserselected(userdata) {
        try {
            if($('#operatorslink').parent().hasClass('active'))
                blockUI();
            selectedUser = userdata;
            console.info("On userselected of Userconfig ui context, Selected user-- > " + userdata);
            datacontext.onuserselected(userdata);
            datacontext.getuserdetail().done(function (jsonData) {
                if (jsonData.Success) {
                    binduserdetail(jsonData.ResultData);
                }
                else {
                    
                }
                unblockUI();
                //Show error on common error block
            }).fail(function () { });
            try {
                $.publish(common.events.onuserselectedevent, userdata);
            } catch (e) {
            }
        } catch (e) {
            console.error(e);
        }
    }
    function refreshselectedUserDetail() {
        try {
            console.info("Refresh selected user")
            datacontext.getuserdetail().done(function (jsonData) {
                if (jsonData.Success) {
                    binduserdetail(jsonData.ResultData);
                }
                else {
                }
                //Show error on common error block
            }).fail(function () { });

            try {
                // $.publish(common.events.onuserselectedevent, userdata);
            } catch (e) {
            }
        } catch (e) {
            console.error(e);
        }
    }
    function hideuserdetails() {
        $('#userpanel').hide();

    }
    function resetuserdetailform() {
        try {
            var $userdetailform = $("#" + userconfigforms.userdetailform);
            ko.cleanNode($userdetailform[0]);
            var newUserEntity = datacontext.getnewuser(currentAccountSelected.nodedata.Id);
            ko.applyBindings(newUserEntity, $userdetailform[0]);
        } catch (e) {
            console.error(e);
        }
    }
    function binduserdetail(userdetailData) {
        try {
            var operatorviewmodel = new datacontext.operatorBaseviewmodel();
            var $userdetailform = $("#" + userconfigforms.userdetailform);
            ko.cleanNode($userdetailform[0]);
            $userdetailform[0].reset();
            var userdetailviewmodel = new datacontext.userdetaildataviewmodel(userdetailData);
            operatorviewmodel.UserDetailModel = userdetailviewmodel;
            googleAutocomplete('editUser', 'user_City', operatorviewmodel.UserDetailModel.onAutoComplete);
            window.userconfig.operatorhandler.getInstance().assignviewmodel(operatorviewmodel);
            ko.applyBindings(operatorviewmodel.UserDetailModel, $userdetailform[0]);
            validationcontext.setvalidationfor(userconfigforms.userdetailform);
            $('#userpanel').show();
            //window.userconfig.userconfigviewmodel.changeviewmode(false);
        } catch (e) {
            throw e;
        }
    }
    function createnewUser() {
        try {
            console.log("Create new user clicked on ui context");
            if (currentAccountSelected == null || currentAccountSelected == undefined) {
                alertify.alert(Resources.Please_select_one_account);
                return;
            }
            if ((currentAccountSelected.nodedata.EntityType.toLowerCase() != accounttypes.CUSTOMER &&
                currentAccountSelected.nodedata.EntityType.toLowerCase() != accounttypes.GENERAL &&
                currentAccountSelected.nodedata.EntityType.toLowerCase() != accounttypes.DEALER)) {
                alertify.alert(common.messages.usernotallowedhere);
                return;
            }
            var type = currentAccountSelected.nodedata.EntityType.toLowerCase();
            if (type === 'site' || type === 'customer' || type === 'dealer')
                $('#usermodalform .secondary-button.exceptionbutton').show()
            else
                $('#usermodalform .secondary-button.exceptionbutton').hide()

            $(document.getElementById("usermodalform"))[0].reset();
            var $userconfigModal = $("#operatorModal");
            currentDialog = $userconfigModal;
            bindnewuserentity($userconfigModal);
            $userconfigModal.modal(modalOptions);
        } catch (e) {
            console.error("ERROR ## createnewUser", e);
        }
    }
    function bindnewuserentity($modal) {
        ko.cleanNode($modal[0]);
        var newUserEntity = datacontext.getnewuser(currentAccountSelected.nodedata.Id);
        var opertorBasemodel = new datacontext.operatorBaseviewmodel();
        opertorBasemodel.UserDetailModel = newUserEntity;
        googleAutocomplete('usermodalform', 'user_City', opertorBasemodel.UserDetailModel.onAutoComplete);
        window.userconfig.operatorhandler.getInstance().assignviewmodel(opertorBasemodel);
        ko.applyBindings(opertorBasemodel.UserDetailModel, $modal[0]);
        // apply validation
        validationcontext.setvalidationfor(userconfigforms.usermodalform);
    }
    var template = '';
    function showexceptionmodal(isNew, AccountId) {
        try {
            console.log("EXception clicked on ui context");
            var dialogcontext = ko.contextFor(document.getElementById("userExceptionsModal"));
            var uiselecteditems = [];
            if (dialogcontext && dialogcontext.$data) {
                var items = dialogcontext.$data.getSavedaccounts();
                for (var i = 0; i < items.length; i++) {
                    uiselecteditems.push(items[i].objData.nodedata.Id);
                }
            }
           
            var userviewmodel = window.userconfig.operatorhandler.getInstance().getoperatorviewmodel();
            userviewmodel.ExceptionModal = new datacontext.exceptionmodel(isNew);
            var isbinded = $('#userExceptionsModal').attr('databinded');
            if (!isbinded) {
                template = $('#userExceptionsModal').html();
                $('#userExceptionsModal').attr('databinded', true);                
            }
            else {
                $('#userExceptionsModal').html(template);
                ko.cleanNode(document.getElementById("userExceptionsModal"));
            }
            var $exceptionmodal = $("#userExceptionsModal");
            $exceptionmodal.modal(modalOptions);
            userviewmodel.ExceptionModal.dialog = $exceptionmodal;
            userviewmodel.ExceptionModal.uiselecteditems = uiselecteditems;
            $exceptionmodal.on("shown", function () {
                ko.applyBindings(userviewmodel.ExceptionModal, document.getElementById("userExceptionsModal"));
                exceptionTreeloader.showexceptiontree(currentAccountSelected, AccountId);
                exceptionTreeloader.treeviewInstance
            })

        } catch (e) {

        }
    }
    function showCandoFor() {
        try {
            var $candomodal = $('#usercandoModal');
            candoDialog = $candomodal;
            ko.cleanNode($candomodal[0]);

            var userviewmodel = window.userconfig.operatorhandler.getInstance().getoperatorviewmodel();
            if (userviewmodel) {
                userviewmodel.CandoModel = new datacontext.candomodel({ RoleInfo: userviewmodel.UserDetailModel.RoleInfo });
                if (userviewmodel.UserDetailModel.Id) {
                    userviewmodel.CandoModel.Initialize(userviewmodel.UserDetailModel.Id);
                }
                else {
                    userviewmodel.CandoModel.Initialize(null);
                }
                ko.applyBindings(userviewmodel.CandoModel, $candomodal[0]);
                $candomodal.modal(modalOptions);
                console.log("CANDO clicked on ui context");
            }
        } catch (e) {
            console.log("Exception on cando clicked");
        }
    }
    function bindcandoforuser($modal, userData) {
        try {
            var selectedRoleId = userData.SelectedRole().RoleId;
            //datacontext.getcategories().done(function (jsonResult) {
            //    if (jsonResult.Success) {
            //        userData.Categories([]);
            //        userData.Categories($.map(jsonResult.data, function (cItem) { return new datacontext.catEnt(cItem); }));
            //    }
            //}).fail(function () {
            //    console.error("Error on loading Category info");
            //});
            var rolePermissions = [];
            datacontext.getrolepermissions(selectedRoleId).done(function (jsonResult) {
                if (jsonResult.Success) {
                    rolePermissions = $.map(jsonResult.data, function (pItem) {
                        return new datacontext.prevEntity({
                            Id: pItem.Id,
                            Name: pItem.Name,
                            IsSelected: true,
                            Category: pItem.Category,
                            CategoryId: pItem.CategoryId
                        });
                    });

                    //var userCandoModel = new userData.usercandoModel({
                    //    UserInfo: {}
                    //});

                    //Populate permissions based role for user
                    userData.PopulatePermissions(rolePermissions);

                    //userData.AssignPermissions(datacontext.m_permissions);
                }
            }).fail(function () {
                conso.error("Error on loading permissions info");
            });

        } catch (ex) {
            console.error("Error on binding cando modal", ex);
        }

        //try {
        //    var t = [{ Name: "Permission1", IsSelected: true },
        //           { Name: "Permission2", IsSelected: true },
        //           { Name: "Permission3", IsSelected: true }];

        //    userData.Permissions($.map(t, function (pItem) {
        //        return new datacontext.prevEntity(pItem);
        //    }));

        //    ko.cleanNode($modal[0]);
        //    ko.applyBindings(userData, $modal[0]);
        //} catch (ex) {
        //    console.error("Error on binding cando modal", ex);
        //}
    }
    function closecandodialog() {
        if (candoDialog) {
            candoDialog.modal("hide");
        }
    }
    function assignUserExceptions() {
        try {
            var $userExceptionModal = $("#userExceptionsModal");
            currentDialog = $userExceptionModal;
            $userExceptionModal.modal(modalOptions);
            console.log("Exceptions clicked for the user");

        } catch (e) {
            console.log("Exception on Userexceptions clicked");
        }
    }
    function deletePhoto(usermodel) {
        if (selectedUser == null || selectedUser == undefined) {
            alertify.alert(Resources.Please_select_one_User);
            var xe = new exceptionTreeloader("");
            xe.showexceptiontree();
            xe.treeviewInstance.EnableCheckbox(true);
            return;
        }
        alertify.confirm(Resources.Do_you_want_delete + " Photo", function (e) {
            if (e) {
                datacontext.deleteUserPhoto(usermodel).done(function (jsonData) {
                    if (jsonData.Success) {
                        alertify.success(Resources.Successfully_deleted);
                        //To remove photo from the tag        
                        usermodel.PhotoId = null;
                        usermodel.userPhoto("");
                        $($('#editUser').find(':file')).val('');
                        window.userconfig.uicontext.updateuserlist(usermodel, false);
                    }
                    else {
                        alertify.error(Resources.Delete_failed + ": " + jsonData.errorMessage);
                    }
                }).fail(function () { });
            }
        });
    }
    function deleteSelectedUser() {
        if (selectedUser == null || selectedUser == undefined) {
            alertify.alert(Resources.Please_select_one_User);
            //var xe = new exceptionTreeloader("");
            //xe.showexceptiontree();
            //xe.treeviewInstance.EnableCheckbox(true);
            return;
        }
        alertify.confirm(Resources.Do_you_want_delete + " " + Resources.Operator + " '" + selectedUser.Name() + "' ", function (e) {
            if (e) {
                blockUI();
                datacontext.deleteUser(selectedUser).done(function (jsonData) {
                    if (jsonData.Success) {
                        alertify.success(selectedUser.Name() + " " + Resources.Successfully_deleted);
                        $.publish(common.events.deleteusersuccess, jsonData.data);
                        //remove from the user list
                        try {
                            var context = ko.contextFor(document.getElementById("userlistcontainer"));
                            context.$root.removeuserfromlist(selectedUser);
                            //Reset Detail form to empty
                            resetuserdetailform();
                            context.$root.selectfirstuser();
                        } catch (e) {
                            console.error("error updating user list", e);
                        }
                    }
                    else {
                        alertify.error(Resources.Delete_failed + ": " + jsonData.errorMessage);
                    }
                    unblockUI();
                }).fail(function () {
                    unblockUI();
                });
            }
        });
    }
    function unlockSelectedUser(user) {
        if (user == null || user == undefined) {
            alertify.alert(Resources.Please_select_one_User);
            return;
        }
        datacontext.unlockUser(user).done(function (jsonData) {
            if (jsonData.Success) {
                alertify.success(user.Name() + " " + Resources.Successfully_Unlocked);

                try {
                    var context = ko.contextFor(document.getElementById("userlistcontainer"));
                    user.IsLocked(false);
                    window.userconfig.uicontext.updateuserlist(user, false);

                } catch (e) {
                    console.error("error unlocking user", e);
                }
            }
            else {
                alertify.error(Resources.User_Unblock_Failed + ": " + jsonData.errorMessage);
            }
        }).fail(function () { });

    }
    function closecurrentdialog() {
        if (currentDialog != undefined || currentDialog != null) {
            currentDialog.modal("hide");
        }
        var e = new exceptionTreeloader("");
    }
    function closeexceptiondialog() {
        if (exceptionDialog) {
        }
    }
    function updateuserlist(userdata, isnew) {
        try {
            var context = ko.contextFor(document.getElementById("userlistcontainer"));
            if (isnew) {
                context.$root.addusertolist(userdata);
                context.$root.userselected(userdata);
            }
            else
                context.$root.updatenodeitem(userdata);
        } catch (e) {
            console.error("error updating user list", e);
        }
    }
    function initializeUserConfig() {
        // Bind to create button
        var node = $('#operatorCreate');
        if (node.length > 0)
            ko.applyBindings(new datacontext.userConfigmodel(), node[0]);
    }
    function initializeUserException() {
        var node = $('#operatorExceptions');
        if (node.length > 0)
            ko.applyBindings(new datacontext.userExceptionmodel(), node[0]);
    }
    function setvalidationerrorOn(options) {
        if ("formid" in options) {
            var $form = $("#" + options["formid"]);
            var errorElement = $form.children(".errorSummary");
            if ("errorMessage" in options) {
                errorElement.html(options["errorMessage"]);
                errorElement.removeClass("hideerrorSummary");
                errorElement.addClass("showerrorSummary");
            }
            else {
                errorElement.html("");
                errorElement.addClass("hideerrorSummary");
                errorElement.removeClass("showerrorSummary");
            }
        }
        else {
            console.error("formid cannot be empty, Please set formid to show errorSummary");
        }
    }
    function showloadingon(activeview) {
        $(activeview).showLoading();
    }
    function hideloadingon(activeview) {
        $(activeview).hideLoading();
    }
    function init() {

        hidepluginarea(true);
    }
    init();
    return {
        initialize: init,
        userconfigforms: userconfigforms,
        createnewUser: createnewUser,
        deleteSelectedUser: deleteSelectedUser,
        unlockSelectedUser: unlockSelectedUser,
        initializeUserConfig: initializeUserConfig,
        onaccountSelected: onaccountSelected,
        onuserselected: onuserselected,
        closecurrentdialog: closecurrentdialog,
        updateuserlist: updateuserlist,
        setvalidationerrorOn: setvalidationerrorOn,
        assignUserExceptions: assignUserExceptions,
        initializeUserException: initializeUserException,
        setvalidationerrorOn: setvalidationerrorOn,
        showCandoFor: showCandoFor,
        closecandodialog: closecandodialog,
        closeexceptiondialog: closeexceptiondialog,
        showexceptionmodal: showexceptionmodal,
        refreshselectedUserDetail: refreshselectedUserDetail,
        deletePhoto: deletePhoto
    };
})(jQuery, ko, window.userconfig.common, window.userconfig.datacontext, window.userconfig.validationcontext);

function exceptionTreeloader(userId) {
    var userid = userId;
    var that = this;
    this.treeviewInstance = null;
    this.checkuserhaspermissions = function () {
    };
    this.isLoaded = false;
}
//exceptionTreeloader.loadTreeData = function () {
//    window.userconfig.datacontext.getassociatedaccounts(userId, selectedAccount.nodedata.EntityType).done(function (jsonResult) {
//        if (jsonResult.Success) {
//            treeviewInstance.LoadDataSource(jsonResult.data, function () {
//                //  treeviewInstance.CheckthisNodes([selectedAccountid], true);
//                var elems = [];
//                if (jsonResult.data[0].IsShared) {
//                    for (var i = 0; i < jsonResult.data[0].Children.length; i++) {
//                        elems.push(jsonResult.data[0].Children[i].Id)
//                    }
//                }
//                else {
//                    for (var i = 0; i < jsonResult.data[0].Children.length; i++) {
//                        if (jsonResult.data[0].Children[i].IsShared)
//                            elems.push(jsonResult.data[0].Children[i].Id)
//                    }
//                }
//                treeviewInstance.CheckthisNodes(elems, true);
//            });
//        }
//        else {
//            console.error("Error on loading exception tree");
//        }
//    });
//}
exceptionTreeloader.showexceptiontree = function (selectedAccount, userId) {
    var userviewmodel = window.userconfig.operatorhandler.getInstance().getoperatorviewmodel();
    // if (userviewmodel.UserDetailModel.Isnew() && userviewmodel.treeviewInstance) return;
    console.log("exception");
    var $uiTreeviewEle = $("#exTreeview");
    var serviceModel = new ServiceModel();
    serviceModel.serviceurl(userconfig.common.geturlforaction("GetExceptionAccounts"));
    serviceModel.schema.idfield = "Id";
    serviceModel.schema.statusqueryidfield = "StatusQueryId";
    serviceModel.schema.dataTextFeild = "Name";
    serviceModel.schema.dataSpriteIcon = "EntityType";
    serviceModel.schema.uniqueId = "Id";
    serviceModel.schema.children = "Children";
    serviceModel.events.itemselected = "extreeviewitemselected";
    serviceModel.events.itemsloaded = "exonaccountsloaded";
    serviceModel.events.itemupdated = "exonaccountupdated";
    var noneditabletypes = ["General"];//["General", "Dealer", "Customer"]
    var type = selectedAccount.nodedata.EntityType.toLowerCase();
    if (type === 'dealer') {
        noneditabletypes.pop();
        noneditabletypes.push("Site");
        noneditabletypes.push("Group");       
    }

    treeviewInstance = $("#exTreeview").treeview({
        servicemodel: serviceModel,
        mode: "101", noneditabletypes: noneditabletypes, selectionmode: "excepsingle",
        OnNodeChecked: userviewmodel.ExceptionModal.onAccountchecked,
        OnNodeUnChecked: userviewmodel.ExceptionModal.onAccountunchecked
    });
    treeviewInstance.EnableCheckbox(true);
    userviewmodel.treeviewInstance = treeviewInstance;
    if (true) {
        // var accs = $.map(userviewmodel.ExceptionModal.exceptionaccounts(), function (uItem) { return uItem.objData.nodedata });
        userviewmodel.ExceptionModal.initialize();      
        window.userconfig.datacontext.getassociatedaccounts(userId, selectedAccount.nodedata.Id, selectedAccount.nodedata.EntityType).done(function (jsonResult) {
            if (jsonResult.Success) {
                treeviewInstance.LoadDataSource(jsonResult.data, function () {
                    //  treeviewInstance.CheckthisNodes([selectedAccountid], true);  
                    var elems = [], hisexceptionaccounts = userviewmodel.ExceptionModal.hisexceptionaccounts;
                    if (jsonResult.data[0].IsShared) {
                        for (var i = 0; i < jsonResult.data[0].Children.length; i++) {
                            elems.push(jsonResult.data[0].Children[i].Id);
                            hisexceptionaccounts.push(jsonResult.data[0].Children[i].Id);
                        }
                    }
                    else {
                        for (var i = 0; i < jsonResult.data[0].Children.length; i++) {
                            if (jsonResult.data[0].Children[i].EntityType.toLowerCase() == "group") {
                                for (var j = 0; j < jsonResult.data[0].Children[i].Children.length; j++) {
                                    if (jsonResult.data[0].Children[i].Children[j].IsShared) {
                                        if (elems.indexOf(jsonResult.data[0].Children[i].Id) == -1 && jsonResult.data[0].Children[i].IsShared) {
                                            elems.push(jsonResult.data[0].Children[i].Id);
                                            hisexceptionaccounts.push(jsonResult.data[0].Children[i].Id);
                                        }
                                        else if (jsonResult.data[0].Children[i].Children[j].IsShared) {
                                            elems.push(jsonResult.data[0].Children[i].Children[j].Id);
                                            hisexceptionaccounts.push(jsonResult.data[0].Children[i].Children[j].Id);
                                        }
                                    }
                                }
                            }
                            else if (jsonResult.data[0].Children[i].IsShared) {
                                elems.push(jsonResult.data[0].Children[i].Id);
                                hisexceptionaccounts.push(jsonResult.data[0].Children[i].Id);
                            }
                            
                        }
                    }
                    treeviewInstance.CheckthisNodes(elems, function () {
                        userviewmodel.ExceptionModal.initialized(true);

                    });
                    //if (userviewmodel.ExceptionModal.uiselecteditems && userviewmodel.ExceptionModal.uiselecteditems.length > 0)
                    //    treeviewInstance.CheckthisNodes(userviewmodel.ExceptionModal.uiselecteditems, function () {                            
                    //        userviewmodel.ExceptionModal.initialized();

                    //    });

                });
                isLoaded = true;
            }
            else {
                console.error("Error on loading exception tree");
            }
        });
    }
    //    else {
    //    window.userconfig.datacontext.getexceptiontree(selectedAccount).done(function (jsonResult) {
    //        if (jsonResult.Success) {
    //            treeviewInstance.LoadDataSource(jsonResult.data, function () {
    //                var elems = [];
    //                for (var i = 0; i < jsonResult.data[0].Children.length; i++) {
    //                    elems.push(jsonResult.data[0].Children[i].Id)
    //                }
    //                treeviewInstance.CheckthisNodes(elems, true);
    //                var userviewmodel = window.userconfig.operatorhandler.getInstance().getoperatorviewmodel();
    //            });
    //        }
    //        else {
    //        console.error("Error on loading exception tree");
    //    }
    //});
    //}

};