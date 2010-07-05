var SubsiteVisitEditor = new function () {
    var public = this;
    var dom = $(
        "<div id='subsitevisit-editor' class='dialog'>\
            <div class='subsitevisit-placeholder'></div>\
        </div>");
    var isSaved, isAdding;
    var closeCallback, showCallback, hideCallback;

    function initialize() {
        dom.dialog({ modal: true, resizable: false, autoOpen: false, closeOnEscape: false, width: 640, height: 'auto', minHeight: 560,
            buttons: { 'Save': save, 'Cancel': function () { dom.dialog('close'); } }
        });
        if (isAdding) {
            dom.dialog({ title: 'Add subsite visit' });
        } else {
            dom.dialog({ title: 'Edit subsite visit' });
        }
        dom.bind('dialogclose', dispose);
    }

    function dispose() {
        if (isAdding && !isSaved) {
            $.delete_('SubsiteVisit');
        }
        dom.unbind('dialogclose');
        closeCallback(isSaved);
    }

    function render(data) {
        dom.find('.subsitevisit-placeholder').replaceWith($(data));
        dom.find('.coordinates-entered-selector input').bind('change', (function () {
            dom.find('.coordinates-entered-selector input').attr('checked') ?
                    dom.find('.coordinates-entered-visible').show() :
                    dom.find('.coordinates-entered-visible').hide();
        }));
        dom.find('.coordinates-entered-selector input').trigger('change');
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
        initialize();
        $.post('CreateSubsiteVisit', {}, function (data) {
            dom.dialog('open');
            render(data);
            lookupStateAndCountyIfEmtpyAndCoordinatesSpecified();
            setTimeout(function () { dom.find('.subsitevisit-placeholder input').first().focus(); }, 1);
        });
    }

    public.Edit = function (index, options) {
        isAdding = false;
        isSaved = false;
        setOptions(options);
        initialize();
        $.get('SubsiteVisit', { subsiteVisitIndex: index }, function (data) {
            dom.dialog('open');
            render(data);
            lookupStateAndCountyIfEmtpyAndCoordinatesSpecified();
            setTimeout(function () { dom.find('.subsitevisit-placeholder input').first().focus(); }, 1);
        });
    }

    public.EditForSiteVisit = function (siteVisitIndex, subsiteVisitIndex, options) {
        isAdding = false;
        isSaved = false;
        setOptions(options);
        initialize();
        $.get('SubsiteVisitForSiteVisit', { siteVisitIndex: siteVisitIndex, subsiteVisitIndex: subsiteVisitIndex }, function (data) {
            dom.dialog('open');
            render(data);
            lookupStateAndCountyIfEmtpyAndCoordinatesSpecified();
            setTimeout(function () { dom.find('.subsitevisit-placeholder input').first().focus(); }, 1);
        });
    }

    function lookupStateAndCountyIfEmtpyAndCoordinatesSpecified() {
        if (IsNullOrEmpty(dom.find('.subsitevisit-state').val())
            && IsNullOrEmpty(dom.find('.subsitevisit-county').val())
            && !IsNullOrEmpty(dom.find('.subsitevisit-latitude').val())
            && !IsNullOrEmpty(dom.find('.subsitevisit-longitude').val())) {
            lookupStateAndCounty();
        }
    };

    function lookupStateAndCounty() {
        var location = new google.maps.LatLng(
                dom.find('.subsitevisit-latitude').val(),
                dom.find('.subsitevisit-longitude').val());
        GeocoderService.Lookup({ location: location }, function (result) {
            if (result.found) {
                if (!IsNullOrEmpty(result.state)) {
                    dom.find('.subsitevisit-state').val(result.state);
                }
                if (!IsNullOrEmpty(result.county)) {
                    dom.find('.subsitevisit-county').val(result.county);
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

    public.OpenCoordinatePicker = function () {
        function coordinatePickerClosed(result) {
            if (result.coordinatesPicked) {
                if (coordinates.IsSpecified) {
                    var newCoordinates = ValueObjectService.CreateCoordinatesWithFormat(result.latitude, result.longitude, coordinates.InputFormat);
                    dom.find('input.subsitevisit-latitude').val(newCoordinates.Latitude);
                    dom.find('input.subsitevisit-longitude').val(newCoordinates.Longitude);
                    lookupStateAndCounty();
                } else {
                    dom.find('input.subsitevisit-latitude').val(result.latitude);
                    dom.find('input.subsitevisit-longitude').val(result.longitude);
                }
            }
            public.Show();
        };
        function loadMapMarkers(callback) {
            $.get('MapMarkersIgnoringSelectedSubsiteVisit', {}, callback);
        };
        public.Hide();
        var coordinates = ValueObjectService.CreateCoordinates(
            dom.find('input.subsitevisit-latitude').val(),
            dom.find('input.subsitevisit-longitude').val());
        var options = { markerLoader: loadMapMarkers };
        if (coordinates.IsSpecified && coordinates.IsValid) {
            options.coordinatesSpecified = true;
            options.latitude = coordinates.LatitudeDegrees;
            options.longitude = coordinates.LongitudeDegrees;
        } else if (!IsNullOrEmpty(dom.find('select.subsitevisit-state').val())) {
            options.addressSpecified = true;
            options.state = dom.find('select.subsitevisit-state').val();
            options.county = dom.find('input.subsitevisit-county').val();
        }
        CoordinatePicker.Open(options, coordinatePickerClosed);
    };
};

var SubsiteVisitRemover = new function () {
    var dom = $(
        "<div id='subsitevisit-editor' class='dialog'>\
            <div class='subsitevisit-placeholder'></div>\
        </div>");
    var isSaved;
    var closeCallback;

    var initialize = function () {
        dom.dialog({ modal: true, resizable: false, autoOpen: false, closeOnEscape: false,
            width: 480, height: 160, title: 'Remove subsite visit',
            buttons: { 'Remove': remove, 'Cancel': function () { dom.dialog('close'); } }
        });
        dom.bind('dialogclose', dispose);
    }

    var dispose = function () {
        dom.unbind('dialogclose');
        closeCallback(isSaved);
    }

    var render = function (data) {
        dom.find('.subsitevisit-placeholder').replaceWith($(data));
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
        initialize();
        $.get('RemoveSubsiteVisit', { subsiteVisitIndex: index }, function (data) {
            dom.dialog('open');
            render(data);
        });
    }

    this.OpenForSiteVisit = function (siteVisitIndex, subsiteVisitIndex, options) {
        isSaved = false;
        closeCallback = options.onClose;
        initialize();
        $.get('RemoveSubsiteVisitForSiteVisit', { siteVisitIndex: siteVisitIndex, subsiteVisitIndex: subsiteVisitIndex }, function (data) {
            dom.dialog('open');
            render(data);
        });
    };
};
