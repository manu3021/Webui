/// <reference path="rules.common.js" />
/// <reference path="rules.datacontext.js" />
/// <reference path="rules.uicontext.js" />
; (function ($, common, uicontext, datacontext) {
    var eventsSelected = [];
    var usersSelected = [];
    var actionSelected = [];
    String.format = function () {
        // The string containing the format items (e.g. "{0}")
        // will and always has to be the first argument.
        var theString = arguments[0];

        // start with the second argument (i = 1)
        for (var i = 1; i < arguments.length; i++) {
            // "gm" = RegEx options for Global search (more than one instance)
            // and for Multiline search
            var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
            theString = theString.replace(regEx, arguments[i]);
        }

        return theString;
    }
    IsNumber = function (data, event) {
        var charCode = (event.which) ? event.which : event.keyCode
        if (charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
    }
    IsInRange = function (data, event) {
        if ($(event.currentTarget)[0].value > $(event.currentTarget)[0].max) {
            $(event.currentTarget)[0].value = $(event.currentTarget)[0].max;
        }
        if ($(event.currentTarget)[0].value < $(event.currentTarget)[0].min) {
            $(event.currentTarget)[0].value = $(event.currentTarget)[0].min;
        }
    }
    var ruleBasemodel = function (data) {
        var self = this;
        data = data || {};
        self.Id = data.Id;
        self.UniqueId = data.UniqueId;
        self.TypeId = data.TypeId;
        self.EntityType = data.EntityType;
        self.Name = ko.observable(data.Name);
        self.IsSelected = ko.observable(false);
        //Entity Type added
        self.toJson = function () {
            delete self.IsSelected();
            return ko.toJSON(self);
        }
    }
    var ruleUsrmodel = function (data) {
        var self = this;
        data = data || {};
        self.Id = data.Id;
        self.UniqueId = data.UniqueId;
        self.PhotoRef = ko.observable();
        self.TypeId = data.TypeId;
        self.EntityType = data.EntityType;
        self.Name = ko.observable(data.Name);
        self.UserName = ko.observable(data.UserName);
        self.IsSelected = ko.observable(false);
        if (data.PhotoId) {
            // datacontext.getuserphoto(self.Id, self.PhotoRef);
        }
        //Entity Type added
        self.toJson = function () {
            delete self.PhotoRef();
            delete self.IsSelected();
            return ko.toJSON(self);
        }
    }
    var ruleActionmodel = function (data) {
        var self = this;
        data = data || {};
        self.Name = ko.observable(data.Name);
        self.IsEditMode = false;
        self.ActionTypeId = 0;
        self.TypeId = data.TypeId;
        self.ActionCategory = data.ActionCategory;
        self.ActionParameters = ko.observableArray(data.ActionParameters || []);
        self.TemplateId = data.templateId;
        self.ParentOption = data.Option;
        self.UpdateActionParamters = function (actionParameters) {
            self.ActionParameters([]);
            self.ActionParameters(actionParameters);
        }
        self.ActionParamCount = ko.observable(0);
        self.ActionNameCount = ko.observable(0);
        self.ActionNames = ko.observableArray([]);
        self.TimeConditionMin = ko.observable(data.TimeConditionMin || 1);
        self.TimeConditionSec = ko.observable(data.TimeConditionSec || 0);
        self.actionpopoverclicked = function (data, event) {
            if (self.ActionCategory == common.thanThatOptions.ACTIONS) {
                uicontext.showActionNamePopover(event);
            }
            else {
            }
        }
        self.actionParampopoverclicked = function (data, event) {
            if (self.ActionCategory == common.thanThatOptions.ACTIONS) {
                uicontext.showEmailPopover(event);
            }
            else {
            }
        }
        self.getactionListParams = function () {
            var resStr = "";
            self.ActionParamCount(self.ActionParameters().length);
            for (var i = 0; i < self.ActionParameters().length; i++) {
                resStr += self.ActionParameters()[i].Name() + ",";
            }
            // TRIM ARRAY END
            resStr = resStr.slice(0, -1);
            return resStr;
        }
        self.getactionnames = function () {
            var resStr = "";
            self.ActionNameCount(self.ActionNames().length);
            for (var i = 0; i < self.ActionNames().length; i++) {
                resStr += self.ActionNames()[i].Name() + ",";
            }
            // TRIM ARRAY END
            resStr = resStr.slice(0, -1);
            return resStr;
        }
        self.updateName = function () {
            var rstr = "";
            self.ActionNames([]);
            $.map(actionSelected, function (item) {
                self.ActionNames.push(item);
                return item;
            });
            if (self.ActionNames().length > 0) {
                self.ActionTypeId = self.ActionNames()[0].TypeId;
                self.ActionName = self.ActionNames()[0].Name;
            }
            for (var ac in self.ActionNames()) {
                rstr += self.ActionNames()[ac].Name + ",";
            }

            actionSelected = [];
            rstr = rstr.slice(0, -1);
            self.Name(rstr);
        }
        self.checknameselected = function () {
            return actionSelected.length > 0;
        }
        self.InitializeRuleAction = function (rc) {
            try {
                self.ActionNames([]);
                self.ActionParameters([]);
                var mActNames = $.map(rc.ActionNames, function (aItem) {
                    return new ruleBasemodel(aItem);
                });

                var mActParams = $.map(rc.ActionParameters, function (aItem) {
                    return new ruleBasemodel(aItem);
                });
                self.ActionNames(mActNames);
                self.ActionParameters(mActParams);
                self.TimeConditionMin(rc.TimeConditionMin);
                self.TimeConditionSec(rc.TimeConditionSec);
            } catch (e) {
                throw e;
            }
        }
        self.toJson = function () {
            return ko.toJSON(self);
        }
        self.cleanaction = function () {
            self.ActionNames([]);
            self.ActionParameters([]);
        }
    }
    var ruleDetailModel = function () {
        var self = this;
        self.Id = null;
        self.DisplayRuleExecInAlarms = ko.observable(true);
        self.UniqueId = ko.observable(null);
        self.IsRuleSelected = ko.observable(false);
        self.SelectedPosition = ko.observable(new accountEntity());
        self.IsActive = ko.observable(true);
        self.Category = ko.observable(1);
        self.Name = ko.observable("RuleName");
        self.RuleSettings = ko.observableArray([]);
        self.errorMessage = ko.observable("");
        self.ActiveButtonText = ko.computed(function () {
            if (self.IsActive())
                return common.labels.DEACTIVATE_RULE;
            else
                return common.labels.ACTIVATE_RULE;
        });
        self.InitializeSettings = function (ruledata) {
            try {
                self.cleanModel();
                self.IsRuleSelected(true);
                self.Id = ruledata.Id;
                self.Name(ruledata.Name);
                self.IsActive(ruledata.IsActive);
                self.DisplayRuleExecInAlarms(ruledata.DisplayRuleExecInAlarms);
                self.SelectedPosition().initialize(ruledata.SelectedPosition);
                if (ruledata.RuleSettings) {
                    $.map(ruledata.RuleSettings, function (rs) {
                        var rsm = new ruleSettingsModel();
                        rsm.PrepareRuleSetting(rs);
                        self.addruleSettings(rsm);
                        return rsm;
                    });
                    if (self.getifthissettings().length > 0)
                        self.getifthissettings()[(self.getifthissettings().length - 1)].IsSwitchVisible(false);
                }
            } catch (e) {
                console.log(e);
            }
        }
        self.getifthissettings = function () {
            try {
                return _.filter(self.RuleSettings(), function (rs) {
                    return rs.TypeId == common.ruleSettingType.IFTHIS;
                });
            } catch (e) {
                throw e;
            }
        }
        self.getthenthatsettings = function () {
            try {
                return _.filter(self.RuleSettings(), function (rs) {
                    return rs.TypeId == common.ruleSettingType.THANTHAT;;
                });
            } catch (e) {
                throw e;
            }

        }
        self.addruleSettings = function (rulesetting) {
            try {
                self.RuleSettings.push(rulesetting);
                uicontext.addrulSeetingtemplate(rulesetting);
            } catch (e) {
                throw e;
            }
        }
        self.toJson = function () {
            return ko.toJSON(self);
        }
        self.RemoveRuleSettingTemplate = function (rs, callback) {
            try {
                var templatedParent = $("ul[data-templateId=" + rs.Id() + "]").parent("li");
                if (templatedParent) {
                    uicontext.hidecurrentPopover();
                    $(templatedParent).remove();
                }
            } catch (e) {
                throw e;
            }
        }
        self.validateRule = function () {
            if (self.Name() == undefined || self.Name() == "") {
                alertify.alert(Resources.Rule_fillRulename);
                return false;
            }
            // following 2 strings are hardcoded as the corresponding strings from Resource.rex file are not evaluating during runtime
            if (!(self.Name().length > 3)) {
                alertify.alert("Rule name should be atleast 4 characters");
                return false;
            }
            if (self.Name().length > 60) {
                alertify.alert("Rule name should not exceed 60 characters");
                return false;
            }
            if (!validateRuleName(self.Name())) {
                alertify.alert(Resources.Rule_nameNotSpecialCharacters);
                return false;
            }
            if (self.SelectedPosition().Id == null || self.SelectedPosition().Id == undefined) {
                alertify.alert(Resources.Rule_siteRuleShouldConfigured);
                return false;
            }
            if (self.RuleSettings().length == 0) {
                alertify.alert(common.messages.Rule_configure_then);
                return false;
            }
            if (self.getifthissettings().length == 0) {
                alertify.alert(common.messages.Rule_configure_when);
                return false;
            }
            if (self.getthenthatsettings().length == 0) {
                alertify.alert(common.messages.Rule_configure_when_then);
                return false;
            }

            var timeCondRules = ko.utils.arrayFilter(self.getifthissettings(), function (ifthisSetting) {
                return ifthisSetting.OperandEntityType == common.ifthisOptions.TIMEWINDOW;
            });
            var scheduleRules = ko.utils.arrayFilter(self.getifthissettings(), function (ifthisSetting) {
                return ifthisSetting.OperandEntityType == common.ifthisOptions.SCHEDULE;
            });
            var deviceRules = ko.utils.arrayFilter(self.getifthissettings(), function (ifthisSetting) {
                return ifthisSetting.OperandEntityType == common.ifthisOptions.DEVICE;
            });

            var aRule = true;
            if (deviceRules.length > 1) {
                for (var dr = 0; dr < (deviceRules.length - 1) ; dr++) {
                    if (deviceRules[dr].RuleCondition() != common.R_CONDITION.AND) {
                        aRule = false;
                        break;
                    }
                }
            }
            else
                aRule = false;
            if (aRule && timeCondRules.length <= 0) {
                alertify.alert("Please configure a valid Complex rule with Time Condition and(or) Schedules.");
                return false;
            }
            if (deviceRules.length < 2 && timeCondRules.length == 1) {
                alertify.alert(Resources.Rule_ruleSettingsWithTimeCondition);
                return false;
            }

            if (deviceRules.length < 1 && scheduleRules.length == 1) {
                alertify.alert(Resources.Rule_ruleSettingsWithSchedule);
                return false;
            }

            var strMessage = "";
            var ifThisSettings = self.getifthissettings();
            for (var ifthis = 0; ifthis < ifThisSettings.length; ifthis++) {
                var rsVal = ifThisSettings[ifthis];

                /*if ((ifthis + 1) < ifThisSettings.length) {
                    var nextVal = ifThisSettings[ifthis + 1];
                    if (nextVal.OperandEntityType == common.ifthisOptions.DEVICE && rsVal.OperandEntityType == common.ifthisOptions.DEVICE) {
                        if (rsVal.RuleCondition() == common.R_CONDITION.AND) {
                            valMessage = common.messages.RULE_IFTHIS_AND_CONDITION_NOTSUPPORTED
                            strMessage = String.format("{0} at row {1} in IFTHIS setting", valMessage, ifthis + 1);
                            alertify.alert(strMessage);
                            break;
                        }
                    }
                }*/
                var valMessage = rsVal.validate();
                if (valMessage != "") {
                    strMessage = String.format("{0} at row {1} in IFTHIS setting", valMessage, ifthis + 1);
                    alertify.alert(strMessage);
                    break;
                }
            }

            if (strMessage == "") {
                for (var thenthat = 0; thenthat < self.getthenthatsettings().length; thenthat++) {
                    var rsVal = self.getthenthatsettings()[thenthat];
                    var valMessage = rsVal.validate();
                    if (valMessage != "") {
                        strMessage = String.format("{0} at row {1} in THEN setting", valMessage, thenthat + 1);
                        alertify.alert(strMessage);
                        break;
                    }
                }
            }

            if (strMessage != "") {
                //alertify.alert(strMessage);
                return false;
            }
            return true;
        }
        self.ValidateRsCondition = function (currsid) {
            try {
                var cRs = _.find(self.RuleSettings(), function (nItem) {
                    return nItem.Id() == currsid;
                });
                if (cRs) {
                    var cIndex = _.indexOf(self.RuleSettings(), cRs);
                    var nRs = self.RuleSettings()[cIndex + 1];
                    if (nRs.OperandEntityType == common.ifthisOptions.DEVICE) {
                        return false;
                    }
                    return true;
                }
                return true;
            } catch (e) {
                throw e;
            }
        }
        self.removeRuleSetting = function (rs) {
            try {
                self.RemoveRuleSettingTemplate(rs);
                self.RuleSettings.remove(rs);
            } catch (e) {
                throw e;
            }
        }
        self.cleanModel = function () {
            try {
                console.info("Cleaing rule detail model");
                self.Name("");
                self.IsRuleSelected(false);
                self.UniqueId(null);
                self.SelectedPosition(new accountEntity());
                for (var i = 0; i < self.RuleSettings().length; i++) {
                    var rs = self.RuleSettings()[i];
                    rs.cleanactions();
                    self.RemoveRuleSettingTemplate(rs);
                }
                console.info("Cleaned rule detail model");
                self.RuleSettings([]);
            } catch (e) {
                throw e;
            }
        }
        function validateRuleName(rn) {
            var iChars = "!@#$%^&*()+=-[]\\\';,./{}|\":<>?";
            for (var i = 0; i < rn.length; i++) {
                if (iChars.indexOf(rn.charAt(i)) != -1) {
                    return false;
                    break;
                }
            }
            return true;
        }
    }
    var rulemodel = function (data) {
        var self = this;
        self.Id = data.Id;
        self.Name = ko.observable(data.Name);
        self.Description = ko.observable(data.Description);
        self.Date = ko.observable(data.FailedDate);
        self.IsActive = ko.observable(data.IsActive);
        self.IsFailed = ko.observable(false);
        self.Selected = ko.observable(false);
        self.AccountHierarchy = ko.observable(data.AccountHierarchy);
        self.StatusClass = ko.computed(function () {
            if (self.IsActive()) {
                // self.IsFailed(false);
                return common.labels.ACTIVE_TEXT;
            }
            else {
                //self.IsFailed(true);
                return common.labels.INACTIVE_TEXT;
            }
        });
        self.selectedstate = ko.computed(function () {
            return this.Selected() == true ? "itemSelected" : "itemNormal";
        }, self);
        self.RuleClicked = function (date, event) {
            console.log("Rule " + self.Name() + " Is Clicked");
            window.ruleconfiguration.uicontext.onruleitemselectionchanged(self.Id);
        }
        self.toJson = function () {
            return ko.toJSON(self);
        }
    };
    var accountEntity = function () {
        var self = this;
        self.Id = null;
        self.ParentId = null;
        self.EntityType = null;
        self.Name = ko.observable("");
        self.initialize = function (data) {
            data = data || {};
            self.Id = data.Id;
            self.ParentId = data.ParentId;
            self.EntityType = data.EntityType;
            self.Name(data.Name);
        }
        self.toJson = function () {
            return ko.toJSON(self);
        }
    }
    var rulePageViewmodel = function () {
        var self = this;
        self.RuleDetailModel = ko.observable(new ruleDetailModel());
        self.RuleDetailModel().Name("");
        self.GetThanTahtRule = function () {
            return self.RuleDetailModel().GetThanThatRule();
        }
        self.posbtnclicked = function (data, event) {
            //self.popovermodel = new popovermodel(event.currentTarget);
            window.ruleconfiguration.posuicontext.showPositionPopver(event, undefined);
        };
        self.popovermodel = ko.observable(null);
        self.IsViewMode = ko.observable(false);
        self.IsEditing = false;
        self.IsNew = false;
        self.IsinEditMode = function () {
            return !self.IsViewMode();
        };
        self.IsinViewMode = function () {
            return self.IsViewMode();
        };
        self.AddNewRule = function () {
            if (self.RuleDetailModel().validateRule()) {
                //var ruleName = RuleDetailModel.RuleName;
                var timeCondRules = ko.utils.arrayFilter(self.RuleDetailModel().getifthissettings(), function (ifthisSetting) {
                    return ifthisSetting.OperandEntityType == common.ifthisOptions.TIMEWINDOW;
                });
                var scheduleRules = ko.utils.arrayFilter(self.RuleDetailModel().getifthissettings(), function (ifthisSetting) {
                    return ifthisSetting.OperandEntityType == common.ifthisOptions.SCHEDULE;
                });
                if (timeCondRules.length > 0 && scheduleRules.length > 0)
                    self.RuleDetailModel().Category = common.ruleCategory.Combination_TimeInterval_Schedules;
                else if (timeCondRules.length > 0 && scheduleRules.length <= 0)
                    self.RuleDetailModel().Category = common.ruleCategory.Combination_TimeInterval;

                uicontext.addnewrule(self.RuleDetailModel(), function (data) {
                    self.RuleDetailModel().Id = data.Id;
                    window.ruleconfiguration.rulelistViemodel.UpdateName(self.RuleDetailModel().Id, data.Name);
                    var ifthissettings = self.RuleDetailModel().getifthissettings();
                    for (var ifCnt = 0; ifCnt < ifthissettings.length; ifCnt++) {
                        if (ifCnt == (ifthissettings.length - 1))
                            ifthissettings[ifCnt].IsSwitchVisible(false);
                        else
                            ifthissettings[ifCnt].IsSwitchVisible(true);
                    }
                });
            }
        }
        self.CreateButtonClicked = function (data, event) {
            try {
                self.RuleDetailModel().cleanModel();
                uicontext.InitializeCreateNewRule(self);
            } catch (e) {
                console.error(e);
            }
        }
        self.IsCancelVisible = ko.computed(function () {
            try {
                return (self.RuleDetailModel().UniqueId() != null || self.RuleDetailModel().Name().length > 0 || self.RuleDetailModel().Id || self.RuleDetailModel().RuleSettings().length > 0);
            } catch (e) {
                console.clear();
                console.error("IsCancelVisible", e);
            }
        });
        self.CancelRule = function () {
            alertify.confirm(Resources.Rule_cancelChangesMade, function (e) {
                if (e) {
                    console.log("Cancel Rule clicked");
                    self.ClearAllforEditView();
                    if (self.IsEditing) {
                        self.IsEditing = false;
                        if (self.RuleDetailModel().Id)
                            window.ruleconfiguration.uicontext.onruleitemselectionchanged(self.RuleDetailModel().Id);
                        self.IsViewMode(true);
                    }
                    else {
                        self.ClearAllforEditView();
                        //self.IsViewMode(false);
                    }
                }
            });
        }
        self.DeleteRule = function () {
            if (self.RuleDetailModel().Name()) {
                alertify.confirm(Resources.Rule_deleteRule + self.RuleDetailModel().Name(), function (e) {
                    if (e) {
                        datacontext.deleterule(self.RuleDetailModel().Id, function (jsonData) {
                            alertify.success(Resources.Rule_Successfullydeleted);
                            //  uicontext.getrules();
                            //  uicontext.InitializeCreateNewRule();
                            window.ruleconfiguration.rulelistViemodel.removeItemfromDatasource(self.RuleDetailModel().Id);
                        }, function () {
                            alertify.error(Resources.Rule_ErrorOccurred);
                        });
                    }
                });
            }
            else {
                alertify.alert(Resources.Rule_SelectRuleToDelete);
            }
        }
        self.ActivateDeActivateRule = function () {
            try {
                var isactive = self.RuleDetailModel().IsActive();
                datacontext.activatedeactivaterule(isactive, self.RuleDetailModel().Id, function (jsonData) {
                    self.RuleDetailModel().IsActive(!isactive);
                    window.ruleconfiguration.rulelistViemodel.UpdateStatus(self.RuleDetailModel().Id, !isactive);
                    if (isactive) {
                        alertify.success(Resources.Rule_SuccessfullyDeActivated);
                    }
                    else {
                        alertify.success(Resources.Rule_SuccessfullyActivated);
                    }

                }, function () {
                    alertify.error(Resources.Rule_ActivateRuleFailed);
                });
            } catch (e) {
                console.log(e.message());
            }
        }
        self.SiteName = ko.observable("some name");
        self.EditRule = function (data, event) {
            console.log("Edit Rule clicked");
            if (self.RuleDetailModel().Id) {
                self.IsEditing = true;
                self.IsViewMode(false);
            }
            else {
                alertify.alert(Resources.Rule_RuleInRuleList);
            }
        }
        self.ViewRule = function (data, event) {
            console.log("View Rule clicked");
            self.IsViewMode(true);
        }
        self.UpdateRule = function () {
        }
        self.InitializeRuleDetail = function (ruleDetail) {
            try {
                self.IsEditing = false;
                self.IsNew = false;
                self.RuleDetailModel().cleanModel();
                self.RuleDetailModel(ruleDetail);
            } catch (e) {
                console.error("error on InitializeRuleDetail", e);
            }
        }
        self.captureselectedItems = function (positionNode) {
            self.RuleDetailModel().UniqueId(positionNode.checkedItem.nodedata.Id);
            self.RuleDetailModel().SelectedPosition().initialize({
                Id: positionNode.checkedItem.nodedata.Id,
                ParentId: positionNode.checkedItem.nodedata.ParentId,
                Name: positionNode.checkedItem.nodedata.Name,
                EntityType: positionNode.checkedItem.nodedata.EntityType
            });
        }
        self.removeRuleSetting = function (rs) {
            try {
                self.RuleDetailModel().removeRuleSetting(rs);
            } catch (e) {
                throw e;
            }
        }
        self.ClearAllforEditView = function () {
            try {
                self.RuleDetailModel().cleanModel();
            } catch (e) {
                throw e;
            }
        }
    };
    var ruleSettingsModel = function () {
        var self = this;
        var popoverParent = null;
        self.rulesettingsTemplate = "";
        self.Id = ko.observable("");
        // REFERENCE:OperandEntityType default value None = 0,Device = 1,Schedule = 2,TimeWindow = 3,UniversalEvent = 4, 
        self.OperandEntityType = 0;
        //REFERENCE: TYPE ID FOR TO GET ifthis TYPE or thenthat TYPE
        self.TypeId = null;
        /* Rule action will have action names- (left control in rule setting)
        action params(right control in rule setting)
        */
        self.RuleAction = ko.observable(new ruleActionmodel());
        // AND ,  OR condition based on the switch
        self.RuleCondition = ko.observable(1);
        self.IsSwitchVisible = ko.observable(true);
        self.GetConditionValue = ko.computed(function () {
            if (self.RuleCondition() == 1) {
                return "AND"
            }
            else {
                return "OR"
            }
        })
        self.leftControlClick = function (data, event) {
            uicontext.showpopover(self.TypeId, self.OperandEntityType, 1, event, data);
            console.info("left control clicked for " + self.OperandEntityType, self.TypeId);
        }
        self.rightControlClick = function (data, event) {
            uicontext.showpopover(self.TypeId, self.OperandEntityType, 2, event, data);
            console.info("left control clicked for " + self.OperandEntityType, self.TypeId);
        }
        self.removebtnclicked = function (data, event) {
            self.removeTemplate();
        }
        self.removeTemplate = function () {
            try {
                var pageContext = ko.contextFor(document.getElementById("rulelistHeader"));
                pageContext.$data.removeRuleSetting(self);
            } catch (e) {
                console.error(e);
            }
        }
        self.initialize = function (templateid) {
            try {
                self.Id = ko.observable(templateid);
            } catch (e) {
                console.error(e);
            }
        }
        self.buildactionNames = function (checkeditems) {
            self.RuleAction().ActionNames([]);
            for (var cIndex in checkeditems) {
                var cItem = checkeditems[cIndex];
                if (cItem.nodedata) {
                    // Tree items checked
                    // var fResult = _.findWhere(self.RuleAction().ActionNames(), { Id: cItem.nodedata.Id });
                    // if (!fResult)
                    //self.RuleAction().ActionNames([]);
                    self.RuleAction().ActionNames.push(new ruleBasemodel(cItem.nodedata));
                }
                else {
                    // normal item checkced
                    var fResult = _.findWhere(self.RuleAction().ActionNames(), { Id: cItem.Id });
                    if (!fResult)
                        self.RuleAction().ActionNames.push(cItem);
                }
            }
        }
        self.buildactionParams = function (pItems) {
            try {
                self.RuleAction().ActionParameters([]);
                for (var cIndex in pItems) {
                    var cItem = pItems[cIndex];
                    self.RuleAction().ActionParameters.push(cItem);
                }
            } catch (e) {

            }
        }
        self.cleanactions = function () {
            try {
                self.RuleAction().cleanaction();
            } catch (e) {
                throw e;
            }
        }
        self.validate = function () {
            try {
                var valMessage = "";
                if (self.RuleAction().ActionNameCount() <= 0) {
                    if (self.TypeId == 0) {
                        if (self.OperandEntityType == common.ifthisOptions.DEVICE) {
                            valMessage = Resources.Rule_SelectAtleastOneDevice;
                            return valMessage;
                        }
                        if (self.OperandEntityType == common.ifthisOptions.SCHEDULE) {
                            valMessage =Resources.Rule_SelectAtleastOneSchedule;
                            return valMessage;
                        }
                    }
                    else {
                        if (self.OperandEntityType == common.thanThatOptions.DEVICES) {
                            valMessage =Resources.Rule_SelectAtleastOneDevice;
                            return valMessage;
                        }
                        if (self.OperandEntityType == common.thanThatOptions.ACTIONS) {
                            valMessage =Resources.Rule_SelectAtleastOneAction;
                            return valMessage;
                        }
                    }
                }
                //if (self.OperandEntityType != common.ifthisOptions.SCHEDULE) {
                if (self.RuleAction().ActionParamCount() <= 0) {
                    if (self.TypeId == 0) {
                        if (self.OperandEntityType == common.ifthisOptions.DEVICE) {
                            valMessage = Resources.Rule_SelectAtleastOneEvent;
                            return valMessage;
                        }
                    }
                    else {
                        if (self.OperandEntityType == common.thanThatOptions.ACTIONS) {
                            valMessage =Resources.Rule_SelectAtleastOneUser;
                            return valMessage;
                        }
                        if (self.OperandEntityType == common.thanThatOptions.DEVICES) {
                            valMessage = Resources.Rule_SelectAtleastOneDeviceAction;
                            return valMessage;
                        }
                    }
                }
                else {
                    // get actionparam entitytypes
                    //loop through each
                    //find it in action names
                    var ActionNameEntityTypes = $.map(self.RuleAction().ActionNames(), function (nItem) {
                        return nItem.EntityType;
                    });
                    var ActionParameterEntityTypes = $.map(self.RuleAction().ActionParameters(), function (pItem) {
                        return pItem.EntityType;
                    });
                    for (var m = 0; m < ActionParameterEntityTypes.length; m++) {
                        var entity = [];
                        entity = ko.utils.arrayFilter(ActionNameEntityTypes, function (nEntity) {
                            return nEntity == ActionParameterEntityTypes[m];
                        })
                        if (entity.length <= 0) {
                            if (self.TypeId == 0)
                                valMessage = Resources.Rule_EitherSelectDevice + ActionParameterEntityTypes[m] + Resources.Rule_OrDeselectEvent;
                            else
                                valMessage = Resources.Rule_EitherSelectDevice + ActionParameterEntityTypes[m] + Resources.Rule_OrDeselectActions;
                            return valMessage;
                        }
                    }

                    for (var m = 0; m < ActionNameEntityTypes.length; m++) {
                        var entity = [];
                        entity = ko.utils.arrayFilter(ActionParameterEntityTypes, function (nEntity) {
                            return nEntity == ActionNameEntityTypes[m];
                        })
                        if (entity.length <= 0) {
                            if (self.TypeId == 0)
                                valMessage = Resources.Rule_AppropriateEventsForDevice + ActionNameEntityTypes[m];
                            else
                                valMessage = Resources.Rule_AppropriateActionsForDevice + ActionNameEntityTypes[m];
                            return valMessage;
                        }
                    }

                }
                if (self.OperandEntityType == common.ifthisOptions.TIMEWINDOW) {
                    var min = self.RuleAction().TimeConditionMin();
                    var sec = self.RuleAction().TimeConditionSec();
                    if (min == 0 && sec == 0)
                        return (valMessage =  Resources.Rule_ValidTime);
                    if (min < 0 || min > 60 || min.toLocaleString().match(/^[0-9]+$/) == null)
                        return (valMessage =  Resources.Rule0To60);
                    if (sec < 0 || sec > 60 || sec.toLocaleString().match(/^[0-9]+$/) == null)
                    return (valMessage =  Resources.Rule0To60);
                }
                return valMessage;
            } catch (e) {
                return "";
            }
        }
        self.PrepareRuleSetting = function (rs) {
            try {
                self.OperandEntityType = rs.OperandEntityType;
                self.TypeId = rs.TypeId;
                self.RuleCondition(rs.RuleCondition);
                self.RuleAction().InitializeRuleAction(rs.RuleAction);
            } catch (e) {
                throw e;
            }
        }
        self.toJson = function () {
            return ko.toJSON(self);
        }
    }
    datacontext.ruleBasemodel = ruleBasemodel;
    datacontext.ruleUsrmodel = ruleUsrmodel;
    datacontext.ruleDetailModel = ruleDetailModel;
    datacontext.rulePageViewmodel = rulePageViewmodel;
    datacontext.rulesettingsmodel = ruleSettingsModel;
    datacontext.rulemodel = rulemodel;
    datacontext.ruleActionmodel = ruleActionmodel;

    window.ruleconfiguration.rulelistViemodel = (function () {
        var self = this;
        self.IsLoading = ko.observable(false);
        self.busytext = ko.observable("Loading");
        self.query = ko.observable('');
        self.RulesDataSource = ko.observableArray([]);
        self.currentSelectedItem = null;

        self.onSelectionChanged = function (ruleItem) {
            var rItem = _.find(RulesDataSource(), function (item) { return item.Id == ruleItem });
            if (currentSelectedItem) {
                currentSelectedItem.Selected(false);
            }
            rItem.Selected(true);
            currentSelectedItem = rItem;
        }
        self.removeItemfromDatasource = function (itemId) {
            try {
                var ruleItem = _.find(RulesDataSource(), function (item) { return item.Id == itemId; });
                var crIndex = _.indexOf(RulesDataSource(), ruleItem);
                var rultoSelect = null;
                if ((RulesDataSource().length) == 1) {
                    RulesDataSource.remove(ruleItem);
                    uicontext.InitializeCreateNewRule();
                }
                else {
                    if (crIndex == RulesDataSource().length - 1) {
                        rultoSelect = RulesDataSource()[crIndex - 1];
                    }
                    else {
                        rultoSelect = RulesDataSource()[crIndex + 1];
                    }
                    RulesDataSource.remove(ruleItem);
                    selectNextRule(rultoSelect);
                }

            } catch (e) {
                console.error("ERROR ON removeItemfromDatasource", e);
            }
        }
        self.selectNextRule = function (ruleToSelect) {
            uicontext.onruleitemselectionchanged(ruleToSelect.Id);
            onSelectionChanged(ruleToSelect);
        }
        self.UpdatedSource = ko.computed(function () {
            try {
                if (self.query()) {
                    var find = self.query().toLowerCase();
                    return ko.utils.arrayFilter(self.RulesDataSource(), function (rule) {
                        return rule.Name().toLowerCase().indexOf(find) >= 0;
                    });
                }
                else {
                    return self.RulesDataSource();
                }
            } catch (e) {
                console.error(e);
            }
        });

        self.UpdateStatus = function (ruleId, isActive) {
            _.find(self.UpdatedSource(), function (item) {
                if (item.Id == ruleId)
                    item.IsActive(isActive);
            })
        }
        self.UpdateName = function (ruleId, Name) {
            _.find(self.UpdatedSource(), function (item) {
                if (item.Id == ruleId)
                    item.Name(Name);
            })
        }
        return {
            UpdateStatus: self.UpdateStatus,
            UpdateName: self.UpdateName,
            searchquery: self.query,
            UpdatedSource: UpdatedSource,
            currentSelectedItem: currentSelectedItem,
            onSelectionChanged: onSelectionChanged,
            removeItemfromDatasource: removeItemfromDatasource,
            rulesDatasource: RulesDataSource,
            IsBusy: IsLoading
        };
    })();
    window.ruleconfiguration.operationListViewmodel = (function () {
        var operationSource = ko.observableArray([]);
        initialize = function (rsContext) {
            try {
                var slctdvs = rsContext.RuleAction().ActionNames();
                var prevOp = rsContext.RuleAction().ActionParameters();
                if (slctdvs) {
                    if (slctdvs.length > 0) {
                        datacontext.getDeviceActions(slctdvs).done(function (jsResult) {
                            if (jsResult.Success) {
                                var mappedOperations = $.map(jsResult.data, function (oItem) {
                                    var rsbModel = new ruleBasemodel(oItem);
                                    if (prevOp.length > 0) {
                                        //GetDeviceActionByDeviceTypes returns only keyvaluepair.And values are just action names,no Id associated with it
                                        var fResult = _.find(prevOp, function (pItem) {
                                            return oItem.Name == pItem.Name();
                                        });
                                        if (fResult) {
                                            rsbModel.IsSelected(true);
                                        }
                                    }
                                    return rsbModel
                                });
                                operationSource([]);

                                operationSource(mappedOperations);
                            }
                            else {
                                rsContext.RuleAction().ActionNames([]);
                                rsContext.RuleAction().ActionParameters([]);
                            }
                        }).fail(function () {
                            rsContext.RuleAction().ActionNames([]);
                            rsContext.RuleAction().ActionParameters([]);
                        });
                    }
                    else {
                        alertify.alert( Resources.Rule_DevicesDefineOperations);
                        return false;
                    }
                }
            } catch (e) {
                throw e;
            }
        }
        return {
            initialize: initialize,
            operationSource: operationSource
        }
    })();
    window.ruleconfiguration.scheduleListViewmodel = (function () {
        var scheduleSource = ko.observableArray([]);
        initialize = function (rsContext,siteId) {
            try {
                if (siteId == null || siteId == undefined) {
                    alertify.alert(Resources.Rule_SiteConfigured);
                    return false;
                }
                else {
                    datacontext.getSchedules(siteId).done(function (jsResult) {
                        if (jsResult.Success) {
                            var prevOp = rsContext.RuleAction().ActionNames();
                            var mappedSchedules = $.map(jsResult.data, function (sItem) {
                                var rsbModel = new ruleBasemodel(sItem);
                                if (prevOp.length > 0) {
                                    var fResult = _.find(prevOp, function (pItem) {
                                        return sItem.Name == pItem.Name();
                                    });
                                    if (fResult) {
                                        rsbModel.IsSelected(true);
                                    }
                                }
                                return rsbModel;
                            });
                            scheduleSource([]);
                            scheduleSource(mappedSchedules);
                        }
                        else {
                            console.error("Error while getting schdule items");
                        }
                    });
                }
            } catch (e) {
                console.error(e);
                throw e;
            }
        }
        return {
            initialize: initialize,
            scheduleSource: scheduleSource
        }
    })();
    window.ruleconfiguration.eventlistViewmodel = (function () {
        var EventDataSource = ko.observableArray([]);
        return {
            eventDatasource: EventDataSource
        };
    })();
    window.ruleconfiguration.userslistViewmodel = (function () {
        var UsersDataSource = ko.observableArray([]);
        var initialize = function (rsContext, accountId) {
            window.ruleconfiguration.datacontext.getusers(accountId,function (jsonResult) {
                if (jsonResult.Success) {
                    UsersDataSource([]);
                    UsersDataSource(jsonResult.data.map(function (item) {
                        var usrModel = new datacontext.ruleUsrmodel({
                            Id: item.Id,
                            Name: item.FirstName + "," + item.LastName,
                            UserName: item.UserName,
                            PhotoId: item.PhotoId
                        });
                        var result = _.findWhere(rsContext.RuleAction().ActionParameters(), { Id: item.Id });
                        if (result != undefined || result != null) {
                            usrModel.IsSelected(true);
                        }
                        return usrModel;
                    }));
                }
            });
        }
        return {
            initialize: initialize,
            usersDataSource: UsersDataSource
        };
    })();
    window.ruleconfiguration.useractionViewmodel = (function () {
        var userActionSource = ko.observableArray([]);
        initialize = function (rsContext,accountId) {
            try {
                datacontext.getSupportedUserActions(accountId).done(function (jsResult) {
                    if (jsResult.Success) {
                        var prevOp = rsContext.RuleAction().ActionNames();
                        var mappedUserActions = $.map(jsResult.data, function (uac) {
                            var rbModel = new datacontext.ruleBasemodel(uac);
                            if (prevOp.length > 0) {
                                var fResult = _.find(prevOp, function (pItem) {
                                    return uac.Name == pItem.Name();
                                });
                                if (fResult) {
                                    rbModel.IsSelected(true);
                                }
                            }
                            rbModel.TypeId = uac.TypeId;
                            return rbModel;
                        });
                        userActionSource([]);
                        userActionSource(mappedUserActions);
                    }
                }).fail(function () {
                    console.error("Error while fetching user actions");
                });
            } catch (e) {
                throw e;
            }
        };
        return {
            initialize: initialize,
            userActionSource: userActionSource
        };
    })();
    function initModel() {
        uicontext.bindrulepageheader();

    }
    initModel();
})($, window.ruleconfiguration.common, window.ruleconfiguration.uicontext, window.ruleconfiguration.datacontext);
