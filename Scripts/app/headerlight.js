(function (JQuery, ko, config, header) {
    var signout = function () {
        return new ajaxRequest("post", signouturl()).done(function (jsonData) {
            if (jsonData.success)
                window.location = jsonData.redirect || location.href;
        })
    };
    function signouturl() {
        return $("#signout").attr("data-url");
    }
    window.MPC = window.MPC || {};
    window.MPC.pageheaderViewmodel = function (data) {
        var self = this;
        self.userProfileMenu = ko.observableArray([]);
        var menus = [

                { menuid: 1002, tag: 'HELP', title: Resources.Help, url: '#', icons: { normalicon: 'icon_helpNormal', hovericon: 'images/icons/popup_profile/icon_loadNormal.png', pressedicon: 'images/icons/popup_profile/icon_saveNormal.png' } },
                { menuid: 1003, tag: 'LOGOUT', title: Resources.Logout, url: '#', icons: { normalicon: 'icon_logoutNormal', hovericon: 'images/icons/popup_profile/icon_loadNormal.png', pressedicon: 'images/icons/popup_profile/icon_saveNormal.png' } }
        ];
        self.pageTitle = ko.observable(data);//Resources.Welcome);
        self.notificationsCount = ko.observable(0);
        self.navigateAlarm = function (data, event) {
        }
        self.messages = ko.computed(function () {

            return 0;
        });

        self.clipResults = ko.observableArray([]);
        self.clipexportrequestcount = ko.computed(function () {
            return self.clipResults().length;
        });

        self.IsHandBarVisible = ko.observable(true);
        self.ComputeHandBarVisible = ko.computed(function () {
            if (!self.IsHandBarVisible()) {
                return "pagetitleHandleBarHide";
            }
            else {
                return "pagetitleHandleBarShow";
            }
        });
        self.IsExapndable = ko.computed(function () {
            if (!self.IsHandBarVisible()) {
                return ""
            }
            else {
                return "";
            }
        });
        self.userProfileMenu($.map(menus, function (listItem) {
            return new menuitemModel(listItem)
        }));
    }, menuitemModel = function (data) {
        var self = this;
        self.title = ko.observable(data.title);
        self.url = ko.observable(data.url);
        self.tag = ko.observable(data.tag);
        self.icons = data.icons;
        self.icon = ko.observable(self.icons.normalicon);
        self.enableDetails = function () {
            this.icon(this.icons.hovericon);
        }
        self.normaldetail = function () {
            this.icon(this.icons.normalicon);
        }
        self.itemclick = function () {
            $.publish("userprofilemenuitemclick", self.toJson());
            console.log(this.tag());
            if (self.tag() == 'LOGOUT')
                signout();
            if(self.tag() =='HELP') {
                self.PopupCenter(window.location.href+ "/WebHelp/help.html", "", 1290, 590);
            }
        }
    
        self.toJson = function () {
            return ko.toJSON(self);
        }
        self.PopupCenter = function (pageURL, title, w, h) {
            var left = (screen.width / 2) - (w / 2);
            var top = (screen.height / 2) - (h / 2);
            var targetWin = window.open(pageURL, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=40, left=' + left);
        }
    }
  
})($, ko);
