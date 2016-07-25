/// <reference path="door-common.js" />
/// <reference path="door-datacontext.js" />
/// <reference path="door-uicontext.js" />
window.doorconfig.doorsettingmodel = (function (ko, common, datacontext) {
    modalOptions = { show: true, keyboard: false, backdrop: "static" };

    var deviceEntity = function (data) {
        var self = this;
        self.Id = ko.observable(data.Id);
        self.Name = ko.observable(data.Name);
        self.closeicon = ko.observable("icon-itemclose");
        self.enableclose = function () {
            self.closeicon("icon-itemclose-show");
        };
        self.disableclose = function () {
            self.closeicon("icon-itemclose");
        };

        self.toJson = function () {
            return ko.toJSON(self);
        }
    }

    datacontext.deviceEntity = deviceEntity;
    var doorentity = function (data) {
        var self = this;
        data = data || {};

        var _tempAssociatedDevices = [];
        var _orgAssociatedDevices = [];
        var IsDirtyAssociatedDevices = false;

        self.Readers = ko.observableArray($.map(data.Readers,
            function (item) {
                return {
                    ID: item.ID,
                    Name: ko.observable(item.Name),
                    ShuntTime: ko.observable(item.ShuntTime),
                    PulseTime: ko.observable(item.PulseTime),
                    Inputs: ko.observable(item.Inputs),
                    Outputs: ko.observable(item.Outputs),
                    IsAntiPassback: ko.observable(item.IsAntiPassback),
                    AntiPassback: ko.observable(item.AntiPassback),
                    AntiPassbackType: ko.observable((item.IsAntiPassback) ? item.AntiPassbackType : "0"),
                    obInputs: ko.observableArray($.map(item.Inputs, function (item) { return { Name: item.Name, Value: item.ID, IsInUse: item.IsUsedByOthers } })),
                    obOutputs: ko.observableArray($.map(item.Outputs, function (item) { return { Name: item.Name, Value: item.ID, IsInUse: item.IsUsedByOthers } })),
                    InterlockingInput: ko.observable(item.InterlockingInput),
                    InterlockingOutput: ko.observable(item.InterlockingOutput),
                    InterlockingInputText: ko.observable(item.InterlockingInputText),
                    InterlockingOutputText: ko.observable(item.InterlockingOutputText),
                    OldInterlockingInput: ko.observable(item.InterlockingInput),
                    OldInterlockingOutput: ko.observable(item.InterlockingOutput),
                    OldIsAntiPassback: ko.observable(item.IsAntiPassback),
                    OldAntiPassback: ko.observable(item.AntiPassback),
                    OldAntiPassbackType: ko.observable(item.AntiPassbackType),
                    IsActive: ko.observable(item.IsActive),
                    OldIsActive: ko.observable(item.IsActive),
                    IsIn: ko.observable(item.IsIn),
                    OldIsIn: ko.observable(item.IsIn),
                    IsReaderA: ko.observable(item.IsReaderA),
                    InOrOut: ko.observable(""),
                    SoftOrHard: ko.observable(""),
                    UsedOrNot: ko.observable("")
                }
            }));

        //self.DevicePointsIn = ko.observableArray($.map(data.DevicePointsIn, function (item) { return { Name: item.Name, Value: item.ID, IsInUse: false } })),
        //self.DevicePointsOut = ko.observableArray($.map(data.DevicePointsOut, function (item) { return { Name: item.Name, Value: item.ID, IsInUse: false } })),
        //self.DevicePointIn = data.DevicePointIn;
        //self.DevicePointOut = data.DevicePointOut;
        //self.OldDevicePointIn = data.DevicePointIn;
        //self.OldDevicePointOut = data.DevicePointOut;
        self.ReaderA = ko.observable(self.Readers()[0]);
        self.ReaderB = ko.observable(self.Readers()[1]);
        
        self.ReaderA().InOrOut(self.Readers()[0].AntiPassback == 1 ? common.messages.In : common.messages.Out);
        self.ReaderB().InOrOut(self.Readers()[1].AntiPassback == 1 ? common.messages.In : common.messages.Out);

        self.ReaderA().SoftOrHard(self.Readers()[0].AntiPassback == 1 ? common.messages.Soft : common.messages.Hard);
        self.ReaderB().SoftOrHard(self.Readers()[1].AntiPassback == 1 ? common.messages.Soft : common.messages.Hard);
     
        self.ReaderB().UsedOrNot(self.Readers()[1].IsActive() ? "" : common.messages.NotUsed);
        
        self.Name = ko.observable(data.Name);
        self.Id = data.Id;
        self.ErrorMessage = ko.observable("");
        self.IsError = ko.observable(false);

        self.OldPulseTime = this.Readers()[0].PulseTime();
        self.OldShuntTime = this.Readers()[0].ShuntTime();
        self.OldName = data.Name;
        self.InputMessage = ko.observable("");
        self.OutputMessage = ko.observable("");
        self.DevicePointMessage = ko.observable("");
        self.AssociatedDevicesCount = ko.observable(data.AssociatedDevicesCount);
        self.EgressInputPoint = data.EgressInputPoint;

        self.ShuntTime = ko.observable(window.doorconfig.uicontext.calcTime(this.Readers()[0].ShuntTime()));
        self.PulseTime = ko.observable(window.doorconfig.uicontext.calcTime(this.Readers()[0].PulseTime()));
        self.oneditaclick = function (data, event) {
            $('label.error').css('display', 'none');
            $("#readerSettingsPopupa").modal(modalOptions);
        }
        self.oneditbclick = function (data, event) {
            $("#readerSettingsPopupb").modal(modalOptions);
        }
        self.resetReaderData = function (data, event) {
            self.Readers()[0].PulseTime(data.OldPulseTime);
            self.Readers()[1].PulseTime(data.OldPulseTime);
            self.Readers()[0].ShuntTime(data.OldShuntTime);
            self.Readers()[1].ShuntTime(data.OldShuntTime);
            self.PulseTime(window.doorconfig.uicontext.calcTime(data.OldPulseTime));
            self.ShuntTime(window.doorconfig.uicontext.calcTime(data.OldShuntTime));
            self.Readers()[0].InterlockingInput(self.Readers()[0].OldInterlockingInput());
            self.Readers()[1].InterlockingInput(self.Readers()[1].OldInterlockingInput());

            self.Readers()[0].InterlockingOutput(self.Readers()[0].OldInterlockingOutput());
            self.Readers()[1].InterlockingOutput(self.Readers()[1].OldInterlockingOutput());

            $("#readerSettingsPopupa").modal(modalOptions);
        }

        self.saveDoor = function (data, event) {
            blockUI();
            if (doorconfig.uicontext.validateForm()) {
                self.Readers.removeAll();
                self.Readers.push(self.ReaderA());
                self.Readers.push(self.ReaderB());
                datacontext.savedoordetail(self, function (successresult) {
                    //self.Readers()[0].OldAntiPassback(self.Readers()[0].AntiPassback());
                    //self.Readers()[0].OldAntiPassbackType(self.Readers()[0].AntiPassbackType());
                    //self.Readers()[0].OldInterlockingInput(self.Readers()[0].InterlockingInput());
                    //self.Readers()[0].OldInterlockingOutput(self.Readers()[0].InterlockingOutput());
                    ////self.OldDevicePointIn = self.DevicePointIn;
                    ////self.OldDevicePointOut = self.DevicePointOut;
                    //self.Readers()[1].OldIsActive(self.Readers()[1].IsActive());
                    //self.OldName = self.Name;                    
                    self.OldPulseTime = self.Readers()[0].PulseTime();
                    self.OldShuntTime = self.Readers()[0].ShuntTime();

                    self.Readers()[0].OldAntiPassback(data.Readers()[0].AntiPassback());
                    self.Readers()[1].OldAntiPassback(data.Readers()[1].AntiPassback());

                    self.Readers()[0].OldAntiPassbackType(data.Readers()[0].AntiPassbackType());
                    self.Readers()[1].OldAntiPassbackType(data.Readers()[1].AntiPassbackType());

                    self.Readers()[0].OldIsAntiPassback(data.Readers()[0].IsAntiPassback());
                    self.Readers()[1].OldIsAntiPassback(data.Readers()[1].IsAntiPassback());

                    self.OldName = data.Name();

                    self.Readers()[0].OldInterlockingInput(data.Readers()[0].InterlockingInput());
                    self.Readers()[1].OldInterlockingInput(data.Readers()[1].InterlockingInput());

                    self.Readers()[0].OldInterlockingOutput(data.Readers()[0].OldInterlockingOutput());
                    self.Readers()[1].OldInterlockingOutput(data.Readers()[1].OldInterlockingOutput());

                    self.Readers()[1].OldIsActive(data.Readers()[1].IsActive());
                    self.Readers()[0].OldIsIn(data.Readers()[0].IsIn());
                    self.Readers()[1].OldIsIn(data.Readers()[1].IsIn());
                    if (successresult && successresult.Status.toLowerCase() != common.constants.online.toLowerCase())
                        alertify.success(common.messages.devoffline_cnfgdwnOnOnl);
                    else
                    alertify.success(common.messages.door_save_success);
                    window.doorconfig.uicontext.binddatatoactiveform();
                    unblockUI();
                }, function (errorresult) {
                    self.ErrorMessage(errorresult);
                    self.Readers()[1].OldIsActive(self.Readers()[1].IsActive());
                    if (errorresult == 'NONE DB_DUPLICATE_RECORD NONE : DB_DUPLICATE_RECORD')
                        alertify.error(common.messages.door_name_already_exists);
                    else
                        alertify.error(common.messages.door_save_error + errorresult);
                    unblockUI();
                });
            }

        }

        self.value_changed = function (data, event) {
            var context = ko.contextFor(event.currentTarget);
            if (event.currentTarget.selectedOptions.length > 0) {
                if (event.currentTarget.nodeName == "SELECT") {



                    if (event.currentTarget.id == "interlockinputs") {

                        $.each(self.Readers()[0].obInputs(), function (index, item) {
                            if (item.Name == $('#interlockinputs option:selected').text()) {

                                self.Readers()[0].InterlockingInput(item.Value);
                                self.Readers()[1].InterlockingInput(item.Value);
                            }
                        });
                        self.InputMessage(getmessage('input', self, $(event.currentTarget).val()));
                        if (self.Readers()[0].InterlockingInput() == "" || self.Readers()[0].InterlockingInput() == null && self.Readers()[0].InterlockingInput() == undefined) {
                            self.Readers()[0].InterlockingInput(data.Readers()[0] != null && data.Readers()[0] != undefined ? data.Readers()[0].InterlockingInput() : null);
                            self.Readers()[1].InterlockingInput(data.Readers()[1] != null && data.Readers()[1] != undefined ? data.Readers()[1].InterlockingInput() : null);
                        }
                    }
                    else if (event.currentTarget.id == "interlockoutputs") {

                        $.each(self.Readers()[0].obOutputs(), function (index, item) {
                            if (item.Name == $('#interlockoutputs option:selected').text()) {

                                self.Readers()[0].InterlockingOutput(item.Value);
                                self.Readers()[1].InterlockingOutput(item.Value);
                            }
                        });
                        self.OutputMessage(getmessage('output', self, $(event.currentTarget).val()));
                        if (self.Readers()[1].InterlockingOutput() == "" || self.Readers()[1].InterlockingOutput() == null && self.Readers()[1].InterlockingOutput() == undefined) {
                            self.Readers()[0].InterlockingOutput(data.Readers()[0] != null && data.Readers()[0] != undefined ? data.Readers()[0].InterlockingOutput() : null);
                            self.Readers()[1].InterlockingOutput(data.Readers()[1] != null && data.Readers()[1] != undefined ? data.Readers()[1].InterlockingOutput() : null);
                        }
                    }
                    //else if (event.currentTarget.id == "interlockdevicepointsA") {

                    //    $.each(self.DevicePointsIn(), function (index, item) {
                    //        if (item.Name == $('#interlockdevicepointsA option:selected').text()) {

                    //            self.DevicePointIn = item.Value;
                    //        }
                    //    });
                    //    if (self.DevicePointIn == "" || self.DevicePointIn == null && self.DevicePointIn == undefined) {
                    //        self.DevicePointIn = data.Readers()[0] != null && data.Readers()[0] != undefined ? data.Readers()[0].ID : null;
                    //    }
                    //}
                    //else if (event.currentTarget.id == "interlockdevicepointsB") {

                    //    $.each(self.DevicePointsOut(), function (index, item) {
                    //        if (item.Name == $('#interlockdevicepointsB option:selected').text()) {

                    //            self.DevicePointOut = item.Value;
                    //        }
                    //    });
                    //    if (self.DevicePointOut == "" || self.DevicePointOut == null && self.DevicePointOut == undefined) {
                    //        self.DevicePointOut = data.Readers()[1] != null && data.Readers()[1] != undefined ? data.Readers()[1].ID : null;
                    //    }
                    //}
                    if (event.currentTarget.id == "interlockdevicepointsA" || event.currentTarget.id == "interlockdevicepointsB") {

                        if ($("#interlockdevicepointsA option:selected").text() == $("#interlockdevicepointsB option:selected").text() && data.Readers()[1].IsActive() && data.Readers()[0].IsActive()) {
                            $('#doorbehaviordonebtn').removeAttr('data-dismiss');
                            self.DevicePointMessage(common.messages.InOut_DevicePoints_Cannotbe_Same);
                        }
                        else {
                            $('#doorbehaviordonebtn').attr('data-dismiss', 'modal');
                            self.DevicePointMessage('');
                        }
                    }
                }
            }

        }

        self.time_changed = function (data, event) {
            var context = ko.contextFor(event.currentTarget);
            // Convert hh mm ss to sec format
            var time = event.currentTarget.value;
            var arrTime = time.split(":");
            var changedValue = (arrTime[0] * 3600 + arrTime[1] * 60 + parseFloat((arrTime[2] * 1).toFixed(1))) * 1000;
            //End
            switch (event.currentTarget.placeholder) {
                case "Pulse Time":
                    self.Readers()[0].PulseTime(changedValue);
                    self.Readers()[1].PulseTime(changedValue);
                    self.PulseTime(window.doorconfig.uicontext.calcTime(changedValue));
                    break;
                case "Shunt Time":
                    self.Readers()[0].ShuntTime(changedValue);
                    self.Readers()[1].ShuntTime(changedValue);
                    self.ShuntTime(window.doorconfig.uicontext.calcTime(changedValue));
                    break;
            }
        }

        self.rdoCheck = ko.observable(false);
        self.showantipassaback = function (data, event) {
            $("#readerPopupA").modal(modalOptions);
        }

        self.showantipassbback = function (data, event) {
            $("#readerPopupBa").modal(modalOptions);
        }

        self.resetDoor = function (data, event) {
            $('label.error').css('display', 'none');
            var context = ko.contextFor(event.currentTarget);
            self.Readers()[0].PulseTime(data.OldPulseTime);
            self.Readers()[1].PulseTime(data.OldPulseTime);

            self.Readers()[0].ShuntTime(data.OldShuntTime);
            self.Readers()[1].ShuntTime(data.OldShuntTime);

            self.Readers()[0].AntiPassback(data.Readers()[0].OldAntiPassback());
            self.Readers()[1].AntiPassback(data.Readers()[1].OldAntiPassback());

            self.Readers()[0].AntiPassbackType(data.Readers()[0].OldAntiPassbackType());
            self.Readers()[1].AntiPassbackType(data.Readers()[1].OldAntiPassbackType());

            self.Readers()[0].IsAntiPassback(data.Readers()[0].OldIsAntiPassback());
            self.Readers()[1].IsAntiPassback(data.Readers()[1].OldIsAntiPassback());

            self.Name(data.OldName);

            self.Readers()[0].InterlockingInput(self.Readers()[0].OldInterlockingInput());
            self.Readers()[1].InterlockingInput(self.Readers()[1].OldInterlockingInput());

            self.Readers()[0].InterlockingOutput(self.Readers()[0].OldInterlockingOutput());
            self.Readers()[1].InterlockingOutput(self.Readers()[1].OldInterlockingOutput());

            self.PulseTime(window.doorconfig.uicontext.calcTime(data.OldPulseTime));
            self.ShuntTime(window.doorconfig.uicontext.calcTime(data.OldShuntTime));

            self.Readers()[1].IsActive(data.Readers()[1].OldIsActive());
            self.Readers()[0].IsIn(data.Readers()[0].OldIsIn());
            self.Readers()[1].IsIn(data.Readers()[1].OldIsIn());
        }

        self.resetAAntipassbackData = function (data, event) {
            self.Readers()[0].AntiPassback(data.Readers()[0].OldAntiPassback());
            self.Readers()[0].AntiPassbackType(data.Readers()[0].OldAntiPassbackType());
            self.Readers()[0].IsAntiPassback(data.Readers()[0].OldIsAntiPassback());
            self.Readers()[0].IsIn(data.Readers()[0].OldIsIn());
            self.Readers()[1].IsIn(data.Readers()[1].OldIsIn());
            $("#readerPopupA").modal(modalOptions);
        }

        self.resetBAntipassbackData = function (data, event) {
            self.Readers()[1].AntiPassback(data.Readers()[1].OldAntiPassback());
            self.Readers()[1].AntiPassbackType(data.Readers()[1].OldAntiPassbackType());
            self.Readers()[1].IsAntiPassback(data.Readers()[1].OldIsAntiPassback());
            self.Readers()[1].IsActive(data.Readers()[1].OldIsActive());
            $("#readerPopupBa").modal(modalOptions);
        }

        self.validateReader = function (data, event) {
            var i = $('label.error').length;
            var j = 0;
            $('label.error').each(function () {
                if ($(this).css('display') == "none")
                    j++;
            });

            var context = ko.contextFor(event.currentTarget);

            if (i == j) {
                $("#readerSettingsPopupa").modal(modalOptions);
                $('#readerSettingsPopupa').modal('hide');
                if ($('.modal-backdrop.in').length > 0) {
                    $('.modal-backdrop.in').remove();
                }
            }
            else {
                $('#readerSettingsPopupa').modal('show');
                return false;
            }
        }

        self.deviceentities = ko.observableArray([]);

        self.AssociatedDevices = [];

        self.DissociatedDevices = [];

        self.InitialiseAssociatedDevices = function (data) {
            if (!IsDirtyAssociatedDevices) {
                var newdeviceentities = $.map(data, function (device) {
                    var devItem = new deviceEntity(device);
                    _tempAssociatedDevices.push(devItem);
                    _orgAssociatedDevices.push(devItem);
                    return devItem;
                });
                self.deviceentities(newdeviceentities);
            }
            else {
                var newdeviceentities = $.map(_tempAssociatedDevices, function (device) {
                    return device;
                });
                self.deviceentities(newdeviceentities);
            }
            return self.deviceentities();
        }

        self.adddeviceitem = function (newdeviceentity) {
            self.deviceentities.push(newdeviceentity);
            self.AssociatedDevicesCount(self.AssociatedDevicesCount() + 1);
            IsDirtyAssociatedDevices = true;
            $.publish(common.events.filterontreenodedropped, newdeviceentity);
        }

        self.removedeviceitem = function (data, event) {
            var context = ko.contextFor(event.target);
            self.deviceentities.remove(context.$data);
            self.AssociatedDevicesCount(self.AssociatedDevicesCount() - 1);
            IsDirtyAssociatedDevices = true;
            $.publish(common.events.removefilterfortreenode, data);
        }

        self.doorcameraassociationsave = function () {
            //Save
            _tempAssociatedDevices = self.deviceentities();
            self.AssociatedDevices = [];
            self.DissociatedDevices = [];
            if (_orgAssociatedDevices != undefined) { //This means association dialog is openned atleast once
                if (_tempAssociatedDevices == undefined || _tempAssociatedDevices.length == 0) { //Everything is removed
                    for (var i = 0; i < _orgAssociatedDevices.length; i++) {
                        self.DissociatedDevices.push(_orgAssociatedDevices[i]);
                    }
                }
                else {
                    for (var i = 0; i < _orgAssociatedDevices.length; i++) {
                        var isexists = false;
                        for (var j = 0; j < _tempAssociatedDevices.length; j++) {
                            if (_orgAssociatedDevices[i].Id().toLowerCase() == _tempAssociatedDevices[j].Id().toLowerCase())
                                isexists = true;
                        }
                        if (!isexists)
                            self.DissociatedDevices.push(_orgAssociatedDevices[i]);
                    }
                    for (var i = 0; i < _tempAssociatedDevices.length; i++) {
                        var isexists = false;
                        for (var j = 0; j < _orgAssociatedDevices.length; j++) {
                            if (_tempAssociatedDevices[i].Id().toLowerCase() == _orgAssociatedDevices[j].Id().toLowerCase())
                                isexists = true;
                        }
                        if (!isexists)
                            self.AssociatedDevices.push(_tempAssociatedDevices[i]);
                    }
                }
            }

            self.deviceentities([]);

            window.doorconfig.uicontext.closecurrentDialog();
        }

        self.doorcameraassociationcancel = function () {
            self.deviceentities([]);
            window.doorconfig.uicontext.closecurrentDialog();
        }

        self.showassociate = function (event, data) {
            window.doorconfig.uicontext.showassociatedialog();
        }

        self.readerAinfo = function (data, event) {
            $("readerPopupA").modal(modalOptions);
        }

        self.readerBinfo = function (data, event) {
            $("readerPopupA").modal(modalOptions);
        }

        self.inoutchanged = function (data, event) {
            var context = ko.contextFor(event.currentTarget);
            if (event.currentTarget.innerHTML.toLowerCase() == "in") {
                self.Readers()[0].IsIn(true);
                self.Readers()[1].IsIn(false);
            }
            else {
                self.Readers()[0].IsIn(false);
                self.Readers()[1].IsIn(true);
            }
        }

        self.AntipassbackAchanged = function (data, event) {
            var context = ko.contextFor(event.currentTarget);
            if (event.currentTarget.innerHTML.toLowerCase() == "disable") {
                self.Readers()[0].IsAntiPassback(false);
                self.Readers()[0].AntiPassback("0");
                self.Readers()[0].AntiPassbackType("0");
            }
            else {
                self.Readers()[0].IsAntiPassback(true);
                self.Readers()[0].AntiPassback("1");
                self.Readers()[0].AntiPassbackType("1");
            }
        }

        self.onreaderbenabled = function (data, event) {
            var context = ko.contextFor(event.currentTarget);
            if (event.currentTarget.innerHTML.toLowerCase() == "disable") {
                self.Readers()[1].IsActive(false);
                self.DevicePointMessage('')
            }
            else {
                self.Readers()[1].IsActive(true);
            }
        }

        self.AntipassbackBchanged = function (data, event) {
            var context = ko.contextFor(event.currentTarget);
            if (event.currentTarget.innerHTML.toLowerCase() == "disable") {
                self.Readers()[1].IsAntiPassback(false);
                self.Readers()[1].AntiPassback("0");
                self.Readers()[1].AntiPassbackType("0");
            }
            else {
                self.Readers()[1].IsAntiPassback(true);
                self.Readers()[1].AntiPassback("1");
                self.Readers()[1].AntiPassbackType("1");
            }
        }

        self.AntipassbackADirectionChanged = function (data, event) {
            var context = ko.contextFor(event.currentTarget);
            self.Readers()[0].AntiPassbackType(self.Readers()[0].AntiPassbackType());
        }

        self.AntipassbackBDirectionChanged = function (data, event) {
            var context = ko.contextFor(event.currentTarget);
            self.Readers()[1].AntiPassbackType(self.Readers()[1].AntiPassbackType());
        }

        self.AntipassbackANatureChanged = function (data, event) {
            var context = ko.contextFor(event.currentTarget);
            self.Readers()[0].AntiPassback = self.Readers()[0].AntiPassback;
        }

        self.AntipassbackBNatureChanged = function (data, event) {
            var context = ko.contextFor(event.currentTarget);
            self.Readers()[1].AntiPassback(self.Readers()[1].AntiPassback());
        }

        function AntiPassback_check(data, event) {
            var context = ko.contextFor(event.currentTarget);
            $('.radio[name="AntiPassback"]').each(function () {
                if ($(this).prop('checked')) {
                    var changedValue = $(this).val();
                    self.Readers()[0].AntiPassback(changedValue);
                    self.Readers()[1].AntiPassback(changedValue);
                }
            });
            $('.radio[name="AntiPassbackType"]').each(function () {
                if ($(this).prop('checked')) {
                    var changedValue = $(this).val();
                    self.Readers()[0].AntiPassbackType(changedValue);
                    self.Readers()[1].AntiPassbackType(changedValue);
                }
            });
        }

        self.globalantipassbackenabled = $.parseJSON($("#hdnAntiPassbackEnabled").val());

        function getmessage(entitytype, data, selectvalue) {
            var message = '';
            if (entitytype == 'input') {
                $.grep(data.Readers()[0].Inputs(), function (item) {
                    if (item.ID.toLowerCase() == selectvalue.toLowerCase()) {
                        if (item.IsUsedByOthers) {
                            message = Resources.InputStatusAlreadyInUse;
                        }
                    }
                });
            }
            else if (entitytype == 'output') {
                $.grep(data.Readers()[0].Outputs(), function (item) {
                    if (item.ID.toLowerCase() == selectvalue.toLowerCase()) {
                        if (item.IsUsedByOthers) {
                            message = Resources.OutputLockAlreadyInUse;
                        }
                    }
                });
            }

            return message;
        }

        function Init() {

            //$.each(self.DevicePointsOut(), function (index, item) {
            //    if (item.Value == self.DevicePointOut) {

            //        self.DevicePointOut = item;
            //    }
            //});
            //$.each(self.DevicePointsIn(), function (index, item) {
            //    if (item.Value == self.DevicePointIn) {

            //        self.DevicePointIn = item;
            //    }
            //});
            $.each(self.Readers()[0].obInputs(), function (index, item) {

                if (item.Value == self.Readers()[0].InterlockingInput()) {
                    self.Readers()[0].InterlockingInput(item);
                }
            });
            $.each(self.Readers()[0].obOutputs(), function (index, item) {

                if (item.Value == self.Readers()[0].InterlockingOutput()) {
                    self.Readers()[0].InterlockingOutput(item);
                }
            });
        }
        Init();
        self.toJson = function () {
            return ko.toJSON(self);
        }
    }

    datacontext.doorentity = doorentity;

})(ko, window.doorconfig.common, window.doorconfig.datacontext);
