(function ($) {
    $.fn.MapViewport = function (options) {

        function getCenter(viewport) {
            return new google.maps.LatLng(
                $(viewport).attr('data-center-latitude'),
                $(viewport).attr('data-center-longitude')
            );
        }

        function getZoom(viewport) {
            return $(viewport).attr('data-zoom') || 5;
        }

        function hasBounds(viewport) {
            return $(viewport).attr('data-ne-latitude');
        }

        function getBounds(viewport) {
            return new google.maps.LatLngBounds(
                new google.maps.LatLng(
                    $(viewport).attr('data-sw-latitude'),
                    $(viewport).attr('data-sw-longitude')
                ),
                new google.maps.LatLng(
                    $(viewport).attr('data-ne-latitude'),
                    $(viewport).attr('data-ne-longitude')
                )
            );
        }

        function getMarkerLoader(viewport) {
            return $(viewport).attr('data-markerloaderurl');
        }

        return this.each(function () {

            var map = new google.maps.Map(this, {
                center: getCenter(this),
                zoom: getZoom(this),
                mapTypeId: google.maps.MapTypeId.TERRAIN,
                scaleControl: true,
                mapTypeControlOptions: {
                    mapTypeIds: [google.maps.MapTypeId.TERRAIN, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID],
                    position: google.maps.ControlPosition.RIGHT_BOTTOM,
                    style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
                },
                navigationControlOptions: {
                    position: google.maps.ControlPosition.LEFT_BOTTOM,
                    style: google.maps.NavigationControlStyle.SMALL
                }
            });

            if (hasBounds(this)) {
                map.fitBounds(getBounds(this));
            }

            var info = new google.maps.InfoWindow();
            google.maps.event.addListener(map, 'zoom_changed', function () { info.close(); });


            function addMarker(options) {
                var marker = new google.maps.Marker({map: map,
                    icon: options.DefaultIconUrl,
                    title: options.Title,
                    position: new google.maps.LatLng(options.Latitude, options.Longitude)
                });

                function refreshVisibilityAndIcon() {
                    marker.setVisible(map.getZoom() <= options.MaxZoom && map.getZoom() >= options.MinZoom);
                    if (options.DynamicIcons) {
                        for (i in options.DynamicIcons) {
                            var icon = options.DynamicIcons[i];
                            if (map.getZoom() <= icon.MaxZoom && map.getZoom() >= icon.MinZoom) {
                                marker.setIcon(icon.IconLoaderUrl);
                            }
                        }
                    }
                }

                function showInfo() {
                    if (!marker.loadedInfo) {
                        $.get(options.InfoLoaderUrl, function (response) {
                            marker.loadedInfo = $(response).InitializeUi();
                            info.setContent(marker.loadedInfo[0]);
                            info.open(map, marker);
                        });
                    } else {
                        info.setContent(marker.loadedInfo[0]);
                        info.open(map, marker);
                    }
                }

                function focus() {
                    map.setZoom(options.MaxZoom + 1);
                    map.panTo(marker.getPosition());
                }

                google.maps.event.addListener(map, 'zoom_changed', refreshVisibilityAndIcon);
                google.maps.event.addListener(marker, 'click', showInfo);
                google.maps.event.addListener(marker, 'dblclick', focus);

                refreshVisibilityAndIcon();
            }

            $.get(getMarkerLoader(this), function (response) {
                for (i in response.Markers) {
                    addMarker(response.Markers[i]);
                }
            });

        });
    }
})(jQuery);


(function ($) {
    $.fn.CoordinatePicker = function (options) {
        var defaults = { AddressCalculator: null };
        var options = $.extend(defaults, options);
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

