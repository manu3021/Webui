
; (function ($) {
    $.timer = function (func, time, autostart) {
        this.set = function (func, time, autostart) {
            this.init = true;
            if (typeof func == 'object') {
                var paramList = ['autostart', 'time'];
                for (var arg in paramList) { if (func[paramList[arg]] != undefined) { eval(paramList[arg] + " = func[paramList[arg]]"); } };
                func = func.action;
            }
            if (typeof func == 'function') { this.action = func; }
            if (!isNaN(time)) { this.intervalTime = time; }
            if (autostart && !this.isActive) {
                this.isActive = true;
                this.setTimer();
            }
            return this;
        };
        this.once = function (time) {
            var timer = this;
            if (isNaN(time)) { time = 0; }
            window.setTimeout(function () { timer.action(); }, time);
            return this;
        };
        this.play = function (reset) {
            if (!this.isActive) {
                if (reset) { this.setTimer(); }
                else { this.setTimer(this.remaining); }
                this.isActive = true;
            }
            return this;
        };
        this.pause = function () {
            if (this.isActive) {
                this.isActive = false;
                this.remaining -= new Date() - this.last;
                this.clearTimer();
            }
            return this;
        };
        this.stop = function () {
            this.isActive = false;
            this.remaining = this.intervalTime;
            this.clearTimer();
            return this;
        };
        this.toggle = function (reset) {
            if (this.isActive) { this.pause(); }
            else if (reset) { this.play(true); }
            else { this.play(); }
            return this;
        };
        this.reset = function () {
            this.isActive = false;
            this.play(true);
            return this;
        };
        this.clearTimer = function () {
            window.clearTimeout(this.timeoutObject);
        };
        this.setTimer = function (time) {
            var timer = this;
            if (typeof this.action != 'function') { return; }
            if (isNaN(time)) { time = this.intervalTime; }
            this.remaining = time;
            this.last = new Date();
            this.clearTimer();
            this.timeoutObject = window.setTimeout(function () { timer.go(); }, time);
        };
        this.go = function () {
            if (this.isActive) {
                this.action();
                this.setTimer();
            }
        };

        if (this.init) {
            return new $.timer(func, time, autostart);
        } else {
            this.set(func, time, autostart);
            return this;
        }
    };
})(jQuery);
window.alarmconfig = window.alarmconfig || {};
window.alarmconfig.common = (function ($) {
    var constants = {
        door: 'DOOR',
        actionsuccessful: 'Action performed successfully.',
        actionfailed: 'Action failed.',
        pagerowcount: 30,
        eventcodeallowed: 5000,
        unlocked: 'unlocked'
    };
    var labels = {

    };
    var events = {
        systemeventreceived: 'systemeventreceived',
        onopen: 'onopen',
        onclose: 'onclose',
        alarmnavigation: 'alarmnavigation'
    };
    var messages = {
        ack_save_success: Resources.AcknowledgeSuccessMessage,
        ack_save_error: Resources.AcknowledgeFailMessage,
        clr_save_success: Resources.ClearSuccessMessage,
        clr_save_error: Resources.ClearFailMessage,
        sop_save_success: Resources.SopSaveSuccessful,
        sop_save_failed: Resources.SopSaveFailed,
        alarm_saveSearch: Resources.Successfully_saved,
        alarm_saveSearch_error: Resources.Save_failed,
        already_ack_msg: Resources.Already_ack__alarm_msg,
        plsinstflashplayer: Resources.plsinstflashplayer,
        clicktodownloadflashplayer: Resources.clkdwnadbflsplr
    };
    var getactionPath = function (actionname) {
        var url = $("#alarmConfigUrl").attr("data-url");
        url += "/" + actionname;
        return url;
    }

    var getConfigPath = function (actionname) {
        var url = $("#configUrl").attr("data-url");
        url += "/" + actionname;
        return url;
    }

    var getparameterizedUrl = function (url, data) {
        if (typeof data === 'object') {
            var queries = [];
            for (var i in data) {
                queries.push(i + '=' + data[i]);
            }
            url = url + (url.indexOf('?') != -1 ? '&' : '?') + queries.join('&');
        }
        return url;
    }

    var checkEventRange = function (EventCode, SeverityName, EventType) {
        if (EventType == 'Event') {
            if (5000 <= EventCode && EventCode <= 9999) {
                return "icon_doornor";
            }

            else if (10000 <= EventCode && EventCode <= 14999) {
                return "icon_videonor";
            }

            else if (15000 <= EventCode && EventCode <= 19999) {
                return "icon_firenor";
            }
        }
        switch (SeverityName) {
            case "Critical":
                if (5000 <= EventCode && EventCode <= 9999) {
                    return "icon_doorhigh";
                }

                else if (10000 <= EventCode && EventCode <= 14999) {
                    return "icon_videohigh";
                }

                else if (15000 <= EventCode && EventCode <= 19999) {
                    return "icon_firehigh";
                }
                break;
            case "Moderate":
                if (5000 <= EventCode && EventCode <= 9999) {
                    return "icon_doormod";
                }

                else if (10000 <= EventCode && EventCode <= 14999) {
                    return "icon_videomod";
                }

                else if (15000 <= EventCode && EventCode <= 19999) {
                    return "icon_firemod";
                }
                break;
            case "Major":
                if (5000 <= EventCode && EventCode <= 9999) {
                    return "icon_doormajor";
                }

                else if (10000 <= EventCode && EventCode <= 14999) {
                    return "icon_videomajor";
                }

                else if (15000 <= EventCode && EventCode <= 19999) {
                    return "icon_firemajor";
                }
                break;
            case "Normal":                
                if (EventCode == 5040) {
                    return "icon_rules";
                }
                else if (5000 <= EventCode && EventCode <= 9999) {
                    return "icon_doornor";
                }

                else if (10000 <= EventCode && EventCode <= 14999) {
                    return "icon_videonor";
                }

                else if (15000 <= EventCode && EventCode <= 19999) {
                    return "icon_firenor";
                }
                break;
        }
    }

    var changeReadStatus = function (eventIdentifiers) {
        for (var i = 0; i < eventIdentifiers.length; i++) {
            $("[value='" + eventIdentifiers[i] + "']").closest("tr").removeClass('unread').addClass('read');
            $("[value='" + eventIdentifiers[i] + "']").closest("button").hide();
            $("#" + eventIdentifiers[i]).show();
        }
    }

    var checkSeverityColor = function (Severity) {
        switch (Severity) {
            case "Critical":
                return "#E33E38";
                break;
            case "Major":
                return "#e86c08";
                break;
            case "Moderate":
                return "#E8A108";
                break;
            case "Normal":
                return "#707070";
                break;
        }
    }

    var guid = function () {
        this.s4 = function () {
            return Math.floor((1 + Math.random()) * 0x10000)
                       .toString(16)
                       .substring(1);
        }
    };

    guid.prototype.NewGuid = function () {
        return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
              this.s4() + '-' + this.s4() + this.s4() + this.s4();
    }

    var isGuidorNot = function (GUID) {
        var guidRegex = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/
        return guidRegex.test(GUID);
    }

    var getPhotoPath = function (BlobId) {
        var url = "/UserConfig/GetPhoto?uid=" + BlobId + "&bThumb=true";
        return url;
    }

    function createGUID() {
        var uId = new guid().NewGuid();
        return uId;
    };

    return {
        checkSeverityColor: checkSeverityColor,
        checkEventRange: checkEventRange,
        changeReadStatus: changeReadStatus,
        getactionPath: getactionPath,
        getparameterizedUrl: getparameterizedUrl,
        constants: constants,
        labels: labels,
        events: events,
        messages: messages,
        createGUID: createGUID,
        isGuidorNot: isGuidorNot,
        datetimeformat: Resources.datetimeformat,
        getConfigPath: getConfigPath,
        getPhotoPath: getPhotoPath
    };
})(jQuery);


///* Set the defaults for DataTables initialisation */
//$.extend(true, $.fn.dataTable.defaults, {
//    "sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
//    "sPaginationType": "bootstrap",
//    "oLanguage": {
//        "sLengthMenu": "_MENU_ records per page"
//    }
//});


///* Default class modification */
//$.extend($.fn.dataTableExt.oStdClasses, {
//    "sWrapper": "dataTables_wrapper form-inline"
//});


///* API method to get paging information */
//$.fn.dataTableExt.oApi.fnPagingInfo = function (oSettings) {
//    return {
//        "iStart": oSettings._iDisplayStart,
//        "iEnd": oSettings.fnDisplayEnd(),
//        "iLength": oSettings._iDisplayLength,
//        "iTotal": oSettings.fnRecordsTotal(),
//        "iFilteredTotal": oSettings.fnRecordsDisplay(),
//        "iPage": oSettings._iDisplayLength === -1 ?
//			0 : Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength),
//        "iTotalPages": oSettings._iDisplayLength === -1 ?
//			0 : Math.ceil(oSettings.fnRecordsDisplay() / oSettings._iDisplayLength)
//    };
//};


///* Bootstrap style pagination control */
//$.extend($.fn.dataTableExt.oPagination, {
//    "bootstrap": {
//        "fnInit": function (oSettings, nPaging, fnDraw) {
//            var oLang = oSettings.oLanguage.oPaginate;
//            var fnClickHandler = function (e) {
//                e.preventDefault();
//                if (oSettings.oApi._fnPageChange(oSettings, e.data.action)) {
//                    fnDraw(oSettings);
//                }
//            };

//            $(nPaging).addClass('pagination').append(
//				'<ul>' +
//					'<li class="prev disabled"><a href="#">&larr; ' + oLang.sPrevious + '</a></li>' +
//					'<li class="next disabled"><a href="#">' + oLang.sNext + ' &rarr; </a></li>' +
//				'</ul>'
//			);
//            var els = $('a', nPaging);
//            $(els[0]).bind('click.DT', { action: "previous" }, fnClickHandler);
//            $(els[1]).bind('click.DT', { action: "next" }, fnClickHandler);
//        },

//        "fnUpdate": function (oSettings, fnDraw) {
//            var iListLength = 5;
//            var oPaging = oSettings.oInstance.fnPagingInfo();
//            var an = oSettings.aanFeatures.p;
//            var i, ien, j, sClass, iStart, iEnd, iHalf = Math.floor(iListLength / 2);

//            if (oPaging.iTotalPages < iListLength) {
//                iStart = 1;
//                iEnd = oPaging.iTotalPages;
//            }
//            else if (oPaging.iPage <= iHalf) {
//                iStart = 1;
//                iEnd = iListLength;
//            } else if (oPaging.iPage >= (oPaging.iTotalPages - iHalf)) {
//                iStart = oPaging.iTotalPages - iListLength + 1;
//                iEnd = oPaging.iTotalPages;
//            } else {
//                iStart = oPaging.iPage - iHalf + 1;
//                iEnd = iStart + iListLength - 1;
//            }

//            for (i = 0, ien = an.length ; i < ien ; i++) {
//                // Remove the middle elements
//                $('li:gt(0)', an[i]).filter(':not(:last)').remove();

//                // Add the new list items and their event handlers
//                for (j = iStart ; j <= iEnd ; j++) {
//                    sClass = (j == oPaging.iPage + 1) ? 'class="active"' : '';
//                    $('<li ' + sClass + '><a href="#">' + j + '</a></li>')
//						.insertBefore($('li:last', an[i])[0])
//						.bind('click', function (e) {
//						    e.preventDefault();
//						    oSettings._iDisplayStart = (parseInt($('a', this).text(), 10) - 1) * oPaging.iLength;
//						    fnDraw(oSettings);
//						});
//                }

//                // Add / remove disabled classes from the static elements
//                if (oPaging.iPage === 0) {
//                    $('li:first', an[i]).addClass('disabled');
//                } else {
//                    $('li:first', an[i]).removeClass('disabled');
//                }

//                if (oPaging.iPage === oPaging.iTotalPages - 1 || oPaging.iTotalPages === 0) {
//                    $('li:last', an[i]).addClass('disabled');
//                } else {
//                    $('li:last', an[i]).removeClass('disabled');
//                }
//            }
//        }
//    }
//});


///*
// * TableTools Bootstrap compatibility
// * Required TableTools 2.1+
// */
//if ($.fn.DataTable.TableTools) {
//    // Set the classes that TableTools uses to something suitable for Bootstrap
//    $.extend(true, $.fn.DataTable.TableTools.classes, {
//        "container": "DTTT btn-group",
//        "buttons": {
//            "normal": "btn",
//            "disabled": "disabled"
//        },
//        "collection": {
//            "container": "DTTT_dropdown dropdown-menu",
//            "buttons": {
//                "normal": "",
//                "disabled": "disabled"
//            }
//        },
//        "print": {
//            "info": "DTTT_print_info modal"
//        },
//        "select": {
//            "row": "active"
//        }
//    });

//    // Have the collection use a bootstrap compatible dropdown
//    $.extend(true, $.fn.DataTable.TableTools.DEFAULTS.oTags, {
//        "collection": {
//            "container": "ul",
//            "button": "li",
//            "liner": "a"
//        }
//    });
//}

//function establishWebsocketConn() {
//    var socket;
//    var host = "ws://159.99.71.121/samplewebsocketserver/add";

//    try {
//        var socket = new WebSocket(host);

//        socket.onopen = function () {
//            alert("successfully connected to web socket host");
//        }

//        socket.onmessage = function (msg) {
//            alert(msg.data);
//        }

//        socket.onclose = function () {
//            alert("connection to web socket closed");
//        }

//    } catch (exception) {
//        alert(exception.description);
//    }
//}
///* Table initialisation */
//$(document).ready(function () {
//    $('#table-alarm').dataTable({
//        "sDom": "<'row'<'span6'l><'span6'f>r>t<'row'<'span6'i><'span6'p>>",
//        "sPaginationType": "bootstrap",
//        "oLanguage": {
//            "sLengthMenu": "_MENU_ records per page"
//        }
//    });
//    establishWebsocketConn();    
//});

var dateFormat = function () {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d: d,
                dd: pad(d),
                ddd: dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m: m + 1,
                mm: pad(m + 1),
                mmm: dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy: String(y).slice(2),
                yyyy: y,
                h: H % 12 || 12,
                hh: pad(H % 12 || 12),
                H: H,
                HH: pad(H),
                M: M,
                MM: pad(M),
                s: s,
                ss: pad(s),
                l: pad(L, 3),
                L: pad(L > 99 ? Math.round(L / 10) : L),
                t: H < 12 ? "a" : "p",
                tt: H < 12 ? "am" : "pm",
                T: H < 12 ? "A" : "P",
                TT: H < 12 ? "AM" : "PM",
                Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

// Some common format strings
dateFormat.masks = {
    "default": "ddd mmm dd yyyy HH:MM:ss",
    shortDate: "m/d/yy",
    mediumDate: "mmm d, yyyy",
    longDate: "mmmm d, yyyy",
    fullDate: "dddd, mmmm d, yyyy",
    shortTime: "h:MM TT",
    mediumTime: "h:MM:ss TT",
    longTime: "h:MM:ss TT Z",
    isoDate: "yyyy-mm-dd",
    isoTime: "HH:MM:ss",
    isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};
