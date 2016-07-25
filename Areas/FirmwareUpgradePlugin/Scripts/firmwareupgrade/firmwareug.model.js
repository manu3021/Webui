/// <reference path="firmwareug.common.js" />
/// <reference path="firmwareug.datacontext.js" />
/// <reference path="firmwareug.uicontext.js" />

; window.firmwareug.viewmodel = (function ($, ko, common, datacontext, uicontext) {
    var selectedFirmware = null;

    var fUgModel = function (initdata) {
        var self = this;
        var fulldata = initdata;
        var data = fulldata.DeviceDetail || {};
        self.Id = data.Id;
        self.EntityType = data.EntityType;
        self.Status = data.Status;
        //self.WhyMessage = ko.observable("");
        self.DeviceName = ko.observable(data.Name);
        self.FwVersion = ko.observable(data.FirmwareVersion);
        self.IsSelected = ko.observable(false);
        self.SelectedFirmware = ko.observable(null);
        self.UpgradeStatus = ko.observable(Resources.FW_Selectfirmwaretoupgrade);
        self.UpgradePercent = ko.observable(0); // To show user that someprogress is happenning
        self.UniqueId = data.UniqueId;
        self.UpgradeDescription = ko.observable(Resources.In_Progress);
        self.IsUpgrading = ko.observable(false);
        self.ShowUpgradeButton = ko.observable(false);
        self.CanUpgrade = function () {
            if (self.Status && self.Status.toLowerCase() == common.constants.devicestatus.ONLINE.toLowerCase()) {
                return true;
            }
            else {
                //self.WhyMessage("offline/ not registered");
                return false;
            }
        };
        self.UpgradePercentText = ko.computed(function () {
            try {
                return self.UpgradePercent() + "%";
            } catch (e) {
                console.error(e);
            }
        });
        self.IsEnabled = ko.computed(function () {
            if (self.CanUpgrade() && !self.IsUpgrading()) {
                return true;
            }
            self.IsSelected(false);
            return false;
        });
        self.SelectedFirmware.subscribe(function (val) {
            try {
                self.ShowUpgradeButton(false);
                if (val) {
                    if (self.CanUpgrade() && !self.IsUpgrading()) {
                        if ($.trim(self.FwVersion().toLowerCase()) != $.trim(val.Version.toLowerCase())) {
                            self.ShowUpgradeButton(true);
                        }
                        self.UpgradeStatus($.trim(val.Version));
                    }
                }
                else {
                    SetUpgradeState(false);
                }
            } catch (e) {
                console.error(e);
            }
        });
        //self.GetUpgradingVersion = ko.computed(function () {
        //    if (!self.CanUpgrade()) {
        //        return "Device offline or not registered";
        //    }
        //    else if (self.IsUpgrading() && self.UpgradeFirmwareVersion != "") {
        //        return self.UpgradeFirmwareVersion;
        //    }
        //    else if (self.SelectedFirmware()) {
        //        return self.SelectedFirmware().Version;
        //    }
        //    else {
        //        return "Select firmware to upgrade";
        //    }
        //});        
        self.UpgradeClick = function (data, e) {
            try {
                // showloading(true);
                if (!self.SelectedFirmware()) {
                    alertify.alert(Resources.FW_PleaseselectedSupportedFirmwareversion);
                    return;
                }
                if (!self.FwVersion()) {
                    alertify.alert(Resources.FW_CurrentFirmwareversionofselecteddeviceisnotproper);
                    return;
                }
                if (self.FwVersion() && $.trim(self.SelectedFirmware().Version.toLowerCase()) != $.trim(self.FwVersion().toLowerCase())) {
                    SetUpgradeState(true);
                    self.UpgradePercent(0);

                    datacontext.upgradeFirmware({
                        FirmwareId: self.SelectedFirmware().Id,
                        DeviceType: self.EntityType,
                        DeviceIds: [self.Id]
                    }).done(function (response) {
                        if (response.Success) {
                            self.GetStatusForDownload();
                        }
                        else {
                            SetUpgradeState(false);
                            alertify.alert(Resources.FW_FailedtotriggerfirmwaredownloadPleasetryagain);
                        }
                    }).fail(function () {
                        SetUpgradeState(false);
                        alertify.alert(Resources.FW_FailedtotriggerfirmwaredownloadPleasetryagain);
                    });
                }
            } catch (e) {
                console.error(e);
            }
        }

        self.GetStatusForDownload = function (initupgrdstatus) {
            var setIntervalId;
            var downloadTimeInSeconds = 100; // Entire download takes 100 sec (arbitary) - Make sure that this download time is optimal
            var progressThreshold = 10;//downloadTimeInSeconds - 30;  // Arbitary
            var updateInterval = 10;   // Updates the UI every 10 seconds

            self.firmwareCurrentProgressStatus = 10;    // Firmware Upgrade Succesfully Started.
            self.UpgradePercent(10);
            SetUpgradeState(true);

            if (initupgrdstatus) {
                var retvalue = SimulateFirmwareDownloadStatusAndUpdateUI(null, self.firmwareCurrentProgressStatus, initupgrdstatus);
                if (retvalue) {
                    return;
                }
            }

            setIntervalId = setInterval(function () {
                var currentProgressStatus = self.firmwareCurrentProgressStatus;
                SimulateFirmwareDownloadStatusAndUpdateUI(null, currentProgressStatus);//downloadProgressPercent);
                if (currentProgressStatus >= progressThreshold) {
                    GetActualFirmwareDownloadStatusAndUpdateUI(setIntervalId, currentProgressStatus);//downloadProgressPercent);
                } else {
                    self.firmwareCurrentProgressStatus += updateInterval;
                }
            }, (updateInterval * 1000));  // UpdateInterval should be in order of milliseconds
        }

        //This method returns true if upgrade is success/failure
        //incase of inprogress it returns false
        function SimulateFirmwareDownloadStatusAndUpdateUI(setIntervalId, progressStatus, fwupgprg) {
            var updatedversion = "";
            if (fwupgprg) {
                var status = fwupgprg.Status;
                var isComplete = fwupgprg.IsComplete;
                updatedversion = fwupgprg.Version;
                SetUpgradeDescription(fwupgprg.Description);
                if (isComplete) {
                    progressStatus = 100;
                }
                else if (status && status > 100) {
                    //Currently the only way to check if upgrade failure is status=255
                    progressStatus = -10;
                }
                else if (status && status > self.firmwareCurrentProgressStatus) {
                    progressStatus = status;
                }
                else {
                    return false;
                }
            }
            self.firmwareCurrentProgressStatus = progressStatus;    // This field is required, though it looks redundant while called from GetStatusForDownload, but not on a call from elsewhere
            self.UpgradePercent(progressStatus);
            if (progressStatus == 100 || progressStatus == -10) {     // This marks the completion of upgrade status
                if (setIntervalId) {
                    clearInterval(setIntervalId);   // Stop the interval iterator
                }
                if (progressStatus == -10) { //No status from the service call
                    //alertify.alert("Could not complete firmware download. Please try again.");
                    self.firmwareCurrentProgressStatus = 5;
                    self.UpgradePercent(5);
                    SetUpgradeState(false, Resources.FW_Failedtoupdateto + updatedversion);
                }
                else if (progressStatus == 100) {
                    if (updatedversion && updatedversion != null && $.trim(updatedversion) != "") {
                        self.FwVersion(updatedversion);
                    }
                    SetUpgradeState(false, updatedversion);
                }
                return true;
            }
            return false;
        }

        /*Get the firmware device status from the server Praneesh 28 Jan 2015*/
        function GetActualFirmwareDownloadStatusAndUpdateUI(progressIntervalId, currentProgressPercent) {
            var deviceIds = new Array();
            deviceIds.push(self.Id);
            datacontext.getfwupgradeStaus(deviceIds).done(function (jResult) {
                if (jResult.Success) {
                    if (jResult.data) {
                        var statusArr = jResult.data; //jResult.data.split("#");
                        if (statusArr && statusArr.length > 0) {
                            if (statusArr[0] != null && statusArr[0]) {
                                SimulateFirmwareDownloadStatusAndUpdateUI(progressIntervalId, currentProgressPercent, statusArr[0]);

                                //var status = statusArr[0].Status;
                                //var isComplete = statusArr[0].IsComplete;
                                //var version = statusArr[0].Version;

                                //SetUpgradeDescription(statusArr[0].Description);
                                //if (isComplete) {
                                //    SimulateFirmwareDownloadStatusAndUpdateUI(progressIntervalId, 100, version);
                                //}
                                //else if (status > 100) {
                                //    //Currently the only way to check if upgrade failure is status=255
                                //    SimulateFirmwareDownloadStatusAndUpdateUI(progressIntervalId, -10, version);
                                //}
                                //else {
                                //    var realUpdateStatus = status;
                                //    if (realUpdateStatus && realUpdateStatus > currentProgressPercent) {
                                //        SimulateFirmwareDownloadStatusAndUpdateUI(progressIntervalId, realUpdateStatus, version);
                                //    }
                                //}
                            }
                        }
                    }
                }
            }).fail(function () { });
        }
        function SetUpgradeState(isupgrading, firmwareversion) {
            if (!self.CanUpgrade()) {
                self.UpgradeStatus(Resources.FW_Deviceofflineornotregistered);
                return;
            }
            if (isupgrading) {
                self.ShowUpgradeButton(false);
            }
            else {
                if (firmwareversion && firmwareversion != null && $.trim(firmwareversion) != "") {
                    self.UpgradeStatus($.trim(firmwareversion));
                }
                else if (self.SelectedFirmware()) {
                    self.ShowUpgradeButton(true);
                    self.UpgradeStatus($.trim(self.SelectedFirmware().Version));
                }
                else {
                    self.UpgradeStatus(Resources.FW_Selectfirmwaretoupgrade);
                }
            }
            self.IsUpgrading(isupgrading);
        }
        function SetUpgradeDescription(descriptiontext) {
            //Currently we are taking description from database and showing the same in UI
            //In future there should be upgradestatuscode which will tell downloading/upgrading/upgraded and based on the code localised string should be there in client side -VV
            if (descriptiontext && $.trim(descriptiontext) !== "") {
                self.UpgradeDescription(descriptiontext);
            }
            else {
                self.UpgradeDescription(Resources.In_Progress);
            }
        }

        function InitModel() {
            if (self.CanUpgrade()) {
                if (fulldata.UpgradeProgress != null) {
                    self.GetStatusForDownload(fulldata.UpgradeProgress);
                    fulldata.UpgradeProgress = null;
                }
                else {
                    self.UpgradeStatus(Resources.FW_Selectfirmwaretoupgrade);
                }
            }
            else {
                self.UpgradeStatus(Resources.FW_Deviceofflineornotregistered);
            }
        }
        InitModel();
    };

    var fugDeviceModel = function (data) {
        var self = this;
        data = data || {};
        self.Id = data.ModelId;
        self.Name = data.Name;
        self.DisplayName = data.DisplayName;

    }
    var fugFwVersion = function (data) {
        var self = this;
        data = data || {};
        self.Version = data.Version;
        self.Name = data.Name;
        self.Id = data.Id;
        self.DeviceType = data.ModelDeviceType;
    }
    var fUgPageModel = function () {
        var self = this;
        var sourcedata = null;
        self.orginalSource = ko.observableArray([]);
        self.deviceUpgradeSource = ko.observableArray([]);
        self.searchDeviceSource = ko.observableArray([]);
        self.SelectedDeviceModel = ko.observable();
        self.CanSelectAll = ko.observable(false);
        self.IsAllSelected = ko.observable(false);
        self.SelectedVersion = ko.observable();
        self.DeviceModelsource = ko.observableArray([]);
        self.VersionSource = ko.observableArray([]);
        self.SelectedRows = ko.observableArray([]);
        self.SelectedDeviceModel.subscribe(function (val) {
            try {
                console.log("Device tpe Selected " + val);
                self.SelectedVersion(null);
                self.VersionSource([]);
                self.CanSelectAll(false);
                if (val) {
                    self.LoadFirmwareDetails(val.Id);
                    fltrdevsonmdt(val.Name);
                    if (self.deviceUpgradeSource().length > 0) {
                        self.CanSelectAll(true);
                    }
                }
                else {
                    fltrdevsonmdt();
                    console.info("selected device type is empty");
                }
            } catch (e) {
                console.error(e);
            }
        });
        self.IsEnabled = ko.computed(function () {
            if (self.orginalSource() && self.orginalSource().length > 0) {
                return true;
            }
            return false;
        });
        function fltrdevsonmdt(devType) {
            try {
                var filteredSource = $.map(self.orginalSource(), function (item) {
                    if (devType == undefined || (devType && item.UniqueId && item.UniqueId.toLowerCase() == devType.toLowerCase())) {
                        return item;
                    }
                });

                self.deviceUpgradeSource([]);
                if (filteredSource && filteredSource.length > 0) {
                    self.deviceUpgradeSource(filteredSource);
                }
            } catch (e) {
                console.error(e);
            }
        }
        self.SelectedVersion.subscribe(function (val) {
            try {
                if (val) {
                    $.map(self.deviceUpgradeSource(), function (item) {
                        item.SelectedFirmware(val);
                    });
                    selectedFirmware = val;
                }
                else {
                    $.map(self.deviceUpgradeSource(), function (item) {
                        item.SelectedFirmware(null);
                    });
                    selectedFirmware = null;
                }
            } catch (e) {
                console.error(e);
            }
        });

        self.AddSelectedDevice = function (device) {
            try {
                if (device) {
                    self.SelectedRows.push(device);
                }
            } catch (e) {
                console.error(e);
            }
        }
        self.RemoveSelectedDevice = function (deviceId) {
            try {
                if (deviceId) {
                    var fEle = self.SelectedRows().filter(function (ele) {
                        return ele.Id == deviceId;
                    });
                    self.SelectedRows.remove(fEle);
                }
            } catch (e) {
                console.error(e);
            }
        }
        self.UpgradeAllClick = function (data, event) {
            if (!self.SelectedDeviceModel() && !self.SelectedDeviceModel().Id) {
                alertify.alert(Resources.FW_Pleaseselecteddevicetype);
                return;
            }
            else {
                if (selectedFirmware && selectedFirmware.Id) {
                    datacontext.upgradeFirmware({
                        FirmwareId: selectedFirmware.Id,
                        DeviceType: self.deviceUpgradeSource()[0].EntityType,
                        DeviceIds: $.map(self.deviceUpgradeSource(), function (devs) {
                            if (selectedFirmware.Version != devs.FwVersion) {
                                return devs.Id;
                            }
                        })
                    }).done(function (response) {
                        if (response.Success) {
                            GetAllFirmwareDownloadStatus();
                        }
                        else {
                            alertify.alert(Resources.FW_FailedtotriggerfirmwaredownloadPleasetryagain);
                        }
                    }).fail(function () {
                        alertify.alert(Resources.FW_FailedtotriggerfirmwaredownloadPleasetryagain);
                    });
                }
                else {
                    alertify.alert(Resources.FW_PleaseselectedSupportedFirmwareversion);
                    return;
                }
            }
        };
        self.CanUpgradeAll = function () {
            return true;
        }
        self.LoadFirmwareDetails = function (modelId) {
            try {
                self.VersionSource([]);
                datacontext.getversionsource(modelId).done(function (jResult) {
                    if (jResult.Success) {
                        if (jResult.data.length > 0) {
                            self.VersionSource($.map(jResult.data, function (fItem) {
                                return new fugFwVersion(fItem);
                            }));
                        }
                        else {
                            alertify.alert(Resources.FW_Nofirmwarefilesfoundforselecteddevicetype);
                        }
                    }
                    else {
                        console.error( "failed to fetch fwversion details");
                    }
                }).fail(function () {
                    console.error("error on fetcching fwversion details");
                });

            } catch (e) {
                console.error(e);
            }
        }
        self.IsAllSelected.subscribe(function (newval) {
            if (self.deviceUpgradeSource() <= 0) {
                return;
            }
            if (newval) {
                $.map(self.deviceUpgradeSource(), function (ugs) {
                    if (ugs.CanUpgrade() && !ugs.IsUpgrading()) {
                        ugs.IsSelected(newval);
                    }
                });
            }
            else {
                $.map(self.deviceUpgradeSource(), function (ugs) {
                    ugs.IsSelected(newval);
                });
            }
        });
        function loadDeviceModelDetails() {
            try {
                uicontext.showloading(true);
                console.log("Loading DTM Initiated");
                datacontext.getdevicemodelSource().done(function (jResult) {
                    if (jResult.Success) {
                        var devModels = $.map(jResult.data, function (dmodel) {
                            return new fugDeviceModel(dmodel);
                        });
                        self.DeviceModelsource(devModels);
                        uicontext.showloading(false);
                        console.log("Loading DTM completed");
                    }
                    else {
                        uicontext.showloading(false);
                        console.log("Loading DTM failed to fetch" + (jResult.errorMessage && jResult.errorMessage != "") ? jResult.errorMessage : "");
                    }
                }).fail(function () {
                    uicontext.showloading(false);
                    console.log("Loading DTM request failed");
                });
            } catch (e) {
                uicontext.showloading(false);
                console.error(e);
            }
        }
        self.initialize = function () {
            try {
                uicontext.showloading(true);
                self.deviceUpgradeSource([]);
                self.DeviceModelsource([]);
                self.VersionSource([]);
                self.SelectedDeviceModel(null);
                self.SelectedVersion(null);
                selectedFirmware = null;
                datacontext.getdeviceSourceforSite().done(function (jResult) {
                    if (jResult.Success) {
                        sourcedata = jResult.data;
                        self.deviceUpgradeSource([]);
                        var fugmodels = $.map(sourcedata, function (dItem) {
                            //if (dItem.Status && dItem.Status.toLowerCase() == common.constants.devicestatus.ONLINE.toLowerCase())
                            return new fUgModel(dItem);
                        });
                        self.orginalSource(fugmodels);
                        self.deviceUpgradeSource(fugmodels);
                        uicontext.showloading(false);
                        if (self.orginalSource().length <= 0) {
                            alertify.alert(Resources.Firmware_NoDevices);
                        }
                    }
                    else {
                        console.error("failed to fetch supported devices");
                    }
                }).fail(function () { });

                loadDeviceModelDetails();
            } catch (e) {
            }
        }
        self.query = ko.observable('');
        self.UpdatedSource = ko.computed(function () {
            try {
                if (self.query()) {
                    var find = self.query().toLowerCase();
                    return ko.utils.arrayFilter(self.deviceUpgradeSource(), function (dev) {
                        return dev.DeviceName().toLowerCase().indexOf(find) >= 0;
                    });
                }
                else {
                    return self.deviceUpgradeSource();
                }
            } catch (e) {
                console.error(e);
            }
        });
    }
    function GetAllFirmwareDownloadStatus(deviceIdObject) {

    }

    function triggerFirmwareDownload() {
    }
    function getmydownloadStatus(deviId) {
        return 100;
    }
    datacontext.getmydownloadStatus = getmydownloadStatus;
    datacontext.fUgPageModel = fUgPageModel;
    // datacontext.fugmodel = fUgModel;
})($, ko, window.firmwareug.common, window.firmwareug.datacontext, window.firmwareug.uicontext);