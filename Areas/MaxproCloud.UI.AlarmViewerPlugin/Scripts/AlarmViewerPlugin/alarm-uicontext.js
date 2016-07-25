/// <reference path="alarm-common.js" />
/// <reference path="alarm-model.js" />
/// <reference path="alarm-datacontext.js" />
/// <reference path="alarm-validation-context.js" />
var pageRowCount = window.alarmconfig.common.constants.pagerowcount;//Math.round($('#table-alarm tbody')[0].clientHeight / 60) + 2;
window.alarmconfig.uicontext = (function ($, ko, datacontext, validationcontext, common) {
    var alarmFormId = "alarmForm";
    var severityFormId = "alarmsettingbody",
    modalOptions = { show: true, keyboard: false, backdrop: "static" }
    datacontext.isFilterApplied = ko.observable(false);
    var FilteredEntites = ko.observableArray([]);
    datacontext.FilteredEntites = FilteredEntites;
    var multipleClipSessionID = ko.observable("");
    var multipleClipCameraID = ko.observable("");
    var clientDate = new Date();
    var clientOffset = clientDate.getTimezoneOffset();
    var split = function (val) {
        return val.split(/,\s*/);
    }
    var currentPopoverTarget = null;
    function Hidepopover() {
        // hide the current clip search popover 
        $('.webui-popover').hide();
    }

    function validateForm() {
        return validationcontext.validateForm("alarmForm");
    }
    var updateAlarmDatasource = function (events, isFiltered) {
        var finalresult = [];
        try {
            var bContext = ko.contextFor(document.getElementById(alarmFormId));
            if (!isFiltered)
                finalresult = bContext.$data.updateAlarmDatasource(events.data);
            else
                finalresult = bContext.$data.historyAlarmDatasource(events.data);
            filteresColumns();
        } catch (e) {
            console.error(e);
        }
        return finalresult;
    }

    var wsAlarmDatasource = function (events) {
        try {
            var bContext = ko.contextFor(document.getElementById(alarmFormId));
            bContext.$data.updateAlarmDatasource(events);
            filteresColumns();
            //loadEventCount();
            //Abilasha USP-4852
            if ($('[name="chkAll"]').prop('checked')) {
                checkAllAlarms(true);
            }
        } catch (e) {
            console.error(e);
        }
    }

    var freezedAlarmDataSource = function (events) {
        var finalresult = [];

        try {
            var bContext = ko.contextFor(document.getElementById(alarmFormId));
            finalresult = bContext.$data.freezedAlarmDataSource(events.data);
            filteresColumns();
            //Abilasha USP-4852
            if ($('[name="chkAll"]').prop('checked')) {
                checkAllAlarms(true);
            }
        } catch (e) {
            console.error(e);
        }
        return finalresult;
    }

    function bindEventstoAlarmTable() {
        try {
            ko.cleanNode(document.getElementById("alarmForm"));
            ko.applyBindings(window.alarmconfig.alarmViewmodel, document.getElementById("alarmForm"));
        } catch (e) {
            console.error(e);
        }
    }

    var severityDatasource = function (events) {
        try {
            ko.cleanNode(document.getElementById(severityFormId));
            var alConfig = window.alarmconfig.alarmViewmodel.severityMasterData(events.data);
            ko.applyBindings(alConfig, document.getElementById(severityFormId));
        } catch (e) {
            console.error(e);
        }
    }

    var showdoorpopover = function (event, popoverObseravable) {
        var popoverParent = event.currentTarget;
        thiscontext.showdoorpopover.popoverParent = popoverParent;
        var isPopoverShown = $(popoverParent).attr("data-ispopovershown");
        var doorid = popoverParent.value.id;
        var dooraname = '<div class="alarmdoorpopover"><header>' + popoverParent.value.doorname + '<br /><p id="status" class="status">' + Resources.Status + ': Loding... </p> <b id="statusicon" class="icon_locked"> </b></header></div>';
        if (isPopoverShown == undefined && isPopoverShown == null) {
            $(popoverParent).attr("data-ispopovershown", true);
            $(popoverParent.parentElement).webuiPopover({
                html: true,
                content: $("#door-popup").html(),
                title: dooraname,
                trigger: 'click',
                placement: 'auto',
                cache: false,
                async: true
            }).on("shown.webui.popover", showdoorpopover.onpopovershown).on("hide.webui.popover", showdoorpopover.onpopoverhidden);
            //$(popoverParent).webuiPopover('show');
        }
    }

    showdoorpopover.onpopoverhidden = function (event) {
        $(thiscontext.showdoorpopover.popoverParent).webuiPopover('destroy');
        $('.webui-popover').remove();
    }

    showdoorpopover.onpopovershown = function () {
        var door = thiscontext.showdoorpopover.popoverParent.value;
        var popover = $('.webui-popover.in');
        popover.addClass("alarmdoorpopover");
        //CloseVideoSession("Door");
        datacontext.geteventsummary(door.id, common.constants.door, function (jsondata) {
            if (jsondata.Success) {
                ko.cleanNode(document.getElementById("alerm-menu-user"));
                alarmconfig.alarmViewmodel.eventSummaryData(jsondata.data);
                var contextData = ko.observable(alarmconfig.alarmViewmodel.eventSummaryDatasource());
                ko.applyBindings(contextData, document.getElementById("alerm-menu-user"));
            }
            datacontext.getdevicestatus(common.constants.door, door.id, function (jsondata) {
                if (jsondata.Success) {
                    var data = _.filter(jsondata.data, function (item) { return item != "" });
                    var Status = _.map(jsondata.data, function (item) {
                        if (item.toLowerCase() == alarmconfig.common.constants.unlocked) {
                            $('#statusicon').removeClass('icon_locked').addClass('icon_unlocked');
                        }
                        return Resources["DeviceStatus_" + item.replace(/\s/g, '')] || item;
                    });
                            
                    $('#status').text(Resources.Status+': ' + Status.join(", "));                    
                }
            }, function (errorMessage) {
                alertify.error(errorMessage);
            });
        }, function (errorMessage) {
            alertify.error(errorMessage);
        });
    }

    var showcamerapopover = function (event, popoverObseravable) {


        var popoverParent = event.currentTarget;
        currentPopoverTarget = event.currentTarget;
        thiscontext.showcamerapopover.popoverParent = popoverParent;
        //thiscontext.showcamerapopover.popoverContent = $("#camera-small-popup").html();
        var cameraid = popoverParent.value.id;
        var camerapopcontent = $("<div id='camera_" + cameraid + "'></div>");
        thiscontext.showcamerapopover.popoverContent = camerapopcontent.append($("#camera-small-popup").html());
        var isPopoverShown = $(popoverParent).attr("data-ispopovershown");
        thiscontext.showcamerapopover.playid = null;
        thiscontext.showcamerapopover.playurl = null;
        if (popoverObseravable.ClipId) {
            var playid = popoverObseravable.ClipId.Value;
            if (!playid)
                playid = popoverObseravable.ClipId;
            thiscontext.showcamerapopover.playid = playid;
            //showcamerapopover.hidecurrentPopover(event.currentTarget);
        }
        if (popoverObseravable.ClipUrl)
            thiscontext.showcamerapopover.playurl = popoverObseravable.ClipUrl.Value;
        if (isPopoverShown == undefined && isPopoverShown == null) {
            $(popoverParent).attr("data-ispopovershown", true);
            $(popoverParent.parentElement).webuiPopover({
                html: true,
                content: thiscontext.showcamerapopover.popoverContent,
                title: '',
                trigger: 'click',
                placement: 'auto',
                cache: false,
                multi: false,
                async: true
            }).on("shown.webui.popover", showcamerapopover.onpopovershown).on("hide.webui.popover", showcamerapopover.onpopoverhidden);
            //  }).on("shown.webui.popover", function (event) {
            //     showcamerapopover.onpopovershown(event);
            //  }).on("hide.webui.popover", function (event) {
            //         showcamerapopover.onpopoverhidden(event);
            //     })
            //$(popoverParent).webuiPopover('show');
        }
    }



    showcamerapopover.onpopovershown = function (event) {
        try {
            var popover = $('.webui-popover.in');
            popover.addClass("alarmcamerapopover");
            var pcontentPanel = popover.find('.content');
            var camera = thiscontext.showcamerapopover.popoverParent.value;
            var playerWrapperId = camera.id;
            var cameraname = camera.cameraname;
            var $playerWrapper = $("<div id=" + playerWrapperId + "></div>");
            $(pcontentPanel).html($playerWrapper);
            popover.find('#cameraName').html(cameraname);
            var sessionID = common.createGUID();
            thiscontext.showcamerapopover.sessionid = sessionID;
            multipleClipSessionID(sessionID);
            multipleClipCameraID(playerWrapperId);
            $(thiscontext.showcamerapopover.popoverParent).prop("data-clipSession", sessionID);
            if (thiscontext.showcamerapopover.playid && thiscontext.showcamerapopover.playurl)
                getclipurl(sessionID, thiscontext.showcamerapopover.playid, playerWrapperId, null);
            else
                getliveurl(playerWrapperId, sessionID, null);

        } catch (e) {
            console.error(e);
        }
    }

    //showcamerapopover.hidecurrentPopover = function(currenttarget) {
    //    
    //    console.log("hiding current popover");
    //    if ($('.webui-popover').length > 0)
    //        $('.webui-popover').not(this).remove();
    //    return;
    //}

    showcamerapopover.onpopoverhidden = function (event) {
        CloseVideoSession("Camera");
        $(thiscontext.showcamerapopover.popoverParent).webuiPopover('destroy');
        $('.webui-popover').remove();
    }

    function bindAndSetupPlayer(eleId, url, isLive, isMulti, isforceshowcontrol) {
        try {
            if (isMulti) {

                //$('#' + eleId).remove();
                $(".video-clip-play-section").append('<div id="MultiClipWrapper"></div>');
            }
            //url = 'http://sample-videos.com/video/mp4/720/big_buck_bunny_720p_1mb.mp4';
            window.mpcplayer.getplayeroptions(isLive, url, isMulti ? 300 : 200, isMulti ? 620 : 300, getPlayerImage(), function (playeroptions) {
                var playerInstance = jwplayer(eleId).setup(playeroptions);
                playerInstance.onPause(function (oldstate) {
                    console.info("Player onPause");
                    if (isLive) {
                        playerInstance.play(true);
                    }
                    console.dir(playerInstance.getState());
                });
                playerInstance.onError(function () {
                    //mCurrentPanel.isError(true);
                    if (isLive) {
                        console.info("Player Error: setting live play=TRUE");
                        playerInstance.play(true);
                    }
                    console.info("Player Error");
                });
            }, isforceshowcontrol);
            //jwplayer(eleId).play(true); 
            //jwplayer(eleId).fullscreen(true); 
        } catch (e) {
            throw e;
        }
    }


    function getclipurl(sessionId, clipId, cameraId, mulipleClipDiv) {       
        //Check if flash is installed
        if (!swfobject.hasFlashPlayerVersion("1")) {
            alertify.alert(common.messages.plsinstflashplayer + '<br/><a href="https://get.adobe.com/flashplayer/" target="_blank">' + common.messages.clicktodownloadflashplayer + '</a>');
            console.log("flash player not installed for clip stream in alarmview");
            if (mulipleClipDiv != undefined && mulipleClipDiv != null) {
                showliveerror(true, Resources.alrm_instflshplgn);
            }
            return null;
        }
        datacontext.getclipurl(sessionId, clipId, cameraId, function (jsondata) {
            if (jsondata.Success) {
                if (jsondata.data) {
                    if (mulipleClipDiv == null)
                        bindAndSetupPlayer(cameraId, jsondata.data, false, false);
                    else
                        bindAndSetupPlayer(mulipleClipDiv, jsondata.data, false, true);
                }
                else {
                    alertify.error(Resources.Alarm_VideoError);
                    //bindAndSetupPlayer(cameraId, jsondata.data, false, false);
                    return null;
                }
            }
            else {
                //  if (jsondata.errorMessage)
                //alertify.error(jsondata.errorMessage);
            }
        }, function (errorMessage) {
            alertify.error(errorMessage);
        });
    }

    function getliveurl(cameraId, UniqueID, mulipleClipDiv) {        
        if (mulipleClipDiv != undefined && mulipleClipDiv != null)
            console.log("Requesd for live clip of multicamera from " + $('.highlightMultiClip>span').html() + ".");
        window.alarmconfig.alarmViewmodel.videoErrorMessage("");
        window.alarmconfig.alarmViewmodel.showAlarmsVideoError(false);
        //Check if flash is installed
        if (!swfobject.hasFlashPlayerVersion("1")) {
            alertify.alert(common.messages.plsinstflashplayer + '<br/><a href="https://get.adobe.com/flashplayer/" target="_blank">' + common.messages.clicktodownloadflashplayer + '</a>');
            console.log("flash player not installed for live stream in alarmview");
            if (mulipleClipDiv != undefined && mulipleClipDiv != null) {
                showliveerror(true, "Install flash plugin");
            }
            return;
        }
        datacontext.getstartLive(cameraId, UniqueID, function (jsondata) {
            if (jsondata.Success && jsondata.data && jsondata.data.VideoResultstring.toLowerCase() == "success" && jsondata.data.Url != "") {
                if (mulipleClipDiv == undefined || mulipleClipDiv == null)
                    bindAndSetupPlayer(cameraId, jsondata.data.Url, true, false, true);
                else
                    bindAndSetupPlayer(mulipleClipDiv, jsondata.data.Url, true, true, true);
            }
            else {
                if (!jsondata.Success && jsondata.Message != undefined && jsondata.Message != "")
                    showliveerror(true, jsondata.Message);                
                else if (mulipleClipDiv == undefined || mulipleClipDiv == null)
                    showliveerror(false);
                else
                    showliveerror(true, Resources.mpcaCam_msg_Error_Live);
            }
        }, function (errorMessage) {
            showliveerror();
        });
    }

    function showliveerror(isMulti, errormessage) {
        if (isMulti) {
            $('#MultiClipWrapper').remove();
            window.alarmconfig.alarmViewmodel.videoErrorMessage(errormessage);
            window.alarmconfig.alarmViewmodel.showAlarmsVideoError(true);
        }
        else {
            alertify.alert(Resources.mpcaCam_msg_Error_Live);
        }
    }

    function wireUpEvent() {
        $('[name="actionsdd"]').on("click", onActionNewMenuClick);
        //$('.eventAck').on('click', AcknowledgeAll);
        //$('.eventClr').on('click', ClearAll);
        $('#AckFilter').on('click', AckFilter);
        $('#UnAckFilter').on('click', UnAckFilter);
        $('#AllAlarms').on('click', AllAlarms);
        $('#EvtFilter').on('click', EvtFilter);
        //$('#chkType').on('click', function () { showhidecolumn($(this), "showtype"); });
        //$('#chkSeverity').on('click', function () { showhidecolumn($(this), "showseverity"); });
        //$('#chkTimeandDate').on('click', function () { showhidecolumn($(this), "showtimeanddate"); });
        //$('#chkActionandInstructions').on('click', function () { showhidecolumn($(this), "showactionandinstructions"); });
        //$('#chkLocation').on('click', function () { showhidecolumn($(this), "showlocation"); });
        $('[name="chkAll"]').on('click', function () {
            var newVal = $(this).prop('checked');
            checkAllAlarms(newVal);
        });

        $(".ulClipSearchIconHolder").css("display", "block");
        /*Universal List Clip Search */

        $('.dropdown-menu input, .dropdown-menu label').click(function (e) {
            e.stopPropagation();
        });
        $('.dropdown-menu a[data-toggle="tab"]').click(function (e) {
            e.stopPropagation();
            $(this).tab('show')
        });
        $("#alarmnewarrow").hide();

        //Settings Page
        $('.icon_Alarmsettings').on('click', function () {
            loadAlarmConfiguration();
            $('#alarm-main-section').hide();
        });

        //View icon activation
        $('.dropdown-menu a[data-target="#ultab1"]').click(function () {
            $(this).parents().eq(5).children("a").children("b").removeClass().addClass("icon_views1");
        });
        $('.dropdown-menu a[data-target="#ultab2"]').click(function () {
            $(this).parents().eq(5).children("a").children("b").removeClass().addClass("icon_views2");
        });
        $('.dropdown-menu a[data-target="#ultab3"]').click(function () {
            $(this).parents().eq(5).children("a").children("b").removeClass().addClass("icon_views3");
        });
        $('.dropdown-menu a[data-target="#ultab4"]').click(function () {
            $(this).parents().eq(5).children("a").children("b").removeClass().addClass("icon_views4");
        });
        $('.dropdown-menu a[data-target="#ultab5"]').click(function () {
            $(this).parents().eq(5).children("a").children("b").removeClass().addClass("icon_views5");
        });
        $('#alarmfrmdatetimepicker, #alarmtodatetimepicker').datetimepicker().on('changeDate', function () {
            //$(this).find('input').val(new Date($(this).find('input').val()).format("dd mmm yyyy HH:MM:ss"));
            validateDate();
            if ($('.searchSpantagholder').children().length == 0) {
                $('.alarm-search-textbox').css("width", "58%");
            }
            var startDate = $("#alarmfrmdatetimepicker > input").val();
            var endDate = $("#alarmtodatetimepicker > input").val();
            if (startDate != "" && endDate != "") {
                $('#searchSpan .primary-button').each(function () {
                    if ($(this).attr('data-EntityType').toLowerCase() == 'time') {
                        $(this).remove();
                    }
                });
                var ctrl = "<span class='alarm-search-btn-selected primary-button timetab' data-EntityType='Time' data-EntityValue='Time'>" + Resources.Time + " <span class='remove' tabindex='-1' title='Remove'> × </span></span>";
                $('.searchSpantagholder').append($(ctrl));
                $('#timetab .search-filter-text').removeClass("alarm-search-btn-selected primary-button");                
            }
            searchBoxWidth();
        });
        $(document.body).on('click', '#searchSpan .remove', function (eve) {
            eve.stopPropagation();
            $(this).parent().remove();
            var EntityValue = $(this).parent().attr('data-EntityValue');
            var EntityType = ($(this).parent().attr('data-EntityType')).toLowerCase();
            $('.search-filter-text').each(function () {
                if ($(this).parents("div").attr("id") == EntityType + "tab" && $(this).attr('id') == EntityValue) {
                    $(this).addClass("alarm-search-btn secondary-button");
                    $(this).removeClass("alarm-search-btn-selected primary-button");
                }
                if ($(this).parents("div").attr("id") == "timetab") {
                    $(this).removeClass("alarm-search-btn secondary-button");
                }
            });
            if (EntityType + "tab" == 'timetab') {
                $("#alarmfrmdatetimepicker > input").val("");
                $("#alarmtodatetimepicker > input").val("");
            }
            checkFilterTextBoxSize();
            filters = serachfilter();
            searchTxtBox = $(".alarm-search-textbox");
            searchBoxWidth();
            //switch (filters.length) {
            //    case 0:
            //        searchTxtBox.css("width", "90%");
            //        break;
            //    case 1:
            //        searchTxtBox.css("width", "58%");
            //        break;
            //    case 2:
            //        searchTxtBox.css("width", "28%");
            //        break;
            //}
            return false;
        });
        var preventScroll = false;
        var ajaxInProgress = false;
        var pageSize = pageRowCount * 2;
        $('#table-alarm tbody').scroll(function () {
            if (preventScroll) {
                preventScroll = false;
                return;
            }
            CloseVideoSession("Scroll");
            $('.alarmcamerapopover,.alarmdoorpopover,.alarmactionspopover').hide();
            if (ajaxInProgress) return;
            var PageCount = pageCount();
            var srtDate = edDate = null;
            var contxt = ko.contextFor(document.getElementById("table-alarm")).$root;
            var isTimeFilterApplied = _.filter(serachfilter(), function (item) {
                return item.key.toLowerCase() == 'time';
            });
            if ($('#table-alarm tbody').scrollTop() <= ($('#table-alarm tbody')[0].clientHeight / 20) && ko.contextFor(document.getElementById("table-alarm")).$root.pagedRows().length >= pageRowCount) {
                if (contxt.pageIndex() > 0) {
                    contxt.previousPage();
                    $("#table-alarm tbody").scrollTop(Math.round($('#table-alarm tbody')[0].clientHeight / 20));
                }
            }
            if ($('#table-alarm tbody').scrollTop() + ($('#table-alarm tbody')[0].clientHeight / 3) >= (($('#table-alarm tbody')[0].scrollHeight - $('#table-alarm tbody')[0].clientHeight)) && isTimeFilterApplied.length > 0) {
                $('#table-alarm tbody').scrollTop((($('#table-alarm tbody')[0].scrollHeight - $('#table-alarm tbody')[0].clientHeight)) / 3);
                if (contxt.pageIndex() == contxt.maxPageIndex()) {
                    EntityTypes = serachfilter();
                    TextFilter = FilteredEntites();
                    startDate = $("#alarmfrmdatetimepicker > input").val().toDateString();
                    endDate = $("#alarmtodatetimepicker > input").val().toDateString();
                    var entityTypes = [];
                    var textFilter = [];
                    var eventTypes = [];
                    $.each(EntityTypes, function (key, value) {
                        if ($(value).get(0).key == 'Entities') {
                            entityTypes.push($(value).get(0).value.toString().toLowerCase().substring(0, $(value).get(0).value.length - 1));
                        }
                        if ($(value).get(0).key == 'Event' && $(value).get(0).value.toString().toLowerCase().split(';').length > 1) {
                            eventTypes.push($(value).get(0).value.toString().toLowerCase().split(';')[1]);
                        }
                    });
                    $.each(TextFilter, function (key, value) {
                        value = value.EntityType + ":" + value.Id;
                        textFilter.push(value);
                    });
                    console.log("Loaded Alrams Record Count: " + PageCount);
                    ajaxInProgress = true;
                    datacontext.getalarmdetails(clientOffset, PageCount, pageSize, startDate, endDate, true, "New", entityTypes.toString(), textFilter.toString(), eventTypes.toString(), function (jsondata) {
                        ajaxInProgress = false;
                        if (jsondata.Success) {
                            if (!jsondata.errorMessage) {
                                var finalresult = freezedAlarmDataSource(jsondata);
                                $('#filterText').html(Resources.Custom);
                                $(".alarmCount").css('display', 'none');
                                $('#SaveSearch').show();
                                datacontext.freezeAlarm("freeze");
                                if (finalresult && finalresult.length > 0) {
                                    $('#table-alarm tbody').scrollTop((($('#table-alarm tbody')[0].scrollHeight - $('#table-alarm tbody')[0].clientHeight)) / 3);
                                }
                                else {
                                    $('#table-alarm tbody').scrollTop((($('#table-alarm tbody')[0].scrollHeight - $('#table-alarm tbody')[0].clientHeight)));
                                    preventScroll = true;
                                }
                            }
                            else
                                alertify.error(jsondata.errorMessage);
                            if ($('[name="chkAll"]').prop('checked'))
                                checkAllAlarms(true);
                        }
                        else {
                            if (jsondata.errorMessage)
                                alertify.error(jsondata.errorMessage);
                        }
                    }, function (errorMessage) { alertify.error(errorMessage); });
                }
                if (contxt.pageIndex() < contxt.maxPageIndex()) {
                    contxt.nextPage();
                }
            }
            if ($('#table-alarm tbody').scrollTop() + ($('#table-alarm tbody')[0].clientHeight / 3) >= (($('#table-alarm tbody')[0].scrollHeight - $('#table-alarm tbody')[0].clientHeight)) && !datacontext.isFilterApplied() && !datacontext.showUnFreezeBtn() && isTimeFilterApplied.length == 0) {
                console.log("Loaded Alrams Record Count: " + PageCount);
                $('#table-alarm tbody').scrollTop((($('#table-alarm tbody')[0].scrollHeight - $('#table-alarm tbody')[0].clientHeight)) / 3);
                if (contxt.pageIndex() == contxt.maxPageIndex()) {
                    ajaxInProgress = true;
                    datacontext.getalarmdetails(clientOffset, PageCount, pageSize, srtDate, edDate, true, "New", null, null, null, function (jsondata) {
                        ajaxInProgress = false;
                        if (jsondata.Success) {
                            if (!jsondata.errorMessage) {
                                var finalresult = updateAlarmDatasource(jsondata, true);
                                if (finalresult && finalresult.length > 0) {
                                    $('#table-alarm tbody').scrollTop((($('#table-alarm tbody')[0].scrollHeight - $('#table-alarm tbody')[0].clientHeight)) / 3);
                                }
                                else {
                                    $('#table-alarm tbody').scrollTop((($('#table-alarm tbody')[0].scrollHeight - $('#table-alarm tbody')[0].clientHeight)));
                                    preventScroll = true;
                                }
                            }
                            else
                                alertify.error(jsondata.errorMessage);
                            if ($('[name="chkAll"]').prop('checked'))
                                checkAllAlarms(true);
                        }
                    }, function (errorMessage) {
                        alertify.error(errorMessage);
                    });
                }
                if (contxt.pageIndex() < contxt.maxPageIndex()) {
                    contxt.nextPage();
                }
            }
            if ($('#table-alarm tbody').scrollTop() + ($('#table-alarm tbody')[0].clientHeight / 3) >= (($('#table-alarm tbody')[0].scrollHeight - $('#table-alarm tbody')[0].clientHeight)) && datacontext.showUnFreezeBtn() && isTimeFilterApplied.length == 0) {
                console.log("Loaded Alrams Record Count: " + PageCount);
                $('#table-alarm tbody').scrollTop((($('#table-alarm tbody')[0].scrollHeight - $('#table-alarm tbody')[0].clientHeight)) / 3);
                if (contxt.pageIndex() == contxt.maxPageIndex()) {
                    ajaxInProgress = true;
                    datacontext.getalarmdetails(clientOffset, PageCount, pageSize, srtDate, edDate, true, "New", null, null, null, function (jsondata) {
                        ajaxInProgress = false;
                        if (jsondata.Success) {
                            if (!jsondata.errorMessage) {
                                var finalresult = freezedAlarmDataSource(jsondata);
                                if (finalresult && finalresult.length > 0)
                                    $('#table-alarm tbody').scrollTop((($('#table-alarm tbody')[0].scrollHeight - $('#table-alarm tbody')[0].clientHeight)) / 3);
                                else {
                                    $('#table-alarm tbody').scrollTop((($('#table-alarm tbody')[0].scrollHeight - $('#table-alarm tbody')[0].clientHeight)));
                                    preventScroll = true;
                                }
                            }
                            else
                                alertify.error(jsondata.errorMessage);

                            //if (tbody.children().length % 15 == 0)
                            //    PageCount.val(parseInt(PageCount.val()) + 15);
                            if ($('[name="chkAll"]').prop('checked'))
                                checkAllAlarms(true);
                        }
                    }, function (errorMessage) {
                        alertify.error(errorMessage);
                    });
                }
                if (contxt.pageIndex() < contxt.maxPageIndex()) {
                    contxt.nextPage();
                }
            }
            var filters = serachfilter();
            if ($('#table-alarm tbody').scrollTop() + ($('#table-alarm tbody')[0].clientHeight / 3) >= (($('#table-alarm tbody')[0].scrollHeight - $('#table-alarm tbody')[0].clientHeight)) && filters.length > 0 && $('#filterText').html().toLowerCase() == Resources.Custom.toLowerCase()) {
                $('#table-alarm tbody').scrollTop((($('#table-alarm tbody')[0].scrollHeight - $('#table-alarm tbody')[0].clientHeight)) / 3);
                if (contxt.pageIndex() == contxt.maxPageIndex()) {
                    $('#table-alarm tbody').scrollTop(($('#table-alarm tbody')[0].scrollHeight - $('#table-alarm tbody')[0].clientHeight));
                    preventScroll = true;
                }
                if (contxt.pageIndex() < contxt.maxPageIndex()) {
                    contxt.nextPage();
                }
            }
        });
        $("#filterwithTime").on('click', eventsFilterWithTime);
        $('.alarm-time-tab').on('click', assignFilterTimes);


        /*AutoComplete*/
        var autocomlist = $("#auto-comp-list");
        if (typeof String.prototype.startsWith != 'function') {
            String.prototype.startsWith = function (str) {
                return this.indexOf(str) == 0;
            };
        }

        $(".alarm-search-textbox").autocomplete({
            minLength: 1,
            source: function (request, response) {
                var sArray = split(request.term.toLowerCase());
                searchString = sArray[sArray.length - 1];
                if (searchString.trim().length > 0) {
                    var data = ({ searchString: searchString.toString() });
                    ajaxRequest("POST", common.getactionPath("SearchEntities"), data).done(function (jsResult) {
                        if (jsResult.Success) {
                            if (!jsResult.errorMessage)
                                if (jsResult.data) {
                                    data = jsResult.data;
                                    var filterItems = ["camera", "recorder", "site", "account", "devicegrouptemplate", "devicecontroller", "devicepoint", "inputpoint", "outputpoint", "rule"];
                                    var data = $.map(data, function (s) {
                                        if (searchString != "" && $.inArray(s.EntityType, filterItems) > -1 && s.Name.toLowerCase().indexOf(searchString) > -1) {
                                            return s;
                                        }
                                    });
                                    var data = $.map(data, function (item) {
                                        return {
                                            EntityName: item.Name,
                                            EntityType: item.EntityType,
                                            Id: item.Id
                                        }
                                    });
                                    response(data);
                                }
                                else {
                                    alertify.error(jsResult.errorMessage);
                                }
                        }
                        else {
                            if (jsResult.errorMessage)
                                alertify.error(jsResult.errorMessage);
                        }

                    }).fail(function (jsResult) {
                        if (errorCallback)
                            errorCallback(Resources.General_error);
                    });
                }
                else {
                    $(".alarm-search-textbox").val($(".alarm-search-textbox").val().trim()).focus();
                }
            },
            select: function (event, ui) {
                //FilteredEntites([]);
                var terms = split(this.value);
                terms.pop();
                terms.push(ui.item.EntityName + ',');
                this.value = terms.join(", ");
                FilteredEntites.push(ui.item);
                autocomlist.parent().hide();
                //$(".search-popover").hide();
                event.stopPropagation();
                $(".alarm-search-textbox").show().focus();
                return false;
            },
            focus: function () {
                // prevent value inserted on focus when navigating the drop down list
                return true;
            }
        }).data("ui-autocomplete")._renderItem = function (ul, item) {
            var ImageUrl;
            switch (item.EntityType.toLowerCase()) {
                case "devicegrouptemplate":
                case "devicecontroller":
                case "devicepoint":
                case "inputpoint":
                case "outputpoint":
                    ImageUrl = "icon_doornor";
                    break;
                case "camera":
                case "recorder":
                    ImageUrl = "icon_videonor";
                    break;
                case "site":
                case "account":
                    ImageUrl = "icon_site";
                    break;
                case "customer":
                    ImageUrl = "icon_customer";
                    break;
                case "rule":
                    ImageUrl = "icon_rules";
                    break;
            }

            if (item.EntityName != '' && $('.alarm-search-textbox').val() != '') {
                $(".alarm-srh-dis").addClass('open');
                autocomlist.parent().show();
                autocomlist.animate({ height: 100 });
            }
            else {
                autocomlist.parent().hide();
                autocomlist.animate({ height: 0 });
            }
            var inner_html = '<b class="autocom_icon ' + ImageUrl + '"></b><a class="ui-corner-all" tabindex="-1"><span class="autocom_txt" >' + item.EntityName + '</span></a>';
            return $("<li class='ui-menu-item' role='presentation'></li>")
                .data("ui-autocomplete-item", item)
                .append(inner_html)
                .appendTo(ul);
        };
        $('.ui-autocomplete').appendTo($("#auto-comp-list"));

        var scrollStep = 50, parent = $(".searchSpantagholder");

        function startScrolling(modifier, step) {
            var newOffset = parent.scrollLeft() + (scrollStep * modifier);
            if (newOffset > 0) {
                parent.animate({
                    scrollLeft: newOffset
                }, 1);
            }
            else
                parent.scrollLeft(0);
        }

        $(document.body).keydown(function (e) {
            switch (e.which) {
                case 37:
                    startScrolling(-1, scrollStep);
                    break;
                case 39:
                    startScrolling(1, scrollStep);
                    break;
            }
            Hidepopover();
        });
        //$('#table-alarm tbody').click(function () {
        //    Hidepopover();
        //    CloseVideoSession("Body");
        //});

        //$(document).on('mouseleave', function () {
        //    debugger;

        //});

        $(document.body).on("click", ".closeBtn", function (event) {
            $('#multiple-videos').removeAttr('style').attr('style', 'display:none');
            $(document).find(".modal-backdrop").remove();
            $('#MultiClipWrapper').remove();
            $(".video-clip-play-section").append('<div id="MultiClipWrapper"></div>');
            CloseVideoSession("Multi Close");
        });
        //var $visiblePopover;
        //$(document).on('click', '.actionBtn,.door-popup a,.video-popup a', function () {
        //    var $this = $(this);
        //    if ($visiblePopover && $visiblePopover.prop("data-clipSession")) {
        //        var cameraId = $visiblePopover.val().id;
        //        var Id = $visiblePopover.prop("data-clipSession");
        //        clipSessionClose(cameraId, Id);
        //    }
        //    if ($this.data("popover") && $this.data("popover").tip().hasClass('in')) {
        //        $visiblePopover && $visiblePopover.webuiPopover('hide');

        //        $visiblePopover = $this;
        //    } else {
        //        $visiblePopover = '';
        //    }
        //});

        $(document).on('keydown', '.alarm-search-textbox', function (event) {
            var data = ko.contextFor(this).$data;
            filterAlarms(data, event);
        });

        $(".alarm-new-cus").click(function () {
            datacontext.getAlarmFilters(function (jsondata) {
                if (jsondata.Success) {
                    if (!jsondata.errorMessage)
                        updateAlarmFilterDatasource(jsondata, true);
                    else
                        alertify.error(jsondata.errorMessage);
                }
                else {
                    if (jsondata.errorMessage)
                        alertify.error(jsondata.errorMessage);
                }
            }, function (errorMessage) { alertify.error(errorMessage); });
        });
    }

    var eventsFilterWithTime = function () {
        var startDate = $("#alarmfrmdatetimepicker > input").val().toDateString();
        var endDate = $("#alarmtodatetimepicker > input").val().toDateString();
        var bContext = ko.contextFor(document.getElementById(alarmFormId));
        if (startDate != undefined && startDate != "" && endDate != undefined && endDate != "") {
            if (new Date(startDate) > new Date(endDate)) {
                alertify.alert(Resources.StartandEndDateValidationMsg);
            }
            else {
                $("#alarmsSearchFilter").val("true");
                var filterMsg = startDate + ' - ' + endDate;
                $('#search').find('[type="search"]').focus().val(filterMsg);
                datacontext.geteventslogcount('NEW', 'Alarm', startDate, endDate, function (jsondata) {
                    if (jsondata.Success) {
                        if (!jsondata.errorMessage) {
                            var initCount = jsondata.data;
                            loadEventCount(initCount, initCount);
                        }
                        else
                            alertify.error(jsondata.errorMessage);
                    }
                    else {
                        if (jsondata.errorMessage)
                            alertify.error(jsondata.errorMessage);
                    }
                }, function (errorMessage) {
                    alertify.error(errorMessage);
                });
                datacontext.getalarmdetails(0, pageRowCount, startDate, endDate, function (jsondata) {
                    if (jsondata.Success) {
                        if (!jsondata.errorMessage)
                            bContext.$data.filteredAlarmDatasource(jsondata.data);
                        else
                            alertify.error(jsondata.errorMessage);
                    }
                    else {
                        if (jsondata.errorMessage)
                            alertify.error(jsondata.errorMessage);
                    }
                }, function (errorMessage) {
                    alertify.error(errorMessage);
                });
            }
        }
        else {
            alertify.alert(Resources.Alarm_DataFilter);
        }
    }

    var assignFilterTimes = function (event, dateRanges) {
        if ($(event).length > 0)
            event.stopPropagation();
        //$('.alarm-time-tab').removeClass('selected-time-tab');
        //$(this).addClass('selected-time-tab');
        var dateRange;
        if (dateRanges != null)
            dateRange = dateRanges;
        else
            dateRange = $(this).attr('id');

        var startDateCtrl = $("#alarmfrmdatetimepicker > input");
        var endDateCtrl = $("#alarmtodatetimepicker > input");
        var curr = new Date(), y = curr.getFullYear(), m = curr.getMonth();
        switch (dateRange.toLowerCase()) {
            case "today":
                startDateCtrl.val(curr.format(Resources.dateformatjs) + " 00:00:00");
                //endDateCtrl.val(curr.format("mm/dd/yyyy HH:MM:ss"));
                endDateCtrl.val(curr.format(Resources.dateformatjs) + " 23:59:59");
                break;
            case "yesterday":
                var yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                startDateCtrl.val(yesterday.format(Resources.dateformatjs) + " 00:00:00");
                endDateCtrl.val(yesterday.format(Resources.dateformatjs) + " 23:59:59");
                break;
            case "last7days":
                startDateCtrl.val(new Date(curr.setDate(curr.getDate() - 6)).format(Resources.dateformatjs) + " 00:00:00");
                endDateCtrl.val(new Date().format(Resources.dateformatjs) + " 23:59:59");
                break;
            case "last30days":
                startDateCtrl.val(new Date(curr.setMonth(curr.getMonth() - 1)).format(Resources.dateformatjs) + " 00:00:00");
                endDateCtrl.val(new Date().format(Resources.dateformatjs) + " 23:59:59");
                break;
        }
    }

    function checkAllAlarms(newVal) {
        //Abilasha USP-4852
        $.map(window.alarmconfig.alarmViewmodel.filteredDatasource(), function (item) {
            if (item.IsClear() == false)
                item.IsSelected(newVal);
            return item;
        });
    }

    function changeView(isViewmode) {
        if (isViewmode) {
            $('#alarm-setting-section').hide();
            $('#alarm-main-section').show();
        }
        else {
            $('#alarm-setting-section').show();
            $('#alarm-main-section').hide();
        }
    }

    function loadAlarmConfiguration() {
        try {
            changeView(false);
            datacontext.getsystemeventconfiguration("A70D7DCE-4F1F-E211-AAA2-0050568F021A", function (jsondata) {
                if (jsondata.Success) {
                    severityDatasource(jsondata);
                }
                else {
                    //  if (jsondata.errorMessage)
                    //alertify.error(jsondata.errorMessage);
                }
            }, function (errorMessage) {
                alertify.error(errorMessage);
            });
        } catch (e) {
            console.error(e);
        }
    }

    function onActionNewMenuClick() {
        if ($('.eventid[isclear!=true]').length != 0) {
            $(".icon_acknowledge").parent().css("cursor", "pointer");
            $(".icon_clearall").parent().css("cursor", "pointer");
            var resultClear = _.filter(window.alarmconfig.alarmViewmodel.filteredDatasource(), function (item) {
                return item.IsSelected() && (item.IsAcknowledge() || item.EventType.toLowerCase() == "event");
            });
            var resultAck = _.filter(window.alarmconfig.alarmViewmodel.filteredDatasource(), function (item) {
                return item.IsSelected() && item.ShowAcknowledge() && !item.IsAcknowledge();
            });
            var ackElement = $(".eventAck > span");
            var ackClrElement = $(".eventClr > span");
            if (resultClear.length == 0 && resultAck.length == 0) {
                ackElement.html(Resources.Acknowledge_All);
                ackClrElement.html(Resources.Clear_All);
            }
            else {
                ackElement.html(Resources.Acknowledge + "(" + resultAck.length + ")");
                ackClrElement.html(Resources.Clear + " (" + resultClear.length + ")");
            }
        }
        else {
            $(".icon_acknowledge").parent().css("cursor", "default");
            $(".icon_clearall").parent().css("cursor", "default");
        }
    }

    function AckFilter() {
        var filter = "ACKNOWLEDGE";
        $("#alarmFilter").val(filter);
        if ($("#alarmsSearchFilter").val() == "false") {
            var baseContext = ko.contextFor(document.getElementById(alarmFormId));
            baseContext.$root.filteredData();
        }
        else {
            loadDataAfterFilteration();
        }
        filteresColumns();
        datacontext.isFilterApplied(false);
        if (!datacontext.showUnFreezeBtn()) {
            //$('#table-alarm tbody').removeClass('alarm-frozen-tbody');
            //$('.alarm-frozen-tr').removeClass('showspan');
            datacontext.showFreezeRow(false);
        }
        ClearFilter();
    }

    function UnAckFilter() {
        var filter = "NEW";
        $("#alarmFilter").val(filter);
        if ($("#alarmsSearchFilter").val() == "false") {
            var baseContext = ko.contextFor(document.getElementById(alarmFormId));
            baseContext.$root.filteredData();
            baseContext.$root.getDataAftrAck();
        }
        else {
            loadDataAfterFilteration();
        }
        filteresColumns();
        datacontext.isFilterApplied(false);
        if (!datacontext.showUnFreezeBtn()) {
            //$('#table-alarm tbody').removeClass('alarm-frozen-tbody');
            //$('.alarm-frozen-tr').removeClass('showspan');
            datacontext.showFreezeRow(false);
        }
        ClearFilter();
    }

    function AllAlarms() {
        var filter = "AllAlarms";
        $("#alarmFilter").val(filter);
        if ($("#alarmsSearchFilter").val() == "false") {
            var baseContext = ko.contextFor(document.getElementById(alarmFormId));
            baseContext.$root.filteredData();
        }
        else {
            loadDataAfterFilteration();
        }
        filteresColumns();
        datacontext.isFilterApplied(false);
        if (!datacontext.showUnFreezeBtn()) {
            //$('#table-alarm tbody').removeClass('alarm-frozen-tbody');
            //$('.alarm-frozen-tr').removeClass('showspan');
            datacontext.showFreezeRow(false);
        }
        ClearFilter();
    }

    function EvtFilter() {
        var filter = "Event";
        $("#alarmFilter").val(filter);
        if ($("#alarmsSearchFilter").val() == "false") {
            var baseContext = ko.contextFor(document.getElementById(alarmFormId));
            baseContext.$root.filteredData();
        }
        else {
            loadDataAfterFilteration();
        }
        filteresColumns();
        datacontext.isFilterApplied(false);
        if (!datacontext.showUnFreezeBtn()) {
            //$('#table-alarm tbody').removeClass('alarm-frozen-tbody');
            //$('.alarm-frozen-tr').removeClass('showspan');
            datacontext.showFreezeRow(false);
        }
        ClearFilter();
    }

    //function showhidecolumn(parent, child) {
    //    $(parent).prop('checked') == true ? $("." + child).show() : $("." + child).hide();
    //}

    function filteresColumns() {
        $('.showtype').hide(); $('.showseverity').hide(); $('.showtimeanddate').hide(); $('.showlocation').hide(); $('.showactionandinstructions').hide();
        $('#ultab1 input:checked').each(function () {
            switch ($(this).attr('id')) {
                case "chkType":
                    $('.showtype').show();
                    break;
                case "chkSeverity":
                    $('.showseverity').show();
                    break;
                case "chkTimeandDate":
                    $('.showtimeanddate').show();
                    break;
                case "chkLocation":
                    $('.showlocation').show(); $('.showactionandinstructions').hide();
                    break;
                case "chkActionandInstructions":
                    $('.showactionandinstructions').show();
                    break;
            }
        })
    }

    function eventSummaryDatasource(eventsummary) {
        var bContext = ko.contextFor(document.getElementById(alarmFormId));
        bContext.$data.eventSummaryData(eventsummary.data);
    }

    function loadEventCount(allCount, unAckCount) {
        if (allCount >= 0)
            $("#alarmsTotalCount").val(allCount);
        if (unAckCount >= 0)
            $("#alarmsUnAckCount").val(unAckCount);
        //$(".alarmCount").html("(" + allCount + ")");
        $("#alarmnewarrow").css('display', 'inline-block');
        if (datacontext.showUnFreezeBtn()) {
            var filter = $("#alarmFilter").val();
            var count = 0;
            switch (filter) {
                case "AllAlarms":
                    if (!isNaN($("#alarmsTotalCount").val()) && $("#alarmsTotalCount").val() != "" && $("#alarmsTotalCount").val() != "0" && $("#alarmsTotalCount").val() != 0) {
                        $(".alarmCount").html("(" + $("#alarmsTotalCount").val() + ")");
                    }
                    break;
                case "NEW":
                    if (!isNaN($("#alarmsUnAckCount").val()) && $("#alarmsUnAckCount").val() != "" && $("#alarmsUnAckCount").val() != "0" && $("#alarmsUnAckCount").val() != 0) {
                        $(".alarmCount").html("(" + $("#alarmsUnAckCount").val() + ")");
                    }
                    break;
                case "Event":
                    if (unAckCount == 0) {
                        count = parseInt($(".alarmCount").html().replace(/[(\)]/g, '')) + 1;
                        $(".alarmCount").html("(" + count + ")");
                    }
                    break;
            }
        }
    }

    function createGuid() {
        return 'xxxxxxyy_xxxx_4xxx_yxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    function showSaveFilterDialog() {
        $("#save-filters").modal(modalOptions);

    }

    function closeSaveFilterDialog() {
        $('.saveFiltersModel').hide();
        $(document).find(".modal-backdrop").remove();
    }

    var showgetactionbyevent = function (event, popoverObseravable) {
        var popoverParent = event.currentTarget;
        thiscontext.showgetactionbyevent.popoverParent = popoverParent;
        var isPopoverShown = $(popoverParent).attr("data-ispopovershown");
        if (isPopoverShown == undefined || isPopoverShown == null) {
            $(popoverParent).attr("data-ispopovershown", true);
            $(popoverParent.parentElement).webuiPopover({
                html: true,
                trigger: 'click',
                content: $("#threeActionContent").html(),
                placement: 'auto',
                cache: false,
                async: true
            }).on("shown.webui.popover", showgetactionbyevent.onpopovershown).on("hide.webui.popover", showgetactionbyevent.onpopoverhide);
        }
    }

    showgetactionbyevent.onpopovershown = function () {
        var popover = $('.webui-popover.in');
        popover.addClass("alarmactionspopover");
        var bContext = ko.contextFor(thiscontext.showgetactionbyevent.popoverParent);
        //CloseVideoSession("Three action");
        datacontext.getactionbyevent(bContext.$data.SourceEntityType, bContext.$data.SourceEntityId, bContext.$data.EventCode, function (result) {
            bContext.$data.Actions = ko.observableArray([]);
            if (result.Success) {
                bContext.$data.Actions = $.map(result.data, function (action) {
                    var entityId, entityType, additionalInfo;
                    if (bContext.$data.DoorAdditionalInfo.length > 0)
                        additionalInfo = bContext.$data.DoorAdditionalInfo[0].value || bContext.$data.DoorAdditionalInfo[0].Value;
                    if (_.indexOf(['lock', 'unlock', 'energize', 'deenergize'], action.toLowerCase()) >= 0 && !additionalInfo) {
                        return;
                    }
                    if ((action.toLowerCase() == 'lock' || action.toLowerCase() == 'unlock' || action.toLowerCase() == 'timedpulse' || action.toLowerCase() == 'energize' || action.toLowerCase() == 'deenergize') && additionalInfo) {
                        entityId = additionalInfo[0].ID;
                        entityType = common.constants.door;
                    }
                    else {
                        entityId = bContext.$data.SourceEntityId;
                        entityType = bContext.$data.SourceEntityType;
                    }

                    return { id: entityId, type: entityType, action: { name: action, displayName: Resources[action] || action } };
                });
            }
            datacontext.getAccountinfo(bContext.$data.AccountId, function (result) {
                var data = result.ContactInfo;
                bContext.$data.siteInfo = ({
                    AddressLine1: data.AddressLine1,
                    AddressLine2: data.AddressLine2,
                    City: data.City,
                    Region: data.Region,
                    Country: data.Country,
                    Phone: data.Phone,
                    ZipCode: data.ZipCode,
                    Name: result.Name
                });
                ko.cleanNode(document.getElementById("threeActionsInfo"));
                ko.applyBindings(bContext.$data, document.getElementById("threeActionsInfo"));
                $('#threeActionsInfo').find('.hideControls').removeClass('hideControls').addClass('showControls');
            }, function (result) { alertify.alert(Resources.General_error); });
        }, function (result) {
            alertify.alert(Resources.General_error);
        });
    }

    showgetactionbyevent.onpopoverhide = function () {
        $(thiscontext.showdoorpopover.popoverParent).webuiPopover('destroy');
        $('.webui-popover').remove();
    }

    showgetactionbyevent.onbuttonclick = function (event) {
        console.log(event.currentTarget.innerHTML + ' action clicked');
        var popoverParent = event.currentTarget;
        var context = ko.contextFor(popoverParent);
        datacontext.performaction(context.$data.id, context.$data.type, context.$data.action.name, function (response) {
            if (response.Success)
                alertify.success(common.constants.actionsuccessful);
            else
                alertify.error(Resources[response.errorMessage] || response.errorMessage);
        }, function (response) {
            alertify.error(common.constants.actionfailed);
        });
    }

    var $sopActionModal;

    var showgetsopactionbyeventtype = function (model) {
        $sopActionModal = $("#sopActionPop");
        datacontext.getsopbyeventtype(model.Id, (function (jsResult) {
            var alarmSop = new datacontext.alarmsop(jsResult);
            alarmSop.EventName(model.Name);
            ko.applyBindings(alarmSop, document.getElementById("sopActionPop"));
            $sopActionModal.modal(modalOptions);
        }), function (errorMessage) {
            alertify.error(errorMessage);
        })
        ko.cleanNode(document.getElementById("sopActionPop"));
    }

    var closesopmodal = function () {
        if ($sopActionModal) {
            $sopActionModal.modal("hide");
        }
    }

    $.subscribe(common.events.systemeventreceived, function (eventName, data) {
        if ($("#alarmsSearchFilter").val() == "false" && data[0][window.mpcglobal.eventschema.EventCode] >= common.constants.eventcodeallowed) {
            var init = 0, initUnAckCount = 0;
            if (!isNaN($("#alarmsTotalCount").val()) && $("#alarmsTotalCount").val() != "") {
                init = parseInt($("#alarmsTotalCount").val()) + 1;
            }
            if (!isNaN($("#alarmsUnAckCount").val()) && $("#alarmsUnAckCount").val() != "") {
                initUnAckCount = parseInt($("#alarmsUnAckCount").val());
                if (data[0][window.mpcglobal.eventschema.EventType].toLowerCase() == 'alarm') {
                    initUnAckCount = initUnAckCount + 1;
                }
            }
            if (isNaN($("#alarmsTotalCount").val())) {
                console.log("TotalCount" + $("#alarmsTotalCount").val());
            }
            loadEventCount(init, initUnAckCount);
            console.log(data);
            wsAlarmDatasource(data);
        }
    });

    $.subscribe(common.events.onclose, function (eventName, data) {
        //var socketAlert = $("#socketAlert");
        //if (socketAlert.html() == undefined && socketAlert.html() == null) {
        //    var dynmaicModal = "<div id='socketAlert' class='mpcmodel modal hide fade in' data-backdrop='static' data-keyboard='false' tabindex='-1' role='dialog' aria-labelledby='myModalLabel' aria-hidden='false'><section class='row'><h5>" + Resources.Alarm_Socketerror + "</h5></section></div>";
        //    $(dynmaicModal).modal(modalOptions);
        //}        
        //if ($('#alarms').css('display') == 'block') {
        //var errorMsg = Resources.Alarm_Socketerror;
        //alertify.error(errorMsg.toString());        
        //}
        datacontext.showAlarmDCM(true);
    });

    $.subscribe(common.events.onopen, function (eventName, data) {
        //var socketAlert = $("#socketAlert");
        //if (socketAlert != undefined && socketAlert != null) {
        //    $('.mpcmodel').remove();
        //    $('.modal-backdrop').remove();
        //    $(socketAlert).modal('hide');
        //}
        datacontext.showAlarmDCM(false);
    });

    $.subscribe(common.events.alarmnavigation, function (eventName, data) {
        if (data.RegionName == 'alarms') {
            window.alarmconfig.alarmreciever.init();
            var allAlarms = window.alarmconfig.alarmViewmodel.filteredDatasource();
            var selectedEvent = _.findWhere(allAlarms, { Id: data.Id });
            selectedEvent.IsSelected(true);
        }
    });

    var showmovepopover = function (event, popoverObseravable) {
        var popoverParent = event.currentTarget;
        thiscontext.showmovepopover.popoverParent = popoverParent;
        var isPopoverShown = $(popoverParent).attr("data-ispopovershown");
        if (isPopoverShown == undefined && isPopoverShown == null) {
            $(popoverParent).attr("data-ispopovershown", true);
            $(popoverParent).webuiPopover({
                html: true,
                content: $("#door-popup").html(),
                title: dooraname,
                trigger: 'click',
                placement: 'auto',
                cache: false,
                async: true,
                dismissible: false
            }).on("shown.webui.popover", showmovepopover.onpopovershown);
            $(popoverParent).webuiPopover('show');
        }
    }

    var loadDataAfterFilteration = function () {
        $("#alarmsSearchFilter").val("false");
        $("#alarmfrmdatetimepicker > input").val("");
        $("#alarmtodatetimepicker > input").val("");
        $('#search').find('[type="search"]').val("");
        var bContext = ko.contextFor(document.getElementById(alarmFormId));
        datacontext.geteventslogcount(clientOffset, 'NEW', 'Alarm', null, null, function (jsondata) {
            if (jsondata.Success) {
                if (!jsondata.errorMessage) {
                    var initCount = jsondata.data;
                    loadEventCount(initCount, initCount);
                }
                else
                    alertify.error(jsondata.errorMessage);
            }
            else {
                if (jsondata.errorMessage)
                    alertify.error(jsondata.errorMessage);
            }
        }, function (errorMessage) {
            alertify.error(errorMessage);
        });

        datacontext.getalarmdetails(clientOffset, 0, pageRowCount, null, null, true, "New", null, null, null, function (jsondata) {
            if (jsondata.Success) {
                if (!jsondata.errorMessage)
                    bContext.$data.filteredAlarmDatasource(jsondata.data);
                else
                    alertify.error(jsondata.errorMessage);
            }
            else {
                if (jsondata.errorMessage)
                    alertify.error(jsondata.errorMessage);
            }
        }, function (errorMessage) {
            alertify.error(errorMessage);
        });
    }

    var serachfilter = function () {
        var searchfilter = [];
        $('#searchSpan .primary-button').each(function () {
            if ($(this).attr('data-EntityType') && $(this).attr('data-EntityValue')) {
                key = $(this).attr('data-EntityType');
                if (key.toLowerCase() == 'event') {
                    value = $(this).attr('data-EntityValue') + ';' + $(this).attr('data-eventcode');
                }
                else
                    value = $(this).attr('data-EntityValue');
                searchfilter.push({
                    key: key,
                    value: value
                });
            }
        });
        return searchfilter;
    }

    var filterAlarms = function (data, event) {
        var filters = serachfilter();
        var startDateCtrl = $("#alarmfrmdatetimepicker > input");
        var endDateCtrl = $("#alarmtodatetimepicker > input");
        var searchTxtBox
        if ($(event)[0].name != "live" && data != null) {
            if ($(event)[0].keyCode == 13) {
                datacontext.freezeCount(0);
            }
            searchTxtBox = $(event.currentTarget);
        }
        else {
            searchTxtBox = $('.alarm-search-textbox');
        }
        var originalTxt = searchTxtBox.val();
        switch ($(event)[0].keyCode) {
            case 13:
                datacontext.filterApplied(true);
                if (searchTxtBox.val() == '' && filters.length == 0 && $('#filterText').html() != Resources.Custom) {
                    datacontext.freezeAlarm("unfreeze");
                    datacontext.filterApplied(false);
                    return;
                }
                if ($(event)[0].name != "live") $('.alarm-srh-dis').removeClass('open');
                var originalData;
                //datacontext.showFreezeBtn(false);
                if (searchTxtBox.val() != '' || filters.length > 0) {
                    if (filters.length == 0 && FilteredEntites().length == 0) {
                        searchTxtBox.val("");
                        if (window.alarmconfig.alarmViewmodel.filteredDatasource().length > 0) {
                            FilteredEntites([]);
                            window.alarmconfig.alarmViewmodel.filteredDatasource([]);
                            window.alarmconfig.alarmViewmodel.filteredDatasource(window.alarmconfig.alarmViewmodel.alarmDatasource());
                            $('#filterText').html(Resources.AllAlarms);
                            $(".alarmCount").html("(" + $("#alarmsTotalCount").val() + ")").css('display', 'inline-block');
                            $('#SaveSearch').hide();
                            datacontext.freezeAlarm("unfreeze");
                            datacontext.filterApplied(false);
                            if (event)
                                datacontext.freezeCount(0);
                        }
                        return;
                    }
                    else if (filters.length > 0 && FilteredEntites().length == 0) {
                        searchTxtBox.val("");
                    }
                    else if ((filters.length > 0 && FilteredEntites().length > 0) || (FilteredEntites().length > 0 && filters.length == 0)) {
                        var splittedValues = split(searchTxtBox.val().replace(/(^,)|(,$)/g, ""));
                        var finalvalue = "";
                        for (var i = 0; i < splittedValues.length; i++) {
                            if (FilteredEntites()[i] != null && FilteredEntites()[i].EntityName == splittedValues[i]) {
                                finalvalue += splittedValues[i] + ', ';
                            }
                            else {
                                FilteredEntites.splice(i, 1);
                            }
                        }
                        searchTxtBox.val(finalvalue);
                    }

                    var filtered = [];
                    var isTimeFilterApplied = _.filter(filters, function (item) {
                        return item.key.toLowerCase() == 'time';
                    });

                    startDate = startDateCtrl.val();
                    endDate = endDateCtrl.val();
                    if (isTimeFilterApplied.length > 0) {
                        if (startDate != undefined && startDate != "" && endDate != undefined && endDate != "") {
                            if (startDate.toDate() > endDate.toDate()) {
                                alertify.alert(Resources.Search_End_Date_Greater_Than);
                                return;
                            }
                        }
                        else {
                            alertify.alert(Resources.Search_End_Date_Greater_Than);
                            return;
                        }
                    }

                    switch ($(event)[0].name) {
                        case "live":
                            originalData = data;
                            break;
                        case "timebased":
                            originalData = window.alarmconfig.alarmViewmodel.filteredDatasource();
                            break;
                        default:
                            window.alarmconfig.alarmViewmodel.filteredDatasource([]);
                            originalData = window.alarmconfig.alarmViewmodel.alarmDatasource();
                            break;
                    }

                    if (isTimeFilterApplied.length > 0) {
                        if ($(event)[0].name != 'live') {
                            timeBasedFilter(filters, FilteredEntites());
                            datacontext.isFilterApplied(true);
                            return;
                        }
                        originalData = _.filter(originalData, function (item) {
                            return new Date(item.OriginTime) >= new Date(startDate) && new Date(item.OriginTime) <= new Date(endDate);
                        });
                    }
                    $.each(filters, function (key, value) {
                        var filter = "";
                        if ($(value).get(0).value.toString().toLowerCase().split(';').length > 1) {
                            filter = $(value).get(0).value.toString().toLowerCase().split(';')[1];
                            filtered = _.filter(originalData, function (item) {
                                return item.EventCode == filter;
                            });
                        }
                        else {
                            filter = $(value).get(0).value.toString().toLowerCase();
                            switch (filter) {
                                case "camera":
                                case "cameras":
                                    filtered = _.filter(originalData, function (item) {
                                        if (item.SourceEntityType)
                                            return (item.SourceEntityType.toLowerCase() == "camera");
                                    });
                                    break;
                                case "door":
                                case "doors":
                                    filtered = _.filter(originalData, function (item) {
                                        if (item.MasterSourceEntityType && item.SourceEntityType)
                                            return (item.MasterSourceEntityType.toLowerCase() == "devicecontroller" && item.SourceEntityType.toLowerCase() != "devicecontroller");
                                    });
                                    break;
                                case "account":
                                case "accounts":
                                    filtered = _.filter(originalData, function (item) {
                                        return item.AccountName != null;
                                    });
                                    break;
                                case "rule":
                                case "rules":
                                    filtered = _.filter(originalData, function (item) {
                                        return item.EventCode == 5040;
                                    });
                                    break;
                            }
                        }

                        if (searchTxtBox == "" && originalData.length > 0 && filtered == undefined) {
                            filtered = originalData;
                        }

                        for (var alindex in filtered) {
                            var resThere = _.findWhere(window.alarmconfig.alarmViewmodel.filteredDatasource(), { Id: filtered[alindex].Id });
                            if (!resThere) {
                                //Close all the popovers
                                $('.webui-popover').remove();
                                if ($(event)[0].name == "live" && filtered.length > 0)
                                    window.alarmconfig.alarmViewmodel.filteredDatasource.unshift(filtered[alindex]);
                                else
                                    window.alarmconfig.alarmViewmodel.filteredDatasource.push(filtered[alindex]);
                            }
                        }

                    });
                    if (searchTxtBox.val() != "") {
                        if (FilteredEntites().length > 0) {
                            $.each(FilteredEntites(), function (key, value) {
                                switch (value.EntityType.toLowerCase()) {
                                    case "camera":
                                    case "s_camera":
                                    case "recorder":
                                    case "s_recorder":
                                    case "devicecontroller":
                                    case "devicepoint":
                                    case "inputpoint":
                                    case "outputpoint":
                                        filtered = _.filter(originalData, function (item) {
                                            return item.SourceEntityName.toLowerCase() == value.EntityName.toLowerCase();
                                        });
                                        break;
                                    case "devicegrouptemplate":
                                    case "s_devicegrouptemplate":
                                        filtered = _.filter(originalData, function (item) {
                                            return item.DoorName.toLowerCase() == value.EntityName.toLowerCase();
                                        });
                                        break;
                                    case "site":
                                    case "s_site":
                                    case "account":
                                    case "s_account":
                                        filtered = _.filter(originalData, function (item) {
                                            if (item.AccountName && item.AccountName != null) {
                                                return item.AccountName.toLowerCase() == value.EntityName.toLowerCase();
                                            }
                                        });
                                        break;
                                }
                                for (var alindex in filtered) {
                                    var resThere = _.findWhere(window.alarmconfig.alarmViewmodel.filteredDatasource(), { Id: filtered[alindex].Id });
                                    if (!resThere) {
                                        if ($(event)[0].name == "live" && filtered.length > 0)
                                            window.alarmconfig.alarmViewmodel.filteredDatasource.unshift(filtered[alindex]);
                                        else
                                            window.alarmconfig.alarmViewmodel.filteredDatasource.push(filtered[alindex]);
                                    }
                                }
                            });
                        }
                        var finalSortedData = _.sortBy(window.alarmconfig.alarmViewmodel.filteredDatasource(), function (data) {
                            return [data.AlarmDate, data.AlarmTime].join("_");
                        }).reverse();
                        window.alarmconfig.alarmViewmodel.filteredDatasource(finalSortedData);

                    }
                    if (isTimeFilterApplied.length > 0 && filters.length == 1 && searchTxtBox.val() == '' && originalData != undefined && originalData != null) {
                        filtered = originalData;
                        for (var alindex in filtered) {
                            var resThere = _.findWhere(window.alarmconfig.alarmViewmodel.filteredDatasource(), { Id: filtered[alindex].Id });
                            if (!resThere) {
                                if ($(event)[0].name == "live" && filtered.length > 0)
                                    window.alarmconfig.alarmViewmodel.filteredDatasource.unshift(filtered[alindex]);
                                else
                                    window.alarmconfig.alarmViewmodel.filteredDatasource.push(filtered[alindex]);
                            }
                        }
                    }
                    //window.alarmconfig.alarmViewmodel.filteredDatasource.sort(function (a, b) {
                    //    return new Date(b.OriginTime) - new Date(a.OriginTime);
                    //});
                    filteresColumns();
                    if ($(event)[0].name == "live" && filtered.length == 0) {
                        //var nonFilterCount = $('.alarm-frozen-count b');
                        //nonFilterCount.text(parseInt(nonFilterCount.text()) + 1);
                        datacontext.freezeCount(datacontext.freezeCount() + 1);

                    }
                    datacontext.isFilterApplied(true);
                    $('#filterText').html(Resources.Custom);
                    $(".alarmCount").css('display', 'none');
                    $('#SaveSearch').show();
                    datacontext.freezeAlarm("freeze");
                    searchBoxWidth();
                    //switch (filters.length) {
                    //    case 0:
                    //        searchTxtBox.css("width", "90%");
                    //        break;
                    //    case 1:
                    //        searchTxtBox.css("width", "58%");
                    //        break;
                    //    case 2:
                    //        searchTxtBox.css("width", "28%");
                    //        break;
                    //}
                }
                else {
                    FilteredEntites([]);
                    window.alarmconfig.alarmViewmodel.filteredDatasource([]);
                    window.alarmconfig.alarmViewmodel.filteredDatasource(window.alarmconfig.alarmViewmodel.alarmDatasource());
                    $('#filterText').html(Resources.AllAlarms);
                    if (!isNaN($("#alarmsTotalCount").val()) && $("#alarmsTotalCount").val() != "" && $("#alarmsTotalCount").val() != "0" && $("#alarmsTotalCount").val() != 0) {
                        $(".alarmCount").html("(" + $("#alarmsTotalCount").val() + ")");
                    }
                    else {
                        $(".alarmCount").html("(0)");
                    }
                    if (isNaN($("#alarmsTotalCount").val())) {
                        console.log("TotalCount" + $("#alarmsTotalCount").val());
                    }
                    $(".alarmCount").css('display', 'inline-block');
                    $('#SaveSearch').hide();
                    datacontext.freezeAlarm("unfreeze");
                    datacontext.filterApplied(false);
                    datacontext.showFreezeBtn(true);
                    searchTxtBox.css("width", "92%");
                    if (event)
                        datacontext.freezeCount(0);
                }
                break;
            case 8:
                if (searchTxtBox.val() == '' && filters.length > 0) {
                    var parent = $('#searchSpan .primary-button').last();
                    $('.search-filter-text').each(function () {
                        if ($(this).attr('id') == parent.attr('data-EntityValue')) {
                            $(this).removeClass("alarm-search-btn-selected primary-button");
                            $(this).addClass("alarm-search-btn secondary-button");
                            if (parent.attr('data-EntityType').toLowerCase() == 'time') {
                                $(this).removeClass("alarm-search-btn secondary-button");
                            }
                        }
                    });
                    if (parent.attr('data-EntityType').toLowerCase() == 'time') {
                        $("#alarmfrmdatetimepicker > input").val("");
                        $("#alarmtodatetimepicker > input").val("");
                    }
                    $('#searchSpan .primary-button').last().remove();
                    $(".alarm-more-btn").hide();
                    if (filters.length > 1) {
                        $(".alarm-more-btn").show();
                    }

                    $(".alarm-search-textbox").show().focus();
                }
                else if (searchTxtBox.val() == '') {
                    FilteredEntites([]);
                    datacontext.isFilterApplied(false);
                    //searchTxtBox.css("width", "93%");                    
                }
                if (FilteredEntites().length > 0
                    && searchTxtBox.val() != ''
                    && split(originalTxt)[split(originalTxt).length - 1].toLowerCase() != FilteredEntites()[FilteredEntites().length - 1].EntityName.toLowerCase()
                    && split(originalTxt).length == FilteredEntites().length) {
                    FilteredEntites().pop();
                }
                filters = serachfilter();
                searchBoxWidth();
                //switch (filters.length) {
                //    case 0:
                //        searchTxtBox.css("width", "90%");
                //        break;
                //    case 1:
                //        searchTxtBox.css("width", "58%");
                //        break;
                //    case 2:
                //        searchTxtBox.css("width", "28%");
                //        break;
                //}
                if (searchTxtBox.val() == '') {
                    var autocomlist = $("#auto-comp-list");
                    autocomlist.animate({ height: 0 });
                    autocomlist.parent().hide();
                }
                break;
            case 46:
                break;
        }
    }

    var updateAlarmFilterDatasource = function (events) {
        try {
            var bContext = ko.contextFor(document.getElementById(alarmFormId));
            bContext.$data.updateAlarmFilterDatasource(events.data);
            //AllAlarms();

        } catch (e) {
            console.error(e);
        }
    }

    var checkFilterTextBoxSize = function () {
        $(".alarm-search-textbox").show().focus();
        $('#searchSpan').addClass('selected-span-filter');
        if ($(".searchSpantagholder").children().length == 1) {
            $('.alarm-search-textbox').css({ "width": "58%" });
        }
        if ($(".searchSpantagholder").children().length == 2) {
            $('.alarm-search-textbox').css({ "width": "28%" });
        }
        if ($(".searchSpantagholder").children().length > 2) {
            $('.searchSpantagholder').addClass("scroll-x");
            var leftPos = $('.searchSpantagholder').scrollLeft();
            $(".searchSpantagholder").animate({ scrollLeft: leftPos + 100 }, 1);
        }
    }

    var getAlarmFilterDetails = function (filterID) {
        datacontext.getAlarmFilterDetails(filterID, function (jSONData) {
            var alEntities = _.filter(jSONData.data.Result[0].Value, function (item) {
                if (item.EntityType.indexOf('s_') <= -1) {
                    //if (item.EntityValue[item.EntityValue - 1] != 's' && item.EntityType.toLowerCase() != "time")
                    //    return item.EntityValue = item.EntityValue + "s";
                    //else
                    return item;
                }
            });
            var arrTxtFilter = _.filter(jSONData.data.Result[0].Value, function (item) {
                if (item.EntityType.indexOf('s_') > -1) {
                    item.EntityType = item.EntityType.substring(2);
                    var arrNameId = item.EntityValue != undefined && item.EntityValue != null ? item.EntityValue.split(';') : [];
                    if (arrNameId && arrNameId != null && arrNameId.length >= 2) {
                        item.EntityName = arrNameId[0];
                        item.Id = arrNameId[1];
                    }
                    return item;
                };
            });
            FilteredEntites([]);
            FilteredEntites(arrTxtFilter);
            $('.searchSpantagholder').children().remove();
            $('.search-filter-text').removeClass("alarm-search-btn-selected primary-button alarm-search-btn secondary-button");
            $('.search-filter-text').addClass("alarm-search-btn secondary-button");
            for (var i = 0 ; i < alEntities.length; i++) {
                if (alEntities[i].EntityType.toLowerCase() == "time") {
                    assignFilterTimes(null, alEntities[i].EntityValue);
                    if (alEntities[i].EntityValue.toLowerCase().trim().indexOf('time') == 0) {
                        var arrTime = alEntities[i].EntityValue.split(';');
                        if (arrTime.length > 1) {
                            $('#alarmfrmdatetimepicker').find('input').val(arrTime[1] ? new Date(arrTime[1]).format(Resources.dateformatjs + " HH:mm:ss") : '');
                            $('#alarmtodatetimepicker').find('input').val(arrTime[2] ? new Date(arrTime[2]).format(Resources.dateformatjs + " HH:mm:ss") : '');
                        }
                        alEntities[i].EntityValue = 'Time';
                    }
                    ctrl = "<span class='alarm-search-btn-selected primary-button timetab' data-EntityType='" + alEntities[i].EntityType + "' data-EntityValue='" + alEntities[i].EntityValue + "'>" + Resources[alEntities[i].EntityValue] + " <span class='remove' tabindex='-1' title='Remove'> × </span></span>";
                }
                else if (alEntities[i].EntityType.toLowerCase() == "event") {
                    var arrEntity = alEntities[i].EntityValue.split(';');
                    var eventCode = '';
                    if (arrEntity.length > 1) {
                        alEntities[i].EntityValue = arrEntity[0];
                        eventCode = arrEntity[1];
                        EventName = Resources["EventCode_" + arrEntity[1]];
                    }
                    ctrl = "<span class='alarm-search-btn-selected primary-button' data-EntityType='" + alEntities[i].EntityType + "' data-EntityValue='" + alEntities[i].EntityValue + "' data-eventcode='" + eventCode + "'>" + EventName + " <span class='remove' tabindex='-1' title='Remove'> × </span></span>";
                }
                else
                    ctrl = "<span class='alarm-search-btn-selected primary-button' data-EntityType='" + alEntities[i].EntityType + "' data-EntityValue='" + alEntities[i].EntityValue + "'>" + Resources[alEntities[i].EntityValue] + " <span class='remove' tabindex='-1' title='Remove'> × </span></span>";

                $('.searchSpantagholder').append($(ctrl));
                $('.alarm-search-textbox').css("width", "28%");
                var EntityValue = alEntities[i].EntityValue;
                var EntityType = (alEntities[i].EntityType + "tab").toLowerCase();
                $('.search-filter-text').each(function () {
                    if ($(this).parents("div").attr("id") == "timetab") {
                        $(this).removeClass("alarm-search-btn secondary-button");
                    }
                    if ($(this).parents("div").attr("id") == EntityType && ($(this).attr("id") == EntityValue || $(this).html() == EntityValue)) {
                        $(this).removeClass("alarm-search-btn secondary-button");
                        $(this).addClass("alarm-search-btn-selected primary-button");
                    }
                });
            }
            $(".alarm-search-textbox").show().focus();
            $('#searchSpan').addClass('selected-span-filter');
            searchBoxWidth();
            //checkFilterTextBoxSize();

            //$('.searchSpan > .dropdown-toggle').removeClass('searchSpantagholder');
            //$('.searchSpan > .dropdown-toggle').addClass('searchSpantagholder', 10);
            var elem = '.searchSpantagholder';
            setTimeout(function () { $(elem).css('display', 'inline-block'); }, 1000);
            $(".searchSpantagholder").animate({
                scrollLeft: 0
            }, 100);
            var txtFiltereVal = '';
            for (var i = 0; i < arrTxtFilter.length; i++) {
                if (i == 0) {
                    txtFiltereVal = arrTxtFilter[i].EntityName;
                }
                else
                    txtFiltereVal = txtFiltereVal + ',' + arrTxtFilter[i].EntityName;
            }
            $(".alarm-search-textbox").val(txtFiltereVal).show().focus();
            filterAlarms(null, [{ name: 'history', keyCode: 13 }]);

        }, function (jSONData) {
            alertify.error(jSONData.errorMessage);
        })
    }

    var ClearFilter = function () {
        FilteredEntites([]);
        $('.searchSpantagholder').children().remove();
        $(".alarm-search-textbox").val("");
        $("#alarmfrmdatetimepicker > input").val("");
        $("#alarmtodatetimepicker > input").val("");
        $('.alarm-search-textbox').css("width", "92%");
        $('.search-filter-text').removeClass("alarm-search-btn-selected primary-button alarm-search-btn secondary-button");
        $('.search-filter-text').addClass("alarm-search-btn secondary-button");
        $('.alarm-time-tab').removeClass("alarm-search-btn secondary-button");
        datacontext.showFreezeBtn(true);
    }

    var multipClips = function (data, event) {
        sessionId = common.createGUID();
        cameraid = data.CameraId;
        clipid = data.ClipId;
        playerwrapperid = data.Playerwrapperid;
        CloseVideoSession("Multi Clip");
        multipleClipSessionID(sessionId);
        multipleClipCameraID(cameraid);
        if (clipid != "")
            getclipurl(sessionId, clipid, cameraid, playerwrapperid);
        else
            getliveurl(cameraid, sessionId, playerwrapperid);
    }

    var clipSessionClose = function (cameraId, Id) {
        datacontext.sendStopCamerarequest(cameraId, Id, function (jsondata) {
            if (jsondata.Success) {
                if (jsondata.errorMessage)
                    alertify.error(jsondata.errorMessage);
                else {
                    multipleClipSessionID("");
                    multipleClipCameraID("");
                }
            }
            else {
                if (jsondata.errorMessage)
                    alertify.error(jsondata.errorMessage);
            }
        }, function (errorMessage) {
            alertify.error(errorMessage);
        });
    }

    var timeBasedFilter = function (EntityTypes, TextFilter) {
        startDate = $("#alarmfrmdatetimepicker > input").val().toDateString();
        endDate = $("#alarmtodatetimepicker > input").val().toDateString();
        var entityTypes = [];
        var textFilter = [];
        var eventTypes = [];
        $.each(EntityTypes, function (key, value) {
            if ($(value).get(0).key == 'Entities') {
                entityTypes.push($(value).get(0).value.toString().toLowerCase().substring(0, $(value).get(0).value.length - 1));
            }
            if ($(value).get(0).key == 'Event' && $(value).get(0).value.toString().toLowerCase().split(';').length > 1) {
                eventTypes.push($(value).get(0).value.toString().toLowerCase().split(';')[1]);
            }
        });

        $.each(TextFilter, function (key, value) {
            value = value.EntityType + ":" + value.Id;
            textFilter.push(value);
        });
        //JSON.stringify(textFilter).toString().replace(/[\(\)\{\}\[\]\"\']/g, '');
        datacontext.getalarmdetails(clientOffset, 0, pageRowCount, startDate, endDate, true, "New", entityTypes.toString(), textFilter.toString(), eventTypes.toString(), function (jsondata) {
            if (jsondata.Success) {
                if (!jsondata.errorMessage) {
                    window.alarmconfig.alarmViewmodel.filteredDatasource([]);
                    freezedAlarmDataSource(jsondata);
                    //filterAlarms(null, [{ name: 'timebased', keyCode: 13 }]);
                    $('#filterText').html(Resources.Custom);
                    $(".alarmCount").css('display', 'none');
                    $('#SaveSearch').show();
                    datacontext.freezeAlarm("freeze");
                }
                else
                    alertify.error(jsondata.errorMessage);
            }
            else {
                if (jsondata.errorMessage)
                    alertify.error(jsondata.errorMessage);
            }
        }, function (errorMessage) { alertify.error(errorMessage); });
    }

    var getPlayerImage = function () {
        return $('#playerImage').data('playerimage');
    }

    var updatesearchFilterEventTypeDatasource = function (data) {
        window.alarmconfig.alarmViewmodel.fillsearchFilterEventTypes(data);
    }

    var searchButtonClick = function (event) {
        var control = event;
        var EntityType = $('.search-popover').find('.active a').attr('id');
        var EntityValue = $(control).attr('id');
        var ctrl = "<span class='alarm-search-btn-selected primary-button' data-EntityType='" + EntityType + "' data-EntityValue='" + EntityValue + "' data-EventCode='" + control.id + "'>" + $(control).html() + " <span class='remove' tabindex='-1' title='Remove'> × </span></span>";
        if ($(control).parents('div').first().is(id = timetab)) {
            $('.searchSpantagholder .timetab').remove();
            $('#timetab li span').removeClass("alarm-search-btn-selected primary-button");
            var ctrl = "<span class='alarm-search-btn-selected primary-button timetab' data-EntityType='" + EntityType + "' data-EntityValue='" + EntityValue + "'>" + $(control).html() + " <span class='remove' tabindex='-1' title='Remove'> × </span></span>";
        }
        if ($('[data-EntityValue="' + EntityValue + '"][data-EntityType="' + EntityType + '"]').length > 0) {
            $(control).removeClass("alarm-search-btn-selected primary-button").addClass("secondary-button alarm-search-btn");
            $('[data-EntityValue="' + EntityValue + '"][data-EntityType="' + EntityType + '"]').remove();
            searchBoxWidth();
            return;
        }
        else {
            $('.searchSpantagholder').append($(ctrl));
            searchBoxWidth();
        }
        if ($(control).hasClass("search-filter-text")) {
            $(control).removeClass("alarm-search-btn secondary-button");
            $(control).addClass("alarm-search-btn-selected primary-button");
        }
        $(".alarm-search-textbox").show().focus();
        searchBoxWidth();
    }


    var showError = function () {
        $(".showerror").css("display", "block");
    }

    var hideError = function () {
        $(".showerror").css("display", "none");
    }

    var pageCount = function () {
        var length = _.filter(window.alarmconfig.alarmViewmodel.filteredDatasource(), function (item) {
            return item.Status() == "NEW" && item.EventType.toLowerCase() == "alarm";
        }).length;
        return length;
    }

    var CloseVideoSession = function (requestFrom) {
        if (multipleClipSessionID() != "" && multipleClipCameraID() != "") {
            console.log("Requested for close video session from " + requestFrom + ".");
            clipSessionClose(multipleClipCameraID(), multipleClipSessionID());
        }
    }

    var validateDate = function () {
        var startDate = $("#alarmfrmdatetimepicker > input").val();
        var endDate = $("#alarmtodatetimepicker > input").val();
        if (startDate != undefined && startDate != "" && endDate != undefined && endDate != "") {
            window.alarmconfig.alarmViewmodel.showDateErr(false);
            if (startDate.toDate() > endDate.toDate()) {
                //alertify.error(Resources.StartandEndDateValidationMsg);
                window.alarmconfig.alarmViewmodel.showDateErr(true);
            }
        }
    }

    function Init() {
        bindEventstoAlarmTable();
        wireUpEvent();
    }

    Init();

    var thiscontext = {
        changeView: changeView,
        showgetsopactionbyeventtype: showgetsopactionbyeventtype,
        closesopmodal: closesopmodal,
        showgetactionbyevent: showgetactionbyevent,
        showdoorpopover: showdoorpopover,
        updateAlarmDatasource: updateAlarmDatasource,
        filteresColumns: filteresColumns,
        validateForm: validateForm,
        wsAlarmDatasource: wsAlarmDatasource,
        eventSummaryDatasource: eventSummaryDatasource,
        showmovepopover: showmovepopover,
        loadEventCount: loadEventCount,
        showcamerapopover: showcamerapopover,
        serachfilter: serachfilter,
        filterAlarms: filterAlarms,
        updateAlarmFilterDatasource: updateAlarmFilterDatasource,
        getAlarmFilterDetails: getAlarmFilterDetails,
        FilteredEntites: FilteredEntites,
        ClearFilter: ClearFilter,
        multipClips: multipClips,
        updatesearchFilterEventTypeDatasource: updatesearchFilterEventTypeDatasource,
        searchButtonClick: searchButtonClick,
        showSaveFilterDialog: showSaveFilterDialog,
        closeSaveFilterDialog: closeSaveFilterDialog,
        showError: showError,
        hideError: hideError,
        Hidepopover: Hidepopover
    };
    return thiscontext;
})($, ko, window.alarmconfig.datacontext, window.alarmconfig.validationcontext, window.alarmconfig.common);

window.alarmconfig.alarmreciever = (function ($, common, uicontext, datacontext, validationContext) {
    function init() {
        var clientDate = new Date();
        var clientOffset = clientDate.getTimezoneOffset();

        datacontext.getsearchfiltereventtypes(null, function (jsondata) {
            if (jsondata.Success) {
                if (!jsondata.errorMessage)
                    uicontext.updatesearchFilterEventTypeDatasource(jsondata.data, true);
                else
                    alertify.error(jsondata.errorMessage);
            }
            else {
                if (jsondata.errorMessage)
                    alertify.error(jsondata.errorMessage);
            }
        }, function (errorMessage) {
            alertify.error(errorMessage);
        });

        datacontext.getAlarmFilters(function (jsondata) {
            if (jsondata.Success) {

                if (!jsondata.errorMessage)
                    uicontext.updateAlarmFilterDatasource(jsondata, true);
                else
                    alertify.error(jsondata.errorMessage);
            }
            else {
                if (jsondata.errorMessage)
                    alertify.error(jsondata.errorMessage);
            }
        }, function (errorMessage) { alertify.error(errorMessage); });

        datacontext.geteventslogcount(clientOffset, 'NEW', 'Alarm', null, null, function (jsondata) {
            if (jsondata.Success) {
                if (!jsondata.errorMessage) {
                    var initCount = jsondata.data;
                    uicontext.loadEventCount(initCount, initCount);
                }
                else
                    alertify.error(jsondata.errorMessage);
            }
            else {
                if (jsondata.errorMessage)
                    alertify.error(jsondata.errorMessage);
            }
        }, function (errorMessage) { alertify.error(errorMessage); });

        datacontext.getalarmdetails(clientOffset, 0, pageRowCount, null, null, true, "New", null, null, null, function (jsondata) {
            if (jsondata.Success) {
                if (!jsondata.errorMessage)
                    uicontext.updateAlarmDatasource(jsondata, true);
                else
                    alertify.error(jsondata.errorMessage);
            }
            else {
                if (jsondata.errorMessage)
                    alertify.error(jsondata.errorMessage);
            }
        }, function (errorMessage) { alertify.error(errorMessage); });

        var modalOptions = { show: true, keyboard: false, backdrop: "static" };

    }
    init();
    var thisContext = {
        init: init
    }
    return thisContext;
})($, window.alarmconfig.common, window.alarmconfig.uicontext, window.alarmconfig.datacontext, window.alarmconfig.validationcontext);

