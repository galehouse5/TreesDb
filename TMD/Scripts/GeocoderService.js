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
        geocoderRequest.region = 'US';

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
            if (!IsNullOrEmpty(address)) {
                geocoderRequest.address = address;
            }
        }

        geocoder.geocode(geocoderRequest, handleGeocoderResult);
    }
};
