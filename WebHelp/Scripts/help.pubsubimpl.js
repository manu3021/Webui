function listener(event) {
    $('.tab-pane.active .content span.linkwrap').attr('class', 'linkwrap');    
    var link = $('.tab-pane.active .content').find('a[href="' + getCookie('_culture') + '/' + event.data + '"]')
    link.parent().parent().addClass('treeitemactive');
}

if (window.addEventListener) {  
    addEventListener("message", listener, false)  
} else {   
    attachEvent("onmessage", listener)   
}
