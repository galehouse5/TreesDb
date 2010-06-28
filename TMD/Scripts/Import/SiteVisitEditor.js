var SiteVisitEditor = new function () {
    var states = { uninitialized: 0x00, add: 0x01, edit: 0x02, remove: 0x04, pickingCoordinate: 0x08, save: 0x10, coordinatePicked: 0x20, validated: 0x40 };
    var state = states.uninitialized;
    var dom = $(
        "<div id='site-visit-editor' class='dialog'>\
            <div class='sitevisit-placeholder'></div>\
        </div>");

    this.Add = function () {
        initializeDialog();
        state = states.add;
        $.post('CreateSiteVisit', {}, function (data) {
            renderStep1(data);
            dom.dialog({ title: 'Add site visit' });
            dom.dialog('open');
        });
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
                dom.find('.sitevisit-longitude').focus();
            } else {
                dom.find('input[type=text], textarea').first().focus();
            }
        }, 400);
    };

    var handleCloseAction = function () {
        if ((state & states.add) == states.add
            && (state & states.pickingCoordinate) != states.pickingCoordinate
            && (state & states.save) != states.save) {
            $.delete_('SiteVisit');
        } else if ((state & states.edit) == states.edit) {
            SiteVisitsEditor.Refresh();
        }
    };

    var renderStep1 = function (data) {
        dom.find('.sitevisit-placeholder').replaceWith($(data));
        dom.dialog({ width: 640, height: 'auto', minHeight: 480,
            buttons: {
                'Next >': handleNextAction,
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

    var handleNextAction = function () {
        $.put('SiteVisit', dom.find('form').serialize(), function (data) {
            renderStep1(data);
            if (dom.find('.field-validation-error').length == 0) {
                if ((state & states.validated) == states.validated) {
                    $.get('ValidateSiteVisit', {}, function (data) {
                        renderStep2(data);
                    });
                } else {
                    $.get('SiteVisitStep2', {}, function (data) {
                        renderStep2(data);
                    });
                }
            } else {
                dom.find('input[type=text].input-validation-error, textarea.input-validation-error').first().focus();
            }
        });
    };

    var renderStep2 = function (data) {
        dom.find('.sitevisit-placeholder').replaceWith($(data));
        dom.dialog({ width: 640, height: 'auto', minHeight: 480,
            buttons: {
                'Save': handleSaveAction,
                'Cancel': function () { dom.dialog('close') },
                '< Back': handleBackAction
            }
        });
    };

    var handleSaveAction = function () {
        $.get('ValidateSiteVisit', {}, function (data) {
            state |= states.validated;
            renderStep2(data);
            if (dom.find('.field-validation-error').length == 0) {
                SiteVisitsEditor.Refresh();
                state |= states.save;
                dom.dialog('close');
            } else {
                dom.find('input[type=text].input-validation-error, textarea.input-validation-error').first().focus();
            }
        });
    }

    var handleBackAction = function () {
        $.get('SiteVisitStep1', {}, function (data) {
            renderStep1(data);
            dom.find('input[type=text], textarea').first().focus();
        });
    }

    this.Edit = function (index) {
        initializeDialog();
        state = states.edit;
        $.get('SiteVisit', { siteVisitIndex: index }, function (data) {
            renderStep1(data);
            dom.dialog({ title: 'Edit site visit' });
            dom.dialog('open');
        });
    };

    this.Remove = function (index) {
        initializeDialog();
        state = states.remove;
        $.get('RemoveSiteVisit', { siteVisitIndex: index }, function (data) {
            renderRemove(data);
            dom.dialog('open');
        });
    };

    var renderRemove = function (data) {
        dom.find('.sitevisit-placeholder').replaceWith($(data));
        dom.dialog({ width: 480, height: 160, title: 'Remove site visit',
            buttons: {
                'Remove': handleRemoveAction,
                'Cancel': function () { dom.dialog('close') }
            }
        });
    };

    var handleRemoveAction = function () {
        $.delete_('SiteVisit', {}, function (data) {
            SiteVisitsEditor.Refresh();
            dom.dialog('close');
        });
    };

    this.OpenCoordinatePicker = function () {
        state &= ~states.coordinatePicked;
        state |= states.pickingCoordinate;
        CoordinatePicker.Open(handlecoordinatePickedAction, {
            latitude: dom.find('.sitevisit-latitude').val(),
            longitude: dom.find('.sitevisit-longitude').val()
        });
        dom.dialog('close');
    };

    var handlecoordinatePickedAction = function (coordinatePickerResult) {
        if (coordinatePickerResult.CoordinatePicked) {
            state |= states.coordinatePicked;
            dom.find('.sitevisit-latitude').val(coordinatePickerResult.Latitude);
            dom.find('.sitevisit-longitude').val(coordinatePickerResult.Longitude);
        }
        state &= ~states.pickingCoordinate;
        dom.dialog('open');
    };

    this.CloseForSubsiteVisitCoordinatePicker = function () {
        state |= states.pickingCoordinate;
        dom.dialog('close');
    }

    this.OpenForSubsiteVisitCoordinatePickedAction = function () {
        state &= ~states.pickingCoordinate;
        dom.dialog('open');
    };

    this.Refresh = function () {
        if ((state & states.validated) == states.validated) {
            $.get('ValidateSiteVisit', {}, function (data) {
                renderStep2(data);
            });
        } else {
            $.get('SiteVisitStep2', {}, function (data) {
                renderStep2(data);
            });
        }
    };
};