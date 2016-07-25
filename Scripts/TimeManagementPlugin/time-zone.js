
var BaseElement = uibase.BaseEventModel.inherits({
    initialize: function (options) {
        uibase.BaseEventModel.prototype.initialize.call(this, options);
        this.container = options.container;
        this.ns = { xmlns: 'http://www.w3.org/2000/svg', xlink: 'http://www.w3.org/1999/xlink' };
    },
    createEl: function (name, attribValues, defaultAttribsRequired, parent) {
        var el = document.createElementNS(this.ns.xmlns, name);
        if (defaultAttribsRequired) {
            this.addClass(el, 'tz-default');
        }
        if (attribValues) {
            this.setAttributes(el, attribValues);
        }
        if (!parent) {
            parent = this.container;
        }
        parent.appendChild(el);
        return el;
    },
    setAttributes: function (el, data) {
        for (var d in data) {
            var attrib = d.split(':');
            if (attrib.length > 1) {
                var ns = attrib.length > 1 ? this.ns[attrib[0]] : null;
                var property = attrib.length > 1 ? attrib[1] : attrib[0];
                el.setAttributeNS(ns, property, data[d]);
            }
            else {
                el.setAttribute(d, data[d]);
            }
        }
    },
    remove: function () {
        if (this.shape) {
            $(this.shape).find("*").andSelf().unbind();
            this.shape.parentNode.removeChild(this.shape);
        }
    },
    addClass: function (el, className) {
        if (typeof className === 'string') {
            var classes = ($(el).attr('class') || '').split(' ');
            if (classes.indexOf(className.toLowerCase()) == -1) {
                classes.push(className.toLowerCase());
                el.setAttribute('class', classes.join(' '));
            }
        }
    },
    removeClass: function (el, className) {
        if (typeof className === 'string') {
            var classes = ($(el).attr('class') || '').split(' ');
            var classIndex = classes.indexOf(className.toLowerString());
            if (classIndex >= 0) {
                classes.splice(classIndex, 1);
                el.setAttribute('class', classes.join(' '));
            }
        }
    }
});

var TimeZone = BaseElement.inherits({
    initialize: function (options) {
        BaseElement.prototype.initialize.call(this, options);
        this.initControlElements(options);
    },
    initControlElements: function (options) {
        this.panel = options.panel;
        if ($('#copySlotPopup').css('display') != 'none')
            $('#copySlotPopup').hide();
        this.drawnElements = [];
        this.drawBaseGrid(options.is24HoursFormat, options.scaleInterval, options.yIndices, options.offset);
    },
    drawBaseGrid: function (is24HoursFormat, scaleInterval, yIndices, offset) {
        this.zoneGrid = new ZoneGrid({
            container: this.panel,
            yIndices: yIndices,
            offset: offset || 0,
            is24HoursFormat: is24HoursFormat || false,
            scaleInterval: scaleInterval,
            drawnElements: this.drawnElements
        });
    },
    getPointFromTime: function (hour, minute) {
        return this.zoneGrid.startPoint + (((hour || 0) * 60 + (minute || 0)) / 2);
    }
});

var ZoneGrid = BaseElement.inherits({
    initialize: function (options) {
        BaseElement.prototype.initialize.call(this, options);
        this.bindAll(this, 'initChange', 'processChange', 'completeChange');
        this.offset = options.offset;
        this.is24HoursFormat = options.is24HoursFormat;
        this.scaleInterval = options.scaleInterval;
        this.drawnElements = options.drawnElements;
        this.draw(options.yIndices);
        this.doWatch();
    },

    //TODO
    getMinutesFromPoint: function (point) {
        var minutesPerPixel = 2;
        var newPoint = point - this.startPoint;
        var totalMinutes = newPoint * minutesPerPixel;

        return totalMinutes;
    },
    getNewPointwithOffset: function (minutes) {
        var minutesPerPixel = 2;
        var remainder = minutes % this.offset;
        var newMinutes = minutes - remainder;

        var newPoint = (newMinutes / 2) + this.startPoint;
        return newPoint;
    },
    //end

    draw: function (yIndices) {
        this.shape = this.createEl('g');

        var plotGrp = this.plotArea = this.createEl('g', null, false, this.shape);
        var lenRequired = 0;
        for (var i in yIndices) {
            lenRequired = yIndices[i].length > lenRequired ? yIndices[i].length : lenRequired;
        }
        var xStartPoint = this.startPoint = (lenRequired * 7.5) + 15;
        var plotWidth = (24 * 60 / 2) - 0.5
        for (var i = 0; i < yIndices.length; i++) {
            var sliderGrp = this.createEl('g', { 'data-y-index': i }, false, plotGrp);
            this.createEl('rect', {
                x: xStartPoint, y: (i * 30) + 70,
                height: 30, width: plotWidth, 'data-slider': -1
            }, true, sliderGrp);
            this.createEl('line', {
                x1: xStartPoint, y1: (i * 30) + 85, x2: xStartPoint + plotWidth, y2: (i * 30) + 85, 'data-slider': -1
            }, false, sliderGrp);
            var yIndexNameHolder = this.createEl('text', {
                x: 0, y: (30 * (i + 1)) + 60
            }, false, sliderGrp);
            yIndexNameHolder.textContent = yIndices[i];
            this.drawnElements[i] = [];

            this.createEl('image', {"data-action":'delete',
                'xlink:href': 'content/images/icons/icon_delete.png', 'class':'icon_del', x: xStartPoint + plotWidth + 15, y: (i * 30) + 75, height:20, width:20
            }, false, sliderGrp);

        }


        var xGrp = this.createEl('g', { 'data-axis': 'x' }, false, this.shape);
        this.setXAxis(this.is24HoursFormat, this.scaleInterval);
        this.minPlotX = xStartPoint;
        this.maxPlotX = xStartPoint + plotWidth;
        var self = this;
        $(xGrp).bind('click', function () {
            self.trigger('axisClicked');
        });
    },
    setXAxis: function (is24HoursFormat, interval) {
        interval = (!interval || interval > 24 || interval < 2 || 24 % interval != 0) ? 4 : interval;
        var plotWidth = (24 * 60 / 2) - 0.5;
        var xGrp = $(this.shape).find('[data-axis="x"]').empty().get(0);
        var xGrpHolder = this.createEl('rect', {
            x: this.startPoint,
            y: 0,
            width: plotWidth,
            height: 55
        }, false, xGrp);
        var indexNameHolder = this.createEl('text', {
            x: this.startPoint - 52, y: 20
        }, false, xGrp);
        var path = [];
        var splitFactor = 3;
        var pathInterval = interval * splitFactor;
        path.push('M' + this.startPoint + ' 30l' + plotWidth + ' 0');
        for (var i = 0; i < (plotWidth / 10) + 1; i++) {
            var msPoint = (i % pathInterval == 0) ? 25 : (i % (pathInterval / 4) == 0 ? 18 : 10);
            path.push('M' + ((10 * i) + this.startPoint) + ' 30l0 ' + msPoint);
            if (i % pathInterval == 0) {
                var span = this.createEl('tspan', { x: (10 * i) + this.startPoint - 5 }, false, indexNameHolder);
                var time = null;
                var timeInterval = i / splitFactor;
                if (is24HoursFormat) {
                    time = timeInterval == 24 ? 23.59 : timeInterval;
                }
                else {
                    time = timeInterval % 12 == 0 ? 12 : timeInterval % 12;
                    time = time + ((timeInterval < 12) ? Resources.TimePicker_AM : Resources.TimePicker_PM);
                    if (timeInterval == 24) {
                        time = "11:59" + " " + Resources.TimePicker_PM;
                    }
                }
                span.textContent = time;
            }
        }
        this.createEl('path', { d: path.join('') }, true, xGrp);
        this.is24HoursFormat = is24HoursFormat;
        for (var y in this.drawnElements) {
            for (var s in this.drawnElements[y]) {
                this.drawnElements[y][s].is24HoursFormat = is24HoursFormat;
            }
        }
    },
    doWatch: function () {
        $(this.container).bind('touchstart mousedown', this.initChange);
    },
    initChange: function (e) {
        if (!e.which || e.which == 1) {
            e.preventDefault();
            this.trigger('commitEdit', this.currentSlider);
            if ($(e.target).data('edit') != null) {
                var dir = parseInt($(e.target).data('edit'));
                this.trigger('initEdit', this.currentSlider, this.currentSlider.getTimeByDirection(dir), dir);
                return;
            }
            else {
                this.trigger('beforeChange', this.currentSlider);
            }
            this.deSelectAllSliders();
            var currentSlider = null;
            var slider = $(e.target).closest('[data-slider]');
            if (slider.length > 0) {
                var sliderIndex = parseInt(slider.attr('data-slider'));
                var yIndex = slider.closest('[data-y-index]').data('yIndex');

                //TODO
                var totalMinutes;
                var newPoint;
                if (this.offset != 0) {
                    totalMinutes = this.getMinutesFromPoint(this.getCurrentPoint(e).x);
                    newPoint = this.getNewPointwithOffset(totalMinutes);
                }
                else {
                    newPoint = this.getCurrentPoint(e).x;
                }
                //end

                if (sliderIndex == -1) {
                    currentSlider = this.createSlider({
                        startPoint: newPoint,
                        yIndex: yIndex,
                        dontRender: true
                    });

                    var self = this;
                    currentSlider.on('sel', function (temp) {
                        self.trigger('sel', temp);
                    });
                }
                else if (sliderIndex >= 0) {
                    this.handle = $(e.target).data('handle');
                    currentSlider = this.drawnElements[yIndex][sliderIndex];
                }
            }
            else if($(e.target).data('action') == 'delete'){
                var yIndex = $(e.target).closest('[data-y-index]').data('yIndex');
                this.removeSliders(this.drawnElements[yIndex].slice(0));
            }
            if (currentSlider) {
                this.currentSlider = currentSlider;
                currentSlider.selected = true;
                this.range = this.getRange(currentSlider, yIndex);
                $(document).bind('touchmove mousemove', this.processChange);
                $(document).bind('touchend mouseup', this.completeChange);

            }
        }
    },
    processChange: function (e) {
        //TODO
        var totalMinutes;
        var newPoint;

        if (this.offset != 0) {
            totalMinutes = this.getMinutesFromPoint(this.getCurrentPoint(e).x);
            newPoint = this.getNewPointwithOffset(totalMinutes);
        }
        else {
            newPoint = this.getCurrentPoint(e).x;
        }
        //end

        var points = this.getValidPoints(newPoint);
        this.currentSlider.draw(points.startPoint, points.endPoint);
        this.currentSlider.isDirty = true;
    },
    completeChange: function (e) {
        this.unTrack();
        if (!this.currentSlider.completeDraw()) {
            this.removeSliders([this.currentSlider]);
            delete this.currentSlider;
        }
        else {
            var hasChange = this.addSliderToGrid(this.currentSlider);
            delete this.currentSlider.isDirty;
            if (hasChange) {
                this.trigger('changed', this.currentSlider);
            }
        }
        delete this.handle;
    },
    unTrack: function () {
        $(document).unbind('touchmove mousemove', this.processChange);
        $(document).unbind('touchend mouseup', this.completeChange);
    },
    getCurrentPoint: function (e) {
        var container = $(this.container);
        var svgOffset = container.offset();
        var p = this.container.createSVGPoint();
        p.x = (e.clientX || e.originalEvent.changedTouches[0].clientX);
        p.y = (e.clientY || e.originalEvent.changedTouches[0].clientY);
        var m = this.container.getScreenCTM();
        p = p.matrixTransform(m.inverse());
        return { x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 };
    },
    getValidPoints: function (point) {
        var startPoint = (point <= this.range.fixed) ? point : this.range.fixed;
        var endPoint = (point >= this.range.fixed) ? point : this.range.fixed;
        return {
            startPoint: startPoint < this.range.min ? this.range.min : startPoint,
            endPoint: endPoint > this.range.max ? this.range.max : endPoint
        }
    },
    getRange: function (slider, yIndex) {
        var sliders = this.drawnElements[yIndex];
        var fixedPoint = this.handle == 1 ? slider.endPoint : slider.startPoint;
        var range = { min: this.minPlotX, max: this.maxPlotX, fixed: fixedPoint };
        for (var i in sliders) {
            if (sliders[i] == slider)
                continue;
            var startPoint = sliders[i].startPoint;
            var endPoint = sliders[i].endPoint;
            range.min = (endPoint < range.fixed && endPoint > range.min) ? endPoint : range.min;
            range.max = (startPoint > range.fixed && startPoint < range.max) ? startPoint : range.max;
        }
        return range;
    },
    createSlider: function (options) {
        this.deSelectAllSliders();
        var slider = new ZoneSlider({
            container: $(this.container).find('[data-y-index="' + options.yIndex + '"]').get(0),
            startPoint: options.startPoint, endPoint: options.endPoint, offsetLeft: this.startPoint,
            yIndex: options.yIndex, sliderIndex: this.drawnElements[options.yIndex].length, is24HoursFormat: this.is24HoursFormat
        });
        if (!options.dontRender) {
            slider.render();
            this.addSliderToGrid(slider, options.noSelect || options.dontRender, options.noSelect);
        }
        return slider;
    },
    editSlider: function (slider, points) {
        points.sort(function (a, b) { return a - b });
        slider.draw(points[0], points[1]);
        this.addSliderToGrid(slider);
        this.trigger('changed', slider);
    },
    removeSelectedSliders: function () {
        var sliderIndex = parseInt($(this.shape).find("[data-selected]").attr("data-slider"));
        var yIndex = $(this.shape).find("[data-selected]").closest('[data-y-index]').data('yIndex');
        if (sliderIndex != NaN && sliderIndex != undefined && yIndex != NaN && yIndex != undefined) {
            var slider = this.drawnElements[yIndex][sliderIndex];
            if (slider) {
                this.removeSliders([slider]);
            }
        }
    },
    deSelectAllSliders: function () {
        for (var y in this.drawnElements) {
            for (var s in this.drawnElements[y]) {
                if (this.drawnElements[y][s].selected) {
                    this.drawnElements[y][s].selected = false;
                }
            }
        }
        delete this.currentSlider;
    },
    removeSliders: function (sliders) {
        var yIndices = [];
        for (var s in sliders) {
            var slider = sliders[s];
            yIndices.push(slider.yIndex);
            slider.remove();
            this.drawnElements[slider.yIndex].splice(slider.sliderIndex, 1);
            for (var i in this.drawnElements[slider.yIndex]) {
                this.drawnElements[slider.yIndex][i].sliderIndex = i;
            }
        }
        this.trigger('removed', yIndices);
    },
    clearSliders: function () {
        for (var el in this.drawnElements) {
            for (var sl in this.drawnElements[el]) {
                var slider = this.drawnElements[el][sl];
                slider.selected = false;
                slider.remove();
            }
            this.drawnElements[el].length = 0;
        }
        delete this.currentSlider;
    },
    addSliderToGrid: function (slider, deSelect) {
        slider.selected = !deSelect;
        this.drawnElements[slider.yIndex][slider.sliderIndex] = slider;
        var hasMerged = this.mergeSlots(slider);
        return slider.isDirty;
    },

    mergeSlots: function (slider) {
        var newStartPoint = slider.startPoint;
        var newEndPoint = slider.endPoint;
        var index = slider.yIndex;
        var sliderForRemoval = [];
        for (var i = 0; i < this.drawnElements[index].length; i++) {
            var configSlider = this.drawnElements[index][i];
            if (slider != configSlider) {
                if ((configSlider.startPoint <= newStartPoint && configSlider.endPoint >= newStartPoint)) {
                    newStartPoint = this.drawnElements[index][i].startPoint;
                    sliderForRemoval.push(configSlider);
                    continue;
                }
                if ((configSlider.startPoint <= newEndPoint && configSlider.endPoint >= newEndPoint)) {
                    if (slider != undefined)
                        slider.endPoint = this.drawnElements[index][i].endPoint;
                    newEndPoint = this.drawnElements[index][i].endPoint;
                    sliderForRemoval.push(configSlider);

                    continue;
                }
                if ((configSlider.startPoint <= newEndPoint && configSlider.endPoint >= newEndPoint)) {
                    if (slider != undefined)
                        slider.endPoint = this.drawnElements[index][i].endPoint;
                    newEndPoint = this.drawnElements[index][i].endPoint;
                    sliderForRemoval.push(configSlider);

                    continue;
                }
                if ((configSlider.startPoint >= newStartPoint && configSlider.endPoint <= newEndPoint)) {

                    sliderForRemoval.push(configSlider);

                    continue;
                }
            }
        }
        if (sliderForRemoval.length > 0) {
            this.removeSliders(sliderForRemoval);
            slider.startPoint = newStartPoint;
            slider.endPoint = newEndPoint;
            slider.draw(newStartPoint, newEndPoint);
            this.drawnElements[slider.yIndex][slider.sliderIndex] = slider
            return true;
        }
        return false;
    },

    /**
    * Copies Source slider to destination days 
    * @param {Number} option.sourceIndex 
    * @param {Number} option.targetIndices
    * @return {void}
    */
    copySlider: function (options) {
        var self = this;
        var sourceSlider = this.drawnElements[options.sourceIndex][options.sourceSliderIndex];
        var lastSlider = null;
        for (var index in options.targetIndices) {
            lastSlider = self.createSlider({
                startPoint: sourceSlider.startPoint,
                endPoint: sourceSlider.endPoint,
                yIndex: options.targetIndices[index]
            });
        }
        this.currentSlider = lastSlider || this.currentSlider;
        this.trigger('copied', options.targetIndices);
    },

    /**
    * Get distinct Sliders count
    * @return {Number} count
    */
    getDistinctSliderCount: function () {
        var $newArray;

        /*Converting 2D array to 1D array*/
        $newArray = $.map(this.drawnElements, function (n) {
            return n;
        });

        /*Remove duplicate sliders from array*/
        for (var i = 0; i < $newArray.length; i++) {
            for (var j = i + 1; j < $newArray.length;) {
                if ($newArray[i].startPoint == $newArray[j].startPoint && $newArray[i].endPoint == $newArray[j].endPoint) {
                    $newArray.splice(j, 1);
                }
                else
                    j++;
            }
        }

        /*Return distinct sliders count*/
        return $newArray.length;
    },
});

var ZoneSlider = BaseElement.inherits({
    initialize: function (options) {
        BaseElement.prototype.initialize.call(this, options);
        this.offsetLeft = options.offsetLeft;
        this.startPoint = options.startPoint;
        this.endPoint = options.endPoint || options.startPoint;
        this.yIndex = options.yIndex;
        this._is24HoursFormat = options.is24HoursFormat;
        this.shape = this.createEl('g', { 'data-slider': options.sliderIndex });
        this.frame = this.createEl('rect', { 'class': 'tz-frame' }, false, this.shape);
        this.lHandle = this.createEl('rect', { 'class': 'tz-handle', 'data-handle': 1 }, false, this.shape);
        this.rHandle = this.createEl('rect', { 'class': 'tz-handle', 'data-handle': 0 }, false, this.shape);
        this.lflag = this.createFlag(this.startPoint, 1);
        this.rflag = this.createFlag(this.endPoint, 0);
        this.lText = this.createEl('text', { 'data-edit': 1, x: -50, y: (this.yIndex * 30) + 73 }, false, this.lflag);
        this.rText = this.createEl('text', { 'data-edit': 0, x: 6, y: (this.yIndex * 30) + 73 }, false, this.rflag);
        ZoneSlider.times = [];
        this.updateDisplayTime();
    },
    draw: function (startPoint, endPoint) {
        var y = (this.yIndex * 30) + 81;
        var height = 8;
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.setAttributes(this.frame, {
            x: startPoint, y: y, width: endPoint - startPoint, height: height
        });
        this.setAttributes(this.lHandle, { x: startPoint, y: y, width: 1, height: height });
        this.setAttributes(this.rHandle, { x: endPoint, y: y, width: 1, height: height });
        this.setAttributes(this.lflag, { transform: 'translate(' + startPoint + ')' });
        this.setAttributes(this.rflag, { transform: 'translate(' + endPoint + ')' });
        this.updateDisplayTime();
    },
    render: function () {
        this.draw(this.startPoint, this.endPoint);
    },
    completeDraw: function () {
        return this.endPoint && (this.startPoint != this.endPoint);
    },
    getTimeFromPoint: function (point) {
        var actualPoint = point - this.offsetLeft;
        var totalMinutes = actualPoint * 2;
        return {
            hours: Math.floor(totalMinutes / 60),
            minutes: Math.floor(totalMinutes % 60)
        };
    },
    updateDisplayTime: function () {
        this.lText.textContent = this.formatTime(this.startTime);
        this.rText.textContent = this.formatTime(this.endTime);
        ZoneSlider.times.push(this.startPoint + ' || ' + this.endPoint);
    },
    formatTime: function (time) {
        var hours = time.hours.toString();
        var minutes = time.minutes.toString();
        while (hours.length < 2)
            hours = '0' + hours;
        while (minutes.length < 2)
            minutes = '0' + minutes;
        return hours + ':' + minutes + ' ' + time.meridiem;
    },
    resolveTimeFormat: function (hours, minutes, meridiemRequired) {
        var meridiem = '';
        if (this.is24HoursFormat && !meridiemRequired) {
            hours = hours == 24 ? 0 : hours;
        }
        else {
            meridiem = (hours < 12 || hours == 24) ? Resources.TimePicker_AM : Resources.TimePicker_PM;
            hours = hours % 12 == 0 ? 12 : hours % 12;
        }
        return {
            hours: hours,
            minutes: minutes,
            meridiem: meridiem
        }
    },
    convertTo24HoursFormat: function (hours, minutes, meridiem) {
        if (meridiem) {
            hours = meridiem == 'PM' ? hours + 12 : (hours == 12) ? 0 : hours;
            hours = hours == 24 ? 0 : hours;
        }
        return {
            hours: hours,
            minutes: minutes
        }
    },
    createFlag: function (point, handle) {
        if (handle == 1) {
            var flag = this.createEl('g', { display: 'none', 'class': 'tz-flag', transform: 'translate(' + point + ')' }, false, this.shape);
            this.createEl('line', {
                x1: 0, x2: 0, y1: (this.yIndex * 30) + 68, y2: (this.yIndex * 30) + 89, 'data-handle': handle
            }, true, flag);
            this.createEl('rect', {
                x: -52,
                y: (this.yIndex * 30) + 61, width: 55, height: 16, 'class': 'tz-flag-strip', 'data-edit': handle
            }, true, flag);
            this.createEl('rect', {
                x: -2,
                y: (this.yIndex * 30) + 63, width: 5, height: 12, 'class': 'tz-flag-handle', 'data-handle': handle
            }, true, flag);
            return flag;
        }
        else {
            var flag = this.createEl('g', { display: 'none', 'class': 'tz-flag', transform: 'translate(' + point + ')' }, false, this.shape);
            this.createEl('line', {
                x1: 0, x2: 0, y1: (this.yIndex * 30) + 68, y2: (this.yIndex * 30) + 89, 'data-handle': handle
            }, true, flag);
            this.createEl('rect', {
                x: -3,
                y: (this.yIndex * 30) + 61, width: 55, height: 16, 'class': 'tz-flag-strip', 'data-edit': handle
            }, true, flag);
            this.createEl('rect', {
                x: -2,
                y: (this.yIndex * 30) + 63, width: 5, height: 12, 'class': 'tz-flag-handle', 'data-handle': handle
            }, true, flag);
            return flag;
        }
    },
    getFlagDimension: function (dir) {
        var flag = dir ? this.lflag : this.rflag;
        var fBox = $(flag).find('.tz-flag-strip').get(0).getBoundingClientRect();
        var hBox = $(flag).find('.tz-flag-handle').get(0).getBoundingClientRect();
        return { left: fBox.left + 1, top: fBox.top, height: fBox.height, width: fBox.width };
    },
    getBarDimension: function () {
        return this.frame.getBoundingClientRect();
    },
    getTimeByDirection: function (direction) {
        return direction == 1 ? this.startTime : this.endTime;
    },
    sliderIndex: {
        get: function () {
            return parseInt(this.shape.getAttribute('data-slider'));
        },
        set: function (val) {
            this.shape.setAttribute('data-slider', val);
        }
    },
    selected: {
        get: function () {
            return !!this.shape.getAttribute('data-selected');
        },
        set: function (val) {
            var prevVal = this.selected;
            if (prevVal != !!val) {
                if (val) {
                    this.shape.setAttribute('data-selected', val);
                }
                else {
                    this.shape.removeAttribute('data-selected');
                }
                this.setAttributes(this.lflag, { display: val ? 'block' : 'none' });
                this.setAttributes(this.rflag, { display: val ? 'block' : 'none' });
                this.trigger('sel', this);
            }
        }
    },
    startTime: {
        get: function () {
            var _startTime = this.getTimeFromPoint(this.startPoint || 0);
            return this.resolveTimeFormat(_startTime.hours, _startTime.minutes);
        }
    },
    endTime: {
        get: function () {
            var _endTime = this.getTimeFromPoint(this.endPoint || 0);
            return this.resolveTimeFormat(_endTime.hours, _endTime.minutes);
        }
    },
    timeRange: {
        get: function () {
            return {
                start: this.getTimeFromPoint(this.startPoint || 0),
                end: this.getTimeFromPoint(this.endPoint || 0)
            }
        }
    },
    is24HoursFormat: {
        get: function () {
            return this._is24HoursFormat;
        },
        set: function (val) {
            if (!!val != !!this._is24HoursFormat) {
                this._is24HoursFormat = !!val;
                this.updateDisplayTime();
            }
        }
    }
});

function clearTimeZoneControl(tz) {
    $('.time-input').data('timeInputBox', null);
    $('#manageTimeSchedule').off('mousedown');
    $('#copySlotPopup li').off();
    tz.zoneGrid.off();
}

function ShowTimeZoneControl(tz) {

    clearTimeZoneControl(tz);

    var timeInput = $('.time-input').timeInputBox({
        is24HoursFormat: tz.zoneGrid.is24HoursFormat
    }).data('timeInputBox');
    var copySlotPopup = $('#copySlotPopup');
    var copySlotPopupItems = copySlotPopup.find('input[type="checkbox"]');

    tz.zoneGrid.on('axisClicked', function () {
        var format = !tz.zoneGrid.is24HoursFormat;
        tz.zoneGrid.setXAxis(format);
        timeInput.setOptions({ is24HoursFormat: format });
    });

    $('#manageTimeSchedule').unbind('mousedown');
    $('#manageTimeSchedule').bind('mousedown', function (e) {
        if ($(e.target).closest('svg').get(0) != tz.panel) {
            if (!$(e.target).hasClass('time-input') && $(e.target).closest('.time-input').length == 0) {
                tz.zoneGrid.trigger('commitEdit', tz.zoneGrid.currentSlider);
            }
            if (!$(e.target).hasClass('callout') && $(e.target).closest('.callout').length == 0) {
                tz.zoneGrid.trigger('beforeChange', tz.zoneGrid.currentSlider);
            }
        }
    });

    tz.zoneGrid.on('initEdit', function (slider, time, dir) {
        if (slider) {
            timeInput.show(time.hours, time.minutes, time.meridiem, slider.getFlagDimension(dir), { direction: dir });
        }
    });

    tz.zoneGrid.on('commitEdit', function (slider) {
        if (slider && timeInput.container.is(':visible')) {
            var time = timeInput.getTime();
            if (time.isValid) {
                time = slider.convertTo24HoursFormat(time.hours, time.minutes, time.meridiem);
                var points = [];
                if (timeInput.direction == 1) {
                    points.push(tz.getPointFromTime(time.hours, time.minutes));
                    points.push(slider.endPoint);
                }
                else {
                    points.push(slider.startPoint);
                    points.push(tz.getPointFromTime(time.hours, time.minutes));
                }
                tz.zoneGrid.editSlider(slider, points);
            }
        }
        timeInput.container.hide();
    });

    tz.zoneGrid.on('changed', function (slider) {
        if (slider.yIndex < 7) {
            var bbox = slider.getBarDimension();
            copySlotPopup.show();
            copySlotPopup.offset({
                top: bbox.top - copySlotPopup.height() - 15,
                left: bbox.left + (bbox.width / 2) - (copySlotPopup.width() / 2)
            });
        }
    });

    tz.zoneGrid.on('beforeChange', function (slider) {
        if (slider && copySlotPopup.is(':visible')) {
            tz.zoneGrid.copySlider({
                sourceIndex: slider.yIndex,
                sourceSliderIndex: slider.sliderIndex,
                targetIndices: copySlotPopup.find('input:checked').map(function () {
                    return $(this).closest('li').data('index');
                }).toArray()
            });
        }
        copySlotPopupItems.prop('checked', false);
        copySlotPopup.hide();
    });
}

ko.bindingHandlers.timeSlotChart = {
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        $(element).empty();
        $(element).unbind();
        valueAccessor().destroy();
        var bindingValues = allBindings();
        var timeSlots = ko.utils.unwrapObservable(valueAccessor());
        var tz = new TimeZone({
            panel: element,
            yIndices: _.map(bindingValues.slotDays(), function (d) { return d.Text; }),
            offset: bindingValues.snapTime() || 0
        });
        ShowTimeZoneControl(tz);
        var getDate = function (val) {
            return typeof val === 'string' ? new Date(val.match(/\d+/)[0] * 1) : val;
        }
        var renderSlots = function (slots) {
            tz.zoneGrid.clearSliders();
            for (var s in slots) {
                var slot = slots[s];
                var startTime = getDate(slot.StartTime);
                var endTime = getDate(slot.EndTime);
                var day = _.find(bindingValues.slotDays(), function (d) {
                    return slot.Days > 0 ? d.Value == slot.Days : d.Type == slot.HolidayType;
                });
                tz.zoneGrid.createSlider({
                    startPoint: tz.getPointFromTime(startTime.getUTCHours(), startTime.getUTCMinutes()),
                    endPoint: tz.getPointFromTime(endTime.getUTCHours(), endTime.getUTCMinutes()),
                    yIndex: bindingValues.slotDays().indexOf(day),
                    noSelect: true
                });
            }
        };
        renderSlots(timeSlots);
        var updateSource = function (yIndices) {
            for (var i in yIndices) {
                var yIndex = yIndices[i];
                var day = bindingValues.slotDays()[yIndex];
                for (var s = 0; s < timeSlots.length; s++) {
                    if ((day.Type && timeSlots[s].HolidayType == day.Type) || (!day.Type && timeSlots[s].Days == day.Value)) {
                        timeSlots.splice(s, 1);
                        //re-initialize the counter so that loop runs again for all the elements in modified array timeSlots
                        s = -1;
                    }
                }
                for (var s in tz.drawnElements[yIndex]) {
                    var slot = tz.drawnElements[yIndex][s];
                    var timeRange = slot.timeRange;
                    var slotModel = {
                        StartTime: new Date(Date.UTC(1970, 0, 0, timeRange.start.hours, timeRange.start.minutes)),//new Date(0, 0, 0, timeRange.start.hours, timeRange.start.minutes),
                        EndTime: new Date(Date.UTC(1970, 0, 0, timeRange.end.hours, timeRange.end.minutes))//new Date(0, 0, 0, timeRange.end.hours, timeRange.end.minutes)
                    };
                    if (day.Type) {
                        slotModel.HolidayType = day.Type
                    }
                    else {
                        slotModel.Days = day.Value
                    }
                    timeSlots.push(slotModel);
                }
            }
        };
        tz.zoneGrid.on('changed', function (slider) {
            updateSource([slider.yIndex]);
        });
        tz.zoneGrid.on('copied removed', function (indices) {
            if (indices && indices.length > 0) {
                updateSource(indices);
            }
        });
    }
};