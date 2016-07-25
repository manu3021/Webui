define('eventdelegate',
    ['jquery', 'amplify', 'config', 'route-config', 'datacontext'],
    function ($, amplify, config, routerConfig, datacontext) {
        var init = function () {
            $.subscribe("footermenuitemclick", dashboardmenucilcked);
            $.subscribe("userprofilemenuitemclick", userprofilemeuitemclicked)
            $.subscribe(config.events.accountupdatefailed, accountupdatefailed)
            $.subscribe(config.events.accountupdatesuccess, accountupdatesuccess)
        },
            logger = config.logger;

        function accountupdatesuccess(eventname, data) {
            //alertify.success("accountupdatesuccess for AccountId" + data.Id, "Application");
            //logger.info("accountupdatesuccess for AccountId" + data.Id, "Application");
        }

        function accountupdatefailed(eventname, data) {
            //alertify.error("accountupdatefailed for AccountId" + data.Id);
        }

        function userprofilemeuitemclicked(eventname, data) {
            var menuObj = $.parseJSON(data);
            switch (menuObj.tag) {
                case 'PROFILE': {
                    if (config.pagerouter)
                    {
                        config.pagerouter.navigate("Profile");
                      //  alertify.success("profile for user" + data, "Application");
                    }
                    break;
                }
                case 'FULLSCREEN': break;
                case 'HELP': {
                    PopupCenter(window.location.href+ "WebHelp/help.html", "", 1290, 590);
                    break;
                }
                case 'LOGOUT': {
                    if (config.pagerouter) {
                        config.pagerouter.clearall();
                    }
                    datacontext.signout();
                    break;
                }
                default:
                
            }
           
           
        }
        function dashboardmenucilcked(eventname, data) {
            //logger.info("dashboardmenuitemclick event recieved successfully " + data, "Application");
            routerConfig.navigate(data.view);
        }
        init();
        return {
            init: init,
            dashboardmenuitemclicked: dashboardmenucilcked
        };
    });

/* Help pop up window */
    function PopupCenter(pageURL, title, w, h) {
        var left = (screen.width / 2) - (w / 2);
        var top = (screen.height / 2) - (h / 2);
        var targetWin = window.open(pageURL, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=40, left=' + left);
    }
