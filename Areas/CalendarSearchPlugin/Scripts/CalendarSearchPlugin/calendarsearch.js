////// Filter Toggle js
$(document.body).on("click", ".switch_options .csfoption", function () {
    $('.switch_options .csfoption').removeClass('selected');
    $(this).addClass('selected');

});
$(document.body).on("click", ".click-first-tr", function () {
    $('.click-first-tr').removeClass('clicked_alarm');
    $(this).addClass('clicked_alarm');

});
