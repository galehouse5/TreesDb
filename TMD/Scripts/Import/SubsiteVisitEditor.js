var SubsiteVisitEditor = new function () {
    var public = this;
    var isSaved, isAdding;
    var closeCallback, showCallback, hideCallback;

    var dom = $(
"<div>\
    <div class='import-subsitevisit'></div>\
</div>");
    $(document).ready(function () {
        dom.dialog({ modal: true, resizable: false, autoOpen: false, closeOnEscape: false,
            width: 405, position: 'center',
            buttons: { 'Save': save, 'Cancel': function () { dom.dialog('close'); } }
        });
        dom.bind('dialogclose', dispose);
    });

    function dispose() {
        dom.find('.import-subsitevisit').empty();
        if (isAdding && !isSaved) {
            $.delete_('SubsiteVisit');
        }
        closeCallback(isSaved);
    }

    function render(data) {
        dom.find('.import-subsitevisit').replaceWith($(data));
        dom.find('.CoordinatePicker').button({ icons: { primary: 'ui-icon-circle-zoomout'} });
        dom.find('.EnterCoordinates input')
            .bind('change', (function () {
                if (dom.find('.EnterCoordinates input').attr('checked')) {
                    dom.find('.CoordinatesEntered').show();
                    dom.find('.CoordinatesEntered input').first().focus();
                } else {
                    dom.find('.CoordinatesEntered').hide();
                }
            }))
            .trigger('change')
            .button();
        dom.find('.country input')
            .autocomplete({ delay: 0, minLength: 2, source: LocationsService.FindAllCountries() })
            .change(function () {
                dom.find('.state input').autocomplete('option', { source: LocationsService.FindStatesByCountryCode($('.country input').val()) });
            });
        dom.find('.state input')
            .autocomplete({ delay: 0, minLength: 2, source: LocationsService.FindStatesByCountryCode($('.country input').val()) });
        dom.find('.EnterPublicAccess').buttonset();
    }

    function validate() {
        if (dom.find('.field-validation-error').length > 0) {
            dom.find('.input-validation-error').first().focus();
            return false;
        }
        return true;
    }

    function save() {
        $.put('SubsiteVisit', dom.find('form').serialize(), function (data) {
            render(data);
            if (validate()) {
                isSaved = true;
                dom.dialog('close');
            }
        });
    }

    function setOptions(options) {
        closeCallback = options.onClose;
        showCallback = options.onShow;
        hideCallback = options.onHide;
    }

    public.Add = function (options) {
        isAdding = true;
        isSaved = false;
        setOptions(options);
        dom.dialog('option', { title: 'Adding subsite visit' });
        $.post('CreateSubsiteVisit', {}, function (data) {
            render(data);
            dom.dialog('open');
            lookupLocationIfEmtpyAndCoordinatesSpecified();
            dom.find('input').first().focus();
        });
    }

    public.Edit = function (index, options) {
        isAdding = false;
        isSaved = false;
        setOptions(options);
        dom.dialog('option', { title: 'Editing subsite visit' });
        $.get('SubsiteVisit', { subsiteVisitIndex: index }, function (data) {
            render(data);
            dom.dialog('open');
            lookupLocationIfEmtpyAndCoordinatesSpecified();
            dom.find('input').first().focus();
        });
    }

    public.EditForSiteVisit = function (siteVisitIndex, subsiteVisitIndex, options) {
        isAdding = false;
        isSaved = false;
        setOptions(options);
        dom.dialog('option', { title: 'Editing subsite visit' });
        $.get('SubsiteVisitForSiteVisit', { siteVisitIndex: siteVisitIndex, subsiteVisitIndex: subsiteVisitIndex }, function (data) {
            render(data);
            dom.dialog('open');
            lookupLocationIfEmtpyAndCoordinatesSpecified();
            dom.find('input').first().focus();
        });
    }

    function lookupLocationIfEmtpyAndCoordinatesSpecified() {
        if (!IsNullOrEmpty(dom.find('.latitude input').val())
            && !IsNullOrEmpty(dom.find('.longitude input').val())) {
            if (IsNullOrEmpty(dom.find('.country input').val())
                || IsNullOrEmpty(dom.find('.state input').val())
                || IsNullOrEmpty(dom.find('.county input').val())) {
                lookupLocation();
            }
        }
    };

    function lookupLocation() {
        var location = new google.maps.LatLng(
            dom.find('.latitude input').attr('data-degrees'),
            dom.find('.longitude input').attr('data-degrees'));
        GeocoderService.Lookup({ location: location }, function (result) {
            if (result.found) {
                if (!IsNullOrEmpty(result.country)) {
                    dom.find('.country input')
                        .val(result.country)
                        .trigger('change');
                }
                if (!IsNullOrEmpty(result.state)) {
                    dom.find('.state input').val(result.state);
                }
                if (!IsNullOrEmpty(result.county)) {
                    dom.find('.county input').val(result.county);
                }
            }
        });
    };

    public.Show = function () {
        if (showCallback != null) {
            showCallback();
        }
        dom.bind('dialogclose', dispose);
        dom.dialog('open');
    };

    public.Hide = function () {
        dom.unbind('dialogclose');
        dom.dialog('close');
        if (hideCallback != null) {
            hideCallback();
        }
    };

    public.OpenCoordinatePicker = function (tripHasEnteredCoordinates) {
        function CoordinatePickerClosed(result) {
            if (result.coordinatesPicked) {
                if (coordinates.IsSpecified) {
                    var newCoordinates = ValueObjectService.CreateCoordinatesWithFormat(result.latitude, result.longitude, coordinates.InputFormat);
                    dom.find('.latitude input').val(newCoordinates.Latitude)
                        .attr('data-degrees', newCoordinates.LatitudeDegrees);
                    dom.find('.longitude input').val(newCoordinates.Longitude)
                        .attr('data-degrees', newCoordinates.LongitudeDegrees);
                } else {
                    dom.find('.latitude input').val(result.latitude)
                        .attr('data-degrees', result.latitude);
                    dom.find('.longitude input').val(result.longitude)
                        .attr('data-degrees', result.longitude);
                }
                lookupLocation();
            }
            public.Show();
        };
        function loadMapMarkers(callback) {
            $.get('MapMarkersIgnoringSelectedSubsiteVisit', {}, callback);
        };
        var coordinates = ValueObjectService.CreateCoordinates(
            dom.find('.latitude input').val(),
            dom.find('.longitude input').val());
        var options = { markerLoader: loadMapMarkers, hasMarkersToLoad: tripHasEnteredCoordinates };
        if (coordinates.IsSpecified && coordinates.IsValid) {
            options.coordinatesSpecified = true;
            options.latitude = coordinates.LatitudeDegrees;
            options.longitude = coordinates.LongitudeDegrees;
        } else if (!IsNullOrEmpty(dom.find('.state input').val())) {
            options.addressSpecified = true;
            options.state = dom.find('.state input').val();
            options.county = dom.find('.county input').val();
            options.country = dom.find('.country input').val();
        }
        CoordinatePicker.Open(options, CoordinatePickerClosed);
        public.Hide();
    };
};

var SubsiteVisitRemover = new function () {
    var isSaved;
    var closeCallback;

    var dom = $(
"<div title='Removing subsite visit'>\
    <div class='import-subsitevisit'></div>\
</div>");
    $(document).ready(function () {
        dom.dialog({ modal: true, resizable: false, autoOpen: false, closeOnEscape: false, 
            position: 'center', width: 320,
            buttons: { 'Remove': remove, 'Cancel': function () { dom.dialog('close'); } },
            close: dispose
        });
    });

    var dispose = function () {
        dom.unbind('dialogclose');
        closeCallback(isSaved);
    }

    var render = function (data) {
        dom.find('.import-subsitevisit').replaceWith($(data));
    }

    var remove = function () {
        $.delete_('SubsiteVisit', {}, function (data) {
            isSaved = true;
            dom.dialog('close');
        });
    }

    this.Open = function (index, options) {
        isSaved = false;
        closeCallback = options.onClose;
        $.get('RemoveSubsiteVisit', { subsiteVisitIndex: index }, function (data) {
            render(data);
            dom.dialog('open');
        });
    }

    this.OpenForSiteVisit = function (siteVisitIndex, subsiteVisitIndex, options) {
        isSaved = false;
        closeCallback = options.onClose;
        $.get('RemoveSubsiteVisitForSiteVisit', { siteVisitIndex: siteVisitIndex, subsiteVisitIndex: subsiteVisitIndex }, function (data) {
            render(data);
            dom.dialog('open');
        });
    };
};
