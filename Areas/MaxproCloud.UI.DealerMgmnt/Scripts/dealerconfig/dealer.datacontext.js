/// <reference path="user.common.js" />
/// <reference path="usersplugincore.js" />

window.userconfig.datacontext = (function ($, ko, common) {
    var selectedUser = null;
    var currentAccount = null;
    var datacontext = {
        saveupdated: saveupdated,
        deleteUser: deleteUser,
        applylistbindings: applylistbindings,
        applyuserdetailbinding: applyuserdetailbinding,
        getalldealers: getalldealers,
        onuserselected: onuserselected,
        onapprovedSeleceted: onapprovedSeleceted,
        getdetail: getdetail,

        approveUser: approveUser,
        createEula: createEula,
        EulaList: EulaList,
        applyEulalistbindings: applyEulalistbindings,


        getBillingSummary: getBillingSummary

    };
    return datacontext;

    var data = null;

    function resetvalues() {
    }
    function onuserselected(userdata) {
        selected = userdata;
    }
    function onapprovedSeleceted(userdata) {
        selected = userdata;
    }
    function getalldealers(bPending) {
        data = ({ bPending: bPending });
        return ajaxRequest("POST", listurl(),data);
    }
    function getdetail() {
        try {
            data = ({ id: selected.Id });
            return ajaxRequest("POST", detailurl(),data);
        }
        catch (e) {
        }
    }
    function saveupdated(data) {
        try {
            if (data != undefined && data != null) {
                return ajaxRequest("POST", updateurl(), data);
            }
        } catch (e) {
            console.error("User details update  Error:" + e.message);
        }
    }
    function deleteUser(data) {
        try {
            if (data != undefined && data != null) {
                data = ({ Id: data.Id });
                return ajaxRequest("POST", deleteurl(),data);
            }
        } catch (e) {
            console.error("User details delete  Error:" + e.message);

        }
    }
    function approveUser(data) {
        try {
            if (data != undefined && data != null) {
                data = ({ Id: data.Id });
                return ajaxRequest("POST", approveurl(),data);
            }
        } catch (e) {
            console.error("User details approve  Error:" + e.message);

        }
    }

    function createEula(data) {
        try {
            if (data != undefined && data != null) {
                return ajaxRequest("POST", createEulaurl(), data);
            }
        } catch (e) {
            console.error("User details update  Error:" + e.message);
        }

    }
    function EulaList(productname) {
        try {
            data = ({ productName: productname });
            return ajaxRequest("POST", EulaListurl(),data);
        }
        catch (e) {
        }
    }

    function getBillingSummary(id) {
        try {
            data = ({Id:id});
            return ajaxRequest("POST", billingSummaryurl(),data);
        }
        catch (e) {
        }
    }

    function applylistbindings(data) {
        try {
            if (data != undefined && data != null) {
                var listform = document.getElementById("userlistcontainer");
                var listviewmodel = new listViewModel();
                getalldealers(userlistviewmodel, data.Id);
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
                            var userviewmodel = datacontext.touserdetailmodel(jsonResult.ResultData)
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

    function applyEulalistbindings(data) {
        try {
            if (data != undefined && data != null) {
                var EulaListform = document.getElementById("Eulalisttab");
                var eulaviewmodel = new datacontext.EulaListViewModel(data);
                //  EulaList(eulaviewmodel, data);
                ko.applyBindings(eulaviewmodel, EulaListform);
            }
        } catch (e) {
            console.error("ApplyListBindings in UserConfigDataContext Error:" + e.message);
        }
    }


    function listurl(bPending) {
        var url = $(".userconfigcontainer").attr("data-url");
        url = url + "/GetDealers/";
        return url;
    }

    function detailurl() {
        var url = $(".userconfigcontainer").attr("data-url");
        url = url + "/GetDealerDetail";//?id=" + id;
        return url;
    }
    function billingSummaryurl() {
        var url = $(".userconfigcontainer").attr("data-url");
        url = url + "/GetBillingSummary";//?Id=" + id;
        return url;
    }

    function updateurl() {
        var url = $(".userconfigcontainer").attr("data-url");
        url = url + "/UpdateDealer";
        return url;
    }


    function deleteurl() {
        var url = $(".userconfigcontainer").attr("data-url");
        url = url + "/DeleteDealer";//?Id=" + id;
        return url;
    }
    function approveurl() {
        var url = $(".userconfigcontainer").attr("data-url");
        url = url + "/ApproveDealer";//?Id=" + id;
        return url;
    }
    function createEulaurl() {
        var url = $(".userconfigcontainer").attr("data-url");
        url = url + "/CreateEULA/";
        return url;
    }
    function EulaListurl() {
        var url = $(".userconfigcontainer").attr("data-url");
        url = url + "/GetEULAList";//?productName=" + productname;
        return url;
    }

})(jQuery, ko, window.userconfig.common);
