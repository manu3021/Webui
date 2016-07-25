

$(function () {
    $('.tree li:has(ul)').addClass('parent_li').find(' > span').attr('title', 'Collapse this branch');
    $('.tree li.parent_li > span').on('click', function (e) {
        var children = $(this).parent('li.parent_li').find(' > ul > li');
        if (children.is(":visible")) {
            children.hide('fast');
            $(this).attr('title', 'Expand this branch').find(' > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');
        } else {
            children.show('fast');
            $(this).attr('title', 'Collapse this branch').find(' > i').addClass('icon-minus-sign').removeClass('icon-plus-sign');
        }
        e.stopPropagation();
    });
});


/*Universal List hide on click outside */

$(".salvos").click(function () {
    $(".salvosListOpen").css("right", "0px");
    $("#viewerVideo").css("width", "73%");
    $("#header-two-rightmenu").css("left", "-30%");
    $("#blob-show-universal-list").hide();
    $("#footerstrips,").hide();
    $("#footerstrips2").hide();
    $("#footerstrips3").show();
    //$(".overlay-body").css("left","0px");
});

$("#blob-show-universal-list").click(function () {
    $(".universalListOpen").css("right", "0px");
    $("#viewerVideo").css("width", "73%");
    $("#header-two-rightmenu").css("left", "-30%");
    $("#blob-show-universal-list").hide();
    $("#footerstrips,").hide();
    $("#footerstrips2").hide();
    $("#footerstrips3").show();
    //$(".overlay-body").css("left","0px");
});


$("#hide-universal-list, #hide-universal-list-close, #hide-salvo-list").click(function () {
    $(".universalListOpen, .universalListClose, .salvosListOpen, .salvosListClose").css("right", "-1500px");
    $("#viewerVideo").css("width", "73%");
    $("#header-two-rightmenu").css("left", "0");
    $("#blob-show-universal-list").show();
    // $(".overlay-body").css("left","-3500px");
});


$(".salvoListTitleOpen").click(function () {
    //$(".universalListClose").css("right","-1500px");
    $(".salvosListOpen").css("right", "-1500px");
    $(".salvosListClose").css("right", "0");
});

$(".salvoListTitleClose").click(function () {
    //$(".universalListClose").hide();
    $(".salvosListOpen").css("right", "0");
    $(".salvosListClose").css("right", "-1500px");
});

$(".universalListTitleOpen").click(function () {
    //$(".universalListClose").show();
    $(".universalListOpen").css("right", "-1500px");
    $(".universalListClose").css("right", "0");
});

$(".universalListTitleClose, .universalList").click(function () {
    //$(".universalListClose").hide();
    $(".universalListOpen").css("right", "0");
    $(".universalListClose").css("right", "-1500px");
    $(".salvosListClose").css("right", "-1500px");
});


$(".videoContainer").click(function () {
    $(".chatIconHolder").show();
    $(".videoOuterWrapper").css({
        "border-color": "#3E3C42",
        "border-weight": "4px",
        "border-style": "solid"
    });
    $("#footerstrips").show();
    $("#footerstrips2").hide();
    $("#footerstrips3").hide();
});

$(".wrapper").click(function () {
    $(".chatIconHolder").hide();
    $(".videoOuterWrapper").css("border", "");
});

$('.videoContainer').click(function (event) {
    event.stopPropagation();
});
/* chat on video click */

/* opacity of body on overlay*/
$(".overlayBgOpacity").click(function () {
    $("#page-body").css('opacity', '0.3');
});

$(".wrapper").click(function () {
    $("#page-body").css('opacity', '1.0');
});

$('.overlayBgOpacity').click(function (event) {
    event.stopPropagation();
});

/* opacity of body on overlay*/


/*Footer*/
$('#snapshot').tooltip('toggle');
$("#blub").click(function () {
    $("#footer").css("bottom", "-200px");
    $("#footerstrips3").hide();
});

$("#blub").click(function () {
    $("#footer").css("bottom", "-200px");
    $("#footerstrips").show();
    $("#footerstrips2").hide();
});

$("#blub4").click(function () {
    $("#footer").css("bottom", "0px");
    $("#footerstrips3").show();
    $("#footerstrips").hide();
    $("#footerstrips2").hide();
});


$("#blub2").click(function () {
    $("#footer").css("bottom", "0px");
    $("#footerstrips3").show();
    $("#footerstrips2").hide();
    $("#footerstrips").hide();
});

$("#blub3").click(function () {
    $("#footer").css("bottom", "0px");
    $("#footerstrips2").show();
    $("#footerstrips3").hide();
    $("#footerstrips").hide();
});

$(".viewerVideo li").click(function () {
    $("#footer").css("bottom", "0px");
    $("#footerstrips").show();
    $("#footerstrips2").hide();
    $("#footerstrips3").hide();
    //$(".gs-w").css('position','absolute');
});

$('.viewerVideo li').click(function (event) {
    event.stopPropagation();
});


$("#page-body").click(function () {
    $("#footer").css("bottom", "0px");
    $("#footerstrips").hide();
    $("#footerstrips2").show();
    $("#footerstrips3").hide();
});


$('.ui-state-default').click(function () {
    $('.ui-state-default').css("border", "");
    $(this).css({
        "border-color": "#08A0BC",
        "border-width": "1px",
        "border-style": "solid"
    });
    // $(this).css('box-shadow', '1px 1px 5px #08A0BC');
});


