/*Layout*/
$(function() {
    $( "#sortable" ).sortable();
    $( "#sortable" ).disableSelection();
    $( "#resizable" ).resizable();
    $( "#ui-state-default" ).draggable({ containment: ".grids", scroll: false });
  });
  
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
                                    
$(".viewerClipMenu .dropdown-menu li, #footerstrips .dropdown-menu li").bind('click',function (e) {
           e.stopPropagation();
        },false);


$('#clipSearchNav a').click(function (e) {
  e.preventDefault();
  $(this).tab('show');
})
/*Layout*/
/*Universal List*/
$(".salvos").click(function(){
            $(".salvosListOpen").css("right","0px");
            $(".viewerVideo").css("width","73%");
            $("#header-two-rightmenu").css("left","-30%");
            $("#blob-show-universal-list").hide();
            $("#footerstrips").hide();
            $("#footerstrips2").hide();  
            $("#footerstrips3").show();
});

$("#blob-show-universal-list").click(function(){
            $(".universalListOpen").css("right","0px");
            $(".viewerVideo").css("width","73%");
            $("#header-two-rightmenu").css("left","-30%");
            $("#blob-show-universal-list").hide();
            $("#footerstrips3").show();
            $("#footerstrips").hide();
            $("#footerstrips2").hide();  
            
});

$("#hide-universal-list, #hide-universal-list-close, #hide-salvo-list").click(function(){
            $(".universalListOpen, .universalListClose, .salvosListOpen, .salvosListClose").css("right","-1500px");
            $(".viewerVideo").css("width","100%");
            $("#header-two-rightmenu").css("left","0");
            $("#blob-show-universal-list").show();
});


$(".salvoListTitleOpen").click(function(){
            $(".salvosListOpen").css("right","-1500px");
            $(".salvosListClose").css("right","0");
});

$(".salvoListTitleClose").click(function(){
            $(".salvosListOpen").css("right","0");
            $(".salvosListClose").css("right","-1500px");                                                                                
});

$(".universalListTitleOpen").click(function(){
            $(".universalListOpen").css("right","-1500px");
            $(".universalListClose").css("right","0");
});

$(".universalListTitleClose, .universalList").click(function(){
            $(".universalListOpen").css("right","0");
            $(".universalListClose").css("right","-1500px");
            $(".salvosListClose").css("right","-1500px");
});
/*Universal List*/

/*Grid mid section*/
/* chat on video click */
$(".videoContainer").click(function(){
$(".chatIconHolder").show();
$(".videoOuterWrapper").css({"border-color": "#3E3C42", 
             "border-weight":"4px", 
             "border-style":"solid"});
$("#footerstrips").show();
$("#footerstrips2").hide();
$("#footerstrips3").hide();
});

$(".wrapper").click(function(){
$(".chatIconHolder").hide();
$(".videoOuterWrapper").css("border", "");
});

$('.videoContainer').click(function(event){
    event.stopPropagation();
});
/* chat on video click */
$(".grid1").click(function(){
$(".video1").css("width","96%").css("height", "85%");
$(".video2, .video3, .video4, .video5, .video6").css("display","none");
});

$(".grid2").click(function(){
$(".video1, .video2").css("width","47.5%").css("height", "85%");
$(".video3, .video4, .video5, .video6").css("display","none");
$(".video1, .video2").css("display","block");
});

$(".grid4").click(function(){
$(".video1, .video2, .video3, .video4").css("width","47.5%").css("height", "40%");
$(".video5, .video6").css("display","none");
$(".video1, .video2,.video3, .video4").css("display","block");
});

$(".grid6").click(function(){
$(".video1, .video2, .video3, .video4, .video5, .video6").css("width","31%").css("height", "40%");
$(".video1, .video2,.video3, .video4, .video5, .video6").css("display","block");
});

$('.ui-state-default').click(function(){
     $('.ui-state-default').css("border","");
    $( this ).css({"border-color": "#08A0BC", 
            "border-width":"1px", 
            "border-style":"solid"});
       // $(this).css('box-shadow', '1px 1px 5px #08A0BC');
});

/* opacity of body on overlay*/
$(".overlayBgOpacity").click(function(){
            $("#page-body").css('opacity','0.3');
});

$(".wrapper").click(function(){
            $("#page-body").css('opacity','1.0');
});

$('.overlayBgOpacity').click(function(event){
    event.stopPropagation();
});
/* opacity of body on overlay*/
/*Grid mid section*/

/*Footer*/
$("#blub4").click(function(){
  $("#footer").css("bottom","0px");
  $("#footerstrips3").show();
  $("#footerstrips").hide();
   $("#footerstrips2").hide();
});


$("#blub2").click(function(){
  $("#footer").css("bottom","0px");
  $("#footerstrips3").show();
  $("#footerstrips2").hide();
   $("#footerstrips").hide();
});

$("#blub3").click(function(){
  $("#footer").css("bottom","0px");
  $("#footerstrips2").show();
  $("#footerstrips3").hide();
  $("#footerstrips").hide();
});

$(".viewerVideo li").click(function(){
  $("#footer").css("bottom","0px");
  $("#footerstrips").show();
  $("#footerstrips2").hide();  
  $("#footerstrips3").hide();
});

$('.viewerVideo li').click(function(event){
    event.stopPropagation();
});

$("#page-body").click(function(){
  $("#footer").css("bottom","0px");
  $("#footerstrips").hide();
  $("#footerstrips2").show();  
  $("#footerstrips3").hide();
});

/*clip search*/
$(".clipSearchFilter").click(function(){
$(".viewerClipBody").hide();
$(".viewerHideBody").show();
});

$(".clipHideFilter").click(function(){
$(".viewerClipBody").show();
$(".viewerHideBody").hide();
});
/*clip search*/

$('#fullscreen').click(function() {
  $('#page-body').css({
      position:'absolute', //or fixed depending on needs 
      top: $(window).scrollTop(), // top pos based on scoll pos
      left: 0,
      height: '100%',
      width: '100%',
     // background-color: '#e9e9e9',
      zIndex: 2000
  });
  $("#footer").css("display","none");
  $( "div" ).removeClass( "header-menu-two" );
  $( ".nav" ).css("display","none");
  $( "#page-body" ).append("<a id='exitscreen' href='viewerbody.html'>Exit Full Screen</a>");
});

$('#exitscreen').click(function() {
  $('#page-body').css();
  $( "#page-body" ).remove();
});
/*Footer*/

