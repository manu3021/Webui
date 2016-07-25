var isInteger = function (value) {
    return !!value ? !isNaN(value) && (Math.round(value) == value) : true;
};
var isValidRange = function (value) {
    return !!value && bigInt(value).greater("0") && bigInt(value).lesser("18446744073709551616");
};

$.validator.addMethod("isInteger", function (value, element) {
    return isInteger(value);
}, Resources.Valid_Number);
$.validator.addMethod("isValidRange", function (value, element) {
    return isValidRange(value);
}, Resources.Credential_Valid_Range);

window.credential.CredentialValidations = {
    rules: {
        credential_CardNumber: {
            required: true,
            number: true,
            isInteger: true,
            isValidRange: true
        },
        credential_MaxUseCount: {
            required: function () {
                return $('#credential_MaxUseCountEnabled').is(':checked');
            },
            number: true,
            range: [1, 255],
            isInteger: true
        },
        credential_PIN: {
            number: true,
            range: [100, 999999],
            isInteger: false

        },
        credential_IssueLevel: {
            number: true,
            range: [0, 32767],
            isInteger: true
        }
    },
    messages: {
        credential_CardNumber: {
            required: Resources.Credential_Number_Required,
            number: Resources.Valid_Number
        },
        credential_MaxUseCount: {
            required: Resources.Credential_Max_Use_Required,
            number: Resources.Valid_Number,
            range: Resources.Credential_Use_Count_Valid_Range
        },
        credential_PIN: {
            number: Resources.Valid_Number,
            range: Resources.Credential_Pin_Valid_Range
        },
        credential_IssueLevel: {
            number: Resources.Valid_Number,
            range: Resources.Credential_Issue_Level_Valid_Range
        }
    }
};

window.credential.CredentialHolderValidations = {
    rules: {
        credentialHolder_FirstName: {
            required: true,
            maxlength: 15,
            netaxsrestriction: true
        },
        credentialHolder_LastName: {
            required: true,
            maxlength: 20,
            netaxsrestriction: true
        },
        credentialHolder_DisplayName: {
            maxlength: 30
        }
    },
    messages: {
        credentialHolder_FirstName: {
            required: Resources.Credential_First_Name_Required,
            netaxsrestriction: Resources.NetAxsRestriction
        },
        credentialHolder_LastName: {
            required: Resources.Credential_Last_Name_Required,
            netaxsrestriction: Resources.NetAxsRestriction
        }
    }
};