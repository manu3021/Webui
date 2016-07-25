/// <reference path="mpcastorage.common.js" />
/// <reference path="mpcastorage.datacontext.js" />
window.mpcastorageconfig.storagesettingmodel = (function (ko, common, datacontext) {
    var deviceStorageEntity = function () {
        var self = this;
        self.StorageType = 0;
        self.StorageMode = 0;
        self.NASPath = "";
        self.Vendor = "";

        self.toJson = function () {
            return ko.toJSON(self);
        }
    }

    var storageentity = function () {
        var self = this;
        var data = null;
        var isdatainitialised = false;
        var isorgnetworkstorage = false;
        self.InternalSpaceUsedPercent = ko.observable();
        self.InternalSpaceUsedText = ko.observable("");
        self.ExternalSpaceUsedPercent = ko.observable();
        self.ExternalSpaceUsedText = ko.observable("");
        self.IsNetworkStorage = ko.observable(false);
        self.NASPath = ko.observable("");
        self.Vendor = ko.observable("");
        self.IsUSBStorage = ko.observable(false);
        self.USBStorageMode = ko.observable("");
        self.IsDisableNetworkStorage = ko.observable(false);
        self.IsEnableNASErase = ko.observable(false);
        self.IsEnableUSBErase = ko.observable(false);
        self.IsEnableUSBEject = ko.observable(false);
        self.Id = "";
        self.ErrorMessage = ko.observable("");
        self.IsError = ko.observable(false);

        self.USBStorageMode.subscribe(function (newval) {
            //if (!isdatainitialised)
            //    return;
            if (self.USBStorageMode() == common.constants.storagemode.RecordingMode) {
                self.IsNetworkStorage(false);
                self.IsDisableNetworkStorage(true);
            }
            else
                self.IsDisableNetworkStorage(false);
        });
        self.IsUSBStorage.subscribe(function (newval) {
            //if (!isdatainitialised)
            //    return;
            self.USBStorageMode(-1);
        });

        self.doInternalStorageErase = function () {
            alertify.confirm(common.messages.ers_int_strg_rbt_dev, function (e) {
                if (e) {
                    datacontext.erasestorage(common.constants.storagetype.INTERNAL, function (success) {
                        if (success)
                            alertify.success(common.messages.int_strg_ers_success);
                        else
                            alertify.error(common.messages.int_strg_ers_error);
                    });
                }
            });
        };
        self.doNetworkStorageErase = function () {
            alertify.confirm(common.messages.ers_nw_strg_rbt_dev, function (e) {
                if (e) {
                    datacontext.erasestorage(common.constants.storagetype.NETWORK, function (success) {
                        if (success)
                            alertify.success(common.messages.nw_strg_ers_success);
                        else
                            alertify.error(common.messages.nw_strg_ers_error);
                    });
                }
            });
        };
        self.doUSBStorageErase = function () {
            alertify.confirm(common.messages.ers_usb_strg_rbt_dev, function (e) {
                if (e) {
                    datacontext.erasestorage(common.constants.storagetype.USB, function (success) {
                        if (success)
                            alertify.success(common.messages.usb_strg_ers_success);
                        else
                            alertify.error(common.messages.usb_strg_ers_error);
                    });
                }
            });
        };
        self.doUSBStorageEject = function () {
            alertify.confirm(common.messages.usb_strg_ejct_cnfm, function (e) {
                if (e) {
                    datacontext.ejectstorage(common.constants.storagetype.USB, function (success) {
                        if (success)
                            alertify.success(common.messages.usb_strg_ejct_success);
                        else
                            alertify.error(common.messages.usb_strg_ejct_error);
                    });
                }
            });
        };
        self.dosavesettings = function () {
            if (self.IsUSBStorage() && self.USBStorageMode() == common.constants.storagemode.None) {
                alertify.error(common.messages.usb_strg_md_ntslc);
                return;
            }
            if (isorgnetworkstorage != self.IsNetworkStorage()) {
                alertify.confirm(common.messages.nw_strg_save_rbt_dev, function (e) {
                    if (e) {
                        if (window.mpcastorageconfig.uicontext.validateform()) {
                            blockUI();
                            datacontext.savestoragedetail(self.toJson(), function (successresult) {
                                var msg = common.messages.storage_save_success;
                                if (successresult.recorderstatus && successresult.recorderstatus.toLowerCase() != common.constants.recorderstatus.ONLINE.toLowerCase()) {
                                    msg += "." + common.messages.devoffline_cnfgdwnOnOnl;
                                }
                                onsaveresetmodel(true);
                                alertify.success(msg);
                                unblockUI();
                            }, function (errorresult) {
                                onsaveresetmodel(false);
                                self.ErrorMessage(errorresult.error);
                                alertify.error(errorresult.error);
                                unblockUI();
                            });
                        }
                    }
                });
            }
            else {
                if (window.mpcastorageconfig.uicontext.validateform()) {
                    blockUI();
                    datacontext.savestoragedetail(self.toJson(), function (successresult) {
                        var msg = common.messages.storage_save_success;
                        if (successresult.recorderstatus && successresult.recorderstatus.toLowerCase() != common.constants.recorderstatus.ONLINE.toLowerCase()) {
                            msg += "." + common.messages.devoffline_cnfgdwnOnOnl;
                        }
                        onsaveresetmodel(true);
                        alertify.success(msg);
                        unblockUI();
                    }, function (errorresult) {
                        onsaveresetmodel(false);
                        self.ErrorMessage(errorresult.error);
                        alertify.error(errorresult.error);
                        unblockUI();
                    });
                }
            }
        }
        self.toJson = function () {
            var devicestorages = [];
            if (self.IsNetworkStorage()) {
                var nwstrg = new deviceStorageEntity();
                nwstrg.StorageType = common.constants.storagetype.NETWORK;
                nwstrg.NASPath = self.NASPath();
                nwstrg.Vendor = self.Vendor();
                devicestorages.push(nwstrg);
            }
            if (self.IsUSBStorage()) {
                var usbstrg = new deviceStorageEntity();
                usbstrg.StorageType = common.constants.storagetype.USB;
                usbstrg.StorageMode = self.USBStorageMode();
                devicestorages.push(usbstrg);
            }

            return ko.toJSON(devicestorages);
        }
        self.Initialise = function (id, initdata) {
            data = initdata;

            isdatainitialised = false;
            self.Id = id;

            var internalstorage = null;
            var networkstorage = null;
            var usbstorage = null;
            $.each(initdata, function (index, item) {
                if (item.StorageType == common.constants.storagetype.INTERNAL) {
                    internalstorage = item;
                }
                else if (item.StorageType == common.constants.storagetype.NETWORK) {
                    networkstorage = item;
                }
                else if (item.StorageType == common.constants.storagetype.USB) {
                    usbstorage = item;
                }
            });

            if (internalstorage) {
                self.InternalSpaceUsedPercent(getInternalSpaceUsedPercent(internalstorage));
                self.InternalSpaceUsedText(getInternalSpaceUsedText(internalstorage));
            }
            var externalSpaceUsedText = common.messages.ex_strg_nt_cnt;
            if (networkstorage) {
                isorgnetworkstorage = true;
                if (networkstorage.StorageState != common.constants.storagestate.Ready)
                    self.IsEnableNASErase(false);
                else
                    self.IsEnableNASErase(true);
                self.IsNetworkStorage(true);
                self.NASPath(networkstorage.NASPath);
                self.Vendor(networkstorage.Vendor);
                self.ExternalSpaceUsedPercent(getExternalSpaceUsedPercent(networkstorage));
                externalSpaceUsedText = getExternalSpaceUsedText(networkstorage);
            }
            else {
                //Reset Network storage
                self.IsNetworkStorage(false);
                self.IsEnableNASErase(false);
                self.NASPath("");
                self.Vendor("");
            }
            if (usbstorage) {
                if (usbstorage.StorageState != common.constants.storagestate.Ready)
                    self.IsEnableUSBEject(false);
                else
                    self.IsEnableUSBEject(true);
                self.IsUSBStorage(true);
                if (usbstorage.StorageMode == common.constants.storagemode.RecordingMode) {
                    if (usbstorage.StorageState != common.constants.storagestate.Ready)
                        self.IsEnableUSBErase(false);
                    else
                        self.IsEnableUSBErase(true);
                    self.ExternalSpaceUsedPercent(getExternalSpaceUsedPercent(usbstorage));
                    externalSpaceUsedText = getExternalSpaceUsedText(usbstorage);
                    self.USBStorageMode(common.constants.storagemode.RecordingMode);
                    //Reset Network storage
                    self.IsNetworkStorage(false);
                    self.IsEnableNASErase(false);
                    self.NASPath("");
                    self.Vendor("");
                }
                else {
                    if (!self.IsNetworkStorage() && usbstorage.StorageState == common.constants.storagestate.Ready) {
                        self.ExternalSpaceUsedPercent(0.01);
                        externalSpaceUsedText = common.messages.usb_strg_expmd;
                    }
                    self.USBStorageMode(common.constants.storagemode.ExportMode);
                }
            }
            else {
                self.IsUSBStorage(false);
                self.IsEnableUSBEject(false);
                self.USBStorageMode(common.constants.storagemode.None);
            }
            self.ExternalSpaceUsedText(externalSpaceUsedText);
            self.ErrorMessage("");
            self.IsError(false);

            isdatainitialised = true;
        }

        function getInternalSpaceUsedPercent(info) {
            if (info.TotalSpace == 0)
                return 0.01; //this is because progress bar will not be shown if zero is assigned
            var val = info.UsedSpace / info.TotalSpace * 100;
            return val;
        }
        function getInternalSpaceUsedText(info) {
            if (info.StorageState == common.constants.storagestate.DeviceInactive || info.TotalSpace == 0) {
                return common.messages.dev_offline;
            }
            return info.UsedSpace + " / " + info.TotalSpace + " GB";
        }
        function getExternalSpaceUsedPercent(info) {
            if (info.TotalSpace == 0)
                return 0.01; //this is because progress bar will not be shown if zero is assigned
            var val = info.UsedSpace / info.TotalSpace * 100;
            return val;
        }
        function getExternalSpaceUsedText(info) {
            if (info.StorageState == common.constants.storagestate.DeviceInactive) {
                return common.messages.dev_offline;
            }
            else if (info.StorageState == common.constants.storagestate.NotConnected) {
                return common.messages.ex_strg_nt_cnt;
            }
            else if (info.StorageState == common.constants.storagestate.Formatting) {
                return common.messages.ex_strg_frmt;
            }
            else if (info.StorageState == common.constants.storagestate.NotMounted) {
                return common.messages.ex_strg_nt_mnt;
            }
            else if (info.TotalSpace == 0) {
                return common.messages.ex_strg_nt_cnt;
            }
            return info.UsedSpace + " / " + info.TotalSpace + " GB";
        }
        function onsaveresetmodel(success) {
            if (success) {
                self.IsEnableNASErase(self.IsNetworkStorage());
                isorgnetworkstorage = self.IsNetworkStorage();

                if (self.USBStorageMode() == common.constants.storagemode.RecordingMode)
                    self.IsEnableUSBErase(true);
                else
                    self.IsEnableUSBErase(false);

                self.IsEnableUSBEject(self.IsUSBStorage());

                if (!(self.IsNetworkStorage() || (self.IsUSBStorage() && self.USBStorageMode() == common.constants.storagemode.RecordingMode))) {
                    self.ExternalSpaceUsedText(common.messages.ex_strg_nt_cnt);
                    self.ExternalSpaceUsedPercent(0);
                }
            }
            self.IsError(!success);
        }
    }

    datacontext.storageentity = storageentity;

})(ko, window.mpcastorageconfig.common, window.mpcastorageconfig.datacontext);

