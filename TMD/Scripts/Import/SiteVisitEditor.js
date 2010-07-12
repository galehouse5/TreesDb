var SiteVisitEditor = new function () {
    var public = this;
    var dom = $(
"<div>\
    <div class='ui-placeholder-import-sitevisit-step1' style='height: 400px;'></div>\
    <div class='ui-placeholder-import-sitevisit-step2'></div>\
</div>");
    var isSaved, isAdding, isValidating, isSubsiteAddingDisabled;
    var closeCallback;
    var step;

    function initialize() {
        step = 1;
        if (isSubsiteAddingDisabled) {
            dom.dialog({ modal: true, resizable: false, autoOpen: false, closeOnEscape: false, width: 410,
                buttons: {
                    'Save': save,
                    'Cancel': function () { dom.dialog('close'); }
                }
            });
        } else {
            dom.dialog({ modal: true, resizable: false, autoOpen: false, closeOnEscape: false, width: 410,
                buttons: {
                    'Next >': advanceToStep2,
                    'Cancel': function () { dom.dialog('close'); }
                }
            });
        }
        dom.dialog({ title: isAdding ? 'Adding site visit' : 'Editing site visit' });
        dom.bind('dialogclose', dispose);
    }

    function advanceToStep2() {
        $.put('SiteVisit', dom.find('form').serialize(), function (data) {
            render(data);
            if (validateCurrentStep()) {
                step = 2;
                dom.dialog('option', {
                    buttons: {
                        'Save': save,
                        'Cancel': function () { dom.dialog('close'); },
                        '< Back': retreatToStep1
                    }
                });
                render(data);
            }
        });
    }

    function retreatToStep1() {
        $.put('SiteVisit', dom.find('form').serialize(), function (data) {
            step = 1;
            dom.dialog('option', {
                buttons: {
                    'Next >': advanceToStep2,
                    'Cancel': function () { dom.dialog('close'); }
                }
            });
            render(data);
        });
    }

    function render(data) {
        var newDom = $(data);
        dom.find('.ui-placeholder-import-sitevisit-step1').replaceWith(newDom.find('.ui-placeholder-import-sitevisit-step1'));
        dom.find('.ui-placeholder-import-sitevisit-step2').replaceWith(newDom.find('.ui-placeholder-import-sitevisit-step2'));
        if (step == 1) {
            dom.find('.ui-placeholder-import-sitevisit-step1').css('display', 'block');
            dom.find('.ui-placeholder-import-sitevisit-step2').css('display', 'none');
            dom.find('.ui-placeholder-import-sitevisit').replaceWith(
                newDom.find('.step2'));
            dom.find('.coordinates-entered input').bind('change', (function () {
                dom.find('.coordinates-entered input').attr('checked') ?
                    dom.find('.coordinates-entered-visible').show() :
                    dom.find('.coordinates-entered-visible').hide();
            }));
            dom.find('.coordinates-entered input').trigger('change');
            dom.find('.coordinate-picker').button({ icons: { primary: 'ui-icon-circle-zoomout'} });
        } else {
            dom.find('.ui-placeholder-import-sitevisit-step1').css('display', 'none');
            dom.find('.ui-placeholder-import-sitevisit-step2').css('display', 'block');
            dom.find('.ui-button-import-add-subsitevisit').button();
            dom.find('.ui-button-import-edit').button({ icons: { primary: 'ui-icon-pencil'} });
            dom.find('.ui-button-import-remove').button({ icons: { primary: 'ui-icon-trash'} });
        }
    }

    function dispose() {
        if (isAdding && !isSaved) {
            $.delete_('SiteVisit');
        }
        dom.unbind('dialogclose');
        closeCallback(isSaved);
    }

    function validateCurrentStep() {
        isValidating = true;
        var currentStepDom = dom.find(step == 1 ? '.ui-placeholder-import-sitevisit-step1' : '.ui-placeholder-import-sitevisit-step2');
        if (currentStepDom.find('.field-validation-error').length > 0) {
            currentStepDom.find('.input-validation-error').first().focus();
            isValidating = false;
            return false;
        } else if (currentStepDom.find('.field-validation-error').length > 0) {
            isValidating = false;
            return false;
        }
        isValidating = false;
        return true;
    }

    function save() {
        $.put('SiteVisit', dom.find('form').serialize(), function (data) {
            render(data);
            if (validateCurrentStep()) {
                isSaved = true;
                dom.dialog('close');
            }
        });
    }

    public.GetCoordinates = function () {
        var coordinates = ValueObjectService.CreateCoordinates(
            dom.find('input .latitude').val(),
            dom.find('input .longitude').val());
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
            dom.dialog('open');
            render(data);
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
            dom.dialog('open');
            render(data);
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

    public.OpenCoordinatePicker = function () {
        function coordinatePickerClosed(result) {
            if (result.coordinatesPicked) {
                if (coordinates.IsSpecified) {
                    var newCoordinates = ValueObjectService.CreateCoordinatesWithFormat(result.latitude, result.longitude, coordinates.InputFormat);
                    dom.find('input .latitude').val(newCoordinates.Latitude);
                    dom.find('input .longitude').val(newCoordinates.Longitude);
                } else {
                    dom.find('input .latitude').val(result.latitude);
                    dom.find('input .longitude').val(result.longitude);
                }
            }
            public.Show();
        };
        function loadMapMarkers(callback) {
            $.get('MapMarkersIgnoringSelectedSiteVisit', {}, callback);
        };
        public.Hide();
        var coordinates = ValueObjectService.CreateCoordinates(
            dom.find('input .latitude').val(),
            dom.find('input .longitude').val());
        var options = { markerLoader: loadMapMarkers };
        if (coordinates.IsSpecified) {
            options.coordinatesSpecified = true;
            options.latitude = coordinates.LatitudeDegrees;
            options.longitude = coordinates.LongitudeDegrees;
        }
        CoordinatePicker.Open(options, coordinatePickerClosed);
    };
};

var SiteVisitRemover = new function () {
    var dom = $(
"<div title='Removing site visit'>\
    <div class='ui-placeholder-import-sitevisit' style='height: 200px'>\
    </div>\
</div>");
    var isSaved;
    var closeCallback;

    function initialize() {
        dom.dialog({ modal: true, resizable: false, autoOpen: false, closeOnEscape: false,
            width: 320,
            buttons: { 'Remove': remove, 'Cancel': function () { dom.dialog('close'); } }
        });
        dom.bind('dialogclose', dispose);
    }

    function dispose() {
        dom.unbind('dialogclose');
        closeCallback(isSaved);
    }

    function render(data) {
        dom.find('.ui-placeholder-import-sitevisit').replaceWith($(data));
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
        initialize();
        $.get('RemoveSiteVisit', { siteVisitIndex: index }, function (data) {
            dom.dialog('open');
            render(data);
        });
    };
};
