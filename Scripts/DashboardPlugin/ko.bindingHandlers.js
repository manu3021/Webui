(function () {

    ko.bindingHandlers.breadCrumb = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var allBindings = allBindingsAccessor();
            var breadCrumbOptions = allBindings.breadCrumbOptions || {};
            var breadCrumbEvents = allBindings.breadCrumbEvents || {};
            var data = ko.utils.unwrapObservable(valueAccessor()) || [];

            $(element).find('a').off('click');
            $(element).empty();

            var validData = $.grep(data, function (item) {
                return ko.utils.unwrapObservable(item[breadCrumbOptions.itemVisible]);
            });

            if (validData.length > 0) {
                if (breadCrumbOptions.homeText) {
                    var homeObj = {};
                    homeObj[breadCrumbOptions.itemText] = ko.utils.unwrapObservable(breadCrumbOptions.homeText);
                    homeObj[breadCrumbOptions.itemVisible] = true;
                    createBreadCrumbItem(-1, homeObj);
                }
                $.each(data, createBreadCrumbItem);
            }

            function createBreadCrumbItem(index, item) {
                var name = ko.utils.unwrapObservable(item[breadCrumbOptions.itemText]);
                var itemVisible = ko.utils.unwrapObservable(item[breadCrumbOptions.itemVisible]);
                if (index == -1 || index < data.length - 1) {
                    var $childEl = $('<a href="">' + name + '</a>');
                    var $separatorEl = $('<span>><span>');
                    $childEl.data('breadCrumbItemIndex', index);
                    if (!itemVisible) {
                        $childEl.css('display', 'none');
                        $separatorEl.css('display', 'none');
                    }
                    $(element).append($childEl);
                    $(element).append($separatorEl);
                }
                else {
                    var $childEl = $('<span>' + name + '</span>');
                    if (!itemVisible) {
                        $childEl.css('display', 'none');
                    }
                    $(element).append($childEl);
                }
            }

            $(element).find('a').on('click', function (e) {
                e.preventDefault();
                if (typeof breadCrumbEvents.click === 'function') {
                    var index = $(this).data('breadCrumbItemIndex');
                    setTimeout(function () {
                        breadCrumbEvents.click(data[index] || null);
                    }, 0);
                }
            });
        }
    }

    ko.bindingHandlers.contentcarousel = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var allBindings = allBindingsAccessor();
            var carouselEvents = allBindings.carouselEvents || {};
            var context = ko.contextFor(element);
            context.$data.on(window.dashboardconfig.events.dashboard_load_next, function (item) {
                viewModel.currentPage(item.nextIndex);
                var $wrapper = $(element).find('.ca-wrapper'),
                    $el = $wrapper.children().first(),
                    width = $el.width();
                $el.appendTo($wrapper);
                $.each($wrapper.children(), function (index) {
                    var pixels = index * width + 'px';
                    $(this).stop().animate({ left: pixels }, 500, 'easeOutExpo');
                });
            });

            context.$data.on(window.dashboardconfig.events.dashboard_load_previous, function (item) {
                viewModel.currentPage(item.nextIndex);
                var $wrapper = $(element).find('.ca-wrapper'),
                    $el = $('.ca-wrapper').children().last(),
                    width = $el.width();
                $el.prependTo($wrapper);
                $.each($wrapper.children(), function (index) {
                    var pixels = index * width + 'px';
                    $(this).stop().animate({ left: pixels }, 100, 'easeInExpo');
                });
            });

            context.$data.on(window.dashboardconfig.events.dashboard_load_bypage, function (item) {               
                var currIndex = item.currIndex,
                    prevIndex = item.prevIndex,
                    indexGap = Math.abs(item.currIndex - item.prevIndex);                

                var $wrapper = $(element).find('.ca-wrapper');
                var $el, width;
                for (i = 0; i < indexGap; i++) {
                    if (currIndex > prevIndex) {
                        $el = $wrapper.children().first();
                        width = $el.width();
                        $el.appendTo($wrapper);
                        $.each($wrapper.children(), function (index) {
                            var pixels = index * width + 'px';
                            $(this).stop().animate({ left: pixels }, 500, 'easeOutExpo');
                        });
                    }
                    else {
                        $el = $wrapper.children().last();
                        width = $el.width();
                        $el.prependTo($wrapper);
                        $.each($wrapper.children(), function (index) {
                            var pixels = index * width + 'px';
                            $(this).stop().animate({ left: pixels }, 300, 'easeInExpo');
                        });
                    }
                }                
            });
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {            
            var allBindings = allBindingsAccessor();
            var carouselEvents = allBindings.carouselEvents || {};
            var template = $($('#' + allBindingsAccessor().carouselTemplate).html());
            var data = ko.utils.unwrapObservable(valueAccessor());
            var newBindingIndex = viewModel.currentPage() + 1, newElContainer;
                        
            setTimeout(function () {
                var $el = $(element).find('.ca-wrapper');
                if ($el.length == 0) {
                    $(element).append('<div class="ca-wrapper"></div>');
                    $el = $(element).find('.ca-wrapper');
                }
                if (data.length == 0) {
                    $el.html('');
                }
                var width = $el.children('div.ca-item').first().width();
                var dashboardItemsCount = viewModel.pages().length;                             
                $.each(data, function (index, item) {                   
                    var startIndex = $el.children('div.ca-item').length;
                    if (!item.IsLoaded()) {                        
                        var $childEl;
                        dashboardItemsCount = dashboardItemsCount + 1;
                        if (dashboardItemsCount == 0 || startIndex < dashboardItemsCount) {
                            item.IsChartLoaded(true);
                            $childEl = $('<div class="ca-item ca-item-' + startIndex + '">').append(template.clone(true));
                            $childEl.css({ position: 'absolute' });                            
                            
                            var lastEl = $el.find('.ca-item-0');                            
                            if (lastEl.length == 1) {                                
                                lastEl.css('left', (startIndex * width) + 'px');
                                $childEl.insertBefore(lastEl);
                            }
                            else {
                                $el.append($childEl);
                            }
                            var childContext = bindingContext.createChildContext(this);
                            ko.applyBindingsToDescendants(childContext, $childEl.get(0));
                        }
                        else {                            
                            if (!item.IsChartLoaded()) {
                                var isDisplayAtIndexZero = _.chain(viewModel.dashboardItems)
                                                            .any(function (itm) { return itm.displayIndex == 0; });
                                if (isDisplayAtIndexZero.value()) {
                                    newElContainer = $el.find('.ca-item-' + (newBindingIndex));
                                    $childEl = newElContainer.html(template.clone(true));
                                    $childEl = newElContainer.css({ left: (width * 0) + 'px' });
                                    _.each(viewModel.dashboardItems, function (itm) {
                                        itm.displayIndex = 1;
                                    });
                                }
                                else {
                                    newElContainer = $el.find('.ca-item-' + (newBindingIndex+1));
                                    $childEl = newElContainer.html(template.clone(true));
                                    $childEl = newElContainer.css({ left: (width * 1) + 'px' });
                                }
                                var childContext = bindingContext.createChildContext(this);
                                ko.applyBindingsToDescendants(childContext, $childEl.get(0));                                
                                item.IsChartLoaded(true);
                            }
                        }                        
                        item.IsLoaded(true);
                    }
                    if (dashboardItemsCount == 0 || startIndex < dashboardItemsCount) {                        
                        var pixels = index * width + 'px';
                        $($el.find('.ca-item')[index]).css({ left: pixels });
                    }
                });
            }, 0);
        }
    };

    ko.bindingHandlers.highChart = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var allBindings = allBindingsAccessor();
            var chartOptions = ko.utils.unwrapObservable(valueAccessor()) || {};
            var highChartEvents = allBindings.highChartEvents || {};
            var context = ko.contextFor(element);
            chartOptions.plotOptions = chartOptions.plotOptions || {};
            chartOptions.plotOptions.series = chartOptions.plotOptions.series || {};
            chartOptions.plotOptions.series.events = chartOptions.plotOptions.series.events || {};
            if (highChartEvents && highChartEvents.legendClick && typeof highChartEvents.legendClick === 'function') {
                chartOptions.plotOptions.series.events.legendItemClick = function () {
                    highChartEvents.legendClick.call(context.$data, this.chart.series.indexOf(this));
                    return false;
                }
            }
            if (highChartEvents && highChartEvents.pointClick && typeof highChartEvents.pointClick === 'function') {
                chartOptions.plotOptions.series.events.click = function (e) {
                    highChartEvents.pointClick.call(context.$data, this.chart.series.indexOf(this), this.data.indexOf(e.point));
                    return false;
                }
            }
            var options = {
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle'
                },
                series: [],
                exporting: {
                    buttons: {
                        backButton: {
                            text: '◁ ' + Resources.Back_to_results,
                            theme: {
                                stroke: '#CCCCCC'
                            },
                            onclick: function () {
                                if (typeof highChartEvents.drillUp === 'function') {
                                    highChartEvents.drillUp.call(context.$data);
                                }
                            },
                            enabled: chartOptions.BackButtonEnabled
                        },
                        contextButton: {
                            enabled: false
                        }
                    }
                }
            };
            if (chartOptions && chartOptions.series) {
                _.each(chartOptions.series, function (s) {
                    s.dataLabels = {
                        useHTML: true,
                        formatter: function () {
                            return $('<div/>').css({ backgroundColor: this.point.color }).text(this.y)[0].outerHTML;
                        }
                    }
                });
                $(element).highcharts($.extend(true, options, chartOptions));
            }
        }
    }
})();