/// <reference path="rules.common.js" />
/// <reference path="rules.datacontext.js" />
/// <reference path="rules.model.js" />
/// <reference path="rules.validation.js" />
window.ruleconfiguration.ruleSettinguibuilder = (function ($, common) {
    var ruleSettingActionContainerId = "rulesettingListAction";
    var ruleSettingContainerId = "rulesettingList";
    var ruleAdddeviceTemplateId = "RULESETTINGS_FOR_DEVICE_TEMPLATE";
    var ruleScheduleTemplateId = "SCHEDULESETTINGS_FOR_DEVICE_TEMPLATE";
    var ruleTimeConditionTemplateId = "TIMECONDITIONSETTINGS_FOR_IFTHIS_TEMPLATE";
    var ruleAddActionEmailTemplateId = "RULESETTINGS_FOR_ACTION_EMAIL_TEMPLATE";
    var ruleAddDeviceActionTemplateId = "RULESETTINGS_FOR_DEVICE_ACTIONTEMPLATE";
    var ruleUniversalEventsTemplateId = "";
    var addDeviceIndex = -1;
    var addActionIndex = -1;
    var flagRightPane = 0;

    function createGuid() {
        return 'xxxxxxyy_xxxx_4xxx_yxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    function initialize_switchoption(templateId) {
        try {
            //$(document).ready(function () {
     
                //This object
                
                var enb = $('ul [data-templateId=' + templateId + ']').find('.switch_enable');
                var dsb = $('ul [data-templateId=' + templateId + ']').find('.switch_disable');
                var input = $('ul [data-templateId=' + templateId + ']').find('.switch_val');
                
                //var obj = $(this);
                //var enb = obj.children('.switch_enable'); //cache first element, this is equal to ON
                //var dsb = obj.children('.switch_disable'); //cache first element, this is equal to OFF
                //var input = obj.children('input'); //cache the element where we must set the value
                //var input_val = obj.children('input').val(); //cache the element where we must set the value
                if (input) {
                    var v = input.val();
                    if (v == 1) {
                        $(dsb).removeClass('selected'); //remove "selected" from other elements in this object class(OFF)
                        $(enb).addClass('selected');
                    }
                    else if (v == 2) {
                        $(enb).removeClass('selected'); //remove "selected" from other elements in this object class(ON)
                        $(dsb).addClass('selected');
                    }
                }

                //Action on user's click(AND)
                enb.on('click', function () {
                    $(dsb).removeClass('selected'); //remove "selected" from other elements in this object class(OFF)
                    $(this).addClass('selected'); //add "selected" to the element which was just clicked in this object class(ON)            

                    // this is hardcoded binding since binding is not working wee need to look in to it
                    var context = ko.contextFor(input[0]);
                    context.$data.RuleCondition(1);
                    input.val(1);
                });

                //Action on user's click(OR)
                dsb.on('click', function () {
                    $(enb).removeClass('selected'); //remove "selected" from other elements in this object class(ON)
                    $(this).addClass('selected'); //add "selected" to the element which was just clicked in this object class(OFF)             
                    var context = ko.contextFor(input[0]);
                    context.$data.RuleCondition(2);
                    input.val(2);
                });

            
        } catch (e) {
            throw e;
        }
    }

    function setswitchoption() {
        try {
            //$(document).ready(function () {
            $('.switch_options').each(function () {

                //This object
                var obj = $(this);

                var enb = obj.children('.switch_enable'); //cache first element, this is equal to ON
                var dsb = obj.children('.switch_disable'); //cache first element, this is equal to OFF
                var input = obj.children('input'); //cache the element where we must set the value
                var input_val = obj.children('input').val(); //cache the element where we must set the value
                if (input) {
                    var v = input.val();
                    if (v == 1) {
                        $(dsb).removeClass('selected'); //remove "selected" from other elements in this object class(OFF)
                        $(enb).addClass('selected');
                    }
                    else if (v == 2) {
                        $(enb).removeClass('selected'); //remove "selected" from other elements in this object class(ON)
                        $(dsb).addClass('selected');
                    }
                }
            });
        } catch (e) {
            throw e;
        }
    }

    function adddevicetemplate(callback, uid) {
        try {
            addDeviceIndex = $("#" + ruleSettingContainerId).children("li").length;
            var uiTemplate = $("#" + ruleAdddeviceTemplateId).html();
            $("#" + ruleSettingContainerId).append(uiTemplate);
            var templateId = "_" + createGuid();
            var templateData = $("#" + ruleSettingContainerId).children("li")[addDeviceIndex];
            var templateBody = $(templateData).children("ul");
            $(templateBody).attr("data-templateId", templateId);
            if (callback)
                callback(templateId);
            initialize_switchoption(templateId);
        } catch (e) {
            throw e;
        }
    }
    function addScheduleTemplate(callback) {
        try {

            addDeviceIndex = $("#" + ruleSettingContainerId).children("li").length;
            var uiTemplate = $("#" + ruleScheduleTemplateId).html();
            $("#" + ruleSettingContainerId).append(uiTemplate);
            var templateId = "_" + createGuid();
            var templateData = $("#" + ruleSettingContainerId).children("li")[addDeviceIndex];
            var templateBody = $(templateData).children("ul");
            $(templateBody).attr("data-templateId", templateId);
            if (callback)
                callback(templateId);
            initialize_switchoption(templateId);
        } catch (e) {
            throw e;
        }
    }
    function addTimeConditionTemplate(callback) {
        try {

            addDeviceIndex = $("#" + ruleSettingContainerId).children("li").length;
            var uiTemplate = $("#" + ruleTimeConditionTemplateId).html();
            $("#" + ruleSettingContainerId).append(uiTemplate);
            var templateId = "_" + createGuid();
            var templateData = $("#" + ruleSettingContainerId).children("li")[addDeviceIndex];
            var templateBody = $(templateData).children("ul");
            $(templateBody).attr("data-templateId", templateId);

            $("[data-templateId='" + templateId + "']").find("input[type=number]").spinner();

            if (callback)
                callback(templateId);
            initialize_switchoption(templateId);
        } catch (e) {
            throw e;
        }
    }
    function addDeviceActionTemplate(callback, uid) {
        try {
            addDeviceIndex = $("#" + ruleSettingActionContainerId).children("li").length;
            var uiTemplate = $("#" + ruleAddDeviceActionTemplateId).html();
            $("#" + ruleSettingActionContainerId).append(uiTemplate);
            var templateId = "_" + createGuid();
            var templateData = $("#" + ruleSettingActionContainerId).children("li")[addDeviceIndex];
            var templateBody = $(templateData).children("ul");
            $(templateBody).attr("data-templateId", templateId);
            if (callback)
                callback(templateId);
        } catch (e) {
            throw e;
        }
    }
    function addActionEmailTemplate(callback, uid) {
        try {
            addActionIndex = $("#" + ruleSettingActionContainerId).children("li").length;
            var uiTemplate = $("#" + ruleAddActionEmailTemplateId).html();
            $("#" + ruleSettingActionContainerId).append(uiTemplate);
            var templateId = "_" + createGuid();
            var templateData = $("#" + ruleSettingActionContainerId).children("li")[addActionIndex];
            var templateBody = $(templateData).children("ul");
            $(templateBody).attr("data-templateId", templateId);
            if (callback)
                callback(templateId);
        } catch (e) {
            throw e;
        }
    }
    function removeCurrentDeviceTemplate(templateId) {
    }
    function removeCurrentSchedulestemplate(templateId) {

    }

    /* callback:function(tId){},cType:ConditionType IFTHIS/THANTHAT,sType:setting type(device/schedule/useraction/deviceaction)*/
    function addtemplate(cType, sType, callback) {
        try {
            if (cType == common.ruleSettingType.IFTHIS) {
                if (sType == common.ifthisOptions.DEVICE) {
                    adddevicetemplate(callback);
                }
                else if (sType == common.ifthisOptions.SCHEDULE) {
                    addScheduleTemplate(callback);
                }
                else if (sType == common.ifthisOptions.TIMEWINDOW) {
                    addTimeConditionTemplate(callback);
                }
                //initialize_switchoption();

            } else if (cType == common.ruleSettingType.THANTHAT) {
                if (sType == common.thanThatOptions.ACTIONS) {
                    addActionEmailTemplate(callback);
                }
                else if (sType == common.thanThatOptions.DEVICES) {
                    addDeviceActionTemplate(callback);
                }
            }
        } catch (e) {
        }
    }
    return {
        addtemplate: addtemplate,
        setswitchoption: setswitchoption
    };
})($, window.ruleconfiguration.common);


window.ruleconfiguration.uicontext = (function ($, ko, datacontext, validation, common, uibuilder) {
    var ruleTreeloaderInstance;
    var accountsChecked = [], currentPopover = null;
    var getloadinOptions = function (message) {
        return {
            css: {
                border: 'none',
                padding: '12px',
                backgroundColor: 'rgba(8, 137, 196, 0.60)',
                '-webkit-border-radius': '4px',
                '-moz-border-radius': '4px',
                opacity: .8,
                color: '#fff'
            },
            overlayCSS: {
                backgroundColor: "rgba(250, 250, 250, 0.66)"
            },
            message: message
        }
    }
    function onruleitemselectionchanged(ruleId) {
        console.log('ruleitem selection changed event' + ruleId);
        try {
            window.ruleconfiguration.datacontext.getruledetail(ruleId, function (jsonData) {
                var ruleDetailviewmodel = null;
                if (jsonData.Success) {
                    var base = ko.contextFor(document.getElementById("rulelistHeader"));
                    // detail
                    ruleDetailviewmodel = new datacontext.ruleDetailModel();
                    ruleDetailviewmodel.InitializeSettings(jsonData.data);
                    // Page
                    base.$data.InitializeRuleDetail(ruleDetailviewmodel);
                    //uibuilder.setswitchoption();
                }
                else {
                    ruleDetailviewmodel = new datacontext.ruleDetailModel({});
                    ruleDetailviewmodel.errorMessage("Error while fetching detail for rule");
                }
                // Rule page to view mode
                changeviewmode(true);
                //ko.applyBindings(ruleDetailviewmodel, document.getElementById("sec_viewrulecntr"));
            }, function (errorMessage) {
                console.error(errorMessage);
            });
            window.ruleconfiguration.rulelistViemodel.onSelectionChanged(ruleId);
        } catch (e) {
            console.error(e);
        }
    }
    function onaccountchecked(data) {
        if (data.ischecked) {
            accountsChecked(data.nodedata);
        }
        else {
            var findNode = _.find(accountsChecked, function (d) { return d.Id == data.nodedata.Id });
            if (findNode != null || findNode != undefined); {
                accountsChecked.pop(data.nodedata);
            }
        }
    }
    function showtreeforrules(ruleSetting, nodestoCheck, noneditables) {
        ruleTreeloaderInstance = new ruleTreeloader();
        ruleTreeloaderInstance.loadtree("ruletreeview2", ruleSetting.SelectedPosition(), nodestoCheck, noneditables);
    }
    function wireupEventsforui() {
        wireupruleListeventsforui();
        $('#ifthis_dropdown').on("change", function () {
            ConditionChange(this);
        });
        $("#actionsdropdown").on("click", function () {
            //var pageContext = ko.contextFor(document.getElementById("rulelistHeader"));
            //var base = pageContext.$root.RuleDetailModel();
            //var ifthiscreated = base.getifthissettings().length;
            //if (ifthiscreated == 0) {
            //    alertify.alert("Please select a condition");
            //    return;
            //}
            //else if (ifthiscreated > 0) {
            //    //var deviceslist = base.getifthissettings()[0].DeviceList().length;
            //    //var eventslist = base.getifthissettings()[0].EventsList().length;
            //    //if (deviceslist == 0 && eventslist == 0) {
            //    //    alertify.alert("Please select atleast one device and event");
            //    //    return;
            //    //}
            //}
            //else { return; }
        }).on("change", function () {
            ActionDropDownValueChange(this);
        });
    }
    function wireupruleListeventsforui() {
        $("#rules-toggle-show").on("click", onshowruleslist);
        $("#rules-toggle-hide").on("click", onhideruleslist);
    }
    function onshowruleslist() {
        $('.universal-rules-listContainer').css({
            'display': 'block',
            'right': '0px'
        }).animate("slow");
        getrules();
    }
    function onhideruleslist() {
        $('.universal-rules-listContainer').css({
            'display': 'none'
        });
    }
    function getrules(callback) {
        window.ruleconfiguration.datacontext.getruleslist(function (jsonData) {
            window.ruleconfiguration.rulelistViemodel.searchquery('');
            window.ruleconfiguration.rulelistViemodel.rulesDatasource($.map(jsonData.data, function (item) {
                return new datacontext.rulemodel(item);
            }));
            ko.applyBindings(window.ruleconfiguration.rulelistViemodel, document.getElementById("ruleviewContainer"));
            if (callback)
                callback(jsonData.data.length);

        }, function (errorMessage) {
            console.error(errorMessage);
        });
    }

    //moved for device tree..
    var showdevicePopover = function (event, popoverObserable) {
        hidecurrentPopover(event.currentTarget);
        var pageContext = ko.contextFor(document.getElementById("rulelistHeader"));
        var accountid = pageContext.$root.RuleDetailModel().SelectedPosition().Id;
        if (accountid) {
            var popoverParent = event.currentTarget;
            thiscontext.showdevicePopover.popoverParent = popoverParent.parentElement;
            var isPopoverShown = $(popoverParent).attr("data-ispopovershown");
            if (isPopoverShown == undefined && isPopoverShown == null) {
                $(popoverParent).attr("data-ispopovershown", true);
                var offset = $(popoverParent).offset();
                $(popoverParent.parentElement).webuiPopover({
                    title: Resources.Select_Devices,
                    html: true,
                    content: $("#ruledeviceTreetemplate").html(),
                    trigger: 'click',
                    placement: 'auto',
                    async: true,
                    cache: false
                    //placement: 'right'
                    //placement: window.ruleconfiguration.ruleSettinguibuilder.getPlacementFunction(trigger.attr("data-placement"), 283, 117)
                }).on('shown.webui.popover', showdevicePopover.ondevicepopovershown).on("hide.webui.popover", showdevicePopover.ondevicepopoverhide);
                //$(popoverParent).webuiPopover('show');
            }
            else if (isPopoverShown.toString() == "false") {
                $(popoverParent).attr("data-ispopovershown", true);
                $(popoverParent).webuiPopover('show');
            }
        }
        else {
            alertify.alert(Resources.Rule_PositionDevices);
            return;
        }
    }
    showdevicePopover.ondevicepopovershown = function (event) {
        currentPopover = thiscontext.showdevicePopover.popoverParent;
        var settingContext = ko.contextFor(event.currentTarget);
        var pageContext = ko.contextFor(document.getElementById("rulelistHeader"));
        var noneditables = ["Site"];
        if (settingContext.$data.TypeId == common.ruleSettingType.THANTHAT) {
            noneditables = ["Site", "PANEL", "RECORDER"];           
            flagRightPane = 1;
            if (flagRightPane) {
                $('#ruletreeview2').addClass('rightDeviceTree');
            }            
        }
            

        showtreeforrules(pageContext.$root.RuleDetailModel(), $.map(settingContext.$data.RuleAction().ActionNames(), function (item) { return item.Id }), noneditables);
        $("#deviceconfirmbtn").on("click", showdevicePopover.ondeviceConfirmclick);
        $("#devicecancelbtn").on("click", showdevicePopover.ondeviceCancelClick);
    }
    showdevicePopover.ondevicepopoverhide = function (event) {
        currentPopover = null;
    }
    showdevicePopover.ondeviceConfirmclick = function (event) {
        var checkedItems = ruleTreeloaderInstance.getallcheckeditems();
        var prevNodeIds = ruleTreeloaderInstance.getpreviousnodeids();
        var prevSelectedActions = [];
        var settingsContext = ko.contextFor(thiscontext.showdevicePopover.popoverParent);
        var action;
        for (var i = 0; i < prevNodeIds.length; i++) {
            action = ko.utils.arrayFirst(settingsContext.$data.RuleAction().ActionNames(), function (item) { return item.Id == prevNodeIds[i] });
            prevSelectedActions.push(action);
        }
        if ((checkedItems && checkedItems.length > 0) || (prevSelectedActions.length > 0)) {
            var customer = _.findWhere(checkedItems, { nodetype: "CUSTOMER" });
            var site = _.findWhere(checkedItems, { nodetype: "SITE" });
            var group = _.findWhere(checkedItems, { nodetype: "GROUP" });
            var dealer = _.findWhere(checkedItems, { nodetype: "DEALER" });
            var inputpanelnode = _.findWhere(checkedItems, { nodetype: "PANEL_INPUT_NODE" });
            var outputpanelnode = _.findWhere(checkedItems, { nodetype: "PANEL_OUTPUT_NODE" });
            var doorinputnode = _.findWhere(checkedItems, { nodetype: "INPUT_NODE" });
            var dooroutputnode = _.findWhere(checkedItems, { nodetype: "OUTPUT_NODE" });

            if (customer || site || group || dealer) {
                alertify.alert(Resources.Rule_SelectDevices);
                return;
            }
            else if ((inputpanelnode && checkedItems.length == 1) || (inputpanelnode && outputpanelnode && checkedItems.length == 2)) {
                alertify.alert(Resources.Rule_1InputPointInputNode);
                return;
            }
            else if (outputpanelnode && checkedItems.length == 1) {
                alertify.alert(Resources.Rule_1OutputPointPanelOutputNode);
                return;
            }
            else if ((doorinputnode && checkedItems.length == 1) || (doorinputnode && dooroutputnode && checkedItems.length == 2)) {
                alertify.alert(Resources.Rule_1InputPointDoorInputNode);
                return;
            }
            else if (dooroutputnode && checkedItems.length == 1) {
                alertify.alert(Resources.Rule_1OutputPointDoorOutputNode);
                return;
            }
            else {
                var context = ko.contextFor(thiscontext.showdevicePopover.popoverParent);
                var finalItems = ko.utils.arrayFilter(checkedItems, function (item) {
                    return item.nodetype != "PANEL_INPUT_NODE" && item.nodetype != "PANEL_OUTPUT_NODE" && item.nodetype != "INPUT_NODE" && item.nodetype != "OUTPUT_NODE";
                })
                var allItems = finalItems.concat(prevSelectedActions);
                context.$data.buildactionNames(allItems);
                $(thiscontext.showdevicePopover.popoverParent).webuiPopover("hide");
            }
        }
        else {
            alertify.alert(Resources.Rule_AtleastOneDevice);
            return;
        }
    }
    showdevicePopover.ondeviceCancelClick = function (event) {
        $(thiscontext.showdevicePopover.popoverParent).webuiPopover("hide");
    }

    var showShedulePopover = function (event) {
        hidecurrentPopover(event.currentTarget);
        var context = ko.contextFor(event.currentTarget);
        var popoverParent = event.currentTarget;
        thiscontext.showShedulePopover.popoverParent = popoverParent.parentElement;
        var isPopoverShown = $(popoverParent).attr("data-ispopovershown");
        if (isPopoverShown == undefined && isPopoverShown == null) {
            $(popoverParent).attr("data-ispopovershown", true);
            $(popoverParent.parentElement).webuiPopover({
                title: Resources.RULE_OPTION_SCHEDULES,
                html: true,
                content: $("#SCHEDULESSEETINGS_FOR_DIVICES").html(),
                trigger: 'click',
                placement: 'auto',
                cache: false
            }).on('shown.webui.popover', function (event) {
                showShedulePopover.onschedulepopoverShown(event);
            }).on("hide.webui.popover", function (event) {
                showShedulePopover.onschedulepopoverhide(event);
            });

            //$(popoverParent).webuiPopover('show');
            //$(popoverParent).on('shown.webui.popover', function (event) {
            //    showShedulePopover.onschedulepopoverShown(event);
            //}).on("hide.webui.popover", function (event) {
            //    showShedulePopover.onschedulepopoverhide(event);
            //});
        }

    }
    showShedulePopover.onschedulepopoverShown = function (event) {
        try {
            var pageContext = ko.contextFor(document.getElementById("rulelistHeader"));
            //var accountid = pageContext.$root.SelectedSite().ParentId;
            var accountid = pageContext.$root.RuleDetailModel().SelectedPosition().ParentId;
            var baseContext = ko.contextFor($(thiscontext.showShedulePopover.popoverParent)[0]);
            getandbindSchedules(baseContext.$data, accountid);
            $("#schedulesconfirmButton").on("click", showShedulePopover.onconfirmClick);
            $("#schedulescanelButton").on("click", showShedulePopover.oncancelClick);

        } catch (e) {
            console.error(e);
        }
    };
    showShedulePopover.onschedulepopoverhide = function (event) {
    };
    showShedulePopover.onconfirmClick = function (event) {
        try {
            if (getAndUpdateActionNamesFrom(thiscontext.showShedulePopover.popoverParent, window.ruleconfiguration.scheduleListViewmodel.scheduleSource()))
                $(thiscontext.showShedulePopover.popoverParent).webuiPopover("hide");
            else
                alertify.alert(Resources.Rule_SchduleFromList);

        } catch (e) {
            console.error(e);
        }
    }
    showShedulePopover.oncancelClick = function (event) {
        $(thiscontext.showShedulePopover.popoverParent).webuiPopover("hide");
    }

    var showEventPopover = function (event, popoverObserable) {
        hidecurrentPopover(event.currentTarget);
        var context = ko.contextFor(event.currentTarget);
        if (context.$data.RuleAction().ActionNames().length <= 0) {
            alertify.alert(Resources.Rule_AtleastSingleDevice);
            return;
        }
        var popoverParent = event.currentTarget;
        thiscontext.showEventPopover.popoverParent = popoverParent.parentElement;
        var isPopoverShown = $(popoverParent).attr("data-ispopovershown");
        if (isPopoverShown == undefined && isPopoverShown == null) {
            $(popoverParent).attr("data-ispopovershown", true);
            $(popoverParent.parentElement).webuiPopover({
                title: Resources.RULE_OPTION_SELECTEVENTS,
                html: true,
                content: $("#EVENTLISTSEETINGS_FOR_DIVICES").html(),
                trigger: 'click',
                placement: 'auto',
                cache: false
            }).on('shown.webui.popover', function (event) {
                thiscontext.showEventPopover.onshoweventpopover(event);
            }).on("hide.webui.popover", function (event) {
                thiscontext.showEventPopover.oneventpopoverhide(event);
            });
            //$(popoverParent).on('shown.webui.popover', thiscontext.showEventPopover.onshoweventpopover).on("hide.webui.popover", thiscontext.showEventPopover.oneventpopoverhide);
            //$(popoverParent).webuiPopover('show');
        }
        else if (isPopoverShown.toString() == "false") {
            $(popoverParent).webuiPopover('show');
        }
    }
    showEventPopover.oneventpopoverhide = function (event) {
        //currentPopover = null;
    }
    showEventPopover.onshoweventpopover = function (event) {
        currentPopover = thiscontext.showEventPopover.popoverParent;
        thiscontext.getandbindevents(thiscontext.showEventPopover.popoverParent);
        $("#eventconfirmButton").on('click', thiscontext.showEventPopover.confirmclick);
        $("#eventcanelButton").on('click', thiscontext.showEventPopover.cancelclick);
    }
    showEventPopover.confirmclick = function (event) {
        var context = ko.contextFor(thiscontext.showEventPopover.popoverParent);
        var sEvents = _.filter(window.ruleconfiguration.eventlistViewmodel.eventDatasource(), function (bm) {
            return bm.IsSelected();
        });
        if (sEvents && sEvents.length > 0) {
            context.$data.buildactionParams(sEvents);
            $(thiscontext.showEventPopover.popoverParent).webuiPopover('hide');
        }
        else {
            alertify.alert(Resources.Rule_AtleastOneEvent);
            return;
        }
    }
    showEventPopover.cancelclick = function (event) {
        $(thiscontext.showEventPopover.popoverParent).webuiPopover('hide');
    }

    function getandbindevents(element) {
        try {
            var context = ko.contextFor(element);
            var entityTypes = $.map(context.$data.RuleAction().ActionNames(), function (item) { return item.EntityType });
            window.ruleconfiguration.datacontext.getevents(entityTypes, function (jsonResult) {
                if (jsonResult.Success) {
                    window.ruleconfiguration.eventlistViewmodel.eventDatasource(jsonResult.data.map(function (item) {
                        var entModel = new datacontext.ruleBasemodel(item);
                        var result = _.findWhere(context.$data.RuleAction().ActionParameters(), { Id: item.Id });
                        if (result) {
                            entModel.IsSelected(true);
                        }
                        return entModel;
                    }));
                    ko.applyBindings(window.ruleconfiguration.eventlistViewmodel, document.getElementById("EVENTLIST_FOR_DIVICES"));
                }
            }, function (errorMessage) {
                console.log("error for getting events");
            });
        } catch (e) {
            console.error(e);
        }
    }
    function getandbindemails(rsContext, accountId) {
        //window.ruleconfiguration.datacontext.getusers(accountId, function (jsonResult) {
        //    if (jsonResult.Success) {
        //        window.ruleconfiguration.userslistViewmodel.usersDataSource(jsonResult.data.map(function (item) {
        //            var usrModel = new datacontext.ruleBasemodel({ Id: item.Id, Name: item.UserName });
        //            var context = ko.contextFor(element);
        //            var result = _.findWhere(context.$data.RuleAction().ActionParameters(), { Id: item.Id });
        //            if (!result) {
        //                usrModel.IsSelected(true);
        //            }
        //            return usrModel;
        //        }));
        //        ko.applyBindings(window.ruleconfiguration.userslistViewmodel, document.getElementById("EMAILLIST_FOR_ACTION"));
        //    }
        //}, function (errorMessage) {
        //    console.log("error for getting users");
        //});
        window.ruleconfiguration.userslistViewmodel.initialize(rsContext, accountId);
        ko.applyBindings(window.ruleconfiguration.userslistViewmodel, document.getElementById("EMAILLIST_FOR_ACTION"));
    }
    function getandbindSchedules(rsContext, acctionId) {
        try {
            window.ruleconfiguration.scheduleListViewmodel.initialize(rsContext,acctionId);
            ko.applyBindings(window.ruleconfiguration.scheduleListViewmodel, document.getElementById("SCHEDULETLIST_FOR_DIVICES"));
        } catch (e) {
            console.error(e);
        }
    }
    function getandBindOperations(rsContext) {
        try {
            window.ruleconfiguration.operationListViewmodel.initialize(rsContext);
            ko.applyBindings(window.ruleconfiguration.operationListViewmodel, document.getElementById("DEVICEOPERATION_FOR_ACTION"));
        } catch (e) {
            console.error(e);
        }
    }
    function getandBindUserActions(rsContext,accountId) {
        try {
            window.ruleconfiguration.useractionViewmodel.initialize(rsContext,accountId);
            ko.cleanNode(document.getElementById("ACTIONLIST_FOR_ACTION"));
            ko.applyBindings(window.ruleconfiguration.useractionViewmodel, document.getElementById("ACTIONLIST_FOR_ACTION"));
        } catch (e) {
            console.error(e);
        }
    }

    var showActionNamePopover = function (event, popoverObservable) {
        hidecurrentPopover(event.currentTarget);
        var acContext = ko.contextFor(event.currentTarget);
        var popoverParent = event.currentTarget;
        thiscontext.showActionNamePopover.popoverParent = popoverParent.parentElement;
        var isPopoverShown = $(popoverParent).attr("data-ispopovershown");
        if (isPopoverShown == undefined && isPopoverShown == null) {
            $(popoverParent).attr("data-ispopovershown", true);
            $(popoverParent.parentElement).webuiPopover({
                title: Resources.Select_Actions,
                html: true,
                content: $("#ACTIONLISTSETTINGS_FOR_ACTION").html(),
                trigger: 'click',
                placement: 'auto',
                cache: false,
                async: true
            }).on('shown.webui.popover', function (event) {
                showActionNamePopover.onshownActionPopover(event);
            }).on("hide.webui.popover", function (event) {
                showActionNamePopover.onhideActionPopover(event);
            });

            /*$(popoverParent).on('shown.webui.popover', function (event) {
                showActionNamePopover.onshownActionPopover(event);
            }).on("hide.webui.popover", function (event) {
                showActionNamePopover.onhideActionPopover(event);
            });
            $(popoverParent).webuiPopover('show');*/
        }
        else if (isPopoverShown.toString() == "false") {
            $(popoverParent).webuiPopover('show');
        }
    }
    showActionNamePopover.onshownActionPopover = function (event) {
        currentPopover = thiscontext.showActionNamePopover.popoverParent;
        var pageContext = ko.contextFor(document.getElementById("rulelistHeader"));
        var baseContext = ko.contextFor($(thiscontext.showActionNamePopover.popoverParent)[0]);
        getandBindUserActions(baseContext.$data, pageContext.$root.RuleDetailModel().SelectedPosition().Id);
        $("#actionconfirmButton").on('click', showActionNamePopover.confirmclick);
        $("#actioncanelButton").on('click', showActionNamePopover.cancelclick);
    }
    showActionNamePopover.onhideActionPopover = function (event) {
        //currentPopover = null;
    }
    showActionNamePopover.confirmclick = function (event) {
        if (getAndUpdateActionNamesFrom(thiscontext.showActionNamePopover.popoverParent, window.ruleconfiguration.useractionViewmodel.userActionSource()))
            $(thiscontext.showActionNamePopover.popoverParent).webuiPopover("hide");
        else
            alertify.alert(Resources.Rule_SelectAnAction);
    }
    showActionNamePopover.cancelclick = function (event) {
        $(thiscontext.showActionNamePopover.popoverParent).webuiPopover("hide");
    }

    var showEmailPopover = function (event, popoverObserable) {
        hidecurrentPopover(event.currentTarget);
        var pageContext = ko.contextFor(document.getElementById("rulelistHeader"));
        //var accountid = pageContext.$root.SelectedSite().Id;
        var accountid = pageContext.$root.RuleDetailModel().SelectedPosition().Id;
        //var actionnamesselected = pageContext.$root.RuleDetailModel().GetThanThatRule().RuleActions()[0].ActionNames().length;
        var actionnamesselected = pageContext.$root.RuleDetailModel().getthenthatsettings()[0].RuleAction().getactionnames().length;

        if (accountid) {
            if (actionnamesselected > 0) {
                var popoverParent = event.currentTarget;
                thiscontext.showEmailPopover.popoverParent = popoverParent.parentElement;
                var isPopoverShown = $(popoverParent).attr("data-ispopovershown");
                if (isPopoverShown == undefined && isPopoverShown == null) {
                    $(popoverParent).attr("data-ispopovershown", true);
                    $(popoverParent.parentElement).webuiPopover({
                        title: "Select Emails",
                        html: true,
                        content: $("#EMAILLISTSETTINGS_FOR_ACTION").html(),
                        trigger: 'click',
                        placement: 'auto',
                        cache: false,
                        async: true
                    }).on('shown.webui.popover', function (event) {
                        thiscontext.showEmailPopover.onshowemailpopover(event);
                    }).on("hide.webui.popover", function (event) {
                        thiscontext.showEmailPopover.onemailpopoverhide(event);
                    });
                    /*$(popoverParent).on('shown.webui.popover', function (event) {
                        thiscontext.showEmailPopover.onshowemailpopover(event);
                    }).on("hide.webui.popover", function (event) {
                        thiscontext.showEmailPopover.onemailpopoverhide(event);
                    });
                    $(popoverParent).webuiPopover('show');*/
                }
                else if (isPopoverShown.toString() == "false") {
                    $(popoverParent).webuiPopover('show');
                }
            }
            else {
                alertify.alert(Resources.Rule_FirstSelectActionName);
                return;
            }
        }
        else {
            alertify.alert(Resources.Rule_PositionUserInformation);
            return;
        }
    }
    showEmailPopover.onemailpopoverhide = function (event) {
        //currentPopover = null;
    }
    showEmailPopover.onshowemailpopover = function (event) {
        currentPopover = thiscontext.showEmailPopover.popoverParent;
        var pageContext = ko.contextFor(document.getElementById("rulelistHeader"));
        //var accountid = pageContext.$root.RuleDetailModel().SelectedPosition().ParentId;
        var accountid = pageContext.$root.RuleDetailModel().SelectedPosition().Id;
        var rsContext = ko.contextFor(thiscontext.showEmailPopover.popoverParent);
        getandbindemails(rsContext.$data, accountid);
        $("#actionemailconfirmButton").on('click', thiscontext.showEmailPopover.confirmclick);
        $("#actionemailcanelButton").on('click', thiscontext.showEmailPopover.cancelclick);
    }
    showEmailPopover.confirmclick = function (event) {
        var actionContext = ko.contextFor(thiscontext.showEmailPopover.popoverParent);
        var sUsers = _.filter(window.ruleconfiguration.userslistViewmodel.usersDataSource(), function (bm) {
            return bm.IsSelected();
        });
        if (sUsers.length > 0) {
            actionContext.$data.buildactionParams(sUsers);
            $(thiscontext.showEmailPopover.popoverParent).webuiPopover('hide');
        }
        else {
            alertify.alert(Resources.Rule_AtleastOneUser);
            return;
        }
    }
    showEmailPopover.cancelclick = function (event) {
        $(thiscontext.showEmailPopover.popoverParent).webuiPopover('hide');
    }

    var showOperationPopover = function (event) {
        try {
            hidecurrentPopover(event.currentTarget);
            var popoverParent = event.currentTarget;
            thiscontext.showOperationPopover.popoverParent = popoverParent.parentElement;
            var isPopoverShown = $(popoverParent).attr("data-ispopovershown");
            if (isPopoverShown == undefined && isPopoverShown == null) {
                $(popoverParent).attr("data-ispopovershown", true);
                var offset = $(popoverParent).offset();
                $(popoverParent.parentElement).webuiPopover({
                    title: Resources.Select_Devices,
                    html: true,
                    content: $("#DEVICEOPERATIONSETTING_FOR_ACTION").html(),
                    trigger: 'click',
                    placement: 'auto',
                    cache: false,
                    async: true
                }).on('shown.webui.popover', function (event) {
                    showOperationPopover.onpopoverShown(event);
                }).on("hide.webui.popover", function (event) {
                    showOperationPopover.onpopoverHide(event);
                });
                //$(popoverParent).webuiPopover('show');
            }
            else if (isPopoverShown.toString() == "false") {
                $(popoverParent).attr("data-ispopovershown", true);
                $(popoverParent).webuiPopover('show');
            }
        } catch (e) {
            console.error(e);
        }
    }
    showOperationPopover.onpopoverHide = function (event) {
    }
    showOperationPopover.onpopoverShown = function (event) {
        try {
            var baseContext = ko.contextFor($(thiscontext.showOperationPopover.popoverParent)[0]);
            getandBindOperations(baseContext.$data)//.$data.RuleAction().ActionNames());
            $("#actionoperationconfirmButton").on("click", showOperationPopover.onConfirmClick);
            $("#actionoperationcanelButton").on("click", showOperationPopover.onCancelClick);
        } catch (e) {

        }
    }
    showOperationPopover.onConfirmClick = function (event) {
        try {
            var actionContext = ko.contextFor(thiscontext.showOperationPopover.popoverParent);
            var sOperations = _.filter(window.ruleconfiguration.operationListViewmodel.operationSource(), function (bm) {
                return bm.IsSelected();
            });
            if (sOperations.length > 0) {
                actionContext.$data.buildactionParams(sOperations);
                $(thiscontext.showOperationPopover.popoverParent).webuiPopover('hide');
            }
            else {
                alertify.alert(Resources.Rule_AtleastOneOperation);
                return;
            }
        } catch (e) {
            console.error(e);
        }
    }
    showOperationPopover.onCancelClick = function (event) {
        $(thiscontext.showOperationPopover.popoverParent).webuiPopover('hide');
    }

    function showpopover(ruleType, OperandEntityType, controlType, e, data) {
        try {
            if (ruleType == common.ruleSettingType.IFTHIS) {
                if (OperandEntityType == common.ifthisOptions.DEVICE) {
                    if (controlType == 1) {
                        showdevicePopover(e, data);
                    }
                    else if (controlType == 2) {
                        showEventPopover(e, data)
                    }
                }
                if (OperandEntityType == common.ifthisOptions.SCHEDULE) {
                    if (controlType == 1) {
                        showShedulePopover(e);
                    }
                }
            }
            if (ruleType == common.ruleSettingType.THANTHAT) {
                if (OperandEntityType == common.thanThatOptions.ACTIONS) {
                    if (controlType == 1) {
                        showActionNamePopover(e);
                    }
                    else if (controlType == 2) {
                        showEmailPopover(e, data);
                    }
                }
                if (OperandEntityType == common.thanThatOptions.DEVICES) {
                    if (controlType == 1) {
                        showdevicePopover(e, data);
                    }
                    else if (controlType == 2) {
                        showOperationPopover(e);
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
    function getAndUpdateActionNamesFrom(el, vm) {
        try {
            var context = ko.contextFor(el);
            var sNames = _.filter(vm, function (bm) {
                return bm.IsSelected();
            });
            if (sNames && sNames.length > 0) {
                context.$data.buildactionNames(sNames);
                $(thiscontext.showShedulePopover.popoverParent).webuiPopover("hide");
                return sNames;
            } else {
                return undefined;
                // alertify.alert("Please select an action");
            }
        } catch (e) {
            throw e;
        }
    }
    function hidecurrentPopover(currenttarget) {

        console.log("hiding current popover");
        if ($('.webui-popover').length > 0)
            $('.webui-popover').not(this).remove();
    }
    function ConditionChange(ele) {
        var selectconditionvalue = $(ele).val();
        //if (checkPreviousRuleCondition(selectconditionvalue))
        addRuleSetting(undefined, selectconditionvalue, common.ruleSettingType.IFTHIS);
        resetselection($(ele));
    }
    function checkPreviousRuleCondition(selectconditionvalue) {
        if (selectconditionvalue == common.ifthisOptions.DEVICE) {
            var pageContext = ko.contextFor(document.getElementById("rulelistHeader"));
            var detailModel = pageContext.$root.RuleDetailModel();
            var getifthisCnt = detailModel.getifthissettings().length;
            if (getifthisCnt > 0) {
                var lastifthissetting = detailModel.getifthissettings()[getifthisCnt - 1];
                if (lastifthissetting.OperandEntityType == common.ifthisOptions.DEVICE && lastifthissetting.RuleCondition() == 1) {
                    alertify.alert(common.messages.RULE_IFTHIS_AND_CONDITION_NOTSUPPORTED);
                    return false;
                }
            }
        }
        return true;
    }
    function ActionDropDownValueChange(ele) {
        try {
            var selectcondition = $(ele).val();
            addRuleSetting(null, selectcondition, common.ruleSettingType.THANTHAT);
            resetselection($(ele));
        } catch (e) {
            console.error(e);
        }
    }
    function resetselection($selectUi) {
        $selectUi.prop('selectedIndex', 0);
    }
    function addRuleSetting(rsModel, rsType, typeId) {
        try {
            var pageContext = ko.contextFor(document.getElementById("rulelistHeader"));
            var detailModel = pageContext.$root.RuleDetailModel();
            var rsmodel = rsModel;
            if (rsmodel) {
                rsmodel.OperandEntityType = rsType
                rsmodel.TypeId = typeId;
            }
            else {
                rsmodel = new window.ruleconfiguration.datacontext.rulesettingsmodel();
                rsmodel.TypeId = typeId;
                rsmodel.OperandEntityType = rsType;
            }
            detailModel.addruleSettings(rsmodel);
        } catch (e) {
            throw e;
        }
    }
    function addrulSeetingtemplate(rsmodel) {
        try {
            uibuilder.addtemplate(rsmodel.TypeId, rsmodel.OperandEntityType, function (tId) {
                rsmodel.initialize(tId);
                bindToRuleTeamplte(tId, rsmodel);
            });
        } catch (e) {
            console.error(e);
        }
    }
    function InitializeCreateNewRule(baseContext) {
        try {
            // detail
            var ruleDetailviewmodel = new datacontext.ruleDetailModel();
            ruleDetailviewmodel.InitializeSettings();
            // Page
            var base = ko.contextFor($("#ruleconfigContainer")[0]);
            base.$data.InitializeRuleDetail(ruleDetailviewmodel);
            changeviewmode(false);
            onhideruleslist();
        } catch (e) {
            console.error(e);
        }
    }
    function bindToRuleTeamplte(templateId, rsModel) {
        try {
            var el = $("[data-templateId='" + templateId + "']");
            ko.applyBindings(rsModel, el[0]);
        } catch (e) {
            throw e;
        }
    }
    function initialize() {
        wireupEventsforui();        
    }
    function changeviewmode(isViewmode) {
        var context = ko.contextFor($("#ruleconfigContainer")[0]);
        context.$data.IsViewMode(isViewmode);
    }
    function bindrulepageheader() {
        var rulPagevm = new datacontext.rulePageViewmodel();
        ko.applyBindings(rulPagevm, document.getElementById("ruleconfigContainer"));
    }
    function addnewrule(data, callback) {
        try {
            var pageContext = ko.contextFor(document.getElementById("rulelistHeader"));
            var base = pageContext.$root.RuleDetailModel();
            blockUI();
            datacontext.addnewrule(data, function (jsResult) {
                alertify.success(data.Name() + Resources.Rule_AddedSuccessfully);
                if (callback)
                    callback(jsResult.data);
                onruleitemselectionchanged(jsResult.data.Id);
                // changeviewmode(true);
                unblockUI();
                //InitializeCreateNewRule();
            }, function (jsResult) {
                //MAX_SIZE_LIMIT_EXCEEDED = 38
                if (jsResult.errorCode == 38) {
                    showRuleLimitDialog();
                }
                else
                    alertify.error(jsResult.errorMessage);
                unblockUI();
                //InitializeCreateNewRule();
            });

        } catch (e) {
            throw e;
        }
    }
    function showRuleLimitDialog() {
        var currentDialog = $("#ruleLimitDialog");
        currentDialog.modal(common.modalOptions);
    }

    initialize();
    var thiscontext = {
        showpopover: showpopover,
        showOperationPopover: showOperationPopover,
        InitializeCreateNewRule: InitializeCreateNewRule,
        showEventPopover: showEventPopover,
        showEmailPopover: showEmailPopover,
        changeviewmode: changeviewmode,
        showActionNamePopover: showActionNamePopover,
        onruleitemselectionchanged: onruleitemselectionchanged,
        onaccountchecked: onaccountchecked,
        showtreeforrules: showtreeforrules,
        getandbindevents: getandbindevents,
        getandbindemails: getandbindemails,
        bindrulepageheader: bindrulepageheader,
        showdevicePopover: showdevicePopover,
        addnewrule: addnewrule,
        addrulSeetingtemplate: addrulSeetingtemplate,
        getrules: getrules,
        showShedulePopover: showShedulePopover,
        hidecurrentPopover: hidecurrentPopover
    };
    return thiscontext;
})($, ko, window.ruleconfiguration.datacontext, window.ruleconfiguration.validationcontext, window.ruleconfiguration.common, window.ruleconfiguration.ruleSettinguibuilder);

function ruleTreeloader() {
    this.treeviewInstace = null;
}
ruleTreeloader.prototype.getallcheckeditems = function () {
    if (this.treeviewInstace) {
        return this.treeviewInstace.GetCheckedItems();
    }
    console.error("Error on getting all checkeditems");
    return null;
}

ruleTreeloader.prototype.getpreviousnodeids = function () {
    if (this.treeviewInstace) {
        return this.treeviewInstace.GetPreviousNodeIds();
    }
    console.error("Error on getting all previous nodes");
    return null;
}

ruleTreeloader.prototype.loadtree = function (uielementid, selectedSite, nodestoCheck, noneditables) {
    var $uiTreeviewEle = $("#" + uielementid);
    var serviceModel = new ServiceModel();
    var treeInstance = null;
    //
    //var url = window.ruleconfiguration.common.getruletreeviewurl(id, nodetype);
    //url = url + "?Id="+id;
    //console.log(url);

    //serviceModel.serviceurl(window.ruleconfiguration.common.getruletreeviewurl());
    //using RuleConfigController GetAccounts function so that we can modify according to RULES requirements
    serviceModel.serviceurl(window.ruleconfiguration.common.getactionpath("getaccounts"));
    serviceModel.schema.idfield = "Id";
    serviceModel.schema.dataTextFeild = "Name";
    serviceModel.schema.dataSpriteIcon = "EntityType";
    serviceModel.schema.uniqueId = "Id";
    serviceModel.schema.children = "Children";
    serviceModel.schema.filterfield = "Id";
    serviceModel.events.itemselected = "";
    serviceModel.events.itemsloaded = "";
    serviceModel.events.itemupdated = "";
    serviceModel.camerastatusurl($("#ruleconfigContainer").attr("data-url"));
    serviceModel.schema.statusqueryidfield = "StatusQueryId";
    if ($uiTreeviewEle !== undefined) {
        this.treeviewInstace = $uiTreeviewEle.treeview({ "servicemodel": serviceModel, mode: "101", selectionmode: "single", selectednodes: nodestoCheck, noneditabletypes:noneditables,theme: "black" });
        treeInstance = this.treeviewInstace;
    }
    this.treeviewInstace.EnableCheckbox(true);
    this.treeviewInstace.onNodeChecked = function (data) {
    }
    window.ruleconfiguration.datacontext.getdevicesfor(selectedSite.Id, function (jsonResult) {
        treeInstance.LoadDataSource(jsonResult);
        treeInstance.cachePreviousNodeIds(nodestoCheck);
        treeInstance.CheckthisNodes(nodestoCheck);
    }, function (error) { })
}
var ruleSettingsUrils = (function () {

    var globalUtil = function () {
        this.treeloaderInstance = null;

    }
    function createInstance() {
        try {
            var tvConfig = new globalUtil();
            return tvConfig;
        } catch (e) {
        }
    }
    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };

});

/// Position tree view ////////
window.ruleconfiguration.posuicontext = (function ($, ko, datacontext, validation) {
    var positionTreeloaderInstance;
    var positionPopover = null;
    var posaccountsChecked = [];
    var positionChecked = [];
    var prevPosition = null;
    function onaccountchecked(data) {
        if (data.ischecked) {
            posaccountsChecked(data.nodedata);
        }
        else {
            var findNode = _.find(posaccountsChecked, function (d) { return d.Id == data.nodedata.Id });
            if (findNode != null || findNode != undefined); {
                posaccountsChecked.pop(data.nodedata);
            }
        }
    }
    function showtreeforposition() {
        var pageContext = ko.contextFor(document.getElementById("rulelistHeader"));
        positionTreeloaderInstance = new positionTreeloader();
        if (pageContext.$data.RuleDetailModel().SelectedPosition().Id) {
            positionTreeloaderInstance.loadtree("positiontreeview", pageContext.$data.RuleDetailModel().SelectedPosition().Id);
        }
        else {
            prevPosition = null;
            positionTreeloaderInstance.loadtree("positiontreeview", null);
        }
        $("#positionconfirmbtn").on("click", onpositionConfirmclick);
        $("#positioncancelbtn").on("click", onpositionCancelClick);
    }
    function onpositionPopoverbuttonClicked(event, popoverObservable) {
        window.ruleconfiguration.uicontext.hidecurrentPopover(event.currentTarget);
        positionPopover = event.currentTarget;
        var isPopoverShown = $(positionPopover).attr("data-ispopovershown");
        if (isPopoverShown == undefined && isPopoverShown == null) {
            $(positionPopover).attr("data-ispopovershown", true);
            var templateContent = $("#positionTreetemplate").html();
            $(positionPopover.parentElement).webuiPopover({
                title: Resources.Select_Position,
                html: true,
                content: templateContent,
                placement: 'auto',
                trigger: 'click',
                async: true,
                cache: false
            }).on('shown.webui.popover', function (e) {
                showtreeforposition(e);
            })/*.on('hide.webui.popover', function (e) {
                hidePositionPopover(e);
            });*/
            //$(positionPopover).webuiPopover('show');
        } else if (isPopoverShown.toString() == "false") {
            $(positionPopover).webuiPopover('show');
        }
    }
    function onpositionConfirmclick(event) {
        var rulePageContext = ko.contextFor(document.getElementById("rulelistHeader"));
        var checkedItems = positionTreeloaderInstance.getallcheckeditems();
        var siteNodes = _.filter(checkedItems, function (item) {
            return item.nodetype.toUpperCase() == "SITE";
        });

        var nodeData = { checkedItem: siteNodes[0] };
        if (siteNodes && siteNodes.length > 0) {
            if (siteNodes[0].nodetype.toUpperCase() != "SITE") {
                alertify.alert(Resources.Rule_NodeSite);
                return;
            }
            else if (siteNodes.length > 1) {
                alertify.alert(Resources.Rule_SingleNodeOfTypeSite);
                return;
            }
            else {
                var currPosition = nodeData.checkedItem.nodedata.Id;
                if (prevPosition != null && prevPosition != currPosition) {

                    alertify.confirm(window.ruleconfiguration.common.messages.Rule_Position_Change_Alert, function (e) {
                        if (e) {
                            var ruleName = rulePageContext.$data.RuleDetailModel().Name();
                            rulePageContext.$data.RuleDetailModel().cleanModel();
                            rulePageContext.$data.RuleDetailModel().Name(ruleName);
                            var nodeData = { checkedItem: siteNodes[0] };
                            rulePageContext.$root.captureselectedItems(nodeData);
                            prevPosition = currPosition;
                        }
                        else {
                            return;
                        }
                    });
                }
                else {
                    rulePageContext.$root.captureselectedItems(nodeData);
                    prevPosition = nodeData.checkedItem.nodedata.Id;
                }

                $(positionPopover.parentElement).webuiPopover("hide");
            }
        }
        else {
            alertify.alert(Resources.Rule_SelectASite);
            return;
        }
    }
    function onpositionCancelClick(event) {
        $(positionPopover.parentElement).webuiPopover("hide");
    }
    function hidePositionPopover() {
        if (positionPopover.parentElement)
            $(positionPopover.parentElement).webuiPopover("hide");
    }
    return {
        hidePositionPopover: hidePositionPopover,
        positionTreeloaderInstance: positionTreeloaderInstance,
        showPositionPopver: onpositionPopoverbuttonClicked,
        onaccountchecked: onaccountchecked,
        showtreeforposition: showtreeforposition
    }
})($, ko, window.ruleconfiguration.datacontext, window.ruleconfiguration.validation);
function positionTreeloader() {
    this.treeviewInstace = null;
}
positionTreeloader.prototype.getallcheckeditems = function () {
    if (this.treeviewInstace) {
        return this.treeviewInstace.GetCheckedItems();
    }
    console.error("Error on getting all checkeditems");
    return null;
}
positionTreeloader.prototype.loadtree = function (uielementid, selectedNode) {
    var $uiTreeviewEle = $("#" + uielementid);
    var serviceModel = new ServiceModel();
    serviceModel.serviceurl(window.ruleconfiguration.common.getpositiontreeviewurl());
    serviceModel.schema.idfield = "Id";
    serviceModel.schema.dataTextFeild = "Name";
    serviceModel.schema.dataSpriteIcon = "EntityType";
    serviceModel.schema.uniqueId = "Id";
    serviceModel.schema.children = "Children";
    serviceModel.schema.filterfield = "Id";
    serviceModel.events.itemselected = "";
    serviceModel.events.itemsloaded = "";
    serviceModel.events.itemupdated = "";
    if ($uiTreeviewEle !== undefined) {
        var treeOptions = {
            servicemodel: serviceModel,
            mode: "100",
            selectionmode: "single",
            noneditabletypes:["General","Dealer","Customer","Group"],
            theme: "black"
        };
        if (selectedNode) {
            treeOptions.selectednodes = [selectedNode];
        }
        this.treeviewInstace = $uiTreeviewEle.treeview(treeOptions);
    }
    this.treeviewInstace.EnableCheckbox(true);
}
