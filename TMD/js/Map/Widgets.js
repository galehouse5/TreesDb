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
