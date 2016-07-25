define('presenter',
    ['jquery'],
    function ($) {
        var
            transitionOptions = {
                ease: 'swing',
                fadeOut: 100,
                floatIn: 500,
                offsetLeft: '20px',
                offsetRight: '-20px'
            },

            entranceThemeTransition = function ($view, cb) {
                $view.css({
                    display: 'block',
                    visibility: 'visible'
                }).addClass('view-active').animate({
                    marginRight: 0,
                    marginLeft: 0,
                    opacity: 1
                }, transitionOptions.floatIn, transitionOptions.ease, cb);
            },

            highlightActiveView = function (route, group) {
                // Reset top level nav links
                // Find all NAV links by CSS classname 
                var $group = $(group);
                if ($group) {
                    $(group + '.route-active').removeClass('route-active');
                    if (route) {
                        // Highlight the selected nav that matches the route
                        $group.has('a[href="' + route + '"]').addClass('route-active');
                    }
                }

            },

            resetViews = function () {
                $('.view').css({
                    marginLeft: transitionOptions.offsetLeft,
                    marginRight: transitionOptions.offsetRight,
                    opacity: 0,
                    display: 'none'
                });
            },

            toggleActivity = function (show) {
                //$('#busyindicator').activity(show);
            },

             showScrollBar = function (show) {
                 $('.scroll-y,.scroll-x').slimScroll({
                     color: '#6f7074',
                     size: '5px',
                     height: '100%',
                     alwaysVisible: false
                 });
             },

             showTooltip = function (show) {
                 $(document).ready(function () {
                     $("[title]").tooltip({ placement: 'right' });
                 });
             },

            transitionTo = function ($view, cb) {
                var $activeViews = $('.view-active');

                toggleActivity(true);

                if ($activeViews.length) {
                    //make all active views disply none
                    $(".view").each(function () { $(this).css({ display: "none" }) });

                    $activeViews.fadeOut(transitionOptions.fadeOut, function () {
                        resetViews();
                        entranceThemeTransition($view, cb);
                    });
                    $('.view').removeClass('view-active');
                } else {
                    resetViews();
                    entranceThemeTransition($view, cb);
                }

                //highlightActiveView(route, group);
                //showScrollBar();
                showTooltip();

                toggleActivity(false);
            };


        return {
            toggleActivity: toggleActivity,
            transitionOptions: transitionOptions,
            transitionTo: transitionTo
        };
    });
