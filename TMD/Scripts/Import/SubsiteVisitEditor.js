var SubsiteVisitEditor = new function () {
    var public = this;
    var dom = $(
"<div>\
    <div class='ui-placeholder-import-subsitevisit' style='height: 500px;'></div>\
</div>");
    var isSaved, isAdding;
    var closeCallback, showCallback, hideCallback;

    function initialize() {
        dom.dialog({ modal: true, resizable: false, autoOpen: false, closeOnEscape: false, width: 410,
            buttons: { 'Save': save, 'Cancel': function () { dom.dialog('close'); } }
        });
        if (isAdding) {
            dom.dialog({ title: 'Adding subsite visit' });
        } else {
            dom.dialog({ title: 'Editing subsite visit' });
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
        dom.find('.ui-placeholder-import-subsitevisit').replaceWith($(data));
        dom.find('.coordinates-entered input').bind('change', (function () {
            dom.find('.coordinates-entered input').attr('checked') ?
                    dom.find('.coordinates-entered-visible').show() :
                    dom.find('.coordinates-entered-visible').hide();
        }));
        dom.find('.coordinates-entered input').trigger('change');
        dom.find('.coordinate-picker').button({ icons: { primary: 'ui-icon-circle-zoomout'} });
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
            dom.find('input').first().focus();
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
            dom.find('input').first().focus();
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
            dom.find('input').first().focus();
        });
    }

    function lookupStateAndCountyIfEmtpyAndCoordinatesSpecified() {
        if (IsNullOrEmpty(dom.find('.state select').val())
            && IsNullOrEmpty(dom.find('.county input').val())
            && !IsNullOrEmpty(dom.find('.latitude input').val())
            && !IsNullOrEmpty(dom.find('.longitude input').val())) {
            lookupStateAndCounty();
        }
    };

    function lookupStateAndCounty() {
        var location = new google.maps.LatLng(
                dom.find('.latitude input').val(),
                dom.find('.longitude input').val());
        GeocoderService.Lookup({ location: location }, function (result) {
            if (result.found) {
                if (!IsNullOrEmpty(result.state)) {
                    dom.find('.state select').val(result.state);
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

    public.OpenCoordinatePicker = function () {
        function coordinatePickerClosed(result) {
            if (result.coordinatesPicked) {
                if (coordinates.IsSpecified) {
                    var newCoordinates = ValueObjectService.CreateCoordinatesWithFormat(result.latitude, result.longitude, coordinates.InputFormat);
                    dom.find('.latitude input').val(newCoordinates.Latitude);
                    dom.find('.longitude input').val(newCoordinates.Longitude);
                    lookupStateAndCounty();
                } else {
                    dom.find('.latitude input').val(result.latitude);
                    dom.find('.longitude input').val(result.longitude);
                }
            }
            public.Show();
        };
        function loadMapMarkers(callback) {
            $.get('MapMarkersIgnoringSelectedSubsiteVisit', {}, callback);
        };
        public.Hide();
        var coordinates = ValueObjectService.CreateCoordinates(
            dom.find('.latitude input').val(),
            dom.find('.longitude input').val());
        var options = { markerLoader: loadMapMarkers };
        if (coordinates.IsSpecified && coordinates.IsValid) {
            options.coordinatesSpecified = true;
            options.latitude = coordinates.LatitudeDegrees;
            options.longitude = coordinates.LongitudeDegrees;
        } else if (!IsNullOrEmpty(dom.find('.state select').val())) {
            options.addressSpecified = true;
            options.state = dom.find('.state select').val();
            options.county = dom.find('.county input').val();
        }
        CoordinatePicker.Open(options, coordinatePickerClosed);
    };
};

var SubsiteVisitRemover = new function () {
    var dom = $(
"<div title='Removing subsite visit'>\
    <div class='ui-placeholder-import-subsitevisit' style='height: 200px'></div>\
</div>");
    var isSaved;
    var closeCallback;

    var initialize = function () {
        dom.dialog({ modal: true, resizable: false, autoOpen: false, closeOnEscape: false,
            width: 320,
            buttons: { 'Remove': remove, 'Cancel': function () { dom.dialog('close'); } }
        });
        dom.bind('dialogclose', dispose);
    }

    var dispose = function () {
        dom.unbind('dialogclose');
        closeCallback(isSaved);
    }

    var render = function (data) {
        dom.find('.ui-placeholder-import-subsitevisit').replaceWith($(data));
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
