define('app', ['jquery', 'underscore', 'toastr', 'ko', 'header', 'config', 'event'], function ($, _, toastr, ko, header, config, event) {

    var logout = function () {
    };

    return {
        signout: logout
    };
});
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
function alert(message) {
    console.info(message);
    if (message.search('Invalid reload parameter') > 0);
    window.location.href = window.location.href;
}

$(document).ajaxError(function (event, request, settings, thrownError) {
    handleAjaxError(request, request.textstatus, thrownError);
    console.log("Error requesting page " + settings.url + "" + request.responseText);
    $.unblockUI();
});
$.ajaxSetup({
    error: function (jqxhr, textstatus, errorthrown) {
        handleAjaxError(jqxhr, textstatus, errorthrown);
        $.unblockUI();
    }
});
; (function (global) {
    global.handleAjaxError = function (jqXHR, textStatus, errorThrown) {
        if (jqXHR.state() == 'rejected' && (jqXHR.status == 200 || jqXHR.status == 500) && textStatus == "parsererror") {
            console.log('Error! Sorry! Internal Server Error!\nParse Error!');
        }
        if ((jqXHR.state() == 'rejected' && jqXHR.status == 404) || jqXHR.statusText == "Not Found") {
            console.log('Error! Sorry! Ajax page Not Found!');
        }
        else if (jqXHR.state() == 'rejected' && jqXHR.status == 0 && textStatus == "timeout") {
            console.log('Error! Sorry! Request timeout!');
        }
        else if (jqXHR.state() == 'rejected' && jqXHR.status == 0 && textStatus == "abort") {
            console.log('Error! ajax aborted manual before send');
        }
        else if (jqXHR.state() == 'rejected' && jqXHR.status == 0 && textStatus == "error") {
            console.log('Error! ajax canceled before send, e.g. when fast redirect');
        }
        else {
            console.log('Error! Something error!');
        }
        window.location.href = window.location.href;;
    }
    global.addWatch = function () {
        ko.extenders.watch = function (target, model) {
            if (model.watchItems == undefined)
                model.watchItems = ko.observableArray([]);
            if (model.hasChanges == undefined)
                model.hasChanges = ko.observable(false);
            target.isDirty = ko.observable(false);
            target.originalValue = target();
            model.watchItems.push(target)
            target.subscribe(function (newValue) {
                target.isDirty(newValue != target.originalValue)
                var dirtyItems = [];
                ko.utils.arrayForEach(model.watchItems(), function (item) {
                    if (item.isDirty())
                        dirtyItems.push(item);
                })
                model.hasChanges(dirtyItems.length > 0);
            });
            model.resetwatch = function () {
                ko.utils.arrayForEach(model.watchItems(), function (item) {
                    item.originalValue = item();
                    item.isDirty(false);
                });
                model.hasChanges(false);
            }
            return target;
        };
    }
    global.addFileBinding = function () {
        ko.bindingHandlers.file = {
            init: function (element, valueAccessor) {
                $(element).change(function () {
                    var file = this.files[0];
                    if (ko.isObservable(valueAccessor())) {
                        valueAccessor()(file);
                    }
                });
            },

            update: function (element, valueAccessor, allBindingsAccessor) {
                var file = ko.utils.unwrapObservable(valueAccessor());
                var bindings = allBindingsAccessor();
                if (bindings.imageBase64 && ko.isObservable(bindings.imageBase64)) {
                    if (!file) {
                        bindings.imageBase64(null);
                        bindings.imageType(null);
                        //reset the value so that if we 'remove' the file and upload the same file,onchange event will be triggered
                        element.value = null;
                    } else {
                        var ext = file.type.split('/')[1];
                        if (ext == "png" || ext == "jpeg" || ext == "jpg" || ext == "gif")
                        { }
                        else
                        {
                            alertify.alert(Resources.PhotoType_error);
                            return;
                        }
                        if (file.size > 5242880) {
                            alertify.alert(Resources.PhotoSize_error);
                            return;
                        }
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            var result = e.target.result || {};
                            var resultParts = result.split(",");
                            if (resultParts.length === 2) {
                                bindings.imageBase64(resultParts[1]);
                                bindings.imageType(resultParts[0]);
                            }

                        };
                        reader.readAsDataURL(file);
                    }
                }
            }
        };
    }
    global.getloadingOptions = function (message) {
        return {
            css: {
                border: 'none',
                padding: '12px',
                backgroundColor: 'rgba(8, 137, 196, 0.60)',
                '-webkit-border-radius': '4px',
                '-moz-border-radius': '4px',
                opacity: .8,
                color: '#fff',
                zIndex: 1150
            },
            overlayCSS: {
                backgroundColor: "rgba(250, 250, 250, 0.66)",
                zIndex: 1100
            },
            message: message
        }
    }
    global.blockUI = function () {
        $.blockUI(getloadingOptions(Resources.Please_Wait));
    }
    global.unblockUI = function () {
        $.unblockUI();
    }
    global.getChanllange = function (url) {
        console.log("CSRF::GetChallange:" + url);
        var url = url;
        var retval = '';
        jQuery.ajax({
            url: $('#getpage').data('challenge') + '?url=' + url,
            success: function (html) {
                $('#challange').html(html);
                // window.challanges = window.challanges || {};
                //retval = window.challanges[url] = $(html).val();
                retval = $(html).val();
            },
            async: false
        });
        return retval;
    }
    global.googleAutocomplete = function (parent, elid, cb) {
        googleMaps().init(function () {
            var el = $('#' + parent).find('#' + elid)[0]
            var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(0, 0), new google.maps.LatLng(0, 0));
            var options = { radius: 2000000000, types: ['(cities)'], bounds: defaultBounds };
            var autocomplete = new google.maps.places.Autocomplete(el, options);
            google.maps.event.addListener(autocomplete, 'place_changed', function () {
                var place = autocomplete.getPlace();
                var i = place.address_components.length;
                var data = {};
                for (var i = 0; i < place.address_components.length ; i++) {
                    if (place.address_components[i] && place.address_components[i].types) {
                        switch (place.address_components[i].types[0]) {
                            case "locality":
                            case "administrative_area_level_3":
                                data.City = place.address_components[i].long_name;
                                google.maps.event.addDomListener(el, 'keydown', function (e) {
                                    if (e.keyCode == 13 || e.keyCode == 9) {
                                        $('#' + parent).find('#' + elid).val(data.City);
                                        $('.pac-container').css('display', 'none');
                                    }
                                });
                                google.maps.event.addDomListener(el, 'input', function (e) {
                                    data.City = this.value;
                                });
                                google.maps.event.addDomListener(el, 'blur', function () {
                                    $('#' + parent).find('#' + elid).val(data.City);
                                    $('.pac-container').css('display', 'none');
                                });
                                break;
                            case "administrative_area_level_1":
                                data.Region = place.address_components[i].long_name;
                                break;
                            case "country":
                                data.Country = place.address_components[i].long_name;
                                break;
                            default:
                                break;
                        }
                    }
                }
                if (cb) {
                    if (cb.City) {
                        cb.City(data.City);
                        cb.Region(data.Region);
                        cb.Country(data.Country);
                        cb.onAutoComplete(data, $('#' + parent).find('#' + elid));
                    }
                    else
                        cb(data, $('#' + parent).find('#' + elid));
                }
            });
            $('#' + parent).find('#' + elid).removeAttr('placeholder');
        });
    }
    global.checkTimeout = function (data) {
        var thereIsStillTime = true;

        if (data) {
            if (data.responseText) {
                if ((data.responseText.indexOf("<title>Maxpro Cloud: Sign in </title>") > -1) || (data.responseText.indexOf("<title>Object moved</title>") > -1) || (data.responseText === '_Logon_')) thereIsStillTime = false;
            } else {
                if (data == "_Logon_") thereIsStillTime = false;
            }

            if (!thereIsStillTime) {
                window.location.href = window.location.href + "/Shell/TimeoutRedirect";
            }
        } else {

            var options = {
                dataType: "json",
                contentType: "application/json",
                cache: false,
                type: 'POST',
                async: true,
                complete: function (result) {
                    thereIsStillTime = checkTimeout(result);
                }
            };
            var antiForgeryToken = getChanllange("/Page/CheckTimeout");
            if (antiForgeryToken) {
                options.headers = {
                    'RequestVerificationToken': antiForgeryToken
                }
            }
            console.log("CSRF::request:/Page/CheckTimeout");
            $.ajax(window.location.href + "/Page/CheckTimeout", options);
        }

        return thereIsStillTime;
    }
    global.ajaxRequest = function (method, url, data, dataType) {

        data = data || {};
        data.toJson = data.toJson || function () { return ko.toJSON(data); }
        var options = {
            dataType: dataType || "json",
            contentType: "application/json",
            cache: false,
            type: method,
            async: true,
            data: data ? data.toJson ? data.toJson() : data : null,
            success: function (result) {
                if (checkTimeout(result)) {
                    // There was no timeout, so continue processing...
                }
            },
            error: function (result) {
                if (checkTimeout(result)) {
                    // There was no timeout, so continue processing...
                }
            }
        };
        var antiForgeryToken = getChanllange(url);
        if (antiForgeryToken) {
            options.headers = {
                'RequestVerificationToken': antiForgeryToken
            }
        }
        console.log("CSRF::request:" + url);
        var request = $.ajax(url, options);
        // callback handler that will be called on failure
        request.fail(function (jqXHR, textStatus, errorThrown) {
            if ((jqXHR.responseText.indexOf('loginform') > 0))
                window.location.href = window.location.href;
            // log the error to the console
            console.error(
                "The following error occured: " + textStatus, errorThrown
            );
            $.unblockUI();
        });
        return request;

    }

    global.ajaxPost = function (url, data, dataType) {
        var options = {
            type: "POST",
            success: function (result) {
                if (checkTimeout(result)) {
                    // There was no timeout, so continue processing...
                }
            },
            error: function (result) {
                if (checkTimeout(result)) {
                    // There was no timeout, so continue processing...
                }
            }
        };
        var request = $.ajax(url, options);
        // callback handler that will be called on failure
        request.fail(function (jqXHR, textStatus, errorThrown) {
            if ((jqXHR.responseText.indexOf('loginform') > 0))
                window.location.href = window.location.href;
            // log the error to the console
            console.error(
                "The following error occured: " + textStatus, errorThrown
            );
            $.unblockUI();
        });
        return request;

    }
    global.ajaxfilePost = function (url, data) {

        var options = {
            data: data,
            dataType: 'json',
            processData: false,
            contentType: false,
            type: 'POST',
            success: function (result) {
                if (checkTimeout(result)) {
                    if (!result.Success)
                        alertify.error(Resources.Imgae_upload_server_error);
                }
            },
            error: function (result) {
                alertify.error(Resources.Imgae_upload_server_error);
            }
        };
        var antiForgeryToken = getChanllange(url);
        if (antiForgeryToken) {
            options.headers = {
                'RequestVerificationToken': antiForgeryToken
            }
        }
        console.log("CSRF::request:" + url);
        var request = $.ajax(url, options);
        // callback handler that will be called on failure
        request.fail(function (jqXHR, textStatus, errorThrown) {
            // log the error to the console
            console.error(
                "The following error occured: " + textStatus, errorThrown
            );
            $.unblockUI();
        });
        return request;

    }
    global.getGoogleurl = function (type, param, token) {
        var data = { type: type, param: param };
        data = ko.toJSON(data);
        var options = {
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            cache: false,
            async: true,
            data: data
        };
        var antiForgeryToken = token ? token : $("#antiForgeryToken").val();
        if (antiForgeryToken) {
            options.headers = {
                'RequestVerificationToken': antiForgeryToken
            }
        }
        var url = $('#geocoderurl').val();
        console.log("CSRF::request:" + url);
        var request = $.ajax(url, options);
        // callback handler that will be called on failure
        request.fail(function (jqXHR, textStatus, errorThrown) {
            if ((jqXHR.responseText.indexOf('loginform') > 0))
                window.location.href = window.location.href;
            // log the error to the console
            console.error(
                "The following error occured: " + textStatus, errorThrown
            );
        });
        return request;

    }
    global.checkCaptcha = function (e) {
        return grecaptcha.getResponse(e);
    }
    global.RenderCaptcha = function () {
        // if (global.grecaptcha==undefined)
        global.captchaSupported = true;
        $('.g-recaptcha').each(function (index, item) {
            global[item.id] = grecaptcha.render(item.id, {
                'sitekey': $(item).data('sitekey'),
                'theme': 'light',
            });
        });
    }
    var mapUtil = {
        style1: [{ "featureType": "water", "stylers": [{ "visibility": "on" }, { "color": "#acbcc9" }] }, { "featureType": "landscape", "stylers": [{ "color": "#f2e5d4" }] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#c5c6c6" }] }, { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#e4d7c6" }] }, { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#fbfaf7" }] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#c5dac6" }] }, { "featureType": "administrative", "stylers": [{ "visibility": "on" }, { "lightness": 33 }] }, { "featureType": "road" }, { "featureType": "poi.park", "elementType": "labels", "stylers": [{ "visibility": "on" }, { "lightness": 20 }] }, {}, { "featureType": "road", "stylers": [{ "lightness": 20 }] }],
        style2: [{ featureType: 'water', elementType: 'all', stylers: [{ hue: '#71d6ff' }, { saturation: 100 }, { lightness: -5 }, { visibility: 'on' }] }, { featureType: 'poi', elementType: 'all', stylers: [{ hue: '#ffffff' }, { saturation: -100 }, { lightness: 100 }, { visibility: 'off' }] }, { featureType: 'transit', elementType: 'all', stylers: [{ hue: '#ffffff' }, { saturation: 0 }, { lightness: 100 }, { visibility: 'off' }] }, { featureType: 'road.highway', elementType: 'geometry', stylers: [{ hue: '#deecec' }, { saturation: -73 }, { lightness: 72 }, { visibility: 'on' }] }, { featureType: 'road.highway', elementType: 'labels', stylers: [{ hue: '#bababa' }, { saturation: -100 }, { lightness: 25 }, { visibility: 'on' }] }, { featureType: 'landscape', elementType: 'geometry', stylers: [{ hue: '#e3e3e3' }, { saturation: -100 }, { lightness: 0 }, { visibility: 'on' }] }, { featureType: 'road', elementType: 'geometry', stylers: [{ hue: '#ffffff' }, { saturation: -100 }, { lightness: 100 }, { visibility: 'simplified' }] }, { featureType: 'administrative', elementType: 'labels', stylers: [{ hue: '#59cfff' }, { saturation: 100 }, { lightness: 34 }, { visibility: 'on' }] }]
    }
    var loadAPIPromise;
    var loadAPIShared = function loadAPI(callback) {
        //if (!loadAPIPromise)
        {
            var deferred = $.Deferred();
            //  console.log('send request to get google maps api');
            $.ajax({
                url: 'https://www.google.com/jsapi/',
                dataType: "script",
                success: function () {
                    google.load('maps', '3', {
                        callback: function () {
                            deferred.resolve();
                        },
                        other_params: 'sensor=false&libraries=places&language=' + $.cookie("_culture")
                    });
                }
            });
            loadAPIPromise = deferred.promise();
        }
        loadAPIPromise.done(callback);
    };
    var googleMaps = function () {
        var $el,
            apiLoaded = false;
        function init(store, el) {
            $el = $(el);
            console.log('init map for', $el.attr('id'));
            loadAPIShared(function () {
                var map = null;
                if (el)
                    map = ready();
                //google.maps.event.trigger(map, 'resize');
                if (store)
                    store(map);
            });
        };
        function ZoomControl(controlDiv, map) {
            // Creating divs & styles for custom zoom control
            controlDiv.style.padding = '24px';

            // Set CSS for the control wrapper
            var controlWrapper = document.createElement('div');
            controlWrapper.style.backgroundColor = 'white';
            controlWrapper.style.borderStyle = 'solid';
            controlWrapper.style.borderColor = '#707070';
            controlWrapper.style.borderWidth = '1px';
            controlWrapper.style.cursor = 'pointer';
            controlWrapper.style.textAlign = 'center';
            controlWrapper.style.width = '24px';
            controlWrapper.style.height = '48px';
            controlWrapper.style.bottom = '24px';
            controlWrapper.style.position = 'fixed';

            controlDiv.appendChild(controlWrapper);

            // Set CSS for the zoomIn
            var zoomInButton = document.createElement('div');
            zoomInButton.style.width = '24px';
            zoomInButton.style.height = '24px';
            zoomInButton.style.backgroundPosition = '-428px -456px';
            zoomInButton.style.borderBottom = 'solid';
            zoomInButton.style.borderColor = '#707070';
            zoomInButton.style.borderWidth = '1px';
            /* Change this to be the .png image you want to use */
            var spriteURL = window.location.href + '/Content/images/sprite_icons.png';
            zoomInButton.style.backgroundImage = 'url(' + spriteURL + ')';
            controlWrapper.appendChild(zoomInButton);

            // Set CSS for the zoomOut
            var zoomOutButton = document.createElement('div');
            zoomOutButton.style.width = '24px';
            zoomOutButton.style.height = '24px';
            zoomOutButton.style.backgroundPosition = '-428px -489px';
            /* Change this to be the .png image you want to use */
            var spriteURL = window.location.href + '/Content/images/sprite_icons.png';
            console.log(spriteURL);
            zoomOutButton.style.backgroundImage = 'url(' + spriteURL + ')';
            controlWrapper.appendChild(zoomOutButton);

            // Setup the click event listener - zoomIn
            google.maps.event.addDomListener(zoomInButton, 'click', function (e) {
                map.setZoom(map.getZoom() + 1);
            });

            // Setup the click event listener - zoomOut
            google.maps.event.addDomListener(zoomOutButton, 'click', function (e) {
                map.setZoom(map.getZoom() - 1);
            });

        }
        function ready() {
            if ($el.attr('id') === undefined) return null;
            console.log('data ready for', $el.attr('id'));

            // Basic settings
            var mapOptions = {
                zoom: 1,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                streetViewControl: false,
                styles: mapUtil.style1,
                zoomControl: false,
                panControl: false,
                scaleControl: false,
                mapTypeControl: false,
                center: new google.maps.LatLng(0, 0),
                minZoom: 2,
                maxZoom: 17,
                draggable: false
            };
            if ($el.attr('id') == 'map-canvas') {
                mapOptions.zoomControl = false;
                mapOptions.zoomControlOptions = {
                    style: google.maps.ZoomControlStyle.SMALL,
                    position: google.maps.ControlPosition.LEFT_BOTTOM
                };
            }

            var map = new google.maps.Map($el[0], mapOptions);
            map.element = $el[0];
            if ($el.attr('id') == 'map-canvas') {
                var zoomControlDiv = document.createElement('div');
                var zoomControl = new ZoomControl(zoomControlDiv, map);
                zoomControlDiv.index = 1;
                map.controls[google.maps.ControlPosition.TOP_LEFT].push(zoomControlDiv);
            }
            google.maps.event.addListenerOnce(map, 'idle', find_closest_marker);
            google.maps.event.addListener(map, 'click', find_closest_marker);
            google.maps.event.addListener(map, 'center_changed', function () { checkBounds(map); });
            google.maps.event.addListener(map, 'dragend',setcenter);
            google.maps.event.addListener(map, 'zoom_changed', onZoomChanged);
            map.allowedBounds = map.getBounds();

            return map;
        }
        function onZoomChanged() {
            if (this.getZoom() > 2) {
                this.setOptions({ draggable: true });
            }
            else {
                this.setOptions({ draggable: false });
            }
            find_closest_marker(null, this);
        }
        function setcenter(map) {
            if (9 > this.getZoom()) {
                this.setCenter(new google.maps.LatLng(0, 0));
                find_closest_marker(null,this);
            }
        }
        function rad(x) { return x * Math.PI / 180; }
        function find_closest_marker(event, map) {
            $('#mapheadr').find('div.dropdown').removeClass('open');
            var map = (this && this.Name != undefined) ? this : map;
            try {

                if (event) {
                    var lat = event.latLng.lat();
                    var lng = event.latLng.lng();
                }
                else {
                    var lat = map.getCenter().lat();
                    var lng = map.getCenter().lng();
                }
                var R = 6371; // radius of earth in km
                var distances = [];
                var closest = -1;
                if (map.markers) {
                    var visiblemarkers = $.map(map.markers, function (val, key) {
                        if (val.marker.getMap()) return val;
                    });
                    if (visiblemarkers.length > 0) {
                        for (i = visiblemarkers.length - 1; i >= 0; i--) {
                            if (visiblemarkers[i].marker.getMap()) {
                                var mlat = visiblemarkers[i].marker.position.lat();
                                var mlng = visiblemarkers[i].marker.position.lng();
                                var dLat = rad(mlat - lat);
                                var dLong = rad(mlng - lng);
                                var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                    Math.cos(rad(lat)) * Math.cos(rad(lat)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
                                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                                var d = R * c;
                                distances[i] = d;
                                if (closest == -1 || d < distances[closest]) {
                                    closest = i;
                                }
                            }
                        }
                        map.setCenter(visiblemarkers[closest].marker.getPosition());
                    }
                }
            } catch (e) {
                console.log(e.message);
            }
        }

        function checkBounds(map) {
            try {
                if (!map.allowedBounds) {
                    map.allowedBounds = map.getBounds();
                }
                var allowedBounds = map.allowedBounds;
               
                if (!allowedBounds.contains(map.getCenter())) {
                    var C = map.getCenter();
                    var X = C.lng();
                    var Y = C.lat();

                    var AmaxX = allowedBounds.getNorthEast().lng();
                    var AmaxY = allowedBounds.getNorthEast().lat();
                    var AminX = allowedBounds.getSouthWest().lng();
                    var AminY = allowedBounds.getSouthWest().lat();

                    if (X < AminX) { X = AminX; }
                    if (X > AmaxX) { X = AmaxX; }
                    if (Y < AminY) { Y = AminY; }
                    if (Y > AmaxY) { Y = AmaxY; }

                    map.setCenter(new google.maps.LatLng(Y, X));
                }
            } catch (e) {
                console.log(e.message);
            }

        }
        return {
            init: init
        }
    };
    window.googleMaps = googleMaps;


    var lazyLoader = function () {
        var getLazycontent = function (item) {
            var url = $("#getpage").attr("data-url") + "?regionname=" + $(item).data("pluginname");
            if (item.className == 'lazypartial')
                url = $("#getpartial").attr("data-url") + "?partialname=" + $(item).data("partialname");
            if (url && url.length > 0) {
                var elem = item;
                var promise = $.get(url, function (data) {
                    updatediv(elem, data);
                }, "html").done(function (response, status, xhr, elem) {
                    if (status == "success") {
                        $(this).attr("data-dataloaded", "true");
                        Load($(this));
                    }
                });
            }
        }
        function Load(elem) {
            if (elem.find(".lazyplugin").length == 0)
            { unblockUI(); return; }
            if (elem.find(".lazypartial").length == 0)
            { unblockUI(); return; }
            blockUI();
            elem.find(".lazyplugin").each(function (index, item) {
                if (!$(item).data("dataloaded")) {
                    getLazycontent(item);
                }
            });
            elem.find(".lazypartial").each(function (index, item) {
                if (!$(item).data("dataloaded")) {
                    getLazycontent(item);
                }
            });
        };
        var updatediv = function (div, data) {
            $(div).html(data);
            $(div).removeClass("lazyplugin").removeClass("lazypartial");
        };

        function LoadAll() {
            //  blockUI();
            $(".lazyplugin").each(function (index, item) {
                if (!$(item).data("dataloaded")) {
                    getLazycontent(item);
                }
            });
            $(".lazypartial").each(function (index, item) {
                if (!$(item).data("dataloaded")) {
                    getLazycontent(item);
                }
            });
        };
        return {
            LoadAll: LoadAll,
            Load: Load
        }
    };
    global.lazyLoader = lazyLoader;

    global.updateCache = function () {
        try {
            window.applicationCache.update();
        }
        catch (e) {
            console.log('error' + e.message);
        }
    };

    global.setDateCulture = function () {
        var culture = $.cookie("_culture");
        if (culture == undefined) $.cookie("_culture", "en");
        switch (culture) {
            case 'en-us':
            case 'fr-fr':
            case 'fr-ca':
            case 'nl-nl':
            case 'de-de':
            case 'es-es':
            case 'pt-pt':
            case 'it-it':
                {
                    culture = culture.substring(0, culture.indexOf('-'));
                    break;
                }
            case 'zh-tw': break;
            default:
                {
                    culture = 'en';
                }
        }
        console.log(culture);        
        moment.locale(culture);
    }

})(window);
var cacheStatusValues = [];
cacheStatusValues[0] = 'uncached';
cacheStatusValues[1] = 'idle';
cacheStatusValues[2] = 'checking';
cacheStatusValues[3] = 'downloading';
cacheStatusValues[4] = 'updateready';
cacheStatusValues[5] = 'obsolete';

var cache = window.applicationCache;
cache.addEventListener('cached', logEvent, false);
cache.addEventListener('checking', logEvent, false);
cache.addEventListener('downloading', logEvent, false);
cache.addEventListener('error', logEvent, false);
cache.addEventListener('noupdate', logEvent, false);
cache.addEventListener('obsolete', logEvent, false);
cache.addEventListener('progress', logEvent, false);
cache.addEventListener('updateready', logEvent, false);

function logEvent(e) {
    if ($(document.documentElement).attr('manifest') != '')
        blockUI();
    var online, status, type, message;
    online = (navigator.onLine) ? 'yes' : 'no';
    status = cacheStatusValues[cache.status];
    type = e.type;
    message = 'online: ' + online;
    message += ', event: ' + type;
    message += ', status: ' + status;
    if (type == 'error' && navigator.onLine) {
        message += ' (may be a syntax error in manifest)';
    }
    console.log(message);
    if (status == 'idle')
        unblockUI();
    if (type === 'error' || type == 'noupdate' || type == 'updateready') {
        if (type == 'updateready') {
            unblockUI();
            try {
                window.applicationCache.swapCache();
            }
            catch (e) {
                console.log('swap cache has been called' + e.message);
                //  window.location.href = window.location.href;;
            }
            if (document.getElementById("login") != null)
                window.location.href = window.location.href;
        }

    }
}

window.mpcglobal = {
    eventcodes: {
        PANEL_REGISTERED: 859,
        CONFIG_UPLOAD: 868,
        PANEL_ONLINE: 5035,
        PANLE_OFFLINE: 5036,
        RECORDER_CONNECTED: 10007,
        RECORDER_DISCONNECTED: 10008
    },

    eventschema: {
        EventCode: "EventCode",
        EventType: "EventType",
        SourceId: "SourceEntityId",
        SourceName: "SourceEntityName",
        SourceType: "SourceEntityType"
    }
};

ko.bindingHandlers.spinnerValue = {
    init: function (element, valueAccessor) {
        $(element).on('spinstart', function (event, ui) {
            if ($(element)[0].disabled) {
                event.preventDefault();
            }
        });
        //handle the field changing
        $(element).on('spinstop', function () {
            var observable = valueAccessor();
            observable($(element).spinner("value"));
        });
    },

    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());

        current = $(element).spinner("value");
        if (value !== current) {
            $(element).spinner("value", value);
        }
    }
};

ko.bindingHandlers.spinnerOptions = {
    init: function (element, valueAccessor) {
        //handle the field changing
        $(element).on('spin', function (event, data) {
            var observable = valueAccessor();
            if (data.value > observable.max() || data.value < observable.min()) {
                event.preventDefault();
            }
        });
    },
};

$(document).on('mousedown mouseup', '.passfield', function (event) {
    togglepasswordreset(event);
});

$(document).on('reset', 'form', function (event) {
    var element = $(event.currentTarget);
    if (element) {
        var span = $(element).find('.passfield');
        if (span) {
            $(span).attr('data-istext', "0");
            $(span).parent().children('input').attr('type', 'password');
        }
    }
});
window.togglepasswordreset = function (event) {
    var element = event.currentTarget;
    if (element) {
        if (event.type == 'mousedown') {
            $(element).parent().children('input').attr('type', 'text');
        }
        else {
            $(element).parent().children('input').attr('type', 'password');
        }
    }
};
window.addWatch();
window.setDateCulture();

//convert the string into date object
String.prototype.toDate = function () {
    if (!this) return "";
    var final = moment(this, Resources.datetimeformat).toDate();
    return final;
};

//convert the string to US fromatted date as this format is exptected at the api
String.prototype.toDateString = function () {
    if (!this) return "";
    var final = moment(this, Resources.datetimeformat).format('MM/DD/YYYY HH:mm:ss').toString();
    return final;
};

//convert the string to US fromatted UTC date as this format is exptected at the api
String.prototype.toUTCDateString = function () {
    if (!this) return "";
    var final = moment(this, Resources.datetimeformat).utc().format('MM/DD/YYYY HH:mm:ss').toString();
    return final;
};

Date.prototype.stdTimezoneOffset = function () {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
};

Date.prototype.isDST = function () {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
};