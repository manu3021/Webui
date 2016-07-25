var isAfterStartDate = function (startDateStr, endDateStr) {
    var inDate = new Date(startDateStr),
        eDate = new Date(endDateStr);
    return inDate > eDate ? false : true;
};

var activationDateRequired = function ($el) {
    return !!$el && $el.is(':visible') && !$el.val() ? false : true;
}

$.validator.addMethod("isAfterStartDate", function (value, element) {
    return isAfterStartDate(value, $('#accessPersona_ExpiryDate').val());
}, Resources.AccessPersonaActivationExpirationExceedError);

$.validator.addMethod("activationDateRequired", function (value, element) {
    return activationDateRequired($('#accessPersona_ActivationDate'));
}, Resources.AccessPersonaActivationDateRequired);

$.validator.addMethod('regex', function (value, element, pattern) {
    if (value) {
        return pattern.test(value);
    }
    return true;
}, Resources.NameCannotContainSymbol);


window.accesspersona.AccessPersonaValidations = {
    ignore: ':hidden',
    rules: {
        accesspersona_Name: {
            required: true,
            maxlength: 25,
            netaxsrestriction: true
        },
        activationDate: {
            activationDateRequired: true,
            isAfterStartDate: true
        }
    },
    messages: {
        accesspersona_Name: {
            required: Resources.AccessPersona_Name_Required,
            maxlength: Resources.Access_Persona_Max_Exceeded,
            netaxsrestriction: Resources.NetAxsRestriction
        }
    }
};