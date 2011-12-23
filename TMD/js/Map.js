var CoordinatePicker = new function () {
    var external = {};

    var $container = $(
        "<div id='CoordinatePicker' style='position: absolute; left: 0; right: 0; z-index: 101;'>\
            <div class='CoordinatePickerMap' style='position: absolute; top: 0; left: 0; bottom: 0; right: 0;'></div>\
            <div class='portlet x6' style='position: absolute; left: 50%; margin-left: -230px; top: -10px;'>\
                <div class='portlet-content'>\
                    <form class='form CoordinatePickerCoordinates'>\
                        <div class='field'>\
                            <label for='CoordinatePickerCoordinates' style='width: 100px;'>Coordinates</label>\
                            <div><span class='input'>\
                                <input id='CoordinatePickerCoordinates' name='Coordinates' type='text' size='40'>\
                            </span></div>\
                            <p class='field_help' style='margin-bottom: 0; margin-left: 120px;'>Latitude, Longitude</p>\
                            <div class='buttonrow' style='margin-bottom: 0; margin-left: 120px;'>\
                                <button class='btn' type='Submit' name='Action' value='Save'>Save</button>\
                                <button class='btn btn-grey' type='Submit' name='Action' value='Back'>Back</button>\
                            </div>\
                        </div>\
                    </form>\
                </div>\
            </div>\
            <div class='portlet x6' style='position: absolute; left: 50%; margin-left: -230px; bottom: -25px;'>\
                <div class='portlet-content'>\
                    <form class='form CoordinatePickerAddress'>\
                        <div class='field'>\
                            <label for='CoordinatePickerAddress' style='width: 100px;'>Address</label>\
                            <div><span class='input'>\
                                <input id='CoordinatePickerAddress' name='Address' type='text' size='40'>\
                            </span></div>\
                            <div class='buttonrow' style='margin-bottom: 0; margin-left: 120px;'>\
                                <button class='btn btn-orange' type='Submit' name='Action' value='Search'>Search</button>\
                            </div>\
                        </div>\
                    </form>\
                </div>\
            </div>\
        </div>");

    external.GetCoordinates = function () {
        return Coordinates.Parse($container.find('form.CoordinatePickerCoordinates input[name=Coordinates]').val());
    };

    function SetCoordinates(coordinates) {
        $container.find('form.CoordinatePickerCoordinates input[name=Coordinates]').val(coordinates.ToString());
    };

    external.Options = {};

    external.Open = function (options) {
        if (options != null) {
            var defaults = {
                Coordinates: Coordinates.Create(Latitude.Create(36.94167), Longitude.Create(-95.825)),
                Zoom: 5,
                Markers: null,
                Callback: function (result) { }
            };
            external.Options = $.extend(defaults, options);
        }
        initialize();
    };

    external.Close = function (success) {
        dispose();
        external.Options.Callback({
            Success: success,
            Coordinates: external.GetCoordinates()
        });
    };

    var m_Map, m_PickerMarker;
    function initialize() {
        SetCoordinates(external.Options.Coordinates);
        $('body').css('overflow', 'hidden').append($container);
        $(window).bind('resize', windowResized)
            .bind('keyup', function (event) { if (event.keyCode == 27) { external.Close(false); } });
        $container.find('form.CoordinatePickerCoordinates button[name=Action]').click(function () {
            if ($(this).val() == 'Save') { external.Close(true); }
            else if ($(this).val() == 'Back') { external.Close(false); }
            return false;
        });
        $container.find('form.CoordinatePickerCoordinates input[name=Coordinates]').change(function () {
            var coordinates = Coordinates.Parse($(this).val());
            if (coordinates.IsSpecified() && coordinates.IsValid()) {
                m_PickerMarker.setPosition(new google.maps.LatLng(coordinates.Latitude().TotalDegrees(), coordinates.Longitude().TotalDegrees()));
            }
        });
        $container.find('form.CoordinatePickerAddress').submit(function () {
            var $addressInput = $(this).find('input[name=Address]');
            $addressInput.removeClass('input-validation-error').parent().find('.field-validation-error').remove();
            if ($addressInput.val().IsNullOrWhitespace()) {
                $addressInput.addClass('input-validation-error').after($('<span class="field-validation-error" style="margin-left: 120px;">You must specify an address.</span>'));
            } else {
                new google.maps.Geocoder().geocode({ address: $addressInput.val() }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        $addressInput.val(results[0].formatted_address);
                        m_PickerMarker.setPosition(results[0].geometry.location);
                        fitMarkerBounds();
                    } else {
                        $addressInput.addClass('input-validation-error').after($('<span class="field-validation-error" style="margin-left: 120px;">Unable to locate this address.</span>'));
                    }
                });
            }
            return false;
        });

        var center = new google.maps.LatLng(external.Options.Coordinates.Latitude().TotalDegrees(), external.Options.Coordinates.Longitude().TotalDegrees());
        var options = { center: center, zoom: external.Options.Zoom,
            mapTypeId: google.maps.MapTypeId.TERRAIN,
            scaleControl: true,
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.TERRAIN, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID],
                position: google.maps.ControlPosition.RIGHT_BOTTOM,
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
            },
            navigationControlOptions: {
                position: google.maps.ControlPosition.LEFT_BOTTOM,
                style: google.maps.NavigationControlStyle.SMALL
            }
        };
        m_Map = new google.maps.Map($container.find('.CoordinatePickerMap')[0], options);
        m_PickerMarker = new google.maps.Marker({ position: center, map: m_Map, draggable: true, zIndex: 1000 });
        m_Map.getSingletonInfoWindow().setContent("Drag this marker into position to pick a coordinate.");

        m_Map.UseEventListener(google.maps.event.addListener(m_PickerMarker, 'position_changed', markerPositionChanged));
        m_Map.UseEventListener(google.maps.event.addListener(m_Map, 'click', markerClick));
        m_Map.UseEventListener(google.maps.event.addListener(m_PickerMarker, 'dragend', markerClick));

        markerPositionChanged();
        m_Map.getSingletonInfoWindow().open(m_Map, m_PickerMarker);
        windowResized();

        if (external.Options.Markers != null) {
            for (i in external.Options.Markers) {
                var marker = new google.maps.Marker();
                marker.Initialize(external.Options.Markers[i]);
                m_Map.AddMarker(marker);
            }
            fitMarkerBounds();
        }
    };

    function windowResized() {
        $container.css('top', $(window).scrollTop())
            .css('height', $(window).height());
    };

    function markerPositionChanged() {
        m_Map.getSingletonInfoWindow().close();
        var currentCoordinates = external.GetCoordinates();
        var newCoordinates = Coordinates.Create(
            Latitude.Create(m_PickerMarker.getPosition().lat()),
            Longitude.Create(m_PickerMarker.getPosition().lng()));
        newCoordinates.InputFormat = function () {
            return currentCoordinates.IsValid() && currentCoordinates.IsSpecified() ?
                currentCoordinates.InputFormat() :
                CoordinatesFormat.Default;
        }
        SetCoordinates(newCoordinates);
    };

    function markerClick(event) {
        var newCenter = event.latLng;
        m_PickerMarker.setPosition(newCenter);
        m_Map.panTo(newCenter);
    };

    function fitMarkerBounds() {
        if (m_Map.getMarkers().length == 0) {
            m_Map.panTo(m_PickerMarker.getPosition());
        } else {
            var bounds = new google.maps.LatLngBounds();
            bounds.extend(m_PickerMarker.getPosition());
            for (var i in m_Map.getMarkers()) {
                bounds.extend(m_Map.getMarkers()[i].getPosition());
            }
            m_Map.fitBounds(bounds);
        }
    }

    function dispose() {
        m_Map.DisposeMarkers();
        m_Map.DisposeEventListeners();
        $(window).unbind('resize').unbind('keyup');
        $container.find('form.CoordinatePickerCoordinates input[name=Action]').unbind('click');
        $container.find('form.CoordinatePickerCoordinates input[name=Coordinates]').unbind('change');
        $container.find('form.CoordinatePickerAddress').unbind('submit');
        $container.remove();
        $('body').css('overflow', 'visible');
    };

    return external;
};

var CoordinatesFormat = {
    Invalid: 0,
    Unspecified: 1,
    Default: 2,
    DegreesMinutesDecimalSeconds: 3,
    DegreesDecimalMinutes: 4,
    DecimalDegrees: 5
};

var Coordinates = {
    Create: function (latitude, longitude) {
        return {
            Latitude: function () { return latitude; },
            Longitude: function () { return longitude; },
            InputFormat: function () {
                if (this.Latitude().InputFormat() == CoordinatesFormat.Invalid
                            || this.Longitude().InputFormat() == CoordinatesFormat.Invalid) {
                    return CoordinatesFormat.Invalid;
                }
                if (this.Latitude().InputFormat() == CoordinatesFormat.Unspecified
                            || this.Longitude().InputFormat() == CoordinatesFormat.Unspecified) {
                    return CoordinatesFormat.Unspecified;
                }
                return this.Latitude().InputFormat();
            },
            IsValid: function () { return this.InputFormat() != CoordinatesFormat.Invalid; },
            IsSpecified: function () { return this.InputFormat() != CoordinatesFormat.Unspecified; },
            ToString: function (format) {
                if (!this.Latitude().IsSpecified() || !this.Latitude().IsValid()
                        || !this.Longitude().IsSpecified() || !this.Longitude().IsValid()) {
                    return '';
                }
                return this.Latitude().ToString(format || this.InputFormat())
                            + ', ' + this.Longitude().ToString(format || this.InputFormat());
            },
            Equals: function (coordinates) {
                return this.IsValid() && coordinates.IsValid()
                    && this.Latitude().Equals(coordinates.Latitude())
                    && this.Longitude().Equals(coordinates.Longitude());
            }
        }
    },
    Parse: function (coordinates) {
        if (coordinates.IsNullOrWhitespace()
                    || !coordinates.Contains(',')) {
            return this.Null();
        }
        var parts = coordinates.split(',', 2);
        return this.Create(
                    Latitude.Parse(parts[0]),
                    Longitude.Parse(parts[1]));
    },
    Null: function () { return this.Create(Latitude.Null(), Longitude.Null()); }
};

var Longitude = {
    Create: function (degrees, inputFormat) {
        return {
            TotalDegrees: function () { return degrees; },
            Sign: function () { return this.TotalDegrees() >= 0 ? 1 : -1; },
            AbsoluteTotalDegrees: function () { return Math.abs(this.TotalDegrees()); },
            AbsoluteWholeDegrees: function () { return Math.floor(this.AbsoluteTotalDegrees()); },
            AbsoluteMinutes: function () { return 60.0 * (this.AbsoluteTotalDegrees() - this.AbsoluteWholeDegrees()); },
            AbsoluteWholeMinutes: function () { return Math.floor(this.AbsoluteMinutes()); },
            AbsoluteSeconds: function () { return 60 * (this.AbsoluteMinutes() - this.AbsoluteWholeMinutes()); },
            IsSpecified: function () { return this.InputFormat() != CoordinatesFormat.Unspecified; },
            IsValid: function () {
                return this.InputFormat() != CoordinatesFormat.Invalid
                    && this.TotalDegrees() >= -180.0
                    && this.TotalDegrees() <= 180.0;
            },
            InputFormat: function () { return inputFormat == null ? CoordinatesFormat.Default : inputFormat; },
            ToString: function (format) {
                switch (format || this.InputFormat()) {
                    case CoordinatesFormat.Unspecified:
                    case CoordinatesFormat.Invalid:
                        return '';
                    case CoordinatesFormat.DegreesMinutesDecimalSeconds:
                        return (this.AbsoluteWholeDegrees() * this.Sign())
                            + ' ' + this.AbsoluteWholeMinutes()
                            + ' ' + this.AbsoluteSeconds().toFixed(1);
                    case CoordinatesFormat.DecimalDegrees:
                        return (this.AbsoluteTotalDegrees() * this.Sign()).toFixed(5);
                    case CoordinatesFormat.Default:
                    case CoordinatesFormat.DegreesDecimalMinutes:
                    default:
                        return (this.AbsoluteWholeDegrees() * this.Sign())
                            + ' ' + this.AbsoluteMinutes().toFixed(3);
                }
            },
            Equals: function (longitude) {
                return this.IsValid() && longitude.IsValid()
                    && this.TotalDegrees() == longitude.TotalDegrees();
            }
        };
    },
    Parse: function (longitude) {
        var DegreesMinutesSecondsFormat = /^\s*([-+])?([0-9]{1,3})\s+([0-9]{1,2})\s+([0-9]{1,2}(?:\.[0-9]+)?)\s*$/;
        var DegreesDecimalMinutesFormat = /^\s*([-+])?([0-9]{1,3})\s+([0-9]{1,2}(?:\.[0-9]+)?)\s*$/;
        var DecimalDegreesFormat = /^\s*([-+])?([0-9]{1,3}(?:\.[0-9]+)?)\s*$/;
        var sign, degrees, minutes, seconds, inputFormat;
        if (longitude.IsNullOrWhitespace()) {
            sign = 1.0; degrees = 0.0; minutes = 0.0; seconds = 0.0; inputFormat = CoordinatesFormat.Unspecified;
        } else if (DegreesMinutesSecondsFormat.test(longitude)) {
            var match = DegreesMinutesSecondsFormat.exec(longitude);
            sign = '-' == match[1] ? -1.0 : 1.0;
            degrees = parseFloat(match[2]);
            minutes = parseFloat(match[3]);
            seconds = parseFloat(match[4]);
            inputFormat = CoordinatesFormat.DegreesMinutesDecimalSeconds;
        } else if (DegreesDecimalMinutesFormat.test(longitude)) {
            var match = DegreesDecimalMinutesFormat.exec(longitude);
            sign = '-' == match[1] ? -1.0 : 1.0;
            degrees = parseFloat(match[2]);
            minutes = parseFloat(match[3]);
            seconds = 0.0;
            inputFormat = CoordinatesFormat.DegreesDecimalMinutes;
        } else if (DecimalDegreesFormat.test(longitude)) {
            var match = DecimalDegreesFormat.exec(longitude);
            sign = '-' == match[1] ? -1.0 : 1.0;
            degrees = parseFloat(match[2]);
            minutes = 0.0;
            seconds = 0.0;
            inputFormat = CoordinatesFormat.DecimalDegrees;
        } else {
            sign = 1.0; degrees = 0.0; minutes = 0.0; seconds = 0.0; inputFormat = CoordinatesFormat.Invalid;
        }
        return this.Create(
                    (sign * (degrees + (minutes / 60.0) + (seconds / 3600.0))).RoundToDecimals(5),
                    inputFormat);
    },
    Null: function () { return this.Create(0.0, CoordinatesFormat.Unspecified); }
};

var Latitude = {
    Create: function (degrees, inputFormat) {
        return {
            TotalDegrees: function () { return degrees; },
            Sign: function () { return this.TotalDegrees() >= 0 ? 1 : -1; },
            AbsoluteTotalDegrees: function () { return Math.abs(this.TotalDegrees()); },
            AbsoluteWholeDegrees: function () { return Math.floor(this.AbsoluteTotalDegrees()); },
            AbsoluteMinutes: function () { return 60.0 * (this.AbsoluteTotalDegrees() - this.AbsoluteWholeDegrees()); },
            AbsoluteWholeMinutes: function () { return Math.floor(this.AbsoluteMinutes()); },
            AbsoluteSeconds: function () { return 60 * (this.AbsoluteMinutes() - this.AbsoluteWholeMinutes()); },
            IsSpecified: function () { return this.InputFormat() != CoordinatesFormat.Unspecified; },
            IsValid: function () {
                return this.InputFormat() != CoordinatesFormat.Invalid
                    && this.TotalDegrees() >= -90.0
                    && this.TotalDegrees() <= 90.0;
            },
            InputFormat: function () { return inputFormat == null ? CoordinatesFormat.Default : inputFormat; },
            ToString: function (format) {
                switch (format || this.InputFormat()) {
                    case CoordinatesFormat.Unspecified:
                    case CoordinatesFormat.Invalid:
                        return '';
                    case CoordinatesFormat.DegreesMinutesDecimalSeconds:
                        return (this.AbsoluteWholeDegrees() * this.Sign())
                            + ' ' + this.AbsoluteWholeMinutes()
                            + ' ' + this.AbsoluteSeconds().toFixed(1);
                    case CoordinatesFormat.DecimalDegrees:
                        return (this.AbsoluteTotalDegrees() * this.Sign()).toFixed(5);
                    case CoordinatesFormat.Default:
                    case CoordinatesFormat.DegreesDecimalMinutes:
                    default:
                        return (this.AbsoluteWholeDegrees() * this.Sign())
                            + ' ' + this.AbsoluteMinutes().toFixed(3);
                }
            },
            Equals: function (latitude) {
                return this.IsValid() && latitude.IsValid()
                    && this.TotalDegrees() == latitude.TotalDegrees();
            }
        };
    },
    Parse: function (latitude) {
        var DegreesMinutesSecondsFormat = /^\s*([-+])?([0-9]{1,2})\s+([0-9]{1,2})\s+([0-9]{1,2}(?:\.[0-9]+)?)\s*$/;
        var DegreesDecimalMinutesFormat = /^\s*([-+])?([0-9]{1,2})\s+([0-9]{1,2}(?:\.[0-9]+)?)\s*$/;
        var DecimalDegreesFormat = /^\s*([-+])?([0-9]{1,2}(?:\.[0-9]+)?)\s*$/;
        var sign, degrees, minutes, seconds, inputFormat;
        if (latitude.IsNullOrWhitespace()) {
            sign = 1.0; degrees = 0.0; minutes = 0.0; seconds = 0.0; inputFormat = CoordinatesFormat.Unspecified;
        } else if (DegreesMinutesSecondsFormat.test(latitude)) {
            var match = DegreesMinutesSecondsFormat.exec(latitude);
            sign = '-' == match[1] ? -1.0 : 1.0;
            degrees = parseFloat(match[2]);
            minutes = parseFloat(match[3]);
            seconds = parseFloat(match[4]);
            inputFormat = CoordinatesFormat.DegreesMinutesDecimalSeconds;
        } else if (DegreesDecimalMinutesFormat.test(latitude)) {
            var match = DegreesDecimalMinutesFormat.exec(latitude);
            sign = '-' == match[1] ? -1.0 : 1.0;
            degrees = parseFloat(match[2]);
            minutes = parseFloat(match[3]);
            seconds = 0.0;
            inputFormat = CoordinatesFormat.DegreesDecimalMinutes;
        } else if (DecimalDegreesFormat.test(latitude)) {
            var match = DecimalDegreesFormat.exec(latitude);
            sign = '-' == match[1] ? -1.0 : 1.0;
            degrees = parseFloat(match[2]);
            minutes = 0.0;
            seconds = 0.0;
            inputFormat = CoordinatesFormat.DecimalDegrees;
        } else {
            sign = 1.0; degrees = 0.0; minutes = 0.0; seconds = 0.0; inputFormat = CoordinatesFormat.Invalid;
        }
        return this.Create(
                    (sign * (degrees + (minutes / 60.0) + (seconds / 3600.0))).RoundToDecimals(5),
                    inputFormat);
    },
    Null: function () { return this.Create(0.0, CoordinatesFormat.Unspecified); }
};

google.maps.Map.prototype.getSingletonInfoWindow = function () {
    if (!this.internalSingletonInfoWindow) { this.internalSingletonInfoWindow = new google.maps.InfoWindow(); }
    return this.internalSingletonInfoWindow;
};
google.maps.Map.prototype.UseEventListener = function (eventListener) {
    if (!this.internalEventListeners) { this.internalEventListeners = new Array(); }
    this.internalEventListeners.push(eventListener);
};
google.maps.Map.prototype.getMarkers = function () {
    if (!this.internalMarkers) { this.internalMarkers = new Array(); }
    return this.internalMarkers;
};
google.maps.Map.prototype.AddMarker = function (initializedMarker) {
    initializedMarker.setMap(this);
    initializedMarker.NotifyMapZoomChanged(this);
    var map = this;
    this.UseEventListener(google.maps.event.addListener(this, 'zoom_changed', function () { initializedMarker.NotifyMapZoomChanged(map); }));
    this.UseEventListener(google.maps.event.addListener(initializedMarker, 'click', function () { initializedMarker.ShowInfo(map); }));
    this.UseEventListener(google.maps.event.addListener(initializedMarker, 'dblclick', function () { initializedMarker.Focus(map); }));
    this.getMarkers().push(initializedMarker);
};
google.maps.Map.prototype.DisposeEventListeners = function () {    
    if (!this.internalEventListeners) { this.internalEventListeners = new Array(); }
    while (this.internalEventListeners.length > 0) {
        google.maps.event.removeListener(this.internalEventListeners.pop());
    }
};
google.maps.Map.prototype.DisposeMarkers = function () {
    while (this.getMarkers().length > 0) {
        var marker = this.getMarkers().pop();
        marker.setMap(null);
    }
};

google.maps.Marker.prototype.getLoadedInfo = function () { return this.internalLoadedInfo; };
google.maps.Marker.prototype.setLoadedInfo = function (info) { this.internalLoadedInfo = info; };
google.maps.Marker.prototype.setOptions = function (options) { this.internalOptions = options; };
google.maps.Marker.prototype.getOptions = function () { return this.internalOptions; };
google.maps.Marker.prototype.NotifyMapZoomChanged = function (map) {
    if (this.getOptions().MinZoom || this.getOptions().MaxZoom) {
        this.setVisible(
            map.getZoom() <= this.getOptions().MaxZoom
            && map.getZoom() >= this.getOptions().MinZoom);
    }
};
google.maps.Marker.prototype.Initialize = function (options) {
    this.setOptions(options);
    this.setTitle(options.Title);
    this.setIcon(options.IconUrl);
    this.setPosition(new google.maps.LatLng(options.Latitude, options.Longitude));
};
google.maps.Marker.prototype.ShowInfo = function (map) {
    if (this.getLoadedInfo()) {
        map.getSingletonInfoWindow().setContent(this.getLoadedInfo()[0]);
        map.getSingletonInfoWindow().open(map, this);
    } else {
        var marker = this;
        $.get(this.getOptions().InfoLoaderUrl, function (response) {
            marker.setLoadedInfo($(response).InitializeUi());
            map.getSingletonInfoWindow().setContent(marker.getLoadedInfo()[0]);
            map.getSingletonInfoWindow().open(map, marker);
        });
    }
};
google.maps.Marker.prototype.Focus = function (map) {
    map.setZoom(this.getOptions().MaxZoom + 1);
    map.panTo(this.getPosition());
};

(function ($) {
    $.fn.Mapify = function (options) {
        var defaults = {
            mapTypeId: google.maps.MapTypeId.TERRAIN,
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.TERRAIN, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID],
                position: google.maps.ControlPosition.RIGHT_BOTTOM,
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
            },
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.SMALL,
                position: google.maps.ControlPosition.LEFT_BOTTOM
            },
            panControl: false,
            streetViewControl: false
        }
        options = $.extend(defaults, options);

        function getCenter(element) {
            return new google.maps.LatLng(
                $(element).attr('data-center-latitude'),
                $(element).attr('data-center-longitude')
            );
        }

        function getZoom(element) {
            return parseInt($(element).attr('data-zoom')) || 5;
        }

        function hasBounds(element) {
            return $(element).attr('data-ne-latitude');
        }

        function getBounds(element) {
            return new google.maps.LatLngBounds(
                new google.maps.LatLng(
                    $(element).attr('data-sw-latitude'),
                    $(element).attr('data-sw-longitude')
                ),
                new google.maps.LatLng(
                    $(element).attr('data-ne-latitude'),
                    $(element).attr('data-ne-longitude')
                )
            );
        }

        function getMarkerLoader(element) {
            return $(element).attr('data-markerloaderurl');
        }

        return this.each(function () {
            // if this map has already been initialized then just refresh the ui
            if (this.InternalMap) {
                google.maps.event.trigger(this.InternalMap, 'resize');
                return;
            }

            options.center = getCenter(this);
            options.zoom = getZoom(this);

            var map = new google.maps.Map(this, options);
            this.InternalMap = map;

            if (hasBounds(this)) {
                map.fitBounds(getBounds(this));
            }

            google.maps.event.addListener(map, 'zoom_changed', function () { map.getSingletonInfoWindow().close(); });

            $.get(getMarkerLoader(this), function (response) {
                for (i in response.Markers) {
                    var marker = new google.maps.Marker();
                    marker.Initialize(response.Markers[i]);
                    map.AddMarker(marker);
                }
            });
        });
    }
})(jQuery);


(function ($) {
    $.fn.CoordinatePicker = function (options) {
        var defaults = { AddressCalculator: null };
        options = $.extend(defaults, options);
        return this.each(function () {
            var $pickerContainer = $(this);
            var $pickerButton = $pickerContainer.find('button').show();
            var $coordinateContainer = $pickerContainer.find('input[type=text]');

            $pickerButton.click(function () {
                $.get($pickerButton.attr('data-markerloaderurl'), function (response) {
                    var coordinates = Coordinates.Parse($coordinateContainer.val());
                    if (coordinates.IsValid() && coordinates.IsSpecified()) {
                        CoordinatePicker.Open({ Coordinates: coordinates, Zoom: 15, Markers: response.Markers, Callback: handleCoordinatePickerResult });
                        return;
                    }
                    if (response.CalculatedCoordinates != null) {
                        CoordinatePicker.Open({ Zoom: 15, Markers: response.Markers, Callback: handleCoordinatePickerResult,
                            Coordinates: Coordinates.Create(Latitude.Create(response.CalculatedCoordinates.Latitude), Longitude.Create(response.CalculatedCoordinates.Longitude))
                        });
                        return;
                    }
                    if (options.AddressCalculator != null && options.AddressCalculator.call($pickerContainer) != null) {
                        var address = options.AddressCalculator.call($pickerContainer);
                        new google.maps.Geocoder().geocode({ address: address },
                            function (results, status) {
                                if (status == google.maps.GeocoderStatus.OK) {
                                    CoordinatePicker.Open({ Markers: response.Markers, Callback: handleCoordinatePickerResult,
                                        Coordinates: Coordinates.Create(Latitude.Create(results[0].geometry.location.lat()), Longitude.Create(results[0].geometry.location.lng()))
                                    });
                                } else {
                                    CoordinatePicker.Open({ Markers: response.Markers, Callback: handleCoordinatePickerResult });
                                }
                            }
                        );
                        return;
                    }
                    CoordinatePicker.Open({ Markers: response.Markers, Callback: handleCoordinatePickerResult });
                });
                return false;
            });

            function handleCoordinatePickerResult(result) {
                if (result.Success) {
                    $coordinateContainer.val(result.Coordinates.ToString());
                    $coordinateContainer.trigger('change');
                }
            }
        });
    };
})(jQuery);


