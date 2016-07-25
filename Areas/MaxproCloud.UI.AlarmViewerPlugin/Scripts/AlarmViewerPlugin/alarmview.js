$(document).on("click", "#lock-unlock", function () {
    $("#lock-unlock").toggleClass("secondary-button", "primary-button");

    $(this).html($(this).html() == "Lock" ? "Unlock" : "Lock");
});

//Multiple video icon click
//$(document.body).on("click", ".icon_multivideo", function (event) {
//    $("#multiple-videos").toggle("slow");
//});


// For search box closing start here
$(".table-alarm-container").click(function () {
    if ($(".searchSpantagholder").children().length == 0) {
        $("#searchSpan").removeClass("selected-span-filter");
        $(".ulClipSearchIconHolder").removeClass("open");
    }
});
//For search box closing end here

$('.search-popover').click(function (e) {
    e.stopPropagation();
});

$(".alarm-search-content .search-filter-text").click(function (event) {
    if ($('.alarm-search-content>.active').attr('id') != "eventtab") {
        window.alarmconfig.uicontext.searchButtonClick(event.currentTarget);
    }
});

$("#searchSpan").click(function () {
    $(this).addClass("selected-span-filter");
    $(".alarm-search-textbox").show().focus(101);
    $("#auto-comp-list").parent().hide();
});

$(".alarm-search-textbox").keypress(function (event) {
    if (event.which == 44)
        event.preventDefault();
});

// For action popup closing start here
$(document).on("click", ".popoverCloseIcon", function () {
    $(this).parents('.webui.popover').removeClass('in').css('display', 'none');
});
// For action popup closing end here


// Search Box Width Start Here

function searchBoxWidth() {   
    var totalwidth = 0;
    var upsrchboxwidth = 0;
    var tagwidth = 0;
    var tagspanholder  = $('.searchSpantagholder');
    setTimeout(function () { $(".searchSpantagholder").css('display', 'inline-block'); }, 100);
    var srchMainSpanWidth = $('.searchSpan').width();
    var tagspanholderwidth = tagspanholder.width();
    tagwidth = $(".searchSpantagholder > .primary-button:last-child").width() + 28;

    $(".searchSpantagholder > .primary-button").each(function () {
        totalwidth = totalwidth + ($(this).width() + 28);
    });
    if (totalwidth < tagspanholderwidth) {
        upsrchboxwidth = srchMainSpanWidth - totalwidth;
    }
    else {
        upsrchboxwidth = srchMainSpanWidth - tagspanholderwidth - 10;
        var leftPos = tagspanholder.scrollLeft();
        tagspanholder.animate({ scrollLeft: leftPos + tagwidth }, 100);
    }
    $('.alarm-search-textbox').css("width", upsrchboxwidth);

    if ($(".searchSpantagholder > .primary-button").length == 0) {
        $('.alarm-search-textbox').css('width', '92%');
    }
}

// Search Box Width End Here