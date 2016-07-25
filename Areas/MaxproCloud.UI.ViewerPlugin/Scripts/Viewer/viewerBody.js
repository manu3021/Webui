/// <reference path="viewer.common.js" />
/// <reference path="viewer.eventreciever.js" />
/// <reference path="viewer.datacontext.js" />
/// <reference path="viewer.clipsearch.js" />
/// <reference path="viewer.uicontext.js" />
/// <reference path="date.js" />

/*Layout*/

$(".viewerClipMenu .dropdown-menu li, #footerstrips .dropdown-menu li").bind('click', function (e) {
    e.stopPropagation();
}, false);


$('#clipSearchNav a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
})


/*Universal List*/

/* opacity of body on overlay*/
$(".overlayBgOpacity").click(function () {
    $("#viewerpagebody").css('opacity', '0.3');
});

$(".wrapper").click(function () {
    $("#viewerpagebody").css('opacity', '1.0');
});

//$('.overlayBgOpacity').click(function (event) {
//    event.stopPropagation();
//});
/* opacity of body on overlay*/
/*Grid mid section*/

/*clip search*/
$(".clipSearchFilter").click(function () {
    $(".viewerClipBody").hide();
    $(".viewerHideBody").show();
});

$(".clipHideFilter").click(function () {
    $(".viewerClipBody").show();
    $(".viewerHideBody").hide();
});
/*clip search*/
/*Footer*/


