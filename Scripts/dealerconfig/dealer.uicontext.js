/// <reference path="user.common.js" />
/// <reference path="user.datacontext.js" />
/// <reference path="user.validationcontext.js" />
/// <reference path="user.model.js" />
/// <reference path="../pubsub.js" />
window.userconfig.uicontext = (function ($, ko, common, datacontext, validationcontext) {
    var modalOptions = { show: true, keyboard: false, backdrop: "static" }, userpluginarea = 'userconfigcontainer',
    accounttypes = { GENERAL: "general", CUSTOMER: "customer", SITE: "site", GROUP: "group", TIME: "time", DEVICE: "device", DEALER: "dealer" };
    var currentAccountSelected = null;
    var selectedUser = null;
    var selectedApprovedUser = null;
    var currentDialog = null, candoDialog = null, exceptionDialog = null;
    function hidepluginarea(needtohide) {

        if (needtohide) {
            $("." + userpluginarea).hide();
        }
        else { $("." + userpluginarea).show(); }

    }
    function start() {
        $('#Utils  a[href="#approval"]').show();
        ko.applyBindings(new window.MPC.pageheaderViewmodel("Utilities"), document.getElementById("page-header"));
        //dealer binding
        window.userconfig.datacontext.getalldealers(true).done(function (jsonData) {
            if (jsonData.Success) {
                bindinuserlist(jsonData, "userlistcontainer",true);
            }
            else {
                bindinuserlist(null, "userlistcontainer", true);
            }

            //Show error on common error block
        }).fail(function () { });
        window.userconfig.datacontext.getalldealers(false).done(function (jsonData) {
            if (jsonData.Success) {
                bindinuserlist(jsonData, "activeuserlistcontainer",false);
            }
            else {
                bindinuserlist(null, "activeuserlistcontainer", false);
            }

            //Show error on common error block
        }).fail(function () { });
       

    }
    function bindinuserlist(userlist,containerId,bpending) {
        // clear previous binding start
        if (userlist == undefined || userlist == null || userlist == "") {
            console.log("no account pending");            
            userlist = userlist || {};
            userlist.ResultData = userlist.ResultData || [];
            ko.applyBindings(new window.userconfig.datacontext.listViewModel(userlist, bpending), document.getElementById(containerId));
            ko.applyBindings(new window.userconfig.datacontext.billingviewmodel(userlist), document.getElementById("billingcontainer"));

            hideuserdetails();
            return;
        }
        else {
            var model = new window.userconfig.datacontext.listViewModel(userlist, bpending);
            ko.applyBindings(model, document.getElementById(containerId));

            ko.applyBindings(new window.userconfig.datacontext.billingviewmodel(userlist), document.getElementById("billingcontainer"));
            model.selectfirstuser();
        }
    }
    $(document.body).on('click', '.eula-update-tab', function () {
        ko.applyBindings(new datacontext.EluaViewmodel(), document.getElementById("Eulatab"));

    })

   
    function onuserselected(userdata) {
        try {
            selectedUser = userdata;
            console.info("Selected pending Dealer-- > " + userdata);
            blockUI();
            datacontext.onuserselected(userdata);
            datacontext.getdetail().done(function (jsonData) {
                if (jsonData.Success) {
                    binduserdetail(jsonData.ResultData, true);
                    unblockUI();
                }
                else {
                    unblockUI();
                }
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
    function onapprovedSeleceted(userdata) {
        try {
            selectedApprovedUser = userdata;
            console.info("Selected Approved Dealer-- > " + userdata);
            blockUI();
            datacontext.onapprovedSeleceted(userdata);
            datacontext.getdetail().done(function (jsonData) {
                if (jsonData.Success) {
                    binduserdetail(jsonData.ResultData, false);
                    unblockUI();
                }
                else {
                    unblockUI();
                }
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
    function hideuserdetails() {
        $('#userpanel').hide();

    }
    function resetuserdetailform() {
        try {
            var $userdetailform = $("#userdetailform");
            ko.cleanNode($userdetailform[0]);
            var newUserEntity = new datacontext.detaildataviewmodel();
            ko.applyBindings(newUserEntity, $userdetailform[0]);
        } catch (e) {
            console.error(e);
        }
    }
    function binduserdetail(userdetailData, ispending) {
        try {            
            var $userdetailform = null;
            if (ispending)
                $userdetailform = $("#pendingTab #userdetailform");
            else
                $userdetailform = $("#activeTab #userdetailform");
            ko.cleanNode($userdetailform[0]);
            $userdetailform[0].reset();
            var DetailModel = new datacontext.detaildataviewmodel(userdetailData);
            ko.applyBindings(DetailModel, $userdetailform[0]);
            window.configuration.validationcontext.setvalidationfor('userdetailform');            
            $('#userpanel').show();
            //window.userconfig.userconfigviewmodel.changeviewmode(false);
        } catch (e) {
            throw e;
        }
    }
    function bindnewuserentity($modal) {
        ko.cleanNode($modal[0]);
        var newUserEntity = new datacontext.detaildataviewmodel();

        ko.applyBindings(UserDetailModel, $modal[0]);
        // apply validation
        validationcontext.setvalidationfor(userconfigforms.usermodalform);
    }

    function approveSelected() {        
        if (selectedUser == null || selectedUser == undefined) {
            alertify.alert(Resources.Dealer_PendingDealerRequest);
            return;
        }
        alertify.confirm(Resources.Dealer_DoApprove + " " + selectedUser.Name(), function (e) {
            if (e) {
                datacontext.approveUser(selectedUser).done(function (jsonData) {
                    if (jsonData.Success) {
                        alertify.success(selectedUser.Name() + " " + Resources.Dealer_ApprovedSuccessfully);
                        //remove from the user list
                        try {
                            var removecontext = ko.contextFor(document.getElementById("userlistcontainer"));
                            removecontext.$root.removeuserfromlist(selectedUser);
                            var addcontext = ko.contextFor(document.getElementById("activeuserlistcontainer"));
                            addcontext.$root.adduserfromlist(selectedUser);
                            //Reset Detail form to empty   
                            resetuserdetailform();
                            selectedUser = null; 
                            removecontext.$root.selectfirstuser();
                            addcontext.$root.selectfirstuser();
                        } catch (e) {
                            console.error("error updating user list", e);
                        }
                    }
                    else {
                        alertify.error(Resources.Dealer_FailedtoApprove + ": " + jsonData.errorMessage);
                    }
                }).fail(function () { });
            }
        });
    }
    function deleteSelectedUser() {
        if (selectedUser == null || selectedUser == undefined) {
            alertify.alert(Resources.Dealer_PendingDealerRequest);
            return;
        }
        alertify.confirm(Resources.Do_you_want_delete + " " + selectedUser.Name(), function (e) {
            if (e) {
                datacontext.deleteUser(selectedUser).done(function (jsonData) {
                    if (jsonData.Success) {
                        alertify.success(selectedUser.Name() + Resources.Dealer_DeletedSuccessfully);
                        // $.publish(common.events.deleteusersuccess, jsonData.data);
                        //remove from the user list
                        try {
                            var context = ko.contextFor(document.getElementById("userlistcontainer"));
                            context.$root.removeuserfromlist(selectedUser);
                            //Reset Detail form to empty
                            resetuserdetailform();
                            selectedUser = null;
                            $('#userpanel').hide();
                        } catch (e) {
                            console.error("error updating user list", e);
                        }
                    }
                    else {
                        alertify.error(Resources.Delete_failed + ": " + jsonData.errorMessage);
                    }
                }).fail(function () { });
            }
        });
    }
    function updateuserlist(userdata, isnew) {
        try {
            var context;
            if ($("#myTab li.active a").attr("href") == '#pendingTab')
                context = ko.contextFor(document.getElementById("userlistcontainer"));
            else
                context = ko.contextFor(document.getElementById("activeuserlistcontainer"));
            if (isnew)
                context.$root.addusertolist(userdata);
            else
                context.$root.updatenodeitem(userdata);
        } catch (e) {
            console.error("error updating user list", e);
        }
    }
    function showloadingon(activeview) {
        $(activeview).showLoading();
    }
    function hideloadingon(activeview) {
        $(activeview).hideLoading();
    }
    //download Billing summary excel sheet start
    function getDownloadUrl(fileName, fileType) {
        return $("#billingcontainer").data('url') + '/DownloadReport?fileName=' + fileName + '&fileType=' + fileType;
    }
    function downloadBillingSummary() {
        var systeadminid = '';
        datacontext.getBillingSummary(systeadminid).done(function (jsonData) {
            if (jsonData.Success) {
                var fileName = "BillingSummary";
                var fileType = "xls";
                window.location.href = getDownloadUrl(fileName, fileType);
            }
            else {
                alertify.error(Resources.Dealer_FailedDownload + ": " + jsonData.errorMessage);
            }
        }).fail(function () {
            alertify.error(Resources.Dealer_FailedDownload);
        });
    }
   
    return {
        start: start,
        deleteSelectedUser: deleteSelectedUser,
        onuserselected: onuserselected,
        onapprovedSeleceted: onapprovedSeleceted,
        updateuserlist: updateuserlist,
        approveSelected: approveSelected,
        downloadBillingSummary: downloadBillingSummary

    };
})(jQuery, ko, window.userconfig.common, window.userconfig.datacontext, window.userconfig.validationcontext);
