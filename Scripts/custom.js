$('.carousel').carousel();
$('.dropdown-toggle').dropdown();


$('#topsearch').on('focus',function(){
    var $w=$(this).width();
    $(this).animate({width:$w+60+'px'},300);
})
.on('blur',function(){
    var $w=$(this).width();
    if($(this).val() == '') {
        $(this).animate({width:$w-60+'px'},100);
    }
});
function playPause(myVideo)
{ 
	if (myVideo.paused) 
	  myVideo.play(); 
	else 
	  myVideo.pause(); 	
}

/*************Viewer Page ***************/


/*Universal List hide on click outside */
$("#blob-show-universal-list").click(function(){
  $(".universalListOpen").css("right","0px");
  $("#page-body").css("width","75%");
  $("#header-two-rightmenu").css("left","-26%");
  $("#blob-show-universal-list").hide();
  $("#footerstrips").hide();
  $("#footerstrips2").hide();  
  $("#footerstrips3").show();
 //$(".overlay-body").css("left","0px");
});

$("#page-header, #page-body, #footer").click(function(){
  $(".universalListOpen, .universalListClose").css("right","-1500px");
  $("#page-body").css("width","100%");
  $("#header-two-rightmenu").css("left","0");
  $("#blob-show-universal-list").show();
  //$(".overlay-body").css("left","-3500px");
});

$("#hide-universal-list, #hide-universal-list-close").click(function(){
  $(".universalListOpen, .universalListClose").css("right","-1500px");
  $("#page-body").css("width","100%");
  $("#header-two-rightmenu").css("left","0");
  $("#blob-show-universal-list").show();
 // $(".overlay-body").css("left","-3500px");
});

$(".universalListTitleOpen").click(function(){
//$(".universalListClose").show();
$(".universalListOpen").css("right","-1500px");
$(".universalListClose").css("right","0");
});

$(".universalListTitleClose").click(function(){
//$(".universalListClose").hide();
$(".universalListOpen").css("right","0");
$(".universalListClose").css("right","-1500px");
});

/*$("#blob-show-universal-list").click(function(){
  $("#viewer-universal-list").css("right","0px");
  //$(".overlay-body").css("left","0px");
});

$("#page-header, #page-body, #footer").click(function(){
  $("#viewer-universal-list").css("right","-1500px");
  //$(".overlay-body").css("left","-3500px");
});

$("#hide-universal-list").click(function(){
  $("#viewer-universal-list").css("right","-1500px");
 // $(".overlay-body").css("left","-3500px");
});

$('#viewer-nav-tabs-ul[data-toggle="tab-hover"] > li > a').hover( function(){
    $(this).tab('show');
});

$('#viewer-nav-tabs-ul a').hover(function (e) {
    e.preventDefault()
    $(this).tab('show')
});
*/
/*Universal List hide on click outside */

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


/*Footer*/
$('#snapshot').tooltip('toggle');
$("#blub").click(function(){
	$("#footer").css("bottom","-200px");
	$("#footerstrips3").hide();
});

$("#blub").click(function(){
  $("#footer").css("bottom","-200px");
  $("#footerstrips").show();
  $("#footerstrips2").hide();
});

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
  //$(".gs-w").css('position','absolute');
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

/*Footer*/

$(".gridselector span").click(function(){
$(".viewerVideo li").css("width","80%");
$(".viewerVideo li").css("height","75%");
$(".viewerVideo li:nth-child(2),.viewerVideo li:nth-child(3),.viewerVideo li:nth-child(4),.viewerVideo li:nth-child(5),.viewerVideo li:nth-child(6)").css("display","none");
});

$(".gridselector span:nth-child(2)").click(function(){
$(".viewerVideo li, .viewerVideo li:nth-child(2)").css("width","40%");
$(".viewerVideo li").css("height","75%");
$(".viewerVideo li:nth-child(2)").css("display","block");
$(".viewerVideo li:nth-child(3),.viewerVideo li:nth-child(4),.viewerVideo li:nth-child(5),.viewerVideo li:nth-child(6)").css("display","none");
});

/*$(".gridselector span:nth-child(3)").click(function(){
$(".viewerVideo li, .viewerVideo li:nth-child(2),.viewerVideo li:nth-child(3)").css("width","20%");
$(".viewerVideo li:nth-child(2),.viewerVideo li:nth-child(3)").css("display","block");
$(".viewerVideo li:nth-child(4),.viewerVideo li:nth-child(5),.viewerVideo li:nth-child(6)").css("display","none");
});*/

$(".gridselector span:nth-child(5)").click(function(){
$(".viewerVideo li, .viewerVideo li:nth-child(2),.viewerVideo li:nth-child(3),.viewerVideo li:nth-child(4)").css("width","40%");
$(".viewerVideo li, .viewerVideo li:nth-child(2),.viewerVideo li:nth-child(3),.viewerVideo li:nth-child(4)").css("height","40%");
$(".viewerVideo li:nth-child(2),.viewerVideo li:nth-child(3),.viewerVideo li:nth-child(4)").css("display","block");
$(".viewerVideo li:nth-child(5),.viewerVideo li:nth-child(6)").css("display","none");
});

$(".gridselector span:nth-child(7)").click(function(){
$(".viewerVideo li, .viewerVideo li:nth-child(2),.viewerVideo li:nth-child(3),.viewerVideo li:nth-child(4),.viewerVideo li:nth-child(5),.viewerVideo li:nth-child(6)").css("width","30%");
$(".viewerVideo li, .viewerVideo li:nth-child(2),.viewerVideo li:nth-child(3),.viewerVideo li:nth-child(4),.viewerVideo li:nth-child(5),.viewerVideo li:nth-child(6)").css("height","40%");
$(".viewerVideo li:nth-child(2),.viewerVideo li:nth-child(3),.viewerVideo li:nth-child(4),.viewerVideo li:nth-child(5),.viewerVideo li:nth-child(6)").css("display","block");
});

/* Viewer Page */
/*
$(document).ready(function()
      {

          var updateOutput = function(e)
          {
              var list   = e.length ? e : $(e.target),
                  output = list.data('output');
              if (window.JSON) {
                  output.val(window.JSON.stringify(list.nestable('serialize')));//, null, 2));
              } else {
                  output.val('JSON browser support required for this demo.');
              }
          };

          // activate Nestable for list 1
          $('#nestable').nestable({
              group: 1
          })
          .on('change', updateOutput);
          
          // activate Nestable for list 2
          $('#nestable2').nestable({
              group: 1
          })
          .on('change', updateOutput);

          // output initial serialised data
          updateOutput($('#nestable').data('output', $('#nestable-output')));
          updateOutput($('#nestable2').data('output', $('#nestable2-output')));

          $('#nestable-menu').on('click', function(e)
          {
              var target = $(e.target),
                  action = target.data('action');
              if (action === 'expand-all') {
                  $('.dd').nestable('expandAll');
              }
              if (action === 'collapse-all') {
                  $('.dd').nestable('collapseAll');
              }
          });

          $('#nestable3').nestable();

      });
*/      

$('#fullscreen').click(function() {
  $('#page-body').css({
      position:'absolute', //or fixed depending on needs 
      top: $(window).scrollTop(), // top pos based on scoll pos
      left: 0,
      height: '100%',
      width: '100%',
      zIndex: 2000
  });
  $( "#page-body" ).append("<a id='exitscreen' href='viewerConfig.html'>Exit Full Screen</a>");
});

$('#exitscreen').click(function() {
  $('#page-body').css();
  $( "#page-body" ).remove();
});

/*$(".gridselector span").click(function(){
  var $input = $( this );
  console.log($input.attr( "data-width"));
  var size=300;
  $( "#jwvideocontainer div" ).width(size).addClass( "mod" );
});*/

