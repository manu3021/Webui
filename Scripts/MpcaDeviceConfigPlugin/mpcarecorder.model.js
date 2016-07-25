


/// <reference path="mpcarecorder.common.js" />
/// <reference path="mpcarecorder.datacontext.js" />
window.mpcarecorderconfig.recordersettingmodel = (function (ko, common, datacontext) {
    var recorderentity = function () {
        var self = this;
        var data = null;
        var isinitialised = false;
        var defaultMask = "999999999999"
        var initvideoformat = common.constants.videoformats.NTSC;
        self.PasswordField = ko.observable(defaultMask);
        self.UniqueIdField = ko.observable(defaultMask);
        self.Name = ko.observable();
        self.Id = "";
        self.ParentId = "";
        self.DeviceType = "";
        self.UniqueId = ko.observable();
        self.NetworkSetting = {
            IpAddress: ko.observable(),
            HttpPort: ko.observable(),
            DNSServer: ko.observable(),
            ObtainAutoIp: ko.observable(),
            SubnetMask: ko.observable(),
            Gateway: ko.observable()
        }
        self.RecorderSetting = {
            FirmwareVersion: ko.observable(),
            HardwareVersion: ko.observable(),
            MacAddress: ko.observable(),
            Username: ko.observable(),
            Password: ko.observable(),
            VideoFormat: ko.observable()
        }
        self.MaxproConnectSetting = {
            IsEnabled: ko.observable(false),
            ServerUrl: ko.observable()
        }
        self.IsEditUniqueId = ko.observable(false);
        self.IsUniqueIdChanged = ko.observable(false);
        self.uniqueidbuttontext = ko.observable(Resources.Edit);
        self.IsRegistered = ko.observable();
        self.IsConfigUploaded = ko.observable();
        self.ErrorMessage = ko.observable("");
        self.IsError = ko.observable(false);
        self.Status = ko.observable(common.constants.devicestatus.NOTREGISTERED);
        self.IsDeviceOnline = ko.computed(function () {
            if (self.Status().toLowerCase() == common.constants.devicestatus.ONLINE.toLowerCase()) {
                return true;
            }
            return false;
        });
        self.RegLoaderContainerStyle = ko.observable("inprogress");
        self.RegLoaderStyle = ko.observable("");
        self.IsRegDoRefresh = ko.observable(true);
        self.RegLoaderText = ko.observable(Resources.devregpnd);

        self.ConfLoaderContainerStyle = ko.observable("incomplete");
        self.ConfLoaderStyle = ko.observable("notloader");
        self.IsConfDoRefresh = ko.observable(false);
        self.ConfLoaderText = ko.observable(Resources.cfguplpnd);
        self.IsRegistered.subscribe(function (newVal) {
            if (newVal) {
                self.RegLoaderContainerStyle("complete");
                self.RegLoaderStyle("loaded");
                self.IsRegDoRefresh(false);
                self.RegLoaderText(Resources.DvRegSucc);
                if (!self.IsConfigUploaded()) {
                    self.ConfLoaderContainerStyle("inprogress");
                    self.ConfLoaderStyle("");
                    self.IsConfDoRefresh(true);
                }
                else {
                    self.RegLoaderContainerStyle("complete");
                    self.RegLoaderStyle("loaded");
                    self.IsRegDoRefresh(false);
                    self.ConfLoaderText(Resources.cfguplsucc);
                }
            }
            else {
                self.RegLoaderContainerStyle("inprogress");
                self.RegLoaderStyle("");
                self.IsRegDoRefresh(true);
                self.RegLoaderText(Resources.devregpnd);
                self.ConfLoaderContainerStyle("incomplete");
                self.ConfLoaderStyle("notloader");
                self.IsConfDoRefresh(false);
                self.ConfLoaderText(Resources.cfguplpnd);
            }
        });
        self.IsConfigUploaded.subscribe(function (newVal) {
            if (newVal) {
                self.RegLoaderContainerStyle("complete");
                self.RegLoaderStyle("loaded");
                self.IsRegDoRefresh(false);
                self.RegLoaderText(Resources.DvRegSucc);
                self.RegLoaderContainerStyle("complete");
                self.RegLoaderStyle("loaded");
                self.IsRegDoRefresh(false);
                self.ConfLoaderText(Resources.cfguplsucc);
            }
            else {
                self.IsRegistered(self.IsRegistered());
            }
        });
        self.NetworkSetting.ObtainAutoIp.subscribe(function (newVal) {
            if (newVal) {
                self.NetworkSetting.IpAddress(data.NetworkSetting.IpAddress);
                self.NetworkSetting.DNSServer(data.NetworkSetting.DNSServer);
                self.NetworkSetting.SubnetMask(data.NetworkSetting.SubnetMask);
                self.NetworkSetting.Gateway(data.NetworkSetting.Gateway);
            }
            if (isinitialised) {
                window.mpcarecorderconfig.uicontext.validateform();
            }
        });
        self.MaxproConnectSetting.IsEnabled.subscribe(function (newVal) {
            if (!newVal) {
                self.MaxproConnectSetting.ServerUrl(data.MaxproConnectSetting.ServerUrl);
            }
            if (isinitialised) {
                window.mpcarecorderconfig.uicontext.validateform();
            }
        });
        self.doreboot = function (event, edata) {
            alertify.confirm(common.messages.recorder_reboot_cnf, function (e) {
                if (e) {
                    var uniqid = self.UniqueId();
                    if (self.IsUniqueIdChanged())
                        uniqid = data.UniqueId;
                    datacontext.rebootdevice(uniqid, function (success) {
                        if (success)
                            alertify.success(common.messages.recorder_reboot_init);
                        else
                            alertify.error(common.messages.recorder_reboot_error);
                    });
                }
            });
        };
        self.dorefresh = function (event, edata) {
            datacontext.refreshdevicestatus(function (result) {
                window.mpcarecorderconfig.uicontext.onregistrationstatusrefresh(result);
            }, function (result) {
                //error case
                window.mpcarecorderconfig.uicontext.onregistrationstatusrefresh();
            });
        }
        self.IsEditUniqueId.subscribe(function (newval) {
            if (newval) {
                self.UniqueIdField(self.UniqueId());
                self.uniqueidbuttontext(common.labels.savebuttontext);
            }
            else
                self.uniqueidbuttontext(common.labels.editbuttontext);
        });
        self.doedituniqueid = function (event, edata) {
            if (self.IsConfigUploaded()) {
                self.IsEditUniqueId(true);
            }
            else {
                if (self.IsEditUniqueId()) {
                    if (window.mpcarecorderconfig.uicontext.validateform()) {
                        setpasswordvalues();
                        datacontext.saverecorderdetail(self, function (successresult) {
                            onsaveresetmodel(true);
                            showerror(false);
                            alertify.success(common.messages.recorder_save_success);
                        }, function (errorresult) {
                            onsaveresetmodel(false);
                            showerror(true, errorresult.error);
                            alertify.error(errorresult.error);
                        });
                    }
                }
                else
                    self.IsEditUniqueId(!self.IsEditUniqueId());
            }
        }
        self.doresetdefaultauthen = function () {
            alertify.confirm(common.messages.recorder_rst_def_pwd_cnf, function (e) {
                if (e) {
                    var uniqid = self.UniqueId();
                    if (self.IsUniqueIdChanged())
                        uniqid = data.UniqueId;
                    datacontext.resetpassword(uniqid, false, function (success) {
                        if (success)
                            alertify.success(common.messages.recorder_pwdrst_success);
                        else
                            alertify.error(common.messages.recorder_pwdrst_error);
                    });
                }
            });
        };
        self.doupdatenewauthen = function () {
            alertify.confirm(common.messages.recorder_updt_pwd_cnf, function (e) {
                if (e) {
                    var uniqid = self.UniqueId();
                    if (self.IsUniqueIdChanged())
                        uniqid = data.UniqueId;
                    datacontext.resetpassword(uniqid, true, function (success) {
                        if (success)
                            alertify.success(common.messages.recorder_updtpwd_success);
                        else
                            alertify.error(common.messages.recorder_updtpwd_error);
                    });
                }
            });
        };
        self.dosavesettings = function (event, edata) {
            if (self.NetworkSetting.ObtainAutoIp() != data.NetworkSetting.ObtainAutoIp
                || (self.NetworkSetting.ObtainAutoIp() == false
                    && (self.NetworkSetting.IpAddress() != data.NetworkSetting.IpAddress
                        || self.NetworkSetting.DNSServer() != data.NetworkSetting.DNSServer
                        || self.NetworkSetting.SubnetMask() != data.NetworkSetting.SubnetMask
                        || self.NetworkSetting.Gateway() != data.NetworkSetting.Gateway))) {
                alertify.confirm(Resources.mpcarec_nw_chng_cnf, function (e) {
                    if (e) {
                        savemodel();
                    }
                    else {
                        self.NetworkSetting.IpAddress(data.NetworkSetting.IpAddress);
                        self.NetworkSetting.DNSServer(data.NetworkSetting.DNSServer);
                        self.NetworkSetting.SubnetMask(data.NetworkSetting.SubnetMask);
                        self.NetworkSetting.Gateway(data.NetworkSetting.Gateway);
                        self.NetworkSetting.ObtainAutoIp(data.NetworkSetting.ObtainAutoIp);
                        if (self.RecorderSetting.VideoFormat().toLowerCase() != initvideoformat.toLowerCase()) {
                            self.RecorderSetting.VideoFormat(initvideoformat);
                        }
                    }
                });
            }
            else if (self.RecorderSetting.VideoFormat().toLowerCase() != initvideoformat.toLowerCase()) {
                alertify.confirm(common.messages.recorder_vdfrmt_chng_cnf, function (e) {
                    if (e) {
                        savemodel();
                    }
                    else {
                        self.RecorderSetting.VideoFormat(initvideoformat);
                    }
                });
            }
            else {
                savemodel();
            }
        }
        self.toJson = function () {
            return ko.toJSON(self);
        }
        self.Initialise = function (initdata) {
            data = initdata;
            isinitialised = false;
            self.PasswordField(defaultMask);
            self.UniqueIdField(defaultMask);
            self.Name(initdata.Name);
            self.Id = initdata.Id;
            self.ParentId = initdata.ParentId;
            self.DeviceType = initdata.DeviceType;
            self.UniqueId(initdata.UniqueId);
            self.NetworkSetting.IpAddress(initdata.NetworkSetting.IpAddress);
            self.NetworkSetting.HttpPort(initdata.NetworkSetting.HttpPort);
            self.NetworkSetting.DNSServer(initdata.NetworkSetting.DNSServer);
            self.NetworkSetting.ObtainAutoIp(initdata.NetworkSetting.ObtainAutoIp);
            self.NetworkSetting.SubnetMask(initdata.NetworkSetting.SubnetMask);
            self.NetworkSetting.Gateway(initdata.NetworkSetting.Gateway);
            self.RecorderSetting.FirmwareVersion(initdata.RecorderSetting.FirmwareVersion);
            self.RecorderSetting.HardwareVersion(initdata.RecorderSetting.HardwareVersion);
            self.RecorderSetting.MacAddress(initdata.RecorderSetting.MacAddress);
            self.RecorderSetting.Username(initdata.RecorderSetting.Username);
            self.RecorderSetting.Password(initdata.RecorderSetting.Password);

            initvideoformat = initdata.RecorderSetting.VideoFormat;
            self.RecorderSetting.VideoFormat(initdata.RecorderSetting.VideoFormat);

            self.MaxproConnectSetting.IsEnabled(false);
            self.MaxproConnectSetting.ServerUrl(initdata.MaxproConnectSetting.ServerUrl);
            self.IsEditUniqueId(false);
            self.IsUniqueIdChanged(false);
            self.uniqueidbuttontext(Resources.Edit);
            self.IsRegistered(initdata.IsRegistered);
            self.IsConfigUploaded(initdata.IsConfigUploaded);
            self.ErrorMessage("");
            self.IsError(false);
            self.Status(initdata.Status);

            isinitialised = true;
        }

        function savemodel() {
            if (window.mpcarecorderconfig.uicontext.validateform()) {
                setpasswordvalues();
                blockUI();
                datacontext.saverecorderdetail(self, function (successresult) {
                    self.Status(successresult.data.Status);
                    var msg = common.messages.recorder_save_success;
                    if (self.Status().toLowerCase() != common.constants.devicestatus.ONLINE.toLowerCase()) {
                        msg += "." + common.messages.recorder_devoffline_cnfgdwnOnOnl;
                    }
                    showerror(false);
                    onsaveresetmodel(true, successresult.data);
                    alertify.success(msg);
                    unblockUI();
                }, function (errorresult) {
                    onsaveresetmodel(false);
                    showerror(true, errorresult.error);
                    alertify.error(errorresult.error);
                    unblockUI();
                });
            }
        }
        function showerror(iserror, errormsg) {
            //Not showing errors near, only on message we will be showing
            return;

            var ermsg = "";
            if (iserror) {
                if (errormsg == undefined || errormsg == null || errormsg == "") {
                    ermsg = common.messages.recorder_default_error;
                }
                else {
                    ermsg = errormsg;
                }
            }
            self.IsError(iserror);
            self.ErrorMessage(ermsg);
        }
        function onsaveresetmodel(success, newdata) {
            //self.IsError(!success);
            self.IsEditUniqueId(self.IsEditUniqueId() && !success);
            if (success) {
                initvideoformat = self.RecorderSetting.VideoFormat();
                self.PasswordField(defaultMask);
                self.UniqueIdField(defaultMask);
                self.IsUniqueIdChanged(false);
                data = newdata;                
            }
            self.MaxproConnectSetting.IsEnabled(self.MaxproConnectSetting.IsEnabled() && !success);
        }
        function setpasswordvalues() {
            if (self.PasswordField() != defaultMask && self.RecorderSetting.Password() != self.PasswordField())
                self.RecorderSetting.Password(self.PasswordField());
            if (self.UniqueIdField() != defaultMask && self.UniqueId() != self.UniqueIdField()) {
                self.UniqueId(self.UniqueIdField());
                self.IsUniqueIdChanged(true);
            }
        }
    }

    datacontext.recorderentity = recorderentity;

})(ko, window.mpcarecorderconfig.common, window.mpcarecorderconfig.datacontext);

