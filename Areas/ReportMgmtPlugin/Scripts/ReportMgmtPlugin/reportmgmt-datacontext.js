/// <reference path="reportmgmt-common.js" />

window.reportmgmt.datacontext = (function ($, common) {
    var possibleFilterConditions,
        configdataContext = {
            get_report_summary: get_report_summary,
            get_report_Delivery_Status: get_report_Delivery_Status,
            get_reportgroups_by_account: get_reportgroups_by_account,
            get_reports_by_group: get_reports_by_group,
            get_report_by_id: get_report_by_id,
            get_reportlist_html: get_reportlist_html,
            get_report_html: get_report_html,
            get_report_detail_html: get_report_detail_html,
            get_report_index_html: get_report_index_html,
            get_possible_filter_vlaues: get_possible_filter_vlaues,
            get_possible_conditions: get_possible_conditions,
            get_possible_filter_conditions: get_possible_filter_conditions,
            get_possible_conditions_by_DataType: get_possible_conditions_by_DataType,
            save_report: save_report,
            get_event_categories: get_event_categories,
            get_audituseraction_categories: get_audituseraction_categories,
            get_auditreport_userListfilter: get_auditreport_userListfilter,
            delete_report: delete_report,
            generate_report: generate_report,
            generate_statusreport: generate_statusreport,
            get_report_template: get_report_template,
            get_accounts_by_id: get_accounts_by_id,
            export_report_url: export_report_url,
            get_sites_by_accountids: get_sites_by_accountids,
            get_report_users: get_report_users
        };

    function get_possible_filter_conditions(cb) {
        get_possible_conditions().done(function (jsondata) {
            possibleFilterConditions = jsondata;
            if (cb) { cb(); }
        });
    }

   
    

    function RequestModel(data) {
        return {
            toJson: function () {
                return JSON.stringify(data);
            }
        }
    }

    function get_report_summary() {
        //TODO:check all validations
        return new ajaxRequest("post", get_report_summary_url());
    }

    function get_report_Delivery_Status() {
        //TODO:check all validations
        return new ajaxRequest("post", get_report_Delivery_Status_url());
    }

    function get_reportgroups_by_account(accountID) {
        //TODO:check all validations
        return new ajaxRequest("post", get_reportgroups_by_account_url(), RequestModel({ id: accountID }));
    }
    function get_reports_by_group(id) {
        return ajaxRequest("post", get_reports_by_group_url(), RequestModel({ id: id }));
    }
    function get_report_by_id(id) {
        return ajaxRequest("post", get_report_by_id_url(), RequestModel({ id: id }));
    }
    function get_reportlist_html(id) {
        return $.get(get_reportlist_html_url());
    }
    function get_report_html() {
        return $.get(get_report_html_url());
    }
      function get_report_index_html() {
          return $.get(get_report_index_html_url());
    }
    function get_possible_filter_vlaues(id) {
        return ajaxRequest("post", get_report_filter_values_url(), RequestModel({ id: id }));
    }
    function get_possible_conditions(id) {
        return ajaxRequest("post", get_report_filter_conditions_url());
    }
    function get_possible_conditions_by_DataType(id) {
        if (!possibleFilterConditions) {
            return null;
        }
        else {
            var match = ko.utils.arrayFirst(possibleFilterConditions, function (item) {
                return item.Id == id;
            });

            return match;
        }   
    }
    function save_report(data) {
        return ajaxRequest("post", save_report_url(), data);
    }

    function get_event_categories(data) {
        return ajaxRequest("post", get_event_categories_url(), data);
    }
    function get_audituseraction_categories(data) {
        return ajaxRequest("post", get_audituseraction_categories_url(), data);
    }
    function get_auditreport_userListfilter(data) {
        return ajaxRequest("post", get_auditreport_userListfilter_url(), data);
    }
    function generate_report(data) {
        return ajaxRequest("post", generate_report_url(), data);
    }
    function generate_statusreport(reportId) {
        return ajaxRequest("post", generate_statusreport_url(), RequestModel({ reportId: reportId }));
    }
    function delete_report(data) {
     
        return ajaxRequest("post", delete_report_url(), RequestModel({ reportId: data.Id() }));
        
    }
    function get_report_template(data) {
        return ajaxRequest("post", get_report_template_url(), RequestModel({ reportGroupId: data }));
    }

    function get_report_detail_html(data) {
        return $.get(get_report_detail_html_url(data));
    }

    function get_report_index_html(data) {
        return $.get(get_report_index_html_url(data));
    }

    function get_accounts_by_id(data) {
        return ajaxRequest("post", get_accounts_by_id_url(), RequestModel({ accountIds: data }));
    }
    function get_sites_by_accountids(accountIDs) {
        return new ajaxRequest("post", get_sites_by_accountids_url(), RequestModel({ accountIds: accountIDs }));
    }
    function get_report_users(reportId, accountIDs) {
        return new ajaxRequest("post", get_report_users_url(), RequestModel({ reportId: reportId, accountIds: accountIDs }));
    }
    return configdataContext;

    

    function get_reports_by_group_url() {
        return $("#").attr("data-url");
    }
    function get_report_summary_url() {
        return $("#getreportsummaryurl").attr("data-url");
    }
    function get_report_Delivery_Status_url()
    {
        return $("#getreportDeliveryStatusurl").attr("data-url");
    }

    function get_reportgroups_by_account_url() {
        return $("#getreportgroupsbyaccounturl").attr("data-url");
    }
    function get_report_by_id_url() {
        return $("#getreportbyidurl").attr("data-url");
    }
    function get_reportlist_html_url() {
        return $("#getreportlisthtmlurl").attr("data-url");
    }
    function get_report_html_url() {
        return $("#getreporthtmlurl").attr("data-url");
    }
    function get_report_index_html_url() {
        return $("#getreportindexhtmlurl").attr("data-url");
    }
    function get_report_filter_values_url() {
        return $("#getreportfiltervaluesurl").attr("data-url");
    }
    function get_report_filter_conditions_url() {
        return $("#getreportfilterconditionsurl").attr("data-url");
    }
    function save_report_url() {
        return $("#savereporturl").attr("data-url");
    }
    function get_event_categories_url() {
        return $("#GetAllEventCategoriesurl").attr("data-url");
    }
    function get_audituseraction_categories_url() {
        return $("#GetAllUserActionCategoriesurl").attr("data-url");
    }
    function get_auditreport_userListfilter_url() {
        return $("#GetAuditReportUserListFilterurl").attr("data-url");
    }
    function delete_report_url() {
     //   alertify.alert("welcome");
        return $("#deletereporturl").attr("data-url");
    }
    function generate_report_url() {
        return $("#generatereporturl").attr("data-url");
    }
    function generate_statusreport_url() {
        return $("#generatestatusreporturl").attr("data-url");
    }
    function export_report_url() {
        return $("#exportreporturl").attr("data-url");
    }
    function get_report_template_url() {
        return $("#getreporttemplateurl").attr("data-url");
    }
    function get_report_detail_html_url(reportGroupName) {
       return $("#getreportdetailhtmlurl").attr("data-url") + "?reportGroupName=" + reportGroupName;
     
    }
    function get_accounts_by_id_url(accountIds) {
        return $("#getaccountsbyidurl").attr("data-url");
    }

    function get_sites_by_accountids_url(accountIds) {
        return $("#getsitesbyaccountidsurl").attr("data-url");
    }

    function get_report_users_url(reportId, accountIds) {
        return $("#getreportusersurl").val();
    }
    
})($, window.reportmgmt.common);