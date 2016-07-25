window.dashboard = window.dashboard || {};
window.footer = window.footer || {};
window.footer.datacontext = (function ($) {

    var footerdatacontext = {
        menuitemclick: menuitemclick,
        getmenuitems: getmenuitems
    };
    return footerdatacontext;
    function menuitemclick(menuItem) {
        $.publish("footermenuitemclick", menuItem);
        console.log("footermenuitemclick event published for: " + menuItem.title());
    }
    function createmenuItem(data) {
        return new footerdatacontext.footerMenuItem(data);
    }
    function getmenuitems(footermenulistobservable, errorObservable) {
        ajaxRequest("get", getmenuitemurl())
            .done(getsucceeded)
            .fail(getfailed);
        function getsucceeded(data) {
            var mappedMenulists = $.map(data, function (item) { return new createmenuItem(item); });
            footermenulistobservable(mappedMenulists);
        }
        function getfailed() {
            errorObservable("Error on fetching menu items");
        }
    }


    function createfootermenulist(data) {
        return new footerdatacontext.footermenulist(data);
    }


    function getmenuitemurl() {
        return $("#getfooterurl").attr("data-url"); //"/dashboard/getfootermenuitems";
    }

}($));

(function (ko, datacontext) {
    var footerMenuItem = function (data) {
        var self = this;
        self.title = ko.observable(data.MenuHeader);
        self.description = ko.observable(data.Description);
        self.index = ko.observable(data.PageIndex);
        self.view = data.Name;
        self.icon = ko.computed(function () {
            var icon = "icon_" + self.index();
            return icon;
        });
        self.click = function () {
            datacontext.menuitemclick(self);
            console.log("Footer Menu item clicked : " + self.title());
        }
    }
    var footermenulist = function (data) {
        var self = this;
        data = data || {};
        self.menuitems = ko.observable(importmenuItems(data.MenuItems));
    }
    function importmenuItems(menuItems) {
        /// <returns value="[new todoItem()]"></returns>
        return $.map(menuItems || [],
                function (menuItemData) {
                    return datacontext.createmenuItem(menuItemData);
                });
    }
    datacontext.footerMenuItem = footerMenuItem;
    datacontext.footermenulist = footermenulist;
})(ko, window.footer.datacontext);
window.footer.footerviewmodel = (function (ko, datacontext) {
    var menulist = ko.observableArray(),
        erorr = ko.observable();
    datacontext.getmenuitems(menulist, erorr);
    return {
        menulist: menulist
    };
})(ko, window.footer.datacontext);
$(document).ready(function () {
    ko.applyBindings(window.footer.footerviewmodel, document.getElementById("footermenu"));
    Init();
});

// --:: BEGIN ::------- Alarm Monitoring Service connectivity Code -----------------------------------------------//
function gettoken(callback) {
    return ajaxRequest("GET", gettokenurl()).done(function (jsonResult) {
        if (callback) {
            callback(jsonResult);
        }
    });
}

function gettokenurl() {
    return $("#dashboardurl").attr("data-url") + "/gettoken";
}

function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

function createguid() {
    return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
}

function createwebsocket() {
    if (window.WebSocket) {
        connect();
    }
    else {
        alertify.alert('You need a browser that supports webSockets.');
    }
}
function connect() {
    var host = $("#EventServiceWebSocketUrl").data("eventservicewebsocketurl");
    var intervel = $("#AlarmMonitorPollIntervel").data("alarmmonitorpollintervel");
    var timer = null;
    var username, password;
    gettoken(function (jsonString) {
        try {
            var socket = new WebSocket(host);
            socket.onopen = function () {
                try {
                    $.publish('onopen', true);
                    window.clearTimeout(timer);
                    socket.send(JSON.stringify({
                        id: createguid(),
                        data: jsonString
                    }));
                } catch (e) {
                    //                        alertify.alert('<p>Error' + e);
                }
            }
            socket.onmessage = function (msg) {
                var data = finalAlarmData($.parseJSON(msg.data));
                if (data) {
                    if (data[0].EventCode != 5037)
                        $.publish('systemeventreceived', data);
                    if (data[0].EventType.toLowerCase() == "alarm") {
                        $.publish('pushalarmcount', 1);
                    }
                }
            }
            socket.onclose = function () {
                $.publish('onclose', true);
                timer = setTimeout(function () { connect(); }, (intervel * 1000));
            }
            return socket;
        } catch (exception) {
            alertify.alert('<p>Error' + exception);
            return null;
        }
    });
}


function finalAlarmData(data) {
    if (data.EventCode != 20002) {
        var OriginTime = new Date(data.OriginTime.DateTime.match(/\d+/)[0] * 1);
        OriginTime = new Date(OriginTime.getTime() + ((data.OriginTime.OffsetMinutes + OriginTime.getTimezoneOffset()) * 60000));
        if (data.SourceEntityType && data.SourceEntityType.toLowerCase() == "camera") {
            data.AdditionalInfo = [{ Key: "CAMERA", Value: [{ ID: data.SourceEntityId, Name: data.SourceEntityName }] }];
        }
        var finalData = {
            AccountName: data.AccountName,
            AccountType: null,
            OriginTime: OriginTime,
            AlarmDate: OriginTime.format("ddS mmm"),
            AlarmTime: OriginTime.format("HH:MM:ss"),
            AlarmTitle: null,
            AdditionalInfo: data.AdditionalInfo,
            Features: data.Features,
            Description: null,
            EntityType: null,
            EventCode: data.EventCode,
            EventCodeType: Resources["EventCode_" + data.EventCode],
            Status: data.Status || 'NEW',
            Id: data.ID,
            IsActive: false,
            IsSystemEntity: false,
            Location: data.Location,
            MasterSourceEntityName: data.MasterSourceEntityName,
            MasterSourceEntityType:data.MasterSourceEntityType,
            SourceEntityType: data.SourceEntityType,
            SourceEntityId: data.SourceEntityId,
            Name: null,
            ParentId: null,
            Priority: _.first(data.AccountLevelSettings).value.Priority,
            SeverityName: _.first(data.AccountLevelSettings).value.Severity,
            EventType: _.first(data.AccountLevelSettings).value.EventType,
            SourceEntityName: data.SourceEntityName,
            TypeId: 0,
            UniqueId: null
        };
        return [finalData];
    }
}

function Init() {
    createwebsocket();
}
// --:: END ::------- Alarm Monitoring Service connectivity Code -----------------------------------------------//