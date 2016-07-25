var TimeInputBox = function (container, options) {
    this.container = container;
    this.options = options;
    this.initialize();
    this.initEvents();
};

TimeInputBox.prototype.initialize = function () {
    this.container.empty();
    this.hoursText = $('<input>').attr('maxlength', 2);
    this.minutesText = $('<input>').attr('maxlength', 2);
    this.meridiemText = $('<input>').attr('maxlength', 2).addClass('meridiem-field');
    this.separator = $('<label>').html(':');
    this.container.append(this.hoursText, this.separator, this.minutesText, this.meridiemText);
    this.meridiemText.addClass('visibility', this.options.is24HoursFormat ? 'hidden' : 'visible');
    this.container.bind('focus', function () { this.select(); });
};

TimeInputBox.prototype.setTime = function (hours, minutes, meridiem) {
    this.hoursText.val(this.formatTime(this.validateHours(hours)));
    this.minutesText.val(this.formatTime(this.validateMinutes(minutes)));
    this.meridiemText.val(meridiem);
};

TimeInputBox.prototype.formatTime = function (val) {
    val = val.toString();
    return ('00' + val).substr(val.length);
};

TimeInputBox.prototype.getTime = function () {
    var hours = parseInt(this.hoursText.val());
    var minutes = parseInt(this.minutesText.val()); 
    return {
        isValid: hours == this.validateHours(hours) && minutes == this.validateMinutes(minutes),
        hours: hours,
        minutes: minutes,
        meridiem: this.options.is24HoursFormat ? '' : this.meridiemText.val()
    };
};

TimeInputBox.prototype.validateHours = function (hours) {
    hours = isNaN(hours) ? 0 : hours;
    if (this.options.is24HoursFormat) {
        hours = hours < 0 ? 0 : (hours > 23 ? 23 : hours);
    }
    else{
        hours = (hours < 0 || hours > 12) ? 12 : hours;
    }
    return hours;
};

TimeInputBox.prototype.validateMinutes = function (minutes) {
    minutes = isNaN(minutes) ? 0 : minutes;
    return minutes < 0 ? 0 : (minutes > 59 ? 59 : minutes);
};

TimeInputBox.prototype.initEvents = function () {
    var self = this;
    this.container.find('input').bind('keydown', function (e) {
        if ($.inArray(e.keyCode, [8, 9, 27, 13]) !== -1 ||
            (e.keyCode == 65 && e.ctrlKey === true) ||
            (!$(this).hasClass('meridiem-field') && (!e.shiftKey && e.keyCode >= 48 && e.keyCode <= 57))) {
            return;
        }
        if ($(this).hasClass('meridiem-field')) {
            if (e.keyCode == 65) {
                $(this).val('AM');
            }
            else if (e.keyCode == 80) {
                $(this).val('PM');
            }
        }
        e.preventDefault();
    });
    this.hoursText.bind('change', function (e) {
        $(this).val(self.formatTime(self.validateHours(parseInt($(this).val()))));
    });
    this.minutesText.bind('change', function (e) {
        $(this).val(self.formatTime(self.validateMinutes(parseInt($(this).val()))));
    });
};

TimeInputBox.prototype.show = function (hours, minutes, meridiem, bbox, data) {
    this.container.show();
    this.hoursText.focus();
    if (data) {
        for (var d in data) {
            this[d] = data[d];
        }
    }
    this.setTime(hours, minutes, meridiem || '');
    this.container.offset({ left: bbox.left, top: bbox.top });
    this.container.css({ width: bbox.width, height: bbox.height });
    this.container.find('input, label').css({ height: bbox.height });
    this.separator.css({ lineHeight: bbox.height + 'px' });
};

TimeInputBox.prototype.setOptions = function (options) {
    $.extend(this.options, options);
    if ('is24HoursFormat' in options) {
        this.meridiemText.addClass('visibility', this.options.is24HoursFormat ? 'hidden' : 'visible');
    }
};

$.fn.extend({
    timeInputBox: function (options) {
        if (!this.data('timeInputBox')) {
            this.data('timeInputBox', new TimeInputBox(this, options || {}));
        }
        return this;
    }
});