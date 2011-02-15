(function ($) {
    $.fn.Mapify = function (options) {
        var defaults = {
            mapTypeId: google.maps.MapTypeId.TERRAIN,
            mapTypeControlOptions: {
                mapTypeIds: [ google.maps.MapTypeId.TERRAIN, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID ],
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
            options.center = getCenter(this);
            options.zoom = getZoom(this);

            var map = new google.maps.Map(this, options);

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

            $pickerContainer.click(function () {
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

