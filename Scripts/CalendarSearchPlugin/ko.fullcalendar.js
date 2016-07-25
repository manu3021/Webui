ko.bindingHandlers.fullCalendar = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var allBindings = allBindingsAccessor();
        var fullCalendarOptions = allBindings.fullCalendarOptions || {};
        var calendarEvents = allBindings.calendarEvents || {};
        var isMonthView = allBindings.isMonthView;
        var currentDate = allBindings.currentDate;
        var selectedRange = allBindings.selectedRange;
        var rootContext = bindingContext;
        var innerHtml = $(element).html();
        var context = ko.contextFor(element);
        var defaultOptions = {
            defaultEventMinutes: 30,
            slotMinutes: 30,
            snapMinutes: 30,
            height: 800,
            draggable: false,
            editable: false,
            allDaySlot: false,
            selectable: true,
            unselectAuto: false,
            header: {
                left: 'month,agendaDay',
                center: 'title',
                right: 'prev,next'
            },
            columnFormat: {
                month: 'dddd'
            },
            titleFormat: {
                day: ' d MMMM yyyy'
            }
        };
        var nonOverridableOptions = {
            events: function (start, end, callback) {
                callback(ko.utils.unwrapObservable(valueAccessor()) || []);
            },
            eventRender: function (e, el, view) {
                var childContext = rootContext.createChildContext(e);
                $(el).html(innerHtml);
                ko.applyBindingsToDescendants(childContext, el.get(0));
                if (view.name == 'month') {
                    $(el).on('click', function () {
                        if (typeof calendarEvents.eventClick === 'function') {
                            calendarEvents.eventClick.call(context.$data, e);
                        }
                    });
                }
            },
            eventAfterAllRender: function (view) {
                if (view.name == 'agendaDay') {
                    var scrollPosition = 0;
                    var eventEls = view.getSlotSegmentContainer().children();
                    if (eventEls.length > 0) {
                        if ($(eventEls[0]).offset().top > 200) {
                            scrollPosition = $(eventEls[0]).offset().top;
                        }
                        view.element.find(' > div > div').animate({ scrollTop: scrollPosition }, 1);
                    }
                }
            },
            select: function (start, end, allDay, jsEvent, view) {
                if (view.name == 'month') {
                    var calendar = view.calendar;
                    calendar.options.viewSwitching = true;
                    calendar.gotoDate(start);
                    calendar.options.viewSwitching = false;
                    calendar.changeView('agendaDay');
                }
                else if (typeof calendarEvents.timeChanged === 'function') {
                    calendarEvents.timeChanged.call(context.$data, start, end);
                }
            },
            viewRender: function (view, el) {
                if (!view.calendar.options.viewSwitching) {                    
                    var isMonth = view.name == 'month';
                    var title = view.start.format(isMonth ? 'mmmm yyyy' : 'dd mmmm yyyy');
                    var titleEl = '<span class="add-on">' + view.title + '</span><input type="text" style="display:none" />';

                    $(element).find('.fc-header-title h2').off('changeDate').datetimepicker('destroy').html(titleEl).datetimepicker({
                        pickTime: false,
                        viewMode: +isMonth,
                        minViewMode: +isMonth
                    }).on('changeDate', function (event) {
                        view.calendar.gotoDate($(this).data('datetimepicker').getLocalDate());
                    }).datetimepicker('setLocalDate', view.start);
                    if (isMonthView) { isMonthView(isMonth); }
                    if (currentDate) { currentDate(view.start); }
                    if (typeof calendarEvents.viewRender === 'function') {
                        calendarEvents.viewRender.call(context.$data, view, isMonth, view.start);
                    }
                    $('.bootstrap-datetimepicker-widget').css('margin-left', '-78px');
                }
                return true;
            }
        };
        if (ko.isObservable(selectedRange)) {
            selectedRange.subscribe(function (val) {
                if (val && val.start && val.end) {
                    $(element).fullCalendar('select', val.start, val.end, false);
                }
                else {
                    $(element).fullCalendar('unselect');
                }
            });
        }
        $(element).empty().fullCalendar($.extend(defaultOptions, fullCalendarOptions, nonOverridableOptions));
        return { controlsDescendantBindings: true };
    },
    update: function (element, valueAccessor) {
        $(element).fullCalendar('refetchEvents');
    }
};

ko.bindingHandlers.lazyScrollBar = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var allBindings = allBindingsAccessor();
        var callback = allBindings.callback;
        var context = ko.contextFor(element);
        $(element).on('scroll', function () {
            if ($(this).scrollTop() + $(this).innerHeight() + 2 >= $(this)[0].scrollHeight) {
                if (callback && typeof callback === 'function') {
                    callback.call(context.$data);
                }
            }
        });
    }
};