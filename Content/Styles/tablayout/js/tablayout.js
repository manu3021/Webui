var currentTabId = -1;
; (function ($) {
    var pluginName = "customtabs",
         defaults = {};
    $.fn["customtabs"] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                new tabPlugin(this, options));
            }
        });
    }
    function tabPlugin(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }
    tabPlugin.prototype.init = function () {
        //$(this.element).height($(this).parent().innerHeight());
        initializeTabControl($(this.element));
    }
    function onListItemClick($tabitem) {
        var data = $tabitem.data;
        settabitemstatus(data.parent, data.item);
    }
    function settabitemstatus($tabcontainer, $activeitem) {
        try {
            var $tabMenu = $($tabcontainer.children(".ui-tab-menu")[0]);
            var $tabmenuList = $($tabMenu.children("ul.ui-tab-list")[0]);
            var tabItems = $tabmenuList.children("li.ui-tab-listitem");
            for (var i = 0; i < tabItems.length; i++) {
                $(tabItems[i]).removeClass('ui-active-tab');
            }
            $activeitem.addClass('ui-active-tab');
            var activeTabId = $activeitem.attr("data-tabid");
            var $tabContent = $($tabcontainer.children(".ui-tab-content")[0]);
            settabcontent($tabContent, activeTabId);
            if (currentTabId != activeTabId) {
                currentTabId = activeTabId;
                $.publish("tabselectedevent", activeTabId);
            }
        } catch (e) {
            window.Logger.error(e.message);
        }
    }
    function settabcontent($tabcontent, activeTabid) {
        try {

            $tabcontent.children(".ui-tab-page").each(function () {
                $(this).removeClass("ui-tab-pageactive");
                $(this).addClass("ui-tab-page");
            });
            var tabPage = $tabcontent.children("[data-tabid='" + activeTabid + "']")[0];
            if (tabPage == undefined) {
                window.Logger.error("tab page id mis matach");
            }
            $(tabPage).addClass("ui-tab-pageactive");
        } catch (e) {
            window.Logger.error(e.message);
        }
    }
    function initializeTabControl($uitabcontainer) {
        try {
            var $tabMenu = $($uitabcontainer.children(".ui-tab-menu")[0]);
            var $tabmenuList = $($tabMenu.children("ul.ui-tab-list")[0]);
            var $tabcontent = $($uitabcontainer.children(".ui-tab-content")[0]);
            //  $tabcontent.height($uitabcontainer.innerHeight() - $tabMenu.outerHeight());
            $tabmenuList.children("li.ui-tab-listitem").each(function () {
                var tabstatus = $(this).attr("data-tab-status");
                if (tabstatus != undefined && tabstatus != null && tabstatus == "active") {
                    var activeTabid = $(this).attr("data-tabid");
                    settabcontent($tabcontent, activeTabid);
                    currentTabId = activeTabid;
                    $(this).addClass('ui-active-tab');
                }
                else {
                    $(this).removeClass('ui-active-tab');
                }
                $(this).bind("click", { item: $(this), parent: $uitabcontainer }, onListItemClick);
            });
        } catch (e) {
            window.Logger.error(e.message);
        }
    }
})(jQuery);