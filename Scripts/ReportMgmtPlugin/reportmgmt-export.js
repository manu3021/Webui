window.exportReport = function (reqData, exportType) {
    var hdnReqDataEl = document.getElementById('hdnReqData');
    var hdnExportTypeEl = document.getElementById('hdnExportType');
    var frmReqDataEl = document.getElementById('frmReqData');
    if (hdnReqDataEl && hdnExportTypeEl && frmReqDataEl) {
        hdnReqDataEl.value = reqData;
        hdnExportTypeEl.value = exportType;
        frmReqDataEl.submit();
    }
};

window.showError = function (msg) {
    this.parent.reportmgmt.uicontext.show_error(msg);
};