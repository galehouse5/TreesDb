var SubsiteVisitEditor = new function () {
    var states = { uninitialized: 0x00, add: 0x01, edit: 0x02, remove: 0x04, pickingCoordinate: 0x08, save: 0x10, coordinatePicked: 0x20, independent: 0x40 };
    var state = states.uninitialized;
    var dom = $(
        "<div id='subsite-visit-editor' class='dialog'>\
            <div class='subsitevisit-placeholder'></div>\
        </div>");

    this.Add = function () {
        initializeDialog();
        state = states.add;
        $.post('CreateSubsiteVisit', {}, function (data) {
            renderContent(data);
            dom.dialog({ title: 'Add subsite visit' });
            dom.dialog('open');
            if (IsFloatParsable(dom.find('.subsitevisit-latitude').val())
                && IsFloatParsable(dom.find('.subsitevisit-longitude').val())) {
                var latitude = parseFloat(dom.find('.subsitevisit-latitude').val());
                var longitude = parseFloat(dom.find('.subsitevisit-longitude').val());
                handleStateAndCountySearchAction(latitude, longitude);
            }
        });
    };

    var geocoder;
    var handleStateAndCountySearchAction = function (latitude, longitude) {
        if (geocoder == null) {
            geocoder = new google.maps.Geocoder();
        }
        var geocoderRequest = {
            location: new google.maps.LatLng(latitude, longitude)
        }
        geocoder.geocode(geocoderRequest, handleGeocoderResultsReceivedAction);
    };

    var handleGeocoderResultsReceivedAction = function (geocoderResults, geocoderStatus) {
        if (geocoderStatus == google.maps.GeocoderStatus.OK) {
            var bestGeocoderResult = geocoderResults[0];
            for (var addressComponent in bestGeocoderResult.address_components) {
                var addressComponentType = bestGeocoderResult.address_components[addressComponent].types[0];
                var addressComponentShortName = bestGeocoderResult.address_components[addressComponent].short_name;
                // county
                if (addressComponentType == "administrative_area_level_2") {
                    dom.find('.subsitevisit-county').val(addressComponentShortName)
                }
                // state
                else if (addressComponentType == "administrative_area_level_1") {
                    dom.find('.subsitevisit-state').val(addressComponentShortName)
                }
            };
        }
    };

    var initializeDialog = function () {
        if (state == states.uninitialized) {
            dom.dialog({ modal: true, resizable: false, autoOpen: false, show: 'drop', hide: 'drop', closeOnEscape: false });
            dom.bind('dialogclose', handleCloseAction);
            dom.bind('dialogopen', handleOpenAction);
        };
    };

    var handleOpenAction = function () {
        // wait for effect to finish
        setTimeout(function () {
            if ((state & states.coordinatePicked) == states.coordinatePicked) {
                dom.find('.subsitevisit-longitude').focus();
            } else {
                dom.find('input[type=text], textarea').first().focus();
            }
        }, 400);
    };

    var handleCloseAction = function () {
        if ((state & states.add) == states.add
            && (state & states.pickingCoordinate) != states.pickingCoordinate
            && (state & states.save) != states.save) {
            $.delete_('SubsiteVisit');
        }
    };

    var renderContent = function (data) {
        dom.find('.subsitevisit-placeholder').replaceWith($(data));
        dom.dialog({ width: 640, height: 'auto', minHeight: 480,
            buttons: {
                'Save': handleSaveAction,
                'Cancel': function () { dom.dialog('close') }
            }
        });
        dom.find('.coordinates-entered-selector input').attr('checked') ?
            dom.find('.coordinates-entered-visible').show()
            : dom.find('.coordinates-entered-visible').hide();
        dom.find('.coordinates-entered-selector input').change(function () {
            dom.find('.coordinates-entered-selector input').attr('checked') ?
                dom.find('.coordinates-entered-visible').show()
                : dom.find('.coordinates-entered-visible').hide();
        });
    };

    var handleSaveAction = function () {
        $.put('SubsiteVisit', dom.find('form').serialize(), function (data) {
            renderContent(data);
            if (dom.find('.field-validation-error').length == 0) {
                if ((state & states.independent) == states.independent) {
                    SiteVisitsEditor.Refresh();
                } else {
                    SiteVisitEditor.Refresh();
                }
                state |= states.save;
                dom.dialog('close');
            } else {
                dom.find('select.input-validation-error, input[type=text].input-validation-error, textarea.input-validation-error').first().focus();
            }
        });
    };

    this.Edit = function (index) {
        initializeDialog();
        state = states.edit;
        $.get('SubsiteVisit', { subsiteVisitIndex: index }, function (data) {
            renderContent(data);
            dom.dialog({ title: 'Edit subsite visit' });
            dom.dialog('open');
        });
    };

    this.EditIndependent = function (siteVisitIndex, index) {
        initializeDialog();
        state = states.edit | states.independent;
        $.get('SubsiteVisitIndependent', { siteVisitIndex: siteVisitIndex, subsiteVisitIndex: index }, function (data) {
            renderContent(data);
            dom.dialog({ title: 'Edit subsite visit' });
            dom.dialog('open');
        });
    }

    this.Remove = function (index) {
        initializeDialog();
        state = states.remove;
        $.get('RemoveSubsiteVisit', { subsiteVisitIndex: index }, function (data) {
            renderRemove(data);
            dom.dialog('open');
        });
    };

    this.RemoveIndependent = function (siteVisitIndex, index) {
        initializeDialog();
        state = states.remove | states.independent;
        $.get('RemoveSubsiteVisitIndependent', { siteVisitIndex: siteVisitIndex, subsiteVisitIndex: index }, function (data) {
            renderRemove(data);
            dom.dialog('open');
        });
    };

    var renderRemove = function (data) {
        dom.find('.subsitevisit-placeholder').replaceWith($(data));
        dom.dialog({ width: 480, height: 160, title: 'Remove subsite visit',
            buttons: {
                'Remove': handleRemoveAction,
                'Cancel': function () { dom.dialog('close') }
            }
        });
    };

    var handleRemoveAction = function () {
        $.delete_('SubsiteVisit', {}, function (data) {
            if ((state & states.independent) == states.independent) {
                SiteVisitsEditor.Refresh();
            } else {
                SiteVisitEditor.Refresh();
            }
            dom.dialog('close');
        });
    };

    this.OpenCoordinatePicker = function () {
        if ((state & states.independent) != states.independent) {
            SiteVisitEditor.CloseForSubsiteVisitCoordinatePicker();
        }
        state &= ~states.coordinatePicked;
        state |= states.pickingCoordinate;
        CoordinatePicker.Open(handlecoordinatePickedAction, {
            latitude: dom.find('.subsitevisit-latitude').val(),
            longitude: dom.find('.subsitevisit-longitude').val(),
            state: dom.find('.subsitevisit-state').val(),
            county: dom.find('.subsitevisit-county').val()
        });
        dom.dialog('close');
    };

    var handlecoordinatePickedAction = function (coordinatePickerResult) {
        if ((state & states.independent) != states.independent) {
            SiteVisitEditor.OpenForSubsiteVisitCoordinatePickedAction();
        }
        if (coordinatePickerResult.CoordinatePicked) {
            state |= states.coordinatePicked;
            dom.find('.subsitevisit-latitude').val(coordinatePickerResult.Latitude);
            dom.find('.subsitevisit-longitude').val(coordinatePickerResult.Longitude);
        }
        state &= ~states.pickingCoordinate;
        dom.dialog('open');
    };
};