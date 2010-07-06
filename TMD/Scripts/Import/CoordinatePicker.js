var CoordinatePicker = new function () {
    var dom = $(
        "<div id='coordinate-picker' style='font-size: 120%;'>\
            <div class='map' style='position: absolute; left: 0px; top: 0px;'></div>\
            <div class='coordinates' style='position: absolute; left: 45%; top: 10px;'></div>\
            <div class='address-search' style='position: absolute; left: 50px; bottom: 50px;'>\
                Type an address and press 'Enter' for help positioning the marker...\
                <br />\
                <form action='javascript:void(0);'>\
                    <input type='text' style='width:100%;' />\
                </form>\
            </div>\
            <a class='save' style='position: absolute; right: 50px; bottom: 50px;'>Save</a>\
            <a class='cancel' style='position: absolute; right: 150px; bottom: 50px;'>Cancel</a>\
        </div>");
    var resultCallback;
    var latitude = 36.94167;
    var longitude = -95.825;
    var zoom = 5;
    var abortAddressLookup = false;

    this.Open = function (options, callback) {
        if (options.coordinatesSpecified) {
            latitude = options.latitude;
            longitude = options.longitude;
        } else if (options.addressSpecified) {
            GeocoderService.Lookup({ state: options.state, county: options.county }, handleAddressSearchResult);
        }
        resultCallback = callback;
        initialize();
        initializeMap();
        initializeAddressSearch();
        if (options.markerLoader != null) {
            options.markerLoader(loadMarkers);
        }
    };

    // general dom
    function initialize() {
        $('body').append(dom);
        $(window).bind('resize', windowResize);
        $(window).bind('keyup', windowKeyPress);
        dom.find('a').button();
        dom.find('a.save').bind('click', save);
        dom.find('a.cancel').bind('click', close);
        windowResize();
    };

    function dispose() {
        $(window).unbind('resize');
        $(window).unbind('keyup');
        dom.find('a.save').unbind('click');
        dom.find('a.cancel').unbind('click');
        dom.remove();
    };

    function windowResize() {
        dom.find('.map')
            .css('height', document.documentElement.clientHeight)
            .css('width', document.documentElement.clientWidth);
    };

    function windowKeyPress(event) {
        if (event.keyCode == 27) { close(); }
    };

    function close() {
        disposeAddressSearch();
        disposeMap();
        dispose();
        resultCallback({ coordinatesPicked: false });
    };

    function save() {
        disposeAddressSearch();
        disposeMap();
        dispose();
        resultCallback({ coordinatesPicked: true, latitude: latitude, longitude: longitude });
    };

    // map
    var map;
    var marker;
    var infoWindow;
    var eventListeners = new Array();
    function initializeMap() {
        var center = new google.maps.LatLng(latitude, longitude);
        var options = {
            center: center,
            zoom: zoom,
            mapTypeId: google.maps.MapTypeId.TERRAIN,
            navigationControlOptions: {
                style: google.maps.NavigationControlStyle.HORIZONTAL_BAR
            },
            scaleControl: true
        };
        map = new google.maps.Map(dom.find('.map')[0], options);
        marker = new google.maps.Marker({
            position: center,
            map: map,
            draggable: true,
            zIndex: 1000
        });
        infowindow = new google.maps.InfoWindow({
            content: "Drag me into position and click 'Save' to pick my coordinates..."
        });

        eventListeners.push(google.maps.event.addListener(map, 'zoom_changed', mapZoomChanged));
        eventListeners.push(google.maps.event.addListener(marker, 'position_changed', markerPositionChanged));
        eventListeners.push(google.maps.event.addListener(map, 'click', markerClick));
        eventListeners.push(google.maps.event.addListener(marker, 'dragend', markerClick));
        eventListeners.push(google.maps.event.addListener(marker, 'dblclick', save));

        markerPositionChanged();
        infowindow.open(map, marker);
    };

    function loadMarkers(markers) {
        if (markers.length > 0) {
            var bounds = new google.maps.LatLngBounds();
            bounds.extend(marker.getPosition());
            for (var i in markers) {
                var mapMarker = MapMarkerService.CreateMapMarker(markers[i]);
                mapMarker.setMap(map);
                bounds.extend(mapMarker.getPosition());
            }
            abortAddressLookup = true;
            map.fitBounds(bounds);
        }
    }

    function disposeMap() {
        while (eventListeners.length > 0) {
            google.maps.event.removeListener(eventListeners.pop());
        }
    };

    function mapZoomChanged() {
        zoom = map.getZoom()
    };

    function markerPositionChanged() {
        latitude = marker.getPosition().lat().toFixed(5);
        longitude = marker.getPosition().lng().toFixed(5);
        infowindow.close();
        dom.find('.coordinates').text(
            '( '
            + marker.getPosition().lat().toFixed(5)
            + ', '
            + marker.getPosition().lng().toFixed(5)
            + ' )');
    };

    function markerClick(event) {
        var newCenter = event.latLng;
        marker.setPosition(newCenter);
        map.panTo(newCenter);
    };

    // address search
    function initializeAddressSearch() {
        dom.find('.address-search form').bind('submit', performAddressSearch);
        dom.find('.address-search').show('slide', {}, 1500, function () {
            dom.find('.address-search form input').focus();
        });
    };

    function disposeAddressSearch() {
        dom.find('.address-search form').unbind('submit');
    };

    function performAddressSearch() {
        var address = $('.address-search input').val();
        GeocoderService.Lookup({ address: address, location: marker.getPosition() }, handleAddressSearchResult);
    };

    function handleAddressSearchResult(result) {
        if (abortAddressLookup) {
            abortAddressLookup = false;
            return;
        }
        if (result.found) {
            marker.setPosition(result.location);
            map.fitBounds(result.viewport);
            dom.find('.address-search input').val(result.address);
        } else {
            dom.find('.address-search input').val('...Sorry, I can\'t find the address you entered.');
        }
    };
};