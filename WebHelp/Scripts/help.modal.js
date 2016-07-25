(function ($) {
    $(document).on('click', 'a', function (event) {
        window.parent.postMessage($(this).attr('href'), "*")
        return true;
    });
}(jQuery));