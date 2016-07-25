
/// <reference path="gateway-uicontext.js" />
/// <reference path="gateway-common.js" />
/// <reference path="gateway-datacontext.js" />
window.gatewayconfig.panelsettingmodel = (function (ko, common, datacontext) {
    var paneldeviceentity = function (data) {
        var self = this;
        data = data || {};
        self.Id = data.Id;
        self.Name = ko.observable(data.Name);
        self.Description = ko.observable(data.Description);
        self.ModelDeviceType = ko.observable(data.ModelDeviceType);
        self.GeographicTimeZone = ko.observable(data.GeographicTimeZone);
        self.CommChannelType = ko.observable(data.CommChannelType.toString());
        self.IPAddress = ko.observable(data.IPAddress);
        self.PortNumber = ko.observable(data.PortNumber.toString());
        self.Address = ko.observable(data.Address.toString());
        self.FirmwareVersion = ko.observable(data.FirmwareVersion == '' ? '3.4 Or Later' : data.FirmwareVersion);
        self.IsActive = ko.observable(data.IsActive);
        self.DownstreamBaudRate = ko.observable(data.DownstreamBaudRate.toString());
        self.IOPollInterval = ko.observable(data.IOPollInterval.toString());
        self.LoopVerificationOffset = ko.observable(data.LoopVerificationOffset.toString());
        self.CommandRetryCount = ko.observable(data.CommandRetryCount.toString());
        self.CommandTimeout = ko.observable(data.CommandTimeout.toString());
        self.BufferOnExit = ko.observable(data.BufferOnExit);
        self.UnBufferOnStartup = ko.observable(data.UnBufferOnStartup);
        self.RegionalTimeZone = ko.observable(data.RegionalTimeZone ? data.RegionalTimeZone : $('#site_RegionalTimeZone').val());
        self.ParentId = ko.observable(data.ParentId);
        self.ErrorMessage = ko.observable("");
        self.IsError = ko.observable(false);
        self.IsSetDateTimeEnabled = ko.observable(false);
        self.IsTwentyFourHour = ko.observable(true);
        self.IsSetDateTimeEnabled.subscribe(function (nVal) {
            self.IsTwentyFourHour(true);
            if (nVal) {
                $("#gatewaydeviceDateTime").datetimepicker({
                    //language: 'en',
                    pick12HourFormat: false,
                    format: Resources.datetime_picker_format,//'MM/dd/yyyy hh:mm:ss',
                    // enabling previous 2 days to use diffrent time zone
                    startDate: new Date((new Date()).setDate((new Date()).getDate() - 2))
                });
            }
            else {
                $("#gatewaydeviceDateTime").datetimepicker("destroy");
                $("#gatewaydeviceDateTime").find('input').val("");
            }
        });
        self.DeviceRegStatus = ko.observable(data.DeviceRegStatus);
        self.Status = ko.observable(data.Status);
        self.IsDeviceOnline = ko.computed(function () {
            if (self.Status().toLowerCase() == common.constants.online.toLowerCase()) {
                return true;
            }
            return false;
        });
        self.IsRegistered = ko.observable(data.IsRegistered);
        self.IsConfigurationUploaded = ko.observable(data.IsConfigurationUploaded);
        self.Forgive = ko.observable(data.Forgive);
        self.Duress = ko.observable(data.Duress);
        self.ReverseLEDs = ko.observable(data.ReverseLEDs);
        self.ContinuousRead = ko.observable(data.ContinuousRead);
        self.FreeEgressInputs = ko.observable(data.FreeEgressInputs);
        self.DeviceTime = ko.observable("");
        self.AntiPassbackEnabled = ko.observable(data.AntiPassbackEnabled);
        if (data.AntiPassbackEnabled)
            self.GlobalAntiPassback = ko.observable(data.GlobalAntiPassback);


        var defaultMask = "************"
        self.PasswordField = ko.observable(defaultMask);
        self.UniqueIdField = ko.observable(defaultMask);
        self.IsEditUniqueId = ko.observable(false);
        self.UniqueId = ko.observable(data.PanelUniqueKeySetting.UniqueKey);
        self.IsUniqueIdChanged = ko.observable(false);
        self.uniqueidbuttontext = ko.observable("Edit");
        self.PanelUniqueKeySetting = {
            UniqueKey: ko.observable(data.PanelUniqueKeySetting.UniqueKey),
            UserName: ko.observable(data.PanelUniqueKeySetting.UserName),
            Password: ko.observable(data.PanelUniqueKeySetting.Password),
        }
        self.RegLoaderContainerStyle = ko.observable("inprogress");
        self.RegLoaderStyle = ko.observable("");
        self.IsRegDoRefresh = ko.observable(true);
        self.RegLoaderText = ko.observable(Resources.devregpnd);

        self.ConfLoaderContainerStyle = ko.observable("incomplete");
        self.ConfLoaderStyle = ko.observable("notloader");
        self.IsConfDoRefresh = ko.observable(false);
        self.ConfLoaderText = ko.observable(Resources.cfguplpnd);
        self.UpdateRefreshStatus = function () {
            if (self.IsRegistered()) {
                self.RegLoaderContainerStyle("complete");
                self.RegLoaderStyle("loaded");
                self.IsRegDoRefresh(false);
                self.RegLoaderText(Resources.DvRegSucc);
                if (!self.IsConfigurationUploaded()) {
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
        };
        self.IsEditUniqueId.subscribe(function (newValue) {
            if (newValue) {
                self.UniqueIdField(self.UniqueId());
                self.uniqueidbuttontext(common.labels.savebuttontext);
            }
            else {
                self.uniqueidbuttontext(common.labels.editbuttontext);
            }
        });

        self.doedituniqueid = function (event, data) {
            if (self.IsRegistered() && self.IsConfigurationUploaded()) {
                self.IsEditUniqueId(true);
            }
            else {
                if (self.IsEditUniqueId()) {
                    if (window.gatewayconfig.uicontext.validateform()) {
                        setpasswordvalues();
                        datacontext.changeuniqueid(self, function () {
                            onsaveresetmodel(true);
                            alertify.success(common.messages.panel_uniqueid_save_success);
                        },
                        function () {
                            onsaveresetmodel(false);
                            //self.ErrorMessage("Error on Server");
                            alertify.error(common.messages.panel_uniqueid_save_error);
                        });
                    }
                }
                else {
                    self.IsEditUniqueId(!self.IsEditUniqueId());
                }
            }
        }

        function onsaveresetmodel(success) {
            self.IsError(!success);
            self.IsEditUniqueId(!success);
            if (success) {
                self.PasswordField(defaultMask);
                self.UniqueIdField(defaultMask);
                self.IsUniqueIdChanged(false);
            }
        }

        function setpasswordvalues() {
            if (defaultMask != self.PasswordField()) {
                self.PanelUniqueKeySetting.Password(self.PasswordField());
            }
            if (defaultMask != self.UniqueIdField()) {
                self.UniqueId(self.UniqueIdField());
                self.IsUniqueIdChanged(true);
            }
        }


        self.dorefresh = function (event, data) {
            datacontext.refreshdeviceregisterstatus(function (isregistered, isconfigurationuploaded) {
                self.IsRegistered(isregistered);
                self.IsConfigurationUploaded(isconfigurationuploaded);
                window.gatewayconfig.uicontext.onregistrationstatusrefresh();
            });
        }

        self.doreset = function (event, data) {
            alertify.confirm(common.messages.panel_reset_password_confirm, function (e) {
                if (e) {
                    datacontext.resetdevicepassword(self, function (issuccess) {
                        alertify.success(common.messages.panel_reset_password);
                    });
                }
            });
        }

        self.doupdate = function (event, data) {
            alertify.confirm(common.messages.panel_update_password_confirm, function (e) {
                if (e) {
                    datacontext.updatedevicepassword(self,function (issuccess) {
                        alertify.success(common.messages.panel_update_password);
                    });
                }
            });            
        }

        self.saveGateway = function (event, data) {
            if (window.gatewayconfig.uicontext.validateform()) {
            
                var deviceTime = window.gatewayconfig.uicontext.getDeviceTime();
                self.DeviceTime(deviceTime == null ? "" : deviceTime);
                //if (oldModelData() == ko.toJSON(self)) {
                //    alertify.alert(Resources.NoChangesDetected);
                //    return;
                //}
                blockUI();
                datacontext.savepaneldetail(self, function (successresult) {
                    setHiddens(self.AntiPassbackEnabled(), self.Duress());
                    if (successresult.Status.toLowerCase() != common.constants.online.toLowerCase()) {
                        alertify.success(common.messages.panel_status_offline);
                    }
                    else
                    alertify.success(common.messages.panel_save_success);
                    oldModelData(ko.toJSON(self));
                    unblockUI();
                }, function (errorresult) {
                    if (errorresult.indexOf('SERVICE_NOT_AVAILABLE') > 0 || errorresult.indexOf('PANEL_NOT_DOWNLOADED') > 0) {
                        setHiddens(self.AntiPassbackEnabled(), self.Duress());                   
                    }
                    alertify.error(common.messages.panel_save_error);
                    unblockUI();
                });
            }
        }

        self.syncGateway = function (event, data) {
            datacontext.syncGateway(function (issuccess) {
                if (issuccess) {
                    self.IsConfigurationUploaded(false);
                    window.gatewayconfig.uicontext.onsyncrefresh();
                    var temp = [];
                    temp.Id = self.Id;
                    datacontext.currentdevice().updatecallback(temp, true);
                }
            });
        }

        self.InitializePanel = function (event, data) {
            if (window.gatewayconfig.uicontext.validateform()) {
                datacontext.initializepanel(self, function (successresult) {
                    alertify.success(Resources.Panel_InitializationSuccessful);
                }, function (errorresult) {
                    //self.ErrorMessage(errorresult);
                    alertify.error(Resources.Panel_InitializationFailed);
                });
            }
        }

        function Init() {
            $('#panel_IOPollInterval').spinner();
            $('#panel_LoopVerifyInterval').spinner();
            $('#panel_CmdRetryCount').spinner();
            $('#panel_CmdTimeout').spinner();
            $('#panel_Address').spinner();
            function panel_antipassback() {
                $('#panel_antipassback').css({ 'background-color': '#EEE', 'cursor': 'not-allowed' });
                $('#panel_antipassback span').css({ 'cursor': 'not-allowed' });
                $('#panel_antipassback input').prop('disabled', true);
                if (self.AntiPassbackEnabled()) {
                    $('#panel_antipassback').css({ 'background-color': 'Transparent', 'cursor': 'auto' });
                    $('#panel_antipassback span').css({ 'cursor': 'pointer' });
                    $('#panel_antipassback input').prop('disabled', false);
                }
            }
            panel_antipassback();
            $('#panel_IsAntiPassbackEnabled').on('click', function () {
                $('#panel_antipassback').css({ 'background-color': '#EEE', 'cursor': 'not-allowed' });
                $('#panel_antipassback span').css({ 'cursor': 'not-allowed' });
                $('#panel_antipassback input').prop('disabled', true);
                if ($(this).prop('checked')) {
                    $('#panel_antipassback').css({ 'background-color': 'Transparent', 'cursor': 'auto' });
                    $('#panel_antipassback span').css({ 'cursor': 'pointer' });
                    $('#panel_antipassback input').prop('disabled', false);
                    $('[name="panel_Global"]').first().prop('checked', true);
                }
                else {
                    $('#panel_antipassback input').prop('checked', false);
                    //self.Forgive = ko.observable(false);
                    //self.Duress = ko.observable(false);
                    //self.AntiPassbackEnabled = ko.observable(false);
                    //self.GlobalAntiPassback = ko.observable("-1");
                }
            });
            setHiddens(self.AntiPassbackEnabled(), self.Duress());
        }
        function setHiddens(AntiPassbackEnabled, Duress) {
            $("#hdnAntiPassbackEnabled").val(AntiPassbackEnabled);
            $("#hdnDuress").val(Duress);
        }
        Init();
        var oldModelData = ko.observable();
        oldModelData(ko.toJSON(self));
        self.toJson = function () {
            return ko.toJSON(self);
        }
    }

    datacontext.paneldeviceentity = paneldeviceentity;

})(ko, window.gatewayconfig.common, window.gatewayconfig.datacontext);

