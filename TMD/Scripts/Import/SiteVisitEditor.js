﻿var SiteVisitEditor = new function () {
    var public = this;
    var isSaved, isAdding, isValidating, isSubsiteAddingDisabled, areSiteVisitsValidated;
    var closeCallback;
    var step;

    var dom = $(
"<div>\
    <div class='import-sitevisit-step1'></div>\
    <div class='import-sitevisit-step2'></div>\
</div>");
    $(document).ready(function () {
        dom.dialog({ modal: true, resizable: false, autoOpen: false, closeOnEscape: false,
            width: 410, position: 'center'
        });
        dom.bind('dialogclose', dispose);
    });

    function initialize() {
        step = 1;
        areSiteVisitsValidated = false;
        if (isSubsiteAddingDisabled) {
            dom.dialog('option', 'buttons', { 'Save': save, 'Cancel': function () { dom.dialog('close'); } });
        } else {
            dom.dialog('option', 'buttons', { 'Next >': advanceToStep2, 'Cancel': function () { dom.dialog('close'); } });
        }
        dom.dialog('option', 'title', isAdding ? 'Adding site visit' : 'Editing site visit');
    }

    function advanceToStep2() {
        $.put('SiteVisit', dom.find('form').serialize(), function (data) {
            render(data);
            if (validateCurrentStep()) {
                step = 2;
                dom.dialog('option', {
                    buttons: { 'Save': save, 'Cancel': function () { dom.dialog('close'); }, '< Back': retreatToStep1 }
                });
                render(data);
            }
        });
    }

    function retreatToStep1() {
        $.put('SiteVisit', dom.find('form').serialize(), function (data) {
            step = 1;
            dom.dialog('option', {
                buttons: { 'Next >': advanceToStep2, 'Cancel': function () { dom.dialog('close'); } }
            });
            render(data);
        });
    }

    function render(data) {
        var newDom = $(data);
        dom.find('.import-sitevisit-step1').replaceWith(newDom.find('.import-sitevisit-step1'));
        dom.find('.import-sitevisit-step2').replaceWith(newDom.find('.import-sitevisit-step2'));
        if (step == 1) {
            dom.find('.import-sitevisit-step1').show();
            dom.find('.import-sitevisit-step2').hide();
            dom.find('.coordinatepicker').button({ icons: { primary: 'ui-icon-circle-zoomout'} });
            dom.find('.entercoordinates input')
                .bind('change', (function () {
                    if (dom.find('.entercoordinates input').attr('checked')) {
                        dom.find('.entercoordinates-visible').show();
                        dom.find('.entercoordinates-visible input').first().focus();
                    } else {
                        dom.find('.entercoordinates-visible').hide();
                    }
                }))
                .trigger('change')
                .button();
        } else {
            dom.find('.import-sitevisit-step1').hide();
            dom.find('.import-sitevisit-step2').show();
            dom.find('.import-button-add-subsitevisit').button();
            dom.find('.import-button-edit').button({ icons: { primary: 'ui-icon-pencil'} });
            dom.find('.import-button-remove').button({ icons: { primary: 'ui-icon-trash'} });
            if (!areSiteVisitsValidated) {
                dom.find('.import-sitevisit-step2 .field-validation-error').remove();
            }
        }
    }

    function dispose() {
        dom.find('.import-sitevisit-step1').empty();
        dom.find('.import-sitevisit-step2').empty();
        if (isAdding && !isSaved) {
            $.delete_('SiteVisit');
        }
        closeCallback(isSaved);
    }

    function validateCurrentStep() {
        isValidating = true;
        var isValid = true;
        if (step == 1) {
            if (dom.find('.import-sitevisit-step1 .field-validation-error').length > 0) {
                dom.find('.import-sitevisit-step1 .input-validation-error').first().focus();
                isValid = false;
            }
        } else {
            if (dom.find('.import-sitevisit-step2 .field-validation-error').length > 0) {
                isValid = false;
            }
        }
        isValidating = false;
        return isValid;
    }

    function save() {
        $.put('SiteVisit', dom.find('form').serialize(), function (data) {
            areSiteVisitsValidated = true;
            render(data);
            if (validateCurrentStep()) {
                isSaved = true;
                dom.dialog('close');
            }
        });
    }

    public.GetCoordinates = function () {
        var coordinates = ValueObjectService.CreateCoordinates(
            dom.find('.latitude input').val(),
            dom.find('.longitude input').val());
        return coordinates;
    };

    public.Refresh = function (refresh) {
        if (refresh) {
            $.put('SiteVisit', dom.find('form').serialize(), function (data) {
                render(data);
                validateCurrentStep();
            });
        }
    };

    public.Add = function (callback) {
        isAdding = true;
        isSaved = false;
        closeCallback = callback;
        isSubsiteAddingDisabled = false;
        initialize();
        $.post('CreateSiteVisit', {}, function (data) {
            render(data);
            dom.dialog('open');
            dom.find('input').first().focus();
        });
    };

    public.Edit = function (index, options) {
        isAdding = false;
        isSaved = false;
        closeCallback = options.onClose;
        isSubsiteAddingDisabled = options.disableSubsiteVisitAdding;
        initialize();
        $.get('SiteVisit', { siteVisitIndex: index }, function (data) {
            render(data);
            dom.dialog('open');
            dom.find('input').first().focus();
        });
    };

    public.Show = function () {
        dom.bind('dialogclose', dispose);
        dom.dialog('open');
    };

    public.Hide = function () {
        dom.unbind('dialogclose');
        dom.dialog('close');
    };

    public.OpenCoordinatePicker = function (tripHasEnteredCoordinates) {
        function coordinatePickerClosed(result) {
            if (result.coordinatesPicked) {
                if (coordinates.IsSpecified) {
                    var newCoordinates = ValueObjectService.CreateCoordinatesWithFormat(result.latitude, result.longitude, coordinates.InputFormat);
                    dom.find('.latitude input').val(newCoordinates.Latitude);
                    dom.find('.longitude input').val(newCoordinates.Longitude);
                } else {
                    dom.find('.latitude input').val(result.latitude);
                    dom.find('.longitude input').val(result.longitude);
                }
            }
            public.Show();
        };
        function loadMapMarkers(callback) {
            $.get('MapMarkersIgnoringSelectedSiteVisit', {}, callback);
        };
        public.Hide();
        var coordinates = ValueObjectService.CreateCoordinates(
            dom.find('.latitude input').val(),
            dom.find('.longitude input').val());
        var options = { markerLoader: loadMapMarkers, hasMarkersToLoad: tripHasEnteredCoordinates };
        if (coordinates.IsSpecified) {
            options.coordinatesSpecified = true;
            options.latitude = coordinates.LatitudeDegrees;
            options.longitude = coordinates.LongitudeDegrees;
        }
        CoordinatePicker.Open(options, coordinatePickerClosed);
    };
};

var SiteVisitRemover = new function () {
    var isSaved;
    var closeCallback;

    var dom = $(
"<div title='Removing site visit'>\
    <div class='import-sitevisit'>\
    </div>\
</div>");
    $(document).ready(function () {
        dom.dialog({ modal: true, resizable: false, autoOpen: false, closeOnEscape: false, 
            position: 'center', width: 320,
            buttons: { 'Remove': remove, 'Cancel': function () { dom.dialog('close'); } },
            close: dispose
        });
    });

    function dispose() {
        closeCallback(isSaved);
    }

    function render(data) {
        dom.find('.import-sitevisit').replaceWith($(data));
    }

    function remove() {
        $.delete_('SiteVisit', {}, function (data) {
            isSaved = true;
            dom.dialog('close');
        });
    }

    this.Open = function (index, callback) {
        isSaved = false;
        closeCallback = callback;
        $.get('RemoveSiteVisit', { siteVisitIndex: index }, function (data) {
            render(data);
            dom.dialog('open');
        });
    };
};
