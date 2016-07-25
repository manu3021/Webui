
/// <reference path="requirejs.js" />
define('bootstrapper', ['jquery', 'config', 'store', 'presenter', 'route-config', 'eventdelegate'], function ($, config, store, presenter, routeConfig, eventdelegate, header) {
    var run = function () {
        presenter.toggleActivity(true);
        config.getpages(function () {
           routeConfig.register();
        });
        presenter.toggleActivity(false);
    };
    return {
        run: run
    };

});