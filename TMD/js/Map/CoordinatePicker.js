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
                                <input id='CoordinatePickerCoordinates' name='Coordinates' type='text' size='35'>\
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
                                <input id='CoordinatePickerAddress' name='Address' type='text' size='35'>\
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
