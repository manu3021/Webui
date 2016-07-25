(function (root, $, ko) {

    var pluginName = "Searchable";
    function getresult(data, url) {
        return ajaxRequest("POST", url, data);
    };


    var resultitem = function (data, options) {
        var self = this;
        self.options = options;
        self.EntityType = data.EntityType;
        self.name = data.Name;
        self.Id = data.Id;
        self.location = data.EntityHierarchy;
        self.hierarchyitems = ko.observableArray(data.Hierarchy || []);
        self.navigator = ko.computed({
            read: function () {
                var retval = '\\';
                var retValUi = $('<span class="searchNavStyle" data-bind="click:$data.navclicked">');
                $.each(self.hierarchyitems(), function (index, value) {
                    retval += retValUi.attr("data-navId", value.Id).attr("data-EntityType", value.EntityType).html(value.Name + '\\')[0].outerHTML;
                });

                return retval;
            },
            write: function (Value) {
                return "";
            }
        });
        self.icon = ko.computed({
            read: function () {
                return "icon_" + self.EntityType.toLowerCase();
            },
            write: function (iconValue) {
                return "icon_" + self.EntityType.toLowerCase();
            }
        });
        self.clicked = function (data, event) {
            if (self.options.OnResultClick) {
                self.options.OnResultClick(data, event);
            }
            //   alertify.success('name Clicked:' + self.name);
            event.stopPropagation();
            $("#result_" + self.options.searchId).hide();
        }
        self.navclicked = function (data, event) {            
            if (self.options.OnNavigatetClick) {
                self.options.OnNavigatetClick(data, event);
            }
            //  alertify.success('Nav Clicked:' + self.name);
            event.stopPropagation();
            $("#result_" + self.options.searchId).hide();
        }
    }
    var searchmodel = function (options) {
        var self = this;
        self.options = options;
        self.Query = ko.observable("");
        self.Tags = ko.observable("");
        self.startIndex = ko.observable(0);

        self.results = ko.observableArray([]);
        self.search = function (data, event) {
            if (self.options.url == undefined)
                self.options.url = $(event.currentTarget).attr('data-searchurl');
            self.Query(event.currentTarget.value);
            self.Tags($(event.currentTarget).attr('data-searchtags'));
            if (self.Query().length > 2) {
                try {
                    getresult(this, options.url).done(function (json) {
                        if (json.Success) {
                            json.data = json.data || [];
                            self.results([]);
                            $("#result_" + self.options.searchId).html("");
                            if (json.data.length > 0) {
                                self.results($.map(json.data, function (uItem) {
                                    var rItem = new resultitem(uItem, self.options);
                                    return rItem;
                                }));
                            }
                            else {
                                $("#result_" + self.options.searchId).html("<span>No result found</span>")
                            }
                            $("#result_" + self.options.searchId).show();
                            document.addEventListener("click", hideSearchResults);
                            if (self.options.SuccessCallback) {
                                self.options.SuccessCallback(json.data)
                            }

                        }

                    });
                } catch (e) {
                    console.error("search script exception " + e.message);
                    if (self.options.FailedsCallback) {
                        self.options.FailedsCallback(e);
                    }
                }
            }
            else {
                $("#result_" + self.options.searchId).hide();
            }
        }
        function hideSearchResults() {
            if (event.srcElement.id != "result_" + self.options.searchId) {
                if ($("#result_" + self.options.searchId).is(":visible")) {
                    $("#result_" + self.options.searchId).hide();
                    //self.Query("");
                }
                document.removeEventListener("click", hideSearchResults);
            }
        }
        self.isActive = ko.observable();
        self.toJson = function () { return ko.toJSON(this) };
    }
    function getdummyresult() {
        var retval = [];
        retval.push(new resultitem());
        retval.push(new resultitem());
        retval.push(new resultitem());
        return retval;
    }


    var searchPlugin = function (element, options, vm) {
        this.element = element;
        this.vm = vm;
        this.options = $.extend({}, options);
        this._name = pluginName;
        this.init(options);
    }

    searchPlugin.prototype.init = function (options) {

        this.element.each(function (index) {
            if ($(this).attr('searchable') == undefined || $(this).attr('searchable') == null) {
                var uniquid = index.toString() + '_' + (Math.random() * 1000).toString().replace(".", "");
                options.searchId = uniquid;
                if (options.templateName == undefined)
                    options.templateName = 'searchresultTmpl';
                $(this).attr('searchable', 'true');
                $(this).wrap("<div class='searchHolder' id=" + uniquid + " ></div>");
                var resultTemplate = $("<ul>");
                resultTemplate.addClass("Listitem").attr("id", "result_" + uniquid).attr("data-bind", "visible:$data.isActive,template: { name: '" + options.templateName + "', foreach: $data.results }");
                $(this).after(resultTemplate);
                $(this).attr('data-bind', 'value:$data.Query,event: {keyup:$data.search}, preventKeys:[13],hasFocus:$data.isActive');
                $(this).attr('id', 'txt' + uniquid);
                $(this).attr('placeholder', 'Enter 3 characters');
                $(this).attr('maxlength', '10');
                $(this).attr('size', '10');
                ko.applyBindings(new searchmodel(options), $('#' + uniquid)[0]);
                //TODO: Commented to fix the bug on result click event propogation after search.
                //$('#' + uniquid).on("blur", ".searchbox", function () {
                //    var context = ko.contextFor(this);
                //    context.$data.isActive(false);
                //    return true;
                //});
                $('#' + uniquid).on("click focus", ".searchbox", function () {
                    var context = ko.contextFor(this);
                    if (context.$data.Query().length > 2)
                        context.$data.isActive(true);
                    return false;
                });
            }
        });
    }
    $(".floatTxt").focus(function () {
        if ($(this).val().length != 0)
            $(this).parent().children("label").removeClass('floatLblDn').addClass('floatLblUp');
    });
    $(".floatTxt").keyup(function () {
        if ($(this).val().length != 0)
            $(this).parent().children("label").removeClass('floatLblDn').addClass('floatLblUp');
        else
            $(this).parent().children("label").removeClass('floatLblUp').addClass('floatLblDn');
    });
    $(".floatTxt").focusout(function () {
        if ($(this).val().length == 0)
            $(this).parent().children("label").removeClass('floatLblUp').addClass('floatLblDn');
    });
    $(".floatTxt").each(function () {
        if ($(this).val().length != 0)
            $(this).parent().children("label").removeClass('floatLblDn').addClass('floatLblUp');
        else
            $(this).parent().children("label").removeClass('floatLblUp').addClass('floatLblDn');
    });

    $.fn[pluginName] = function (options) {
        if (!$.data(this, 'plugin_' + pluginName)) {
            var searchplugin = new searchPlugin(this, options);
            $.data(this, 'plugin_' + pluginName, searchplugin);

            return searchplugin;
        }
    }

})(window, $, ko);