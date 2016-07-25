define('route-config',
    ['config', 'router', 'store', 'header'],
    function (config, router, store) {
        config.pagerouter = router;
        var routeData = [
              {
                  view: "dashboard",
                  routes: [
                      {
                          isDefault: true,
                          route: "page/getpage?regionname=dashboard",
                          title: 'Dashboard'
                      }
                  ]
              }];
        var logger = config.logger,
            navigate = function (regionname) {
                router.navigate(regionname);
            },
        addroute = function (pagedata) {
            var route = {
                view: pagedata.RegionName,
                routes: [
                {
                    pageindex: pagedata.PageIndex,
                    pagetype: pagedata.PageType,
                    isDefault: false,
                    route: getpageAction() + "?regionname=" + pagedata.RegionName,
                    title: pagedata.PageName
                }
                ]
            };
            router.register(route);
        },
        getpageAction = function () {
            return $("#getpage").attr("data-url");
        },
        register = function () {
            if (config.pages() == undefined || config.pages() == null) {
                throw Error("Pages cannot be empty");
            }
            for (var i = 0; i < config.pages().length; i++) {
                addroute(config.pages()[i]);
            }
            router.run();
        };
        return {
            register: register,
            addroute: addroute,
            navigate: navigate
        };
    });