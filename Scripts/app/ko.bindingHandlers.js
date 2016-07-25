define('ko.bindingHandlers',
['jquery', 'ko'],
function ($, ko) {
    var unwrap = ko.utils.unwrapObservable;
    var windowURL = window.URL || window.webkitURL;
    var createGuid = function () {
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
    };
        
    window.addWatch();
    window.addFileBinding();

    ko.bindingHandlers.photoFile = {
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var photoFileOptions = valueAccessor();
            if (photoFileOptions && photoFileOptions.canUpload && typeof (photoFileOptions.canUpload) === 'function'
                && photoFileOptions.photoLoaded && typeof (photoFileOptions.photoLoaded) === 'function') {
                var el = $('<input type="file">');
                $(element).empty();
                $(element).find('input').unbind();
                $(element).append(el);
                el.change(function () {
                    var context = ko.contextFor(this);
                    var file = this.files[0];
                    if (file) {
                        var extension = file.type.split('/')[1];
                        if (photoFileOptions.canUpload.call(context.$data, file, extension)) {
                            var reader = new FileReader();
                            reader.onload = function (e) {
                                var fileParts = e.target.result.split(',');
                                photoFileOptions.photoLoaded.call(context.$data, file, file.type, fileParts[1]);
                            }
                            reader.readAsDataURL(file);
                        }
                    }
                });
            }
        }
    };

    // escape
    //---------------------------
    ko.bindingHandlers.escape = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var command = valueAccessor();
            $(element).keyup(function (event) {
                if (event.keyCode === 27) { // <ESC>
                    command.call(viewModel, viewModel, event);
                }
            });
        }
    };

    // hidden
    //---------------------------
    ko.bindingHandlers.hidden = {
        update: function (element, valueAccessor) {
            var value = unwrap(valueAccessor());
            ko.bindingHandlers.visible.update(element, function () { return !value; });
        }
    };

    // checboxImage
    //---------------------------
    ko.bindingHandlers.checkboxImage = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var $el = $(element),
                settings = valueAccessor();

            $el.addClass('checkbox');

            $el.click(function () {
                if (settings.checked) {
                    settings.checked(!settings.checked());
                }
            });

            ko.bindingHandlers.checkboxImage.update(
                element, valueAccessor, allBindingsAccessor, viewModel);
        },
        update: function (element, valueAccessor) {
            var $el = $(element),
                settings = valueAccessor(),
                enable = (settings.enable !== undefined) ? unwrap(settings.enable()) : true,
                checked = (settings.checked !== undefined) ? unwrap(settings.checked()) : true;

            $el.prop('disabled', !enable);

            checked ? $el.addClass('selected') : $el.removeClass('selected');
        }
    };

    // favoriteCheckbox
    //---------------------------
    ko.bindingHandlers.favoriteCheckbox = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var $el = $(element);

            $el.addClass('markfavorite');

            ko.bindingHandlers.favoriteCheckbox.update(
                element, valueAccessor, allBindingsAccessor, viewModel);
        },
        update: function (element, valueAccessor) {
            var $el = $(element),
                valAccessor = valueAccessor(),
                enable = (valAccessor.enable !== undefined) ? unwrap(valAccessor.enable()) : true,
                checked = (valAccessor.checked !== undefined) ? unwrap(valAccessor.checked()) : true;

            $el.prop('disabled', !enable);
            if (checked) {
                if (enable) {
                    $el.attr('title', 'remove favorite');
                } else {
                    $el.attr('title', 'locked');
                }
            } else {
                $el.attr('title', 'mark as favorite');
            }

            checked ? $el.addClass('selected') : $el.removeClass('selected');
            enable ? $el.removeClass('locked') : $el.addClass('locked');
        }
    };

    // starRating
    //---------------------------
    ko.bindingHandlers.starRating = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            // Create the span's (only do in init)
            for (var i = 0; i < 5; i++) {
                $('<span>').appendTo(element);
            }

            ko.bindingHandlers.starRating.update(element, valueAccessor, allBindingsAccessor, viewModel);
        },

        update: function (element, valueAccessor, allBindingsAccessor) {
            // Give the first x stars the 'chosen' class, where x <= rating
            var ratingObservable = valueAccessor(),
                allBindings = allBindingsAccessor(),
                enable = (allBindings.enable !== undefined) ? unwrap(allBindings.enable) : true;

            // Toggle the appropriate CSS classes
            if (enable) {
                $(element).addClass('starRating').removeClass('starRating-readonly');
            } else {
                $(element).removeClass('starRating').addClass('starRating-readonly');
            }

            // Wire up the event handlers, if enabled
            if (enable) {
                // Handle mouse events on the stars
                $('span', element).each(function (index) {
                    var $star = $(this);

                    $star.hover(
                        function () {
                            $star.prevAll().add(this).addClass('hoverChosen');
                        },
                        function () {
                            $star.prevAll().add(this).removeClass('hoverChosen');
                        });

                    $star.click(function () {
                        //var ratingObservable = valueAccessor(); // Get the associated observable
                        ratingObservable(index + 1); // Write the new rating to it
                    });
                });
            }

            // Toggle the chosen CSS class (fills in the stars for the rating)
            $('span', element).each(function (index) {
                $(this).toggleClass('chosen', index < ratingObservable());
            });
        }
    };

    ko.bindingHandlers.datepicker = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            //initialize datepicker with some optional options
            var options = allBindingsAccessor().datepickerOptions || {};
            var defaultMode = allBindingsAccessor().setDefaultMode;
            $(element).datetimepicker(options);
            $(element).datetimepicker("setDate", null);
            if (allBindingsAccessor().datepickerOptions.pickSeconds == false) {
                $('.bootstrap-datetimepicker-widget td span').css('padding-left', '24px');
            }
            ko.utils.registerEventHandler(element, "changeDate", function (event) {
                var value = valueAccessor();
                var widget = $(element).data("datetimepicker");
                if (ko.isObservable(value)) {
                    value(getISODate(widget.getLocalDate(true), defaultMode));
                }
                widget.widget.hide();
            });
            var clearBtn = $(element).find('a:first');
            if (clearBtn.length > 0) {
                ko.utils.registerEventHandler(clearBtn.get(0), 'click', function (event) {
                    var value = valueAccessor();
                    if (ko.isObservable(value)) {
                        value('');
                    }
                });
            }

        },
        update: function (element, valueAccessor) {
            var value, widget = $(element).data("datetimepicker");
            if (widget) {
                value = ko.utils.unwrapObservable(valueAccessor());
                if (!value) {
                    $(element).datetimepicker("setDate", null);
                    return;
                }
                var updatedValue = _.isString(value) ? (value.indexOf('/Date') >= 0 ? new Date(value.match(/\d+/)[0] * 1) : moment(value).toDate()) : getJSDate(value);
                widget.setLocalDate(updatedValue);
            }
        }
    }

    var getISODate = function (date, setDefaultMode) {
        var format = 'YYYY-MM-DD HH:mm:ssZ';
        if (date && moment(date).isValid()) {
            var formattedDate = {};
            if (setDefaultMode == 0) {
                formattedDate = moment(date).hours(0).minutes(0).seconds(0);
            }
            else if (setDefaultMode == 1) {
                formattedDate = moment(date).hours(23).minutes(59).seconds(59);
            }
            else {
                formattedDate = moment(date);
            }
            if (formattedDate.isValid()) {
                if (format) {
                    return formattedDate.format(format);
                }
                else {
                    return new Date(formattedDate);
                }
            }
        }
        return null;
    };

    var getJSDate = function (date) {
        if (date) {
            return new Date(moment(date));
        }
        return null;
    };

    ko.bindingHandlers.drop = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var dropElement = $(element);
            var dropOptions = {
                drop: function (event, ui) {
                    valueAccessor().value(ui);
                }

            };
            dropElement.droppable(dropOptions);
        }
    };
    ko.bindingHandlers.drag = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var dragElement = $(element);
            var dragOptions = {
                drag: function (event, ui) {
                    valueAccessor().value(ui);
                },
                revert: 'invalid'
            };

            dragElement.draggable(dragOptions);
        }
    };

    ko.bindingHandlers.stopBinding = {
        init: function (element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            return { controlsDescendantBindings: !!value };
        }
    }
    ko.virtualElements.allowedBindings.stopBinding = true;

    ko.bindingHandlers.loadingWhen = {
        init: function (element, valueAccessor) {
            var
            //cache a reference to the element as we use it multiple times below
            $element = $(element),
            //get the current value of the css 'position' property
            currentPosition = $element.css("position")
            //create the new div with the 'loader' class and hide it
            $loader = $("<div></div>").addClass("appbusyIndicator").hide();

            //add the loader div to the original element
            $element.append($loader);

            //make sure that we can absolutely position the loader against the original element
            if (currentPosition == "auto" || currentPosition == "static")
                $element.css("position", "relative");

            //center the loader
            $loader.css({
                position: "absolute",
                top: "50%",
                left: "50%",
                "margin-left": -($loader.width() / 2) + "px",
                "margin-top": -($loader.height() / 2) + "px"
            });
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var isLoading = ko.utils.unwrapObservable(valueAccessor()),

            //get a reference to the parent element
            $element = $(element),

            //get a reference to the loader
            $loader = $element.find("div.loader")

            //get a reference to every *other* element
            $childrenToHide = $element.children(":not(div.loader)");

            //if we are currently loading...
            if (isLoading) {
                //...hide and disable the children...
                $childrenToHide.css("visibility", "hidden").attr("disabled", "disabled");
                //...and show the loader
                $loader.show();
            }
            else {
                //otherwise, fade out the loader
                $loader.fadeOut("fast");
                //and re-display and enable the children
                $childrenToHide.css("visibility", "visible").removeAttr("disabled");
            }
        }
    };

    ko.bindingHandlers.busyIndicator = {
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            if ($.fn.showLoading && $.fn.hideLoading) {
                var busyIndicatorOptions = valueAccessor();
                var showBusy = unwrap(busyIndicatorOptions.show);
                if (showBusy && !element.indicatorID) {
                    element.indicatorID = createGuid();
                    window.blockUI();
                }
                else if (element.indicatorID) {
                    window.unblockUI();
                    delete element.indicatorID;
                }
            }
        }
    };

    ko.bindingHandlers.image = {
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var src = unwrap(valueAccessor());
            if (src) {
                var image = new Image();
                image.onload = function () {
                    $(element).css('background-image', 'url(' + src + ')');
                };
                image.src = src;
            }
        }
    };

    ko.bindingHandlers.autoFilter = {
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = unwrap(valueAccessor());
            if (value) {
                var wrapperClassName = value.wrapperClassName;
                $(element).on('keyup paste', function () {
                    var searchText = !!$(element).val() ? $(element).val().toLowerCase() : '';
                    var selector = '.' + wrapperClassName + ' .search-item'
                    $(selector).each(function () {
                        var excludeOthers = false;
                        $(this).find(".search-item-text").each(function () {
                            var elValue = $(this).text();
                            if (elValue) {
                                elValue = elValue.toLowerCase();
                                if (elValue.indexOf(searchText) >= 0 || searchText.length < 1) {
                                    var parentEl = $(this).closest(".search-item");
                                    if (parentEl) {
                                        parentEl.fadeIn(250);
                                        excludeOthers = true;
                                    }
                                }
                                else if (!excludeOthers) {
                                    var parentEl = $(this).closest(".search-item");
                                    if (parentEl) {
                                        parentEl.fadeOut(250);
                                    }
                                }
                            }
                        });
                    });
                });
            }
        }
    };

    ko.bindingHandlers.popOver = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var attribute = ko.utils.unwrapObservable(valueAccessor());
            var popOverId = createGuid();
            //var popovertemplate;
            var popovertemplate = '<div class="webui-popover" {0}><div class="arrow"></div><h3 class="webui-popover-title"></h3><div class="webui-popover-content"><section class="contentWrap"></section></div>'
            if (ko.isObservable(attribute.show)) {
                attribute.show.subscribe(function (val) { showPopOver(element, val); });
            }
            
            $(element).attr('data-container', attribute.container ? ('#' + attribute.container) : 'body').attr('data-popoverid', popOverId).webuiPopover({
                //placement: attribute.placement || 'right',
                placement: 'auto',
                content: "<div class='popOverClass' id='" + popOverId + "'>" + $('script#' + attribute.name).html() + "</div>",
                html: true,
                cache: false,
                title: attribute.popovername,
                async: true,
                template: popovertemplate.replace('{0}', attribute.popovername ? 'data-popovername =' + attribute.popovername : ''),
                trigger: 'manual'
            }).click(function () { attribute.show(true); });

            $('body').on('click', function (e) {
                if (e.target !== element && !$(element).find(e.target).length > 0 && !$(e.target).parents().is('.webui-popover.in')) {
                    attribute.show(false);
                }
            });

            function showPopOver(el, val) {
                if (val) {
                    $(el).webuiPopover('show');
                    ko.applyBindingsToDescendants(ko.contextFor(el), $('#' + $(el).attr('data-popoverid')).get(0));
                }
                else {
                    ko.cleanNode($('#' + $(el).attr('data-popoverid')).get(0));
                    $(el).webuiPopover('hide');
                }
            }
        }
    };

    ko.bindingHandlers.preventKeys = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            $(element).on('keydown', function (e) {
                var keyCodes = unwrap(valueAccessor()) || [];
                if (keyCodes.indexOf(e.keyCode) >= 0) {
                    e.preventDefault();
                }
            });
        }
    }

    ko.extenders.trimText = function (target, precision) {
        var result = ko.computed({
            read: target,
            write: function (newValue) {
                if (newValue) {
                    valueToWrite = $.trim(newValue);
                    target(valueToWrite);
                    target.notifySubscribers(valueToWrite);
                }
            }
        }).extend({ notify: 'always' });
        result(target());
        return result;
    };

    ko.bindingHandlers.allowOnlyNumeric = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            $(element).keydown(function (e) {
                if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
                    (e.ctrlKey && $.inArray(e.keyCode, [65, 67, 86, 88, 35]) !== -1) ||
                    (e.keyCode >= 35 && e.keyCode <= 40)) {
                    return;
                }
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
                    (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            });
        }
    };
    // currency
    //---------------------------
    ko.bindingHandlers.currency = {
        update: function (element, valueAccessor) {
            //unwrap the amount (could be observable or not)
            var amount = parseFloat(ko.utils.unwrapObservable(valueAccessor())) || 0;                        
            var newValueAccessor = function () {
                return "$" + amount.toFixed(2);
            };            
            ko.bindingHandlers.text.update(element, newValueAccessor);
        }
    };
});