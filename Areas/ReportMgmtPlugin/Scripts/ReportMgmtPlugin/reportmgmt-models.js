/// <reference path="reportmgmt-datacontext.js" />
/// <reference path="reportmgmt-common.js" />

(function (ko, datacontext, common) {

    ko.bindingHandlers.reportPopUp = {
        
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var attribute = ko.utils.unwrapObservable(valueAccessor());
            var templateContent = attribute.content;
            
            var popOverTemplate = "<div class='popOverReport' id='" + attribute.id + "-popover'>" + $(templateContent).html() + "</div>";
            $(element).webuiPopover({
                placement: 'auto',
                cache: false,
                multi:false,
                async: true,                
                content: popOverTemplate,
                html: true,
                trigger: 'click'
            }).on('shown.webui.popover', function (event) {                
                var newContext = ko.contextFor(this);
                var thePopover = document.getElementById(attribute.id + "-popover");
                ko.applyBindingsToDescendants(newContext, thePopover);
            });
            //$(element).attr('id', "popover" + attribute.id + "_click");
            //$(element).click(function () {
            //    debugger;
            //    $(".webui-popover").webuiPopover("hide");
               
            //    $(this).webuiPopover('toggle');
            //    var newContext = ko.contextFor(this);
            //    var thePopover = document.getElementById(attribute.id + "-popover");
            //    ko.applyBindingsToDescendants(newContext, thePopover);
            //})
        }
    }

    var BaseModel = function (data) {
        var self = this;
        data = data || {};
        self.Id = ko.observable(data.Id);
        self.Name = ko.observable(data.Name);

        self.deleteonly = function () {
            var keyCode = (event.which) ? event.which : event.keyCode;
            if ((keyCode == 8) || (keyCode == 46))
                event.returnValue = true;
        }
    }

    var PossibleValueModel = function (data) {
        var self = this;
        data = data || {};
        self.Id = ko.observable(data.Id);
        self.Value = ko.observable(data.Value);
        self.IsSelected = ko.observable(false);

        self.deleteonly = function () {
            var keyCode = (event.which) ? event.which : event.keyCode;
            if ((keyCode == 8) || (keyCode == 46))
                event.returnValue = true;
        }
    }

    var DataTypeConditionMapModel = function (data) {
        var self = this;
        data = data || {};
        var mapping = {
            'Conditions': {
                key: function (data) {
                    return ko.utils.unwrapObservable(data.Id);
                },
                create: function (options) {
                    return new BaseModel(options.data);
                }
            }
        };

        self.Initialize = function (option) {
            ko.mapping.fromJS(option, mapping, self);
        }

        self.deleteonly = function () {
            var keyCode = (event.which) ? event.which : event.keyCode;
            if ((keyCode == 8) || (keyCode == 46))
                event.returnValue = true;
        }

        this.Initialize(data);
    }

    var FilterModel = function (data) {
        var self = this;
        data = data || {};
        self.PossibleValues = ko.observableArray([]);
        self.IsAll = ko.observable(false);
        self.StartDate = ko.observable();
        self.EndDate = ko.observable();
        self.IsLoaded = ko.observable(false);

        var mapping = {};
        var conditionMapping = {
            'PossibleConditions': {
                key: function (data) {
                    return ko.utils.unwrapObservable(data.Id);
                },
                create: function (options) {
                    return new DataTypeConditionMapModel(options.data);
                }
            }
        };

        self.Initialize = function (option) {
            ko.mapping.fromJS(option, mapping, self);
            switch (option.DataType) {
                case common.dataTypes.None:
                case common.dataTypes.Int:
                case common.dataTypes.String:
                case common.dataTypes.Bit:
                case common.dataTypes.SystemEntity:
                    self.FormattedValueText = ko.computed({
                        read: function () {
                            return self.SearchValue();
                        },
                        write: function (value) {
                            self.SearchValue(value);
                        },
                        owner: this
                    });
                    break;
                case common.dataTypes.DateTime:
                    self.FormattedValueText = ko.computed({
                        read: function () {
                            if (self.SearchValue())
                                return new Date(self.SearchValue());
                            else
                                return new Date();
                        },
                        write: function (value) {
                            self.SearchValue(value); //TODO:to string format
                        },
                        owner: this
                    });
                    break;
                default:
                    //TODO:
            }

            switch (option.Name.toLowerCase()) {
                case '[credentialnumber]':
                    option.SearchValue == "" ? self.IsAll('All') : self.IsAll('');
                    break;
            }
            //this.LoadPossibleValues();

            var result = datacontext.get_possible_conditions_by_DataType(option.DataType);
            if (!result) {
            }
            else {
                ko.mapping.fromJS(result, conditionMapping, self);
            }
        }

        self.LoadPossibleValues = function (cb) {
            //TODO:validations
            if (self.HasPossibleValue()) {
                datacontext.get_possible_filter_vlaues(self.Id()).done(function (jsondata) {
                    self.PossibleValues.push.apply(self.PossibleValues, jsondata.PossibleValues.map(function (item) {
                        return new PossibleValueModel(item);
                    }));

                    if (self.PossibleValues().length > 0 && self.SearchValue()) {
                        var values = self.SearchValue().split(',');
                        if (values.length > 0) {
                            ko.utils.arrayForEach(self.PossibleValues(), function (item) {
                                if (values.indexOf(item.Id()) != -1) {
                                    item.IsSelected(true);
                                }
                            });
                            //self.SearchValue('');
                        }
                    }
                    self.IsLoaded(true);
                    cb();
                });
            }
            else {
                self.IsLoaded(true);
                cb();
            }
        }



        self.CheckAllValues = function () {
            ko.utils.arrayForEach(self.PossibleValues(), function (item) {
                item.IsSelected(self.IsAll());
            });
            return true;
        }
        self.CheckEntitiyValue = function (userModel) {
            var isSelected = userModel.IsSelected();
            if (isSelected) {
                isSelected = !(_.some(self.PossibleValues(), function (user) {
                    return !user.IsSelected();
                }));
            }
            self.IsAll(isSelected);
            return true;
        }
        self.deleteonly = function () {
            var keyCode = (event.which) ? event.which : event.keyCode;
            if ((keyCode == 8) || (keyCode == 46))
                event.returnValue = true;
        }
        self.toJson = function () {
            return ko.toJSON(self);
        }

        this.Initialize(data);
    }
    var AuditReportUserListModel = function (data) {
        var self = this;
        data = data || {};
        var mapping = {};
        self.UserId = ko.observable();
        self.UserName = ko.observable();
        self.AccountId = ko.observable();
        self.IsSelected = ko.observable(false);
        // self.AuditReportUserList = ko.observableArray([]);
        self.Initialize = function (option) {
            ko.mapping.fromJS(option, mapping, self);
        }

        self.toJson = function () {
            return ko.toJSON(self);
        }

        this.Initialize(data);

    }
    var OutputModel = function (data) {
        var self = this;
        data = data || {};
        self.IsSelected = ko.observable(false);
        var mapping = {};

        self.Initialize = function (option) {
            ko.mapping.fromJS(option, mapping, self);
            if (option.IsMandatory) {
                self.IsSelected(option.IsMandatory);
            }
        }

        self.toJson = function () {
            return ko.toJSON(self);
        }

        self.deleteonly = function () {
            var keyCode = (event.which) ? event.which : event.keyCode;
            if ((keyCode == 8) || (keyCode == 46))
                event.returnValue = true;
        }
        this.Initialize(data);
    }

    var ReportsUsersListModel = function (data) {
        var self = this;
        data = data || {};
        self.IsSelected = ko.observable(false);
        var mapping = {};

        self.Initialize = function (option) {
            ko.mapping.fromJS(option, mapping, self);
            if (option.IsMandatory) {
                self.IsSelected(option.IsMandatory);
            }
        }

        self.toJson = function () {
            return ko.toJSON(self);
        }

        this.Initialize(data);
    }

    var OutputSortOrderModel = function (data) {
        var self = this;
        data = data || {};
        self.AvailableOutputs = ko.observableArray([]);
        self.Id = ko.observable(data.Id);
        self.SortOrder = ko.observable(data.SortOrder);
        self.TooltipMessage = ko.observable(Resources.Ascending);
        self.PossibleOutputs = ko.computed(function () {
            return ko.utils.arrayFilter(self.AvailableOutputs(), function (output) {
                return output.IsSelected();
            });
        });
        self.ToggleSortOrder = function () {
            self.SortOrder(self.SortOrder() ? common.sortOrder.Asc : common.sortOrder.Desc);
            self.TooltipMessage(self.SortOrder() ? Resources.Descending : Resources.Ascending);
        }

        self.Initialize = function (option) {
        }


        self.toJson = function () {
            return ko.toJSON(self);
        }

        self.deleteonly = function () {
            var keyCode = (event.which) ? event.which : event.keyCode;
            if ((keyCode == 8) || (keyCode == 46))
                event.returnValue = true;
        }
        this.Initialize(data);
    }

    var ReportDetailModel = function (data, reportGroupName) {
        var self = this;
        var eventFilter = '';
        data = data || {};
        self.IsAllAuditUser = ko.observable(false);       
        self.reportGroupName = reportGroupName;
        self.selectedOutputsText = ko.observable();
        self.ExportType = ko.observable();
        self.timezone = ko.observable(null);
        self.IsLoading = ko.observable(false);
        self.IsError = ko.observable(false);
        self.ErrorMessage = ko.observable('');
        self.ScheduleOn = ko.observable();
        self.selectedReportUsers = ko.observable();
        self.selectedReportUsersCount = ko.observable();
        self.IsAllUsersSelected = ko.observable(false); // "& Send To" - Select All Users
        self.IsAllColumnsSelected = ko.observable(false); // "Select Columns - Select All Columns
        self.dashboardEvents = ko.observableArray([]);
        self.auditReportUserList = ko.observableArray([]);
        self.auditReportAllUserList = ko.observableArray([]);
        this.Events = ko.observableArray([]);
        self.isPopupOpen = ko.observable(false);
        self.isUserPopupOpen = ko.observable(false);
        self.isOutputPopupOpen = ko.observable(false);
        this.Entities = ko.observableArray([]);
        this.DirtyEntities = ko.observableArray([]);
        self.SelectedSite = ko.computed(function () {
            if (this.Entities().length > 0)
                if (this.Entities().length == 1)
                    return this.Entities().length.toString() + ' site selected';
                else
                    return this.Entities().length.toString() + ' sites selected';
            else
                return "No Site Selected";
        }, this);
        this.treeview = new TreeViewModel({
            baseUrl: $('#reportMgmturl').val(),
            expandableNodeTypes: ['SITE', 'GROUP', 'CUSTOMER', 'GENERAL', 'ROOT', 'DEALER'],
            depth: 1, selectedEntities: this.selectedEntities, DirtyEntities: this.DirtyEntities
        });

        var mapping = {
            'FilterFields': {
                key: function (data) {
                    return ko.utils.unwrapObservable(data.Id);
                },
                create: function (options) {
                    return new FilterModel(options.data);
                }
            },
            'OutputFields': {
                key: function (data) {
                    return ko.utils.unwrapObservable(data.Id);
                },
                create: function (options) {
                    return new OutputModel(options.data);
                }
            },
            'OuputSortOrder': { //Typo - Change it in ReportEntity 
                key: function (data) {
                    return ko.utils.unwrapObservable(data.Id);
                },
                create: function (options) {
                    return new OutputSortOrderModel(options.data);
                }
            },
            'ReportsUsersList': {
                key: function (data) {
                    return ko.utils.unwrapObservable(data.Id);
                },
                create: function (options) {
                    return new ReportsUsersListModel(options.data);
                }
            },
            'AuditReportUserList': {
                key: function (data) {
                    return ko.utils.unwrapObservable(data.Id);
                },
                create: function (options) {
                    return new AuditReportUserListModel(options.data);
                }

            }
        };
        self.convertToLocalTime = function (value) {
            var date = typeof (value) === 'string' ? (value.indexOf('/Date') >= 0 ? new Date(value.match(/\d+/)[0] * 1) : new Date(value)) : value;
            return new Date(date + ' UTC').toString('yyyy-MM-dd HH:mm:ss')
            // return date ? moment.utc(date).toDate() : null;
        }

        self.Initialize = function (options) {
            //if (options.IsDefault == true || options.Id == null)
            //    options.ScheduleOn = new Date();
            //else
            //    options.ScheduleOn = this.convertToLocalTime(options.ScheduleOn)
            
            options.ScheduleOn = options.ScheduleOn || new Date();
            ko.mapping.fromJS(options, mapping, self);
            self.IsAllColumnsSelected(true);
            self.onSelectAllColumns();
            self.loadFilterPossibleValues();
            self.CreateOutputSortOrder();
            self.setSelectedOutputsText();
            self.setReportsUsersListText();
            self.treeview.on(window.reportmgmt.common.events.report_treeview_expanded, this.onTreeviewExpand);
            if (reportGroupName != null && reportGroupName == 'AUDIT REPORTS') {
                self.getAllReportEvents(function () {
                    self.initializeAuditUserAction();
                });
                self.initializeAccountFilter();
                self.getAllAuditReportUserListFilter(function () {
                    self.initializeAuditReportUserListFilter();
                });
            }
            else if (reportGroupName != null && reportGroupName == 'CARD REPORTS') {
                self.initializeAccountFilter();
            }
            else if (reportGroupName != null && reportGroupName == 'EVENT REPORTS') {
                self.getAllReportEvents(function () {
                    self.treeview.setRootNodeData({});
                    self.initializeReportmgmt();
                });
            }



        }

        self.loadFilterPossibleValues = function () {
            var filterCount = self.FilterFields().length;
            var index = 0;
            ko.utils.arrayForEach(self.FilterFields(), function (ff) {
                ff.LoadPossibleValues(function () {
                    if (++index == filterCount) {
                        self.initializeTimezoneFilter();
                    }
                });
            });
        }

        self.onTreeviewExpand = function (node) {
            if (node && node.Children().length > 0) {
                _.each(node.Children(), function (item) {
                    _.each(self.Entities(), function (e) {
                        if (item.Entity.Id() == e.Id && item.Entity.EntityType() == e.EntityType) {
                            item.selectNode(true);
                        }
                    });
                });
            }
        },

        self.getAllReportEvents = function (cb) {
            var self = this;
            if (reportGroupName != null && (reportGroupName == 'EVENT REPORTS')) {
                datacontext.get_event_categories().done(function (result) {
                    if (result.Success) {
                        self.dashboardEvents(_.map(result.data || [], function (category) {
                            return new DashboardEventCategoryModel(category);
                        }));
                    }
                    if (cb) { cb(); }
                });
            }
            if (reportGroupName != null && (reportGroupName == 'AUDIT REPORTS')) {
                datacontext.get_audituseraction_categories().done(function (result) {
                    if (result.Success) {
                        self.dashboardEvents(_.map(result.data || [], function (category) {
                            return new DashboardEventCategoryModel(category);
                        }));
                    }
                    if (cb) { cb(); }
                });
            }
        }

        self.getAllAuditReportUserListFilter = function (cb) {
            var self = this;
            datacontext.get_auditreport_userListfilter().done(function (result) {
                if (result.Success) {
                    self.auditReportAllUserList(_.map(result.data || [], function (userList) {
                        return new AuditReportUserListModel(userList);
                    }));
                    //to retain already saved account and load corresponding user list
                    var selectedAccount = self.get_value_by_filterId('[Account]').SearchValue();
                    if (typeof selectedAccount != 'undefined') {
                        self.auditReportUserList(ko.utils.arrayFilter(self.auditReportAllUserList(), function (item) {
                            return item.AccountId() == selectedAccount;
                        }));
                    }
                    else {
                        self.auditReportUserList(self.auditReportAllUserList());
                    }
                }
                if (cb) { cb(); }
            });
        }
        self.initializeAuditReportUserListFilter = function () {
            var self = this;
            if (reportGroupName != null && reportGroupName == 'AUDIT REPORTS') {
                auditUserListFilter = _.find(self.FilterFields(), function (item) {
                    return item.Name() == '[SystemUserDisplayName]';
                });
                if (auditUserListFilter.SearchValue() != "") {
                    var auditUserListValues = auditUserListFilter.SearchValue().split(',');
                    _.each(auditUserListValues, function (s) {
                        _.each(self.auditReportUserList(), function (e) {
                            if (e.UserId() == s) {
                                e.IsSelected(true);
                            }
                        });
                    });
                }
            }
        }

        self.onAccountChange = function () {
            var self = this;
            var selectedAccount = self.get_value_by_filterId('[Account]').SearchValue();
            if (typeof selectedAccount != 'undefined') {
                self.auditReportUserList(ko.utils.arrayFilter(self.auditReportAllUserList(), function (item) {
                    return item.AccountId() == selectedAccount;
                }));
            }
            else {
                self.auditReportUserList(self.auditReportAllUserList());
            }
        }


        self.onSelectAllUserFilter = function () {
            _.each(this.auditReportUserList(), function (column) {
                column.IsSelected(this.IsAllAuditUser());
            }, this);
            return true;
        }

        self.onSelectUserFilter = function (userModel) {
            var isSelected = userModel.IsSelected();
            if (isSelected) {
                isSelected = !(_.some(self.auditReportUserList(), function (user) {
                    return !user.IsSelected();
                }));
            }
            self.IsAllAuditUser(isSelected);
            return true;
        }
       
        self.initializeReportmgmt = function () {
            var self = this;

            if (reportGroupName!=null && reportGroupName == 'EVENT REPORTS') {
                    eventFilter = _.find(self.FilterFields(), function (item) {
                        return item.Name() == '[SecurityCategoryEventDescription]';
                    });

                var eventValues = eventFilter.SearchValue().split(',');
                _.each(eventValues, function (e) {
                    var eventModel = self.findEventByCode(e);
                    if (eventModel != null) {
                        eventModel.IsSelected(true);
                        self.Events.push(eventModel.EventCode());
                        self.changeParentSelection(eventModel.parent, true);
                    }
                });

                var siteFilter = _.find(self.FilterFields(), function (item) {
                    return item.Name() == '[Site]';
                });
                if (siteFilter.SearchValue()) {
                    datacontext.get_accounts_by_id(siteFilter.SearchValue()).done(function (json) {
                        if (json.Success) {
                            self.Entities(json.data || []);
                        }
                    });
                }
            }
        }
        self.initializeAuditUserAction = function () {
            var self = this;
            if (reportGroupName != null && reportGroupName == 'AUDIT REPORTS') {
                eventFilter = _.find(self.FilterFields(), function (item) {
                    return item.Name() == '[OperatorCategoryEventDescription]';
                });
                var eventValues = eventFilter.SearchValue().split(',');
                _.each(eventValues, function (e) {
                    var eventModel = self.findEventByCode(e);
                    if (eventModel != null) {
                        eventModel.IsSelected(true);
                        self.Events.push(eventModel.EventCode());
                        self.changeParentSelection(eventModel.parent, true);
                    }
                });
            }
        }
        self.initializeAccountFilter = function () {
            var self = this;
            if (reportGroupName != null && (reportGroupName == 'AUDIT REPORTS' || reportGroupName == 'CARD REPORTS')) {
                var selectedAccount = self.get_value_by_filterId('[Account]').SearchValue();
                if (typeof selectedAccount != 'undefined') {
                    var splitAccounts = selectedAccount.split(',');
                    if (splitAccounts.length > 1)
                        self.get_value_by_filterId('[Account]').SearchValue("");
                }
            }
        }
        self.onEventCategorySelection= function (eventCategory) {
            self.changeChildSelection(eventCategory, eventCategory.IsSelected());
            self.changeParentSelection(eventCategory.parent, eventCategory.IsSelected());
            return true;
        },
         self.onEventSelection = function (eventModel) {
             self.addOrRemoveEventCodes(eventModel);
             self.changeParentSelection(eventModel.parent, eventModel.IsSelected());
             return true;
         },
         self.addOrRemoveEventCodes = function (eventModel) {
             if (eventModel.IsSelected()) {
                 self.Events.push(eventModel.EventCode());
             }
             else {
                 self.Events.remove(eventModel.EventCode());
             }
         },
         self.changeParentSelection = function (ev, isSelected) {
             if (ev) {
                 if (isSelected) {
                     var list = ev.Categories().length > 0 ? ev.Categories() : ev.Events();
                     var unSelectedEv = _.find(list, function (ev) { return ev.IsVisible() && !ev.IsSelected(); });
                     if (!unSelectedEv) {
                         ev.IsSelected(isSelected);
                         self.changeParentSelection(ev.parent, isSelected);
                     }
                 }
                 else {
                     ev.IsSelected(isSelected);
                     self.changeParentSelection(ev.parent, isSelected);
                 }
             }
         }
        self.changeChildSelection = function (evc, isSelected) {
            _.each(evc.Categories(), function (ctgry) {
                ctgry.IsSelected(evc.IsSelected());
                self.changeChildSelection(ctgry, isSelected);
            }, this);
            _.each(evc.Events(), function (ev) {
                ev.IsSelected(evc.IsSelected());
                self.addOrRemoveEventCodes(ev);
            }, this);
        }
        self.onCategoryExpand = function (category) {
            category.IsExpanded(!category.IsExpanded());
            return true;
        }
        self.findEventByCode = function (eventCode) {
            return this.findEventByCodeInCategory(parseInt(eventCode))[0];
        }
        self.findEventByCodeInCategory = function (eventCode, category, result) {
            result = result || [];
            if (category) {
                _.each(category.Events(), function (e) {
                    if (e.EventCode() == eventCode) {
                        result.push(e);
                    }
                });
                if (result.length == 0) {
                    _.each(category.Categories(), function (c) {
                        this.findEventByCodeInCategory(eventCode, c, result)
                    }, this);
                }
            }
            else {
                _.each(this.dashboardEvents(), function (c) {
                    this.findEventByCodeInCategory(eventCode, c, result)
                }, this);
            }
            return result;
        }


        self.onPopoverCancelClick = function (data, event) {
            this.isPopupOpen(false);
        }

        self.onPopoverConfirmClick = function () {
         
            var self = this;

            var err = this.setSelectedEntities(function(){

            if (!err) {
                self.isPopupOpen(false);
            }
            else {
                alertify.alert(err);
                //  this.publish(window.dashboardconfig.siteevents.add_entity_error, err);
            }
            });
        }

        self.setSelectedEntities = function (cb) {
            var self = this;
            var entities = [];
          //  _.each(this.Entities(), function (e) { entities.push(e); }, this);
            this.treeview.forEachNode(function (node) {
                var nData = _.find(entities, function (e) {
                    return e.Id == node.Entity.Id() && e.EntityType == node.Entity.EntityType();
                });
                if (node.IsSelected() && !nData) {
                    entities.push(node.toJson());
                }
                else if (!node.IsSelected() && nData) {
                    entities.splice(entities.indexOf(nData), 1);
                }
            });
       
         
            var accountIDs = [];
            var siteAccountIDs = [];
            _.each(entities, function (e) {
                accountIDs.push(e.Id)
            });
            self.Entities([]);
            
            if (accountIDs.length > 0) {
                var result = datacontext.get_sites_by_accountids(accountIDs).done(function (json) {
                    if (json && json.length>0) {
                        self.Entities(json || []);
                    
                        _.each(json, function (e) {
                            siteAccountIDs.push(e.Id);
                        });
                        var reportId = self.Id() || '';
                        var siteusers = datacontext.get_report_users(reportId, siteAccountIDs).done(function (json) {
                            if (json && json.ReportsUsersList.length > 0) {
                                ko.mapping.fromJS(json, mapping, self);
                                self.setReportsUsersListText();
                            }
                            else {
                                self.ReportsUsersList([]);
                                self.setReportsUsersListText();
                                alertify.alert('No users have permission to selected sites');
                            }
                        });
                    }
                    else {
                        self.Entities([]);
                        alertify.alert(Resources.EventReport_SiteSelectionError);
                    }
                    if (cb) { cb(); }
                });                         
                
            }
            else 
                alertify.alert(Resources.Eventreport_Selecterror);
           
           
        }

        self.removeEntity = function (entity) {
            self.Entities.remove(entity);
            if (self.DirtyEntities.indexOf(entity.Id) == -1)
                self.DirtyEntities.push(entity.Id);
            var nodes = self.treeview.getNodes(function (node) {
                return node.Entity.Id() == entity.Id && node.Entity.EntityType() == entity.EntityType;
            });
            if (nodes.length > 0) {
                nodes[0].selectNode(false);
            }
        }

        self.get_value_by_filterId = function (id) {

            /*---------------Property check for making sure 'FilterFields' has already been created-----------------------*/
            if (!("FilterFields" in self)) {
                return;
            }
            return ko.utils.arrayFirst(self.FilterFields(), function (item) {
                return item.Name().toLowerCase() == id.toLowerCase();
            });
        }

        self.get_outputsortorder_by_index = function (id) {
            /*---------------Property check for making sure 'FilterFields' has already been created-----------------------*/
            if (!("OuputSortOrder" in self)) {
                return;
            }
            return ko.utils.arrayFirst(self.OuputSortOrder(), function (item) {
                return item.SortOrderIndex == id;
            });
        }

        self.showpreview = function () {
            window.reportmgmt.uicontext.show_preview_page(self);
        }

        self.exportReport = function () {
            window.reportmgmt.uicontext.export_report(self);
        }

        self.savereport = function () {
            window.reportmgmt.uicontext.save_report(self, function (result) {
                if (!result.Success) {
                    self.IsError(true);
                    self.ErrorMessage(result.ErrorMessage);
                }
                else {
                    self.ErrorMessage('');
                    self.Id(result.Id);
                    window.reportmgmt.uicontext.close_report_page();
                }
            });
        }

        self.generatereport = function () {
            var model = this.getmodel(this.clone(self));
            datacontext.generate_report(model);
        }

        self.closepopup = function () {
            window.reportmgmt.uicontext.close_report_popup();
        }


        /* "& Send To" - Select All Users - Start */

        self.onSelectAllUsers = function () {
            _.each(this.ReportsUsersList(), function (user) {
                user.IsSelected(this.IsAllUsersSelected());
            }, this);
            return true;
        }

        self.onSelectUser = function (userModel) {
            var isSelected = userModel.IsSelected();
            if (isSelected) {
                isSelected = !(_.some(self.ReportsUsersList(), function (user) {
                    return !user.IsSelected();
                }));
            }
            self.IsAllUsersSelected(isSelected);
            return true;
        }

        /* "& Send To" - Select All Users - End */

        /* Select Output Column - Select All Columns - Start */

        self.onSelectAllColumns = function () {
            _.each(this.OutputFields(), function (column) {
                column.IsSelected(this.IsAllColumnsSelected());
                if (column.IsMandatory() == true) {
                    column.IsSelected(true);
                }
            }, this);
            return true;
        }

        self.onSelectColumn = function (columnModel) {
            var isSelected = columnModel.IsSelected();
            if (isSelected) {
                isSelected = !(_.some(self.OutputFields(), function (column) {
                    return !column.IsSelected();
                }));
            }
            self.IsAllColumnsSelected(isSelected);
            return true;
        }

        /* Select Output Column - Select All Columns - End */

        self.setSelectedOutputsText = function () {
            var outputsText = '';
            ko.utils.arrayForEach(self.OutputFields(), function (output) {
                var text = output.IsSelected() ? output.DisplayName() : '';
                if (text) {
                    if (outputsText)
                        outputsText = outputsText + ',';
                    outputsText = outputsText + text;
                }
            });
            self.selectedOutputsText(outputsText);
        }
        self.closeOutputSelector = function () {
            self.setSelectedOutputsText();
            self.isOutputPopupOpen(false);
            //window.reportmgmt.uicontext.close_output_selector();
        }

        self.setReportsUsersListText = function () {
            var selectedUsersCount = 0;
            ko.utils.arrayForEach(self.ReportsUsersList(), function (user) {
                if (user.IsSelected()) {
                    selectedUsersCount = selectedUsersCount + 1;
                }
            });
            self.selectedReportUsersCount(selectedUsersCount);
            self.selectedReportUsers('Users Selected: ' + selectedUsersCount);
        }
        self.closeReportsUsersSelector = function () {
            self.setReportsUsersListText();

            self.isUserPopupOpen(false);
            //window.reportmgmt.uicontext.close_reportusers_selector();
        }

        self.CreateOutputSortOrder = function () {
            //TODO:this should come from UI
            var maxSortCount = 3;

            if ('OuputSortOrder' in self) {
                while (self.OuputSortOrder().length < maxSortCount) {
                    self.OuputSortOrder.push(new OutputSortOrderModel({ SortOrder: common.sortOrder.Asc }));
                }

                ko.utils.arrayForEach(self.OuputSortOrder(), function (item) {
                    item.AvailableOutputs.push.apply(item.AvailableOutputs, self.OutputFields());
                });
            }
        }
        self.initializeTimezoneFilter = function () {
            var tzFilter = self.get_value_by_filterId('[Timezone]');
            if (tzFilter.SearchValue()) {
                var tz = ko.utils.arrayFirst(tzFilter.PossibleValues(), function (val) {
                    return val.Id() == tzFilter.SearchValue();
                });
                self.timezone(tz && tz.Value());
            }
        }
        self.toJson = function () {
            var model = this.clone(self);

            var eventFilter = '', eventAccountFilter = '', auditUserListFilter = '';
            var eventValues = "", siteValues = "", auditUserListValues = "";
            if (reportGroupName != null && reportGroupName == 'EVENT REPORTS') {
                eventFilter = _.find(model.FilterFields(), function (item) {
                    return item.Name() == '[SecurityCategoryEventDescription]';
                });
                eventAccountFilter = _.find(model.FilterFields(), function (item) {
                    return item.Name() == '[Site]';
                });

                ko.utils.arrayForEach(self.Events(), function (val) {
                    if (eventValues == "")
                        eventValues = val;
                    else
                        eventValues = eventValues + ',' + val;
                });
                eventFilter.SearchValue(eventValues);

                ko.utils.arrayForEach(self.Entities(), function (val) {
                    if (siteValues.toString() == "")
                        siteValues = val.Id;
                    else
                        siteValues = siteValues + ',' + val.Id;
                });
                eventAccountFilter.SearchValue(siteValues);

            }
            else if (reportGroupName != null && reportGroupName == 'AUDIT REPORTS') {
                eventFilter = _.find(model.FilterFields(), function (item) {
                    return item.Name() == '[OperatorCategoryEventDescription]';
                });
                ko.utils.arrayForEach(self.Events(), function (val) {
                    if (eventValues == "")
                        eventValues = val;
                    else
                        eventValues = eventValues + ',' + val;
                });
                eventFilter.SearchValue(eventValues);

                auditUserListFilter = _.find(model.FilterFields(), function (item) {
                    return item.Name() == '[SystemUserDisplayName]';
                });

                ko.utils.arrayForEach(self.auditReportUserList(), function (val) {
                    if (val.IsSelected()) {
                        if (auditUserListValues == "")
                            auditUserListValues = val.UserId();
                        else
                            auditUserListValues = auditUserListValues + ',' + val.UserId();
                    }
                });
                if (auditUserListValues == '') {
                    ko.utils.arrayForEach(self.auditReportUserList(), function (val) {
                        if (auditUserListValues == "")
                            auditUserListValues = val.UserId();
                        else
                            auditUserListValues = auditUserListValues + ',' + val.UserId();
                    });
                }

                auditUserListFilter.SearchValue(auditUserListValues);

            }



            if (!model) {
            }
            else {
                var filters = ko.utils.arrayFilter(model.FilterFields(), function (item) {
                    var possibleValues = '';

                    ko.utils.arrayForEach(item.PossibleValues(), function (val) {
                        if (item.Name() == '[SecurityCategoryEventDescription]') {
                            possibleValues = eventValues;
                        }
                        if (item.Name() == '[OperatorCategoryEventDescription]') {
                            possibleValues = eventValues;
                        }
                        else if (item.Name() == '[Site]') {
                            possibleValues = siteValues;
                        }
                        else if (item.Name() == '[SystemUserDisplayName]') {
                            possibleValues = auditUserListValues;
                        }
                        else if (item.Name() == '[Timezone]') {
                            var tz = ko.utils.arrayFirst(item.PossibleValues(), function (val) {
                                return val.Value() == self.timezone();
                            });
                            possibleValues = tz && tz.Id();
                        }
                        else if (item.Name() == "[Account]") {
                            possibleValues = item.SearchValue();
                        }
                        else if (item.Name() == "[CredentialStatus]") {
                            possibleValues = item.SearchValue();
                        }
                        else {
                            if (val.IsSelected()) {
                                if (possibleValues == "") {
                                    possibleValues = val.Id();
                                }
                                else {
                                    possibleValues = possibleValues + ',' + val.Id();
                                }
                            }
                        }
                    });
                    if (possibleValues) {
                        item.SearchValue(possibleValues);
                    }
                    else if (item.DataType() == common.dataTypes.DateTime) {
                        if (item.StartDate()) {
                            var dateString = self.toFormattedDateTime(item.StartDate());
                            if (item.EndDate()) {
                                dateString = dateString + '~' + self.toFormattedDateTime(item.EndDate());
                                item.ConditionId("B39219C3-8C66-4890-AD90-58E46EC5B5AB");
                            }
                            item.SearchValue(dateString);
                        }
                        else {
                            item.SearchValue('');
                        }
                    }
                    if (item.IsAll() == "All" || !item.SearchValue()) {
                        return false;
                    }
                    else {
                        return true;
                    }
                });

                model.FilterFields.removeAll();

                if (filters)
                    model.FilterFields.push.apply(model.FilterFields, filters);



                var outputFields = ko.utils.arrayFilter(model.OutputFields(), function (item) {
                    return item.IsSelected();
                });

                model.OutputFields.removeAll();

                if (outputFields)
                    model.OutputFields.push.apply(model.OutputFields, outputFields);
                //report users
                var reportsUsersList = ko.utils.arrayFilter(model.ReportsUsersList(), function (item) {
                    return item.IsSelected();
                });

                model.ReportsUsersList.removeAll();

                if (reportsUsersList)
                    model.ReportsUsersList.push.apply(model.ReportsUsersList, reportsUsersList);

                var outputsSortOrder = ko.utils.arrayFilter(model.OuputSortOrder(), function (item) {
                    return item.Id();
                });

                outputsSortOrder = _.unique(outputsSortOrder || [], function (item) {
                    return item.Id();
                });

                model.OuputSortOrder.removeAll();

                if (outputsSortOrder)
                    model.OuputSortOrder.push.apply(model.OuputSortOrder, outputsSortOrder);

                var cardNumberFilter = ko.utils.arrayFirst(model.FilterFields(), function (item) {
                    return item.Name().toLowerCase() == '[CredentialNumber]'.toLowerCase();
                });
                if (cardNumberFilter) {
                    //cardNumberFilter.DataType(common.dataTypes.Int);
                    //TODO:change to tilde
                    if (cardNumberFilter.SearchValue().toString().indexOf('-') != -1) {
                        cardNumberFilter.ConditionId("B39219C3-8C66-4890-AD90-58E46EC5B5AB");
                    }
                }

                ko.utils.arrayForEach(model.FilterFields(), function (item) {
                    //TODO:cardholder name might contain ',' 
                    if (item.SearchValue().toString().indexOf(',') != -1) {
                        item.ConditionId("B49219C3-8C66-4890-AD90-58E46EC5B5AB");
                    }
                });



                var ScheduleOnDate = moment(model.ScheduleOn()).utc().format('YYYY-MM-DD HH:mm:ssZ');
                model.ScheduleOn(ScheduleOnDate);

                if (self.timezone()) {
                    ko.utils.arrayForEach(model.OutputFields(), function (of) {
                        if (["[EventTime]", "[AuditLogEventTime]"].indexOf(of.Name()) >= 0) {
                            if (of.OutputPattern() && of.OutputPattern().split(',').length == 3) {
                                var patternParts = of.OutputPattern().split(',');
                                //patternParts[2] = "'" + moment(new Date()).zone(self.getOffset(self.timezone())).format('Z') + "'";
                                patternParts[2] = "'" + moment(new Date()).zone(self.getOffset(self.timezone())).format('Z') + "'";
                                of.OutputPattern(patternParts.join(','));
                            }
                        }
                    });
                }

                return ko.mapping.toJSON(model, { ignore: ['treeview', 'dashboardEvents', '__ko_mapping__'] });
            }
        }

        self.toFormattedDateTime = function (date) {
            var format = 'YYYY-MM-DD HH:mm:ss';
            if (date) {
                var mDate = moment(date);
                if (mDate.isValid()) {
                    var offset = self.getOffset(self.timezone());
                    if (offset) {
                        return moment(date).format(format) + offset;
                    }
                    else {
                        return moment(date).format(format + 'Z');
                    }
                }
            }
        }

        self.getOffset = function(timeZoneDesc) {
            var timezone = self.timezone();
            var offset;
            if(timezone && timezone.indexOf('(UTC') == 0 && timezone.indexOf(')') > 0) {
                offset = timezone.substring(4, timezone.indexOf(')'));
            }
            return offset || '+00:00';
        }

        self.clone = function (object) {
            return ko.mapping.fromJS(ko.toJS(object));
        }

        self.deleteonly = function () {
            var keyCode = (event.which) ? event.which : event.keyCode;
            if ((keyCode == 8) || (keyCode == 46))
                event.returnValue = true;
        }



        this.Initialize(data);
    }

    var ReportModel = function (data) {        
        var self = this;
        data = data || {};
        self.Id = ko.observable(data.Id);
        self.Name = ko.observable(data.Name);       
        self.IsDefault = ko.observable(data.IsDefault);
        self.ReportDeliverySuccessCount = ko.observable(data.ReportDeliverySuccessCount);
        self.ReportDeliveryFailCount = ko.observable(data.ReportDeliveryFailCount);
        self.ReportSchedule = ko.observable(data.ReportSchedule);
        self.ReportScheduleDisplay = ko.observable(data.ReportScheduleDisplay);
        self.ReportStatusCompute = ko.observable(data.ReportStatus);
        self.ScheduleOn = ko.observable(data.ScheduleOn);
        self.ReportScheduleText = ko.computed(function () {
            switch (self.ReportSchedule()) {
                case 'Daily':
                    return self.ReportScheduleDisplay() + ' : ' + self.formatDate(self.ScheduleOn(), 'HH:MM:ss');
                    return 
                    break;
                case 'Weekly':
                    return self.ReportScheduleDisplay() + ' : ' + self.formatDate(self.ScheduleOn(), 'dddd');
                    break;
                case 'Monthly':
                    return self.ReportScheduleDisplay() + ' : ' + self.formatDate(self.ScheduleOn(), 'dd') + ' th';
                    break;
            }
            return '';
        });


        self.ReportStatus = ko.computed(function () {
            if (self.ReportStatusCompute() == true)
                return "Active";
            else
                return "Disable";
        });
        self.CssClass = ko.computed(function () {
            var cssClassText = '';
            if (self.ReportStatus() === "Active") {
                cssClassText = "successText";
            }
            else {
                cssClassText = "failText"
            }
            return cssClassText;
        });
        self.IsVisible = ko.computed(function () {
            if (self.IsDefault() == true)
                return false
            else
                return true;
        });
        self.deleteonly = function () {
            var keyCode = (event.which) ? event.which : event.keyCode;
            if ((keyCode == 8) || (keyCode == 46))
                event.returnValue = true;
        }
        self.showpreviewstatus = function () {
            window.reportmgmt.uicontext.show_preview_statuspage(self.Id(), self.ReportDeliverySuccessCount(), self.ReportDeliveryFailCount());
        }
        self.formatDate = function (value, format) {
            return moment.utc(value.match(/\d+/)[0] * 1).toDate().format(format);
        }
    }

    var ReportGroupModel = function (data) {      
        var self = this;
        data = data || {};

        var mapping = {
            'Reports': {
                key: function (data) {
                    return ko.utils.unwrapObservable(data.Id);
                },
                create: function (options) {
                    return new ReportModel(options.data);
                }
            }
        };

        self.Initialize = function (option) {
            ko.mapping.fromJS(option, mapping, self);
        }

        self.editreport = function (data, event) {
            window.reportmgmt.uicontext.show_report_page({ reportId: data.Id(), reportGroupId: self.Id(), reportGroupName: self.Name() });
        }

        self.deletereport = function (data) {
            try {
                alertify.confirm(Resources.Do_you_want_delete, function (e) {
                    if (e) {

                        datacontext.delete_report(data).done(function (result) {
                            if (result.Success) {
                                self.Reports.mappedRemove({ Id: data.Id() });
                            }
                            else {
                                alertify.error(result.ErrorMessage);
                            }

                        }).fail(function (err) {
                            data.IsLoading(false);
                            alertify.error(result.ErrorMessage);
                        });
                    }
                });
            } catch (e) {
                console.error(e);
            }
        }

        self.toJson = function () {
            return ko.toJSON(self);
        }

        self.deleteonly = function () {
            var keyCode = (event.which) ? event.which : event.keyCode;
            if ((keyCode == 8) || (keyCode == 46))
                event.returnValue = true;
        }

        this.Initialize(data);
    }

    var ReportGroupListModel = function (data) {       
        var self = this;
        data = data || {};
        self.AccountId = data.AccountID;

        var mapping = {
            'ReportGroups': {
                key: function (data) {
                    return ko.utils.unwrapObservable(data.Id);
                },
                create: function (options) {
                    return new ReportGroupModel(options.data);
                }
            }
        };

        self.Initialize = function (option) {
            ko.mapping.fromJS(option, mapping, self);
        }

        self.createReport = function (data, event) {
            window.reportmgmt.uicontext.show_report_page();
        }


        self.goback = function (data, event) {
            window.reportmgmt.uicontext.show_reportindex_page('')
        }
        self.toJson = function () {
            return ko.toJSON(self);
        }

        self.deleteonly = function () {
            var keyCode = (event.which) ? event.which : event.keyCode;
            if ((keyCode == 8) || (keyCode == 46))
                event.returnValue = true;
        }

        this.Initialize(data);
    }

    var ReportPreviewModel = function (data) {
        this.Columns = ko.observableArray();
        this.Rows = ko.observableArray();
        this.showNoRecords = ko.observable(false);
        this.MsgNoRecord = ko.observable();
        this.dataSource = function (value) {
            value = value || {};
            this.Columns(value.Columns || []);
            this.Rows(value.Rows || []);
            if (value.Rows.length < 1) {
                this.showNoRecords(true);
                this.MsgNoRecord("No records found");
            }
            else {
                this.showNoRecords(false);
                this.MsgNoRecord();
            }

        };
        this.reset = function () {
            this.Rows([]);
            this.Columns([]);
            this.showNoRecords(false);
            this.MsgNoRecord();
        };
        this.closepopup = function () {
            this.reset();
            window.reportmgmt.uicontext.close_report_popup();
        };

        self.deleteonly = function () {
            var keyCode = (event.which) ? event.which : event.keyCode;
            if ((keyCode == 8) || (keyCode == 46))
                event.returnValue = true;
        }

        this.dataSource(data);
    }
    var ReportStatusModel = function (data, successcount, failurecount) {

        this.DeliveryHistory = ko.observableArray();
        this.successcount = ko.observable();
        this.failurecount = ko.observable();
        this.dataSource = function (value, scount, fcount) {
            var formattedValue = _.each(value || [], function (d) {
                d.DeliveredOn = typeof (d.DeliveredOn) === 'string' ? (d.DeliveredOn.indexOf('/Date') >= 0 ? new Date(d.DeliveredOn.match(/\d+/)[0] * 1) : new Date(d.DeliveredOn)) : d.DeliveredOn;
                if (d.DeliveredOn instanceof Date) {
                    d.DeliveredOn = d.DeliveredOn.format('yyyy/mm/dd HH:MM:ss');
                }

            });
            this.DeliveryHistory(formattedValue);
            this.successcount(scount);
            this.failurecount(fcount);
        };

        this.closepopupstatus = function () {
            window.reportmgmt.uicontext.close_report_popupstatus();
        };

        this.dataSource(data, successcount, failurecount);
    }

    var ReportViewModel = function (data) {
        var self = this;
        data = data || {};       
        this.reportGroupId = ko.observable(data.reportGroupId);
        this.reportId = ko.observable(data.reportId);
        this.reportGroupName = ko.observable(data.reportGroupName);
        this.template = ko.observable();
        this.templates = ko.observableArray([]);

        this.initialize = function () {
            if (self.reportId()) {
                self.getReport();
            }
            else {
                self.loadTemplates(function (result) {                    
                    if (result) {
                        self.templates(result.ReportGroups || []);
                    }
                });
            }
        }

        this.loadTemplates = function (cb) {          
            window.reportmgmt.uicontext.load_all_templates(null, cb);
        }

        this.getReportTemplate = function (reportGroup) {            
            window.reportmgmt.uicontext.load_report_template(reportGroup.Id, function (jsondata) {
                if (jsondata) {
                    self.reportDetail = new ReportDetailModel(jsondata.data, reportGroup.Name);
                    window.reportmgmt.uicontext.show_report_detail_page({ reportGroupName: reportGroup.Name, model: self.reportDetail });
                }
            });
        }

        this.getReport = function () {
            window.reportmgmt.uicontext.load_report_template(self.reportGroupId(), function (templateData) {
                window.reportmgmt.uicontext.load_report(self.reportId(), function (result) {                 
                        if (!result.data.IsDefault) {
                            self.mergeReportDetail(templateData.data, result.data, ['FilterFields', 'OutputFields', 'OuputSortOrder']);
                        }
                        self.reportDetail = new ReportDetailModel(result.data, self.reportGroupName());
                        window.reportmgmt.uicontext.show_report_detail_page({ reportGroupName: self.reportGroupName(), model: self.reportDetail });                   
                });
            });
        }

        this.onTemplateSelected = function () {
            self.getReportTemplate(self.template());
        }

        this.close = function () {
            window.reportmgmt.uicontext.close_report_page();
        }

        this.mergeReportDetail = function (templateData, reportData, propNames) {
            this.mergeFilterFields(templateData, reportData);
            this.mergeOutputFields(templateData, reportData);
            this.mergeSortOrderFields(templateData, reportData);
        }

        this.mergeFilterFields = function (templateData, reportData) {
            reportData.FilterFields = reportData.FilterFields || []
            self.mergeFieldsArray(templateData.FilterFields, reportData.FilterFields, function (field) {
                if (field.DataType == common.dataTypes.DateTime && field.SearchValue) {
                    var dateValues = field.SearchValue.split('~');
                    if (dateValues.length > 0 && dateValues[0]) {                        
                        field.StartDate = moment(dateValues[0]).parseZone().format('YYYY-MM-DD HH:mm:ss');
                    }
                    if (dateValues.length > 1 && dateValues[1]) {
                        field.EndDate = moment(dateValues[1]).parseZone().format('YYYY-MM-DD HH:mm:ss');
                    }
                }
            });
        }

        this.mergeOutputFields = function (templateData, reportData) {
            reportData.OutputFields = reportData.OutputFields || []
            self.mergeFieldsArray(templateData.OutputFields, reportData.OutputFields, function (field, merged) {
                if (!merged) {
                    field.IsSelected = true;
                }
            });
        }

        this.mergeSortOrderFields = function (templateData, reportData) {
            reportData.OuputSortOrder = reportData.OuputSortOrder || []
            self.mergeFieldsArray(templateData.OuputSortOrder, reportData.OuputSortOrder);
        }

        this.mergeFieldsArray = function (source, target, cb) {
            _.each(source, function (sourceField) {
                var field = _.find(target, function (targetField) {
                    return targetField.Id.toLowerCase() == sourceField.Id.toLowerCase();
                });
                if (!field) {
                    target.push(sourceField);
                    if (cb) { cb(sourceField, true); }
                }
                else {
                    if (cb) { cb(field, false); }
                }
            });
        }

        self.deleteonly = function () {
            var keyCode = (event.which) ? event.which : event.keyCode;
            if ((keyCode == 8) || (keyCode == 46))
                event.returnValue = true;
        }

        this.initialize();
    }
    var ReportSummaryModel = function (data) {
        var self = this;
        data = data || {};
        var date = new Date(), y = date.getFullYear(), m = date.getMonth();
        var firstDay = new Date(y, m, 1);
        self.AccountId = data.AccountID;
        self.Ischartavaliable = ko.observable(false);
        self.ComputedReportSummaryText = ko.computed(function () {
            return "* " + Resources.Report_Summary_Chart_Start_Text + " " + firstDay.toString("MMM dd yyyy") + " " + Resources.Report_Summary_Chart_End_Text;
        }, this);
        self.ReportscheduleValue = ko.observable(data.data.ReportScheduled);
        self.ReportDeliveryPending = ko.observable(data.data.ReportDeliveryPending);
        self.ReportDeliveryFailed = ko.observable(data.data.ReportDeliveryFailed);
        self.ReportDelivered = ko.observable(data.data.ReportDelivered);

        self.viewreports = function (data, event) {
            window.reportmgmt.uicontext.show_reportlist_page(self.AccountId);
        }

        self.createreports = function (data, event) {
            window.reportmgmt.uicontext.show_report_page(self.AccountId)
        }

        if (data.data.ReportScheduled == 0) {
            self.Ischartavaliable(false);
        }
        else {
            self.Ischartavaliable(true);
            self.chartdataDef =
           {
               title: {
                   text: data.data.ReportScheduled + "<br />" + Resources.Reports + "<br />" + Resources.Scheduled,
                   //align: 'center',
                   verticalAlign: 'middle',
                   y: -37,
                   style: {
                       color: '#0780BE',
                       fontWeight: 'bold',
                       fontSize: '14px',
                       marginTop: '50'
                   },


                   //formatter: function () {                    
                   // return $('<div/>').css({
                   //     'color': '#fff',
                   //     'border': '2px solid ',
                   //     'backgroundColor': this.point.color
                   // }).text("dfdfer" + data.data.ReportScheduled);
                   // }

               },
               series: [{
                   name: 'Browsers',
                   //data: [["Reports Pending", data.data.ReportDeliveryPending], ["Failed Delivery", data.data.ReportDeliveryFailed], ["Delivered Reports", data.data.ReportDelivered]],
                   // data: [["Reports Pending", 25], ["Failed Delivery", 20], ["Delivered Reports", 30]],
                   data: [
                   {
                       name: Resources.Reports_Pending,
                       y: data.data.ReportDeliveryPending,
                       color: '#454545'
                   },
                   {
                       name: Resources.Failed_Delivery,
                       y: data.data.ReportDeliveryFailed,
                       color: '#E33E38'
                   },
                   {
                       name: Resources.Delivered_Reports,
                       y: data.data.ReportDelivered,
                       color: '#3BAD49'
                   }
                   ],

                   size: '80%',
                   innerSize: '50%',
                   dataLabels: {
                       connectorwidth: 0,
                       // connectorColor: 'transparent',
                       enabled: true,
                       useHTML: true,
                       formatter: function () {
                           console.log(this);
                           return $('<div/>').css({
                               'color': '#fff',
                               'border': '2px solid ',
                               'backgroundColor': this.point.color
                           }).text(this.y)[0].outerHTML;
                       }
                   }
               }]
           };

        }

        self.chartData = ko.observable(self.chartdataDef);
        //return { chartData: chartData };

        self.deleteonly = function () {
            var keyCode = (event.which) ? event.which : event.keyCode;
            if ((keyCode == 8) || (keyCode == 46))
                event.returnValue = true;
        }
    }

    datacontext.reportlistmodel = ReportGroupListModel;
    datacontext.reportlistDeliverymodel = ReportGroupListModel;
    datacontext.reportdetailtmodel = ReportDetailModel;
    datacontext.reportpreviewmodel = ReportPreviewModel;
    datacontext.reportviewmodel = ReportViewModel;
    datacontext.reportsummarymodel = ReportSummaryModel;
    datacontext.reportstatusmodel = ReportStatusModel;



    var DashboardEventModel = uibase.BaseModel.inherits({
        initialize: function (data, parent) {
            this.Id = ko.observable();
            this.Name = ko.observable();
            this.Description = ko.observable();
            this.EventCode = ko.observable();
            this.EventGroupName = ko.observable();
            this.IsSelected = ko.observable(false);
            this.IsVisible = ko.observable(true);
            this.parent = parent;
            if (data) {
                this.dataSource(data);
            }
        },
        dataSource: function (data) {
           
            data = data || {};
            this.Id(data.Id);
            this.Name(data.Name);
            this.Description(data.Description);
            this.EventCode(data.EventCode);
            this.EventGroupName(data.EventGroupName);
        },
        toJson: function () {
            return ko.mapping.toJS(this);
        }
    });

    var DashboardEventCategoryModel = uibase.BaseModel.inherits({
        initialize: function (data, parent) {
            data = data || {};
            this.Name = ko.observable(data.Name);
            this.IsExpanded = ko.observable(false);
            this.IsSelected = ko.observable(false);
            this.parent = parent;
            this.Events = ko.observableArray(_.map(data.Events || [], function (category) {
                return new DashboardEventModel(category, this);
            }, this));
            this.Categories = ko.observableArray(_.map(data.Categories || [], function (category) {
                return new DashboardEventCategoryModel(category, this);
            }, this));
            this.IsVisible = ko.computed(function () {
                var visibleChildCategories = _.filter(this.Categories(), function (c) {
                    return c.IsVisible();
                });
                return visibleChildCategories.length > 0 || this.Events().length > 0;
            }, this);
        },
        toJson: function () {
            return ko.mapping.toJS(this.Events);
        }
    });
    var get_reportmgmt_accounts_url = function () {
        return $("#getreportmgmtaccountsurl").val();
    }
    var TreeViewModel = uibase.BaseViewModel.inherits({
        initializeViewModel: function (options) {
            this.bindAll(this, 'toggleExpand', 'handleSelection');
            this.options = options;
            this.initializeBinding(options);
        },
        initializeBinding: function (options) {
            this.rootNode = new TreeNodeModel({ EntityType: 'ROOT' });
        },
        setRootNodeData: function (options) {
            var self = this;
            if (options.rootNodeData) {
                this.rootNode.bindChildNodes([options.rootNodeData]);
                this.trigger(window.reportmgmt.common.events.report_treeview_expanded, this.rootNode);
                if (options.depth == 1) {
                    this.expandChildren(this.rootNode);
                }
            }
            else {
                this.expandNode(this.rootNode, false, false, function () {
                    if (options.depth == 1) {
                        self.expandChildren(self.rootNode);
                    }
                });
            }
        },
        toggleExpand: function (record) {
            var isExpanded = record.IsExpanded();
            if (isExpanded) {
                record.IsExpanded(false);
            }
            else {
                this.expandNode(record, isExpanded);
            }
        },
          expandNode: function (record, isExpanded, isUpdate, completed) {
            var self = this;
            if (!isExpanded && this.isExpandable(record)) {
                if (record.Children().length == 0 || isUpdate) {
                    this.postDataRequest(get_reportmgmt_accounts_url(), {
                        id: record.Entity.Id(),
                        nodeType: record.Entity.EntityType() ? record.Entity.EntityType().toUpperCase() : null
                    }, function (err, val) {
                        record.bindChildNodes(val, isUpdate, self.options.DirtyEntities());
                        if (val && val.length > 0) {
                            record.IsExpanded(true);
                        }
                        self.trigger(window.reportmgmt.common.events.report_treeview_expanded, record);
                        if (completed) { completed(record.Children()); }
                    });
                }
                else {
                    record.IsExpanded(true);
                    if (completed) { completed(record.Children()); }
                }
            }
        },
        expandChildren: function (record) {
            if (record.Children()) {
                for (var i in record.Children()) {
                    this.expandNode(record.Children()[i], false);
                }
            }
        },
        isExpandable: function (node) {
            var nodeType = node.Entity.EntityType();
            if (nodeType) {
                return !this.options.expandableNodeTypes || this.options.expandableNodeTypes.indexOf(nodeType.toUpperCase()) != -1;
            }
            return false;
        },
        handleHover: function (record) {
            if (!record.IsSelected()) {
                record.IsHover(true);
            }
            record.StatusClass('Hover');
        },
        handleHoverOut: function (record) {
            record.IsHover(false);
            record.StatusClass('');

        },
        handleSelection: function (record) {
          this.selectNode(record, !record.IsSelected());
        },
        expandAllChildren: function (record) {
            var self = this;
            this.expandNode(record, false, false, function (nodes) {
                for (var i in nodes || []) {
                    self.expandAllChildren(nodes[i]);
                }
            });
        },
        selectNode: function (node, isSelected) {
            if (node) {
                node.IsHover(false);
                node.selectNode(isSelected);
               // this.expandAllChildren(node);
            }
        },
        refresh: function (node) {
            node = node || this.rootNode;
            for (var i in node.Children()) {
                if (node.Children()[i].IsExpanded() || node.Children()[i].Children().length > 0) {
                    this.expandNode(node.Children()[i], false, true);
                    this.refresh(node.Children()[i]);
                }
            }
        },
        getNodes: function (trueTest, node, dataList) {
            dataList = dataList || [];
            if (node) {
                if (!trueTest || trueTest(node)) {
                    dataList.push(node);
                }
            }
            else {
                node = this.rootNode;
            }
            for (var i in node.Children()) {
                this.getNodes(trueTest, node.Children()[i], dataList);
            }
            return dataList;
        },
        forEachNode: function (callback, node) {
            if (node) {
                callback(node);
            }
            else {
                node = this.rootNode;
            }
            for (var i in node.Children()) {
                this.forEachNode(callback, node.Children()[i]);
            }
        },
        toJson: function (trueTest, node, dataList) {

            dataList = dataList || [];
            if (node) {
                if (!trueTest || trueTest(node)) {
                    dataList.push(node.toJson());
                }
            }
            else {
                node = this.rootNode;
            }
            for (var i in node.Children()) {
                this.toJson(trueTest, node.Children()[i], dataList);
            }
            return dataList;
        }
    });

    var TreeNodeModel = uibase.BaseModel.inherits({
        initialize: function (data, parentNode) {
            this.initializeBinding(data, parentNode);
        },
        initializeBinding: function (data, parentNode) {
            var self = this;
            data = data || {};
            //this.Entity = {
            //    Id: ko.observable(),
            //    Name: ko.observable(),
            //    Description: ko.observable(),
            //    EntityType: ko.observable(),
            //    ParentId: ko.observable(),
            //    Address: ko.observable()
            //}
            this.Entity = {
                Id: ko.observable(),
                Name: ko.observable(),
                EntityType: ko.observable()

            }
            this.IsDirty = ko.observable(false);
            this.IsExpanded = ko.observable(false);
            this.Children = ko.observableArray([]);
            this.StatusClass = ko.observable('');
            this.IsSelected = ko.observable(!!data.IsSelected);
            this.IsHover = ko.observable(false);
            this.Icon = ko.computed(function () {
                if (self.Entity.EntityType()) {
                    if (self.StatusClass())
                        return "icon_" + self.Entity.EntityType().toLowerCase() + "_" + self.StatusClass();
                    return "icon_" + self.Entity.EntityType().toLowerCase();
                }
                else
                    return " tree-open-icon";
            });
            this.ParentNode = parentNode;
            this.dataSource(data);
            this.bindChildNodes(data.Children);
        },
        //dataSource: function (data) {
        //    data = data || {};
        //    this.Entity.Id(data.Id);
        //    this.Entity.Name(data.Name);
        //    this.Entity.Description(data.Description);
        //    this.Entity.EntityType(data.EntityType);
        //    this.Entity.ParentId(data.ParentId);
        //    this.Entity.Address(data.Address);
        //},
        dataSource: function (data) {
            data = data || {};
            this.Entity.Id(data.Id);
            this.Entity.Name(data.Name);
            this.Entity.EntityType(data.EntityType);

       },
        bindChildNodes: function (nodeDataList, isUpdate,DirtyEntities) {
           if (nodeDataList) {
               var self = this;
               if (isUpdate) {
                   for (var i in this.Children()) {
                       if (nodeDataList[i]) {
                           this.Children()[i].dataSource(nodeDataList[i]);
                       }
                   }
               }
               else {
                   this.Children.removeAll();
                   this.Children.push.apply(this.Children, nodeDataList.map(function (n) {
                       var filterIds = _.find(DirtyEntities, function (item) {
                           return item == n.Id;
                       });
                       if (!filterIds)
                           n.IsSelected = self.IsSelected();
                       else
                           self.selectNode(false);
                          // n.IsSelected = self.IsSelected();
                       return new TreeNodeModel(n, self);
                   }));
               }
           }
       },
       selectNode: function (isSelected, isReverse, index) {
           index = index || 0;
           this.IsSelected(isSelected);
           if (!isReverse && this.Children()) {
               for (var i in this.Children()) {
                   this.Children()[i].selectNode(isSelected, false, index + 1);
               }
           }
           if (index == 0 && this.ParentNode) {
               if (isSelected && !this.ParentNode.IsSelected()) {
                   var self = this;
                   var unSelectedNode = ko.utils.arrayFirst(this.ParentNode.Children(), function (node) {
                       return !node.IsSelected();
                   });
                   if (!unSelectedNode) {
                       self.ParentNode.selectNode(isSelected, true);
                   }
               }
               else if (!isSelected && this.ParentNode.IsSelected()) {
                   this.ParentNode.selectNode(isSelected, true);
               }
           }
       },
       toJson: function () {

            return ko.mapping.toJS(this.Entity);
        }
    });



})(ko, window.reportmgmt.datacontext, window.reportmgmt.common);


/*TODO:-
1.write seperate mapping context for all mappings*/