var CoordinatePicker = new function () {
    var public = {};

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

    public.GetCoordinates = function () {
        return Coordinates.Parse($container.find('form.CoordinatePickerCoordinates input[name=Coordinates]').val());
    };

    function SetCoordinates(coordinates) {
        $container.find('form.CoordinatePickerCoordinates input[name=Coordinates]').val(coordinates.ToString());
    };

    public.Options = {};

    public.Open = function (options) {
        if (options != null) {
            var defaults = {
                Coordinates: Coordinates.Create(Latitude.Create(36.94167), Longitude.Create(-95.825)),
                Zoom: 5,
                Markers: null,
                Callback: function (result) { }
            };
            public.Options = $.extend(defaults, options);
        }
        initialize();
    };

    public.Close = function (success) {
        dispose();
        public.Options.Callback({
            Success: success,
            Coordinates: public.GetCoordinates()
        });
    };

    var m_Map, m_PickerMarker, m_Info;
    var m_EventListeners = new Array(), m_Markers = new Array();
    function initialize() {
        SetCoordinates(public.Options.Coordinates);
        $('body').css('overflow', 'hidden').append($container);
        $(window).bind('resize', windowResized)
            .bind('keyup', function (event) { if (event.keyCode == 27) { public.Close(false); } });
        $container.find('form.CoordinatePickerCoordinates button[name=Action]').click(function () {
            if ($(this).val() == 'Save') { public.Close(true); }
            else if ($(this).val() == 'Back') { public.Close(false); }
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

        var center = new google.maps.LatLng(public.Options.Coordinates.Latitude().TotalDegrees(), public.Options.Coordinates.Longitude().TotalDegrees());
        var options = { center: center, zoom: public.Options.Zoom,
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
        m_PickerMarker = new google.maps.Marker({ position: center, map: m_Map, draggable: true });
        m_Info = new google.maps.InfoWindow({ content: "Drag this marker into position to pick a coordinate." });

        m_EventListeners.push(google.maps.event.addListener(m_PickerMarker, 'position_changed', markerPositionChanged));
        m_EventListeners.push(google.maps.event.addListener(m_Map, 'click', markerClick));
        m_EventListeners.push(google.maps.event.addListener(m_PickerMarker, 'dragend', markerClick));

        markerPositionChanged();
        m_Info.open(m_Map, m_PickerMarker);
        windowResized();

        if (public.Options.Markers != null) {
            for (i in public.Options.Markers) {
                initializeMarker(public.Options.Markers[i]);
            }
            fitMarkerBounds();
        }
    };

    function initializeMarker(options) {
        var marker = new google.maps.Marker({
            icon: options.Icon, map: m_Map, title: options.Title,
            position: new google.maps.LatLng(options.Coordinates.Latitude, options.Coordinates.Longitude)
        });
        m_Markers.push(marker);
        m_EventListeners.push(google.maps.event.addListener(marker, 'click', function () {
            m_Info.setContent(options.Info);
            m_Info.open(m_Map, marker);
        }));
    };

    function windowResized() {
        $container.css('top', $(window).scrollTop())
            .css('height', $(window).height());
    };

    function markerPositionChanged() {
        m_Info.close();
        var currentCoordinates = public.GetCoordinates();
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
        if (m_Markers.length == 0) {
            m_Map.panTo(m_PickerMarker.getPosition());
        } else {
            var bounds = new google.maps.LatLngBounds();
            bounds.extend(m_PickerMarker.getPosition());
            for (var i in m_Markers) {
                bounds.extend(m_Markers[i].getPosition());
            }
            m_Map.fitBounds(bounds);
        }
    }

    function dispose() {
        while (m_Markers.length > 0) {
            var marker = m_Markers.pop();
            marker.setMap(null);
        }
        while (m_EventListeners.length > 0) {
            google.maps.event.removeListener(m_EventListeners.pop());
        }
        $(window).unbind('resize').unbind('keyup');
        $container.find('form.CoordinatePickerCoordinates input[name=Action]').unbind('click');
        $container.find('form.CoordinatePickerCoordinates input[name=Coordinates]').unbind('change');
        $container.find('form.CoordinatePickerAddress').unbind('submit');
        $container.remove();
        $('body').css('overflow', 'visible');
    };

    return public;
};
