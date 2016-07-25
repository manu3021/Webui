(function (scope) {
    var BaseModel = function () {
    };

    BaseModel.prototype.initialize = function () {

    };

    BaseModel.inherits = function (methods) {
        var self = this;
        var fn = function () {
            if (!arguments || (arguments && arguments[0] != '__protoInit')) {
                this.initialize.apply(this, arguments);
            }
        };
        fn.prototype = new self('__protoInit');
        fn.prototype.constructor = fn;
        for (var m in methods) {
            if (methods[m] && typeof methods[m] === 'object' &&
                (typeof methods[m].get === 'function' || typeof methods[m].set === 'function')) {
                methods[m].enumerable = true;
                Object.defineProperty(fn.prototype, m, methods[m]);
            }
            else {
                fn.prototype[m] = methods[m];
            }
        }
        fn.inherits = self.inherits;
        return fn;
    };

    var BaseEventModel = BaseModel.inherits({
        initialize: function () {
            this.events = {};
        },
        on: function (names, handler) {
            if (typeof handler === 'function') {
                var names = typeof names === 'string' ? names.split(' ') : [];
                for (var n in names) {
                    var name = names[n];
                    if (name) {
                        if (!this.events[name]) {
                            this.events[name] = [];
                        }
                        this.events[name].push(handler);
                    }
                }
            }
            return this;
        },
        off: function (name, handler) {
            if (typeof name === 'undefined') {
                this.events = {};
            }
            else if (this.events[name]) {
                if (handler) {
                    for (var i in this.events[name]) {
                        if (this.events[name][i] == handler) {
                            this.events[name].splice(i, 1);
                        }
                    }
                }
                if (!handler || this.events[name].length == 0)
                    delete this.events[name];
            }
            return this;
        },
        trigger: function () {
            var names = typeof arguments[0] === 'string' ? arguments[0].split(' ') : [];
            for (var n in names) {
                var name = names[n];
                if (this.events[name]) {
                    for (var i in this.events[name]) {
                        var args = Array.prototype.slice.apply(arguments, [1]);
                        this.events[name][i].apply(this, args);
                    }
                }
            }
            return this;
        },
        bindAll: function () {
            var context = this;
            for (var m in arguments) {
                this.bind(context, arguments[m]);
            }
        },
        bind: function (context, methodName) {
            var method = context[methodName];
            context[methodName] = function () {
                args = Array.prototype.slice.apply(arguments, [0]);
                return method.apply(context, args);
            }
        }
    });

    var BaseViewModel = BaseEventModel.inherits({
        initialize: function (options) {
            BaseEventModel.prototype.initialize.call(this, options);
            this.baseUrl = options.baseUrl;
            this.antiForgeryToken = options.antiForgeryToken;
            this.validationContext = options.validationContext;
            this.viewName = options.viewName;
            this.fromView = options.fromView;
            this.IsLoading = ko.observable(false);
            this.initializeViewModel(options);
        },
        initializeViewModel: function(options) {

        },
        ajaxRequest: function (type, url, data, options, dataType, cb) {
            var self = this;
            options = options || {};
            var ajaxOptions = {
                dataType: dataType,
                cache: false,
                type: type,
                processData: true,
                headers: {}
            };
            $.extend(ajaxOptions, options);
            if (dataType == 'JSON') {
                if (typeof ajaxOptions.contentType === 'undefined') {
                    ajaxOptions.contentType = "application/json";
                }
                if (data) {
                    ajaxOptions.data = ajaxOptions.processData ? JSON.stringify(data) : data;
                }
            }
           
            if (this.baseUrl) {
                url = this.baseUrl + url;
            }
            if (this) {
                ajaxOptions.headers.RequestVerificationToken = getChanllange(url);
            }
            this.IsLoading(true);
            return $.ajax(url, ajaxOptions).done(function (result) {
                self.IsLoading(false);
               
                if (cb) {
                    cb(null, result);
                }
            }).fail(function (error) {
                self.IsLoading(false);
               
                if (cb) {
                    cb(error, null);
                }
            });
        },
        getDataRequest: function (url, data, options, cb) {
            if (typeof options === 'function') {
                cb = options;
                options = null;
            }
            this.ajaxRequest('GET', this.getParameterizedUrl(url, data), null, options, 'JSON', cb);
        },
        postDataRequest: function (url, data, options, cb) {
            if (typeof options === 'function') {
                cb = options;
                options = null;
            }
            this.ajaxRequest('POST', url, data, options, 'JSON', cb);
        },
        postFileRequest: function (url, data, options, cb) {
            if (typeof options === 'function') {
                cb = options;
                options = null;
            }
            options = options || {};
            options.processData = false;
            options.contentType = false;
            this.ajaxRequest('POST', url, data, options, 'JSON', cb);
        },
        getPage: function (url, data, options, cb) {
            if (typeof options === 'function') {
                cb = options;
                options = null;
            }
            this.ajaxRequest('GET', this.getParameterizedUrl(url, data), null, options, 'HTML', cb);
        },
        getParameterizedUrl: function(url, data) {
            if (typeof data === 'object') {
                var queries = [];
                for (var i in data) {
                    if (data[i] != null && typeof (data[i]) !== 'undefined') {
                        queries.push(i + '=' + data[i]);
                    }
                }
                url = url + (url.indexOf('?') != -1 ? '&' : '?') + queries.join('&');
            }
            return url;
        },
        toJson: function () {
            return ko.mapping.toJS(this, {
                ignore: ['baseUrl', 'antiForgeryToken', 'validationContext']
            });
        },
        resolveKeyValue: function(dynamic) {
            if (dynamic && typeof dynamic === 'object') {
                var result = {}
                for (var r in dynamic) {
                    result[dynamic[r].Key] = dynamic[r].Value;
                }
                return result;
            }
            return dynamic;
        },
        publish: function () {
            $.publish.apply(this, Array.prototype.slice.call(arguments));
        },
        createGuid: function () {
            function S4() {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }
            return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
        }
    });

    var BaseValidationContext = BaseModel.inherits({
        initialize: function (formId, options) {
            BaseModel.prototype.initialize.call(this, formId, options);
            this.formId = formId;
            this.options = options;
            this.initializeContext(options);
            this.createValidator();
        },
        initializeContext: function (options) {
            if(!this.options.showErrors) {
                this.options.showErrors = function (errorMap, errorList) {
                    // Clean up any tooltips for valid elements
                    $.each(this.validElements(), function (index, element) {
                        var $element = $(element);
                        $element.data("title", "") // Clear the title - there is no error associated anymore
                            .removeClass("error invalidError")
                            .tooltip("destroy");
                    });
                    // Create new tooltips for invalid elements
                    $.each(errorList, function (index, error) {
                        var errorTitle = Resources.Error_title;// 'Error! ';
                        var helpTitle = Resources.Help_title;// 'Help! ';
                        var $element = $(error.element);
                        //var helpMessage = $element.data("help");
                        //var helpMessage = 'This is General Help message ..........';
                        $element.tooltip("destroy") // Destroy any pre-existing tooltip so we can repopulate with new tooltip content
                            .data("title", error.message)
                            .addClass("error invalidError")
                            .tooltip({
                                title:function(){return '<div class="errormsg"><span class="errtitle">'+errorTitle+'</span><span class="err-message">'+error.message+'</span></div>'},
                                    //<div class="errHelp"><span class="errHelpTitle">'+helpTitle+'</span><span class="errHelpmsg">'+helpMessage+'</span></div>'},
                                placement: "bottom",
                                trigger: 'hover',
                                html: true,
                                show: false,
                                hide: false,
                                delay: 400
                            }).tooltip('hide'); // Create a new tooltip based on the error messsage we just set in the title
                    });
                }
            }
            if (!this.options.onfocusout) {
                this.options.onfocusout = function (el, e) {
                    if (this.validationTargetFor(el)) {
                        $(el).valid();
                    }
                }
            }
            if (!this.options.onclick) {
                this.options.onclick = function (el, e) {
                    if (this.validationTargetFor(el)) {
                        $(el).valid();
                    }
                }
            }
        },
        validate: function () {
            return this.getFormEl().valid();
        },
        reset: function () {
            if (this.validator) {
                this.validator.resetForm();
            }
        },
        createValidator: function () {
            if (!this.validator) {
                var formEl = this.getFormEl();
                if (formEl.children().length > 0) {
                    this.validator = formEl.validate(this.options);
                }
            }
        },
        onViewActivated: function () {
            this.createValidator();
        },
        getFormEl: function () {
            return $('#' + this.formId);
        }
    });

    var BaseView = BaseModel.inherits({
        initialize: function (options) {
            this.baseUrl = options.baseUrl;
            this.antiForgeryToken = options.antiForgeryToken;
            this.subscriptions = {};
            this.initializeView(options);
            if (options.viewName) {
                this.viewName = options.viewName;
                var elClone = this.$el.clone();
                var elWrap = elClone.wrap('<div>').parent();
                this.html = elWrap.html();
                elClone.css('display', 'none');
                elClone.empty();
                this.defaultHtml = elWrap.html();
                this.$el.replaceWith(this.defaultHtml);
                this.onViewInitialized(options);
            }
            this.modalId = options.modalId;
        },
        initializeView: function (options) {

        },
        onViewInitialized: function(options) {

        },
        show: function (viewModel) {
            if (viewModel) {
                this.$el.replaceWith(this.html);
            }
            this.$el.css('display', 'block');
            if (typeof this.beforeShow === 'function') {
                this.beforeShow();
            }
            if (this.modalId) {
                this.$modalEl.modal({ show: true, keyboard: false, backdrop: "static" });
            }
            if (viewModel) {
                this.applyBinding(viewModel);
                this.subscribeEvents();
                if (viewModel.validationContext) {
                    viewModel.validationContext.onViewActivated()
                }
            }
        },
        applyBinding: function (viewModel) {
            var node = this.$el.get(0);
            if (node && viewModel) {
                this.close(node);
                ko.applyBindings(viewModel, node);
            }
        },
        hide: function () {
            this.$el.css('display', 'none');
            if (this.$modalEl) {
                this.$modalEl.modal('hide');
            }
        },
        close: function (node) {
            this.unSubscribeEvents();
            node = node || this.$el.get(0);
            if (node && this.getContext(node)) {
                ko.cleanNode(node);
                if (this.$modalEl) {
                    this.$modalEl.modal('hide');
                }
                this.$el.replaceWith(this.defaultHtml);
            }
        },
        subscribeEvents: function() {

        },
        unSubscribeEvents: function() {
            for (var e in this.subscriptions) {
                if (!this.subscriptions[e].persist) {
                    this.unsubscribe(e);
                }
            }
        },
        getContext: function(node) {
            return ko.contextFor(this.$el.get(0));
        },
        subscribe: function (event, handler, persist) {
            if (event && handler) {
                var context = this;
                this.unsubscribe(event);
                this.subscriptions[event] = {
                    token: $.pubsub('subscribe', event, function (event, data) {
                        handler.call(context, event, data);
                    }),
                    persist: persist
                };
            }
        },
        unsubscribe: function (event) {
            if (this.subscriptions[event]) {
                $.pubsub('unsubscribe', this.subscriptions[event].token);
                delete this.subscriptions[event];
            }
        },
        publish: function(event, data) {
            if(event) {
                $.pubsub('publish', event, data);
            }
        },
        viewModel: {
            get: function () {
                var context = this.getContext();
                return context && context.$data;
            }
        },
        $el: {
            get: function () {
                return $('#' + this.viewName);
            }
        },
        $modalEl: {
            get: function () {
                return $('#' + this.modalId);
            }
        }
    });

    var uiBase = {
        BaseModel: BaseModel,
        BaseEventModel: BaseEventModel,
        BaseViewModel: BaseViewModel,
        BaseValidationContext: BaseValidationContext,
        BaseView: BaseView
    };
    if (typeof define === "function") {
        define('uibase', function () { return uiBase });
        // Set scope even for DOM window
        scope.uibase = uiBase;
    } else if (typeof scope.uibase === "undefined") {
        scope.uibase = uiBase;
    }
})(window);