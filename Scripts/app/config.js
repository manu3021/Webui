define('config', ['jquery', 'underscore', 'toastr', 'ko', "uibase"], function ($, _, toastr, ko, uibase) {
    var currentuser = ko.observable(),
        router = null,
         logger = toastr,
         defaultbodyElement = $("#page-body"),
        events = {
            treeviewitemselected: "treeviewitemselected",
            footermenuitemclick: "footermenuitemclick",
            headermenuitemclick: "headermenuitemclick",
            homemenuitemclick: "homemenuitemclick",
            userprofilemenuitemclicked: "userprofilemenuitemclick",
            accountupdatefailed: "accountupdatefailed",
            accountupdatesuccess: "accountupdatesuccess",
            applicationpagechanged: "applicationpagechanged"
        },
        stateKeys = { lastview: 'state.active-has' },
         storeExpirationMs = (1000 * 60 * 60 * 24), // 1 day
         toastrTimeout = 2000,
         title = Resources.MPC4,
         pages = ko.observable(),
         currentpage = null;
    getpagesurl = function () {
        return $("#getpages").attr("data-url");
    }
    callbacks = { raisepagechangedevent: null },

    setcurrentpage = function (pageRoute) {
        try {
            console.log(pageRoute);
            this.currentpage = pageRoute;
            if (callbacks.raisepagechangedevent)
                callbacks.raisepagechangedevent(pageRoute);
        } catch (e) {
            console.error(e);
        }
    },
    getpages = function (completed) {
        $.get(getpagesurl()).done(function (jsondata, status, settings) {
            if ((settings.responseText.indexOf('loginform') > 0))
                window.location.href = window.location.href;
            pages(jsondata);
            if (completed != null)
                completed();
        }).error(function () { });
    },
    setTitle = function (pagetitle) {
        //var page = _.find(pages(), function (page) {
        //    return page.RegionName == viewname
        //});
        // header.setpagetitle(pagetitle);
    }
    gethomepage = function () {
        var homePage = _.find(pages(), function (page) {
            return page.PageType == "home"
        });
        return homePage;
    }
    raisepagechangedEvent = function (pageName) {
        try {
            $.publish(events.applicationpagechanged, { pageName: pageName });
        } catch (e) {
            console.error(e);
        }
    },
    init = function () {
        toastr.options = {
            "closeButton": false,
            "debug": false,
            "positionClass": "toast-bottom-right",
            "onclick": null,
            "showDuration": "300",
            "hideDuration": "1000",
            "timeOut": "2000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        };
        //getpages();
    };
    init();


    return {
        currentuser: currentuser,
        logger: logger,
        stateKeys: stateKeys,
        title: title,
        setTitle: setTitle,
        window: window,
        storeExpirationMs: storeExpirationMs,
        gethomepage: gethomepage,
        getpages: getpages,
        pages: pages,
        defaultbodyElement: defaultbodyElement,
        events: events,
        currentpage: currentpage,
        setcurrentpage: setcurrentpage,
        pagerouter: router,
        callbacks: callbacks,
        raisepagechangedEvent: raisepagechangedEvent
    };
});

define('pagenavigator', ['jquery', 'config', 'header'], function ($, config, header) {

    config.callbacks.raisepagechangedevent = function (routeData) {
        //Initialize header
        header.initialize(config);
    }

    header.callbacks.navigatetoPage = function (data) {
        if (config.pagerouter) {
            config.pagerouter.navigate(data.RegionName);
        }
    };
    header.callbacks.navigatetohome = function (data) {
        if (config.pagerouter) {
            config.pagerouter.navigateTohome();
        }
    }
});
window.global = window.global || {};
window.global.constants = (function ($) {
    var
        events = {
            tabselected: "tabselectionchanged",
            ontabshown: "tabshown"
        }
    return {
        events: events
    }
})($);

if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
              ? args[number]
              : match
            ;
        });
    };
}