/// <reference path="reportmgmt-datacontext.js" />
/// <reference path="reportmgmt-common.js" />
/// <reference path="reportmgmt-validationcontext.js" />

window.reportmgmt.uicontext = (function ($, datacontext, common, validationcontext) {
    var reportListEl = null,
        reportEl = null,
        reportpreviewcontentEl = null,
        reportstatuscontentEl = null,
        reportbaseform = "reportBaseContentId",
        reportsummaryform = "reportIndexSectionId",
        reportlistform = "reportListBase",
        reportform = "reportId",
        reportpreviewmodal = "cardPreview",
        reportstatusmodal = "deliveryMailStatus",
        reportpreviewContent = "cardPreviewContent",
        reportstatusContent = "deliveryMailStatusContent",
        reportdetailform = "reportContent",
        reportchartcontainer = "container",
        reportmodalform = "reportmodalform",
        isloaded = false

        operationcontext = {
            show_reportlist_page: show_reportlist_page,
            show_reportindex_page:show_reportindex_page,
            show_report_page: show_report_page,
            show_report_detail_page: show_report_detail_page,
            show_preview_page: show_preview_page,
            show_preview_statuspage: show_preview_statuspage,
            loadreportsummary: load_report_summary,
            loadreportlist: load_report_list,
            close_report_page: close_report_page,
            close_report_popup: close_report_popup,
            close_report_popupstatus: close_report_popupstatus,
            close_output_selector: close_output_selector,
            close_reportusers_selector: close_reportusers_selector,
            export_report: export_report,
            save_report: save_report,
            load_all_templates: load_all_templates,
            load_report: load_report,
            load_report_template: load_report_template,
            validateform: validateform,
            resetvalidateform: resetvalidateform,
            show_error: show_error
        };

    var accountId = '';
    
    function init() {
        $.subscribe(common.events.application_page_changed, function (eventName, data) {
            if (!isloaded && data && data.pageName == common.constants.Reports) {
                show_reportindex_page(accountId);
                isloaded = true;
            }
        });
    }

    init();

    return operationcontext;

    function show_reportindex_page(accountID) {
        blockUI();
        datacontext.get_report_index_html().done(function (result) {
            if (result) {
                $('#reportBaseContentId').empty();
                $('#reportBaseContentId').html(result);
                load_report_summary(function () {
                    unblockUI();
                });
            }
            else {
                unblockUI();
            }
        });
    }

    function show_reportlist_page(accountID) {
        datacontext.get_reportlist_html().done(function (result) {
            if (!result) {
            }
            else {
                $('#reportBaseContentId').empty();
                $('#reportBaseContentId').html(result);
                load_report_list(accountID);
            }
        });         
    }

    function show_report_page(data) {
        datacontext.get_report_html().done(function (result) {
            $('#reportBaseContentId').empty();
            $('#reportBaseContentId').html(result);
            bind_report(new datacontext.reportviewmodel(data));
        });
    }

    function show_report_detail_page(data) {
        if (data.reportGroupName) {
            datacontext.get_report_detail_html(data.reportGroupName).done(function (result) {
                if (result) {
                    $('#reportContent').empty();
                    $('#reportContent').html(result);
                    bind_report_detail(data.model);
                }
            });
        }
    }

    function close_report_page() {
        //  show_reportlist_page(accountId);
        show_reportindex_page(accountId);
    }

    function close_report_popup() {
        $("#" + reportpreviewmodal).modal('hide');
    }

    function close_report_popupstatus() {
        $("#" + reportstatusmodal).modal('hide');
    }

    function close_output_selector() {
        if ($('.webui-popover').is(':visible')) {
            $(".popOverReport").webuiPopover("hide");
            $("#popoverreportOutput_click").webuiPopover('toggle');
        }
    }

    function close_reportusers_selector() {
        if ($('.webui-popover').is(':visible')) {
            $(".popOverReport").webuiPopover("hide");
            $("#popoverreportUsers_click").webuiPopover('toggle');
        }
    }

    function export_report(data) {
        var isValid = true;
        isValid = validateReport(data);
        if (isValid) {
            data = data.toJson();
            data = JSON.parse(data, function (k, v) {
                if (v && v.indexOf && v.indexOf('/Date(') == 0) {
                    return new Date(v.match(/\d+/)[0] * 1);
                }
                return v;
            });
            var exportType = data.ExportType;
            delete data.__ko_mapping__;
            data = JSON.stringify(data);
            var ifrm = $('#ifrmExport');
            ifrm.on('load', function () {
                ifrm.off();
                ifrm.get(0).contentWindow.exportReport(data, exportType);
            });
            ifrm.attr('src', datacontext.export_report_url());
        }
    }
    function validateReport(data) {
        var isValid = true;

            if (data.reportGroupName != null && data.reportGroupName == 'AUDIT REPORTS') {
            var startDate = data.get_value_by_filterId('[AuditLogEventTime]').StartDate;
            var endDate = data.get_value_by_filterId('[AuditLogEventTime]').EndDate;
            var auditCurrentDate = new Date();

            if (typeof startDate() != 'undefined' && startDate() != "")
                var auditStartDate = new Date(startDate());
            else
                var auditStartDate = "";
            if (typeof endDate() != 'undefined' && endDate()!="")
                var auditEndDate = new Date(endDate());
            else
                var auditEndDate = "";

            if ((auditStartDate != '' && auditEndDate == '') || (auditStartDate == '' && auditEndDate != '')) {
                isValid = false;
                show_error(Resources.Report_Date_Error);
            }        
            else if (auditStartDate != '' && auditEndDate != '' && auditStartDate > auditEndDate) {
                isValid = false;
                show_error(Resources.Viewer_Dateerror);
            }
            else if (!data.timezone()) {
                var hasOutputDateFields = _.some(data.OutputFields(), function (of) {
                    return of.DataType() == window.reportmgmt.common.dataTypes.DateTime && of.IsSelected();
                });
                if (auditStartDate != '' || auditEndDate != '' || hasOutputDateFields) {
                    isValid = false;
                    show_error(Resources.Report_SelectTimeZoneError);
                }
            }


        }
        else if (data.reportGroupName != null && data.reportGroupName == 'CARD REPORTS') {
            var startActivationDate = data.get_value_by_filterId('[ActivationDateTime]').StartDate;
            var endActivationDate = data.get_value_by_filterId('[ActivationDateTime]').EndDate;


            if (typeof startActivationDate() != 'undefined' && startActivationDate() != "")
                var startActivationDate1 = new Date(startActivationDate());
            else
                var startActivationDate1 = "";

            if (typeof endActivationDate() != 'undefined' && endActivationDate() != "")
                var endActivationDate1 = new Date(endActivationDate());
            else
                var endActivationDate1 = "";

            if ((startActivationDate1 != '' && endActivationDate1 == '') || (startActivationDate1 == '' && endActivationDate1 != '')) {
                isValid = false;
                show_error(Resources.Report_ActivationDate_Error);
            }          
            else if (startActivationDate1 != '' && endActivationDate1 != '' && startActivationDate1 > endActivationDate1) {
                isValid = false;               
                show_error(Resources.Activation_Dateerror);
            }
            var startExpiryDate = data.get_value_by_filterId('[ExpiryDateTime]').StartDate;
            var endExpiryDate = data.get_value_by_filterId('[ExpiryDateTime]').EndDate;

            if (typeof startExpiryDate() != 'undefined' && startExpiryDate() != "")
                var startExpiryDate1 = new Date(startExpiryDate());
            else
                var startExpiryDate1 = "";

            if (typeof endExpiryDate() != 'undefined' && endExpiryDate() != "")
                var endExpiryDate1 = new Date(endExpiryDate());
            else
                var endExpiryDate1 = "";

            if ((startExpiryDate1 != '' && endExpiryDate1 == '') || (startExpiryDate1 == '' && endExpiryDate1 != '')) {
                isValid = false;
                show_error(Resources.Report_ExpiryDate_Error);
            }
            else if (startExpiryDate1 != '' && endExpiryDate1 != '' && startExpiryDate1 > endExpiryDate1) {
                isValid = false;
                show_error(Resources.Expiry_Dateerror);
            }
        }
        else if (data.reportGroupName != null && data.reportGroupName == 'EVENT REPORTS') {
            var startDate = data.get_value_by_filterId('[EventTime]').StartDate;
            var endDate = data.get_value_by_filterId('[EventTime]').EndDate;
            var eventCurrentDate = new Date();

            if (typeof startDate() != 'undefined' && startDate() != "")
                var eventStartDate = new Date(startDate());
            else
                var eventStartDate = "";

            if (typeof endDate() != 'undefined' && endDate() != "")
                var eventEndDate = new Date(endDate());
            else
                var eventEndDate = "";

          
          
            if ((eventStartDate != '' && eventEndDate == '') || (eventStartDate == '' && eventEndDate != '')) {
                isValid = false;
                show_error(Resources.Report_Date_Error);
            }
            else if (eventStartDate != '' && eventEndDate != '' && eventStartDate > eventEndDate) {
                isValid = false;
                show_error(Resources.Viewer_Dateerror);
            }
            else if (data.Entities().length == 0) {
                isValid = false;
                show_error(Resources.Eventreport_Selecterror);
            }
            else if (!data.timezone()) {
                var hasOutputDateFields = _.some(data.OutputFields(), function (of) { 
                    return of.DataType() == window.reportmgmt.common.dataTypes.DateTime && of.IsSelected(); 
                });
                if (eventStartDate != '' || eventEndDate != '' || hasOutputDateFields) {
                    isValid = false;
                    show_error(Resources.Report_SelectTimeZoneError);
                }
            }
        }
        return isValid;
    }
    function save_report(data, cb) {
        var isValid = true;
        if (data.Name() != "") {

            isValid = validateReport(data);
            if (isValid) {
                validationcontext.setvalidationfor(reportmodalform);
                isValid = validationcontext.validateForm(reportmodalform);
                if (isValid) {
                    if (data.selectedReportUsersCount() == 0 && data.RecurrenceOption() != "0") {
                        isValid = false;
                        show_error(Resources.Report_SelectUserError);
                    }
                    else {
                        data.IsLoading(true);
                        datacontext.save_report(data).done(function (result) {
                            data.IsLoading(false);
                            if (result.Success) {
                                alertify.success(common.messages.report_save_success)
                            }
                            if (cb) { cb(result); }
                        }).fail(function (err) {
                            data.IsLoading(false);
                            alertify.error(common.messages.report_save_failed);
                        });
                    }
                }
            }
        }
        else {
            show_error(Resources.Report_ReportNameError);
        }
    }

    

    function show_error(msg) {
        alertify.error(msg);
    }

    function show_preview_page(data) {
        
        var isValid = true;
        isValid = validateReport(data);
        if (isValid) {
            $("#" + reportpreviewmodal).modal({ show: true, keyboard: false, backdrop: "static" });
            load_report_result(data);
        }
    }
    function show_preview_statuspage(reportId,successcount,failurecount) {
        $("#" + reportstatusmodal).modal({ show: true, keyboard: false, backdrop: "static" });
        load_report_statusresult(reportId,successcount,failurecount);
    }
    function load_report_list(accountID) {
        datacontext.get_reportgroups_by_account(accountID).done(function (jsondata) {
            if (!jsondata) {
            }
            else {
                var reportlistmodel = new datacontext.reportlistmodel(jsondata);
                bind_report_list(reportlistmodel);
            }
        });
    }


    function load_report_summary(cb) {
        datacontext.get_report_summary().done(function (jsondata) {
            try {
                if (jsondata) {
                    var reportsummarymodel = new datacontext.reportsummarymodel(jsondata);
                    bind_report_summary(reportsummarymodel);
                }
            }
            catch (ex) {
                alertify.error(common.messages.error_on_server);
            }
            finally {
                if (cb) { cb();}
            }
        });
    }

    function load_all_templates(accountID, cb) {
        datacontext.get_reportgroups_by_account(accountID).done(function (result) {
            cb(result);
        });
    }

    function load_report(reportID, cb) {
        datacontext.get_report_by_id(reportID).done(function (result) {
            if (result.Success) {
                cb(result);
            }
            else {
                show_error(result.ErrorMessage);
            }
        });
    }

    function load_report_template(reportGroupId, cb) {
        datacontext.get_possible_filter_conditions(function () {
            datacontext.get_report_template(reportGroupId).done(function (jsondata) {
                cb(jsondata);
            });
        });
    }

    function load_report_result(data) {
        
        data.IsLoading(true);
        datacontext.generate_report(data).done(function (result) {
            data.IsLoading(false);
            if (result.Success) {
                bind_preview(result.data)
            }
            else {
                //bind_preview(result.ErrorMessage)
                close_report_popup();
                show_error(result.ErrorMessage);
            }
        }).fail(function () {
            data.IsLoading(false);
        });
    }
    function load_report_statusresult(reportId,successcount,failurecount) {
        datacontext.generate_statusreport(reportId).done(function (result) {
            if (result && result.Success) {
                bind_statuspreview(result.data,successcount,failurecount)
            }
        }).fail(function () {
        });
    }
    function bind_report_summary(data) {
        reportChartEl = window.document.getElementById(reportchartcontainer);
        reportListEl = window.document.getElementById(reportsummaryform);
        ko.cleanNode(reportListEl);
        ko.applyBindings(data, reportListEl);
    }

    function bind_report_list(data) {
     
        reportListEl = window.document.getElementById(reportlistform);
        ko.cleanNode(reportListEl);
        ko.applyBindings(data, reportListEl);
   
    }
    
    function bind_report(data) {
        reportEl = window.document.getElementById(reportform);
        ko.cleanNode(reportEl);
        ko.applyBindings(data, reportEl);
    }

    function bind_report_detail(data) {
        reportDetailEl = window.document.getElementById(reportdetailform);
        ko.cleanNode(reportDetailEl);
        ko.applyBindings(data, reportDetailEl);
    }

    function bind_preview(data) {
        reportpreviewcontentEl = window.document.getElementById(reportpreviewContent);
        var context = ko.contextFor(reportpreviewcontentEl);
        if (context && context.$root) {
            context.$root.dataSource(data);
        }
        else {
            ko.applyBindings(new datacontext.reportpreviewmodel(data), reportpreviewcontentEl);
        }
    }

    function bind_statuspreview(data,successcount,failurecount) {
        reportstatuscontentEl = window.document.getElementById(reportstatusContent);
        var context = ko.contextFor(reportstatuscontentEl);
      if (context && context.$root) {
          context.$root.dataSource(data, successcount, failurecount);
      }
      else {
            ko.applyBindings(new datacontext.reportstatusmodel(data,successcount,failurecount), reportstatuscontentEl);
      }
    }
    function validateform() {
       // return validationcontext.validate(auditreportstartdate);
    }

    function resetvalidateform() {
       //validationcontext.resetForm(reportForm);
    }

})($, window.reportmgmt.datacontext, window.reportmgmt.common, window.reportmgmt.validationcontext);