define('router',
    ['jquery', 'underscore', 'presenter', 'config', 'store', 'pagenavigator'],
    function ($, _, presenter, config, store, pagenavigator) {

        var logger = config.logger,
              defaultRoute = '',
               startupUrl = '',
               navigateBack = function () {
                   window.history.back();
               },

                register = function (options) {
                    if (options.routes) {
                        // Register a list of routes
                        _.each(options.routes, function (route) {
                            registerRoute({
                                pagetype: route.pagetype,
                                pageindex: route.pageindex,
                                route: route.route,
                                title: route.title,
                                view: options.view,
                                isDefault: !!route.isDefault
                            });
                        });
                        return;
                    }
                    // Register 1 route
                    registerRoute(options);
                },
             registerRoute = function (options) {
                 var routeExists = store.fetch(options.view);
                 if (routeExists == undefined || routeExists == null)
                     store.save(options.view, options);
             },
             navigateTohome = function () {
                 //warn the user for browser compatibility
                 console.log("browserwarned:" + $.cookie('browserwarned'));
                 if (getbrowserinfo() && ($.cookie('browserwarned') == undefined || $.cookie('browserwarned') != "true")) {
                     $.cookie('browserwarned', true);
                     var msg = Resources.Browser_version_msg;
                     if (getbrowserinfo().name.toLowerCase() == 'firefox' && getbrowserinfo().version < 37) {
                         alertify.alert(msg.format('Mozilla Firefox', '37'));
                     }
                     else if (getbrowserinfo().name.toLowerCase() == 'ie' && getbrowserinfo().version < 11) {
                         alertify.alert(msg.format('Internet Explorer', '11'));
                     }
                 }
                 var routeData = store.fetch(config.gethomepage().RegionName);
                 if (config.currentpage && routeData.view === config.currentpage.view) return;
                 if (routeData) {
                     store.save("lastvisitedpage", routeData);
                     startupUrl = routeData.route;
                     if (!startupUrl) {
                         logger.error('No route was indicated.');
                         return;
                     }
                     config.setTitle(routeData.title);
                     blockUI();
                     navigateTo(routeData, function ($view) {
                         config.setcurrentpage(routeData);
                         presenter.transitionTo($view);
                         unblockUI();

                         try {
                             $.publish("ontabchangeevent", routeData.view);
                         }
                         catch (e) {
                             console.log("Exception on publishing ontabchangeevent");
                         }
                     });
                 }
             },
        navigateTo = function (route, callback) {

            return $.get(route.route).done(function (viewData, status, settings) {
                if ((settings.responseText.indexOf('loginform') > 0))
                    window.location.href = window.location.href;
                var regionElement = $("#" + route.view);
                var dataCompleted = regionElement.attr("data-complete");
                if (dataCompleted == undefined && dataCompleted == null) {
                    regionElement.html(viewData);
                    regionElement.attr("data-complete", "true");
                }
                //return active view here
                callback(regionElement);
            })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    handleAjaxError(jqxhr, textstatus, errorthrown);
                    $.unblockUI();
                });
        },
        navigate = function (regionname) {
            var routeData = store.fetch(regionname);
            if (config.currentpage && routeData.view === config.currentpage.view) return;
            blockUI();
            if (routeData) {
                startupUrl = routeData.route;
                store.save("lastvisitedpage", routeData);
                config.setTitle(routeData.title);
                navigateTo(routeData, function ($view) {
                    config.setcurrentpage(routeData);
                    presenter.transitionTo($view, function () {
                        config.raisepagechangedEvent(routeData.view);                        
                        if (routeData.view == "fullmap") {
                            window.mapmode = 'fullmap';
                            if (window.mapconfig != undefined) {
                                window.mapconfig.mapcontext.SetmapMode(1000, true, false);
                                try {
                                    var fullmap = window.mapconfig.fullmap;
                                    if (fullmap != null) {
                                        fullmap.setZoom(fullmap.getZoom() - 1);
                                        fullmap.setZoom(fullmap.getZoom() + 1);
                                      
                                        console.log("full mapsize");
                                    }
                                } catch (e) {
                                    console.log(e.message);
                                }

                            }
                        }
                        else if (routeData.view == "configuration") {
                            window.mapmode = 'config';
                            window.mapconfig.mapcontext.SetmapMode(1000, false, true);
                            if (window.mapconfig != undefined) {
                                try {
                                    var map = window.mapconfig.map;
                                    if (map != null) {
                                        map.setZoom(map.getZoom() - 1);
                                        map.setZoom(map.getZoom() + 1);
                                     
                                    }
                                } catch (e) {
                                    console.log(e.message);
                                }

                            }

                        }
                        unblockUI();

                        try {
                            $.publish("ontabchangeevent", routeData.view);
                        }
                        catch (e) {
                            console.log("Exception on publishing ontabchangeevent");
                        }
                    });
                });
            }
        },
       run = function () {
           navigateTohome();
       };
        clearall = function () {
            store.clearall();
        },
        getbrowserinfo = function () {
            var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|edge|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
            if (/edge/i.test(ua)) {
                M = ua.match(/(edge(?=\/))\/?\s*(\d+)/i) || [];
            }
            if (/trident/i.test(M[1])) {
                tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
                return { name: 'IE', version: (tem[1] || '') };
            }
            if (M[1] === 'Chrome') {
                tem = ua.match(/\bOPR\/(\d+)/)
                if (tem != null) { return { name: 'Opera', version: tem[1] }; }
            }
            M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
            if ((tem = ua.match(/version\/(\d+)/i)) != null) { M.splice(1, 1, tem[1]); }
            return {
                name: M[0],
                version: M[1]
            };
        }
        return {
            registerRoute: registerRoute,
            register: register,
            run: run,
            navigate: navigate,
            navigateTohome: navigateTohome,
            clearall: clearall
        };
    });