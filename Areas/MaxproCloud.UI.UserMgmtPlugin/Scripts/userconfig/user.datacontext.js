/// <reference path="user.common.js" />
/// <reference path="usersplugincore.js" />

window.userconfig.datacontext = (function ($, ko, common) {
    var selectedUser = null;
    var currentAccount = null;
    var datacontext = {
        saveupdateduser: saveupdateduser,
        onaccountSelected: onaccountSelected,
        deleteUser: deleteUser,
        unlockUser:unlockUser,
        addnewuser: addnewuser,
        applylistbindings: applylistbindings,
        applyuserdetailbinding: applyuserdetailbinding,
        getallusers: getallusers,
        onuserselected: onuserselected,
        getuserdetail: getuserdetail,
        getapplicationroles: getapplicationroles,
        getrolepermissions: getrolepermissions,
        getuserphoto: getuserphoto,
        getcategories: getcategories,
        adduserwithpermissions: adduserwithpermissions,
        updateuserwithpermissions: updateuserwithpermissions,
        getexceptiontree: gettreedataforException,
        deleteUserPhoto: deleteUserPhoto,
        getassociatedaccounts: getassociatedaccounts,
        getdisassociatedaccounts: getdisassociatedaccounts,
        saveassociatedaccounts: saveassociatedaccounts,
    };
    datacontext.Approles = null;
    var data = null;
    return datacontext;
    function updateuserwithpermissions(data) {
        try {
            if (data != undefined && data != null) {
                return ajaxRequest("POST", userupdateurl(), data);
            }
        } catch (e) {
            console.error("User details update  Error:" + e.message);
        }
    }
    function adduserwithpermissions(data) {
        try {
            if (data != undefined && data != null) {
                return ajaxRequest("POST", usersaveurl(), data);
            }
        } catch (e) {
            console.error("User details update  Error:" + e.message);

        }
    }
    function getrolepermissions(roleId, userid) {
        if (userid) {
            data = ({ ur: roleId, userid: userid });
        }
        else {
            data = ({ ur: roleId });
        }
        return ajaxRequest("POST", getpermissionsurl(),data);
    }
    function getcategories(rid, uid) {
        if (uid) {
            data = ({ roleId: rid, userId: uid });
        }
        else {
            data = ({ roleId: rid});
        }
       
        return ajaxRequest("POST", getcategoriessurl(),data);
    }
    function gettreedataforException(selAcnt) {
        data = ({ sacId: selAcnt.nodedata.Id, EntityType: selAcnt.nodedata.EntityType });
        return ajaxRequest("POST", common.geturlforaction("GetFullExceptionTree") ,data);
    }
    function getassociatedaccounts(userId,accountid, acctype) {
        data = ({ userId: userId, selAccType: acctype, selectedaccount: accountid });
        return ajaxRequest("POST", common.geturlforaction("GetAssociatedAccounts"), data);
    }
    function saveassociatedaccounts(userId, accts) {
        data = ({ userId: userId, accountIds: accts });
        return ajaxRequest("POST", common.geturlforaction("AssociateUserToAccount"), data);
    }
    

    function getdisassociatedaccounts(userId) {
        data = ({ userId: userId });
        return ajaxRequest("POST", common.geturlforaction("GetdisAssociatedAccounts"), data);
    }
    function getapplicationroles() {
        data = ({ acid: currentAccount.nodedata.Id ,acType:currentAccount.nodedata.EntityType});
        // ajaxRequest("GET", getrolesurl(currentAccount.nodedata.Id, currentAccount.nodedata.EntityType)).done(function (jsonResult) {
        ajaxRequest("POST", getrolesurl(),data).done(function (jsonResult) {
            if (jsonResult.Success) {
                jsonResult.data = jsonResult.data || {};
                datacontext.Approles = $.map(jsonResult.data, function (roleItem) {
                    return new datacontext.Approle(roleItem);
                });
                return datacontext.Approles;
            }
        }).fail(function () { });
    }
    function resetvalues() {
    }
    function onaccountSelected(accountData) {
        currentAccount = accountData;
    }
    function onuserselected(userdata) {
        selectedUser = userdata;
    }
    function getallusers() {
        if (currentAccount == null || currentAccount == undefined) return null;
        data = ({ id: currentAccount.nodedata.Id });
        return ajaxRequest("POST", userlisturl(),data);

    }
    function getuserdetail(Id) {
       
        try {
            if (Id) {
                data = ({ userid: Id });
            }
            else {
                data = ({ userid: selectedUser.Id });
            }
            return ajaxRequest("POST", userdetailurl(),data);
        }
        catch (e) {
        }
    }
    function getuserphoto(photoId,isThumb, photoObserable, errorObserable) {
        photoObserable(userphotourl(photoId, isThumb));
       
    }
    function addnewuser(data) {
        try {
            if (data != undefined && data != null) {
                return ajaxRequest("POST", usersaveurl(), data);
            }
        } catch (e) {
            console.error("User details update  Error:" + e.message);

        }

    }
    function saveupdateduser(data) {
        try {
            if (data != undefined && data != null) {
                return ajaxRequest("POST", userupdateurl(), data);
            }
        } catch (e) {
            console.error("User details update  Error:" + e.message);
        }
    }
    function deleteUser(data) {
        try {
            if (data != undefined && data != null) {
                data = ({ Id: selectedUser.Id });
                return ajaxRequest("POST", userdeleteurl(),data);
            }
        } catch (e) {
            console.error("User details delete  Error:" + e.message);

        }
    }
    function unlockUser(selectedUser) {
        try {
            if (selectedUser != undefined && selectedUser != null) {
                data = ({ Id: selectedUser.Id });
                return ajaxRequest("POST", unblockuserurl(),data);
            }
        } catch (e) {
            console.error("User unlock Error:" + e.message);

        }
    }
    function deleteUserPhoto(data) {
        try {
            if (data != undefined && data != null) {
                data = ({ Id: data.PhotoId });
                return ajaxRequest("POST", photodeleteurl(),data);
            }
        } catch (e) {
            console.error("User details delete  Error:" + e.message);

        }
    }

    function applylistbindings(data) {
        try {
            if (data != undefined && data != null) {
                var userlistform = document.getElementById("userlistcontainer");
                var userlistviewmodel = new userlistViewModel();
                getallusers(userlistviewmodel, data.Id);
                userlistviewmodel.caption(data.Name);
                ko.applyBindings(userlistviewmodel, userlistform);
            }
        } catch (e) {
            console.error("ApplyListBindings in UserConfigDataContext Error:" + e.message);
        }
    }
    function applyuserdetailbinding(data) {
        try {
            if (data != undefined && data != null) {
                var userdetailform = document.getElementById("userdetailform");
                getuserdetail(data.Id).done(function (jsonResult) {
                    if (jsonResult != undefined && jsonResult != null) {
                        if (jsonResult.Success) {
                            var userviewmodel = datacontext.touserdetailmodel(jsonResult.ResultData);
                            ko.applyBindings(userviewmodel, userdetailform);
                        }
                        else {
                            var userviewmodel = new userdetaildataviewmodel();
                            userviewmodel.error(jsonResult.Message);
                            ko.applyBindings(userviewmodel, userdetailform);
                        }

                    }
                });
            }
        } catch (e) {
            console.error("ApplyItemDetailsBindings in UserConfigDataContext Error:" + e.message);
        }

    }
    function userlisturl() {
        var url = $(".userconfigcontainer").attr("data-url");
        url = url + "/getusers";// + id;
        return url;
    }
    function userdetailurl() {
        var url = $(".userconfigcontainer").attr("data-url");
        url = url + "/GetUserDetail";//?userid=" + id;
        return url;
    }
    function userphotourl(id,isThumb) {
        var url = $(".userconfigcontainer").attr("data-url");
        url = url + "/GetPhoto?uid=" + id + "&bThumb=" + isThumb;
        return url;
    }
   
    function usersaveurl() {
        var url = $(".userconfigcontainer").attr("data-url");
        url = url + "/saveuserdataex";
        return url;
    }
    function userupdateurl() {
        var url = $(".userconfigcontainer").attr("data-url");
        url = url + "/updateuserex";
        return url;
    }
    function userdeleteurl() {
        var url = $(".userconfigcontainer").attr("data-url");
        url = url + "/deleteuser";//?Id=" + id;
        return url;
    }
    function unblockuserurl() {
        var url = $(".userconfigcontainer").attr("data-url");
        url = url + "/unblockuser";//?Id=" + id;
        return url;
    }
    function photodeleteurl() {
        var url = $(".userconfigcontainer").attr("data-url");
        url = url + "/deletephoto";//Id=" + id;
        return url;
    }
    function getrolesurl() {
        var url = $(".userconfigcontainer").attr("data-url");
       // url = url + "/GetApplicationRoles?acid=" + id + "&acType=" + type;
        url = url + "/GetApplicationRoles";
        return url;
    }
    function getpermissionsurl() {
        var url = $(".userconfigcontainer").attr("data-url");      
            url = url + "/GetPermissions";//?ur=" + roleId + "&&userid=" + userid;
       
        return url;
    }
    function getcategoriessurl() {
        var url = $(".userconfigcontainer").attr("data-url");       
            url = url + "/GetCategories";//?roleId=" + rid + "&userId=" + uid;       
        return url;
    }
})(jQuery, ko, window.userconfig.common);
