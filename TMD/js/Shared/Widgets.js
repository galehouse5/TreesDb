(function ($) {
    $.fn.InitializeUi = function (options) {
        return this.each(function () {
            $(this).find('.RequiresJavascript')
                .not('.UiInitialized').addClass('UiInitialized').show();
            $(this).find('.LacksJavascript')
                .not('.UiInitialized').addClass('UiInitialized').hide();
            $(this).find("form.form select, form.form input:checkbox, form.form input:radio, form.form input:file")
                .not('.UiInitialized').addClass('UiInitialized').uniform();
            $(this).find("*[rel=facebox]")
                .not('.UiInitialized').addClass('UiInitialized').facebox();
            $(this).find("*[rel=tooltip]")
                .not('.UiInitialized').addClass('UiInitialized').tipsy({ gravity: 's' });
            $(this).find('input[type=text].DatePicker')
                .not('.UiInitialized').addClass('UiInitialized').datepicker({
                    showOn: 'button',
                    buttonImage: '/images/icons/Calendar.gif',
                    duration: 0
                });
        });
    }
})(jQuery);


(function ($) {
    $.fn.PhotoGallery = function (options) {
        var defaults = {};
        var options = $.extend(defaults, options);
        return this.each(function () {
            var $galleryContainer = $(this);
            $galleryContainer.find("*[rel=facebox]").not('.Initialized').addClass('Initialized').facebox();

            $galleryContainer.find('a.delete').bind('click', function () {
                var $deleteAnchor = $(this);
                $.ajax({ type: "POST", url: $deleteAnchor.attr('href'),
                    success: function (response) {
                        if (response.Success) {
                            $deleteAnchor.closest('li').remove();
                        }
                    }
                });
                return false;
            });

            $galleryContainer.find('a.add').each(function () {
                var $addAnchor = $(this);
                upclick({
                    element: $addAnchor[0],
                    action: $addAnchor.attr('href'),
                    dataname: 'imageData',
                    oncomplete: function (response) {
                        $galleryContainer.find('.LoadingPhoto').hide();
                        $galleryContainer.find('.ReadyToLoadPhoto').show();
                        var $galleryContent = $(response).find('.gallery');
                        $galleryContainer.replaceWith($galleryContent);
                        $galleryContent.addClass('Initialized').PhotoGallery();
                    },
                    onstart: function () {
                        $galleryContainer.find('.ReadyToLoadPhoto').hide();
                        $galleryContainer.find('.LoadingPhoto').show();
                    }
                });
                return false;
            });

        });
    };
})(jQuery);


(function ($) {
    $.fn.CoordinatePicker = function (options) {
        var defaults = { AddressCalculator: null };
        var options = $.extend(defaults, options);
        return this.each(function () {
            var $pickerContainer = $(this);
            $pickerContainer.find('button').show();
            var $coordinateContainer = $pickerContainer.find('input[type=text]');

            $pickerContainer.bind('PickCoordinates', function (event, mapLoader) {
                $.get(mapLoader, function (response) {
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

