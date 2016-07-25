window.panelconfig.PanelReaderModel = uibase.BaseModel.inherits({
    initialize: function (data) {
        uibase.BaseModel.prototype.initialize.apply(this, data);
        this.Id = ko.observable();
        this.Name = ko.observable();
        this.ParentId = ko.observable();
        this.AccountId = ko.observable();
        this.Address = ko.observable(0);
        this.IsDuress = ko.observable();
        this.DuressOutput = ko.observable();
        this.IsAntiPassbackEnabled = ko.observable();
        this.AntiPassback = ko.observable(0);
        this.AntiPassbackType = ko.observable(0);
        this.IsError = ko.observable(false);
        this.ErrorMessage = ko.observable();
        this.DisableReaderDoor = {
            TimeZone: ko.observable(),
            CardType: ko.observable()
        };
        this.LockDownReaderDoor = {
            TimeZone: ko.observable(),
            CardType: ko.observable()
        };
        this.CardANDPinRequired = {
            TimeZone: ko.observable(),
            CardType: ko.observable(0)
        };
        this.CardORPinRequired = {
            TimeZone: ko.observable(),
            CardType: ko.observable(0)
        };
        this.PinOnly = {
            TimeZone: ko.observable(),
            CardType: ko.observable(0)
        };
        this.CardOnly = {
            TimeZone: ko.observable(),
            CardType: ko.observable(0)
        };
        this.AssociatedEntity = ko.observable();
        this.OutputPoint = ko.observable();
        this.EgressPoint = ko.observable();
        this.DoorPositionStatusInputPoint = ko.observable();
        this.ReaderLEDOutputPoint = ko.observable();
        this.ReaderBuzzerOutputPoint = ko.observable();
        this.TamperInputReader = ko.observable();
        this.IsOutputAGroup = ko.observable();
        this.DenyAccessOnSiteCode = ko.observable();
        this.DenyAccessOnCredentialID = ko.observable();
        this.DenyAccessOnExpiredDate = ko.observable();
        this.DenyAccessOnCompanyCode = ko.observable();
        this.DenyAccessOnIssueCode = ko.observable();
        this.ReaderCredentialFormat = ko.observable();
        this.IsInReader = ko.observable();
        if (data) {
            this.dataSource(data);
        }
    },
    dataSource: function (data) {
        data = data || {};
        this.Id(data.Id);
        this.Name(data.Name);
        this.ParentId(data.ParentId);
        this.AccountId(data.AccountId);
        this.Address(data.Address);
        this.IsDuress(data.IsDuress);
        this.DuressOutput(data.DuressOutput);
        this.AntiPassback(data.AntiPassback);
        this.IsError(false);
        this.ErrorMessage("");
        if (data.AntiPassback > 0) {
            this.AntiPassbackType(data.AntiPassbackType);
            this.IsAntiPassbackEnabled(data.IsAntiPassbackEnabled);
        }
        else {
            this.AntiPassbackType(0);
        }

        if (data.DisableReaderDoor) {
            this.DisableReaderDoor.TimeZone(data.DisableReaderDoor.TimeZone);
            this.DisableReaderDoor.CardType(data.DisableReaderDoor.CardType);
        }
        if (data.LockDownReaderDoor) {
            this.LockDownReaderDoor.TimeZone(data.LockDownReaderDoor.TimeZone);
            this.LockDownReaderDoor.CardType(data.LockDownReaderDoor.CardType);
        }
        if (data.CardANDPinRequired) {
            this.CardANDPinRequired.TimeZone(data.CardANDPinRequired.TimeZone);
            this.CardANDPinRequired.CardType(data.CardANDPinRequired.CardType);
        }
        if (data.CardORPinRequired) {
            this.CardORPinRequired.TimeZone(data.CardORPinRequired.TimeZone);
            this.CardORPinRequired.CardType(data.CardORPinRequired.CardType);
        }
        if (data.PinOnly) {
            this.PinOnly.TimeZone(data.PinOnly.TimeZone);
            this.PinOnly.CardType(data.PinOnly.CardType);
        }
        if (data.CardOnly) {
            this.CardOnly.TimeZone(data.CardOnly.TimeZone);
            this.CardOnly.CardType(data.CardOnly.CardType);
        }
        this.AssociatedEntity(data.AssociatedEntity);
        this.OutputPoint(data.OutputPoint);
        this.EgressPoint(data.EgressPoint);
        this.DoorPositionStatusInputPoint(data.DoorPositionStatusInputPoint);
        this.ReaderLEDOutputPoint(data.ReaderLEDOutputPoint);
        this.ReaderBuzzerOutputPoint(data.ReaderBuzzerOutputPoint);
        this.TamperInputReader(data.TamperInputReader);
        this.IsOutputAGroup(data.IsOutputAGroup);
        this.DenyAccessOnSiteCode(data.DenyAccessOnSiteCode);
        this.DenyAccessOnCredentialID(data.DenyAccessOnCredentialID);
        this.DenyAccessOnExpiredDate(data.DenyAccessOnExpiredDate);
        this.DenyAccessOnCompanyCode(data.DenyAccessOnCompanyCode);
        this.DenyAccessOnIssueCode(data.DenyAccessOnIssueCode);
        this.ReaderCredentialFormat(data.ReaderCredentialFormat);
        this.IsInReader(data.IsInReader);
        this.InitModel();
    },
    InitModel: function () {
        var controls = {
            CardAndPinMode: {
                control: "reader_CardAndPinTimeZone",
                targetcontrol: "CardAndPinMode"
            },
            CardOrPinMode: {
                control: "reader_CardOrPinTimeZone",
                targetcontrol: "CardOrPinMode"
            },
            PinOnlyMode: {
                control: "reader_PinOnlyTimeZone",
                targetcontrol: "PinOnlyMode"
            },
            CardOnlyMode: {
                control: "reader_CardOnlyTimeZone",
                targetcontrol: "CardOnlyMode"
            }
        }
        var AntiPassbackEnabled = !$.parseJSON($("#hdnAntiPassbackEnabled").val());
        $("#reader_IsAntiPassbackEnabled").prop('disabled', AntiPassbackEnabled);
        var DuressEnabled = !$.parseJSON($("#hdnDuress").val() == "true" && $("#reader_CardAndPinTimeZone").val() != "");
        $("#reader_IsDuress").prop('disabled', DuressEnabled);
        $("#reader_IsAntiPassbackEnabled").next('span').css('cursor', 'pointer');
        $("#reader_IsDuress").next('span').css('cursor', 'pointer');
        if (AntiPassbackEnabled)
            $("#reader_IsAntiPassbackEnabled").next('span').css('cursor', 'not-allowed');
        if (DuressEnabled) {
            $("#reader_IsDuress").next('span').css('cursor', 'not-allowed');
            $("#reader_IsDuress").prop('checked', !DuressEnabled);
            $("#reader_DuressOutput").prop('disabled', DuressEnabled);
        }
        $(function () {
            $('[name="CardAndPinMode"]').prop('disabled', true).closest("div").css('background-color', '#EEE');
            $('[name="CardOrPinMode"]').prop('disabled', true).closest("div").css('background-color', '#EEE');
            $('[name="PinOnlyMode"]').prop('disabled', true).closest("div").css('background-color', '#EEE');
            $('[name="CardOnlyMode"]').prop('disabled', true).closest("div").css('background-color', '#EEE');
            $.each(controls, function (key, value) {
                if ($("#" + value.control).val() != "")
                    $('[name="' + value.targetcontrol + '"]').prop('disabled', false).closest("div").css('background-color', 'Transparent');
                $("#" + value.control).on('change', function () {
                    $('[name="' + value.targetcontrol + '"]').prop('disabled', true).closest("div").css('background-color', '#EEE');
                    if ($(this).val() != "")
                        $('[name="' + value.targetcontrol + '"]').prop('disabled', false).closest("div").css('background-color', 'Transparent');
                    if (controls.CardAndPinMode.control == value.control) {
                        $("#reader_IsDuress").next('span').css('cursor', 'not-allowed');
                        $("#reader_IsDuress").prop('checked', false).prop('disabled', true);
                        $("#reader_DuressOutput").prop('disabled', true);
                        if ($(this).val() != "" && $("#hdnDuress").val() && $("#hdnDuress").val() == "true") {
                            $("#reader_IsDuress").prop('disabled', false);
                            $("#reader_DuressOutput").prop('disabled', !($("#reader_IsDuress").is(":checked") && !$("#reader_IsDuress").prop("disabled")));
                            $("#reader_IsAntiPassbackEnabled").next('span').css('cursor', 'pointer');
                            $("#reader_IsDuress").next('span').css('cursor', 'pointer');
                        }
                    }
                });
            });
            $("#antipassbackradio").css({ 'background-color': '#EEE', 'cursor': 'not-allowed' });
            $("#antipassbacktyperadio").css({ 'background-color': '#EEE', 'cursor': 'not-allowed' });
            $("#antipassbackradio span").css({ 'cursor': 'not-allowed' });
            $("#antipassbacktyperadio span").css({ 'cursor': 'not-allowed' });
            if ($('#reader_IsAntiPassbackEnabled').prop('checked')) {
                $("#antipassbackradio").css({ 'background-color': 'Transparent', 'cursor': 'auto' });
                $("#antipassbacktyperadio").css({ 'background-color': 'Transparent', 'cursor': 'auto' });
                $("#antipassbackradio span").css({ 'cursor': 'pointer' });
                $("#antipassbacktyperadio span").css({ 'cursor': 'pointer' });
            }
            $('#reader_IsAntiPassbackEnabled').on('click', function () {
                $("#antipassbackradio").css({ 'background-color': '#EEE', 'cursor': 'not-allowed' });
                $("#antipassbacktyperadio").css({ 'background-color': '#EEE', 'cursor': 'not-allowed' });
                $("#antipassbackradio span").css({ 'cursor': 'not-allowed' });
                $("#antipassbacktyperadio span").css({ 'cursor': 'not-allowed' });
                if ($(this).prop('checked')) {
                    $("#antipassbackradio").css({ 'background-color': 'Transparent', 'cursor': 'auto' });
                    $("#antipassbacktyperadio").css({ 'background-color': 'Transparent', 'cursor': 'auto' });
                    $("#antipassbackradio span").css({ 'cursor': 'pointer' });
                    $("#antipassbacktyperadio span").css({ 'cursor': 'pointer' });

                }
            });
        });
    },
    toJson: function () {
        var json = ko.toJS(this);
        return json;
    }
});