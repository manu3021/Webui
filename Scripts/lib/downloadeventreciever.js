/// <reference path="clipdownloaddatacontext.js" />
/// <reference path="Clipdownload.common.js" />
window.clipdownload = window.clipdownload || {};

window.clipdownload.eventreciever = (function ($, ko, datacontext, common) {
    $.subscribe('clipdatarecieved', function (data, exportmodel) {
        exportmodel.isretry(false);
        var clp = new ClipExportDownloader(exportmodel);
        clp.Download();
    });

    $.subscribe('cancelclip', function (data, clipData) {
        if (clipData) {
            cancelExport(clipData);
        }
    });
    $.subscribe('RetryGetExport', function (data, exportmodel) {
        if (exportmodel) {
            exportmodel.isretry(true);
            var clp = new ClipExportDownloader(exportmodel);
            clp.Download();
        }
    });


    /*Clip Export */
    var ClipExportDownloader = function (exportmodel) {
        var getClipExportStream = this;
        var exportUUID = window.clipdownload.common.createUUID();
        if (exportmodel.isretry()) {
            exportUUID = exportmodel.sessionid;
        }
        getClipExportStream.clipdata = exportmodel.Clipdetails;
        getClipExportStream.uid = exportUUID;
        getClipExportStream.ExportUrl = "";
        getClipExportStream.IsSave = true;
        getClipExportStream.exportmodel = exportmodel;
        getClipExportStream.Filename = exportmodel.SavePath();
        exportmodel.sessionid = exportUUID;

        getClipExportStream.Download = function () {
            datacontext.getClipExportStream(exportmodel.Clipdetails, exportUUID).done(function (jsondata) {
                var stream = jsondata;
                if (stream.VideoResultstring.toLowerCase() == window.clipdownload.common.constants.Exportstatus.SUCCESS) {
                    getClipExportStream.ExportUrl = stream.Url;
                    //self.isprogress = ko.observable(true);
                    //self.progressvalue = ko.observable("20");
                    exportmodel.isprogress(true);
                    $.publish("clipdetails", exportmodel);
                    if (getClipExportStream.ExportUrl != null) {
                        $('#progressBar').fadeIn("slow");
                        progress(0, $("#progressBar"));
                        GetExportpercentage(exportmodel.Clipdetails, exportmodel, exportUUID, getClipExportStream.SuccessCallback, getClipExportStream.errorCallback, getClipExportStream.returnCallback);
                    }
                }
                else {
                    var errorstring = window.clipdownload.common.messages.Clipexportfailure;
                    if (stream.VideoResultstring.toLowerCase() == window.clipdownload.common.constants.Exportstatus.MAXIMUM_CONNECTION_EXISTS) {
                        errorstring = window.clipdownload.common.messages.noFreeSessionExportError;
                    }
                    alertify.error(errorstring);
                    exportmodel.Error(errorstring);
                    exportmodel.isretry(true);
                    exportmodel.isprogress(false);
                    getClipExportStream.errorCallback(exportmodel);
                }
            }).error(function (e, jsondata) {
                console.log(window.clipdownload.common.messages.Clipexportfailure);
            });
        };

        getClipExportStream.returnCallback = function (exportmodel) {
            try {
                if (!exportmodel.Iscancel())

                    GetExportpercentage(getClipExportStream.clipdata, getClipExportStream.exportmodel, getClipExportStream.uid, getClipExportStream.SuccessCallback, getClipExportStream.errorCallback, getClipExportStream.returnCallback);
                else
                    exportmodel.progressvalue("0");
                $("#cancel").attr("data-dismiss", "modal");
                $("#cancel").attr("aria-hidden", "true")
                return;
            } catch (e) {
                console.error(e);
            }
        }

        getClipExportStream.SuccessCallback = function (curexportmodel) {
            try {
                var uielem = document.getElementById("page-header");
                var context = ko.contextFor(uielem);
                var modals = $.map(context.$data.clipResults(), function (item) {
                    if (item.SessionId() == curexportmodel.sessionid) {
                        return item;
                    }
                });
                var finalmodal;
                if (modals && modals.length > 0) {
                    finalmodal = modals[0];
                }

                curexportmodel.IsSave(true);
                curexportmodel.isexport(false);
                curexportmodel.progressvalue("100");
                $.publish("exportvalue", curexportmodel.progressvalue());
                var downLoadurl = $("#getdownloadurl").data("url") + "?fileurl=" + getClipExportStream.ExportUrl + "&filename=" + getClipExportStream.Filename;
                finalmodal.downloadurl(downLoadurl);
                //$("#downloadclip").attr('href', downLoadurl);
                //context.$data.ClipExportmodel.Exportname("Close");
            } catch (e) {
            }
        }
        getClipExportStream.errorCallback = function (exportmodel) {                    
            $.publish("error", exportmodel);
            //exportmodel.iserror(true);
            exportmodel.isprogress(false);
        }

        function progress(percent, $element) {
            var progressBarWidth = percent * $element.width() / 100;
            $element.find('progress').animate({ width: progressBarWidth }, 100).html(percent + "%&nbsp;");
        }

        function GetExportpercentage(clipdata, exportmodel, exportUUID, successcallback, errorCallback, returnCallback) {
            try {
                console.log("exportmodel.sessionid:" + exportmodel.sessionid);

                var Currentexportmodel = exportmodel;
                if (exportmodel.Iscancel()) {
                    exportmodel.progressvalue("0");
                    exportmodel.isprogress(false);
                    //$("#cancel").attr("data-dismiss", "modal");
                    //$("#cancel").attr("aria-hidden", "true")
                    return;
                }
                exportmodel.isprogress(true);
                datacontext.getExportpercentage(clipdata, exportUUID).done(function (jsondata) {                    
                    if (jsondata.Success) {
                        console.log("CB_exportmodel.sessionid:" + exportmodel.sessionid + " :: ExportUUID:" + jsondata.ExportUUID + " :: ExportPercentage:" + jsondata.ExportPercentage);
                        exportmodel.isprogress(true);
                        if (exportmodel.Iscancel())
                            return;
                        Currentexportmodel.progressvalue(jsondata.ExportPercentage);
                        Currentexportmodel.isshowhide(true);
                        $.publish("exportvalue", Currentexportmodel);
                        if (jsondata.ExportPercentage == 100) {
                            if (successcallback) {
                                alertify.success(window.clipdownload.common.messages.Clipexportsuccess);
                                successcallback(exportmodel);
                                Currentexportmodel.IsSave(true);
                                Currentexportmodel.isshowhide(false);
                            }
                        }
                        else if (jsondata.ExportPercentage != -1) {
                            if (returnCallback)
                                returnCallback(exportmodel);
                        }
                        else {
                            console.log("CB_exportmodel.sessionid:" + exportmodel.sessionid + " :: ExportUUID:" + jsondata.ExportUUID + " ERROR");                            
                            alertify.error(window.clipdownload.common.messages.Clipexportfailure);
                            exportmodel.Error(window.clipdownload.common.messages.Clipexportfailure);
                            if (errorCallback) {
                                exportmodel.isretry(true);
                                exportmodel.isprogress(false);
                                errorCallback(exportmodel);
                            }
                        }
                    }
                    else {
                        console.log("CB_exportmodel.sessionid:" + exportmodel.sessionid + " :: ExportUUID:" + jsondata.ExportUUID + " ERROR:" + jsondata.Success);                        
                        alertify.error(window.clipdownload.common.messages.Clipexportfailure);
                        exportmodel.Error(window.clipdownload.common.messages.Clipexportfailure);
                        if (errorCallback) {
                            exportmodel.isretry(true);
                            exportmodel.isprogress(false);
                            errorCallback(exportmodel);
                        }
                    }
                });
            }
            catch (e) {
                console.log(e);
                console.log("Exception on clip export percentage  retrival");
            }
        }
    };

    function cancelExport(exportmodel) {
        datacontext.cancelClipExport(exportmodel).done(function (jsondata) {
            var stream = jsondata;
            if (stream.Success != false) {
                console.log("clip Export cancel successfully");
            }
        });
    }
})(jQuery, ko, window.clipdownload.datacontext, window.clipdownload.common);


