var CoordinatePicker = new function () {
    var dom = $(
        "<div id='CoordinatePicker' style='position: absolute; left: 0; right: 0; z-index: 101;'>\
            <div class='map' style='position: absolute; top: 0; left: 0; bottom: 0; right: 0;'></div>\
            <div class='address-search' style='position: absolute; left: 50px; bottom: 50px;'>\
                Type an address and press 'Enter' for help positioning the marker...\
                <br />\
                <form action='javascript:void(0);'>\
                    <input type='text' style='width:100%;' />\
                </form>\
            </div>\
            <div class='coordinates' style='position: absolute; left: 45%; bottom: 60px; font-size: 150%;'></div>\
            <div class='buttonrow' style='position: absolute; left: 45%; bottom: 30px;'>\
                <a class='save btn'>Pick these coordinates</a>\
                <a class='cancel btn btn-grey'>Back</a>\
            </div>\
        </div>");
    var m_ResultCallback;
    var m_Latitude = 36.94167, m_Longitude = -95.825, m_Zoom = 5;

    this.Open = function (options, callback) {
        m_ResultCallback = callback;
        initialize();

        if (options.coordinatesSpecified) {
            m_Zoom = 15;
            m_Latitude = options.latitude;
            m_Longitude = options.longitude;
            initializeMap();
            if (options.hasMarkersToLoad) {
                options.markerLoader(loadMarkers)
            }
        } else {
            initializeMap();
            if (options.hasMarkersToLoad) {
                options.markerLoader(loadMarkersAndPositionCoordinateMarkerSensibly)
            } else if (options.addressSpecified) {
                GeocoderService.Lookup({
                    state: options.state, county: options.county, country: options.country
                },
                    handleAddressSearchResult);
            }
        }

        windowResize();
        initializeAddressSearch();
    };

    // general dom
    function initialize() {
        $('body').append(dom);
        $(window).bind('resize', windowResize);
        $(window).bind('keyup', windowKeyPress);
        //        dom.find('a').button();
        dom.find('a.save').bind('click', save);
        dom.find('a.cancel').bind('click', close);
        $('body').css('overflow', 'hidden');
    };

    function dispose() {
        $('body').css('overflow', 'visible');
        $(window).unbind('resize');
        $(window).unbind('keyup');
        dom.find('a').button('destroy');
        dom.find('a.save').unbind('click');
        dom.find('a.cancel').unbind('click');
        dom.remove();
    };

    function windowResize() {
        //        dom.find('.map')
        //            .css('height', $(window).height())
        //            .css('width', $(window).width())
        //            .css('top', $(window).scrollTop());
        //        dom.find('.coordinates')
        //            .css('top', $(window).scrollTop() + 10 + 'px');
        //        dom.find('.save, .cancel, .address-search')
        //            .css('bottom', 50 - $(window).scrollTop() + 'px');
        dom.css('top', $(window).scrollTop())
            .css('height', $(window).height());
    };

    function windowKeyPress(event) {
        if (event.keyCode == 27) { close(); }
    };

    function close() {
        m_ResultCallback({ coordinatesPicked: false });
        disposeAddressSearch();
        disposeMap();
        dispose();
    };

    function save() {
        m_ResultCallback({ coordinatesPicked: true, latitude: m_Latitude, longitude: m_Longitude });
        disposeAddressSearch();
        disposeMap();
        dispose();
    };

    // map
    var m_Map, m_CoordinateMarker, m_InfoWindow, m_MapEventListeners = new Array(), m_EntityMarkers = new Array();
    function initializeMap() {
        var center = new google.maps.LatLng(m_Latitude, m_Longitude);
        var options = {
            center: center,
            zoom: m_Zoom,
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
        m_Map = new google.maps.Map(dom.find('.map')[0], options);
        m_CoordinateMarker = new google.maps.Marker({
            position: center,
            map: m_Map,
            draggable: true,
            zIndex: 1000
        });
        m_InfoWindow = new google.maps.InfoWindow({
            content: "Drag me into position and click 'Save' to pick my coordinates..."
        });

        m_MapEventListeners.push(google.maps.event.addListener(m_Map, 'zoom_changed', mapZoomChanged));
        m_MapEventListeners.push(google.maps.event.addListener(m_CoordinateMarker, 'position_changed', markerPositionChanged));
        m_MapEventListeners.push(google.maps.event.addListener(m_Map, 'click', markerClick));
        m_MapEventListeners.push(google.maps.event.addListener(m_CoordinateMarker, 'dragend', markerClick));
        m_MapEventListeners.push(google.maps.event.addListener(m_CoordinateMarker, 'dblclick', save));

        markerPositionChanged();
        m_InfoWindow.open(m_Map, m_CoordinateMarker);
    };

    function loadMarkersAndPositionCoordinateMarkerSensibly(markers) {
        if (markers.length > 0) {
            for (var i in markers) {
                var marker = MapMarkerService.CreateMapMarker(markers[i]);
                marker.setMap(m_Map);
                m_EntityMarkers.push(marker);
            }
            setMarkerToAverageEntityMarkerPosition();
            fitMarkerBounds();
        }
    }

    function loadMarkers(markers) {
        if (markers.length > 0) {
            for (var i in markers) {
                var marker = MapMarkerService.CreateMapMarker(markers[i]);
                marker.setMap(m_Map);
                m_EntityMarkers.push(marker);
            }
            fitMarkerBounds();
        }
    }

    function fitMarkerBounds() {
        var bounds = new google.maps.LatLngBounds();
        bounds.extend(m_CoordinateMarker.getPosition());
        for (var i in m_EntityMarkers) {
            bounds.extend(m_EntityMarkers[i].getPosition());
        }
        m_Map.fitBounds(bounds);
    }

    function setMarkerToAverageEntityMarkerPosition() {
        var bounds = new google.maps.LatLngBounds();
        for (var i in m_EntityMarkers) {
            bounds.extend(m_EntityMarkers[i].getPosition());
        }
        m_CoordinateMarker.setPosition(bounds.getCenter());
    }

    function disposeMap() {
        while (m_EntityMarkers.length > 0) {
            var marker = m_EntityMarkers.pop();
            marker.setMap(null);
        }
        while (m_MapEventListeners.length > 0) {
            google.maps.event.removeListener(m_MapEventListeners.pop());
        }
    };

    function mapZoomChanged() {
        m_Zoom = m_Map.getZoom()
    };

    function markerPositionChanged() {
        m_Latitude = m_CoordinateMarker.getPosition().lat().toFixed(5);
        m_Longitude = m_CoordinateMarker.getPosition().lng().toFixed(5);
        m_InfoWindow.close();
        dom.find('.coordinates').text(
            '( '
            + m_CoordinateMarker.getPosition().lat().toFixed(5)
            + ', '
            + m_CoordinateMarker.getPosition().lng().toFixed(5)
            + ' )');
    };

    function markerClick(event) {
        var newCenter = event.latLng;
        m_CoordinateMarker.setPosition(newCenter);
        m_Map.panTo(newCenter);
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
        GeocoderService.Lookup({ address: address, location: m_CoordinateMarker.getPosition() }, handleAddressSearchResult);
    };

    function handleAddressSearchResult(result) {
        if (result.found) {
            m_CoordinateMarker.setPosition(result.location);
            fitMarkerBounds();
            dom.find('.address-search input').val(result.address);
        } else {
            dom.find('.address-search input').val('...Sorry, I can\'t find the address you entered.');
        }
    };
};

var GeocoderService = new function () {
    var public = this;
    var geocoder;

    var initialize = function () {
        geocoder = new google.maps.Geocoder();
    }
    google.setOnLoadCallback(initialize);

    public.Lookup = function (options, callback) {
        function handleGeocoderResult(geocoderResults, geocoderStatus) {
            var result = {};
            if (geocoderStatus == google.maps.GeocoderStatus.OK) {
                result.found = true;
                var bestGeocoderResult = geocoderResults[0];
                result.location = bestGeocoderResult.geometry.location;
                result.viewport = bestGeocoderResult.geometry.viewport;
                result.address = bestGeocoderResult.formatted_address;
                for (var addressComponent in bestGeocoderResult.address_components) {
                    var addressComponentShortName = bestGeocoderResult.address_components[addressComponent].short_name;
                    for (var type in bestGeocoderResult.address_components[addressComponent].types) {
                        var addressComponentType = bestGeocoderResult.address_components[addressComponent].types[type];
                        switch (addressComponentType) {
                            case "street_number":
                                result.number = addressComponentShortName;
                                break;
                            case "route":
                                result.street = addressComponentShortName;
                                break;
                            case "administrative_area_level_3":
                                result.city = addressComponentShortName;
                                break;
                            case "postal_code":
                                result.zip = addressComponentShortName;
                                break;
                            case "administrative_area_level_2":
                                result.county = addressComponentShortName;
                                break;
                            case "administrative_area_level_1":
                                result.state = addressComponentShortName;
                                break;
                            case "country":
                                result.country = addressComponentShortName;
                                break;
                        }
                    }
                }
            } else {
                result.found = false;
            }
            callback(result);
        }

        var geocoderRequest = {};

        // build request location
        if (options.location != null) {
            geocoderRequest.location = options.location;
        }

        if (!IsNullOrEmpty(options.address)) {
            geocoderRequest.address = options.address;
        } else {
            // build request address
            var address = '';
            if (!IsNullOrEmpty(options.county)) {
                address += options.county;
                address += ' County';
            }
            if (!IsNullOrEmpty(options.state)) {
                if (address.length > 0) {
                    address += ', ';
                }
                address += options.state;
            }
            if (!IsNullOrEmpty(options.country)) {
                if (address.length > 0) {
                    address += ', ';
                }
                address += options.country;
            }
            if (!IsNullOrEmpty(address)) {
                geocoderRequest.address = address;
            }
        }

        geocoder.geocode(geocoderRequest, handleGeocoderResult);
    }
};
