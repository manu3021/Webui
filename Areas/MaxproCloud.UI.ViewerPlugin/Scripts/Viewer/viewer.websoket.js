/// <reference path="viewer.uicontext.js" />
window.viewerconfig = window.viewerconfig || {};
window.viewerconfig.Websoket = (function ($, ko, common, uicontext) {
    if (!("WebSocket" in window)) {
        alertify.alert('You need a browser that supports webSockets.');
    } else {
        //The user has WebSockets
        //connect();

        function finaldata(data) {
            OriginTime = Date(parseInt(data["OriginTime"].replace('/Date(', '').replace(')/', '').replace('-', '')));
            OriginTime = new Date(OriginTime);
            var dateString = ToJavaScriptDate(OriginTime);
            var finalData = [{
                'AccountType': null,
                'AlarmDate': dateString,
                'AlarmTitle': null,
                'AdditionalInfo': AdditionalInfo,
                //'DoorAdditionalInfo': _.filter(data.AdditionalInfo, function (item) { return item.Key == "DOOR" }),
                //'CameraAdditionalInfo': _.filter(data.AdditionalInfo, function (item) { return item.Key == "CAMERA" }),
                //'MapAdditionalInfo': _.filter(data.AdditionalInfo, function (item) { return item.Key == "FLOOR_MAP" || item.Key == "FLOOR_MAP_LOCATION" }),
                'Description': null,
                'EntityType': null,
                'EventCode': data.EventCode,
                'EventCodeType': Resources["EventCode_" + data.EventCode],
                'Status': ko.observable(data.Status),
                //'IsSelected': ko.observable(false),
                //'IsAcknowledge': ko.computed(function () { if (self.Status() == "NEW") { return false; } return true; }),
                //'Type': common.checkEventRange(data.EventCode, data.SeverityName),
                'Id': data.ID,
                'IsActive': false,
                'IsSystemEntity': false,
                'Location': data.Location,
                'MasterSourceEntityName': data.MasterSourceEntityName,
                'Name': null,
                'ParentId': null,
                'Priority': data.Priority,
                'SeverityName': data.Severity,
                'SourceEntityName': data.SourceEntityName,
                'TypeId': 0,
                'UniqueId': null
            }];
            return finalData;
        }
        function ToJavaScriptDate(value) {
            var formattedDate = new Date(value);
            var final = moment(formattedDate).format(common.constants.datetimeformat);
            return final;
        }

        function connect() {
            var socket;
            var host = $("#viewermainpage").data("wsurl");

            try {
                var socket = new WebSocket(host);

                socket.onopen = function () {
                    alertify.alert('<p class="event">Socket Status: ' + socket.readyState + ' (open)');
                }

                socket.onmessage = function (msg) {
                    // alertify.alert(msg.data);                    
                    var data = finaldata($.parseJSON(msg.data));
                    window.viewerconfig.uicontext.getWebsoketvents(data);
                }

                socket.onclose = function () {
                }

            } catch (exception) {
                alertify.alert('<p>Error' + exception);
            }

        }
        connect();

    }//End else

})($, ko, window.viewerconfig.common, window.viewerconfig.uicontext);

//today = Date(14054892204790700);
//today = new Date(today);
//var dateString = today.format("dd mmm yyyy HH:MM:ss");
//alert(dateString);




