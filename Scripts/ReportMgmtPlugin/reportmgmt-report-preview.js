$(document).ready(function () {
    $.ajax({
        method: "POST",
        url: "ReportMgmt/GetReportResult",
        success: function (data) {
            $("#reportTable").html(data);
        },
        error: function () {
            //alert("Error loading report data");
         }
    });
});