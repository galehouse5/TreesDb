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
    var coordinatePickedCallback;
    var latitude = 36.94167;
    var longitude = -95.825;
    var zoom = 5;

    function CoordinatePickerResult(coordinatesPicked, latitude, longitude) {
        this.CoordinatePicked = coordinatesPicked;
        this.Latitude = latitude;
        this.Longitude = longitude;
    }

    this.Open = function (callback, options) {
        var performStateAndCountySearch = false;
        if (options != null) {
            if (!IsFloatParsable(options.latitude) || !IsFloatParsable(options.longitude)) {
                if (!IsNullOrEmpty(options.state)) {
                    performStateAndCountySearch = true;
                }
            } else {
                latitude = parseFloat(options.latitude);
                longitude = parseFloat(options.longitude);
            }
        }
        initializeDom();
        initializeMap();
        initializeAddressSearch();
        coordinatePickedCallback = callback;
        if (performStateAndCountySearch) {
            handleStateAndCountySearchAction(options.state, options.county);
        }
    };

    // general dom
    var initializeDom = function () {
        $('body').append(dom);
        dom.find('a').button();

        $(window).bind('resize', handleWindowResizeAction);
        $(window).bind('keyup', handleWindowKeyPressActionAction);
        dom.find('a.save').bind('click', handleSaveAction);
        dom.find('a.cancel').bind('click', handleCloseAction);

        handleWindowResizeAction();
    };

    var disposeDom = function () {
        $(window).unbind('resize');
        $(window).unbind('keyup');
        dom.find('a.save').unbind('click');
        dom.find('a.cancel').unbind('click');

        dom.remove();
    };

    var handleWindowResizeAction = function () {
        dom.find('.map')
            .css('height', document.documentElement.clientHeight)
            .css('width', document.documentElement.clientWidth);
    };

    var handleWindowKeyPressActionAction = function (event) {
        if (event.keyCode == 27) {
            handleCloseAction();
        }
    };

    var handleCloseAction = function () {
        disposeAddressSearch();
        disposeMap();
        disposeDom();
        if (coordinatePickedCallback != null) {
            coordinatePickedCallback(new CoordinatePickerResult(false));
        }
    };

    var handleSaveAction = function () {
        disposeAddressSearch();
        disposeMap();
        disposeDom();
        if (coordinatePickedCallback != null) {
            coordinatePickedCallback(new CoordinatePickerResult(true, latitude, longitude));
        }
    };

    // map
    var map;
    var marker;
    var infoWindow;
    var eventListeners = new Array();
    var initializeMap = function () {
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
            draggable: true
        });
        infowindow = new google.maps.InfoWindow({
            content: "Drag me into position and click 'Save' to pick my coordinates..."
        });

        eventListeners.push(google.maps.event.addListener(map, 'zoom_changed', handleMapZoomChangedAction));
        eventListeners.push(google.maps.event.addListener(marker, 'position_changed', handleMarkerPositionChangedAction));
        eventListeners.push(google.maps.event.addListener(map, 'click', handleMarkerClickAction));
        eventListeners.push(google.maps.event.addListener(marker, 'dragend', handleMapDragEndedAction));
        eventListeners.push(google.maps.event.addListener(marker, 'dblclick', handleSaveAction));

        handleMarkerPositionChangedAction();
        infowindow.open(map, marker);
    };

    var disposeMap = function () {
        while (eventListeners.length > 0) {
            google.maps.event.removeListener(eventListeners.pop());
        }
    };

    var handleMapZoomChangedAction = function () {
        zoom = map.getZoom()
    };

    var handleMarkerPositionChangedAction = function () {
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

    var handleMarkerClickAction = function (event) {
        var newCenter = event.latLng;
        marker.setPosition(newCenter);
        map.panTo(newCenter);
    };

    var handleMapDragEndedAction = function (event) {
        var newCenter = event.latLng;
        map.panTo(newCenter);
    };

    // address search
    var geocoder;
    var initializeAddressSearch = function () {
        if (geocoder == null) {
            geocoder = new google.maps.Geocoder();
        }
        dom.find('.address-search form').bind('submit', handleAddressSearchAction);
        dom.find('.address-search').effect('slide', null, 1500);
    };

    var disposeAddressSearch = function () {
        dom.find('.address-search form').unbind('submit');
    };

    var handleAddressSearchAction = function () {
        var searchTerms = $('.address-search input').val();
        var geocoderRequest = {
            address: searchTerms,
            location: marker.getPosition()
        };
        geocoder.geocode(geocoderRequest, handleGeocoderResultsReceivedAction);
    };

    var handleGeocoderResultsReceivedAction = function (geocoderResults, geocoderStatus) {
        if (geocoderStatus == google.maps.GeocoderStatus.OK) {
            var bestGeocoderResult = geocoderResults[0];
            marker.setPosition(bestGeocoderResult.geometry.location);
            map.fitBounds(bestGeocoderResult.geometry.viewport);
            dom.find('.address-search input').val(bestGeocoderResult.formatted_address);
        } else {
            dom.find('.address-search input').val('...Sorry, I can\'t find the address you entered.');
        }
    }

    var handleStateAndCountySearchAction = function (state, county) {
        var geocoderRequest = {
            address: IsNullOrEmpty(county) ? state : county + ' County, ' + state,
            location: new google.maps.LatLng(latitude, longitude)
        };
        geocoder.geocode(geocoderRequest, handleGeocoderResultsReceivedAction);
    };
};