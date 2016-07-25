(function (JQuery, ko, config, header) {
    window.addFileBinding();
    var signout = function () {
        return new ajaxRequest("post", signouturl()).done(function (jsonData) {
            if (jsonData.success)

                window.location = jsonData.redirect || location.href;
        })
    };
    var DoAgree = function () {
        return new ajaxRequest("post", agreementurl()).done(function (jsonData) {
            if (jsonData.success) {
                // window.location = jsonData.redirect || location.href;
                $("#agreementdiv").hide();
                jsonData.data == true ? $("#profilediv").show() : window.location = location.href;
            }
        }).fail(function (result) {
            alertify.error(Resources.Login_Agreementapprovalfailed);

        });
    };
    function signouturl() {
        return $("#signout").attr("data-url");
    }
    function agreementurl() {
        return $("#agreementform").attr("action");
    }
    var pageAgreementModel = function () {
        var self = this;
        self.DoAgree = function () {
            DoAgree();
        }
    }
    if (document.getElementById("agreementform"))
        ko.applyBindings(new pageAgreementModel(), document.getElementById("agreementform"));
    if (document.getElementById("page-header"))
        ko.applyBindings(new window.MPC.pageheaderViewmodel(Resources.Welcome), document.getElementById("page-header"));
    $('#overlay-menu').hide();
})($, ko);
