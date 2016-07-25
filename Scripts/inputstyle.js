; (function ($) {
    //$(document).on('keydown', 'input', function (event) {
    //    if (this.tagName == "INPUT" && (this.type != "checkbox" && this.type != "radio" && this.type != "button" && this.type != "submit")) {
    //        var label = $(this).prev("label");
    //        if ($(this).val() == "") {
    //            $(label).css("margin-top", "28px");
    //        }
    //        else {
    //            $(label).hide();
    //            $(label).css("margin-top", "4px");
    //        }
    //        console.log(" Global input key down");
    //    }
    //});
    //var onClass = "on";
    //var showClass = "show";
    //$(document).bind("checkval", function (e, inputElement) {
    //    if (inputElement) {
    //        if (inputElement.tagName == "INPUT" && (inputElement.type != "checkbox" && inputElement.type != "radio" && inputElement.type != "button" && inputElement.type != "submit")) {
    //            var label = $(inputElement).prev("label");
    //            if ($(inputElement).val() != "") {
    //                $(label).css("margin-top", "4px");
    //            } else {
    //                $(label).css("margin-top", "28px");
    //            }
    //        }
    //    }
    //}).on("keyup", "input", function () {
    //    if (this.tagName == "INPUT" && (this.type != "checkbox" && this.type != "radio" && this.type != "button" && this.type != "submit")) {
    //        $(this).trigger("checkval", [this]);
    //    }
    //}).on("focus", "input", function () {
    //    if (this.tagName == "INPUT" && (this.type != "checkbox" && this.type != "radio" && this.type != "button" && this.type != "submit")) {
    //        {
    //            var label = $(this).prev("label");
    //            $(label).css("margin-top", "4px");
    //        }
    //    }
    //}).on("blur", "input", function () {
    //    if (this.tagName == "INPUT" && (this.type != "checkbox" && this.type != "radio" && this.type != "button" && this.type != "submit")) {
    //        var label = $(this).prev("label");
    //        if ($(this).val() != "") {
    //            $(label).css("margin-top", "4px");
    //        }
    //        else {
    //            $(label).css("margin-top", "28px");
    //        }
    //    }
    //}).trigger("checkval");

    $("input").on('keydown', function (event) {
        console.log(" Global input key down");
    });
})(jQuery);

; (function ($, ko) {
    ko.mapping.toJSON = function (rootObject, options) {
        var plainJavaScriptObject = ko.mapping.toJS(rootObject, options);
        return ko.utils.stringifyJson(plainJavaScriptObject);
    };
})($, ko);